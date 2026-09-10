#!/usr/bin/env node
// pg-keeper.mjs — 本地 PostgreSQL 共享守门（handbook §9.3 重构）
// 用法：
//   node pg-keeper.mjs ensure         仅当 PG 不可用时启动一次；其他服务用 wait，不要各自弹卡
//   node pg-keeper.mjs status         查询 PG 是否就绪
//   node pg-keeper.mjs stop           显式停止（pg_ctl stop -m fast）
//   node pg-keeper.mjs wait           纯就绪轮询，--timeout N（默认 30s）
//   node pg-keeper.mjs watch          空闲回收：根据心跳文件，N 秒无活动自动停
//   node pg-keeper.mjs touch          仅写心跳（不查 PG），供 server/db.js 周期打点
//   node pg-keeper.mjs dump           数据快照 → sync/（db-*.sql；--uploads 连 public/uploads 一起）
//   node pg-keeper.mjs restore        从 sync/ 快照恢复本机库（--file 指定；--uploads 连文件一起）
//   node pg-keeper.mjs doctor         双设备体检：PG 探测 / .env / 连通性 / 回调地址核对
// 设计原则：
//   - 唯一会调用 pg_ctl start 的入口是 ensure；其他动作都不动 PG 进程
//   - PG 注册为 Windows 服务后（scripts/install-pg-service.mjs），ensure/stop 优先走服务启停，pg_ctl 兜底
//   - 心跳文件 logs/pg-heartbeat 由 db.js 的 query() 调 touch() 节流写入（默认 10s 一次）
//   - watch 模式下若心跳停止超过 PG_KEEPER_IDLE_STOP_SECS（默认 600s）则停 PG
//   - PG 安装路径自动探测：环境变量 PG_HOME → E:\PostgreSQL（便携机约定）→ C:\Program Files\PostgreSQL\*
//     （双设备免手工配环境变量；显式设置了 PG_HOME 则以它为最高优先）

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, readdirSync, statSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, 'logs');
const HEARTBEAT = join(LOG_DIR, 'pg-heartbeat');
const PG_LOG = join(LOG_DIR, 'pg.log');
const SYNC_DIR = join(__dirname, 'sync');
const ENV_FILE = join(__dirname, 'server', '.env');
const ENV_EXAMPLE = join(__dirname, 'server', 'env.example');
const UPLOADS_DIR = join(__dirname, 'public', 'uploads');
// PG 注册为 Windows 服务时的服务名（scripts/install-pg-service.mjs 固定使用同一名字）
const PG_SERVICE = process.env.PG_SERVICE || 'postgresql-x64-16';

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
let pgHomeCache; // 探测结果缓存（须在顶层 IIFE 之前声明，避免 TDZ）
let envCache;    // server/.env 解析缓存（同上）
const IDLE_STOP_SECS = parseInt(process.env.PG_KEEPER_IDLE_STOP_SECS || '600', 10);
const DUMP_KEEP = 5; // sync/ 里最多保留几份 db 快照（快照会随 git 走，控制体积）

const args = process.argv.slice(2);
const cmd = args[0] || 'status';

ensureDir(LOG_DIR);

(async () => {
  try {
    switch (cmd) {
      case 'ensure':  return await ensure();
      case 'status':  return status();
      case 'stop':    return stop();
      case 'wait':    return await wait(getOpt(args, '--timeout', 30));
      case 'touch':   return touch();
      case 'watch':   return await watch();
      case 'dump':    return await dump(args);
      case 'restore': return await restore(args);
      case 'doctor':  return await doctor();
      default:
        console.error('[pg-keeper] 未知命令: ' + cmd + '（可用: ensure/status/stop/wait/touch/watch/dump/restore/doctor）');
        process.exit(2);
    }
  } catch (e) {
    console.error('[pg-keeper] 错误:', e.message);
    process.exit(1);
  }
})();

function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }
function getOpt(argv, name, fallback) {
  const i = argv.indexOf(name);
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  return fallback;
}
function hasFlag(argv, name) { return argv.includes(name); }

