# 测试环境全链路验收报告

> 环境：本机 `node start.mjs`（LAN:8787）+ 本地 PostgreSQL(`pingce`) + 飞书**测试企业**自建应用（`测试it服务平台` cli_aa0ff9fd4ef85d1d）。
> 结论：**展示 / 报名 / 预约 / 记录 / 社区会话 / 消息通知 / 制品上传下载 / 登录持久性 八项全绿**，可进行正式应用部署。

| # | 能力 | 验证方式 | 结果 |
|---|---|---|---|
| 1 | 上线·展示 | LAN 起服务；作品巨幕/详情、活动大厅、社区信息流渲染；作品详情含「作品资源」下载区 | ✅ |
| 2 | 活动报名 | `POST /api/register`（UTF-8）→ registrations 落库 `recordId/status=pending` → 管理控制台报名审核通过 | ✅ |
| 3 | 活动预约 | `POST /api/activities/:id/reserve`：首次 201 / 重复幂等 200「您已预约过」/ past·current 400 / 未登录 401 | ✅ |
| 4 | 记录 | DB 计数核对：works 29 / posts 17 / comments 42 / registrations（种子 2）等基线一致 | ✅ |
| 5 | 社区会话 | 发帖 → 评论/回复（NL 式连贯轨道线）→ 帖子/评论点赞，端到端一致 | ✅ |
| 6 | 消息通知 | 站内铃铛未读角标 + 弹层真实数据；活动开始**飞书交互卡片**真实送达测试号（含「加入日程」.ics） | ✅ |
| 7 | 上传→下载 | 中文文件名 + 中文说明上传 → 作品详情正确显示 → 登录态下载字节完全一致 + downloads 计数 +1 | ✅ |
| 8 | 登录持久性 | session 落 PG（`sessions` 表）；服务多次重启后 `/api/auth/me` 仍认证、右上角仍「个人中心」 | ✅ |

## 制品上传下载 · 关键实现与坑

- 存储：`public/uploads/artifacts/<genId>.<ext>`，`express.static` 直供；`GET /api/artifacts/:id/download`（`authRequired`）流式回传 + 计数；外链 302 / 占位 410 诚实处理。
- **所有权**：`authRequired` + 作者（`works.user_id===session.userId`）或 `admin` 才可挂资源。
- **中文名编码坑（已解）**：multipart header 里的 `filename` 被 busboy 有损 UTF-8 解码（丢字节、不可逆）。解法=前端额外用**文本字段 `origname` 传 `file.name`**（文本字段无损），后端优先取它。社区上传同理修（`utf8Field` 兜底 latin1 还原）。
- 测试须知：Windows Git Bash 的 `curl -F/-d` 按 GBK 发送中文会触发枚举/编码报错——**这是 shell 编码问题非应用缺陷**，用 node fetch（UTF-8）或真实浏览器验证即通过。

## 上线/测试要点（第二轮 · 报名/预约体系重构）
（2026-09-06 新增，随 `46643d7`/`eb2be28` 验证）

| 项 | 验证结论 |
|---|---|
| 报名（本月特展＝正式活动） | 轮播文案点击→详情面板 SIGN UP 报名表（姓名/部门登录预填、备用联系方式选填）；仅 kind='current' 可报；重复幂等「您已报名过」 |
| 预约（九月征集等＝消息提醒） | upcoming 保持 RESERVE 预约表；同活动多阶段通知归并为首条（body=最近阶段） |
| 活动记录 | 个人中心新增记录卡（预约/报名/通知阶段线性时间线）；点击→活动页自动开对应面板；带「← 返回个人中心」临时按钮（仅从个人中心跳转时出现）；返回后参数已清不重复弹 |
| 管理入口 | 顶栏「管理」按钮（仅 admin）→ `#admin` 独立管理页（作品/报名/预约/报名名单/提醒 5 标签）；个人中心不再重复管理块 |
| 消息弹窗 | portal 至 body + zIndex 5000，不被重置标题/任何按钮遮挡；消息点击跳个人中心 |
| 评论层级 | 引导竖线全删（社区+作品页），保留缩进梯度 |
| 回顾/飞书 | 回顾点击可开；报名/预约成功即发飞书交互卡片（测试号非 ou_ 则优雅降级仅站内） |

**已知边界**：`#admin` 由导航进入（hash 同步历史行为未变）；部门为空时靠报名表单手填兜底（测试企业 user_info 无部门）；作品提交类活动入口待单独讨论。

## 上线/测试要点（第三轮 · 报名表单系统）
（2026-09-07 新增，随 `9fa5423`/`2d70e01` 验证）

| 项 | 验证结论 |
|---|---|
| 报名模板（模块化） | 管理后台「报名表单」标签按活动配置：联系方式/作品上传/组队/截止开关 + 富文本规则 + 动态字段(text·textarea·select·radio·checkbox·number·date/必填/选项)；保存即生效（GET signup-form） |
| 富文本净化 | 服务端白名单净化：`<script>`、`on*`、`javascript:` 被删，`b/i/u/ul/li/h/p/a` 保留（实测脚本注入被清除） |
| 独立报名页 | `#signup?activity=` 整页：只读姓名/部门（登录态，**不二次填**）+ 按模板动态字段 + 作品文件上传（不限类型）+ 规则富文本展示 + 必填校验；提交→站内+飞书卡片 |
| 报名文件上传 | 通用上传 `public/uploads/signup/`，中文文件名（utf8Field）正确 |
| 报名名单 | 管理后台含「作品文件下载链接 + 自定义字段值（含组队）」 |
| 入口 | 轮播文案/详情面板 →「前往报名 →」跳独立报名页 |

**字段 key 约定**：构建器字段 key 由 label 生成需为 `[A-Za-z0-9_]`（中文名会自动生成下划线式），重名/非法被过滤——提示用英文或拼音式字段名更稳。

**已知边界**：上传文件走本地磁盘（后续平替对象存储）；"作品提交类活动"（线下 vs 线上提交）的编排待单独讨论。

## 正式部署前最终检查清单（切换到生产/正式租户时）

1. **正式租户飞书应用**：在丽珠正式企业租户重建自建应用，开 `authen`（登录）+ `im:message:send_as_bot`（提醒）+（可选）contact 部门读；配 `重定向URL`、加管理员 open_id；发版本审批通过。
2. **`.env`**：`LARK_APP_ID/SECRET` 换正式应用；`LARK_LOGIN_REDIRECT_URI` + `SITE_INTRANET_URL` 填**公司 WiFi 网段内网 IP**（当前为热点 IP，切网必改）；`SESSION_SECRET` 强随机；`NODE_ENV=production`；`ALLOW_DEV_LOGIN=0`。
3. **管理员名单**：正式环境把管理员工号 open_id 写入 `ADMIN_OPEN_IDS`，或 `node server/sql/seed_admin.js --promote <open_id>`。
4. **活动真实排期**：`activities.json` 的 `upcoming[].start_at` 由占位改为真实时间 → `node server/sql/import_activities.js`。
5. **数据库迁移**：部署环境按序跑 `node server/sql/run_migrate.js`（现含 007/008/009）。
6. **对象存储**（Phase E，可后续）：制品现本地磁盘，量大/持久化诉求再平替为对象存储（接口不变，改 `storage_url` 读写两处）。
7. **内网发布**：走基建「内网应用网站发布」流程登记地址（B3 待对齐）。
