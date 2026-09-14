/**
 * patch-work-layout.cjs — 作品详情页排版重构（W 系列补丁）
 *
 * 背景（用户 2026-09-14 反馈）：
 *  1) 「页面打不开」：mock 种子把 detail.team / detail.process 写成了字符串，
 *     墙内详情浮层 team.map / process.map 直接崩溃白屏 → W1 加类型守卫。
 *  2) 非网站类作品不显示「作品入口 / 链接待补充」→ W2/W3 无 link 时整块不渲染。
 *  3) 排版按活动/作品类型变化（showcase 网页 / linkcard 链接卡 / minimal 单图 / gallery 作品集）
 *     → W1 解析 layout，W4 按 layout 条件渲染各区块，作品集多图网格。
 *  4) 删掉「作者暂未提供可下载资源」占位 → W5 无资源时整个资源区不渲染。
 *  5) WorkPage 简介字段兼容 desc → W6。
 *  6) index.html / work.html 的 app.js 版本号 r10 → r11。
 *
 * 用法：node build/patch-work-layout.cjs [--check]
 * 幂等：已打过的补丁自动跳过。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

let failures = 0;

function readLf(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.includes('\r\n');
  return { text: crlf ? raw.replace(/\r\n/g, '\n') : raw, crlf };
}

function writeBack(file, text, crlf) {
  fs.writeFileSync(file, crlf ? text.replace(/\n/g, '\r\n') : text);
}

function patchFile(rel, patches) {
  const file = path.join(ROOT, rel);
  const { text, crlf } = readLf(file);
  let out = text;
  for (const p of patches) {
    if (out.includes(p.mark)) {
      console.log('skip (already applied): ' + p.name);
      continue;
    }
    const count = out.split(p.old).length - 1;
    if (count !== 1) {
      console.error('FAIL: ' + p.name + ' — anchor occurs ' + count + ' times (need exactly 1) in ' + rel);
      failures++;
      continue;
    }
    out = out.split(p.old).join(p.repl);
    console.log('patched: ' + p.name);
  }
  if (out !== text && !CHECK_ONLY) writeBack(file, out, crlf);
}

/* ---------------- app.js 补丁 ---------------- */

const W1_OLD = [
  '  const team = detail.team && detail.team.length ? detail.team : [{ name: work.author, role: "主创" }];',
  '  const process = detail.process && detail.process.length ? detail.process : ['
].join('\n');

const W1_NEW = [
  '  /* W1 */ const galleryImgs = (Array.isArray(detail.gallery) ? detail.gallery : []).filter(function (g) { return typeof g === "string" && g.trim(); }).slice(0, 12);',
  '  const layout = (typeof detail.layout === "string" && detail.layout) || (work.kind === "image" ? (galleryImgs.length > 1 ? "gallery" : "minimal") : (work.kind === "skill" ? "linkcard" : "showcase"));',
  '  const team = Array.isArray(detail.team) && detail.team.length ? detail.team : (typeof detail.team === "string" && detail.team ? [{ name: detail.team, role: "团队" }] : [{ name: work.author, role: "主创" }]);',
  '  const process = Array.isArray(detail.process) && detail.process.length ? detail.process : (typeof detail.process === "string" && detail.process ? [{ stage: "说明", note: detail.process }] : ['
].join('\n');

// W1b：W1 把 process 默认数组包进了三元括号，收尾 `];` 必须改成 `]);`
const W1B_OLD = [
  '    { stage: "评审", note: "评审记录待管理员补充" }',
  '  ];'
].join('\n');
const W1B_NEW = [
  '    { stage: "评审", note: "评审记录待管理员补充" }',
  '  ]); /* W1b */'
].join('\n');

const W2_OLD = '  const ctaStrip = el("div", { style: { width: "100%", marginBottom: 48 } },';
const W2_NEW = '  /* W2 */ const ctaStrip = !link ? null : el("div", { style: { width: "100%", marginBottom: 48 } },';

const W3A_OLD = [
  '      el("div", { style: { fontSize: 12, color: "#999", marginBottom: 14, letterSpacing: 1 } }, "作品入口 · ENTRY"),',
  '      sideCta,',
  '      sideHint,'
].join('\n');
const W3A_NEW = [
  '      /* W3a */ link ? el("div", { style: { fontSize: 12, color: "#999", marginBottom: 14, letterSpacing: 1 } }, "作品入口 · ENTRY") : null,',
  '      link ? sideCta : null,',
  '      link ? sideHint : null,'
].join('\n');

const W3B_OLD = [
  '      el("div", { style: { fontSize: 11, color: "#aaa", lineHeight: 1.8 } },',
  '        "点击「进入作品原网页」将在新窗口打开",',
  '        el("br", null),',
  '        "作者发布并登记的真实网页地址。")));'
].join('\n');
const W3B_NEW = [
  '      /* W3b */ link ? el("div", { style: { fontSize: 11, color: "#aaa", lineHeight: 1.8 } },',
  '        "点击「进入作品原网页」将在新窗口打开",',
  '        el("br", null),',
  '        "作者发布并登记的真实网页地址。") : null));'
].join('\n');

const W4A_OLD = [
  '  const themeBlock = el("div", { style: { marginTop: 48 } },',
  '    el("div", { style: labelStyle }, "THEME · 网页主题介绍"),'
].join('\n');
const W4A_NEW = [
  '  /* W4 */ const themeBlock = el("div", { style: { marginTop: 48 } },',
  '    el("div", { style: labelStyle }, layout === "showcase" ? "THEME · 网页主题介绍" : "INTRO · 作品介绍"),'
].join('\n');

