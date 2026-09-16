#!/usr/bin/env node
// scripts/generate-showcase-images.mjs — 用内网 LLM 网关（豆包 Seedream）为 showcase 页面生成插图
//
// 背景：7 个秒搭建作品网页的插图原指向平台存储接口（未登录 302，抓不到），
//       方案B 已先用 SVG 占位（scripts/localize-spark-images.mjs）；本脚本用「直接生图」
//       替换占位：生成 <slug>/img/illu-NN.jpg，并把页面内 illu-NN.svg 引用改写为 .jpg。
//
// 用法（仓库根目录）：
//   node scripts/generate-showcase-images.mjs                 # 生成缺失的图（已存在则跳过）
//   node scripts/generate-showcase-images.mjs --only=paper-kite-museum
//   node scripts/generate-showcase-images.mjs --force          # 重新生成全部
//   node scripts/generate-showcase-images.mjs --dry            # 只打印计划，不调用接口
//
// 依赖：server/.env 的 QA_BOT_LLM_BASE_URL / QA_BOT_LLM_API_KEY（可用环境变量覆盖）
// 幂等：已存在同名 .jpg 的槽位默认跳过；HTML 引用只在 .jpg 实际存在时才改写。

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOWCASE = join(ROOT, 'public', 'showcase');
const CONCURRENCY = 3;
const RETRY = 2;
const WIDE = '2560x1440'; // 2560*1440 = 3,686,400 = 接口要求的最小像素数
const SQUARE = '1920x1920';

// ---- 读取 .env（不回显密钥） ----
function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const txt = readFileSync(join(ROOT, 'server', '.env'), 'utf-8');
    const m = txt.match(new RegExp('^' + key + '=(.*)$', 'm'));
    return m ? m[1].trim() : '';
  } catch { return ''; }
}
const BASE = (envFromFile('QA_BOT_LLM_BASE_URL') || '').replace(/\/+$/, '');
const KEY = envFromFile('QA_BOT_LLM_API_KEY');
const MODEL = envFromFile('QA_BOT_LLM_IMAGE_MODEL') || 'doubao-seedream-5-0-260128';

// ---- 提示词清单（每页统一风格，逐槽位对应页面语义） ----
const STYLE = {
  'paper-kite-museum': 'traditional Chinese paper-kite museum poster art, flat vector illustration, indigo blue and warm cream palette, clean cream paper background, elegant, no text',
  'oilpaper-umbrella': 'Chinese oil-paper umbrella craft editorial illustration, flat vector art, bamboo green, oil-paper amber and rain grey palette, soft misty mood, no text',
  'amber-insect-archive': 'natural-history museum specimen plate, amber inclusion macro, warm gold amber and deep brown palette, dark museum background, scientific illustration style, no text',
  'cirque-brume': 'vintage French circus poster illustration, misty teal, deep plum and antique gold palette, art-deco geometric shapes, theatrical atmosphere, no text',
  'dunhuang-murals': 'Dunhuang cave mural art, ancient Chinese fresco, ochre, malachite green, terracotta and faded gold palette, weathered wall texture, elegant flowing lines, no text',
  'hanabi-night': 'Japanese summer fireworks festival illustration, night indigo sky, warm lantern amber and red palette, festive stalls, flat vector art, no text',
  'monsoon-post': 'vintage 19th-century maritime post office illustration, slate blue, sage green and paper cream palette, engraved-postcard mood, no text',
};

