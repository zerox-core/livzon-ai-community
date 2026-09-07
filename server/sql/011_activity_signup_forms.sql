-- server/sql/011_activity_signup_forms.sql
-- 报名表单系统（模块化模板 + 独立整页报名）：每活动一份可开关模块 + 动态字段 + 富文本规则。
-- - activity_signup_forms：活动报名模板配置（profile JSONB：contact/needUpload/team/deadline/rules/fields）
-- - activity_signups：扩展 upload/response（保存自定义字段值 + 上传文件信息；name/dept/contact 沿用）
-- 幂等：IF NOT EXISTS / ADD COLUMN IF NOT EXISTS，可重复执行（run_migrate.js 自动收编）。

CREATE TABLE IF NOT EXISTS activity_signup_forms (
  activity_id TEXT PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
  profile     JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE activity_signups ADD COLUMN IF NOT EXISTS upload   JSONB NOT NULL DEFAULT '{}';  -- {filename,size,storage_url}
ALTER TABLE activity_signups ADD COLUMN IF NOT EXISTS response JSONB NOT NULL DEFAULT '{}';  -- {key:value} 自定义字段值
