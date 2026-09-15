# 丽珠 AI 社团官网 · 本地部署

> 公司内部员工使用。Node.js + Express 轻量后端 + 静态前端 + 自建 PostgreSQL 存储业务数据；飞书负责登录（SSO）与通知（机器人），另有飞书 AI 问答机器人（qa-bot）在群内解答平台与活动问题。
> 本机作为服务器，LAN 内访问，**不部署公网**。

## 快速启动

需要本机已安装 **Node.js 18+**。

```bash
# 第一次：安装依赖
cd F:\pingce
node start.mjs

# 浏览器打开（控制台会打印）
#   http://127.0.0.1:8787/
#   http://<你电脑内网IP>:8787/   ← 告诉同网段同事

# 停止服务
node start.mjs --stop

# 查看状态
node start.mjs --status
```

启动 AI 问答机器人（飞书群「丽珠AI」）：

```bash
node server/qa-bot/start.js
# 日志：logs/qa-bot.log、logs/qa-bot-stdout.log
```

## 项目结构

```
F:\pingce\
├── start.mjs                # 启动脚本（Node 启动器）
├── README.md                # 本文档
├── server\
│   ├── package.json
│   ├── server.js            # Express 入口
│   ├── lark-client.js       # 飞书开放平台 API 封装（登录/通知）
│   ├── .env.example         # 凭证模板
│   ├── .env                 # 实际凭证（首次启动自动生成）
│   └── qa-bot\              # 飞书 AI 问答机器人
│       ├── start.js         # 启动器（自动杀掉旧进程再起新进程）
│       ├── index.js         # 消息处理入口（状态提示 + 检索 + LLM 回答）
│       ├── kb.js            # 知识库加载与时间感检索
│       ├── llm.js           # LLM 网关调用
│       └── kb\              # 知识库（现役资料）
│           └── archive\     # 往届资料归档（按年份分目录）
├── public\
│   ├── index.html           # 主页（含报名 FAB）
│   ├── app.js               # 主页 React 应用
│   ├── data\
│   │   ├── works.json       # 作品列表（每期编辑）
│   │   ├── activities.json  # 活动列表
│   │   └── schedule.json    # 进度里程碑
│   └── images\              # 静态资源
├── tests\
│   └── qa-bot\              # 机器人自测脚本与基准输出（见下文「自测」）
└── logs\                    # 运行日志
```

## AI 问答机器人（qa-bot）

在飞书群里 @丽珠AI 提问，机器人基于本地知识库回答平台使用与活动相关问题。

**回答流程（每一步群里都有状态提示，没提示 = 机器人挂了）：**

1. @后立即回「收到，正在检索资料…」
2. 检索完成原地更新为「检索完成（命中《xx》），正在生成回答…」
3. 最终原地更新为正式答案；LLM 失败则更新为故障说明

**知识库（`server/qa-bot/kb/`，当前 14 篇）：**

- 平台使用：平台介绍、登录(注册)、访问故障排查、社区功能、消息通知、平台新手指南
- 活动参与：活动总览、活动报名、作品提交、比赛评审、作品巨幕
- 三个活动专项资料：网页设计马拉松 9月赛季、Skill插件工坊·第1期、美术资源设计赛·秋季场

每篇资料开头带「身份牌」（`year` 年份 + `status` 现役/归档）。问「现在/最近」只查现役资料；问「去年/往届」自动改查 `kb/archive/<年份>/` 的归档资料，不会把新旧活动答串。

**回答纪律**：严格按资料回答，资料里没有就明说「暂时没有资料」，不编答案；3-6 句大白话。

**LLM 配置**：模型走 `server/.env` 的 `QA_BOT_LLM_MODEL`（当前 Qwen3.8-27B）。如果模型网关挂了，改成备用模型 `deepseek-v4-flash-jd` 后重启机器人即可。

**自测（改完知识库后跑一遍）：**

```bash
# 检索命中测试：11 个典型问题各自应命中哪篇资料
node tests/qa-bot/kb-test.cjs
# 输出基准在 tests/qa-bot/kb-test.out，预期命中表见 tests/qa-bot/README.md

# LLM 网关连通性测试（只打印模型名，不含密钥）
node tests/qa-bot/test-llm.cjs
```

