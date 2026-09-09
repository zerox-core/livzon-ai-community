-- 016: activity_signups 增加审核状态位（R17）
-- 背景：旧 registrations 审核链路废弃，activity_signups 成为唯一报名入口。
-- 历史数据视为已通过（approved）；新报名由服务端显式写入 'pending'。
-- 幂等：IF NOT EXISTS / IF NOT EXISTS，可重复执行。

ALTER TABLE activity_signups ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE activity_signups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_signups_status ON activity_signups(status);
