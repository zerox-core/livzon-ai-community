# BUG 清单

> 记录已定位、待排期修复的问题。修复后请把条目移到文末「已修复」并注明 commit。

---

## BUG-001 社区发布失败一律误报「登录后才能发布」+ `.exe` 附件不在白名单

- **发现日期**：2026-09-10（本机 main 分支 e691a02，浏览器实测复现）
- **现象**：用户已登录（头部显示个人中心，会话表中确有当天的会话记录），在社区发布带 3 个附件（`.xlsx` / `.png` / `.exe`）的帖子时，点击「发布」闪现红字 **「登录后才能发布（线上接口启用时生效）」**，发布失败；实际并非未登录。
- **根因（两层）**：
  1. **附件类型白名单拒绝 `.exe`**：`server/routes/community.js` 的 `DOC_EXT` 仅允许 `pdf/xlsx/docx/zip/pptx/txt/md`（图片 `IMG_EXT` 另计）。`.exe` 上传被 `400 不支持的文件类型：exe` 拒绝，导致整次发布中断。
  2. **前端错误提示误导**：`public/app.js` 的 `comSubmitPublish`（约 5124–5138 行）把**所有失败**（401 未登录 / 400 校验拒绝 / 500 / 网络错误 / catch 兜底）统一显示同一句「登录后才能发布」，掩盖真实原因。
- **证据**（curl 实测，合法会话）：
  - 上传 `.exe` → `HTTP 400 {"ok":false,"error":{"code":"VALIDATION","message":"不支持的文件类型：exe"}}`
  - 上传 `.xlsx` → `HTTP 200` 正常
- **附带限制**：附件单文件上限 20MB（`/api/community/upload` multer limits），大安装包即使加白名单也会被拒；图片上限 5MB。
- **修复建议**：
  1. 前端：把服务器返回的具体 `error.message`（如「不支持的文件类型：exe」）显示到 `com-pub-hint`，401 才显示「登录后才能发布」——无论是否扩白名单都建议先修；
  2. 后端（按需）：如需支持发安装包，`DOC_EXT` 增补 `exe/msi` 等并同步更新 `docs/api/posts-api.md`；
  3. 替代方案（不改代码）：大文件/安装包走「个人中心 → 我的资源」上传（程序类白名单更宽），发布时用「🗂 我的资源」勾选引用。
- **涉及文件**：`public/app.js`（comSubmitPublish / com-pub-hint）、`server/routes/community.js`（DOC_EXT、uploadOne 错误透传）、`docs/api/posts-api.md`。
- **优先级**：中（误导性提示影响排查效率；类型限制视产品需求定）。
- **状态**：待修复

---

## 已修复

（暂无）
