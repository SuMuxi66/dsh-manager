# dsh-manager · DSH 管理控制台

DeepSeek Harness 的**插件管理控制台**（双面插件）：侧边栏一键打开管理面板，
提供插件清单/启停/卸载、插件市场浏览与一键安装。Web 端与桌面端通用
（共享 `~/.dsh/profiles/web`）。

## 安装

```sh
# 方式一：GitHub 仓库（需已发布 npm 时优先方式二）
npx @deepseek-ai/dsh plugin --profile web add link:<本仓库路径>
# 方式二：npm（发布后）
npx @deepseek-ai/dsh plugin --profile web add dsh-manager
```

重启 web / 桌面端后，侧边栏底部出现 ⚙ 入口。

## 功能

| 模块 | 能力 |
|---|---|
| **插件管理** | 实时 loader 清单（145+ 行）、运行时启用/禁用（`loader.update`）、持久卸载（`dsh plugin remove`） |
| **插件市场** | GitHub `topic:dsh-plugin` 实时搜索（30 条）+ 内置精选列表合并（42 卡片），一键安装（`dsh plugin add`） |
| **安装输入框** | 支持 npm 包名 / `github:owner/repo`，安装输出实时回显 |

## 环境变量

| 变量 | 含义 |
|---|---|
| `DSH_MANAGER_GITHUB_PROXY` | GitHub API 抓取与 git 安装子进程的 HTTP 代理（如 `http://127.0.0.1:7890`） |
| `DSH_MANAGER_DSH_BIN` | 覆盖 dsh CLI `lib/bin.js` 路径（默认：healed profiles/node_modules → require.resolve） |

## 开发

```sh
npm install
npm run build        # tsc + tsdown → lib/（index.js host 半 + client.js 浏览器半）
node scripts/e2e-manager.mjs <port>   # Playwright 端到端测试（10 项断言）
```

测试覆盖：面板打开、插件列表渲染、启停 toggle 与恢复、市场渲染、一键安装真实插件。

## 架构

- **Host 半**（`src/index.ts`）：注册 `/manager/api` 路由（plugins / market / toggle / install / uninstall），
  通过 `ctx.loader` 读写运行时状态，转发 `dsh plugin` 子进程做持久变更。
- **Client 半**（`src/client/index.tsx`）：注册 `sidebar.footer.action` 列表槽位入口，
  渲染管理面板 overlay，数据走同源 `/manager/api` JSON API。

## 已知限制

- 安装/卸载是 profile 层持久变更，**重启后生效**（运行时 toggle 即时生效）。
- 市场 GitHub 实时抓取需要外网（可配 `DSH_MANAGER_GITHUB_PROXY`）；抓取失败自动回退内置精选列表。
