# 本地环境交接 · HANDOFF-LOCAL-ENV

> 版本：2026-09-08
> 用途：本仓库在一台 Windows 设备上完成了「拉取 → 建库 → 迁移 → 种子 → 启动」的本地搭建。
> 推送远端后，新的设备按本文件即可复现/接管。**凭据不在仓库里**（`server/.env` 已 gitignore），`LARK_*`、`DB_PASSWORD`、`SESSION_SECRET` 都需在新机器重新填本机的值。
> 架构级交接（模块分区/接口契约/数据模型）见 `docs/HANDOFF.md`，本文件只补「设备侧环境状态与口令陷阱」。

---

## 0) 搭建完成的源设备（参考状态）

| 项 | 本机取值 |
|---|---|
| 仓库目录 | `F:\pingce` |
| Node | v22.23.2（要求 18+） |
| 服务端口 | 8787（`node start.mjs`） |
| PostgreSQL | 独立安装于 **`E:\PostgreSQL`**，数据目录 `E:\PostgreSQL\data` |
| 连接 | postgres 用户 / `127.0.0.1:5432` / 库 `pingce` |
| 迁移 | 11 个脚本成功（004~013，含 011 双文件） |
| 种子 | `works`=29，`activities`=10 |
| 本机当前 WLAN IP | `192.168.1.6`（换网络/热点后以 `/api/info` 的 `ips` 为准） |

---

## 1) 数据库口令陷阱（最关键）

- 本机 `postgres` 真实口令是 **123456**，`server/.env` 中 `DB_PASSWORD=123456`，已验证可正常连接。
- 旧文档记录的 `382114` 已失效，使用该口令会报"密码认证失败"。
- PG 采用 `scram-sha-256` 认证；`.env` 显式传 `DB_PASSWORD` 会绕过 pgpass 文件自动回落，因此必须与真实口令一致。
- PG 可执行文件位于 `E:\PostgreSQL\bin\`，`pg_ctl` / `psql` 均用绝对路径调用。
- 本机 `server/.env` 当前写的是 `DB_PASSWORD=123456`。

**换设备必做**：先实测，再填 `.env`。不要照抄本机的 123456：
```bash
# 在目标机跑（Windows 用绝对路径，PG bin 在 E:\PostgreSQL\bin）：
set PGPASSWORD=你的口令 && E:\PostgreSQL\bin\psql.exe -h 127.0.0.1 -U postgres -d postgres -c "SELECT 1;"
# 能过 = 该口令可用；把实测口令写入 server/.env 的 DB_PASSWORD
```
若需修改口令：`ALTER USER postgres PASSWORD '新口令';`，然后同步更新 `.env` 的 `DB_PASSWORD`。

---

## 2) 在新设备上接管（全量重跑一遍，幂等）

```bash
git clone <远程仓库> pingce && cd pingce
cd server && npm install && cd ..

# 建库（若已存在则跳过）
#   Windows: PG bin 在 E:\PostgreSQL\bin，用绝对路径
E:\PostgreSQL\bin\createdb.exe pingce

# 拷贝模板并编辑 server/.env（按上文填 LARK_*、DB_*、SESSION_SECRET、SITE_INTRANET_URL）
cp server/env.example server/.env

# 建表（幂等，可重复执行）
node server/sql/run_migrate.js

# 种子数据
node server/sql/seed.js                 # works：29 件
node server/sql/import_activities.js    # activities：10 个

# 启动 PG（如未运行；start.mjs 会自动 wait，但 ensure 可提前确认）
node pg-keeper.mjs ensure

# 启动（自带 /api/info 健康检查）
node start.mjs
# 访问 http://127.0.0.1:8787/
# 停止 node start.mjs --stop    状态 node start.mjs --status
```

---

## 3) `server/.env` 按机器填写的项（全部不可提交）

| 变量 | 说明 |
|---|---|
| `LARK_APP_ID` / `LARK_APP_SECRET` | 飞书自建应用凭证（本机已填真实值；新设备重新填） |
| `LARK_BITABLE_APP_TOKEN` / `LARK_BITABLE_TABLE_ID` | Bitable 兜底（报名降级） |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | 按本机 PG 实测填写（口令见第 1 节） |
| `SITE_INTRANET_URL` | 必须「用户设备可访问」的内网地址，写 `http://<本机LAN IP>:8787/`，**别用 127.0.0.1**；换网同步 |
| `SESSION_SECRET` | 强随机串：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_OPEN_IDS` | 管理员白名单（逗号分隔 `ou_`，登录只升不降） |
| `ALLOW_DEV_LOGIN` | 非生产 `=1`；生产 `NODE_ENV=production` 时删除/关闭 |

---

## 4) 常用运维命令

| 命令 | 作用 |
|---|---|
| `node start.mjs` | 启动（PID 写 `logs/server.pid`，运行输出 `logs/server.log`） |
| `node start.mjs --stop` | 停止 |
| `node start.mjs --status` | 状态 |
| `node pg-keeper.mjs ensure` | 启动 PostgreSQL（仅当未就绪时） |
| `node pg-keeper.mjs status` | 查看 PG 就绪状态 |
| `node pg-keeper.mjs stop` | 停止 PostgreSQL |
| `node pg-keeper.mjs wait` | 等待 PG 就绪（默认 30s 超时） |
| `node server/sql/run_migrate.js` | 迁移（幂等） |
| `node server/sql/import_activities.js` | 活动数据刷新（改 `public/data/activities.json` 后执行） |
| `node server/sql/seed_admin.js --list|--promote|--demote` | 存量管理员处理 |

---

## 5) 本机当前状态速查（开机/重启后核对）

- 服务是否在跑：`node start.mjs --status`（或 `curl http://127.0.0.1:8787/api/info`）
- 当前 IP 是否变化：见 `/api/info` 的 `ips` 字段，若变了就同步更新 `.env` 的 `SITE_INTRANET_URL`。
- 最近一次已验状态：PID 36644，`/api/info` 返回 `{"service":"livzon-ai-club","version":"1.0.0","port":8787,"ips":[{"name":"Mihomo","ip":"198.18.0.1"},{"name":"Tailscale","ip":"100.67.163.44"},{"name":"WLAN","ip":"192.168.1.6"}],"larkConfigured":true,"fallbackEnabled":true}`。
