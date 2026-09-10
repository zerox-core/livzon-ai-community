-- server/sql/018_community_messages.sql
-- R39 消息中心：私聊表 direct_messages（站内信复用既有 notifications 表）。
-- 幂等：IF NOT EXISTS / ADD COLUMN IF NOT EXISTS，可重复执行（run_migrate.js 自动收编）。

-- notifications 兜底列（历史库可能已手工加过；确保新插入只写基础列也不违约）
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS activity_id TEXT NOT NULL DEFAULT '';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT '';

-- ============ direct_messages 私聊表 ============
CREATE TABLE IF NOT EXISTS direct_messages (
  id          TEXT        PRIMARY KEY,               -- d-<base36ts>-<rand>
  sender_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL DEFAULT '',
  read        BOOLEAN     NOT NULL DEFAULT FALSE,    -- 收件人是否已读
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_dm_no_self CHECK (sender_id <> receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON direct_messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_pair ON direct_messages(sender_id, receiver_id, created_at DESC);
