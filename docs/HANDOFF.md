# 丽珠 AI 社团平台 · 交接文档（HANDOFF）

> 版本：2026-09-07 于测试环境（飞书测试应用 `测试it服务平台` cli_aa0ff9fd4ef85d1d + 本地 PG `pingce` + LAN:8787）。
> 读者：接手的开发/运维。目标：看完能快速定位分区、接口契约、数据模型，接手迭代与正式部署。

---

## 1. 定位与技术栈

- 面向集团内部的 AI 创新平台官网：作品展示、活动/比赛、报名/预约、社区、管理后台。
- **后端**：Node.js + Express + PostgreSQL（自管，本地 `E:\PostgreSQL`）；**前端**：React UMD 单文件（`public/app.js`），hash 路由；**飞书集成**：SSO 登录 + 机器人私聊卡片 + Bitable 只读兜底。
- 启动：`node start.mjs`（端口 8787）；迁移：`node server/sql/run_migrate.js`；活动数据导入：`node server/sql/import_activities.js`。

## 2. 横切约定（所有后端代码遵守）

| 层 | 文件 | 职责 |
|---|---|---|
| 契约层 | `server/contract.js` | 统一信封 `{ok:true,data}` / `{ok:false,error:{code,message}}`；`ErrorCodes`（VALIDATION/NOT_FOUND/AUTH/PERMISSION/CONFLICT/RATE_LIMIT/INTERNAL/MOCK_UNAVAILABLE）；`ok()/err()`。**禁止裸 res.json** |
| 数据层 | `server/db.js` | 唯一数据库入口 `query()`，参数化 SQL |
| 校验层 | `server/validate.js` | `checkRules(body,rules)` → `{valid,errors,casted}`，规则 `{required,type,max,enum,regex}` |
| 鉴权层 | `server/middleware/auth.js` | `authRequired`（有 session→req.user，否则 401）；`adminRequired`（session role=admin，非生产兼容旧 `x-user-role` 头） |
| 工具库 | `server/lib/` | `community-core`(genId/utf8Field/userSnapshot/fmtTime/likeToggleSQL)、`reminders`、`signup-form`、`admins`、`pg-session-store` |
| 飞书 | `server/lark-client.js` | 缓存 tenant token；`_imSend`/`sendTextToUser`/`sendCardToUser`；Bitable `addRegistration`/`listRegistrations` |

## 3. 数据模型（PG，迁移按 001→011 顺序）

| 表 | 关键列 | 说明 |
|---|---|---|
| `users` | open_id/union_id/name/email/department/avatar/role(admin·member)/status/… | SSO 落库；`ADMIN_OPEN_IDS` 白名单登录时"只升不降" |
| `works` | kind/title/author/category/description/cover/source/detail JSONB/status(pending·approved·rejected)/published/user_id | 作品；detail.link 用 |
| `registrations` | name/department/contact/activity(will_share/share_topic/remark/status/user_id) | 通用报名（`POST /api/register`） |
| `votes` | voter_id/activity_id/work_id/user_id | 投票，`uq_votes_voter_work` 唯一防刷 |
| `artifacts` | work_id/kind/filename/version/size/storage_url/checksum/downloads/guide | 制品（文件本地磁盘） |
| `activities` | id PK/kind(current·upcoming·past)/title/…/data JSONB/start_at | 活动落库，data 原样存 json 对象 |
| `activity_reservations` | activity_id/user_id/name/dept/note，UNIQUE(user,activity) | 预约（upcoming·消息提醒） |
| `activity_signups` | activity_id/user_id/name/dept/contact/note/upload JSONB/response JSONB，UNIQUE | 报名（current），自定义字段值+上传 |
| `activity_signup_forms` | activity_id PK/profile JSONB | 该活动报名模板（contact/needUpload/team/deadline/rules/fields） |
| `activity_reminders` | reservation_id/kind/channel/feishu_msg_id，UNIQUE | 提醒发送去重 |
| `notifications` | user_id/type/title/body/link/activity_id/stage/read | 站内消息；同活动多阶段归并 |
| `sessions` | sid/sess/expire | session 落 PG（pg-session-store），重启不掉线 |
| 社区 | `posts`/`comments`/`post_likes`/`comment_likes`/`community_config` | 帖子/评论/点赞/配置 |
| 作品评论 | `work_comments`/`work_comment_likes` | 独立于社区帖子 |

## 4. 后端接口（按模块分区，`/api` 前缀）

### 4.1 认证 `routes/auth.js`
| Method | Path | 说明 |
|---|---|---|
| GET | /auth/feishu | 登录入口→飞书授权（state 存 session 防 CSRF） |
| GET | /auth/callback | 回调换 token→拉用户→upsert users（白名单提权）→session→`/#my`；state 校验失败 `#login-error=state-mismatch` |
| GET | /auth/logout | 销毁 session→`/` |
| GET | /auth/dev-login?openId= | 仅非生产：按 open_id 模拟登录 |
| GET | /auth/me | 当前身份 `{userId,name,role}` 或 401 |

