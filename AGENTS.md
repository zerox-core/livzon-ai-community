# AGENTS.md — 本设备的任务开发规范

> 本项目：`livzon-ai-community`（丽珠 AI 社团平台），工作目录 `F:\pingce`。
> 本文件是**本设备（开发机）上负责「单独布置任务」开发时遵循的规范**，随 `xiazai` 分支维护。其它设备是管理设备。

---

## 1. 职责与分支纪律（关键）

- **本设备**只做「用户单独说明的任务」的开发实现。
- 开发统一在分支 **`xiazai`** 上进行；**默认不推送到远端**，除非用户明确说「推送/push」。
- 任务开始前先 `git checkout xiazai` 确认在当前分支；改动落地后 `git add` + `git commit`（本地）。
- 不在 `xiazai` 上直接 `push`；远端生效由用户/管理设备决定。
- 涉及远端共享文档（如 `docs/HANDOFF.md`、`.env` 模板）的改动要谨慎——跨越设备、路径各不同，**避免单项覆盖**他人机器相关的内容。

## 2. 本地环境速记（细节见 `docs/HANDOFF-LOCAL-ENV.md`）

- Node v22.23.2、端口 `8787`；启动 `node start.mjs`（停止 `--stop` / 状态 `--status`）。
- PostgreSQL：独立安装于 `E:\PostgreSQL`，数据目录 `E:\PostgreSQL\data`，`postgres` / `127.0.0.1:5432` / 库 `pingce`；
  **真实口令为 `123456`**（`server/.env` 中 `DB_PASSWORD=123456`，已验证可正常连接）。
- PG 由 `pg-keeper.mjs` 统一管理：`node pg-keeper.mjs ensure`（启动）/ `status`（状态）/ `stop`（停止）/ `wait`（就绪轮询）；`start.mjs` 启动前会自动 `wait`。
- `server/.env` 已 gitignore；`LARK_*`、`DB_PASSWORD`、`SESSION_SECRET` 等真实值**不入库、不提交**。
- 本机当前 WLAN IP：`192.168.1.6`（换网以 `/api/info` 的 `ips` 为准，`SITE_INTRANET_URL` 需同步）。

## 3. 后端代码模式（沿用现有约定）

| 层 | 文件 | 约定 |
|---|---|---|
| 契约 | `server/contract.js` | 统一信封 `{ok:true,data}` / `{ok:false,error:{code,message}}`；经 `ok()/err()`，**禁止裸 `res.json`** |
| 数据 | `server/db.js` | 唯一 DB 入口 `query()`，参数化 SQL（防注入） |
| 校验 | `server/validate.js` | `checkRules(body,rules)` → `{valid,errors,casted}` |
| 鉴权 | `server/middleware/auth.js` | `authRequired` / `adminRequired` |
| 飞书 | `server/lark-client.js` | Bitable 报名 + 消息/卡片；失败走 `LOCAL_FALLBACK` |

- 新路由挂到 `server/routes/` 并在 `server/server.js` 注册；新迁移放 `server/sql/`（`NNN_*.sql`，**幂等**），跑 `node server/sql/run_migrate.js`。
- 改动后必测：`node start.mjs` 重启（如涉及环境变量/路由/DB），再 `curl` 对应接口验证；前端改动用浏览器/接口验证。

## 4. 提交与实现约定

- 提交信息简洁、要点明确；建议前缀 `feat:`/`fix:`/`refactor:`/`docs:`/`chore:`。
- 一次提交聚焦一个逻辑改动；不要把无关改动（如格式化全文件、`package-lock` 漂移）混进来。
- 新增功能遵循 RESTful `/api` 分区；错误码复用 `ErrorCodes`。
- **不提交**：`server/.env`、`logs/`、`public/uploads/`、`node_modules/`、本地 `*.zip`/`*.bak`。

## 5. 完成任务的标准

1. `node start.mjs --status` 服务在跑，健康检查 `/api/info` 通过。
2. 涉及 DB 的改动：迁移/种子成功，`/api/...` 数据读写正确。
3. 功能自测通过（接口返回契约正确、边界/鉴权覆盖）。
4. `git status` 干净，改动已 `commit` 到 `xiazai`，**未 push**。
