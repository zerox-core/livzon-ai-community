#!/usr/bin/env node
// install-pg-service.mjs —— 管理员一次性脚本：把 PostgreSQL 注册为 Windows 服务并配置崩溃自动重启。
//
// 用法（必须管理员权限）：
//   1. 开始菜单搜 cmd / Windows Terminal → 右键「以管理员身份运行」
//   2. 执行：  node F:\pingce\scripts\install-pg-service.mjs
//
// 做的事：
//   - 停掉 pg-keeper 拉起的手工实例（若在跑）
//   - 注册 Windows 服务 postgresql-x64-16（开机自启 -S auto）
//   - 日志仍写 F:\pingce\logs\pg-service.log（logging_collector），pg.log 继续保留手工实例历史
//   - sc failure：崩溃后 30s / 30s / 60s 自动重启服务，失败计数 1 天后重置
//   - 启动服务并做就绪验证
//   - 已注册过则先注销再重注册（幂等，可反复执行）
//
// 与现有守卫的关系：计划任务 PingcePgKeeper-Watch（每分钟 ensure）和 HKCU Run 键保留作后备——
// 服务自动重启失败时，守卫仍会在 1 分钟内用 pg_ctl 把 PG 拉起来（pg-keeper 已支持服务优先）。

import { spawnSync } from 'node:child_process';

const PG_CTL = 'E:\\PostgreSQL\\bin\\pg_ctl.exe';
const PG_ISREADY = 'E:\\PostgreSQL\\bin\\pg_isready.exe';
const DATA = 'E:\\PostgreSQL\\data';
const SVC = 'postgresql-x64-16';
const OPTS = '-c logging_collector=on -c log_directory=F:/pingce/logs -c log_filename=pg-service.log';

function run(cmd, args) {
  console.log('$ ' + cmd + ' ' + args.join(' '));
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  if (out) console.log('  ' + out.replace(/\r?\n/g, '\n  '));
  console.log('  exit=' + r.status);
  return r;
}

console.log('=== PG Windows 服务安装（' + SVC + '）===');

// 0) 提权检查
if (run('net', ['session']).status !== 0) {
  console.error('[install-pg-service] 未检测到管理员权限。');
  console.error('请用「以管理员身份运行」的终端再执行一次，然后重跑本脚本。');
  process.exit(1);
}

// 1) 停掉 pg-keeper 手工实例（若在跑；不在跑则无害报错）
run(PG_CTL, ['stop', '-D', DATA, '-m', 'fast']);

// 2) 已注册过则先注销（幂等）
if (run('sc', ['query', SVC]).status === 0) {
  run('net', ['stop', SVC]);
  run(PG_CTL, ['unregister', '-N', SVC]);
}

// 3) 注册服务：开机自启 + 日志进 F:\pingce\logs
const reg = run(PG_CTL, ['register', '-N', SVC, '-D', DATA, '-S', 'auto', '-o', OPTS]);
if (reg.status !== 0) {
  console.error('[install-pg-service] 注册失败，中止（常见原因：非管理员 / 数据目录被占用）。');
  process.exit(1);
}

// 4) 崩溃自动重启：30s / 30s / 60s；失败计数 86400s（1 天）后重置
//    注意 reset= 与 actions= 后的空格是 sc.exe 语法要求，勿删
run('sc', ['failure', SVC, 'reset=', '86400', 'actions=', 'restart/30000/restart/30000/restart/60000']);

// 5) 启动并验证
run('net', ['start', SVC]);
const ok = run(PG_ISREADY, ['-h', '127.0.0.1', '-p', '5432', '-t', '10']);
if (ok.status === 0) {
  console.log('[install-pg-service] ✓ 完成：PG 服务已就绪（127.0.0.1:5432），开机自启 + 崩溃自动重启已配置。');
  console.log('[install-pg-service] 守卫保留为后备：计划任务 PingcePgKeeper-Watch 每分钟 ensure。');
} else {
  console.error('[install-pg-service] ✗ PG 未就绪。请查看 F:\\pingce\\logs\\pg-service.log 或 Windows 事件查看器。');
  process.exit(1);
}
