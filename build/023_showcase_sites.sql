-- server/sql/023_showcase_sites.sql
-- 网页设计作品「源码展示库」登记表：mock 源码目录（<项目根>/showcase/<slug>/）
-- 跟随项目服务一起启动（server.js 静态直供 /showcase），作品墙点击可直接跳转浏览。
-- 幂等：可重复执行。

CREATE TABLE IF NOT EXISTS showcase_sites (
  slug        TEXT PRIMARY KEY,                  -- 目录名（showcase/<slug>）
  title       TEXT NOT NULL DEFAULT '',          -- 展示名（作品标题）
  description TEXT NOT NULL DEFAULT '',          -- 一句话简介
  work_id     INTEGER REFERENCES works(id) ON DELETE SET NULL,  -- 关联作品
  path        TEXT NOT NULL DEFAULT '',          -- 本地源码目录
  url         TEXT NOT NULL DEFAULT '',          -- 访问地址（/showcase/<slug>/）
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_showcase_work ON showcase_sites(work_id);