const PLAN = [
  // ===== paper-kite-museum（纸鸢博物馆）=====
  { slug: 'paper-kite-museum', file: 'illu-01', size: SQUARE, prompt: 'a traditional Chinese swallow-shaped paper kite with painted floral patterns on translucent paper and bamboo frame, floating in the air' },
  { slug: 'paper-kite-museum', file: 'illu-02', size: SQUARE, prompt: 'a traditional Chinese centipede dragon kite, long segmented body with round painted head, many circular segments trailing' },
  { slug: 'paper-kite-museum', file: 'illu-03', size: SQUARE, prompt: 'a traditional Chinese butterfly kite with symmetrical ornate patterned wings' },
  { slug: 'paper-kite-museum', file: 'illu-04', size: SQUARE, prompt: 'a traditional Chinese eagle-shaped paper kite with spread feathered wings' },
  { slug: 'paper-kite-museum', file: 'illu-05', size: SQUARE, prompt: 'an elderly Chinese kite artisan in a workshop painting a kite, bamboo strips and paper on the workbench' },
  { slug: 'paper-kite-museum', file: 'illu-06', size: WIDE, prompt: 'a museum exhibition hall interior with many colorful kites suspended from the ceiling, visitors silhouettes, tall windows' },

  // ===== oilpaper-umbrella（油纸伞）=====
  { slug: 'oilpaper-umbrella', file: 'illu-01', size: WIDE, prompt: 'a large open Chinese oil-paper umbrella as the hero subject, bamboo ribs and painted oiled paper, raindrops' },
  { slug: 'oilpaper-umbrella', file: 'illu-02', size: SQUARE, prompt: 'a Chinese umbrella artisan hands assembling bamboo ribs and paper panels, workshop tools' },
  { slug: 'oilpaper-umbrella', file: 'illu-03', size: SQUARE, prompt: 'a gallery of many oil-paper umbrellas suspended upside down from the ceiling, layered and colorful' },
  { slug: 'oilpaper-umbrella', file: 'illu-04', size: SQUARE, prompt: 'a bamboo grove with tall green bamboo stems in mist' },
  { slug: 'oilpaper-umbrella', file: 'illu-05', size: SQUARE, prompt: 'a narrow rainy alley in an old Chinese town, wet stone pavement, umbrellas walking away in the distance' },
  { slug: 'oilpaper-umbrella', file: 'illu-06', size: SQUARE, prompt: 'close-up of hand-painted flower patterns on oiled umbrella paper, brush and ink pigment' },

  // ===== amber-insect-archive（琥珀昆虫档案馆）=====
  { slug: 'amber-insect-archive', file: 'illu-01', size: SQUARE, prompt: 'a polished amber piece containing a prehistoric horned beetle inclusion' },
  { slug: 'amber-insect-archive', file: 'illu-02', size: SQUARE, prompt: 'a polished amber piece containing a cretaceous mosquito inclusion' },
  { slug: 'amber-insect-archive', file: 'illu-03', size: SQUARE, prompt: 'a polished amber piece containing a prehistoric eight-legged spider inclusion' },
  { slug: 'amber-insect-archive', file: 'illu-04', size: SQUARE, prompt: 'a polished amber piece containing an emerald dragonfly nymph inclusion' },
  { slug: 'amber-insect-archive', file: 'illu-05', size: SQUARE, prompt: 'a polished amber piece containing a giant prehistoric ant inclusion, the largest known ancient ant' },
  { slug: 'amber-insect-archive', file: 'illu-06', size: SQUARE, prompt: 'a polished amber piece containing a delicate lacewing insect with intricate wing veins' },
  { slug: 'amber-insect-archive', file: 'illu-07', size: SQUARE, prompt: 'a polished amber piece containing a golden fossil wasp inclusion' },
  { slug: 'amber-insect-archive', file: 'illu-08', size: SQUARE, prompt: 'a polished amber piece containing a primitive termite inclusion' },

  // ===== cirque-brume（雾中马戏团）=====
  { slug: 'cirque-brume', file: 'illu-01', size: WIDE, prompt: 'a vintage circus tent rising in morning mist, striped big top, ornate entrance' },
  { slug: 'cirque-brume', file: 'illu-02', size: SQUARE, prompt: 'aerial trapeze artists flying high above the circus ring, ribbons and motion' },
  { slug: 'cirque-brume', file: 'illu-03', size: SQUARE, prompt: 'a fire dancer twirling burning hoops, dramatic orange light in a dark ring' },
  { slug: 'cirque-brume', file: 'illu-04', size: SQUARE, prompt: 'a crystal child performer balancing on a mirrored sphere, cold luminous glass tones' },
  { slug: 'cirque-brume', file: 'illu-05', size: SQUARE, prompt: 'a silent mime performer with white face under a single spotlight, minimal stage' },
  { slug: 'cirque-brume', file: 'illu-06', size: SQUARE, prompt: 'a golden silk veil aerial act, long flowing fabric suspended in the air' },
  { slug: 'cirque-brume', file: 'illu-07', size: SQUARE, prompt: 'a misty circus orchestra ensemble playing under hazy stage lights' },

  // ===== dunhuang-murals（敦煌壁画）=====
  { slug: 'dunhuang-murals', file: 'illu-01', size: WIDE, prompt: 'panorama of an ancient Dunhuang cave temple interior, weathered mural walls lit softly' },
  { slug: 'dunhuang-murals', file: 'illu-02', size: SQUARE, prompt: 'flying apsaras with flowing ribbons and musical instruments from Dunhuang murals' },
  { slug: 'dunhuang-murals', file: 'illu-03', size: SQUARE, prompt: 'an ornate Dunhuang cave ceiling caisson pattern, concentric geometric and floral motifs' },
  { slug: 'dunhuang-murals', file: 'illu-04', size: SQUARE, prompt: 'a Dunhuang sutra illustration scene with buddhist figures and architecture' },
  { slug: 'dunhuang-murals', file: 'illu-05', size: SQUARE, prompt: 'mural restoration close-up, half damaged half restored fresco with conservation tools' },
  { slug: 'dunhuang-murals', file: 'illu-06', size: SQUARE, prompt: 'portrait of ancient Dunhuang donor patrons in elegant robes with offerings' },

  // ===== hanabi-night（花火夜）=====
  { slug: 'hanabi-night', file: 'illu-01', size: SQUARE, prompt: 'a Japanese festival takoyaki food stall at night with glowing lanterns and steam' },

  // ===== monsoon-post（季风邮局）=====
  { slug: 'monsoon-post', file: 'illu-01', size: WIDE, prompt: 'a sailing ship on a monsoon sea under heavy clouds, distant waves and rain bands' },
  { slug: 'monsoon-post', file: 'illu-02', size: SQUARE, prompt: 'a sheet of vintage postage stamps with ships, maps and monsoons, perforated edges' },
  { slug: 'monsoon-post', file: 'illu-03', size: SQUARE, prompt: 'a red wax seal on folded letter paper, brass seal stamp beside it' },
  { slug: 'monsoon-post', file: 'illu-04', size: SQUARE, prompt: 'a handwritten letter with quill pen and ink bottle on a desk, folded paper' },
];

