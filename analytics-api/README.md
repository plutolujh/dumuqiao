# analytics-api

独立的 Cloudflare Web Analytics 只读代理服务。

## 为什么单独拆出来

`/api/analytics` 最初实现在 tide 的 `sync-server.js`（:3001）里，导致 **dumuqiao 的
dashboard 在运行时依赖 tide 这个项目**——tide 的进程一挂，dumuqiao 的统计图就没了，
尽管 dumuqiao 本身完全正常。

拆成独立服务后（:3002）：

| | tide | analytics-api |
|---|---|---|
| 目录 | `/var/www/tide` | `/var/www/analytics-api` |
| 端口 | 3001（仅 `127.0.0.1`） | 3002（仅 `127.0.0.1`） |
| systemd 单元 | `blog-sync-server.service` | `analytics-api.service` |
| 职责 | `POST /api/sync` 触发同步 | `GET /api/analytics` 只读取数 |
| 凭据 | `SUPABASE_*` / `MINIMAX_API_KEY` / `SYNC_TOKEN` | 仅 `CLOUDFLARE_API_TOKEN` 等三个 |
| 依赖 | 无 | 无（纯 Node，零 npm 依赖） |

**双向故障隔离**（实测）：

- 停掉 tide → dumuqiao 的 `/api/analytics` 仍然 200
- 停掉 analytics-api → tide 的 `/health`、`/api/sync` 仍然正常，dumuqiao 首页不受影响

## 关键设计

- **纯 Node**：只用 `node:http` + `node:fs`，无 npm 依赖，不需要 `npm install`
- **只监听 127.0.0.1**：必须经 nginx 反代，公网不可直连
- **独立凭据文件**：`/etc/analytics-api/analytics.env`（0640 root:www-data）。
  该服务**不读** `/var/www/tide/.env`，因此即使被攻破也拿不到 Supabase / MiniMax 密钥
- **60 秒缓存**：Cloudflare GraphQL 查询消耗配额，缓存后响应从 ~2.6s 降到 ~0.28s
- **只读**：从不写 Supabase，从不 spawn `sync-all.js`

## 部署

由 dumuqiao 仓库的 `.github/workflows/deploy.yml` 自动部署：

1. `analytics-api/` 目录 rsync 到 `/var/www/analytics-api/`
2. `analytics-api.service` 安装到 `/etc/systemd/system/`
3. `systemctl restart analytics-api`

配置（凭据）**不在仓库里**，需在服务器上手动创建：

```
/etc/analytics-api/analytics.env
  CLOUDFLARE_ACCOUNT_ID=...
  WA_SITE_TAG=...
  CLOUDFLARE_API_TOKEN=...
```

## 接口

| 路由 | 说明 |
|---|---|
| `GET /api/analytics?days=N` | Cloudflare RUM 统计，`days` 取值 1–30，默认 7 |
| `GET /health` | 健康检查，返回 `configured` 表示凭据是否齐全 |

nginx 侧（`dumuqiao.hao123456.cn`）：

```nginx
location /api/analytics {
    proxy_pass http://127.0.0.1:3002;
}
```
