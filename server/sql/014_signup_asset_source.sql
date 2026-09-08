-- 014: 资源来源标记（报名作品自动打标）+ 报名记录关联作品
-- 背景：报名页支持「从我的作品选择」直接提交；需可追溯资产来源与报名↔作品关联。

-- assets.source：登记该资产的来源（'signup:<activityId>' = 报名活动时上传的作品），前端据此打「报名作品」标签
ALTER TABLE assets ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT '';
COMMENT ON COLUMN assets.source IS '资产来源标记：signup:<activityId> 表示报名活动时上传的作品';

-- activity_signups.asset_id：报名记录关联的资产行；作品被删则置空（历史行保持 NULL）
ALTER TABLE activity_signups ADD COLUMN IF NOT EXISTS asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL;
COMMENT ON COLUMN activity_signups.asset_id IS '报名时选择的资产 ID（assets.id），作品被删除则置空';
