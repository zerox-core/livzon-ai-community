// server/routes/my.js
// 个人中心（登录后）：我的飞书账户 / 我的报名 / 我的作品 / 我的等级 / 我的消息
const express = require('express');
const { query } = require('../db');
const { ok, err, ErrorCodes } = require('../contract');
const { checkRules } = require('../validate');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

// GET /api/my/profile —— 当前用户的飞书账户信息
router.get('/profile', async (req, res) => {
  try {
    const r = await query(`SELECT id, open_id, union_id, name, email, department, avatar, role, status, last_login_at
      FROM users WHERE id=$1`, [req.user.id]);
    if (!r.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '用户不存在'));
    res.json(ok(r.rows[0]));
  } catch (e) {
    console.error('[my.profile]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/my/registrations —— 我的报名记录
router.get('/registrations', async (req, res) => {
  try {
    const r = await query(`SELECT id, name, department, contact, activity, will_share, share_topic, remark, status, created_at
      FROM registrations WHERE user_id=$1 ORDER BY created_at DESC`, [req.user.id]);
    res.json(ok({ registrations: r.rows }));
  } catch (e) {
    console.error('[my.registrations]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/my/works —— 我的作品（含审核状态）
router.get('/works', async (req, res) => {
  try {
    const r = await query(`SELECT id, kind, title, author, category, cover, source, status, published, created_at, updated_at
      FROM works WHERE user_id=$1 ORDER BY created_at DESC`, [req.user.id]);
    res.json(ok({ works: r.rows }));
  } catch (e) {
    console.error('[my.works]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/my/level —— 我的等级（积分 / LV / 升级进度 / 基础任务）
router.get('/level', async (req, res) => {
  try {
    const [reg, works, approved, votes] = await Promise.all([
      query(`SELECT count(*)::int AS c FROM registrations WHERE user_id=$1`, [req.user.id]),
      query(`SELECT count(*)::int AS c FROM works WHERE user_id=$1`, [req.user.id]),
      query(`SELECT count(*)::int AS c FROM works WHERE user_id=$1 AND status='approved'`, [req.user.id]),
      query(`SELECT count(*)::int AS c FROM votes WHERE user_id=$1`, [req.user.id]),
    ]);
    const nReg = reg.rows[0].c, nWorks = works.rows[0].c, nApproved = approved.rows[0].c, nVotes = votes.rows[0].c;
    const points = nReg * 10 + nWorks * 20 + nApproved * 30 + nVotes * 5;
    const lv = computeLevel(points);
    const tasks = [
      { key: 'reg', label: '完成一次活动报名', points: 10, done: nReg > 0 },
      { key: 'work', label: '上传一件作品', points: 20, done: nWorks > 0 },
      { key: 'approve', label: '作品通过审核', points: 30, done: nApproved > 0 },
      { key: 'vote', label: '参与一次投票', points: 5, done: nVotes > 0 },
    ];
    res.json(ok({
      points, level: lv.level, levelName: lv.levelName,
      levelMin: lv.levelMin, nextLevelMin: lv.nextLevelMin, progress: lv.progress,
      tasks: tasks,
      breakdown: { registrations: nReg, works: nWorks, approved: nApproved, votes: nVotes },
    }));
  } catch (e) {
    console.error('[my.level]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/my/messages —— 站内消息（最新 30 条）+ 未读数；同活动多阶段归并为首条（body 显示最近阶段）
router.get('/messages', async (req, res) => {
  try {
    const [list, unread] = await Promise.all([
      query(`SELECT id, type, title, body, link, activity_id, stage, read, created_at
             FROM notifications WHERE user_id=$1 ORDER BY created_at DESC, id DESC LIMIT 200`, [req.user.id]),
      query(`SELECT count(*)::int AS c FROM notifications WHERE user_id=$1 AND read=FALSE`, [req.user.id]),
    ]);
    const byAct = new Map();
    const plain = [];
    for (const n of list.rows) {
      if (n.activity_id) {
        let g = byAct.get(n.activity_id);
        if (!g) {
          g = { id: n.id, type: n.type, title: n.title, body: n.body, link: n.link, activity_id: n.activity_id, stage: n.stage, read: true, created_at: n.created_at, _latest: new Date(n.created_at).getTime() };
          byAct.set(n.activity_id, g);
        }
        if (new Date(n.created_at).getTime() > g._latest) { g._latest = new Date(n.created_at).getTime(); g.body = n.body; g.title = n.title; g.stage = n.stage; }
        if (!n.read) g.read = false;
        delete g._latest;
      } else plain.push(n);
    }
    const messages = [...plain, ...byAct.values()]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 30);
    res.json(ok({ messages, unread: unread.rows[0].c }));
  } catch (e) {
    console.error('[my.messages]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/my/activity-records —— 我的活动记录（预约/报名/通知阶段按活动归并，线性时间线）
// 供个人中心「活动记录」：每活动一卡，状态与阶段随 activities.kind 实时判定
router.get('/activity-records', async (req, res) => {
  try {
    const [acts, resv, signups, notifs] = await Promise.all([
      query(`SELECT id, kind, title FROM activities`),
      query(`SELECT activity_id, created_at FROM activity_reservations WHERE user_id=$1`, [req.user.id]),
      query(`SELECT activity_id, contact, created_at FROM activity_signups WHERE user_id=$1`, [req.user.id]),
      query(`SELECT activity_id, stage, title, created_at FROM notifications WHERE user_id=$1 AND activity_id<>'' ORDER BY created_at`, [req.user.id]),
    ]);
    const actMap = new Map(acts.rows.map((a) => [a.id, a]));
    const records = new Map();
    const stageText = (stage, n) => {
      const t = { reserve: '已预约（开启消息提醒）', signup: '已报名', pre_start: '收到开始前提醒' }[stage];
      return { stage: stage || 'notice', time: n.created_at, text: t || (n.title || '通知') };
    };
    const get = (id) => {
      let g = records.get(id);
      if (!g) {
        const a = actMap.get(id) || {};
        g = { activityId: id, title: a.title || '', kind: a.kind || 'upcoming', reserved: false, signedUp: false, contact: '', stages: [], _last: 0 };
        records.set(id, g);
      }
      return g;
    };
    for (const r of resv.rows) { const g = get(r.activity_id); g.reserved = true; const s = stageText('reserve', r); g.stages.push(s); g._last = Math.max(g._last, new Date(r.created_at).getTime()); }
    for (const s of signups.rows) { const g = get(s.activity_id); g.signedUp = true; g.contact = s.contact || ''; const st = stageText('signup', s); g.stages.push(st); g._last = Math.max(g._last, new Date(s.created_at).getTime()); }
    // 通知仅补「行的阶段之外」的阶段（pre_start 等），避免与已报名/已预约重复展示
    for (const n of notifs.rows) {
      if (n.stage === 'reserve' || n.stage === 'signup') continue;
      const g = get(n.activity_id); const st = stageText(n.stage, n); g.stages.push(st); g._last = Math.max(g._last, new Date(n.created_at).getTime());
    }
    // 同阶段只保留一条（行与通知时间级毫秒差造成的重复）
    for (const g of records.values()) {
      const seen = new Set();
      g.stages = g.stages.filter((s) => { const k = s.stage; if (seen.has(k)) return false; seen.add(k); return true; });
    }
    const out = [...records.values()].map((g) => {
      g.stages.sort((a, b) => new Date(a.time) - new Date(b.time));
      g.statusText = g.kind === 'current' ? '活动进行中' : g.kind === 'upcoming' ? '即将开展' : '已结束';
      delete g._last;
      return g;
    }).sort((a, b) => (b.stages.length ? new Date(b.stages[b.stages.length - 1].time) : 0) - (a.stages.length ? new Date(a.stages[a.stages.length - 1].time) : 0));
    res.json(ok({ records: out }));
  } catch (e) {
    console.error('[my.activity-records]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// POST /api/my/messages/read —— 标记已读：body {id?} 单条；缺省全部
router.post('/messages/read', async (req, res) => {
  const rules = { id: { type: 'number' } };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  try {
    const r = casted.id != null
      ? await query(`UPDATE notifications SET read=TRUE WHERE id=$1 AND user_id=$2`, [casted.id, req.user.id])
      : await query(`UPDATE notifications SET read=TRUE WHERE user_id=$1 AND read=FALSE`, [req.user.id]);
    res.json(ok({ updated: r.rowCount }));
  } catch (e) {
    console.error('[my.messages.read]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// 等级阈值（累计积分）：达到阈值即升级
const LEVELS = [
  { level: 1, min: 0, name: '新星社员' },
  { level: 2, min: 50, name: '活跃社员' },
  { level: 3, min: 150, name: '进阶创作者' },
  { level: 4, min: 300, name: '资深创作者' },
  { level: 5, min: 500, name: '社团先锋' },
  { level: 6, min: 800, name: '创新领航员' },
  { level: 7, min: 1200, name: 'AI 大师' },
];

function computeLevel(points) {
  let cur = LEVELS[0];
  let next = LEVELS[1] || null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
  }
  let progress = 100;
  if (next) {
    const span = next.min - cur.min;
    progress = Math.min(100, Math.round(((points - cur.min) / span) * 100));
  }
  return { level: cur.level, levelName: cur.name, levelMin: cur.min, nextLevelMin: next ? next.min : null, progress };
}

module.exports = router;