## API

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/info` | 服务元信息（IP、端口、飞书配置状态） |
| GET | `/api/works` | 作品列表 |
| GET | `/api/activities` | 活动列表（DB 聚合，与原 json 同构；DB 不可用回落 json） |
| GET | `/api/activities/:id` | 单活动详情 |
| GET | `/api/activities/:id/ics` | 活动 .ics 日历（提醒卡片「加入日程」用，公开） |
| POST | `/api/activities/:id/reserve` | 活动预约（需登录，见下文） |
| GET | `/api/my/messages` | 我的站内消息 + 未读数 |
| POST | `/api/my/messages/read` | 标记已读（`{id}` 单条 / `{}` 全部） |
| GET | `/api/admin/activities/reservations` | 预约名单（仅管理员，按活动分组） |
| POST | `/api/admin/activities/scan-reminders` | 手动跑一轮开始提醒扫描（仅管理员） |

### 作品巨幕与社区

- **作品巨幕**：每期一张封面图，封面下方是作品详情布局与该期作品包下载链接（不再是轮播图）。
- **社区页轮播**：支持手指/鼠标滑动切换，也支持点击左右两侧的切换按钮。

### 活动预约与开始提醒

- 活动详情页「预约参加」（需飞书登录）→ 写 `activity_reservations`（幂等，重复点返回 already）；活动开始前 24h 内由调度器自动推送**开始提醒**
- 推送通道：飞书 `open_id`（`ou_` 开头）→ 机器人单聊**交互卡片**（`im:message:send_as_bot`，含「查看详情 / 加入日程」按钮，链接需配 `SITE_INTRANET_URL`；卡片失败自动回退纯文本）；非 ou_（如 dev 测试号）→ 优雅降级，仅站内通知
- **去重**：`activity_reminders(reservation_id, kind='pre_start')` 唯一约束，一条预约只提醒一次；发送失败不落记录、下轮重试
- **调度**：`node-cron` 每 `REMINDER_CRON`（默认每小时）跑一次 `lib/reminders.runReminders`；`REMINDERS_ENABLED=0` 关闭；管理员也可 `POST /api/admin/activities/scan-reminders {aheadHours?}` 手动触发
- **提醒文案占位**：当前 `start_at` 为月中/月末占位值，排期确定后请改成真实时间并重新导入

### POST /api/register

请求体：

```json
{
  "name": "张三",
  "department": "研发中心",
  "contact": "13800000000",
  "activity": "AI 训练营",
  "willShare": true,
  "shareTopic": "RAG 在临床检索中的实践",
  "remark": "对 Agent 感兴趣"
}
```

返回：

```json
{
  "ok": true,
  "recordId": 12,
  "status": "pending",
  "createdAt": "2026-09-12T00:00:00.000Z"
}
```

数据第一落点为本地 PostgreSQL（`registrations` 表）；PG 故障时暂存 `logs/registration_fallback.jsonl`，恢复后可补录，报名不丢失。

## 飞书自建应用凭证（登录 + 机器人通知）

后端需要企业自建应用的 `LARK_APP_ID` / `LARK_APP_SECRET`（`server/.env`）：

1. 登录 https://open.feishu.cn/app → 企业自建应用 → 创建；
2. 开启「网页应用」能力（SSO 登录，回调地址在「安全设置」登记，值同 `LARK_LOGIN_REDIRECT_URI`）与「机器人」能力（通知推送）；
3. 权限按需勾选：`im:message:send_as_bot`（机器人发消息）、`authen:user.id:username`（登录用户信息）等；
4. 版本管理与发布 → 创建版本 → 提交发布；
5. 基础信息页复制 `App ID` / `App Secret` 填入 `server/.env`，重启服务。

> 历史说明：早期版本曾把报名写入飞书多维表格，已按架构方向（数据主库为自建 PostgreSQL）整体移除。

## 局域网内其他员工访问

服务默认监听 `0.0.0.0:8787`。同 WiFi / 同网段的同事可通过你的内网 IP 访问：

```
http://<你的内网IP>:8787/
```

如何查看你的内网 IP：
- `Win + R` → `cmd` → `ipconfig` → 找「IPv4 地址」
- 或在服务启动时看控制台输出

防火墙可能拦截首次访问（Windows 防火墙弹窗），**允许访问**即可。

不在同网段（含家里/4G）访问不到，这是「本机当服务器」的天然限制。

## 数据库迁移（PostgreSQL）

后端数据表全部在本地 `pingce` 库。启动前需保证服务已运行（`E:\PostgreSQL\launch_pg.cmd` 拉起 PG）。

```bash
# 建表/补列（幂等，可重复执行）
cd F:\pingce
node server/sql/run_migrate.js
```

迁移脚本按文件名顺序执行 `server/sql/*.sql`：`schema.sql`（基线）→ `004_*` → `005_community.sql`（社区帖子/评论/点赞/配置）→ `006_work_comments.sql`（作品评论）→ `007_activities.sql`（活动落库/预约/站内消息）→ `008_activity_reminders.sql`（start_at 列 + 提醒去重记录）→ `009_sessions.sql`（session 落 PG）。升级时拉取新 SQL 后重跑一次 `run_migrate.js` 即可；活动数据变更后另跑 `node server/sql/import_activities.js` 刷新入库。

> 登录态持久化：session 存 PostgreSQL（`lib/pg-session-store.js`），修复此前 memory store「服务重启全员掉线 / OAuth 回调中途重启即 state-mismatch」——现在重启不清登录态，7 天免登录。

## 每期更新作品

1. 编辑 `public/data/works.json`，修改 `works` 数组（每件作品 id/title/author/category/desc）
2. 改 `session` 字段（如「第 02 期」）和 `updatedAt` 日期
3. 保存即生效（前端下次刷新即拉到新数据，无需重启服务）

## 已知限制

- **不公网访问**：仅 LAN。需要公网请加内网穿透或部署到云。
- **并发量**：单 Node 进程，~百级并发没问题，**不适合数千并发**。
- **HTTPS**：当前 HTTP 内网环境，敏感信息靠 LAN 隔离。
- **飞书应用凭证**：登录与机器人通知依赖自建应用凭证（一次性配置，见上文）。
- **`public/admin.html` 为旧后台产物，已废弃**：站内无任何入口链接（已核实），文件暂时保留不再迭代。管理功能后续归并进「账号权限」体系（有管理权限的账号在个人中心获得专属入口）。
