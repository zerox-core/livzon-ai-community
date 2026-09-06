// server/routes/activities.js
// 活动：公开读（DB 聚合，与原 activities.json 同构 → 前端零改动）+ 预约写（登录态身份）。
// 横切约定：contract 信封 / db 唯一数据入口 / validate 松紧校验 / middleware-auth 鉴权
// 数据流：activities.json --import_activities.js--> activities 表（data JSONB 原样存）；
//         顶层元字段（updatedAt/intro/motto/types）暂以 json 为准（后台管理活动编辑落地前）。
const express = require('express');
const fs = require('fs');
const path = require('path');
const { query } = require('../db');
const { ok, err, ErrorCodes } = require('../contract');
const { checkRules } = require('../validate');
const { authRequired } = require('../middleware/auth');
const { userSnapshot } = require('../lib/community-core');
const { buildReminderCard } = require('../lib/reminders');
const { LarkClient } = require('../lark-client');

const router = express.Router();
const lark = new LarkClient(process.env);
const DATA_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'activities.json');

function readJsonMeta() {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    return {
      updatedAt: raw.updatedAt || '', intro: raw.intro || '', motto: raw.motto || '',
      types: raw.types || [], current: raw.current || [], upcoming: raw.upcoming || [], past: raw.past || [],
    };
  } catch (_) {
    return { updatedAt: '', intro: '', motto: '', types: [], current: [], upcoming: [], past: [] };
  }
}

// DB 聚合出与 json 同构的列表；DB 不可用/空表时回落 json（全仓优雅降级风格）
async function loadActivities() {
  try {
    const r = await query(`SELECT kind, data FROM activities ORDER BY kind, sort`);
    if (r.rows.length) {
      const meta = readJsonMeta();
      const groups = { current: [], upcoming: [], past: [] };
      for (const row of r.rows) {
        if (groups[row.kind]) groups[row.kind].push(row.data);
      }
      return { ...meta, ...groups, _source: 'db' };
    }
  } catch (e) {
    console.error('[activities.db]', e.message);
  }
  return { ...readJsonMeta(), _source: 'json' };
}

