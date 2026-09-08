# 资产 · 资源子系统接口契约（v1，当前有效）

> 分支：`xiazai`（本地开发分支，不推送远端）
> 后端实现：`server/routes/assets.js` + `server/lib/asset-store.js`
> 前端实现：个人中心「我的资源 + 程序上传入口」/ 社区发布「我的资源」勾选（app.js）
> **本文档是「资源(asset)子系统」接口的唯一现行契约**。
> 定位：把用户上传/外部资源从各业务里抽出来做成一块**横切复用**能力，供
> **作品资源 / 社团社区文章附带 / 活动报名附带作品** 三处消费（各消费方是薄适配器，
> 在各自行里存一个 asset 引用，不各自重复上传逻辑）。

## 产品口径

- 一个 **asset = 一份可下载/可调用的资源**，四分类：
  - `program`（程序，字节走外部：资源中心 / 内网 gitlab，本服务仅登记链接与状态）
  - `skill`（skill 包，本服务本地存储）
  - `media`（多媒体，本服务本地存储）
  - `doc`（纯文档，本服务本地存储）
- `backend` 标明字节在哪：`local`（本服务磁盘 `public/uploads/assets/`）或 `remote`（外部：资源中心 / gitlab 仓库）。
- 登记外部资源（程序）时**不落字节**，只存 `repo_url`/`remote_url`/`remote_status` 等元数据；
  下载走外链 302。
- 本子系统统一管上传、登记、列表、下载计数与分类；跨端复用，避免各业务重复 upload 中间件。

> 四分类枚举值本轮采用：`program / skill / media / doc`（可根据需要改为
> `program / skill / multimedia / document`，改动只涉及 `assets.js` 的 `CATEGORIES` 与迁移注释）。

## 数据模型（1 张表）

`assets`：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | text PK | `genId('ast')`，时序可排序 |
| `user_id` | bigint, null | 上传者/所有者（登录用户 id） |
| `category` | text | 四分类：`program/skill/media/doc` |
| `backend` | text | `local` / `remote` |
| `kind` | text | 子类型（image/doc/file/video/skill/mcp/source…），可选 |
| `name` | text | 原始文件名（UTF-8 修复后） |
| `size` | bigint | 字节 |
| `storage_url` | text | 本地 `/uploads/assets/<cat>/<name>` 或外部 URL |
| `checksum` | text | 校验 |
| `repo_url` | text | 程序：内网 gitlab 仓库地址 |
| `remote_url` | text | 程序：资源中心 / 外部展示地址 |
| `remote_status` | text | 程序审核：`pending/reviewing/online/rejected`（''=无） |
| `agent_report` | text | 粘贴的 agent 格式化报告原文（留存追溯） |
| `stage` | text | 引导流进度：`agent_pending/submitted`（本轮预留） |
| `guide` | text | 本地调用/使用指引 |
| `downloads` | int | 下载计数（服务端权威） |
| `created_at` / `updated_at` | timestamptz | |

索引：`idx_assets_user(user_id)`、`idx_assets_cat_backend(category, backend)`、`idx_assets_ref(storage_url)`。

## 接口（挂 `/api/assets`，contract.js 的 ok/err 包装）

### POST /api/assets/upload

multipart 上传本地文件（四分类）。**要求登录**。文件字段名 `file`，可选文本字段：`category`（枚举）、`kind`（子类型）。

- 校验：`category` ∈ `program/skill/media/doc`（缺省视为空）；扩展名在白名单内；大小 ≤ `ASSET_MAX_MB`（默认 50MB）。
- 文件落盘：`public/uploads/assets/<category>/<name>`（category 为空则落 `public/uploads/assets/`），`storage_url` 形如 `/uploads/assets/<category>/<name>`。
- 成功 `201`：

```json
{
  "ok": true,
  "data": {
    "asset": {
      "id": "ast-lx8-3a2", "url": "/uploads/assets/media/x.png",
      "name": "x.png", "size": 204800, "category": "media", "kind": "image"
    }
  }
}
```

- 未登录 `401`（`err("AUTH")`）；扩展名/大小不合规 `400`（`err("VALIDATION")`）。

### POST /api/assets

登记一个**外部资源**（程序 → 资源中心 / gitlab），**不落字节**。**要求登录**。JSON body：

```json
{
  "category": "program",
  "backend": "remote",
  "kind": "source",
  "name": "周报小结 Agent",
  "size": 0,
  "storage_url": "https://resource-center.example/items/42",
  "repo_url": "http://gitlab.internal/group/repo",
  "remote_url": "https://resource-center.example/items/42",
  "remote_status": "reviewing",
  "agent_report": "...agent 格式化报告...",
  "stage": "submitted",
  "guide": "..."
}
```