// ---- server/.env 读取（仅 dump/restore/doctor 取 DB_* 等配置用；不回显敏感值） ----
function loadEnvFile() {
  if (envCache) return envCache;
  envCache = {};
  try {
    for (const line of readFileSync(ENV_FILE, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) envCache[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch (_) { /* .env 不存在时静默（doctor 会提示） */ }
  return envCache;
}
function envOf(key, fallback) {
  if (process.env[key] !== undefined && process.env[key] !== '') return process.env[key];
  const f = loadEnvFile()[key];
  return (f !== undefined && f !== '') ? f : fallback;
}

// ---- PG 安装路径自动探测（双设备免配置） ----
function detectPgHome() {
  if (pgHomeCache) return pgHomeCache;
  const candidates = [];
  if (process.env.PG_HOME) candidates.push(process.env.PG_HOME);
  const fromEnvFile = loadEnvFile().PG_HOME;
  if (fromEnvFile) candidates.push(fromEnvFile);
  candidates.push(process.env.PGDATA ? dirname(process.env.PGDATA) : '', 'E:\\PostgreSQL');
  try {
    const root = 'C:\\Program Files\\PostgreSQL';
    if (existsSync(root)) {
      readdirSync(root).filter(d => /^\d+(\.\d+)*$/.test(d)).sort((a, b) => parseFloat(b) - parseFloat(a))
        .forEach(d => candidates.push(join(root, d)));
    }
  } catch (_) {}
  for (const c of candidates) {
    if (c && existsSync(join(c, 'bin', 'pg_ctl.exe'))) { pgHomeCache = c; return c; }
  }
  return '';
}
function pgPaths() {
  const home = detectPgHome();
  const dataDir = process.env.PGDATA || loadEnvFile().PGDATA || (home ? join(home, 'data') : '');
  return {
    home,
    dataDir,
    ctl: home ? join(home, 'bin', 'pg_ctl.exe') : '',
    isready: home ? join(home, 'bin', 'pg_isready.exe') : '',
    dump: home ? join(home, 'bin', 'pg_dump.exe') : '',
    psql: home ? join(home, 'bin', 'psql.exe') : '',
  };
}

function isReady() {
  const { isready } = pgPaths();
  if (!isready) return false;
  const r = spawnSync(isready, ['-h', DB_HOST, '-p', String(DB_PORT), '-t', '3'], { encoding: 'utf-8' });
  return r.status === 0;
}

function serviceExists() {
  // 已注册 PG Windows 服务时返回 true（sc query 对未注册服务返回非 0）
  const r = spawnSync('sc', ['query', PG_SERVICE], { encoding: 'utf8' });
  return r.status === 0;
}

function startPg() {
  const { ctl, dataDir } = pgPaths();
  if (!ctl) {
    throw new Error('未找到 pg_ctl（已探测 环境变量PG_HOME / E:\\PostgreSQL / C:\\Program Files\\PostgreSQL\\*）。'
      + '请确认本机已装 PostgreSQL，或设置 PG_HOME / PGDATA 环境变量');
  }
  if (serviceExists()) {
    const svc = spawnSync('net', ['start', PG_SERVICE], { encoding: 'utf8' });
    if (svc.status === 0) return;
    console.log('[pg-keeper] net start ' + PG_SERVICE + ' 未成功（回落 pg_ctl）: '
      + ((svc.stderr || svc.stdout || '')).trim());
  }
  const r = spawnSync(ctl, ['start', '-D', dataDir, '-l', PG_LOG, '-w'], { encoding: 'utf-8' });
  if (r.status !== 0) {
    if (isReady()) return; // 已在运行（如服务实例刚好拉起 / 手工实例已存在）
    throw new Error('pg_ctl start 失败（退出码 ' + r.status + '）: ' + r.stdout + '\n' + r.stderr);
  }
}

function stopPg() {
  const { ctl, dataDir } = pgPaths();
  if (!ctl) return;
  if (serviceExists()) {
    const svc = spawnSync('net', ['stop', PG_SERVICE], { encoding: 'utf8' });
    if (svc.status === 0) return; // 服务方式停止成功；服务未在运行等情况继续走 pg_ctl 兜底
  }
  spawnSync(ctl, ['stop', '-D', dataDir, '-m', 'fast'], { encoding: 'utf-8' });
}

function touch() {
  writeFileSync(HEARTBEAT, String(Date.now()), 'utf-8');
}

async function wait(timeoutSec) {
  const deadline = Date.now() + timeoutSec * 1000;
  while (Date.now() < deadline) {
    if (isReady()) { touch(); return; }
    await sleep(500);
  }
  throw new Error('PG 在 ' + timeoutSec + 's 内未就绪（' + DB_HOST + ':' + DB_PORT + '）。请先执行: node pg-keeper.mjs ensure');
}

async function ensure() {
  if (isReady()) { touch(); console.log('[pg-keeper] 已就绪'); return; }
  console.log('[pg-keeper] 启动 PG...');
  startPg();
  await wait(30);
  console.log('[pg-keeper] PG 已就绪');
}

function status() {
  const { home } = pgPaths();
  const ready = isReady();
  console.log('ready=' + ready + '  endpoint=' + DB_HOST + ':' + DB_PORT + '  pg_home=' + (home || '(未探测到)'));
  process.exit(ready ? 0 : 1);
}

function stop() {
  stopPg();
  console.log('[pg-keeper] 已停止');
}

async function watch() {
  console.log('[pg-keeper] watch 启动：空闲 ' + IDLE_STOP_SECS + 's 后自动停');
  while (true) {
    await sleep(5_000);
    if (!existsSync(HEARTBEAT)) continue;
    const last = parseInt(readFileSync(HEARTBEAT, 'utf-8').trim(), 10) || 0;
    const idleMs = Date.now() - last;
    if (isReady() && idleMs > IDLE_STOP_SECS * 1000) {
      console.log('[pg-keeper] 心跳已 ' + Math.floor(idleMs / 1000) + 's 无活动，停 PG');
      stopPg();
    }
  }
}

// ---- dump：全库快照 → sync/db-<时间戳>.sql（--clean --if-exists 保证可重复恢复） ----
async function dump(argv) {
  const { dump: pgDump } = pgPaths();
  if (!pgDump) throw new Error('未探测到 pg_dump，请检查 PG 安装或设置 PG_HOME');
  const withUploads = hasFlag(argv, '--uploads');
  ensureDir(SYNC_DIR);
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14); // YYYYMMDDHHMMSS
  const file = join(SYNC_DIR, 'db-' + stamp + '.sql');
  const db = {
    host: envOf('DB_HOST', DB_HOST), port: String(envOf('DB_PORT', DB_PORT)),
    user: envOf('DB_USER', 'postgres'), password: envOf('DB_PASSWORD', ''), name: envOf('DB_NAME', 'pingce'),
  };
  console.log('[pg-keeper] 导出 ' + db.name + '@' + db.host + ':' + db.port + ' → ' + file);
  const r = spawnSync(pgDump, ['-h', db.host, '-p', db.port, '-U', db.user, '-d', db.name,
    '--clean', '--if-exists', '--no-owner', '--no-privileges', '-f', file], {
    encoding: 'utf-8',
    env: { ...process.env, PGPASSWORD: db.password },
  });
  if (r.status !== 0) {
    try { unlinkSync(file); } catch (_) {}
    throw new Error('pg_dump 失败: ' + (r.stderr || r.stdout || ('退出码 ' + r.status)));
  }
  const size = statSync(file).size;
  console.log('[pg-keeper] ✓ 库快照完成（' + (size / 1024).toFixed(1) + ' KB）');
  if (withUploads) {
    if (existsSync(UPLOADS_DIR)) {
      rmSync(join(SYNC_DIR, 'uploads'), { recursive: true, force: true });
      cpSync(UPLOADS_DIR, join(SYNC_DIR, 'uploads'), { recursive: true });
      console.log('[pg-keeper] ✓ 上传文件已随快照复制到 sync/uploads/');
    } else {
      console.log('[pg-keeper] （public/uploads 不存在，跳过文件部分）');
    }
  }
  writeFileSync(join(SYNC_DIR, 'latest.json'), JSON.stringify({
    db: 'db-' + stamp + '.sql', uploads: withUploads, created: new Date().toISOString(),
  }, null, 2));
  pruneDumps();
  console.log('[pg-keeper] 完成。提交 git 后另一台设备 git pull → node pg-keeper.mjs restore' + (withUploads ? ' --uploads' : '') + ' 即可同步');
}

function pruneDumps() {
  const dumps = readdirSync(SYNC_DIR).filter(f => /^db-\d{14}\.sql$/.test(f)).sort();
  for (const f of dumps.slice(0, Math.max(0, dumps.length - DUMP_KEEP))) {
    try { unlinkSync(join(SYNC_DIR, f)); console.log('[pg-keeper] 清理旧快照 ' + f); } catch (_) {}
  }
}

// ---- restore：从 sync/ 快照恢复本机库（默认取 latest.json；--file 指定；--uploads 连文件） ----
async function restore(argv) {
  const { psql } = pgPaths();
  if (!psql) throw new Error('未探测到 psql，请检查 PG 安装或设置 PG_HOME');
  let name = getOpt(argv, '--file', '');
  const withUploads = hasFlag(argv, '--uploads');
  if (!name) {
    try { name = JSON.parse(readFileSync(join(SYNC_DIR, 'latest.json'), 'utf-8')).db || ''; } catch (_) {}
  }
  if (!name) {
    const dumps = existsSync(SYNC_DIR) ? readdirSync(SYNC_DIR).filter(f => /^db-\d{14}\.sql$/.test(f)).sort() : [];
    name = dumps[dumps.length - 1] || '';
  }
  if (!name || !existsSync(join(SYNC_DIR, name))) throw new Error('未找到快照文件（sync/ 下无 db-*.sql，或 latest.json 指向缺失）。先在本机执行 dump 并随 git 同步');
  const file = join(SYNC_DIR, name);
  const db = {
    host: envOf('DB_HOST', DB_HOST), port: String(envOf('DB_PORT', DB_PORT)),
    user: envOf('DB_USER', 'postgres'), password: envOf('DB_PASSWORD', ''), name: envOf('DB_NAME', 'pingce'),
  };
  if (!isReady()) { console.log('[pg-keeper] PG 未就绪，先启动...'); await ensure(); }
  console.log('[pg-keeper] 恢复 ' + name + ' → ' + db.name + '@' + db.host + ':' + db.port);
  const r = spawnSync(psql, ['-h', db.host, '-p', db.port, '-U', db.user, '-d', db.name, '-v', 'ON_ERROR_STOP=1', '-f', file], {
    encoding: 'utf-8',
    env: { ...process.env, PGPASSWORD: db.password },
  });
  if (r.status !== 0) throw new Error('psql 恢复失败: ' + (r.stderr || r.stdout || '').slice(-800));
  console.log('[pg-keeper] ✓ 库恢复完成（快照会 DROP 后重建各表，旧会话已随之清空，请重新登录）');
  if (withUploads || existsSync(join(SYNC_DIR, 'uploads'))) {
    if (existsSync(join(SYNC_DIR, 'uploads'))) {
      cpSync(join(SYNC_DIR, 'uploads'), UPLOADS_DIR, { recursive: true, force: true });
      console.log('[pg-keeper] ✓ 上传文件已恢复到 public/uploads/');
    }
  }
  console.log('[pg-keeper] 建议接着执行: node server/sql/run_migrate.js（快照可能落后于远端最新表结构）');
}

// ---- doctor：双设备体检（只读，不打印任何密钥） ----
async function doctor() {
  const { home, ctl, dataDir } = pgPaths();
  const env = loadEnvFile();
  const line = (k, v) => console.log('  ' + k.padEnd(24) + ': ' + v);
  console.log('[pg-keeper] doctor —— 本机环境体检');
  line('PG 安装路径', home || '(未探测到！请安装 PostgreSQL 或设置 PG_HOME)');
  line('pg_ctl', ctl ? '✓ ' + ctl : '✗ 未找到');
  line('PGDATA', dataDir || '(未定)');
  line('PG 就绪', isReady() ? '✓ ' + DB_HOST + ':' + DB_PORT : '✗ 未就绪（node pg-keeper.mjs ensure）');
  line('server/.env', existsSync(ENV_FILE) ? '✓ 存在' : '✗ 不存在（将由 start.mjs 从 env.example 生成，需补飞书凭证）');
  line('DB 连接目标', envOf('DB_HOST', DB_HOST) + ':' + envOf('DB_PORT', DB_PORT) + ' 库=' + envOf('DB_NAME', 'pingce') + ' 用户=' + envOf('DB_USER', 'postgres'));
  line('DB 密码', env.DB_PASSWORD ? '✓ 已配置' : '✗ 未配置');
  line('飞书凭证', (env.LARK_APP_ID && env.LARK_APP_SECRET) ? '✓ 已配置' : '✗ 缺 LARK_APP_ID / LARK_APP_SECRET');
  const redirect = env.LARK_LOGIN_REDIRECT_URI || '(未配置，代码回退 http://127.0.0.1:8787/api/auth/callback)';
  line('登录回调地址', redirect);
  const ips = lanIps();
  line('本机局域网 IP', ips.length ? ips.join(', ') : '(未获取到)');
  if (/^http:\/\/(127\.0\.0\.1|localhost)/.test(redirect) && ips.length) {
    console.log('  ⚠ 回调指向 127.0.0.1：仅本机浏览器登录可用；其他设备登录将 ERR_CONNECTION_REFUSED。');
    console.log('    改为 http://' + ips[0] + ':8787/api/auth/callback（.env 的 LARK_LOGIN_REDIRECT_URI）并同步飞书白名单。');
  }
  if (ips.length && !redirect.includes(ips[0]) && !/127\.0\.0\.1|localhost/.test(redirect)) {
    console.log('  ⚠ 回调地址里的 IP 与本机当前局域网 IP 不一致（本机现在是 ' + ips[0] + '），若本机是对外服务主机请更新 .env 与飞书白名单。');
  }
  line('SITE_INTRANET_URL', env.SITE_INTRANET_URL || '(未配置，卡片按钮将回退相对路径)');
  line('快照目录 sync/', existsSync(SYNC_DIR) ? (readdirSync(SYNC_DIR).filter(f => f.endsWith('.sql')).length + ' 份快照, latest=' + latestName()) : '(空，先 dump)');
  console.log('[pg-keeper] 体检完成。');
}
function latestName() {
  try { return JSON.parse(readFileSync(join(SYNC_DIR, 'latest.json'), 'utf-8')).db || '—'; } catch (_) { return '—'; }
}
function lanIps() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const ni of list || []) {
      if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address);
    }
  }
  return out;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
