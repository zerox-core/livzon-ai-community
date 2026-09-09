// server/lib/asset-store.js
// 跨端复用「资源(asset)子系统」共享存储库：集中此前各处重复的 目录/文件名/白名单/写入/登记。
// 供给 routes/assets.js 与各消费方（作品资源/社区文章/活动报名）调用，避免各自复制 multer 落盘逻辑。
// 契约：docs/api/assets-api.md v1。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { query } = require('../db');
const { genId, utf8Field } = require('./community-core');

// 四分类（驱动存储路由）。若改枚举值，仅需同步此处与迁移注释、契约文档。
const ASSET_CATEGORIES = ['program', 'skill', 'media', 'doc'];

// 扩展名白名单（图片 / 文档 / 文件 / 音视频 / 源码包）
const ASSET_EXT = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'pdf', 'docx', 'xlsx', 'pptx', 'txt', 'md',
  'zip', 'tar', 'gz', 'tgz', 'rar', '7z',
  'mp4', 'mov', 'webm', 'mp3', 'wav',
  'js', 'ts', 'py', 'csv', 'json', 'html',
]);

const ASSET_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'assets');

// —— 分类推断：消费方未显式传 category 时，按 kind / 扩展名映射到四分类 ——
const EXT_TO_CATEGORY = {
  // 媒体：图片 / 音视频
  png: 'media', jpg: 'media', jpeg: 'media', gif: 'media', webp: 'media',
  mp4: 'media', mov: 'media', webm: 'media', mp3: 'media', wav: 'media',
  // 文档
  pdf: 'doc', docx: 'doc', xlsx: 'doc', pptx: 'doc', txt: 'doc', md: 'doc', csv: 'doc',
  // 程序：源码 / 数据 / 压缩包
  js: 'program', ts: 'program', py: 'program', json: 'program', html: 'program',
  zip: 'program', tar: 'program', gz: 'program', tgz: 'program', rar: 'program', '7z': 'program',
};
function categoryForExt(ext) {
  return EXT_TO_CATEGORY[String(ext || '').toLowerCase().replace(/^\./, '')] || 'doc';
}
function categoryForKind(kind) {
  const k = String(kind || '').toLowerCase();
  if (k === 'video') return 'media';
  if (k === 'skill') return 'skill';
  if (k === 'miniprogram' || k === 'mcp' || k === 'source') return 'program';
  return ''; // file 等交给扩展名推断
}

function fail(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

// 把上传缓冲写盘到 public/uploads/assets/<category>/<name>，返回 {url,name,size,category,kind}
// 校验：扩展名在白名单内（否则 400）；category 若非空须在四分类内（否则 400）。
function saveUploadedFile(buffer, { category = '', kind = '', origname = '' } = {}) {
  const orig = utf8Field(String(origname || '')).slice(0, 255);
  const ext = (path.extname(orig).toLowerCase().replace(/^\./, '')) || '';
  if (!ASSET_EXT.has(ext)) throw fail(400, `不支持的文件类型：${ext || '未知'}`);
  // 未显式指定分类 → 按扩展名自动推断（消费方竖线免传 category 即可正确分桶）
  const cat = (category && ASSET_CATEGORIES.includes(category)) ? category : categoryForExt(ext);
  if (category && !ASSET_CATEGORIES.includes(category)) throw fail(400, `不支持的分类：${category}`);
  if (!buffer || !buffer.length) throw fail(400, '文件内容为空');

  const subdir = cat;
  const dir = subdir ? path.join(ASSET_DIR, subdir) : ASSET_DIR;
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}

  const fname = genId('ast') + '.' + ext; // 服务端随机名：防路径穿越 / 防信任原始名
  fs.writeFileSync(path.join(dir, fname), buffer);

  return {
    url: '/uploads/assets/' + (subdir ? subdir + '/' : '') + fname,
    name: orig,
    size: buffer.length,
    category: cat,
    kind,
  };
}

