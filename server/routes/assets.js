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
const { saveUploadedFile, createAsset, getAsset, listAssets, bumpDownloads, deleteAsset, removeLocalFile, ASSET_CATEGORIES } = require('../lib/asset-store');

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

// POST /api/assets/github-readme —— 识别 github.com 仓库并服务端代理拉取 README（绕过浏览器 CORS），要求登录。
// 安全边界：仅接受 github.com 的 <owner>/<repo>（可带 #branch），其余一律拒绝；10s 超时；≤200KB 截断。
router.post('/github-readme', authRequired, async (req, res) => {
  const url = String(((req.body || {}).repoUrl || '')).trim();
  const m = url.match(/^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/(?:tree|blob)\/([^\/#?]+)[^#?]*)?(?:#([^\s#]+))?\/?$/);
  if (!m) return res.status(400).json(err(ErrorCodes.VALIDATION, '仅支持 github.com 仓库地址（https://github.com/owner/repo，可带 #分支）'));
  const [, owner, repo, , branch] = m;
  const branches = [branch, 'main', 'master'].filter(Boolean);
  const tried = new Set();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    let readme = null, usedPath = '';
    for (const b of branches) {
      if (tried.has(b)) continue;
      tried.add(b);
      for (const fn of ['README.md', 'readme.md']) {
        try {
          const resp = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(b)}/${fn}`, { signal: ctrl.signal });
          if (resp.ok) { readme = await resp.text(); usedPath = `${owner}/${repo}/${b}/${fn}`; break; }
        } catch (_) { /* 单分支单文件失败继续尝试 */ }
      }
      if (readme != null) break;
    }
    if (readme == null) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '未找到 README（仓库不存在、私有或无 README 文件）'));
    if (readme.length > 200000) readme = readme.slice(0, 200000) + '\n…（已截断）';
    res.json(ok({ readme, repo: `${owner}/${repo}`, path: usedPath, fetchedAt: new Date().toISOString() }));
  } catch (e) {
    console.error('[assets.github-readme]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL, 'README 拉取失败'));
  } finally {
    clearTimeout(timer);
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

// DELETE /api/assets/:id —— 删除资源（仅所有者或 admin；本地文件一并清理；业务引用 ON DELETE SET NULL）
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const a = await getAsset(req.params.id);
    if (!a) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '资源不存在'));
    const isAdmin = req.session.role === 'admin';
    if (!isAdmin && a.user_id !== req.session.userId) {
      return res.status(403).json(err(ErrorCodes.PERMISSION, '只能删除自己的资源'));
    }
    removeLocalFile(a.storage_url);
    await deleteAsset(req.params.id);
    res.json(ok({ deleted: true }));
  } catch (e) {
    console.error('[assets.delete]', e);
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
