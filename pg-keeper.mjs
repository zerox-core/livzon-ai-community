#!/usr/bin/env node
// pg-keeper.mjs — 本地 PostgreSQL 共享守门（handbook §9.3 重构）
// 用法：
//   node pg-keeper.mjs ensure         仅当 PG 不可用时启动一次；其他服务用 wait，不要各自弹卡
//   node pg-keeper.mjs status         查询 PG 是否就绪
//   node pg-keeper.mjs stop           显式停止（pg_ctl stop -m fast）
//   node pg-keeper.mjs wait           纯就绪轮询，--timeout N（默认 30s）
//   node pg-keeper.mjs watch          空闲回收：根据心跳文件，N 秒无活动自动停
//   node pg-keeper.mjs touch          仅写心跳（不查 PG），供 server/db.js 周期打点
// 设计原则：
//   - 唯一会调用 pg_ctl start 的入口是 ensure；其他动作都不动 PG 进程
//   - 心跳文件 logs/pg-heartbeat 由 db.js 的 query() 调 touch() 节流写入（默认 10s 一次）
//   - watch 模式下若心跳停止超过 PG_KEEPER_IDLE_STOP_SECS（默认 600s）则停 PG

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, 'logs');
const HEARTBEAT = join(LOG_DIR, 'pg-heartbeat');
const PG_LOG = join(LOG_DIR, 'pg.log');

const PG_HOME = process.env.PG_HOME || 'E:\\PostgreSQL';
const PGDATA = process.env.PGDATA || 'E:\\PostgreSQL\\data';
const PG_CTL = join(PG_HOME, 'bin', 'pg_ctl.exe');
const PG_ISREADY = join(PG_HOME, 'bin', 'pg_isready.exe');
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const IDLE_STOP_SECS = parseInt(process.env.PG_KEEPER_IDLE_STOP_SECS || '600', 10);

const args = process.argv.slice(2);
const cmd = args[0] || 'status';

ensureDir(LOG_DIR);

(async () => {
  try {
    switch (cmd) {
      case 'ensure': return await ensure();
      case 'status': return status();
      case 'stop':   return stop();
      case 'wait':   return await wait(getOpt(args, '--timeout', 30));
      case 'touch':  return touch();
      case 'watch':  return await watch();
      default:
        console.error('[pg-keeper] 未知命令: ' + cmd);
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
  if (i >= 0 && argv[i + 1]) return parseInt(argv[i + 1], 10);
  return fallback;
}

function isReady() {
  if (!existsSync(PG_ISREADY)) return false;
  const r = spawnSync(PG_ISREADY, ['-h', DB_HOST, '-p', String(DB_PORT), '-t', '3'], { encoding: 'utf-8' });
  return r.status === 0;
}

function startPg() {
  if (!existsSync(PG_CTL)) {
    throw new Error('未找到 pg_ctl: ' + PG_CTL + '（请设置 PG_HOME / PGDATA 环境变量）');
  }
  const r = spawnSync(PG_CTL, ['start', '-D', PGDATA, '-l', PG_LOG, '-w'], { encoding: 'utf-8' });
  if (r.status !== 0) {
    throw new Error('pg_ctl start 失败（退出码 ' + r.status + '）: ' + r.stdout + '\n' + r.stderr);
  }
}

function stopPg() {
  if (!existsSync(PG_CTL)) return;
  spawnSync(PG_CTL, ['stop', '-D', PGDATA, '-m', 'fast'], { encoding: 'utf-8' });
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
  const ready = isReady();
  console.log('ready=' + ready + '  endpoint=' + DB_HOST + ':' + DB_PORT);
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

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