// GET /api/activities —— 列表（current/upcoming/past + types/motto 等顶层字段）
router.get('/', async (req, res) => {
  try {
    const data = await loadActivities();
    res.json(ok(data));
  } catch (e) {
    console.error('[activities.list]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/activities/:id —— 单活动详情（供「查看回顾」/预约校验复用）
router.get('/:id', async (req, res) => {
  try {
    const data = await loadActivities();
    const all = [...data.current, ...data.upcoming, ...data.past];
    const item = all.find((x) => String(x.id) === String(req.params.id));
    if (!item) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '活动不存在'));
    res.json(ok(item));
  } catch (e) {
    console.error('[activities.get]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/activities/:id/ics —— 生成 .ics 日历文件（飞书提醒卡片「加入日程」按钮指向它，公开无需登录）
// 依赖 activities.start_at；无 start_at 或活动不存在 → 404。
function icsEsc(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}
function icsDate(d) {
  return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}
router.get('/:id/ics', async (req, res) => {
  try {
    const r = await query(`SELECT id, title, date_label, location, data, start_at FROM activities WHERE id=$1`, [String(req.params.id || '').slice(0, 64)]);
    const a = r.rows[0];
    if (!a || !a.start_at) return res.status(404).send('not found');
    const start = new Date(a.start_at);
    const end = new Date(start.getTime() + 2 * 3600 * 1000); // 默认 2 小时
    const desc = (a.data && a.data.desc) || a.date_label || '';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Livzon AI Club//Activities//CN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:activity-' + a.id + '@livzon-ai',
      'DTSTAMP:' + icsDate(new Date()),
      'DTSTART:' + icsDate(start),
      'DTEND:' + icsDate(end),
      'SUMMARY:' + icsEsc('【丽珠 AI 社团】' + a.title),
      'LOCATION:' + icsEsc(a.location || ''),
      'DESCRIPTION:' + icsEsc(desc),
      'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(a.title), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="activity-${a.id}.ics"`);
    res.send(ics);
  } catch (e) {
    console.error('[activities.ics]', e);
    res.status(500).send('error');
  }
});

// 站内通知 + 飞书卡片确认（预约/报名成功共用；飞书失败仅记日志，站内兜底不阻断）
async function notifyAct(userId, openId, { type, stage, title, body, activityId, card }) {
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, link, activity_id, stage)
       VALUES ($1,$2,$3,$4,'#activities',$5,$6)`,
      [userId, type, title, body, activityId, stage]);
  } catch (e) { console.error('[activities.notify]', e.message); }
  if (openId && /^ou_/.test(String(openId)) && card) {
    const site = String(process.env.SITE_INTRANET_URL || '').replace(/\/+$/, '');
    const c = buildReminderCard({ title, activity_id: activityId, location: card.location || '' }, card.when || '', site, { header: card.header, foot: card.foot });
    const s = await lark.sendCardToUser(openId, c);
    if (!s.ok) console.error('[activities.card]', card.header, s.error);
  }
}

// POST /api/activities/:id/reserve —— 预约（authRequired；身份=登录态，姓名/部门快照落库）
// body: { note? }  ≤500；UNIQUE(user_id,activity_id) 幂等：重复提交 200 repeated，不报错不累积
router.post('/:id/reserve', authRequired, async (req, res) => {
  const id = String(req.params.id || '').slice(0, 64);
  const rules = { note: { type: 'string', max: 500 } };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  try {
    const a = await query(`SELECT id, kind, title FROM activities WHERE id=$1`, [id]);
    if (!a.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '活动不存在'));
    if (a.rows[0].kind !== 'upcoming') {
      return res.status(400).json(err(ErrorCodes.VALIDATION, '该活动不接受预约（已结束或为本期特展）'));
    }
    const snap = await userSnapshot(req);
    const r = await query(
      `INSERT INTO activity_reservations (activity_id, user_id, name, dept, note)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id, activity_id) DO NOTHING RETURNING id`,
      [id, req.session.userId, snap.name, snap.dept, casted.note || '']);
    if (!r.rows.length) {
      return res.json(ok({ reserved: true, repeated: true, message: '您已预约过该活动' }));
    }
    // 预约确认：站内通知(activity_id/stage 归并字段) + 飞书交互卡片
    const u = await query('SELECT open_id FROM users WHERE id=$1', [req.session.userId]);
    await notifyAct(req.session.userId, u.rows[0] && u.rows[0].open_id, {
      type: 'reserve', stage: 'reserve', activityId: id,
      title: '已收到您的预约',
      body: `活动「${a.rows[0].title}」预约成功，开始前将通过飞书通知您。`,
      card: { header: '预约成功', foot: '已登记，活动开始前将通过飞书提醒您。', when: '', location: '' },
    });
    res.status(201).json(ok({ reserved: true, repeated: false, message: '预约成功' }));
  } catch (e) {
    console.error('[activities.reserve]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// POST /api/activities/:id/signup —— 正式活动报名（authRequired；仅 kind='current' 可报）
// body: { name?, dept?, contact?, note? }  姓名/部门默认登录带出但允许覆写；contact=备用联系方式（选填）
// UNIQUE(user_id,activity_id) 幂等：重复提交 200 repeated
router.post('/:id/signup', authRequired, async (req, res) => {
  const id = String(req.params.id || '').slice(0, 64);
  const rules = {
    name:    { type: 'string', max: 50 },
    dept:    { type: 'string', max: 100 },
    contact: { type: 'string', max: 100 },
    note:    { type: 'string', max: 500 },
  };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  try {
    const a = await query(`SELECT id, kind, title, location, date_label FROM activities WHERE id=$1`, [id]);
    if (!a.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '活动不存在'));
    if (a.rows[0].kind !== 'current') {
      return res.status(400).json(err(ErrorCodes.VALIDATION, '该活动尚未开放正式报名（请预约消息通知）'));
    }
    const snap = await userSnapshot(req); // 姓名/部门登录带出，允许覆写（部门测试企业可能为空→手填）
    const r = await query(
      `INSERT INTO activity_signups (activity_id, user_id, name, dept, contact, note)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, activity_id) DO NOTHING RETURNING id`,
      [id, req.session.userId, (casted.name || '').trim() || snap.name, (casted.dept || '').trim() || snap.dept,
       (casted.contact || '').trim(), casted.note || '']);
    if (!r.rows.length) {
      return res.json(ok({ signedUp: true, repeated: true, message: '您已报名过该活动' }));
    }
    const u = await query('SELECT open_id FROM users WHERE id=$1', [req.session.userId]);
    await notifyAct(req.session.userId, u.rows[0] && u.rows[0].open_id, {
      type: 'signup', stage: 'signup', activityId: id,
      title: '报名成功',
      body: `活动「${a.rows[0].title}」报名成功，请准时参加。`,
      card: { header: '报名成功', foot: '已登记，请准时参加。', when: a.rows[0].date_label || '', location: a.rows[0].location || '' },
    });
    res.status(201).json(ok({ signedUp: true, repeated: false, message: '报名成功' }));
  } catch (e) {
    console.error('[activities.signup]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

module.exports = router;