const W4B_OLD = [
  '  const leftCol = el("div", null,',
  '    el("div", { style: labelStyle }, work.category.toUpperCase()),'
].join('\n');
const W4B_NEW = [
  '  /* W4b */ const galleryBlock = galleryImgs.length > 1 ? el("div", { style: { marginTop: 48 } },',
  '    el("div", { style: labelStyle }, "GALLERY · 作品集（" + galleryImgs.length + " 张）"),',
  '    el("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 } },',
  '      galleryImgs.map(function (g, i) { return el("img", { key: i, src: g, alt: (work.title || "作品") + " · 图 " + (i + 1), onClick: function () { window.open(g, "_blank", "noopener"); }, style: { width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 6, cursor: "zoom-in", display: "block", background: "#eceae6" } }); }))) : null;',
  '  const leftCol = el("div", null,',
  '    el("div", { style: labelStyle }, String(work.category || "").toUpperCase()),'
].join('\n');

const W4C_OLD = [
  '    metaStrip,',
  '    themeBlock,',
  '    teamBlock,',
  '    processBlock);'
].join('\n');
const W4C_NEW = [
  '    metaStrip,',
  '    (layout === "showcase" || layout === "linkcard" || (layout === "gallery" && themeText)) ? themeBlock : null,',
  '    layout === "gallery" ? galleryBlock : null,',
  '    layout === "showcase" ? teamBlock : null,',
  '    layout === "showcase" ? processBlock : null);'
].join('\n');

const W5A_OLD = '  return el("div", { style: { marginTop: 56, padding: "24px 0 0", borderTop: "1px solid #eee" } },';
const W5A_NEW = [
  '  /* W5 */ if (!list.length && !showForm) return null;',
  '  return el("div", { style: { marginTop: 56, padding: "24px 0 0", borderTop: "1px solid #eee" } },'
].join('\n');

const W5B_OLD = '    !list.length && !showForm ? el("div", { style: { fontSize: 13, color: "#bbb", padding: "10px 0" } }, "作者暂未提供可下载资源。") : null,\n';
const W5B_NEW = '';

const W6_OLD = 'w.description || "")';
const W6_NEW = '/* W6 */ (w.description || w.desc || ""))';

patchFile('public/app.js', [
  { name: 'W1 crash-guard + layout 解析', mark: '/* W1 */', old: W1_OLD, repl: W1_NEW },
  { name: 'W1b process 默认数组收尾闭合', mark: '/* W1b */', old: W1B_OLD, repl: W1B_NEW },
  { name: 'W2 无链接不渲染 CTA 横条', mark: '/* W2 */', old: W2_OLD, repl: W2_NEW },
  { name: 'W3a 侧栏入口区仅链接作品显示', mark: '/* W3a */', old: W3A_OLD, repl: W3A_NEW },
  { name: 'W3b 侧栏脚注仅链接作品显示', mark: '/* W3b */', old: W3B_OLD, repl: W3B_NEW },
  { name: 'W4a 主题/介绍标签随 layout 变化', mark: '/* W4 */', old: W4A_OLD, repl: W4A_NEW },
  { name: 'W4b 作品集网格块 + category 防御', mark: '/* W4b */', old: W4B_OLD, repl: W4B_NEW },
  { name: 'W4c 左列区块按 layout 条件渲染', mark: 'layout === "showcase" ? teamBlock : null', old: W4C_OLD, repl: W4C_NEW },
  { name: 'W5a 无资源时资源区整体不渲染', mark: '/* W5 */', old: W5A_OLD, repl: W5A_NEW },
  { name: 'W6 WorkPage 简介兼容 desc 字段', mark: '/* W6 */', old: W6_OLD, repl: W6_NEW }
]);

/* W5b 是删除操作、mark 语义相反（占位串存在 = 未打），走专用函数 */
function patchDeleteOnce(rel, name, oldStr, guardMark) {
  const file = path.join(ROOT, rel);
  const { text, crlf } = readLf(file);
  if (!text.includes(oldStr)) { console.log('skip (already applied): ' + name); return; }
  if (!text.includes(guardMark)) {
    console.error('FAIL: ' + name + ' — guard mark ' + guardMark + ' missing, abort delete');
    failures++;
    return;
  }
  const count = text.split(oldStr).length - 1;
  if (count !== 1) {
    console.error('FAIL: ' + name + ' — anchor occurs ' + count + ' times (need exactly 1)');
    failures++;
    return;
  }
  if (!CHECK_ONLY) writeBack(file, text.split(oldStr).join(''), crlf);
  console.log('patched: ' + name);
}

/* ---------------- HTML 版本号 ---------------- */

function bumpHtml(rel) {
  const file = path.join(ROOT, rel);
  const { text, crlf } = readLf(file);
  if (text.includes('app.js?v=20260914r11')) { console.log('skip (already applied): bump ' + rel); return; }
  const count = text.split('app.js?v=20260914r10').length - 1;
  if (count !== 1) {
    console.error('FAIL: bump ' + rel + ' — r10 reference occurs ' + count + ' times');
    failures++;
    return;
  }
  if (!CHECK_ONLY) writeBack(file, text.split('app.js?v=20260914r10').join('app.js?v=20260914r11'), crlf);
  console.log('patched: bump ' + rel + ' → r11');
}

// W5b 删除占位行（须在 W5a 之后执行，以 W5 标记为护栏）
patchDeleteOnce('public/app.js', 'W5b 删除「作者暂未提供可下载资源」占位', W5B_OLD, '/* W5 */');

bumpHtml('public/index.html');
bumpHtml('public/work.html');

if (failures) {
  console.error('\n' + failures + ' patch(es) FAILED');
  process.exit(1);
}
console.log(CHECK_ONLY ? '\ncheck complete (no writes).' : '\nall patches applied.');