- 校验：`category` ∈ 四分类；`backend` ∈ `local/remote`；`storage_url`/`remote_url` 长度 ≤ 2000。
- 成功 `201`：`{ "ok": true, "data": { "asset": { …完整行 } } }`。
- 未登录 `401`；缺字段 `400`。

### GET /api/assets

列表。**无鉴权**（公开）；`mine=1` 且已登录时只返回本人的。

- 可选 query：`category`、`backend`、`limit`（默认 30，上限 100）、`offset`（默认 0）、`mine`。
- 返回：`{ "ok": true, "data": { "assets": [ …行 ], "nextCursor": null } }`。
  - `nextCursor` 为下一次的 `offset`（未到结尾）或 `null`（已到尾）。
  - 空列表返回 `"assets": []`，非错误。

### GET /api/assets/:id

单个详情。**无鉴权**。返回 `{ "ok": true, "data": { "asset": { … } } }`；不存在返回 `404`（`err("NOT_FOUND")`）。

### GET /api/assets/:id/download

登录态下载（**要求登录**，计数 +1）。**非契约信封**（直接响应）：

- `storage_url` 以 `http(s)://` 开头 → `302` 跳外链（程序外部资源用）。
- `storage_url` 以 `/uploads/` 开头 → 流式返回本地文件（下载计数 + 附件头）。
- 其它 → `410`（`err("MOCK_UNAVAILABLE")`）。
- 文件不存在 → `404`。

## 消费方竖线接入（横切复用落地）

各消费方上传**统一走** `server/lib/asset-store.js`（`saveUploadedFile` + `createAsset`），落盘到
`public/uploads/assets/<cat>/` 并登记一条 `assets` 记录；业务表仅存 `asset_id` 引用（+ `storage_url` 快照）。

| 消费方 | 端点 | 落盘目录 | 业务表引用 | 返回形状（向前兼容） |
|---|---|---|---|---|
| 社团社区发布 | `POST /api/community/upload` | `/uploads/assets/<cat>/` | `posts.images[]/attachments[]` 存 `{url,name,size}` | 保持 `{url,name,size}` |
| 作品资源/制品 | `POST /api/artifacts/upload` | `/uploads/assets/<cat>/` | `artifacts.asset_id`（迁移 013） | 保持整行 + `asset_id` |
| 活动报名作品 | `POST /api/activities/:id/signup/upload` | `/uploads/assets/<cat>/` | `activity_signups.upload` 存 `{filename,size,storage_url}` | 保持 `{url,filename,size}` |
| 活动投信 | `POST /api/activities/:id/letters` | `/uploads/assets/<cat>/` | `activity_letters.asset_id`（迁移 013） | 保持 `{id,delivered}` |

**分类推断规则**（消费方未显式传 category 时按 kind/扩展名自动映射到四分类）：

| kind / 扩展名 | assets.category |
|---|---|
| `video`、`mp3`、`wav`、音视频、图片（`png/jpg/gif/webp`） | `media` |
| `skill`（skill/mcp 包，按扩展名区分） | `skill` |
| `mcp`、`source`、`miniprogram`、代码/源码（`js/ts/py/json/html`）、压缩包（`zip/tar/gz/…`） | `program` |
| 文档（`pdf/docx/xlsx/pptx/txt/md/csv`） | `doc` |

> 实现：`lib/asset-store.js` 的 `categoryForKind(kind)` / `categoryForExt(ext)`，供消费方调用。

**社区发布「我的资源」**：用户在发布表单中从个人中心已上传资源（`GET /api/assets?mine=1`）勾选若干项，
作为帖子 `attachments` 提交，每项 `url` 指向 `/api/assets/:id/download`，`mediaHtml` 渲染为「📎 名称 + 大小」的**下载按钮**。

## 兼容性说明

- 本子系统为**新增**，消费方竖线（artifacts/signup/letters/community）上传均走共享库并登记 `assets`，
  各自返回形状保持向前兼容（仅 `storage_url` 目录变为 `/uploads/assets/<cat>/`，动态返回，前端无感）。
- 已存在的**旧上传文件不迁移**；`assets` 与 `artifacts` 保持独立（artifacts 加 `asset_id` 引用，合并与否属后续开放项）。
- `runner`：先 `node server/sql/run_migrate.js`（建 `assets` 表 + 消费方 `asset_id` 列），再重启 `node start.mjs`。
- 大小上限统一走环境变量：`ASSET_MAX_MB`（默认 50，社区/制品/报名/信件共用）。
