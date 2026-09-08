-- server/sql/013_assets_consumers.sql
-- 资源(asset)子系统消费方竖线接入：给业务表加 asset_id 引用，实现「横切复用」。
-- 各消费方上传改走 server/lib/asset-store.js 后，落盘统一到 public/uploads/assets/<cat>/，
-- 并在此登记一条 assets 记录；业务表仅存 asset_id 引用（+ storage_url 快照）。
-- 幂等：ADD COLUMN IF NOT EXISTS / IF NOT EXISTS，可重复执行。run_migrate.js 按 012 → 013 升序。

-- 作品资源/制品：一份 artifact 挂一份 asset（作品维度视图 = assets 主注册表的引用）
ALTER TABLE artifacts
  ADD COLUMN IF NOT EXISTS asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_artifacts_asset ON artifacts(asset_id);

-- 活动投信：附件也登记为 asset
ALTER TABLE activity_letters
  ADD COLUMN IF NOT EXISTS asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_activity_letters_asset ON activity_letters(asset_id);