// 文件内容指纹（重复检测用）：返回 buffer 的 sha256 hex
function fileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// 重复检测：同一用户是否已上传过内容完全一致（sha256）的本地文件；命中返回已有资产行，否则 null。
// 复用 assets.checksum 列（012 迁移已建），无需新表结构。
async function findDuplicateAsset(userId, hash) {
  if (!hash) return null;
  const r = await query(
    `SELECT id, name, created_at FROM assets WHERE user_id=$1 AND checksum=$2 AND backend='local' LIMIT 1`,
    [userId, hash]
  );
  return r.rows[0] || null;
}

// 写 assets 表（本地上传或登记外部资源两种 row）。返回完整行。
// row 可选字段：user_id/category/backend/kind/name/size/storage_url/checksum/
//             repo_url/remote_url/remote_status/agent_report/stage/guide/source
async function createAsset(row = {}) {
  const r = await query(
    `INSERT INTO assets
       (id, user_id, category, backend, kind, name, size, storage_url, checksum,
        repo_url, remote_url, remote_status, agent_report, stage, guide, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING *`,
    [
      row.id || genId('ast'),
      row.user_id ?? null,
      row.category || '',
      row.backend || 'local',
      row.kind || '',
      row.name || '',
      row.size || 0,
      row.storage_url || '',
      row.checksum || '',
      row.repo_url || '',
      row.remote_url || '',
      row.remote_status || '',
      row.agent_report || '',
      row.stage || '',
      row.guide || '',
      row.source || '',
    ]
  );
  return r.rows[0];
}

async function getAsset(id) {
  const r = await query('SELECT * FROM assets WHERE id=$1', [id]);
  return r.rows[0] || null;
}

// 列表：按 user_id/category/backend 过滤 + 时间倒序 + offset 游标。
async function listAssets({ user_id, category, backend, limit = 30, offset = 0 } = {}) {
  limit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
  offset = Math.max(parseInt(offset, 10) || 0, 0);
  const where = [];
  const params = [];
  const add = (col, val) => { params.push(val); where.push(`${col}=$${params.length}`); };
  if (user_id != null && user_id !== '') add('user_id', user_id);
  if (category) add('category', category);
  if (backend) add('backend', backend);
  const wql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const base = `FROM assets ${wql}`;
  const cnt = await query(`SELECT count(*)::int AS n ${base}`, params);
  const total = cnt.rows[0].n;
  const rows = await query(
    `SELECT id, user_id, category, backend, kind, name, size, storage_url, checksum,
            repo_url, remote_url, remote_status, stage, guide, source, downloads, created_at, updated_at
     ${base} ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const nextCursor = offset + rows.rows.length < total ? offset + rows.rows.length : null;
  return { assets: rows.rows, nextCursor };
}

// 下载计数 +1，返回最新计数
async function bumpDownloads(id) {
  const r = await query('UPDATE assets SET downloads=downloads+1 WHERE id=$1 RETURNING downloads', [id]);
  return (r.rows[0] && r.rows[0].downloads) || 0;
}

// 删除一条资产记录（业务表引用走 ON DELETE SET NULL 自动置空）
async function deleteAsset(id) {
  await query('DELETE FROM assets WHERE id=$1', [id]);
}

// 清理本地文件（仅限确在 /uploads/assets/ 内的随机名文件；外链/占位不动）
function removeLocalFile(storageUrl) {
  const url = String(storageUrl || '');
  if (!url.startsWith('/uploads/assets/')) return;
  const rel = url.replace(/^\/uploads\/assets\//, '');
  const fp = path.join(ASSET_DIR, rel);
  if (fp.startsWith(path.normalize(ASSET_DIR + path.sep)) && fs.existsSync(fp)) {
    try { fs.unlinkSync(fp); } catch (_) {}
  }
}

module.exports = {
  ASSET_CATEGORIES, ASSET_EXT,
  saveUploadedFile, createAsset, getAsset, listAssets, bumpDownloads,
  deleteAsset, removeLocalFile,
  categoryForExt, categoryForKind,
  fileHash, findDuplicateAsset,
};
