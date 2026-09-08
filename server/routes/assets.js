// server/routes/assets.js
// 跨端复用「资源(asset)子系统」：上传(本地四分类)、登记外部资源(程序)、列表、详情、下载。
// 契约：docs/api/assets-api.md v1（挂 /api/assets，contract.js 的 ok/err 包装）。
// 横切约定：contract 信封 / db 唯一数据入口 / validate 松紧校验 / middleware-auth 鉴权 / asset-store 落盘。
const express = require('express');
const fs = require('fs');
const path = require('path');
const { ok, err, ErrorCodes } = require('../contract');
const { checkRules } = require('../validate');
const { authRequired } = require('../middleware/auth');
const { saveUploadedFile, createAsset, getAsset, listAssets, bumpDownloads, ASSET_CATEGORIES } = require('../lib/asset-store');

const router = express.Router();

const ASSETS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'assets');
const ASSETS_ROOT = path.join(__dirname, '..', '..', 'public', 'uploads');
const maxMb = () => parseInt(process.env.ASSET_MAX_MB || '50', 10);

// multer 懒加载（与全仓「优雅降级」一致：缺依赖照常启动，上传端点给友好提示）
function getUploadMw() {
  try {
    const multer = require('multer');
    return multer({ storage: multer.memoryStorage(), limits: { fileSize: maxMb() * 1024 * 1024 } }).single('file');
  } catch (_) {
    return null;
  }
}

// POST /api/assets/upload —— multipart 本地文件上传（四分类），要求登录。
router.post('/upload', authRequired, (req, res) => {
  const mw = getUploadMw();
  if (!mw) return res.status(501).json(err(ErrorCodes.MOCK_UNAVAILABLE, '上传未启用：请在 server/ 执行 npm install multer'));
  mw(req, res, async (e) => {
    if (e) return res.status(400).json(err(ErrorCodes.VALIDATION, e.code === 'LIMIT_FILE_SIZE' ? `文件超过 ${maxMb()}MB 上限` : e.message));
    const rules = {
      category: { type: 'string', max: 20 },
      kind: { type: 'string', max: 40 },
      origname: { type: 'string', max: 255 },
    };
    const { valid, errors, casted } = checkRules(req.body || {}, rules);
    if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
    const f = req.file;
    if (!f) return res.status(400).json(err(ErrorCodes.VALIDATION, '缺少文件字段 file'));
    const category = casted.category || '';
    if (category && !ASSET_CATEGORIES.includes(category)) {
      return res.status(400).json(err(ErrorCodes.VALIDATION, `不支持的分类：${category}`));
    }
    try {
      const saved = saveUploadedFile(f.buffer, {
        category,
        kind: casted.kind || '',
        origname: casted.origname || f.originalname,
      });
      const asset = await createAsset({
        user_id: req.session.userId,
        category: saved.category,
        backend: 'local',
        kind: saved.kind,
        name: saved.name,
        size: saved.size,
        storage_url: saved.url,
      });
      res.status(201).json(ok({
        asset: {
          id: asset.id, url: saved.url, name: saved.name, size: saved.size,
          category: asset.category, kind: asset.kind,
        },
      }));
    } catch (e2) {
      if (e2.status === 400) return res.status(400).json(err(ErrorCodes.VALIDATION, e2.message));
      console.error('[assets.upload]', e2);
      res.status(500).json(err(ErrorCodes.INTERNAL, '文件写入失败'));
    }
  });
});

