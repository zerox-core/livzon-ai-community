-- server/sql/020_activity_voting.sql
-- 首页作品展区 + 活动期投票（每日一票制，2026-09-12）
-- 变更背景：投票原先只挂在巨幕详情页，规则是「同人同作品终身一票」。
--   本轮改为：作品归属活动（works.activity_id = 票池；空串 = 自由展区池），
--   每人每个票池每天 1 票，次日自动重置（票不囤积），可每天给同一件作品续投。
-- 幂等：IF NOT EXISTS / 可重复执行（run_migrate.js 自动收编）。

-- ===== 1) works.activity_id：作品归属活动（票池）=====
ALTER TABLE works ADD COLUMN IF NOT EXISTS activity_id TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_works_activity ON works(activity_id) WHERE activity_id <> '';

-- ===== 2) votes.vote_date：票的归属日（每天一张票的时间维度）=====
ALTER TABLE votes ADD COLUMN IF NOT EXISTS vote_date DATE NOT NULL DEFAULT CURRENT_DATE;
-- 存量票按实际投票日回填（按旧规则产生，不受每日一票约束）
UPDATE votes SET vote_date = (created_at AT TIME ZONE 'Asia/Shanghai')::date;

-- ===== 3) 票池规则唯一索引 =====
-- 旧规则「同人同作品终身一票」废弃（每日一票制下明天可以再投同一件）
DROP INDEX IF EXISTS uq_votes_voter_work;
-- 新规则：同人 + 同票池 + 同天 唯一。
-- WHERE id > 6：豁免 6 条按旧规则产生的历史票（voter 3 在 09-08 同池投了 3 票，违反新规则）。
CREATE UNIQUE INDEX IF NOT EXISTS uq_votes_pool_day
  ON votes(voter_id, activity_id, vote_date) WHERE id > 6;
