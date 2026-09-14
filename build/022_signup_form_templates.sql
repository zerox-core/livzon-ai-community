-- server/sql/022_signup_form_templates.sql
-- 报名表单「模板库」：管理页可自由创建 / 编辑 / 删除的可复用模板。
-- 模板不绑定活动——按每个活动不同需求创建不同模板，套用到任意活动后可继续改，
-- 删除模板不影响已保存到活动上的表单（活动表单存 activity_signup_forms）。
-- 幂等：可重复执行（run_migrate.js 自动收编）。

CREATE TABLE IF NOT EXISTS signup_form_templates (
  id          TEXT PRIMARY KEY,                  -- tpl_<时间戳><随机>，时序可排序
  name        TEXT NOT NULL DEFAULT '',           -- 模板名（≤60 字）
  profile     JSONB NOT NULL DEFAULT '{}'::jsonb,-- 与 activity_signup_forms.profile 同构
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tpl_updated ON signup_form_templates(updated_at DESC);
