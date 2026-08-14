# dsh-manager · DSH 管理控制台

DeepSeek Harness 的**统一管理控制台**（双面插件）：官方设置面板内嵌「管理控制台」
页面 + 侧边栏 ⚙ 快捷入口，提供插件管理、插件市场、Skills 管理、MCP 管理、
Key 管理、模型供应商设置与主题/皮肤管理。Web 端与桌面端通用（共享 `~/.dsh/profiles/web`）。

## 安装

```sh
# 方式一：GitHub 仓库（推荐）
npx @deepseek-ai/dsh plugin --profile web add github:SuMuxi66/dsh-manager
# 方式二：本地路径
npx @deepseek-ai/dsh plugin --profile web add link:<本仓库路径>
```

重启 web / 桌面端后：
- 侧边栏底部 ⚙ 快捷入口（悬浮面板）
- **侧边栏「设置」→ 左侧页面列表出现「管理控制台」**（官方设置面板内嵌）

## 功能

| 模块 | 能力 |
|---|---|
| **插件管理** | 实时 loader 清单（145+ 行）、运行时启用/禁用（`loader.update`）、持久卸载（`dsh plugin remove`） |
| **插件市场** | GitHub `topic:dsh-plugin` 实时搜索（30 条）+ 内置精选列表合并（42 卡片），一键安装（`dsh plugin add`） |
| **Skills 管理** | 文件系统技能目录扫描（`$DSH_HOME/skills`、`~/.agents/skills`、bundled），列表/详情/新建/卸载（仅用户目录），**支持导入 .md 技能文件**（名称取 frontmatter，否则取文件名，自动规范化），防目录穿越 |
| **MCP 管理** | 已加载 MCP 服务器实时状态（stdio / streamable-http）、新增/编辑/删除（写入 profile `cordis.patch.yml` 托管块）、env/header 密钥不回显（留空保留、× 删除、输入覆盖） |
| **MCP 开源商店** | 接入 Smithery 开源 MCP 商店：热门浏览 + 关键词搜索，服务器卡片（verified / 使用量），远程部署的一键安装（60s 结果缓存） |
| **模型设置** | 默认模型（provider / model / reasoningEffort）读写 `agent-default-model`；36+ configurable providers 列表与 baseURL/apiKeyEnv 编辑（仅限已注册 namespace） |
| **主题/皮肤** | 主题偏好切换（浅色/深色/跟随系统，写 `ui-theme`）；已安装皮肤插件（`*skin*` 行）运行时启停 |

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
- API 套件：`node scripts/m2m3-api-test.mjs`（29 断言：skills 导入/详情、MCP 配置、Smithery 市场搜索与一键安装、models/theme、keys 端点已移除）
- UI 套件：`BASE=<port> node scripts/ui-e2e.mjs`（22 断言：全部 6 个页签 + md 文件导入 + MCP 商店搜索）

## 架构

- **Host 半**（`src/index.ts`）：注册 `/manager/api` 路由（plugins / market / toggle /
  install / uninstall / skills / skills-import / mcp / mcp-market / models / theme），
  通过 `ctx.loader`、`ctx.settings`、`ctx.llm` 读写运行时状态，转发 `dsh plugin`
  子进程做持久变更，MCP 配置写入 profile 的托管 patch 块（`# --- dsh-manager mcp
  managed ---`），商店数据来自 Smithery 公开 registry（60s 内存缓存）。
- **Client 半**（`src/client/index.tsx`）：注册 `sidebar.footer.action`（⚙ 悬浮面板快捷入口）
  与官方 **`settings.section`**（设置面板内嵌「管理控制台」页面）两个槽位，
  共享同一个 ManagerPanel，数据走同源 `/manager/api` JSON API。

## 已知限制

- 安装/卸载/MCP 配置是 profile 层持久变更，**重启后生效**（运行时 toggle 即时生效）。
- 市场 GitHub 实时抓取需要外网（可配 `DSH_MANAGER_GITHUB_PROXY`）；抓取失败自动回退内置精选列表。
- Skills 列表基于文件系统扫描（与运行时 provider 同源目录），项目级技能（`.dsh/skills`、
  `.agents/skills`）只在对应工作区会话中可见，控制台不扫描项目目录。
- MCP env/header 的既有值加载时只显示"已设置"，输入新值覆盖、留空保留、删除需点 ×。
