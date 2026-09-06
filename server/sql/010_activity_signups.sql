-- server/sql/010_activity_signups.sql
-- 报名闭环：正式活动（current/focus）报名表 + notifications 按活动归并所需字段。
-- - activity_signups：与 activity_reservations(预约) 区分——报名=确认参加/参赛，预约=到点提醒
-- - notifications.activity_id/stage：同活动多阶段通知（预约确认/报名成功/开始前提醒）归并到首条记录下
-- 幂等：IF NOT EXISTS / ADD COLUMN IF NOT EXISTS，可重复执行（run_migrate.js 自动收编）。

CREATE TABLE IF NOT EXISTS activity_signups (
  id          SERIAL PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',           -- 报名姓名（登录带出，允许覆写）
  dept        TEXT NOT NULL DEFAULT '',           -- 部门（登录带出，空则手填兜底）
  contact     TEXT NOT NULL DEFAULT '',           -- 备用联系方式（选填）
  note        TEXT NOT NULL DEFAULT '',           -- 参与期待（选填 ≤500）
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_signup_user_activity UNIQUE (user_id, activity_id)  -- 一人一活动一次，重复幂等
);
CREATE INDEX IF NOT EXISTS idx_signup_activity ON activity_signups(activity_id);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS activity_id TEXT NOT NULL DEFAULT '';  -- 归属活动 id（''=非活动通知）
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT '';        -- 阶段：reserve/signup/pre_start
