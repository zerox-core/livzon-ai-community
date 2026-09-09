// start.mjs — 启动脚本（Node 启动器，绕开 .bat 拦截）
// 用法：node start.mjs
//      node start.mjs --port 8888
//      node start.mjs --stop
//      node start.mjs --status
import { spawn } from 'node:child_process';
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
  stopServer();
} else if (args.includes('--status')) {
  showStatus();
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

function stopServer() {
  if (!existsSync(PID_FILE)) {
    console.log('[stop] 未找到 PID 文件，服务可能未启动');
    return;
  }
  const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10);
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`[stop] 已发送停止信号到 PID ${pid}`);
  } catch (e) {
    console.error('[stop] 停止失败:', e.message);
  }
  try { unlinkSync(PID_FILE); } catch {}
  setTimeout(() => {
    try { process.kill(pid, 0); console.log('[stop] 进程仍在运行'); }
    catch { console.log('[stop] 进程已停止'); }
  }, 1000);
}

function showStatus() {
  if (!existsSync(PID_FILE)) {
    console.log('服务未运行');
    return;
  }
  const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10);
  try {
    process.kill(pid, 0);
    console.log(`服务运行中，PID=${pid}`);
  } catch {
    console.log(`PID 文件存在但进程已退出（PID=${pid}）`);
  }
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
