# ZianTT GuestBook

极客风格留言板，融入 CTF/网络安全元素。前端基于 **React + Next.js + Tailwind CSS**，运行在 **Cloudflare Pages**（Edge/Workers 运行时），数据持久化使用 **Workers KV**。

> ⚠️ **部署平台说明**：Next.js App Router 只能运行在 **Cloudflare Pages**，不能部署到纯 Workers。Pages 本身就是基于 Workers 运行时构建的，因此完全满足 Edge 部署需求。

## 功能特性

- **极客 & CTF 终端风格**：深色背景、终端绿/琥珀/红色调、等宽字体、ASCII 艺术标题
- **留言提交**：支持昵称（可匿名随机生成）、邮箱、网站、Markdown 内容（封顶 2000 字）
- **Gravatar 头像**：根据访问者 IP 所在国家自动选择官方源或国内镜像源（cravatar.cn）
- **PoW 验证码**：提交前需完成 SHA-256 哈希工作量证明，有效防止垃圾留言
- **自动分页**：留言列表自动分页展示
- **点赞 & 分享**：支持点赞计数，一键分享到 X (Twitter)
- **引言图片**：针对单条留言生成终端风格的引言卡片并下载 PNG
- **管理后台 `/c0ns1e`**：使用 `SECRET_PWD` 登录后可置顶、编辑、软删除留言或修改公告
- **响应式布局**：适配手机端与 PC 端

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19
- **样式**: Tailwind CSS
- **运行时**: Cloudflare Edge Runtime (Pages Functions)
- **存储**: Cloudflare Workers KV
- **安全**: PoW (Proof of Work) + JWT Admin 认证

## 本地开发

```bash
npm install
```

创建 KV Namespace（只需一次）：
```bash
npx wrangler kv namespace create "GUESTBOOK_KV"
# 将返回的 id 与 preview_id 填入 wrangler.toml
```

配置本地环境变量：
```bash
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars，设置 SECRET_PWD=你的管理员密码
```

启动本地开发服务器：
```bash
npm run pages:dev
```

## 部署到 Cloudflare Pages

### 方式一：Cloudflare Dashboard 直连（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)，进入 **Pages**
2. 点击 **Create a project** → **Connect to Git**
3. 选择你的仓库，配置如下：

| 配置项 | 值 |
|--------|-----|
| **Framework preset** | None |
| **Build command** | `npm run pages:build` |
| **Build output directory** | `.vercel/output/static` |

4. 在 **Settings** → **Functions** → **KV namespace bindings** 中添加：
   - Variable name: `GUESTBOOK_KV`
   - 选择你创建的 KV namespace
5. 在 **Settings** → **Environment variables** 中添加：
   - `SECRET_PWD` = 你的管理员密码
6. 保存并部署

### 方式二：GitHub Actions 自动部署

1. 在 Cloudflare Dashboard 获取 **Account ID** 和 **API Token**（需包含 `Cloudflare Pages:Edit` 权限）
2. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. 推送代码到 `main` 分支，GitHub Actions 将自动构建并部署

> ⚠️ 不要设置 `deploy command`。Pages 会在构建完成后自动部署。

## 环境变量

| 变量名 | 说明 | 配置位置 |
|--------|------|----------|
| `SECRET_PWD` | 管理后台登录密码 | Pages Dashboard → Environment variables |
| `GUESTBOOK_KV` | KV Namespace 绑定 | Pages Dashboard → Functions → KV bindings |

## 项目结构

```
GuestBook/
├── src/
│   ├── app/
│   │   ├── api/          # Edge API Routes
│   │   ├── c0ns1e/       # 管理后台页面
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx      # 留言板首页
│   ├── components/       # React 组件
│   ├── lib/              # 工具函数 (PoW, MD5, JWT)
│   └── types.ts          # TypeScript 类型定义
├── .github/workflows/    # GitHub Actions CI/CD
├── wrangler.toml         # 本地开发 KV 绑定配置
├── .dev.vars             # 本地环境变量
└── package.json
```

## 常见问题

**Q: 为什么不能用 `wrangler deploy` 部署到 Workers？**
A: Next.js App Router 需要 Pages 平台的 Functions 与路由支持。纯 Workers 项目没有这些能力。Pages 同样运行在 Edge/Workers 运行时上，性能没有区别。

**Q: Windows 本地无法运行 `npm run pages:build`？**
A: `@cloudflare/next-on-pages` 在 Windows 下存在已知兼容性问题。请使用 WSL2、macOS、Linux 进行本地构建，或直接通过 Cloudflare Pages/GitHub Actions 云端构建。

## 许可证

MIT
