# dsh-manager · DSH 管理增强

把插件管理与 MCP/Skills 管理拆进 **DeepSeek Harness 官方设置面板**的各个位置，
Web 端与桌面端通用（共享 `~/.dsh/profiles/web`）。皮肤/主题交给官方
web-ui 皮肤中心，本插件不做。

## 安装

```sh
# 方式一：GitHub 仓库（推荐）
npx @deepseek-ai/dsh plugin --profile web add github:SuMuxi66/dsh-manager
# 方式二：本地路径
npx @deepseek-ai/dsh plugin --profile web add link:<本仓库路径>
```

完全重启 web / 桌面端后，设置面板出现以下入口。

## 界面分布（全部在官方设置面板内）

| 位置 | 内容 |
|---|---|
| **设置 → 插件 →「插件管理」tab** | 实时 loader 清单（145+ 行）、运行时启用/禁用（`loader.update`）、持久卸载（`dsh plugin remove`）、安装输入框（npm 包名 / `github:owner/repo`） |
| **设置 → 插件 →「插件市场」tab** | GitHub `topic:dsh-plugin` 实时搜索（30 条）+ 内置精选合并（42 卡片），一键安装（`dsh plugin add`） |
| **设置 →「Skills 管理」页** | 技能目录扫描（`$DSH_HOME/skills`、`~/.agents/skills`、bundled），列表/详情/新建/卸载（仅用户目录）；**用户技能存于 `~/.dsh/skills`**，支持**导入 .md 技能文件**（名称取 frontmatter，否则取文件名，自动规范化），防目录穿越 |
| **设置 →「MCP 管理」页** | 「已配置」：MCP 服务器实时状态（stdio / streamable-http）、新增/编辑/删除（写入 profile `cordis.patch.yml` 托管块）、env/header 密钥不回显（留空保留、× 删除、输入覆盖）；「开源商店」：Smithery 商店热门/搜索、verified/使用量卡片、远程部署一键安装（60s 缓存） |
| 皮肤 / 主题 | **不使用本插件**——用官方皮肤中心（设置 → 插件 → web-ui 配置 / 皮肤中心） |

## 环境变量

| 变量 | 含义 |
|---|---|
| `DSH_MANAGER_GITHUB_PROXY` | GitHub API 抓取与 git 安装子进程的 HTTP 代理（如 `http://127.0.0.1:7890`） |
| `DSH_MANAGER_DSH_BIN` | 覆盖 dsh CLI `lib/bin.js` 路径（默认：healed profiles/node_modules → require.resolve） |

## 开发

```sh
npm install
npm run build        # tsc + tsdown → lib/（index.js host 半 + client.js 浏览器半）
```

测试（隔离 DSH_HOME + Playwright）：
- API 套件：`node scripts/m2m3-api-test.mjs`（27 断言：skills 导入/落盘路径/详情、MCP 配置、Smithery 市场搜索与一键安装；theme/keys/models 端点已移除）
- UI 套件：`BASE=<port> node scripts/layout-e2e.mjs`（20 断言：设置面板入口分布、插件管理/市场子 tab、Skills md 导入、MCP 商店）

## 架构

- **Host 半**（`src/index.ts`）：注册 `/manager/api` 路由（plugins / market / toggle /
  install / uninstall / skills / skills-import / mcp / mcp-market），
  通过 `ctx.loader`、`ctx.settings` 读写运行时状态，转发 `dsh plugin`
  子进程做持久变更，MCP 配置写入 profile 的托管 patch 块（`# --- dsh-manager mcp
  managed ---`），商店数据来自 Smithery 公开 registry（60s 内存缓存）。
- **Client 半**（`src/client/index.tsx`）：注册官方槽位——
  `settings.plugins.tab`（插件页内「插件管理」「插件市场」两个子 tab）与
  `settings.section`（「Skills 管理」「MCP 管理」两个独立页），数据走同源
  `/manager/api` JSON API。

## 已知限制

- 安装/卸载/MCP 配置是 profile 层持久变更，**重启后生效**（运行时 toggle 即时生效）。
- 市场 GitHub 实时抓取需要外网（可配 `DSH_MANAGER_GITHUB_PROXY`）；抓取失败自动回退内置精选列表。
- Skills 列表基于文件系统扫描（与运行时 provider 同源目录），项目级技能（`.dsh/skills`、
  `.agents/skills`）只在对应工作区会话中可见，本插件不扫描项目目录。
- MCP env/header 的既有值加载时只显示"已设置"，输入新值覆盖、留空保留、删除需点 ×。
- 商店一键安装仅支持有远程部署（streamable-http）的服务器；本地 stdio 服务器请在
  「已配置」视图手动添加（command `npx`，args 填包名）。
