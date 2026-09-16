#!/usr/bin/env node
/**
 * 方案B：把 showcase 页面残留的秒搭平台图片引用（/spark/...）本地化为风格化 SVG 占位图。
 *
 * 背景：7 个作品网页的插图指向秒搭平台存储接口（/spark/app/<app_id>/runtime/...），
 * 平台接口对未登录请求 302 到 service-not-activated，无法抓取；本机与 git 历史均无源图。
 * 本脚本按每个页面的设计主题生成 SVG 占位图落到 public/showcase/<slug>/img/，
 * 并把 49 处引用改写为本地路径，使页面完全离线可用。
 *
 * 用法：在仓库根目录执行  node scripts/localize-spark-images.mjs
 * 幂等：页面无 /spark 引用时为 no-op。
 * 后续换真图：直接替换 public/showcase/<slug>/img/illu-NN.svg（文件名不变），无需改 HTML。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOWCASE = path.join(ROOT, 'public', 'showcase');

/* 每页配色取自各页面现有设计的主色调（c1 渐变起点 / c2 渐变终点 / accent 点缀与文字） */
const THEMES = {
  'amber-insect-archive': { c1: '#2e2010', c2: '#7a5218', accent: '#e0a83e', label: '琥珀昆虫档案' },
  'cirque-brume':         { c1: '#1b2130', c2: '#41506e', accent: '#a5bcdf', label: '雾中马戏' },
  'dunhuang-murals':      { c1: '#432915', c2: '#9c6128', accent: '#d9a25f', label: '敦煌壁画' },
  'hanabi-night':         { c1: '#0e1530', c2: '#2a3a8f', accent: '#f2c94c', label: '夏夜烟火祭' },
  'monsoon-post':         { c1: '#14302a', c2: '#2f6b52', accent: '#84c9ab', label: '季风邮局' },
  'oilpaper-umbrella':    { c1: '#3a1a1e', c2: '#8e3b3b', accent: '#e39a9a', label: '油纸伞' },
  'paper-kite-museum':    { c1: '#273052', c2: '#586aa8', accent: '#c3cdf2', label: '纸鸢博物馆' },
};
const FALLBACK = { c1: '#262a36', c2: '#4a5068', accent: '#b9c2d8', label: '插画占位' };

function svgFor(t, n) {
  const angle = (n * 47) % 360;
  const cx1 = 200 + ((n * 137) % 800);
  const cy1 = 150 + ((n * 89) % 500);
  const cx2 = 1000 - ((n * 173) % 700);
  const cy2 = 600 - ((n * 61) % 400);
  const wave = 520 + ((n * 13) % 80);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle} .5 .5)">
      <stop offset="0" stop-color="${t.c1}"/><stop offset="1" stop-color="${t.c2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="${cx1}" cy="${cy1}" r="180" fill="${t.accent}" opacity="0.12"/>
  <circle cx="${cx2}" cy="${cy2}" r="260" fill="${t.accent}" opacity="0.08"/>
  <circle cx="${cx2}" cy="${cy2}" r="140" fill="none" stroke="${t.accent}" stroke-opacity="0.25" stroke-width="2"/>
  <path d="M0 640 Q 300 ${wave} 600 640 T 1200 640" fill="none" stroke="${t.accent}" stroke-opacity="0.3" stroke-width="3"/>
  <text x="600" y="412" text-anchor="middle" font-family="'Noto Serif SC','Songti SC',serif" font-size="30" fill="${t.accent}" opacity="0.85" letter-spacing="6">${t.label} · 插画</text>
</svg>
`;
}

const pages = fs.readdirSync(SHOWCASE).filter((d) => {
  const f = path.join(SHOWCASE, d, 'index.html');
  return fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('/spark/');
});

if (!pages.length) {
  console.log('[localize] 未发现 /spark 引用，无需处理（已本地化或脚本重复执行）。');
  process.exit(0);
}

let totalRefs = 0;
let totalImgs = 0;
for (const slug of pages) {
  const f = path.join(SHOWCASE, slug, 'index.html');
  let html = fs.readFileSync(f, 'utf8');
  const theme = THEMES[slug] || FALLBACK;
  const uniq = [...new Set([...html.matchAll(/\/spark\/[^\s"'`)\\]+/g)].map((m) => m[0]))];
  const imgDir = path.join(SHOWCASE, slug, 'img');
  fs.mkdirSync(imgDir, { recursive: true });
  uniq.forEach((u, i) => {
    const name = `illu-${String(i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(imgDir, name), svgFor(theme, i + 1));
    const local = `/showcase/${slug}/img/${name}`;
    const parts = html.split(u);
    totalRefs += parts.length - 1;
    html = parts.join(local);
    totalImgs++;
  });
  fs.writeFileSync(f, html);
  console.log(`[localize] ${slug}: ${uniq.length} 张占位图，引用已改写`);
}

/* 残留断言：任何页面不允许再出现 /spark 引用 */
const residue = fs.readdirSync(SHOWCASE).filter((d) => {
  const f = path.join(SHOWCASE, d, 'index.html');
  return fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('/spark/');
});
if (residue.length) {
  console.error('[localize] ❌ 仍有残留：', residue);
  process.exit(1);
}
console.log(`[localize] ✅ 完成：${pages.length} 个页面，${totalImgs} 张 SVG 占位图，${totalRefs} 处引用改写，0 残留`);
