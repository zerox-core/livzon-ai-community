// start.mjs — 启动脚本（Node 启动器，绕开 .bat 拦截）
// 用法：node start.mjs
//      node start.mjs --port 8888
//      node start.mjs --stop
//      node start.mjs --status
import { spawn, execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync, openSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PID_FILE = join(__dirname, 'logs', 'server.pid');
const SERVER_ENTRY = join(__dirname, 'server', 'server.js');
const DEFAULT_PORT = 8787;
const ENV_FILE = join(__dirname, 'server', '.env');
const ENV_EXAMPLE = join(__dirname, 'server', 'env.example');

const args = process.argv.slice(2);

if (args.includes('--stop')) {
  stopServer(args);
} else if (args.includes('--status')) {
  showStatus(args);
} else {
  startServer(args);
}

function startServer(args) {
  let port = DEFAULT_PORT;
  const portIdx = args.indexOf('--port');
  if (portIdx >= 0 && args[portIdx + 1]) port = parseInt(args[portIdx + 1], 10);

  ensureDir(join(__dirname, 'logs'));
  ensureDir(join(__dirname, 'public', 'data'));
  ensureDir(join(__dirname, 'public', 'images'));

  if (!existsSync(join(__dirname, 'server', 'node_modules'))) {
    console.log('[start] 检测到 node_modules 缺失，开始安装依赖...');
    const npm = spawnNpm(['install', '--no-audit', '--no-fund', '--loglevel=error'], {
      cwd: join(__dirname, 'server'),
      stdio: 'inherit',
    });
    npm.on('exit', (code) => {
      if (code !== 0) {
        console.error('[start] npm install 失败，退出码', code);
        process.exit(1);
      }
      console.log('[start] 依赖安装完成');
      runPreLaunchChecks(port, () => launchServer(port));
    });
  } else {
    runPreLaunchChecks(port, () => launchServer(port));
  }
}

function launchServer(port) {
  // 写入 .env（如果不存在）
  if (!existsSync(ENV_FILE)) {
    if (existsSync(ENV_EXAMPLE)) {
      const text = readFileSync(ENV_EXAMPLE, 'utf-8')
        .replace(/^LARK_APP_ID=.*$/m, `LARK_APP_ID=${process.env.LARK_APP_ID || 'cli_xxxxxxxxxxxx'}`)
        .replace(/^LARK_APP_SECRET=.*$/m, `LARK_APP_SECRET=${process.env.LARK_APP_SECRET || 'your_app_secret'}`)
        .replace(/^LARK_BITABLE_APP_TOKEN=.*$/m, `LARK_BITABLE_APP_TOKEN=${process.env.LARK_BITABLE_APP_TOKEN || 'your_bitable_app_token'}`)
        .replace(/^LARK_BITABLE_TABLE_ID=.*$/m, `LARK_BITABLE_TABLE_ID=${process.env.LARK_BITABLE_TABLE_ID || 'your_table_id'}`)
        .replace(/^PORT=.*$/m, `PORT=${port}`);
      writeFileSync(ENV_FILE, text, 'utf-8');
      console.log('[start] 已生成 server/.env（请填入 LARK_APP_ID / LARK_APP_SECRET）');
    } else {
      console.warn('[start] 警告：未找到 env.example 模板，跳过 .env 生成');
    }
  } else {
    let envText = readFileSync(ENV_FILE, 'utf-8');
    envText = envText.replace(/^PORT=.*$/m, `PORT=${port}`);
    writeFileSync(ENV_FILE, envText, 'utf-8');
  }

  const out = openSync(join(__dirname, 'logs', 'server.log'), 'a');
  const err = openSync(join(__dirname, 'logs', 'server.err.log'), 'a');

  const child = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: join(__dirname, 'server'),
    detached: true,
    stdio: ['ignore', out, err],
    env: { ...process.env, PORT: String(port) },
  });

  child.unref();
  writeFileSync(PID_FILE, String(child.pid), 'utf-8');

  console.log(`[start] 已启动服务，PID=${child.pid}`);
  console.log(`[start] 等待 2 秒后做健康检查...`);

  setTimeout(() => {
    checkHealth(port, (ok, info) => {
      if (ok) {
        console.log('[start] ✓ 服务运行正常');
        console.log('=========================================');
        console.log(`  本机访问: http://127.0.0.1:${port}/`);
        if (info && info.ips) {
          for (const { name, ip } of info.ips) {
            console.log(`  ${name}: http://${ip}:${port}/`);
          }
        }
        console.log('  停止服务: node start.mjs --stop');
        console.log('=========================================');
      } else {
        console.error('[start] ✗ 健康检查失败，请检查 logs/server.err.log');
      }
    });
  }, 2000);
}

function parsePort(args) {
  const portIdx = args.indexOf('--port');
  if (portIdx >= 0 && args[portIdx + 1]) return parseInt(args[portIdx + 1], 10);
  return DEFAULT_PORT;
}

