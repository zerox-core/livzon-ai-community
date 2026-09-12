// server/routes/works.js
// 作品路由：公开读 + 上传写（真写库）
const express = require('express');
const { query } = require('../db');
const { ok, err, ErrorCodes } = require('../contract');
const { checkRules } = require('../validate');

const router = express.Router();

// 身份识别（与 vote.js 同款）：登录会话优先；显式 x-user-id 头为调试口子；都没有 = 匿名
function voterOf(req) {
  if (req.session && req.session.userId) return { userId: req.session.userId, key: String(req.session.userId) };
  const legacy = (req.headers['x-user-id'] || '').toString();
  if (legacy) return { userId: null, key: legacy.slice(0, 80) };
  return null;
}

// 列字段（不含详情大对象，减少传输；详情单查时带出）
const LIST_FIELDS = `id, kind, title, author, category, description, cover, source, session, activity_id, status, published, wall_order, created_at`;

// POST /api/works —— 上传新作品（严格校验，真写库）
router.post('/', async (req, res) => {
  const rules = {
    title:        { required: true, type: 'string', max: 100 },
    author:       { required: true, type: 'string', max: 60 },
    kind:         { required: true, type: 'string', enum: ['image','video','3d','tool','app','skill','mcp','source'] },
    category:     { type: 'string', max: 40 },
    description:  { type: 'string', max: 2000 },
    cover:        { type: 'string', max: 300 },
    source:       { type: 'string', max: 200 },
    link:         { type: 'string', max: 1000 },
    detail:       { type: 'object' },
    activityId:  { type: 'string', max: 60 },   // 票池归属（活动 id；空 = 自由展区）
  };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));

  const detail = {
    ...(casted.detail || {}),
    link: casted.link || '',
    source: casted.source || '',
  };
  delete casted.link;

  const userId = (req.session && req.session.userId) || null;
  try {
    // 票池归属：活动不存在时拒绝（防脏数据）
    if (casted.activityId) {
      const a = await query(`SELECT id FROM activities WHERE id=$1`, [casted.activityId]);
      if (!a.rows.length) return res.status(400).json(err(ErrorCodes.VALIDATION, '所选活动不存在'));
    }
    const r = await query(
      `INSERT INTO works (kind, title, author, category, description, cover, source, detail, status, published, created_by, user_id, activity_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',false,$9,$10,$11)
       RETURNING ${LIST_FIELDS}`,
      [
        casted.kind,
        casted.title,
        casted.author,
        casted.category || '',
        casted.description || '',
        casted.cover || '',
        casted.source || '',
        JSON.stringify(detail),
        casted.author,
        userId,
        casted.activityId || '',
      ]
    );
    res.status(201).json(ok(r.rows[0]));
  } catch (e) {
    console.error('[works.post]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/works —— 巨幕作品（人工筛选上墙：approved+published+wall_order 非空，按展位排序）
router.get('/', async (req, res) => {
  try {
    const r = await query(
      `SELECT ${LIST_FIELDS} FROM works WHERE status='approved' AND published=true AND wall_order IS NOT NULL ORDER BY wall_order`
    );
    res.json(ok({ works: r.rows }));
  } catch (e) {
    console.error('[works.get]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/works/gallery —— 作品走廊：全部已发布作品（含未上墙），巨幕下方罗列（须注册在 /:id 之前）
router.get('/gallery', async (req, res) => {
  try {
    const r = await query(
      `SELECT ${LIST_FIELDS} FROM works WHERE status='approved' AND published=true
       ORDER BY (wall_order IS NULL) ASC, wall_order ASC NULLS LAST, created_at DESC`
    );
    res.json(ok({ works: r.rows }));
  } catch (e) {
    console.error('[works.gallery]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/works/feed —— 首页作品展区：全部已发布作品 + 票数，支持搜索/类型/票池筛选与最新·最热排序
//（须注册在 /:id 之前）。q=关键词（标题/作者/简介），kind=作品类型，activity_id=票池
//  （不传或 all=全部；空串=自由展区），sort=new 最新 / hot 票数。
router.get('/feed', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 60);
  const kind = String(req.query.kind || 'all');
  const hasPool = req.query.activity_id !== undefined && req.query.activity_id !== null;
  const pool = hasPool ? String(req.query.activity_id).slice(0, 60) : 'all';
  const sortRaw = String(req.query.sort || 'new');
  const sort = ['hot', 'new', 'recommend'].indexOf(sortRaw) >= 0 ? sortRaw : 'new';
  const limit = Math.min(Math.max(Number(req.query.limit) || 60, 1), 120);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const conds = [`status='approved'`, `published=true`];
  const vals = [];
  if (q) {
    vals.push(`%${q}%`);
    conds.push(`(w.title ILIKE $${vals.length} OR w.author ILIKE $${vals.length} OR w.description ILIKE $${vals.length})`);
  }
  if (kind && kind !== 'all') { vals.push(kind); conds.push(`w.kind=$${vals.length}`); }
  if (pool !== 'all') { vals.push(pool); conds.push(`w.activity_id=$${vals.length}`); }
  const where = conds.join(' AND ');
  const order = sort === 'hot' ? 'COALESCE(v.cnt, 0) DESC, w.created_at DESC' : 'w.created_at DESC';

  try {
    if (sort === 'recommend') {
      // 为你推荐（2026-09-13）：兴趣画像按近 7 天投票实时算（数据量小，比小时级批处理还新）；
      // 防高频重复三招：已投作品降权不隐藏、同类型穿插不连排、整点轮换种子（一小时内顺序稳定、每小时换序）
      const r = await query(
        `SELECT w.user_id, w.id, w.kind, w.title, w.author, w.category, w.description, w.cover, w.source, w.session,
                w.activity_id, w.wall_order, w.created_at,
                COALESCE(v.cnt, 0)::int AS vote_count,
                a.title AS activity_title
         FROM works w
         LEFT JOIN (SELECT work_id, count(*) cnt FROM votes GROUP BY work_id) v ON v.work_id = w.id
         LEFT JOIN activities a ON a.id = w.activity_id
         WHERE ${where}
         LIMIT 500`, vals);
      const viewer = voterOf(req);
      const interest = {}; const votedIds = new Set();
      if (viewer) {
        const hv = await query(
          `SELECT w.kind, w.id, v.created_at FROM votes v JOIN works w ON w.id = v.work_id
           WHERE v.voter_id=$1 AND v.created_at > now() - interval '30 days'`, [viewer.key]);
        const weekAgo = Date.now() - 7 * 864e5;
        hv.rows.forEach((row) => {
          votedIds.add(row.id);
          if (new Date(row.created_at).getTime() > weekAgo) interest[row.kind] = (interest[row.kind] || 0) + 1;
        });
      }
      const hourBucket = Math.floor(Date.now() / 3600000);
      const seedKey = (viewer ? viewer.key : 'anon') + ':' + hourBucket;
      const jitter = (id) => { // 确定性哈希 → [0,1)：同小时稳定、整点轮换
        let h = 2166136261; const s = seedKey + ':' + id;
        for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
        return ((h >>> 0) % 10000) / 10000;
      };
      const now = Date.now();
      const scored = r.rows.map((w) => {
        const ageDays = (now - new Date(w.created_at).getTime()) / 864e5;
        let s = 3 * Math.log1p(interest[w.kind] || 0)   // 兴趣加权（冷启动=0，退化为热度+新鲜）
              + 1.5 * Math.log1p(w.vote_count || 0)     // 热度
              + Math.max(0, 7 - ageDays) * 0.4          // 新鲜度（7 天内递减）
              + jitter(w.id);                           // 小时级轮换
        if (votedIds.has(w.id)) s *= 0.25;              // 已投过=已消费，降权不隐藏
        return { w, s };
      });
      scored.sort((a, b) => b.s - a.s);
      // 同类型穿插（MMR-lite）：最多牺牲一半分数换一个不同类型，避免同 kind 连排刷屏
      const picked = []; const rest = scored.slice();
      let lastKind = null;
      while (rest.length) {
        let idx = 0;
        if (lastKind) {
          const maxS = rest[0].s;
          const alt = rest.findIndex((x) => x.w.kind !== lastKind && x.s >= maxS * 0.5);
          if (alt > 0) idx = alt;
        }
        picked.push(rest.splice(idx, 1)[0]);
        lastKind = picked[picked.length - 1].w.kind;
      }
      const total = picked.length;
      const works = picked.slice(offset, offset + limit).map((x) => x.w);
      return res.json(ok({ works, total }));
    }
    const r = await query(
      `SELECT w.user_id, w.id, w.kind, w.title, w.author, w.category, w.description, w.cover, w.source, w.session,
              w.activity_id, w.wall_order, w.created_at,
              COALESCE(v.cnt, 0)::int AS vote_count,
              a.title AS activity_title
       FROM works w
       LEFT JOIN (SELECT work_id, count(*) cnt FROM votes GROUP BY work_id) v ON v.work_id = w.id
       LEFT JOIN activities a ON a.id = w.activity_id
       WHERE ${where}
       ORDER BY ${order}
       LIMIT ${limit} OFFSET ${offset}`, vals);
    const t = await query(`SELECT count(*)::int AS total FROM works w WHERE ${where}`, vals);
    res.json(ok({ works: r.rows, total: t.rows[0].total }));
  } catch (e) {
    console.error('[works.feed]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/works/:id —— 单件作品（含 detail）
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json(err(ErrorCodes.VALIDATION, 'id 非法'));
  try {
    const r = await query(`SELECT * FROM works WHERE id=$1`, [id]);
    if (!r.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '作品不存在'));
    res.json(ok(r.rows[0]));
  } catch (e) {
    console.error('[works.one]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

module.exports = router;
