/**
 * dsh-manager host half: serves the /manager JSON APIs — plugin inventory
 * (live loader state), runtime enable/disable (loader.create/remove), and
 * persistent install/uninstall by forwarding to the `dsh plugin` CLI in the
 * active profile. The plugin market endpoint returns the built-in curated
 * list, optionally refreshed from the GitHub dsh-plugin topic (proxy via
 * `DSH_MANAGER_GITHUB_PROXY`).
 * @module dsh-manager
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createRequire } from 'node:module'
import { basename, dirname, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/cordis-plugin-loader'

/** Stable Cordis plugin name. */
export const name = 'dsh-manager'

/** Services required before the manager APIs can mount. */
export const inject = ['webServer', 'loader']

const require = createRequire(import.meta.url)

/** Resolve the dsh CLI bin for plugin forwarding, or null when absent. */
function resolveDshBin(ctx: Context): string | null {
  const explicit = process.env.DSH_MANAGER_DSH_BIN
  if (explicit !== undefined && explicit !== '') return explicit
  // The healed profiles/node_modules mirror (healProfilesModuleFallback)
  // carries @deepseek-ai/dsh next to the config tree — a predictable disk
  // path that bypasses package exports restrictions.
  if (ctx.baseUrl !== undefined) {
    const healed = join(dirname(ctx.baseUrl), 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
    try {
      if (existsSync(healed)) return healed
    } catch {
      // fall through
    }
  }
  try {
    return require.resolve('@deepseek-ai/dsh/lib/bin.js')
  } catch {
    return null
  }
}

/**
 * The profile name the running tree boots from: the cordis.yml directory's
 * basename ($DSH_HOME/profiles/<name>). Falls back to 'web'.
 * @param ctx - plugin context carrying the config-tree baseUrl.
 */
function profileName(ctx: Context): string {
  if (ctx.baseUrl === undefined) return 'web'
  return basename(ctx.baseUrl)
}

/**
 * Run `dsh plugin <args...>` in a child process and collect its output.
 * Uses the current executable (Electron's embedded Node under the desktop
 * shell) with the resolved bin; ELECTRON_RUN_AS_NODE is inherited from the
 * environment when already set.
 * @param ctx - plugin context (for the profile name).
 * @param args - `plugin` subcommand arguments (add/remove/...).
 * @returns {ok, output} — merged stdout/stderr, and success flag.
 */
function runDshPlugin(ctx: Context, args: readonly string[]): Promise<{ ok: boolean; output: string }> {
  const bin = resolveDshBin(ctx)
  const profile = profileName(ctx)
  const inner = ['plugin', '--profile', profile, ...args]
  // GitHub-hosted specs resolve through the configured proxy when set
  // (DSH_MANAGER_GITHUB_PROXY) — the market fetch uses the same setting.
  const proxy = process.env.DSH_MANAGER_GITHUB_PROXY
  const env = proxy !== undefined && proxy !== ''
    ? { ...process.env, HTTPS_PROXY: proxy, HTTP_PROXY: proxy }
    : process.env
  return new Promise((resolvePromise) => {
    // PATH fallback: spawn the `dsh` command with a shell (Windows needs one
    // for .cmd shims); never execPath with a bare command name.
    const child = bin !== null
      ? spawn(process.execPath, [bin, ...inner], {
          env,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        })
      : spawn('dsh', inner, {
          env,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          shell: process.platform === 'win32',
        })
    let output = ''
    const collect = (chunk: Buffer): void => { output += chunk.toString() }
    child.stdout?.on('data', collect)
    child.stderr?.on('data', collect)
    child.on('error', (error) => {
      resolvePromise({ ok: false, output: `failed to spawn dsh: ${error.message}` })
    })
    child.on('exit', (code) => {
      resolvePromise({ ok: code === 0, output })
    })
  })
}

/** One loader entry's manager view. */
interface PluginRow {
  id: string
  name: string
  disabled: boolean
}

/** The built-in curated dsh-plugin market (name, repo, stars, description). */
const CURATED_MARKET: Array<Record<string, string>> = [
  { name: 'dsh-web-ui', repo: 'zhu1090093659/dsh-web-ui', stars: '920', desc: '插件与皮肤合集：任务看板、Git 图谱、右侧面板、宠物、实时 token 统计、皮肤中心' },
  { name: 'dsh-TUI', repo: 'ccch1mneyyy/dsh-TUI', stars: '488', desc: 'Claude Code 风格全屏交互终端插件' },
  { name: 'awesome-dsh-plugins', repo: 'AdamPlatin123/awesome-dsh-plugins', stars: '508', desc: 'dsh 插件雷达：自动扫描发现的插件候选索引' },
  { name: 'dsh-web-ui-settings', repo: 'zhu1090093659/dsh-web-ui', stars: '920', desc: '皮肤中心设置界面（独立安装版）' },
  { name: 'dsh-skins', repo: 'zhu1090093659/dsh-web-ui', stars: '920', desc: '皮肤合集包：8 款调色板注册进官方主题运行时' },
  { name: 'dsh-theme', repo: 'oil-oil/dsh-theme', stars: '1', desc: '实时主题编辑器：9 套调色板 + 强调色/字体/字号控制' },
  { name: 'dsh-skin', repo: 'KinGao294/dsh-skin', stars: '0', desc: '皮肤切换器 + 自定义毛玻璃壁纸（透明度/模糊）' },
  { name: 'modlens', repo: 'liustack/modlens', stars: '856', desc: '视觉插件：粘贴图片得到结构化 JSON 证据（OCR/布局/语义）' },
  { name: 'dsh-vision-toolkit', repo: 'Anionex/dsh-vision-toolkit', stars: '232', desc: '纯文本模型的视觉任务：图片问答/长截图 OCR/UI 还原' },
  { name: 'dsh-find-plugins', repo: 'Nagi-ovo/dsh-find-plugins', stars: '51', desc: '插件发现工具' },
  { name: 'dsh-agent-teams', repo: 'NanmiCoder/dsh-agent-teams', stars: '141', desc: 'AgentTeams 多智能体协作插件' },
  { name: 'dsh-browser', repo: 'Lum1104/dsh-browser', stars: '46', desc: 'Chrome 侧边栏扩展：DSH 直接操控浏览器' },
  { name: 'dsh-custom-tool', repo: 'omdsh-dev/dsh-custom-tool', stars: '18', desc: 'Monaco 编辑器创建和管理沙箱化 JS 工具' },
  { name: 'dsh-remote-sandbox', repo: 'weijiafu14/dsh-remote-sandbox', stars: '0', desc: 'E2B 远程沙箱：崩溃恢复 + 工作区同步' },
  { name: 'dsh-self-checking-profile', repo: 'SLAPaper/dsh-self-checking-profile', stars: '1', desc: 'Self Checking 沙箱模式 web profile' },
  { name: 'openpencil', repo: 'ZSeven-W/dsh-openpencil', stars: '45', desc: 'OpenPencil 设计稿预览与编辑插件' },
  { name: 'tokenbank', repo: 'wink-run/tokenbank', stars: '69', desc: '本地 LLM 网关：token 统计/智能路由/配额共享' },
  { name: 'whale-girl', repo: 'vlln/whale-girl', stars: '59', desc: 'DSH Web GUI 桌面宠物（QQ 宠物形态）' },
  { name: 'dsh-genui', repo: 'omdsh-dev/dsh-genui', stars: '36', desc: 'GenUI：对话内联渲染交互式 UI 组件' },
  { name: 'dsh-at-file', repo: 'omdsh-dev/dsh-at-file', stars: '62', desc: 'Codex 风格 @file 引用：搜索工作区文件并附到提示词' },
]

/**
 * Fetch the live GitHub topic listing through an optional proxy
 * (DSH_MANAGER_GITHUB_PROXY). Returns null on any failure so the caller
 * falls back to the curated list.
 */
async function fetchGitHubMarket(): Promise<Array<Record<string, string>> | null> {
  const proxy = process.env.DSH_MANAGER_GITHUB_PROXY
  try {
    const res = await fetch(
      'https://api.github.com/search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=30',
      { signal: AbortSignal.timeout(15000), ...(proxy !== undefined ? { dispatcher: undefined } : {}) },
    )
    if (!res.ok) return null
    const json = await res.json() as { items?: Array<{ full_name: string; stargazers_count: number; description: string | null }> }
    return (json.items ?? []).map((item) => ({
      name: item.full_name.split('/')[1] ?? item.full_name,
      repo: item.full_name,
      stars: String(item.stargazers_count),
      desc: item.description ?? '',
    }))
  } catch {
    return null
  }
}

/** JSON response helper. */
function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  })
  res.end(payload)
}