// POST /api/assets —— 登记外部资源（程序 → 资源中心/gitlab），不落字节，要求登录。
router.post('/', authRequired, async (req, res) => {
  const rules = {
    category: { required: true, type: 'string', enum: ASSET_CATEGORIES },
    backend: { type: 'string', enum: ['local', 'remote'] },
    kind: { type: 'string', max: 40 },
    name: { type: 'string', max: 255 },
    size: { type: 'number' },
    storage_url: { type: 'string', max: 2000 },
    checksum: { type: 'string', max: 128 },
    repo_url: { type: 'string', max: 1000 },
    remote_url: { type: 'string', max: 2000 },
    remote_status: { type: 'string', max: 40 },
    agent_report: { type: 'string', max: 40000 },
    stage: { type: 'string', max: 40 },
    guide: { type: 'string', max: 4000 },
  };
  const { valid, errors, casted } = checkRules(req.body || {}, rules);
  if (!valid) return res.status(400).json(err(ErrorCodes.VALIDATION, errors.join('；')));
  try {
    const asset = await createAsset({
      user_id: req.session.userId,
      category: casted.category,
      backend: casted.backend || 'remote',
      kind: casted.kind || '',
      name: casted.name || '',
      size: casted.size || 0,
      storage_url: casted.storage_url || casted.remote_url || '',
      checksum: casted.checksum || '',
      repo_url: casted.repo_url || '',
      remote_url: casted.remote_url || '',
      remote_status: casted.remote_status || '',
      agent_report: casted.agent_report || '',
      stage: casted.stage || '',
      guide: casted.guide || '',
    });
    res.status(201).json(ok({ asset }));
  } catch (e) {
    console.error('[assets.post]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/assets?category=&backend=&limit=&offset=&mine=1 —— 列表（公开；mine 需登录）
router.get('/', async (req, res) => {
  const { category, backend } = req.query;
  let user_id;
  if (req.query.mine === '1') {
    if (!(req.session && req.session.userId)) return res.status(401).json(err(ErrorCodes.AUTH, '请先登录'));
    user_id = req.session.userId;
  }
  try {
    const { assets, nextCursor } = await listAssets({ user_id, category, backend, limit: req.query.limit, offset: req.query.offset });
    res.json(ok({ assets, nextCursor }));
  } catch (e) {
    console.error('[assets.list]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/assets/:id —— 单个详情
router.get('/:id', async (req, res) => {
  try {
    const a = await getAsset(req.params.id);
    if (!a) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '资源不存在'));
    res.json(ok({ asset: a }));
  } catch (e) {
    console.error('[assets.get]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// GET /api/assets/:id/download —— 登录态下载（计数）＋ 本地流式 / https 外链 302
router.get('/:id/download', authRequired, async (req, res) => {
  try {
    const a = await getAsset(req.params.id);
    if (!a) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '资源不存在'));
    bumpDownloads(req.params.id); // 计数（fire 后即继续，不阻塞响应）
    const url = String(a.storage_url || '');
    if (/^https?:\/\//i.test(url)) return res.redirect(302, url); // 外链型（程序外部资源）
    if (url.startsWith('/uploads/')) {
      const rel = url.replace(/^\/uploads\//, '');                 // assets/media/x.png
      const fp = path.join(ASSETS_ROOT, rel);
      // 防路径穿越：解析后必须仍在 uploads 根内
      if (!fp.startsWith(path.normalize(ASSETS_ROOT + path.sep)) && fp !== ASSETS_ROOT) {
        return res.status(404).json(err(ErrorCodes.NOT_FOUND, '资源不存在'));
      }
      if (!fs.existsSync(fp)) return res.status(410).json(err(ErrorCodes.NOT_FOUND, '文件已不存在'));
      const safe = String(a.name || ('asset-' + a.id)).replace(/[\\/:*?"<>|\r\n]/g, '_');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="asset-${a.id}"; filename*=UTF-8''${encodeURIComponent(safe)}`);
      res.setHeader('Content-Length', fs.statSync(fp).size);
      return fs.createReadStream(fp).on('error', () => res.status(500).end()).pipe(res);
    }
    return res.status(410).json(err(ErrorCodes.MOCK_UNAVAILABLE, '该资源为占位登记，暂无可下载文件'));
  } catch (e) {
    console.error('[assets.download]', e);
    if (!res.headersSent) res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

module.exports = router;
