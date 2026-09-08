-- server/sql/012_assets.sql
-- 跨端复用「资源(asset)子系统」中心表：统一管上传/登记外部资源/四分类与状态。
-- 消费方：作品资源、社团社区文章附带、活动报名附带作品（横切复用，不各自重复上传逻辑）。
-- 幂等：ADD/IF NOT EXISTS，可重复执行。由 run_migrate.js 按 schema 基线 → 004..012 升序执行。

CREATE TABLE IF NOT EXISTS assets (
  id            TEXT PRIMARY KEY,                          -- genId('ast')，时序可排序
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category      TEXT        NOT NULL DEFAULT '',           -- program/skill/media/doc
  backend       TEXT        NOT NULL DEFAULT 'local',      -- local/remote
  kind          TEXT        NOT NULL DEFAULT '',           -- 子类型（image/doc/file/video/skill/mcp/source…）
  name          TEXT        NOT NULL DEFAULT '',           -- 原始文件名（UTF-8 修复后）
  size          BIGINT      NOT NULL DEFAULT 0,            -- 字节
  storage_url   TEXT        NOT NULL DEFAULT '',           -- 本地 /uploads/assets/<cat>/<name> 或外链
  checksum      TEXT        NOT NULL DEFAULT '',
  repo_url      TEXT        NOT NULL DEFAULT '',           -- 程序：内网 gitlab 仓库地址
  remote_url    TEXT        NOT NULL DEFAULT '',           -- 程序：资源中心/外部展示地址
  remote_status TEXT        NOT NULL DEFAULT '',           -- 程序：pending/reviewing/online/rejected
  agent_report  TEXT        NOT NULL DEFAULT '',           -- 粘贴的 agent 格式化报告原文（留存）
  stage         TEXT        NOT NULL DEFAULT '',           -- 引导流进度：agent_pending/submitted（预留）
  guide         TEXT        NOT NULL DEFAULT '',           -- 本地调用/使用指引
  downloads     INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_user       ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_cat_backend ON assets(category, backend);
CREATE INDEX IF NOT EXISTS idx_assets_ref        ON assets(storage_url);
