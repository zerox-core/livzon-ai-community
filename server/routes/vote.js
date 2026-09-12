// server/routes/vote.js
// 投票（每日一票制，2026-09-12）：票池 = 作品所属活动（works.activity_id；空串 = 自由展区）。
// 每人每个票池每天 1 票，北京时间次日重置、不囤积；可每天给同一件作品续投。
// 登录用户以会话为准（个人中心等级按 user_id 计票）；显式 x-user-id 头保留为调试口子（mock.html）。
const express = require('express');
const { query } = require('../db');
const { ok, err, ErrorCodes } = require('../contract');
const { checkRules } = require('../validate');

const router = express.Router();

// 北京时间的「今天」（日切线与集团作息一致，不受 PG 会话时区影响）
const TODAY_SQL = `(now() AT TIME ZONE 'Asia/Shanghai')::date`;

// 身份：登录会话优先；无会话但显式带 x-user-id 头（调试口子）也放行；否则视为未登录
function voterOf(req) {
  if (req.session && req.session.userId) return { userId: req.session.userId, key: String(req.session.userId) };
  const legacy = (req.headers['x-user-id'] || '').toString();
  if (legacy) return { userId: null, key: legacy.slice(0, 80) };
  return null;
}

// POST /api/vote —— 投出今日一票（票池由作品归属决定，不信任客户端传参）
router.post('/', async (req, res) => {
  const voter = voterOf(req);
  if (!voter) return res.status(401).json(err(ErrorCodes.AUTH, '登录后才能投票'));
  const { userId, key } = voter;
  const rules = { workId: { required: true, type: 'number' } };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));

  try {
    const w = await query(`SELECT id, activity_id FROM works WHERE id=$1 AND published=true`, [casted.workId]);
    if (!w.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '作品不存在或未发布'));
    const pool = w.rows[0].activity_id || '';

    // 今日额度：同人同票池当天 1 票（唯一索引 uq_votes_pool_day 兜底并发）
    const used = await query(
      `SELECT 1 FROM votes WHERE voter_id=$1 AND activity_id=$2 AND vote_date=${TODAY_SQL} LIMIT 1`,
      [key, pool]);
    if (used.rows.length) {
      return res.status(409).json(err(ErrorCodes.CONFLICT,
        pool ? '本期活动今天的票已投出，明天再来' : '自由展区今天的票已投出，明天再来'));
    }

    const r = await query(
      `INSERT INTO votes (voter_id, activity_id, work_id, user_id, vote_date)
       VALUES ($1,$2,$3,$4,${TODAY_SQL}) RETURNING id`,
      [key, pool, casted.workId, userId]);
    res.status(201).json(ok({ voteId: r.rows[0].id, activityId: pool }));
  } catch (e) {
    if (e.code === '23505') return res.status(409).json(err(ErrorCodes.CONFLICT, '今天的票已投出，明天再来'));
    console.error('[vote.post]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/vote/status?work_id=N —— 单作品：总票数 + 我今天该池的票是否已用
router.get('/status', async (req, res) => {
  const workId = Number(req.query.work_id);
  if (Number.isNaN(workId)) return res.status(400).json(err(ErrorCodes.VALIDATION, 'work_id 非法'));
  const { key } = voterOf(req) || { key: 'anonymous' };
  try {
    const w = await query(`SELECT id, activity_id FROM works WHERE id=$1`, [workId]);
    if (!w.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '作品不存在'));
    const pool = w.rows[0].activity_id || '';
    const c = await query(`SELECT count(*)::int AS cnt FROM votes WHERE work_id=$1`, [workId]);
    const used = await query(
      `SELECT 1 FROM votes WHERE voter_id=$1 AND activity_id=$2 AND vote_date=${TODAY_SQL} LIMIT 1`,
      [key, pool]);
    res.json(ok({ workId, count: c.rows[0].cnt, activityId: pool, ticketUsedToday: used.rows.length > 0 }));
  } catch (e) {
    console.error('[vote.status]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/vote/my-today —— 我今天投出的票（首页展区刷新票态用）
router.get('/my-today', async (req, res) => {
  const { key } = voterOf(req) || { key: 'anonymous' };
  try {
    const r = await query(
      `SELECT work_id, activity_id FROM votes WHERE voter_id=$1 AND vote_date=${TODAY_SQL}`, [key]);
    res.json(ok({ votes: r.rows }));
  } catch (e) {
    console.error('[vote.my-today]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/vote/results —— 排行（可选 activity_id 票池过滤；不传 = 全部）
router.get('/results', async (req, res) => {
  const filter = (req.query.activity_id === undefined || req.query.activity_id === null)
    ? null : String(req.query.activity_id).slice(0, 60);
  try {
    const params = [];
    let where = '';
    if (filter !== null) { params.push(filter); where = `WHERE v.activity_id=$1`; }
    const r = await query(
      `SELECT w.id, w.title, w.author, w.activity_id, v.cnt
       FROM (SELECT work_id, activity_id, count(*) cnt FROM votes GROUP BY work_id, activity_id) v
       JOIN works w ON w.id = v.work_id
       ${where}
       ORDER BY v.cnt DESC`, params);
    res.json(ok({ results: r.rows }));
  } catch (e) {
    console.error('[vote.results]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

module.exports = router;
