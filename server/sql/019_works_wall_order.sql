-- 017: works 巨幕展位（人工筛选上墙；NULL=未上墙）
-- 巨幕墙为 28 个展位（4 行 × 7 列），wall_order 1..28；唯一，防止两件作品占同一展位
ALTER TABLE works ADD COLUMN IF NOT EXISTS wall_order INT;
CREATE INDEX IF NOT EXISTS idx_works_wall_order ON works(wall_order) WHERE wall_order IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_works_wall_order ON works(wall_order) WHERE wall_order IS NOT NULL;
