-- server/sql/021_activity_flow_type.sql
-- 活动流程类型（2026-09-14）：flow_type = 'instant' 一次性活动（默认：报名时一次性交齐材料，审批通过自动入作品大厅）
--                          | 'competition' 比赛制（报名阶段不交作品，报名通过后活动期间投稿，先审核后投票）
-- 幂等：ADD COLUMN IF NOT EXISTS，可重复执行（run_migrate.js 自动收编）。
ALTER TABLE activities ADD COLUMN IF NOT EXISTS flow_type TEXT NOT NULL DEFAULT 'instant';
