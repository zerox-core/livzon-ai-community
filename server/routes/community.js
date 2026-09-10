// server/routes/community.js
// 社团社区：帖子流 / 评论（无限层级）/ 点赞 / 软删 / 媒体上传 / config
// 契约：docs/api/posts-api.md v3（前端调用点以 public/app.js CommunitySection 实测为准）
// 横切约定：contract 信封 / db 唯一数据入口 / validate 松紧校验 / middleware-auth 鉴权
const express = require('express');
const fs = require('fs');
const path = require('path');
const { query } = require('../db');
const { ok, err, ErrorCodes } = require('../contract');
const { checkRules } = require('../validate');
const { authRequired } = require('../middleware/auth');
const { genId, fmtTime, userSnapshot, likeToggleSQL, utf8Field } = require('../lib/community-core');
const { saveUploadedFile, createAsset } = require('../lib/asset-store');
const { LarkClient } = require('../lark-client');

const router = express.Router();
const lark = new LarkClient(process.env);

// ==================== 站内信 + 飞书推送（通知统一出口） ====================
// 写 notifications 站内信；若用户绑定过飞书 open_id，再尽力推一条机器人单聊（失败不影响主流程）
async function notifyUser(userId, type, title, body, link) {
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, link, read, created_at)
       VALUES ($1,$2,$3,$4,$5,FALSE,now())`,
      [userId, type, String(title || '').slice(0, 100), String(body || '').slice(0, 300), String(link || '')]);
  } catch (e) {
    console.error('[community.notify]', e);
    return;
  }
  try {
    const u = await query('SELECT open_id FROM users WHERE id=$1', [userId]);
    const openId = u.rows[0] && u.rows[0].open_id;
    if (openId && /^ou_/.test(String(openId))) {
      // 尽力而为：飞书推送失败仅记日志，不阻塞业务响应
      lark.sendTextToUser(openId, '【丽珠 AI · 社团社区】' + title + '\n' + body + '\n（打开社团社区 → 消息中心查看）')
        .then((r) => { if (!r.ok) console.error('[community.notify.lark]', r.error); })
        .catch((e) => console.error('[community.notify.lark]', e.message));
    }
  } catch (e) { console.error('[community.notify.lark]', e); }
}

const SECTION_POST = ['resource', 'tutorial', 'qa', 'chat'];   // 发帖分区（featured 为管理侧，v7）
const TAGS = ['featured', 'tutorial', 'resource'];
const IMG_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const DOC_EXT = new Set(['pdf', 'xlsx', 'docx', 'zip', 'pptx', 'txt', 'md']);

// 列表行 → 契约 post 形状（前端 CommunitySection 渲染/轮询依赖的字段集）
function mapPost(r) {
  return {
    id: r.id,
    author: r.author,
    dept: r.dept || '',
    text: r.text,
    time: fmtTime(r.created_at),
    likes: r.likes | 0,
    liked: !!r.liked,
    pinned: !!r.pinned,
    tag: r.tag || null,
    commentCount: Number(r.comment_count || 0),
    work: r.work || null,
    images: r.images || [],
    attachments: r.attachments || [],
    section: r.section || 'chat',
  };
}

// ==================== 读：时间线 ====================

// LEFT JOIN LATERAL 计评论数；score = (1+likes+2*commentCount)*exp(-ageHours/36)（契约权威公式，129600=36h 秒）
const POST_COLS = `p.*, COALESCE(cc.c,0) AS comment_count,
  (1 + p.likes + 2 * COALESCE(cc.c,0)) * EXP(-EXTRACT(EPOCH FROM (now() - p.created_at)) / 129600.0) AS score,
  EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) AS liked`;
const CC_JOIN = `LEFT JOIN LATERAL (SELECT count(*) AS c FROM comments cm WHERE cm.post_id = p.id AND cm.deleted = FALSE) cc ON TRUE`;

// GET /api/community/posts —— 时间线（含置顶）。无鉴权（liked 按登录态）
// query: sort=top|new, limit(30,≤100), cursor, after_id, section, q
router.get('/posts', async (req, res) => {
  const me = (req.session && req.session.userId) || null;
  const sort = req.query.sort === 'new' ? 'new' : 'top';
  let limit = parseInt(req.query.limit, 10) || 30;
  limit = Math.min(Math.max(limit, 1), 100);
  const { section, q, after_id, cursor } = req.query;

  const where = ['p.deleted = FALSE'];
  const vals = [me]; // $1 = viewer（供 liked EXISTS）
  let n = 1;
  if (section && section !== 'all') { where.push(`p.section = $${++n}`); vals.push(section); }
  if (q) { where.push(`(p.text ILIKE $${++n} OR p.author ILIKE $${n})`); vals.push('%' + String(q).slice(0, 50) + '%'); }
  const W = where.join(' AND ');

  try {
    let rows;
    if (after_id) {
      // 增量：只返回该帖之后（created_at 更新）的帖子，时间正序
      const r = await query(
        `SELECT ${POST_COLS.replace('AS liked', 'AS liked')} FROM posts p ${CC_JOIN}
         WHERE ${W} AND p.created_at > (SELECT created_at FROM posts WHERE id = $${++n})
         ORDER BY p.created_at ASC LIMIT $${++n}`,
        [...vals, String(after_id), limit]);
      return res.json(ok({ posts: r.rows.map(mapPost), nextCursor: null }));
    }
    if (sort === 'top') {
      const off = Math.max(parseInt(cursor, 10) || 0, 0);
      const r = await query(
        `SELECT ${POST_COLS} FROM posts p ${CC_JOIN}
         WHERE ${W}
         ORDER BY p.pinned DESC, score DESC, p.created_at DESC
         LIMIT $${++n} OFFSET $${++n}`,
        [...vals, limit, off]);
      rows = r.rows;
      return res.json(ok({
        posts: rows.map(mapPost),
        nextCursor: rows.length === limit ? String(off + rows.length) : null,
      }));
    }
    // new：置顶在前，其余 created_at 键集分页（cursor = "<ms>|<id>"）
    let keyset = '';
    const pvals = [...vals];
    if (cursor) {
      const [msStr, idStr] = String(cursor).split('|');
      const ms = parseInt(msStr, 10);
      if (Number.isFinite(ms) && idStr) {
        keyset = `AND (p.created_at, p.id) < (to_timestamp($${++n} / 1000.0), $${++n})`;
        pvals.push(ms, String(idStr).slice(0, 64));
      }
    }
    const r = await query(
      `SELECT ${POST_COLS} FROM posts p ${CC_JOIN}
       WHERE ${W} ${keyset}
       ORDER BY p.pinned DESC, p.created_at DESC, p.id DESC
       LIMIT $${++n}`,
      [...pvals, limit]);
    rows = r.rows;
    const last = rows.length === limit && rows[rows.length - 1];
    return res.json(ok({
      posts: rows.map(mapPost),
      nextCursor: last ? `${new Date(last.created_at).getTime()}|${last.id}` : null,
    }));
  } catch (e) {
    console.error('[community.posts]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/community/posts/:id —— 单帖详情（详情页深链/刷新用）。无鉴权（liked 按登录态）
router.get('/posts/:id', async (req, res) => {
  const me = (req.session && req.session.userId) || null;
  try {
    const r = await query(
      `SELECT ${POST_COLS} FROM posts p ${CC_JOIN} WHERE p.deleted = FALSE AND p.id = $2`,
      [me, String(req.params.id)]);
    if (!r.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '帖子不存在'));
    res.json(ok({ post: mapPost(r.rows[0]) }));
  } catch (e) {
    console.error('[community.post.get]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/community/posts/:id/comments —— 扁平全层级列表（前端组树）。无鉴权
router.get('/posts/:id/comments', async (req, res) => {
  const me = (req.session && req.session.userId) || null;
  try {
    const r = await query(
      `SELECT c.*, EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2) AS liked
       FROM comments c
       WHERE c.post_id = $1 AND c.deleted = FALSE
       ORDER BY c.created_at ASC, c.id ASC LIMIT 500`,
      [String(req.params.id), me]);
    const comments = r.rows.map((c) => ({
      id: c.id, post_id: c.post_id, parent_id: c.parent_id || null,
      author: c.author, dept: c.dept || '', text: c.text,
      time: fmtTime(c.created_at), likes: c.likes | 0, liked: !!c.liked,
    }));
    res.json(ok({ comments }));
  } catch (e) {
    console.error('[community.comments.get]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/community/config —— 公告 + 轮播 + 分区（失败由前端回落 SEED）
router.get('/config', async (req, res) => {
  try {
    const r = await query('SELECT data FROM community_config WHERE id = 1');
    const d = (r.rows[0] && r.rows[0].data) || {};
    res.json(ok({
      announcement: d.announcement || null,
      banners: Array.isArray(d.banners) ? d.banners : [],
      sections: Array.isArray(d.sections) ? d.sections : [],
    }));
  } catch (e) {
    console.error('[community.config]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// ==================== 写：发帖 ====================

// 媒体数组净化：非法形状静默丢弃该条（松校验，URL 已由 upload 端点把关来源）
function sanitizeImages(v) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 9).map((x) => x && typeof x === 'object' && typeof x.url === 'string' && x.url.length <= 500
    ? { url: x.url, name: String(x.name || '').slice(0, 100) } : null).filter(Boolean);
}
function sanitizeAttachments(v) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 5).map((x) => x && typeof x === 'object' && typeof x.url === 'string' && x.url.length <= 500
    ? { url: x.url, name: String(x.name || '').slice(0, 255), size: Number(x.size) || 0 } : null).filter(Boolean);
}

// POST /api/community/posts —— 发帖（要求登录）
// body: { content, section?, images?, attachments?, work_id? }
router.post('/posts', authRequired, async (req, res) => {
  const body = req.body || {};
  const rules = {
    content:  { required: true, type: 'string', max: 2000 },
    section:  { type: 'string', enum: SECTION_POST.concat(['featured']) }, // featured 单独报 400（v7 契约）
    work_id:  { type: 'number' },
  };
  const { valid, errors, casted } = checkRules(body, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  if (casted.section === 'featured') {
    return res.status(400).json(err(ErrorCodes.VALIDATION, '发帖不支持精华分区（由管理员归类）'));
  }

  const images = sanitizeImages(body.images);
  const attachments = sanitizeAttachments(body.attachments);
  if (Array.isArray(body.images) && body.images.length > 9) return res.status(400).json(err(ErrorCodes.VALIDATION, '图片最多 9 张'));
  if (Array.isArray(body.attachments) && body.attachments.length > 5) return res.status(400).json(err(ErrorCodes.VALIDATION, '附件最多 5 个'));
  if (!casted.content && !images.length && !attachments.length) {
    return res.status(400).json(err(ErrorCodes.VALIDATION, '帖子不能为空'));
  }

  try {
    // 引用的作品：须存在且对本人可见（已发布，或本人上传的待审作品）；work 存快照
    let workId = null, work = null;
    if (casted.work_id != null) {
      const w = await query(
        `SELECT id, kind, title, description, source FROM works WHERE id=$1 AND (published=true OR user_id=$2)`,
        [casted.work_id, req.session.userId]);
      if (!w.rows.length) return res.status(400).json(err(ErrorCodes.VALIDATION, '引用的作品不存在或不可见'));
      workId = w.rows[0].id;
      work = { id: w.rows[0].id, kind: w.rows[0].kind, title: w.rows[0].title, description: w.rows[0].description, source: w.rows[0].source };
    }
    const snap = await userSnapshot(req);
    const id = genId('p');
    const r = await query(
      `INSERT INTO posts (id, user_id, author, dept, text, section, work_id, work, images, attachments, pinned, tag, likes, deleted, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,FALSE,NULL,0,FALSE,now()) RETURNING *`,
      [id, req.session.userId, snap.name, snap.dept, casted.content, casted.section || 'chat',
       workId, work ? JSON.stringify(work) : null, JSON.stringify(images), JSON.stringify(attachments)]);
    const row = r.rows[0];
    res.status(201).json(ok({ post: { ...mapPost(row), commentCount: 0, liked: false } }));
  } catch (e) {
    console.error('[community.posts.post]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// ==================== 写：评论 ====================

// POST /api/community/posts/:id/comments —— 发评论/回复（要求登录；parent 不限层级，v9）
router.post('/posts/:id/comments', authRequired, async (req, res) => {
  const rules = {
    content:   { required: true, type: 'string', max: 500 },
    parent_id: { type: 'string', max: 64 },
  };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  const postId = String(req.params.id);
  try {
    const p = await query('SELECT id, user_id FROM posts WHERE id=$1 AND deleted=FALSE', [postId]);
    if (!p.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '帖子不存在'));
    let parentAuthorId = null;
    if (casted.parent_id) {
      const par = await query('SELECT id, user_id FROM comments WHERE id=$1 AND post_id=$2 AND deleted=FALSE', [casted.parent_id, postId]);
      if (!par.rows.length) return res.status(400).json(err(ErrorCodes.VALIDATION, '回复的评论不存在'));
      parentAuthorId = par.rows[0].user_id || null;
    }
    const snap = await userSnapshot(req);
    const id = genId('c');
    const r = await query(
      `INSERT INTO comments (id, post_id, parent_id, user_id, author, dept, text, likes, deleted, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,0,FALSE,now()) RETURNING *`,
      [id, postId, casted.parent_id || null, req.session.userId, snap.name, snap.dept, casted.content]);
    const c = r.rows[0];
    // 消息中心 + 飞书同步：帖子作者（非本人）收到「评论」通知；被回复人（非本人且非帖子作者）收到「回复」通知
    const postAuthorId = p.rows[0].user_id || null;
    const ctext = String(casted.content || '').slice(0, 80);
    if (postAuthorId && postAuthorId !== req.session.userId) {
      notifyUser(postAuthorId, 'reply', snap.name + ' 评论了你的帖子', ctext, 'community').catch(() => {});
    }
    if (parentAuthorId && parentAuthorId !== req.session.userId && parentAuthorId !== postAuthorId) {
      notifyUser(parentAuthorId, 'reply', snap.name + ' 回复了你的评论', ctext, 'community').catch(() => {});
    }
    res.status(201).json(ok({ comment: {
      id: c.id, post_id: c.post_id, parent_id: c.parent_id || null,
      author: c.author, dept: c.dept || '', text: c.text,
      time: fmtTime(c.created_at), likes: 0,
    } }));
  } catch (e) {
    console.error('[community.comments.post]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// ==================== 写：点赞（单语句原子 toggle，likeToggleSQL 见 lib/community-core） ====================

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', authRequired, async (req, res) => {
  try {
    const p = await query('SELECT id FROM posts WHERE id=$1 AND deleted=FALSE', [String(req.params.id)]);
    if (!p.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '帖子不存在'));
    const r = await query(likeToggleSQL('post_likes', 'post_id', 'posts'), [String(req.params.id), req.session.userId]);
    res.json(ok({ likes: r.rows[0].likes, liked: !!r.rows[0].liked }));
  } catch (e) {
    console.error('[community.post.like]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// POST /api/community/posts/:id/comments/:cid/like
router.post('/posts/:id/comments/:cid/like', authRequired, async (req, res) => {
  try {
    const c = await query('SELECT id FROM comments WHERE id=$1 AND post_id=$2 AND deleted=FALSE',
      [String(req.params.cid), String(req.params.id)]);
    if (!c.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '评论不存在'));
    const r = await query(likeToggleSQL('comment_likes', 'comment_id', 'comments'), [String(req.params.cid), req.session.userId]);
    res.json(ok({ likes: r.rows[0].likes, liked: !!r.rows[0].liked }));
  } catch (e) {
    console.error('[community.cmt.like]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// ==================== 写：软删（本人或管理员） ====================

async function doSoftDelete(req, res, table, idCol) {
  const me = req.session.userId;
  const isAdmin = req.session.role === 'admin';
  try {
    const r = await query(`SELECT user_id FROM ${table} WHERE id=$1 AND deleted=FALSE`, [String(req.params.id)]);
    if (!r.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '内容不存在'));
    // 种子内容 user_id 为 NULL：仅管理员可删
    if (!isAdmin && r.rows[0].user_id !== me) return res.status(403).json(err(ErrorCodes.PERMISSION, '只能删除自己的内容'));
    await query(`UPDATE ${table} SET deleted=TRUE WHERE id=$1`, [String(req.params.id)]);
    res.json(ok({}));
  } catch (e) {
    console.error(`[community.delete.${table}]`, e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
}

// DELETE /api/community/posts/:id
router.delete('/posts/:id', authRequired, (req, res) => doSoftDelete(req, res, 'posts', 'id'));

// 契约路径别名：DELETE /api/comments/:id（server.js 挂载）
const deleteComment = [authRequired, (req, res) => doSoftDelete(req, res, 'comments', 'id')];

// ==================== 写：媒体上传 ====================

// multer 懒加载：未安装依赖时服务器仍照常启动，仅上传端点返回友好提示（与全仓"优雅降级"风格一致）
function getUploadMw() {
  try {
    const multer = require('multer');
    return multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }).single('file');
  } catch (_) {
    return null;
  }
}

// POST /api/community/upload —— multipart，字段名 file（要求登录）
router.post('/upload', authRequired, (req, res) => {
  const mw = getUploadMw();
  if (!mw) return res.status(501).json(err(ErrorCodes.MOCK_UNAVAILABLE, '上传未启用：请在 server/ 执行 npm install multer'));
  mw(req, res, async (e) => {
    if (e) return res.status(400).json(err(ErrorCodes.VALIDATION, e.message));
    const f = req.file;
    if (!f) return res.status(400).json(err(ErrorCodes.VALIDATION, '缺少文件字段 file'));
    const orig = utf8Field(String(f.originalname || '')).slice(0, 255);
    const ext = (path.extname(orig).toLowerCase().replace(/^\./, '')) || '';
    const isImg = IMG_EXT.has(ext);
    const isDoc = DOC_EXT.has(ext);
    if (!isImg && !isDoc) {
      return res.status(400).json(err(ErrorCodes.VALIDATION, `不支持的文件类型：${ext || '未知'}`));
    }
    if (isImg && f.size > 5 * 1024 * 1024) return res.status(400).json(err(ErrorCodes.VALIDATION, '图片不能超过 5MB'));
    if (isDoc && f.size > 20 * 1024 * 1024) return res.status(400).json(err(ErrorCodes.VALIDATION, '附件不能超过 20MB'));
    try {
      // 跨端复用 asset-store：统一落盘 public/uploads/assets/<category>/ + 登记 assets 表
      const saved = saveUploadedFile(f.buffer, {
        category: isImg ? 'media' : 'doc',
        kind: isImg ? 'image' : 'doc',
        origname: orig,
      });
      await createAsset({
        user_id: req.session.userId,
        category: saved.category,
        backend: 'local',
        kind: saved.kind,
        name: saved.name,
        size: saved.size,
        storage_url: saved.url,
      });
      // 保持既有响应形状（前端 app.js 读 data.url）；跨端复用已落盘 + 登记
      res.json(ok({ url: saved.url, name: saved.name, size: saved.size }));
    } catch (e2) {
      console.error('[community.upload]', e2);
      res.status(500).json(err(ErrorCodes.INTERNAL, '文件写入失败'));
    }
  });
});

// ==================== 管理侧（由 admin.js 挂 adminRequired 后复用） ====================

// POST /api/admin/community/posts/:id/pin —— 置顶/取消 + 归类（tag 同步写 section）
const pinHandler = async (req, res) => {
  const rules = {
    pinned: { required: true, type: 'boolean' },
    tag:    { type: 'string', enum: TAGS },
  };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  if (casted.pinned && !casted.tag) return res.status(400).json(err(ErrorCodes.VALIDATION, '置顶须带 tag：featured/tutorial/resource'));
  try {
    const r = await query('SELECT id FROM posts WHERE id=$1 AND deleted=FALSE', [String(req.params.id)]);
    if (!r.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '帖子不存在'));
    const tag = casted.pinned ? casted.tag : null;
    // 置顶打标同步归类：历史帖无 section 时按 tag 补写（契约 v7 建议）
    const u = await query(
      `UPDATE posts SET pinned=$1, tag=$2,
         section = CASE WHEN $1 AND (section IS NULL OR section='') THEN COALESCE($2,'chat') ELSE section END
       WHERE id=$3 RETURNING *`,
      [!!casted.pinned, tag, String(req.params.id)]);
    const row = u.rows[0];
    res.json(ok({ post: { ...mapPost(row), commentCount: 0, liked: false } }));
  } catch (e) {
    console.error('[community.pin]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
};

// PUT /api/admin/community/config —— 公告/轮播/分区可运营
const configPutHandler = async (req, res) => {
  const body = req.body || {};
  const data = {
    announcement: body.announcement && typeof body.announcement.text === 'string'
      ? { text: String(body.announcement.text).slice(0, 500), author: String(body.announcement.author || '').slice(0, 50), time: String(body.announcement.time || '').slice(0, 30) }
      : null,
    banners: Array.isArray(body.banners) ? body.banners.slice(0, 10).filter((b) => b && typeof b.image === 'string') : [],
    sections: Array.isArray(body.sections) ? body.sections.slice(0, 20).filter((s) => s && typeof s.key === 'string' && typeof s.label === 'string') : [],
  };
  try {
    await query(
      `INSERT INTO community_config (id, data, updated_at) VALUES (1,$1,now())
       ON CONFLICT (id) DO UPDATE SET data=$1, updated_at=now()`,
      [JSON.stringify(data)]);
    res.json(ok(data));
  } catch (e) {
    console.error('[community.config.put]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
};


// ==================== 消息中心：我的帖子 + 私聊（站内信 / 飞书同步） ====================

// GET /api/community/my/overview —— 我的帖子 + 每帖最近 5 条评论（消息中心「我的帖子」页）
router.get('/my/overview', authRequired, async (req, res) => {
  const me = req.session.userId;
  try {
    const r = await query(
      `SELECT ${POST_COLS} FROM posts p ${CC_JOIN}
       WHERE p.deleted = FALSE AND p.user_id = $2
       ORDER BY p.created_at DESC LIMIT 50`,
      [me, me]);
    const posts = [];
    const byId = new Map();
    for (const row of r.rows) {
      const post = mapPost(row);
      post.comments = [];
      posts.push(post);
      byId.set(post.id, post);
    }
    if (posts.length) {
      const c = await query(
        `SELECT * FROM (
           SELECT c.*, ROW_NUMBER() OVER (PARTITION BY c.post_id ORDER BY c.created_at DESC) AS rn
           FROM comments c
           WHERE c.post_id = ANY($1::text[]) AND c.deleted = FALSE
         ) t WHERE rn <= 5 ORDER BY created_at ASC`,
        [posts.map((x) => x.id)]);
      for (const row of c.rows) {
        const post = byId.get(row.post_id);
        if (post) post.comments.push({
          id: row.id, author: row.author, dept: row.dept || '',
          text: row.text, time: fmtTime(row.created_at), likes: row.likes | 0,
        });
      }
    }
    res.json(ok({ posts }));
  } catch (e) {
    console.error('[community.my.overview]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/community/dm/users —— 可私聊社员列表（排除自己；最近聊过的排前面）
router.get('/dm/users', authRequired, async (req, res) => {
  const me = req.session.userId;
  try {
    const r = await query(
      `SELECT u.id, u.name, u.department
       FROM users u
       WHERE u.id <> $1 AND u.name <> ''
       ORDER BY (SELECT max(d.created_at) FROM direct_messages d
                 WHERE (d.sender_id=u.id AND d.receiver_id=$1) OR (d.sender_id=$1 AND d.receiver_id=u.id)) DESC NULLS LAST,
                u.name ASC
       LIMIT 100`, [me]);
    res.json(ok({ users: r.rows.map((u) => ({ id: u.id, name: u.name, dept: u.department || '' })) }));
  } catch (e) {
    console.error('[community.dm.users]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/community/dm/conversations —— 私聊会话列表（最后一条摘要 + 未读数）
router.get('/dm/conversations', authRequired, async (req, res) => {
  const me = req.session.userId;
  try {
    const r = await query(
      `SELECT * FROM (
         SELECT DISTINCT ON (peer_id) peer_id, text, sender_id, created_at
         FROM (
           SELECT CASE WHEN sender_id=$1 THEN receiver_id ELSE sender_id END AS peer_id,
                  text, sender_id, created_at
           FROM direct_messages WHERE sender_id=$1 OR receiver_id=$1
         ) t ORDER BY peer_id, created_at DESC
       ) m
       JOIN users u ON u.id = m.peer_id
       ORDER BY m.created_at DESC LIMIT 50`, [me]);
    const unreadR = await query(
      `SELECT sender_id, count(*)::int AS c FROM direct_messages
       WHERE receiver_id=$1 AND read=FALSE GROUP BY sender_id`, [me]);
    const unreadMap = new Map(unreadR.rows.map((x) => [x.sender_id, x.c]));
    res.json(ok({ conversations: r.rows.map((row) => ({
      userId: row.peer_id,
      name: row.name || '社员',
      dept: row.department || '',
      lastText: String(row.text || '').slice(0, 60),
      lastFromMe: row.sender_id === me,
      time: fmtTime(row.created_at),
      unread: unreadMap.get(row.peer_id) || 0,
    })) }));
  } catch (e) {
    console.error('[community.dm.conversations]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/community/dm/with/:uid —— 与某人的私聊记录（最近 100 条，顺带把对方发来的标记已读）
router.get('/dm/with/:uid', authRequired, async (req, res) => {
  const me = req.session.userId;
  const other = parseInt(req.params.uid, 10);
  if (!Number.isInteger(other) || other <= 0 || other === me) {
    return res.status(400).json(err(ErrorCodes.VALIDATION, '无效的私聊对象'));
  }
  try {
    const u = await query('SELECT id, name, department FROM users WHERE id=$1', [other]);
    if (!u.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '用户不存在'));
    const r = await query(
      `SELECT id, sender_id, receiver_id, text, created_at FROM direct_messages
       WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY created_at DESC LIMIT 100`, [me, other]);
    await query(`UPDATE direct_messages SET read=TRUE WHERE sender_id=$1 AND receiver_id=$2 AND read=FALSE`, [other, me]);
    res.json(ok({
      user: { id: u.rows[0].id, name: u.rows[0].name || '社员', dept: u.rows[0].department || '' },
      messages: r.rows.reverse().map((m) => ({
        id: m.id, fromMe: m.sender_id === me, text: m.text, time: fmtTime(m.created_at),
      })),
    }));
  } catch (e) {
    console.error('[community.dm.history]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// POST /api/community/dm/with/:uid —— 发送私聊（站内信 + 飞书推送同步给收件人）
router.post('/dm/with/:uid', authRequired, async (req, res) => {
  const rules = { content: { required: true, type: 'string', max: 1000 } };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  const me = req.session.userId;
  const other = parseInt(req.params.uid, 10);
  if (!Number.isInteger(other) || other <= 0 || other === me) {
    return res.status(400).json(err(ErrorCodes.VALIDATION, '无效的私聊对象'));
  }
  try {
    const u = await query('SELECT id FROM users WHERE id=$1', [other]);
    if (!u.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '用户不存在'));
    const snap = await userSnapshot(req);
    const id = genId('d');
    const r = await query(
      `INSERT INTO direct_messages (id, sender_id, receiver_id, text, read, created_at)
       VALUES ($1,$2,$3,$4,FALSE,now()) RETURNING *`,
      [id, me, other, casted.content]);
    const m = r.rows[0];
    // 收件人通知：站内信 + 飞书（尽力而为，不阻塞响应）
    notifyUser(other, 'dm', snap.name + ' 给你发来一条私聊', String(casted.content).slice(0, 80), 'community').catch(() => {});
    res.status(201).json(ok({ message: { id: m.id, fromMe: true, text: m.text, time: fmtTime(m.created_at) } }));
  } catch (e) {
    console.error('[community.dm.send]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

module.exports = router;
// 具名导出：契约路径别名 + 管理端处理器（admin.js / server.js 挂载用）
module.exports.deleteComment = deleteComment;
module.exports.pinHandler = pinHandler;
module.exports.configPutHandler = configPutHandler;
