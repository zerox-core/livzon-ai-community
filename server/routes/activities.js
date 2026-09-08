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
const { userSnapshot, utf8Field } = require('../lib/community-core');
const { saveUploadedFile, createAsset, getAsset } = require('../lib/asset-store');
const { buildReminderCard } = require('../lib/reminders');
const { LarkClient } = require('../lark-client');
const { DEFAULT_PROFILE, sanitizeProfile, validateResponse } = require('../lib/signup-form');

const router = express.Router();
const lark = new LarkClient(process.env);
const DATA_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'activities.json');
const signupMaxMb = () => parseInt(process.env.ASSET_MAX_MB || '50', 10);

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

// GET /api/activities/:id/signup-form —— 该活动报名模板（公开；无配置返回默认模板）
router.get('/:id/signup-form', async (req, res) => {
  try {
    const id = String(req.params.id || '').slice(0, 64);
    const r = await query(`SELECT profile FROM activity_signup_forms WHERE activity_id=$1`, [id]);
    res.json(ok(sanitizeProfile(r.rows[0] && r.rows[0].profile) || DEFAULT_PROFILE()));
  } catch (e) {
    console.error('[activities.signup-form]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// 报名文件上传（通用，不限类型；去 work/kind/所有权绑定）→ {url,filename,size}
function getSignupUploadMw() {
  try {
    const multer = require('multer');
    return multer({ storage: multer.memoryStorage(), limits: { fileSize: signupMaxMb() * 1024 * 1024 } }).single('file');
  } catch (_) { return null; }
}
router.post('/:id/signup/upload', authRequired, (req, res) => {
  const mw = getSignupUploadMw();
  if (!mw) return res.status(501).json(err(ErrorCodes.MOCK_UNAVAILABLE, '上传未启用：请在 server/ 执行 npm install multer'));
  mw(req, res, async (e) => {
    if (e) return res.status(400).json(err(ErrorCodes.VALIDATION, e.code === 'LIMIT_FILE_SIZE' ? `文件超过 ${signupMaxMb()}MB 上限` : e.message));
    const f = req.file;
    if (!f) return res.status(400).json(err(ErrorCodes.VALIDATION, '缺少文件字段 file'));
    const orig = utf8Field(String(f.originalname || '')).slice(0, 255).replace(/[\\/:*?"<>|\r\n]/g, '_');
    try {
      // 走资产子系统：统一落盘 /uploads/assets/<cat>/ + 登记 assets 行（category 按扩展名自动推断）
      const saved = saveUploadedFile(f.buffer, { origname: orig });
      const asset = await createAsset({
        user_id: req.session.userId,
        category: saved.category,
        backend: 'local',
        kind: saved.kind || 'file',
        name: saved.name,
        size: f.size,
        storage_url: saved.url,
        source: 'signup:' + id,
      });
      res.status(201).json(ok({ url: saved.url, filename: saved.name, size: saved.size, assetId: asset.id }));
    } catch (e2) {
      if (e2.status === 400) return res.status(400).json(err(ErrorCodes.VALIDATION, e2.message));
      console.error('[activities.signup.upload]', e2);
      res.status(500).json(err(ErrorCodes.INTERNAL, '文件写入失败'));
    }
  });
});

// POST /api/activities/:id/signup —— 正式活动报名（authRequired；仅 kind='current' 可报）
// body: { contact?, upload?, response? }  姓名/部门自动取登录态（不二次填）；字段按活动模板 profile 校验
router.post('/:id/signup', authRequired, async (req, res) => {
  const id = String(req.params.id || '').slice(0, 64);
  const body = req.body || {};
  const rules = { contact: { type: 'string', max: 100 }, assetId: { type: 'string', max: 64 } };
  const { valid, errors, casted } = checkRules(body, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  try {
    const a = await query(`SELECT id, kind, title, location, date_label FROM activities WHERE id=$1`, [id]);
    if (!a.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '活动不存在'));
    if (a.rows[0].kind !== 'current') {
      return res.status(400).json(err(ErrorCodes.VALIDATION, '该活动尚未开放正式报名（请预约消息通知）'));
    }
    const pf = await query(`SELECT profile FROM activity_signup_forms WHERE activity_id=$1`, [id]);
    const profile = sanitizeProfile(pf.rows[0] && pf.rows[0].profile) || DEFAULT_PROFILE();
    // 校验必填自定义字段（字段不存在=用默认模板则允许任意 response，宽松）
    if (profile.fields && profile.fields.length) {
      const vr = validateResponse(profile, body.response);
      if (!vr.valid) return res.status(400).json(err(ErrorCodes.VALIDATION, vr.errors.join('；')));
    }
    if (profile.team && profile.team.enabled && !String(body.response && body.response.__team || '').trim()) {
      return res.status(400).json(err(ErrorCodes.VALIDATION, `「${profile.team.label}」为必填`));
    }
    const snap = await userSnapshot(req);
    // 部门兜底：历史用户 department 存的是部门 ID → 惰性解析为部门名（成功即回写；失败不阻断报名）
    if (snap.dept && !/[\u4e00-\u9fff]/.test(snap.dept)) {
      try {
        const dn = await lark.getDepartmentName(snap.dept);
        if (dn) { snap.dept = dn; await query('UPDATE users SET department=$1 WHERE id=$2', [dn, req.session.userId]); }
      } catch (_) {}
    }
    // 作品二选一：assetId（从「我的作品」选）优先；直传 upload 兼容旧路径。快照由服务端回读重建，不信任客户端。
    let assetId = '';
    let upload = body.upload && typeof body.upload === 'object'
      ? { filename: String(body.upload.filename || '').slice(0, 255), size: Number(body.upload.size) || 0, storage_url: String(body.upload.url || '').slice(0, 500) }
      : {};
    if (casted.assetId) {
      const a2 = await getAsset(casted.assetId);
      if (!a2 || a2.user_id !== req.session.userId) {
        return res.status(400).json(err(ErrorCodes.VALIDATION, '所选作品不存在或不属于当前用户'));
      }
      assetId = a2.id;
      upload = { filename: String(a2.name || '').slice(0, 255), size: Number(a2.size) || 0, storage_url: String(a2.storage_url || a2.remote_url || '').slice(0, 500) };
    }
    if (profile.needUpload && !upload.storage_url) {
      return res.status(400).json(err(ErrorCodes.VALIDATION, '请上传作品文件'));
    }
    const response = body.response && typeof body.response === 'object' ? body.response : {};
    const r = await query(
      `INSERT INTO activity_signups (activity_id, user_id, name, dept, contact, note, upload, response, asset_id)
       VALUES ($1,$2,$3,$4,$5,'',$6,$7,$8)
       ON CONFLICT (user_id, activity_id) DO NOTHING RETURNING id`,
      [id, req.session.userId, snap.name, snap.dept, (casted.contact || '').trim(), JSON.stringify(upload), JSON.stringify(response), assetId || null]);
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


// ===== v32 活动投信口 =====
// POST /api/activities/:id/letters —— 投信（authRequired；multipart：note + origname + 可选 file）
// 私信通道：不进公开接口、不发 notifications，仅管理员后台汇总（GET /api/admin/activities/letters）。
// 留言语义：一人可多次投信（与 reserve 的幂等预约不同）。附件走资产子系统落 public/uploads/assets/。
const LETTER_EXT = new Set([
  'zip', 'tar', 'gz', 'tgz', 'rar', '7z',
  'mp4', 'mov', 'webm', 'mp3', 'wav',
  'pdf', 'docx', 'xlsx', 'pptx', 'txt', 'md',
  'png', 'jpg', 'jpeg', 'gif', 'webp',
  'json', 'js', 'ts', 'py', 'csv', 'html',
]);
function getLetterUploadMw() {
  try {
    const multer = require('multer'); // 懒加载：未装依赖服务器照常启动（与 artifacts/community 同款降级）
    return multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }).single('file');
  } catch (_) {
    return null;
  }
}
router.post('/:id/letters', authRequired, (req, res) => {
  const mw = getLetterUploadMw();
  if (!mw) return res.status(501).json(err(ErrorCodes.MOCK_UNAVAILABLE, '上传未启用：请在 server/ 执行 npm install multer'));
  mw(req, res, async (e) => { // multipart 文本字段由 multer 解析后才进 req.body，校验放回调内
    if (e) return res.status(400).json(err(ErrorCodes.VALIDATION, e.code === 'LIMIT_FILE_SIZE' ? '文件超过 20MB 上限' : e.message));
    const id = String(req.params.id || '').slice(0, 64);
    const note = String((req.body || {}).note || '').trim().slice(0, 1000);
    const origname = String((req.body || {}).origname || '').trim().slice(0, 255);
    const f = req.file || null;
    if (!note && !f) return res.status(400).json(err(ErrorCodes.VALIDATION, '留言与文件至少投递一项'));
    try {
      const a = await query(`SELECT id FROM activities WHERE id=$1`, [id]);
      if (!a.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '活动不存在'));
      let fileName = '', size = 0, storageUrl = '', assetId = null;
      if (f) {
        const orig = (origname || utf8Field(String(f.originalname || ''))).slice(0, 255);
        const ext = (path.extname(orig).toLowerCase().replace(/^\./, '')) || '';
        if (!LETTER_EXT.has(ext)) return res.status(400).json(err(ErrorCodes.VALIDATION, `不支持的文件类型：${ext || '未知'}`));
        // 走资产子系统：统一落盘 /uploads/assets/<cat>/ + 登记 assets 行
        const saved = saveUploadedFile(f.buffer, { origname: orig });
        const asset = await createAsset({
          user_id: req.session.userId,
          category: saved.category,
          backend: 'local',
          kind: saved.kind || 'file',
          name: saved.name,
          size: f.size,
          storage_url: saved.url,
        });
        fileName = saved.name; size = f.size; storageUrl = saved.url; assetId = asset.id;
      }
      const snap = await userSnapshot(req);
      const r = await query(
        `INSERT INTO activity_letters (activity_id, user_id, name, dept, note, file_name, file_size, storage_url, asset_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, created_at`,
        [id, req.session.userId, snap.name, snap.dept, note, fileName, size, storageUrl, assetId]);
      res.status(201).json(ok({ id: r.rows[0].id, delivered: true }));
    } catch (e2) {
      console.error('[activities.letters]', e2);
      res.status(500).json(err(ErrorCodes.INTERNAL));
    }
  });
});

module.exports = router;
