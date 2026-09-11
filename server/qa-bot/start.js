// qa-bot 启动器：杀掉旧实例 → 后台拉起新实例
// 用法：node server/qa-bot/start.js
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
try {
  const ps = "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*qa-bot*index.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }";
  const out = execSync('powershell -NoProfile -Command "' + ps.replace(/"/g, '\\"') + '"', { encoding: 'utf-8' });
  const killed = out.trim().split(/\r?\n/).filter(Boolean);
  console.log('killed old: ' + (killed.length ? killed.join(',') : 'none'));
} catch (e) { console.log('kill err: ' + e.message); }
const logFh = fs.openSync(path.join(root, '..', 'logs', 'qa-bot-stdout.log'), 'a');
const child = spawn(process.execPath, [path.join(__dirname, 'index.js')], { detached: true, stdio: ['ignore', logFh, logFh], cwd: root });
child.unref();
console.log('QA_BOT_STARTED pid=' + child.pid);
