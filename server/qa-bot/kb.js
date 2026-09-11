// 知识库加载与检索（关键词打分，无外部依赖）
const fs = require('fs');
const path = require('path');

// 文件格式：
// # 标题
// keywords: 词1, 词2, 词3
// ---
// 正文（markdown）
function parseArticle(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  const m = raw.match(/^#\s+(.+)\r?\n+keywords:\s*([^\r\n]+)\r?\n+---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const keywords = m[2].split(/[,，、]/).map(s => s.trim()).filter(Boolean);
  return { title: m[1].trim(), keywords: keywords, body: m[3].trim() };
}

function loadKB(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    try {
      const a = parseArticle(path.join(dir, f));
      if (a) out.push(a);
    } catch (e) { /* 跳过坏文件 */ }
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

function retrieve(kb, question, topK) {
  const k = topK || 3;
  const qLower = String(question).toLowerCase();
  const qs = terms(question);
  const scored = kb.map(a => {
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
    return { title: a.title, body: a.body, score: Math.round(score * 10) / 10 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

module.exports = { loadKB, retrieve, terms };
