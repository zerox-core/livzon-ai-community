// build/patch-art-rename.cjs —— 板块卡「AIGC 创作」改名「美术资源」+ 版本号 r11→r12（幂等）
const fs = require('fs');
const path = require('path');

function patchFile(rel, pairs) {
  const fp = path.join(__dirname, '..', rel);
  let s = fs.readFileSync(fp, 'utf8');
  const crlf = s.includes('\r\n');
  if (crlf) s = s.replace(/\r\n/g, '\n');
  for (const p of pairs) {
    if (s.includes(p.mark)) { console.log('SKIP ' + rel + ' ' + p.mark); continue; }
    const n = s.split(p.old).length - 1;
    if (n !== 1) { console.error('FAIL ' + rel + ' ' + p.mark + ' 命中 ' + n + ' 次'); process.exit(1); }
    s = s.replace(p.old, p.rep);
    console.log('OK   ' + rel + ' ' + p.mark);
  }
  if (crlf) s = s.replace(/\n/g, '\r\n');
  fs.writeFileSync(fp, s);
}

patchFile('public/app.js', [
  {
    mark: '美术资源设计赛 · 秋季场',
    old: '{ t: "板块 · 03", n: "AIGC 创作", aid: "aigc-season-2026a", sp: "lotus", m: "AIGC 插画设计季 · 秋季场", d: "以「自然与科技」为题进行插画与视觉设计：文生图、局部重绘、风格化都行。月末评审展 + 作品上墙，全员投票选人气奖。" }',
    rep: '{ t: "板块 · 03", n: "美术资源", aid: "aigc-season-2026a", sp: "lotus", m: "美术资源设计赛 · 秋季场", d: "为社团设计真正用得上的美术资源：吉祥物、App 图标按钮、插画都能投稿。月末评审 + 作品上墙，全员投票选人气奖。" }',
  },
  {
    mark: '美术资源设计赛（秋季场）',
    old: '"aigc-season-2026a": "AIGC 插画设计季（秋季场）：以「自然与科技」为题，文生图 / 局部重绘 / 风格化均可，月末评审展 + 作品上墙，全员投票选人气奖。"',
    rep: '"aigc-season-2026a": "美术资源设计赛（秋季场）：吉祥物 / UI 美术资产 / 插画三赛道，为社团设计真正用得上的美术资源。月末评审 + 作品上墙，全员投票选人气奖。"',
  },
]);

patchFile('public/index.html', [
  { mark: '20260914r12', old: 'app.js?v=20260914r11', rep: 'app.js?v=20260914r12' },
]);
patchFile('public/work.html', [
  { mark: '20260914r12', old: 'app.js?v=20260914r11', rep: 'app.js?v=20260914r12' },
]);

console.log('== patch-art-rename 完成 ==');
