-- server/sql/011_activity_letters.sql
-- v32 活动投信口（activity_letters）：活动页滑块详情层里的私信通道——
-- 公开面板零留痕、不发 notifications，仅管理员后台汇总（GET /api/admin/activities/letters）。
-- 注：编号跳过 010 —— 主仓工作树存在未提交的 010_activity_signups.sql（活动报名线，进行中），
--     本迁移从 011 起避免合流撞名。
-- 幂等：IF NOT EXISTS，可重复执行（run_migrate.js 自动收编）。

CREATE TABLE IF NOT EXISTS activity_letters (
  id           SERIAL PRIMARY KEY,
  activity_id  TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT '',         -- 投递人姓名快照（后台名单直接可读）
  dept         TEXT NOT NULL DEFAULT '',         -- 部门快照
  note         TEXT NOT NULL DEFAULT '',         -- 留言正文 ≤1000
  file_name    TEXT NOT NULL DEFAULT '',         -- 附件原始名（UTF-8 无损）
  file_size    INTEGER NOT NULL DEFAULT 0,
  storage_url  TEXT NOT NULL DEFAULT '',         -- /uploads/letters/<随机名>（管理员鉴权下载）
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 留言语义（一人可多次投信），不设 UNIQUE 幂等约束——与预约(activity_reservations)不同
CREATE INDEX IF NOT EXISTS idx_letter_activity ON activity_letters(activity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_letter_user ON activity_letters(user_id);
