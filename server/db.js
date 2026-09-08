// server/db.js
// PostgreSQL 连接池（唯一接触数据库的层）
// 依赖：dotenv 已由 server.js 加载，这里直接读 process.env

const { Pool } = require('pg');
const { writeFileSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

let pool = null;
let lastHeartbeat = 0;
const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_FILE = join(__dirname, '..', 'logs', 'pg-heartbeat');

// 节流心跳：每 10s 最多写一次 logs/pg-heartbeat，供 pg-keeper.mjs watch 做空闲回收
function touchHeartbeat() {
  const now = Date.now();
  if (now - lastHeartbeat < HEARTBEAT_INTERVAL_MS) return;
  lastHeartbeat = now;
  try {
    mkdirSync(dirname(HEARTBEAT_FILE), { recursive: true });
    writeFileSync(HEARTBEAT_FILE, String(now), 'utf-8');
  } catch (_) { /* 写心跳失败不致命，不要把 db 调用打挂 */ }
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pingce',
      max: 10,
      idleTimeoutMillis: 30000,
    });
    // PG 重启/断连会给空闲客户端派发 error 事件；无监听 = 未捕获异常直接杀死进程（2026-09-06 实测）
    pool.on('error', (e) => { console.warn('[db] idle client error:', e.code || e.message); });
  }
  return pool;
}

async function query(text, params) {
  const r = await getPool().query(text, params);
  touchHeartbeat();
  return r;
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { query, close, getPool };