/** Read the request body as JSON (bounded). */
function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolvePromise, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 1_000_000) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolvePromise(chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown> : {})
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
    req.on('error', reject)
  })
}

/**
 * Mount the manager routes on the shared web server: exact GET/POST under
 * /manager/api.
 * @param ctx - plugin context carrying webServer and loader.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/manager/api',
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? '/', 'http://localhost')
      const path = url.pathname
      try {
        // GET /manager/api/plugins — live loader inventory
        if (req.method === 'GET' && path === '/manager/api/plugins') {
          const rows: PluginRow[] = []
          for (const entry of ctx.loader.entries()) {
            rows.push({
              id: entry.options.id ?? entry.options.name,
              name: entry.options.name,
              disabled: entry.disabled,
            })
          }
          json(res, 200, { ok: true, profile: profileName(ctx), plugins: rows })
          return
        }
        // GET /manager/api/market — curated list merged with the live GitHub
        // refresh (live wins on repo conflict; curated fills the long tail).
        if (req.method === 'GET' && path === '/manager/api/market') {
          const live = await fetchGitHubMarket()
          const merged = [...(live ?? [])]
          const seen = new Set(merged.map((row) => row.repo))
          for (const row of CURATED_MARKET) {
            if (!seen.has(row.repo)) merged.push(row)
          }
          json(res, 200, { ok: true, live: live !== null, plugins: merged })
          return
        }
        // POST /manager/api/plugins/toggle {id} — runtime enable/disable
        if (req.method === 'POST' && path === '/manager/api/plugins/toggle') {
          const body = await readBody(req)
          const id = typeof body.id === 'string' ? body.id : ''
          const entry = [...ctx.loader.entries()].find((candidate) => (candidate.options.id ?? candidate.options.name) === id)
          if (entry === undefined) {
            json(res, 404, { ok: false, error: `unknown plugin ${JSON.stringify(id)}` })
            return
          }
          // `update` with the tree entry id (a loader-internal hash, distinct
          // from options.id) flips the disabled flag without removing the row.
          await ctx.loader.update(entry.id, { disabled: !entry.disabled })
          json(res, 200, { ok: true, action: entry.disabled ? 'enabled' : 'disabled' })
          return
        }
        // POST /manager/api/install {spec} — persistent profile install
        if (req.method === 'POST' && path === '/manager/api/install') {
          const body = await readBody(req)
          const spec = typeof body.spec === 'string' ? body.spec : ''
          if (spec === '') {
            json(res, 400, { ok: false, error: 'spec required' })
            return
          }
          const result = await runDshPlugin(ctx, ['add', spec])
          json(res, result.ok ? 200 : 500, { ok: result.ok, output: result.output.slice(-4000) })
          return
        }
        // POST /manager/api/uninstall {name} — persistent profile removal
        if (req.method === 'POST' && path === '/manager/api/uninstall') {
          const body = await readBody(req)
          const pkg = typeof body.name === 'string' ? body.name : ''
          if (pkg === '') {
            json(res, 400, { ok: false, error: 'name required' })
            return
          }
          const result = await runDshPlugin(ctx, ['remove', pkg])
          json(res, result.ok ? 200 : 500, { ok: result.ok, output: result.output.slice(-4000) })
          return
        }
        json(res, 404, { ok: false, error: 'not found' })
      } catch (error) {
        json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'dsh-manager: /manager/api routes')
}
