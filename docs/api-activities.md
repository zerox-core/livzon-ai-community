# 活动模块 API 对接文档（预约 + 滑块详情 + 投信口）

> 分支 `feat/interaction-motion` · 2026-09-07 · 供后续合并对接时使用。
> 前端入口：`app.js`（活动大厅页 `#activities`）；后端入口：`server/routes/activities.js`（挂载前缀 `/api/activities`）。

## 0. 通用约定

- 响应契约（`server/utils/contract.js`）：成功 `{ ok: true, data: ... }`；失败 `{ ok: false, error: { code, message } }`。
- 错误码枚举：`VALIDATION`（参数不合法）/ `NOT_FOUND` / `AUTH`（未登录）/ `PERMISSION` / `CONFLICT` / `RATE_LIMIT` / `INTERNAL` / `MOCK_UNAVAILABLE`。
- 需登录的接口走 `authRequired` 中间件（session 登录态），未登录返回 401 `{ ok:false, error:{ code:'AUTH', ... } }`；前端约定 401 一律引导去 `/login.html`。
- 数据源：`activities` 表（字段含 id / kind / title / date_label / location / data / start_at），列表数据由 `loadActivities()` 组装出 `{ current, upcoming, past, types }`。

## 1. 已上线接口（v1 现状）

### 1.1 GET /api/activities — 活动列表
公开。返回 `ok({ current, upcoming, past, types })`。前端活动大厅整页数据源。

### 1.2 GET /api/activities/:id — 单活动详情
公开。在 current+upcoming+past 全集里按 id 查找，找不到 404 `NOT_FOUND`。用于「查看回顾」弹窗与预约前校验。

### 1.3 GET /api/activities/:id/ics — 日历文件
公开。依赖 `activities.start_at`（无 start_at 或活动不存在 → 404 纯文本）。生成 .ics（默认时长 2 小时，含提前 30 分钟提醒）。飞书提醒卡片的「加入日程」按钮指向它。

### 1.4 POST /api/activities/:id/reserve — 预约活动（对应「02 预约消息通知」区）
需登录。JSON body `{ note? }`（≤500 字）。身份取登录态，姓名/部门快照落库。
- 活动不存在 → 404；活动非 upcoming → 400 VALIDATION。
- `UNIQUE(user_id, activity_id)` 幂等：重复提交不报错不累积，返回 200 `ok({ reserved:true, repeated:true, message:'您已预约过该活动' })`。
- 首次成功 → 201 `ok({ reserved:true, repeated:false, message:'预约成功' })`。
- 前端调用点：`app.js` 预约面板表单 submit（actPanel 内），成功后 1.4s 自动收起面板。

### 1.5 POST /api/activities/:id/letters — 投信口（LETTER BOX，私信主办方）
需登录。multipart（multer `single('file')`，内存中转）：
- `note`：文本留言 ≤1000（超长截断）；`origname`：原始文件名 ≤255；`file`：可选，≤20MB。
- 「留言与文件至少投递一项」否则 400 VALIDATION。
- 文件类型白名单 `LETTER_EXT`（服务端为准）：zip/tar/gz/tgz/rar/7z、mp4/mov/webm/mp3/wav、pdf/docx/xlsx/pptx/txt/md、png/jpg/jpeg/gif/webp、json/js/ts/py/csv/html。不在白名单 → 400 `不支持的文件类型：<ext>`。
- 超过 20MB → 400 `文件超过 20MB 上限`（multer LIMIT_FILE_SIZE）。multer 未安装 → 501 MOCK_UNAVAILABLE。
- 语义：**一人可多次投信**（与 reserve 的幂等预约不同）。文件随机名落 `public/uploads/letters/`，防路径穿越。
- 落库表 `activity_letters`（activity_id / user_id / name / dept / note / file_name / file_size / storage_url），仅管理员后台可见，公开面板零留痕。
- 成功 → 201 `ok({ id, delivered:true })`。

## 2. 预留接口（v35 前端已埋点，等后端实现后直接生效）

### 2.1 GET /api/activities/:id/detail — 滑块详情内容数据源 【预留，未实现】
「预约消息通知」区滑块卡片右层（IDEA · 创作思路）目前用前端内置文案（`IDEA_COPY` 常量 + 兜底 `IDEA_FALLBACK`）。v35 已埋探测点：页面加载后对**第一个 upcoming 活动**请求该接口：
- **404 / 非 ok / 异常 → 静默回退前端内置文案**（现网行为不变，控制台无报错）。
- 返回 `{ ok:true, data:{ idea, overview } }` 时自动填充该活动的 `.skc-idea`（IDEA 文案）与 `.skc-b-desc`（概要描述）。
- 建议响应 schema（合并时后端实现按此对齐，或反过来告知前端调整字段名）：

```json
{
  "ok": true,
  "data": {
    "id": "act-xxx",
    "idea": "创作思路正文（纯文本或受控富文本）",
    "overview": "活动概要描述（替换 OVERVIEW 层 desc）",
    "letterbox": { "enabled": true, "hint": "投信口副标题文案（可选）" }
  }
}
```

- 前端探测点位置：`app.js` 搜 `v35 预留：滑块详情内容 API`（ActivitiesSection 渲染 effect 尾部）；当前只探测第一个 upcoming，若后端支持全量，可改为逐行探测或列表接口内嵌。

### 2.2 letters v2 — 富文本 + 多附件 【预留，未实现】
v35 投信口已改为富文本编辑器 + 附件能力，前端已按以下方向预留：
- **`note_html` 字段已随请求送出**（multipart 文本字段，内容为编辑器 innerHTML）。当前服务端 multer 只解析已知字段、未知文本字段被忽略——后端落库时直接读 `note_html` 即可，**前端无需再改**。若暂不做富文本，`note` 仍是纯文本（编辑器 innerText），完全兼容 v1。
- **多附件**：当前前端一次只送一个 `file`（服务端 `single('file')` 约束；粘贴/拖入多文件时取第一个并提示）。v2 若放开多附件：服务端改 `array('files', N)`，前端改 chips 数组 + FormData 多次 append，改动点集中在 `app.js` 的 `_v35Get` / `addFile`（搜 `v35 投信口`）。

## 3. 前端调用点索引（app.js，v35 后）

| 功能 | 位置 | 说明 |
| --- | --- | --- |
| 活动列表渲染 | `ActivitiesSection`（`/api/activities`） | upcoming.map 渲染滑块卡片 + 投信口 |
| 预约提交 | actPanel 内表单 submit | `POST .../reserve`，401 → 引导登录 |
| 投信提交 | `window.__actLetter(btn)` | `POST .../letters`，FormData：note + note_html + origname + file |
| 投信 UI 接线 | 搜 `v35 投信口：富文本编辑` | 富文本工具条 / ＋附件按钮（桌面直开系统框、触屏弹媒体/文件浮层）/ 拖入 / 粘贴 / chip / 字数 |
| 详情探测 | 搜 `v35 预留：滑块详情内容 API` | `GET .../detail`，404 静默回退 |

## 4. 合并对接说明

- 合并 `feat/interaction-motion` → 主分支时，后端按第 2 节实现预留接口即可让滑块详情文案切到数据库驱动；不实现也不影响现有功能（全部静默回退）。
- 对接左右布局/字段命名以本文件为基线，有出入直接改本文件同步。