### 4.2 作品 `routes/works.js`
| Method | Path | 说明 |
|---|---|---|
| GET | /works | 公开列表（PG `status='approved' AND published`，平铺 `{session,works}`） |
| POST | /works | 上传作品（写库，pending/未发布；user_id 取登录态，可匿名） |

### 4.3 活动 `routes/activities.js`（核心）
| Method | Path | 说明 |
|---|---|---|
| GET | /activities | 列表（DB 聚合 current/upcoming/past+顶层元字段，同 json 结构；DB 不可用回落 json） |
| GET | /activities/:id | 单活动详情 |
| GET | /activities/:id/ics | .ics 日历（提醒卡片"加入日程"用；依赖 start_at） |
| GET | /activities/:id/signup-form | **公开** 该活动报名模板（无配置返回默认） |
| POST | /activities/:id/reserve | **authRequired** 预约（仅 upcoming）：body `{note?}`；幂等 200 repeated |
| POST | /activities/:id/signup | **authRequired** 报名（仅 current）：body `{contact?, upload?{url,filename,size}, response?{k:v}}`；**name/dept 只取登录态不二次填**；按 profile 校验必填/needUpload；幂等 |
| POST | /activities/:id/signup/upload | **authRequired** 报名文件上传（通用，不限类型，`public/uploads/signup/`，≤ARTIFACT_MAX_MB）→`{url,filename,size}` |
（reserve/signup 成功 → 站内通知 + 飞书卡片，卡片失败仅日志）

### 4.4 管理后台 `routes/admin.js`（写接口 adminRequired；读接口 session admin 看全部、member 只看已发布）
| Method | Path | 说明 |
|---|---|---|
| GET/PATCH | /admin/works[,/:id] | 作品列表 / 审核(status)·发布(published) |
| GET/PATCH | /admin/registrations[,/:id] | 报名列表 / 审核 status |
| GET | /admin/activities/reservations | 预约名单（按活动分组） |
| GET | /admin/activities/signups | 报名名单（含 upload 下载链接+response 字段值） |
| PUT | /admin/activities/:id/signup-form | 保存报名模板（服务端净化 profile） |
| POST | /admin/activities/scan-reminders | 手动触发一轮提醒扫描（aheadHours?） |
| POST/PUT | /admin/community/posts/:id/pin 、/admin/community/config | 社区置顶 / 运营配置 |

### 4.5 个人中心 `routes/my.js`（均 authRequired）
| Method | Path | 说明 |
|---|---|---|
| GET | /my/profile | 用户信息 |
| GET | /my/registrations | 我的报名 |
| GET | /my/works | 我的作品 |
| GET | /my/level | 等级（积分/LV/任务） |
| GET | /my/messages | 站内消息（同 activity_id 多阶段归并为首条+未读数） |
| POST | /my/messages/read | 标记已读（`{id?}` 单条/缺省全部） |
| GET | /my/activity-records | **活动记录**：预约+报名+通知按活动归并 `{activityId,title,kind,statusText,reserved,signedUp,contact,stages[{stage,time,text}]}` |

### 4.6 其它
| Route | 说明 |
|---|---|
| POST /api/register | 报名（PG 第一落点，降级飞书/JSONL） |
| GET/POST /api/vote..., /status, /results | 投票（身份防刷，user_id 落库） |
| /api/artifacts | 制品：POST /(元数据登记)、GET /?work_id、POST /upload(真实文件+所有权)、GET /:id/download(登录态+计数+流式/外链302/占位410) |
| /api/community/posts… | 社区帖子流/评论/点赞/上传/config（契约 `docs/api/posts-api.md`） |
| /api/work-comments | 作品评论+点赞 |

## 5. 前端（`public/app.js`）路由与分区

### 5.1 hash 路由（`HASH_PAGES` + hashchange 监听）
`#home` `#activities` `#community` `#about` `#my` `#admin` `#signup`。
- `#activities?open=<kind>:<id>&from=my`：从个人中心跳转，自动开对应面板 + 显示「← 返回个人中心」临时按钮（kind=current→focus）。
- `#signup?activity=<id>`：独立报名页。

