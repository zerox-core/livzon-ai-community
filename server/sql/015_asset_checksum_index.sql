-- server/sql/015_asset_checksum_index.sql
-- 重复上传检测加速：同一用户 + 内容指纹（sha256，存 checksum 列，012 已建）复合索引。
-- 幂等：IF NOT EXISTS，可重复执行。由 run_migrate.js 按 004..015 升序执行。
CREATE INDEX IF NOT EXISTS idx_assets_user_checksum ON assets(user_id, checksum);