/* 找出正在监听指定端口的进程 PID（停止/状态以端口实况为准，不依赖可能过期的 PID 文件） */
function findPidsListeningOnPort(port) {
  const pids = new Set();
  try {
    if (process.platform === 'win32') {
      // netstat 状态列在中文 Windows 上仍是英文 LISTENING
      const out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
      for (const line of out.split('\n')) {
        const m = line.match(/\s(?:0\.0\.0\.0|\[::\]|127\.0\.0\.1):(\d+)\s+\S+\s+LISTENING\s+(\d+)/i);
        if (m && Number(m[1]) === port) pids.add(Number(m[2]));
      }
    } else {
      const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN || true`, { shell: true, encoding: 'utf8' });
      for (const l of out.split('\n')) {
        const n = parseInt(l.trim(), 10);
        if (n > 0) pids.add(n);
      }
    }
  } catch { /* 查询失败时按空处理，由调用方兜底 */ }
  pids.delete(process.pid);
  pids.delete(0);
  return [...pids];
}

function stopServer(args) {
  const port = parsePort(args);
  const pids = new Set();

  if (existsSync(PID_FILE)) {
    const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10);
    if (pid > 0) {
      try {
        process.kill(pid, 0);
        pids.add(pid);
      } catch {
        console.log(`[stop] PID 文件记录的 ${pid} 已不存在（过期记录），改按端口定位`);
      }
    }
    try { unlinkSync(PID_FILE); } catch {}
  }

  for (const p of findPidsListeningOnPort(port)) pids.add(p);

  if (!pids.size) {
    console.log('[stop] 未发现运行中的服务进程');
    return;
  }

  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`[stop] 已停止 PID ${pid}`);
    } catch (e) {
      console.error(`[stop] 停止 PID ${pid} 失败: ${e.message}（Windows 下可手动: taskkill /F /PID ${pid}）`);
    }
  }

  // 轮询确认端口真正释放，最多 5 秒——不做"看起来停了"的假报告
  const t0 = Date.now();
  (function verify() {
    checkPort(port, (status) => {
      if (status === 'free') {
        console.log(`[stop] ✓ 端口 ${port} 已释放`);
        return;
      }
      if (Date.now() - t0 < 5000) return setTimeout(verify, 500);
      console.error(`[stop] ✗ 端口 ${port} 仍被占用，请人工检查: netstat -ano | findstr :${port}`);
    });
  })();
}

function showStatus(args) {
  const port = parsePort(args);
  const listeners = findPidsListeningOnPort(port);
  if (listeners.length) {
    console.log(`服务运行中（端口 ${port} 监听 PID=${listeners.join(', ')}）`);
    return;
  }
  if (existsSync(PID_FILE)) {
    const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10);
    try {
      process.kill(pid, 0);
      console.log(`进程 PID=${pid} 存活但未监听端口 ${port}（可能正在启动）`);
      return;
    } catch {}
  }
  console.log('服务未运行');
}

function spawnNpm(args, opts) {
  // 优先用 node 自带的 npm-cli.js（不依赖 PATH/npm.cmd，跨环境更稳）
  const candidates = [
    join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(__dirname, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  for (const script of candidates) {
    if (existsSync(script)) {
      return spawn(process.execPath, [script, ...args], { ...opts, shell: false });
    }
  }
  // 兜底：依赖 npm.cmd（开发机 PATH 已配）
  console.warn('[start] 未找到内置 npm-cli.js，回退 npm.cmd（shell=true）');
  return spawn('npm.cmd', args, { ...opts, shell: true });
}

function runPreLaunchChecks(port, next) {
  checkPort(port, (status) => {
    if (status === 'same') {
      console.log(`[start] 端口 ${port} 已是本服务，复用即可`);
      return checkHealth(port, (ok, info) => {
        if (ok) console.log(`[start] ✓ 服务运行中（端口 ${port}）`);
        else console.error('[start] 端口被占但 /api/info 异常，请人工排查');
      });
    }
    if (status === 'foreign') {
      console.error(`[start] ✗ 端口 ${port} 被其他进程占用。请用 --port 指定新端口，或先停掉占用者。`);
      process.exit(1);
    }
    // status === 'free' -> 等 PG 就绪
    ensurePostgres(() => next());
  });
}

function checkPort(port, cb) {
  const req = http.get({ host: '127.0.0.1', port, path: '/api/info', timeout: 1500 }, (resp) => {
    let body = '';
    resp.on('data', (c) => body += c);
    resp.on('end', () => {
      try {
        const info = JSON.parse(body);
        // 与本服务 /api/info 响应一致：{ips: [...]} 即视为本服务
        if (info && Array.isArray(info.ips)) cb('same');
        else cb('foreign');
      } catch (_) { cb('foreign'); }
    });
  });
  req.on('error', (e) => {
    if (e.code === 'ECONNREFUSED') cb('free');
    else cb('foreign');
  });
}

function ensurePostgres(cb) {
  console.log('[start] 等待 PG 就绪（pg-keeper.mjs wait --timeout 30）...');
  const child = spawn(process.execPath, [join(__dirname, 'pg-keeper.mjs'), 'wait', '--timeout', '30'], { stdio: 'inherit' });
  child.on('exit', (code) => {
    if (code !== 0) {
      console.error('[start] ✗ PG 未就绪。请先执行: node pg-keeper.mjs ensure（只启动一次，其他服务只做等待）');
      process.exit(1);
    }
    cb();
  });
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function checkHealth(port, cb) {
  http.get(`http://127.0.0.1:${port}/api/info`, (resp) => {
    let body = '';
    resp.on('data', (c) => body += c);
    resp.on('end', () => {
      try {
        const info = JSON.parse(body);
        cb(true, info);
      } catch (e) {
        cb(false);
      }
    });
  }).on('error', () => cb(false));
}