### 5.2 组件分区
| 组件 | 职责 |
|---|---|
| `Nav` | 顶栏（导航/加入社团/铃铛 portal+z5000/管理按钮[admin]/个人中心）；消息弹窗接 `/my/messages` |
| `HeroSection`+`HomeEntryRail`+`HomeHighlights` | 首页巨幕/入口/高亮 |
| `ActivitiesSection` | 活动大厅：本月特展轮播（文案点击→详情面板 enroll）、预约列表(upcoming→reserve)、回顾展墙(past)、物理引擎标题、报名面板（enroll 详情+"前往报名 →#signup"） |
| `CommunitySection` | 社区页（帖子流/评论树/点赞/发布） |
| `MySection` | 个人中心：头部/任务/消息卡/**活动记录**(点击→面板)/我的报名/我的作品 |
| `AdminPage` | 管理控制台 6 标签：作品审核/报名审核/预约名单/报名名单/**报名表单**(构建器+富文本)/提醒系统 |
| `WorkDetail` | 作品详情：`Artifacts`(资源下载+上传)+`WorkComments`+`VoteButton` |
| `SignupPage` | 独立报名页（按模板渲染，只读姓名/部门+上传+动态字段+规则富文本） |

## 6. 飞书与环境变量

| 变量 | 说明 |
|---|---|
| `LARK_APP_ID/SECRET` | 飞书自建应用凭证 |
| `LARK_LOGIN_REDIRECT_URI` | SSO 回调（`http://127.0.0.1:8787/api/auth/callback`；切网同步） |
| `LARK_BITABLE_APP_TOKEN/TABLE_ID` | Bitable 兜底（报名降级） |
| `SITE_INTRANET_URL` | 卡片按钮基地址（**必须内网可达 IP**，热点/公司 WiFi 切换同步） |
| `ADMIN_OPEN_IDS` | 管理员白名单（逗号分隔 ou_；登录只升不降） |
| `REMINDERS_ENABLED/REMINDER_CRON/REMIND_AHEAD_HOURS` | 提醒调度 |
| `ARTIFACT_MAX_MB` | 制品/报名上传上限（默认 50） |
| `SESSION_SECRET` / `NODE_ENV` / `ALLOW_DEV_LOGIN` | 会话/生产/开发登录开关 |

## 7. 端到端链路（已验）

- **登录**：加入社团→飞书授权→回调→users 落库(+白名单提权)→session(PG)→`/#my`。
- **报名（正式 current）**：轮播文案→详情面板「前往报名」→`#signup?activity=`整页（只读姓名/部门，模板字段+可选上传）→提交(signup/upload→signup)→站内+飞书卡片→个人中心「活动记录」。
- **预约（upcoming）**：日程行→reserve 面板→reserve→站内+飞书卡片→记录；开始前提醒扫描推飞书卡+站内。
- **上传→展示→下载**：作品详情 Artifacts 上传（作者/管理员）→列表→登录态下载（字节一致+计数）。
- **社区**：发帖(带图)→评论(缩进梯度,无引导竖线)→点赞；帖子详情整卡点击→详情页(返回吸顶)。

## 8. 运维 / 上线要点

- 迁移：`node server/sql/run_migrate.js`；活动数据：改 `public/data/activities.json` 后 `node server/sql/import_activities.js`；种子社区：`seed_community.js`；管理员存量：`seed_admin.js --list/--promote/--demote`。
- 正式租户部署清单见 `docs/TESTING.md` 末尾；测试环境验收清单散布于 `docs/TESTING.md` 各轮。

## 9. 已知边界 / 待办
- 报名模板字段 key 须 `[A-Za-z0-9_]`（中文名自动下划线式），重名/非法被过滤。
- 上传/制品走本地磁盘，对象存储后续平替（改 storage_url 读写两处即可）。
- 「线下 vs 线上提交」活动编排待单独定规格。
- 部门信息：测试企业 user_info 不返回，报名页只读部门为空（正式租户+contact 权限后可填）；`#admin` 由导航进入。
- 启动链路（已修，2026-09-08 提交在 `sheji` 分支，未启动服务验证）：
  - **npm 解析**：`start.mjs` 新增 `spawnNpm()` 优先用 `process.execPath` 调内置的 `node_modules/npm/bin/npm-cli.js`（`shell=false`，跨环境更稳），找不到时回退 `npm.cmd`（`shell=true`），不再让 npm 安装成为 PATH 依赖。
  - **8787 端口预检**：在 `launchServer` 前先 `checkPort()`，命中本服务 `/api/info` 响应（`ips` 数组）即视为复用，被陌生响应占用则 `process.exit(1)` 并提示用 `--port`。
  - **PG 共享守门**：新建 `pg-keeper.mjs`（动作 `ensure` / `status` / `stop` / `wait` / `touch` / `watch`），**唯一**调 `pg_ctl start` 的入口是 `ensure`，其他服务只走 `wait`；`start.mjs` 启动前自动 `pg-keeper.mjs wait --timeout 30`，失败时打印「请先执行 node pg-keeper.mjs ensure」并退出；不再各自弹审批卡。
  - **空闲回收**：`server/db.js` 的 `query()` 节流写 `logs/pg-heartbeat`（≤10s 一次），`pg-keeper.mjs watch` 检测心跳过期（默认 600s）自动 `pg_ctl stop -m fast`，新流量来时由下次 `ensure` 唤醒。
  - **`ERR_HTTP_HEADERS_SENT`**：根因在 `server/lib/pg-session-store.js` 的 `set`/`destroy` 把 PG 错误通过 `cb(e)` 抛给 `express-session`，响应已发后再被全局错误中间件 `res.json()` 二次写入。修复：`set`/`destroy` 改为 warn+`cb(null)`（与 `get`/`touch` 保持一致），全局中间件再加 `if (res.headersSent) return next(err)` 兜底。
  - **未做的事**：未启动服务、未跑端到端验证、未 commit（等用户审阅）。
