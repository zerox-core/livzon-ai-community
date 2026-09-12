// server/routes/works.js
// 作品路由：公开读 + 上传写（真写库）
const express = require('express');
const { query } = require('../db');
const { ok, err, ErrorCodes } = require('../contract');
const { checkRules } = require('../validate');

const router = express.Router();

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
  const sort = String(req.query.sort || 'new') === 'hot' ? 'hot' : 'new';
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
    const r = await query(
      `SELECT w.id, w.kind, w.title, w.author, w.category, w.description, w.cover, w.source, w.session,
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
