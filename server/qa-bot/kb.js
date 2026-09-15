// 知识库加载与检索（关键词打分，无外部依赖）
// v2：支持身份牌（year/status）+ 两层目录（现役 kb/ + 档案馆 kb/archive/<年份>/）+ 时间感检索
const fs = require('fs');
const path = require('path');

// 文件格式：
// # 标题
// keywords: 词1, 词2, 词3
// year: 2026          （可选，身份牌：属于哪个年份）
// status: 进行中      （可选，身份牌：进行中 / 通用 / 已结束）
// ---
// 正文（markdown）
function parseArticle(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  const m = raw.match(/^#\s+(.+)\r?\n+keywords:\s*([^\r\n]+)\r?\n\s*((?:(?:year|status)\s*:\s*[^\r\n]*\r?\n\s*)*)---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  const keywords = m[2].split(/[,，、]/).map(s => s.trim()).filter(Boolean);
  const a = { title: m[1].trim(), keywords: keywords, body: m[4].trim(), year: '', status: '', zone: 'active', archiveYear: '' };
  for (const seg of m[3].split(/\r?\n/)) {
    const ym = /^year\s*:\s*(\S+)/.exec(seg); if (ym) a.year = ym[1];
    const sm = /^status\s*:\s*(.+?)\s*$/.exec(seg); if (sm) a.status = sm[1];
  }
  return a;
}

function loadKB(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  // 现役区：kb/*.md（通用 + 进行中活动）
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    try {
      const a = parseArticle(path.join(dir, f));
      if (a) out.push(a);
    } catch (e) { /* 跳过坏文件 */ }
  }
  // 档案馆：kb/archive/<年份>/*.md，按年份打标（归档不删除，供"去年"类问题检索）
  const archDir = path.join(dir, 'archive');
  if (fs.existsSync(archDir)) {
    for (const year of fs.readdirSync(archDir)) {
      const ydir = path.join(archDir, year);
      try { if (!fs.statSync(ydir).isDirectory()) continue; } catch (e) { continue; }
      for (const f of fs.readdirSync(ydir)) {
        if (!f.endsWith('.md')) continue;
        try {
          const a = parseArticle(path.join(ydir, f));
          if (a) { a.zone = 'archive'; a.archiveYear = year; if (!a.year) a.year = year; out.push(a); }
        } catch (e) { /* 跳过坏文件 */ }
      }
    }
  }
  return out;
}

// 分词：拉丁字母数字词 + 中文二元组（bigram）
function terms(text) {
  const t = new Set();
  const norm = String(text).toLowerCase();
  const latin = norm.match(/[a-z0-9]+/g) || [];
  for (const w of latin) { if (w.length >= 2) t.add(w); }
  const cjkParts = norm.match(/[\u4e00-\u9fa5]+/g) || [];
  for (const part of cjkParts) {
    for (let i = 0; i < part.length - 1; i++) t.add(part.slice(i, i + 2));
    if (part.length === 1) t.add(part);
  }
  return [...t];
}

// 时间感检索：默认只答"现在"（现役区）；问到"过去"（去年/往届/过去年份）才翻档案
const PAST_WORDS = /去年|前年|上年|往届|上届|上一次|上次|以往|早前|之前那/;
function zoneFor(kb, question) {
  const qLower = String(question).toLowerCase();
  const years = [];
  const yrRe = /20\d{2}/g;
  let ym;
  while ((ym = yrRe.exec(qLower)) !== null) {
    const y = Number(ym[0]);
    if (years.indexOf(y) < 0) years.push(y);
  }
  const currentYear = new Date().getFullYear();
  if (years.length && years.every(y => y < currentYear)) {
    // 明确问了过去的年份 → 只搜档案馆对应年份
    return { mode: 'archive-years', years: years };
  }
  if (!years.length && PAST_WORDS.test(qLower)) {
    const hasArchive = kb.some(a => a.zone === 'archive');
    if (hasArchive) return { mode: 'archive-all', years: [] };
  }
  return { mode: 'active', years: [] };
}

function retrieve(kb, question, topK) {
  const k = topK || 3;
  const qLower = String(question).toLowerCase();
  const qs = terms(question);
  const z = zoneFor(kb, question);
  const pool = kb.filter(a => {
    if (z.mode === 'active') return a.zone !== 'archive';
    if (z.mode === 'archive-all') return a.zone === 'archive';
    return a.zone === 'archive' && a.year && z.years.indexOf(Number(a.year)) >= 0;
  });
  const scored = pool.map(a => {
    let score = 0;
    const title = a.title.toLowerCase();
    const body = a.body.toLowerCase();
    const kwLower = a.keywords.map(x => x.toLowerCase());
    for (const kw of kwLower) { if (qLower.includes(kw)) score += 3; }
    for (const t of qs) {
      if (title.includes(t)) score += 2;
      for (const kw of kwLower) { if (kw.includes(t)) { score += 1; break; } }
      if (body.includes(t)) score += 0.5;
    }
    return { title: a.title, body: a.body, score: Math.round(score * 10) / 10, zone: a.zone, year: a.year, status: a.status };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

module.exports = { loadKB, retrieve, terms, zoneFor, parseArticle };
