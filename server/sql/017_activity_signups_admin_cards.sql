-- 017: 报名记录冗存管理员卡片 message_id
-- 用途：notifyAdminsOfSignup 推卡时记下 [{userId, messageId}]，
--      之后无论从网页端还是一键链接审批，都据此把卡片 PATCH 为终态（状态同步）。
ALTER TABLE activity_signups ADD COLUMN IF NOT EXISTS admin_cards JSONB NOT NULL DEFAULT '[]';