const args = process.argv.slice(2);
const only = (args.find(a => a.startsWith('--only=')) || '').split('=')[1] || '';
const force = args.includes('--force');
const dry = args.includes('--dry');

function target(slug, file) { return join(SHOWCASE, slug, 'img', file + '.jpg'); }

async function gen(entry) {
  const out = target(entry.slug, entry.file);
  if (existsSync(out) && !force) return { ...entry, skipped: true };
  const style = STYLE[entry.slug] || '';
  const body = {
    model: MODEL,
    prompt: entry.prompt + '. ' + style,
    n: 1,
    size: entry.size,
  };
  let lastErr = '';
  for (let i = 0; i <= RETRY; i++) {
    try {
      const r = await fetch(BASE + '/images/generations', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok || !j.data || !j.data[0]) { lastErr = 'HTTP ' + r.status + ' ' + JSON.stringify(j).slice(0, 200); continue; }
      const item = j.data[0];
      let buf;
      if (item.b64_json) buf = Buffer.from(item.b64_json, 'base64');
      else {
        const ir = await fetch(item.url);
        if (!ir.ok) { lastErr = '图片下载失败 HTTP ' + ir.status; continue; }
        buf = Buffer.from(await ir.arrayBuffer());
      }
      writeFileSync(out, buf);
      return { ...entry, bytes: buf.length };
    } catch (e) { lastErr = e.message; }
  }
  return { ...entry, error: lastErr };
}

// ---- HTML 引用改写：illu-NN.svg → illu-NN.jpg（仅当 .jpg 已存在） ----
function rewriteHtml() {
  const changed = [];
  const slugs = [...new Set(PLAN.map(p => p.slug))];
  for (const slug of slugs) {
    const page = join(SHOWCASE, slug, 'index.html');
    if (!existsSync(page)) continue;
    let html = readFileSync(page, 'utf-8');
    let n = 0;
    for (const p of PLAN.filter(x => x.slug === slug)) {
      if (!existsSync(target(slug, p.file))) continue;
      const re = new RegExp('img/' + p.file + '\\.svg', 'g');
      const before = html;
      html = html.replace(re, 'img/' + p.file + '.jpg');
      if (html !== before) n += 1;
    }
    if (n) { writeFileSync(page, html); changed.push(slug + '(' + n + ')'); }
  }
  return changed;
}

(async () => {
  if (!BASE || !KEY) { console.error('[gen] 缺少 QA_BOT_LLM_BASE_URL / QA_BOT_LLM_API_KEY（server/.env）'); process.exit(1); }
  let todo = PLAN.filter(p => !only || p.slug === only);
  if (force) { /* 保留全部 */ }
  console.log('[gen] 模型=' + MODEL + ' 目标=' + todo.length + ' 张 并发=' + CONCURRENCY + (force ? ' (--force)' : '') + (dry ? ' [dry]' : ''));
  if (dry) { todo.forEach(t => console.log('  · ' + t.slug + '/' + t.file + ' ' + t.size)); return; }

  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < todo.length) {
      const cur = todo[idx++];
      const t0 = Date.now();
      const r = await gen(cur);
      r.ms = Date.now() - t0;
      results.push(r);
      const tag = r.skipped ? '跳过(已存在)' : (r.error ? '✗ ' + r.error : '✓ ' + (r.bytes / 1024).toFixed(0) + 'KB');
      console.log('[' + results.length + '/' + todo.length + '] ' + cur.slug + '/' + cur.file + ' → ' + tag);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const ok = results.filter(r => !r.error && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => r.error);
  const changed = rewriteHtml();
  console.log('');
  console.log('生成 ' + ok + ' 张，跳过 ' + skipped + ' 张，失败 ' + failed.length + ' 张');
  if (changed.length) console.log('HTML 引用改写：' + changed.join(' / '));
  if (failed.length) {
    failed.forEach(f => console.log('  ✗ ' + f.slug + '/' + f.file + '：' + f.error));
    process.exit(1);
  }
  console.log('✅ 完成');
})();
