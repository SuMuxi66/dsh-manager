/**
 * dsh-manager host half: serves the /manager JSON APIs —
 * M1: plugin inventory (live loader state), runtime enable/disable, persistent
 *     install/uninstall by forwarding to the `dsh plugin` CLI, plugin market.
 * M2: skills catalog (list/detail/install/uninstall into the user agents
 *     home), MCP server configuration (managed block in the profile patch).
 * M3: credential keys (describe/set/unset — never echoes values), model
 *     provider settings (default model + configurable providers), theme
 *     preference and skin rows.
 * @module dsh-manager
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/cordis-plugin-loader'

/** Stable Cordis plugin name. */
export const name = 'dsh-manager'

/** Services required before the manager APIs can mount. */
export const inject = ['webServer', 'loader']

const require = createRequire(import.meta.url)

/** MCP client plugin name as configured in profile compositions. */
const MCP_PLUGIN = '@deepseek-ai/dsh-mcp-client'
/** Managed block markers in the profile patch file. */
const MCP_BLOCK_START = '# --- dsh-manager mcp managed (auto-generated; do not edit) ---'
const MCP_BLOCK_END = '# --- end dsh-manager mcp managed ---'

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

/** The profile directory (file path) the running tree boots from. */
function profileDir(ctx: Context): string {
  if (ctx.baseUrl !== undefined) {
    try {
      return fileURLToPath(new URL(ctx.baseUrl))
    } catch {
      // fall through
    }
  }
  const home = process.env.DSH_HOME !== undefined && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh')
  return join(home, 'profiles', profileName(ctx))
}

/** The user agents home (where user-level skills live). */
function agentsHome(): string {
  return process.env.DSH_AGENTS_HOME !== undefined && process.env.DSH_AGENTS_HOME !== ''
    ? process.env.DSH_AGENTS_HOME
    : join(homedir(), '.agents')
}

/** The dsh home directory (defaults to ~/.dsh). */
function dshHome(): string {
  return process.env.DSH_HOME !== undefined && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh')
}

/** Parse the name/description frontmatter of a skill markdown file. */
function parseSkillMeta(content: string): { name?: string; description?: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content)
  if (m === null) return {}
  try {
    const parsed = yamlLoad(m[1]) as Record<string, unknown> | null | undefined
    if (parsed === null || typeof parsed !== 'object') return {}
    return {
      ...(typeof parsed.name === 'string' ? { name: parsed.name } : {}),
      ...(typeof parsed.description === 'string' ? { description: parsed.description } : {}),
    }
  } catch {
    return {}
  }
}

/**
 * Scan the filesystem skill roots the same way the local skill provider does:
 * user-dsh ($DSH_HOME/skills), user-agents (agents home skills), and the
 * bundled directory when configured. Project roots are omitted (no workspace).
 */
async function scanSkills(): Promise<Array<{ name: string; description: string; path: string; source: string; provider: string }>> {
  const { readdir } = await import('node:fs/promises')
  const roots: Array<{ path: string; source: string }> = [
    { path: join(dshHome(), 'skills'), source: 'user-dsh' },
    { path: join(agentsHome(), 'skills'), source: 'user-agents' },
  ]
  const bundled = process.env.DSH_BUNDLED_SKILL_DIR
  if (bundled !== undefined && bundled !== '') roots.push({ path: bundled, source: 'bundled' })
  const out: Array<{ name: string; description: string; path: string; source: string; provider: string }> = []
  for (const root of roots) {
    let entries
    try {
      entries = await readdir(root.path, { withFileTypes: true })
    } catch {
      continue // root absent or unreadable
    }
    for (const entry of entries) {
      if (entry.name === '.system') continue
      const base = join(root.path, entry.name)
      try {
        if (entry.isDirectory()) {
          const md = join(base, 'SKILL.md')
          const content = await readFile(md, 'utf8')
          const meta = parseSkillMeta(content)
          out.push({
            name: meta.name ?? entry.name,
            description: meta.description ?? '',
            path: md,
            source: root.source,
            provider: 'filesystem',
          })
        } else if (entry.name.endsWith('.md')) {
          const content = await readFile(base, 'utf8')
          const meta = parseSkillMeta(content)
          out.push({
            name: meta.name ?? entry.name.replace(/\.md$/, ''),
            description: meta.description ?? '',
            path: base,
            source: root.source,
            provider: 'filesystem',
          })
        }
      } catch {
        // skip unreadable entries
      }
    }
  }
  return out
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
  try {
    const res = await fetch(
      'https://api.github.com/search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=30',
      { signal: AbortSignal.timeout(15000) },
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

/** Read the profile patch file text, or '' when absent. */
async function readPatchFile(ctx: Context): Promise<string> {
  const patchPath = join(profileDir(ctx), 'cordis.patch.yml')
  try {
    return await readFile(patchPath, 'utf8')
  } catch {
    return ''
  }
}

/** Rewrite the profile patch file text (creates the file when absent). */
async function writePatchFile(ctx: Context, text: string): Promise<void> {
  const dir = profileDir(ctx)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'cordis.patch.yml'), text, 'utf8')
}

/** Extract the dsh-manager MCP managed block text (without markers), or null. */
function extractMcpBlock(text: string): { block: string; before: string; after: string } | null {
  const start = text.indexOf(MCP_BLOCK_START)
  if (start === -1) return null
  const endMarker = text.indexOf(MCP_BLOCK_END, start)
  if (endMarker === -1) return null
  const blockStart = start + MCP_BLOCK_START.length
  const blockEnd = endMarker
  const block = text.slice(blockStart, blockEnd)
  const before = text.slice(0, start)
  const after = text.slice(endMarker + MCP_BLOCK_END.length)
  return { block, before, after }
}

/** Parse one MCP server row from the managed block YAML. */
interface McpServerView {
  id: string
  serverName: string
  transport: string
  command?: string
  args?: string[]
  cwd?: string
  url?: string
  env: Array<{ key: string; set: boolean }>
  headers: Array<{ key: string; set: boolean }>
  running: boolean
}

function sanitizeMcpConfig(config: unknown): Record<string, unknown> {
  if (config === null || typeof config !== 'object') return {}
  const raw = config as Record<string, unknown>
  const out: Record<string, unknown> = { serverName: '', transport: 'stdio' }
  if (typeof raw.serverName === 'string' && raw.serverName !== '') out.serverName = raw.serverName
  if (raw.transport === 'streamable-http' || raw.transport === 'stdio') out.transport = raw.transport
  if (typeof raw.command === 'string') out.command = raw.command
  if (Array.isArray(raw.args)) out.args = raw.args.filter((a): a is string => typeof a === 'string')
  if (typeof raw.cwd === 'string') out.cwd = raw.cwd
  if (typeof raw.url === 'string') out.url = raw.url
  return out
}

function mcpViewFromConfig(id: string, config: unknown, running: boolean): McpServerView {
  const c = sanitizeMcpConfig(config)
  const envRaw = (config !== null && typeof config === 'object' && (config as Record<string, unknown>).env)
  const headersRaw = (config !== null && typeof config === 'object' && (config as Record<string, unknown>).headers)
  const envKeys = envRaw !== null && typeof envRaw === 'object' ? Object.keys(envRaw as Record<string, unknown>) : []
  const headerKeys = headersRaw !== null && typeof headersRaw === 'object' ? Object.keys(headersRaw as Record<string, unknown>) : []
  return {
    id,
    serverName: String(c.serverName ?? id),
    transport: String(c.transport),
    ...(typeof c.command === 'string' ? { command: c.command } : {}),
    ...(Array.isArray(c.args) ? { args: c.args } : {}),
    ...(typeof c.cwd === 'string' ? { cwd: c.cwd } : {}),
    ...(typeof c.url === 'string' ? { url: c.url } : {}),
    env: envKeys.map((key) => ({ key, set: true })),
    headers: headerKeys.map((key) => ({ key, set: true })),
    running,
  }
}

/**
 * Save the managed MCP block: replaces the existing block (or inserts at the
 * top) with the given server rows. Secret env/header values are only replaced
 * when the client supplies a new non-empty value; an explicit null removes the
 * key, and an absent key keeps the previous value.
 */
async function saveMcpServers(ctx: Context, servers: Array<Record<string, unknown>>): Promise<void> {
  const rows = servers.map((s) => {
    const id = typeof s.id === 'string' && s.id !== '' ? s.id : ''
    const config = (s.config !== null && typeof s.config === 'object') ? s.config as Record<string, unknown> : {}
    return { id, config }
  }).filter((row) => row.id !== '')

  // Merge secrets: fetch the previous managed configs first.
  const prev = await loadMcpServers(ctx)
  const mergedConfigs = new Map<string, Record<string, unknown>>(prev.managed.map((s) => [s.id, s.fullConfig]))

  const blockRows = rows.map((row) => {
    const prevConfig = mergedConfigs.get(row.id) ?? {}
    const next: Record<string, unknown> = { ...prevConfig, ...sanitizeMcpConfig(row.config) }
    // env/headers merge: null removes, '' or missing keeps previous.
    for (const field of ['env', 'headers'] as const) {
      const incoming = row.config[field]
      if (incoming === null || typeof incoming !== 'object') continue
      const prevMap = (prevConfig[field] !== null && typeof prevConfig[field] === 'object')
        ? prevConfig[field] as Record<string, unknown>
        : {}
      const nextMap: Record<string, unknown> = { ...prevMap }
      for (const [key, value] of Object.entries(incoming as Record<string, unknown>)) {
        if (value === null) delete nextMap[key]
        else if (typeof value === 'string' && value !== '') nextMap[key] = value
        // else: keep previous ('' or non-string non-null)
      }
      if (Object.keys(nextMap).length > 0) next[field] = nextMap
      else delete next[field]
    }
    return { id: row.id, name: MCP_PLUGIN, config: next }
  })

  const body = yamlDump(blockRows, { lineWidth: -1, noRefs: true })
  const block = `${MCP_BLOCK_START}\n${body}${MCP_BLOCK_END}\n`
  const existing = await readPatchFile(ctx)
  const found = extractMcpBlock(existing)
  const nextText = found !== null
    ? `${found.before}${block}${found.after}`
    : `${block}${existing}`
  await writePatchFile(ctx, nextText)
}

/** Load all MCP servers: managed block configs + running loader entries. */
async function loadMcpServers(ctx: Context): Promise<{ managed: Array<{ id: string; fullConfig: Record<string, unknown>; view: McpServerView }>; running: McpServerView[] }> {
  const text = await readPatchFile(ctx)
  const found = extractMcpBlock(text)
  let managedRows: Array<Record<string, unknown>> = []
  if (found !== null) {
    try {
      const parsed = yamlLoad(found.block)
      if (Array.isArray(parsed)) managedRows = parsed.filter((r): r is Record<string, unknown> => r !== null && typeof r === 'object')
    } catch {
      managedRows = []
    }
  }
  const managed = managedRows.map((row) => {
    const id = typeof row.id === 'string' ? row.id : String(row.id ?? '')
    const config = row.config !== null && typeof row.config === 'object' ? row.config as Record<string, unknown> : {}
    return { id, fullConfig: config, view: mcpViewFromConfig(id, config, false) }
  })
  const running: McpServerView[] = []
  for (const entry of ctx.loader.entries()) {
    if (entry.options.name !== MCP_PLUGIN) continue
    const id = entry.options.id ?? entry.options.name ?? 'mcp'
    // Cordis loader entries carry their config under options.config.
    const config = (entry.options as unknown as { config?: Record<string, unknown> }).config ?? {}
    // The managed block is the source of truth for display; running adds the
    // live flag for rows already active.
    const managedRow = managed.find((m) => m.id === id)
    if (managedRow !== undefined) {
      managedRow.view.running = true
    } else {
      running.push(mcpViewFromConfig(id, config, true))
    }
  }
  return { managed, running }
}

/** Known credential references: apiKeyEnv fields of configurable LLM providers. */
async function collectCredentialRefs(ctx: Context): Promise<string[]> {
  const refs = new Set<string>()
  const settings = ctx.get('settings') as { get?: (ns: string) => Record<string, unknown> | undefined } | undefined
  const llm = ctx.get('llm') as { listConfigurableProviders?: () => Array<{ provider: string; displayName: string; settingsNs: string }> } | undefined
  const providers = llm?.listConfigurableProviders?.() ?? []
  for (const entry of providers) {
    const section = settings?.get?.(entry.settingsNs)
    if (section !== undefined && typeof section.apiKeyEnv === 'string' && section.apiKeyEnv !== '') {
      refs.add(section.apiKeyEnv)
    }
  }
  return [...refs]
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

        // ================= M2: skills =================
        // GET /manager/api/skills — filesystem skill catalog (user + bundled
        // roots; the runtime registry is scope-local so we scan the same
        // roots the local provider watches).
        if (req.method === 'GET' && path === '/manager/api/skills') {
          const out = await scanSkills()
          json(res, 200, { ok: true, available: true, complete: true, skills: out })
          return
        }
        // GET /manager/api/skills/detail?path= — skill body (path must be a
        // listed skill path; guards against directory traversal).
        if (req.method === 'GET' && path === '/manager/api/skills/detail') {
          const wanted = url.searchParams.get('path') ?? ''
          if (wanted === '') {
            json(res, 400, { ok: false, error: 'path required' })
            return
          }
          const listed = await scanSkills()
          const match = listed.find((entry) => resolve(entry.path) === resolve(wanted))
          if (match === undefined) {
            json(res, 404, { ok: false, error: 'skill not found or path not allowed' })
            return
          }
          let content = ''
          try {
            content = await readFile(match.path, 'utf8')
          } catch (error) {
            json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
            return
          }
          json(res, 200, { ok: true, name: match.name, content: content.slice(0, 60_000) })
          return
        }
        // POST /manager/api/skills/install {name, content} — write a user
        // skill under <agentsHome>/skills/<name>/SKILL.md
        if (req.method === 'POST' && path === '/manager/api/skills/install') {
          const body = await readBody(req)
          const name = typeof body.name === 'string' ? body.name.trim() : ''
          const content = typeof body.content === 'string' ? body.content : ''
          if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(name)) {
            json(res, 400, { ok: false, error: 'invalid skill name' })
            return
          }
          if (content === '') {
            json(res, 400, { ok: false, error: 'content required' })
            return
          }
          const dir = join(agentsHome(), 'skills', name)
          await mkdir(dir, { recursive: true })
          await writeFile(join(dir, 'SKILL.md'), content, 'utf8')
          json(res, 200, { ok: true, path: join(dir, 'SKILL.md') })
          return
        }
        // POST /manager/api/skills/uninstall {name} — remove a user skill
        // (only inside the user skill roots: agents home or dsh home).
        if (req.method === 'POST' && path === '/manager/api/skills/uninstall') {
          const body = await readBody(req)
          const name = typeof body.name === 'string' ? body.name.trim() : ''
          if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(name)) {
            json(res, 400, { ok: false, error: 'invalid skill name' })
            return
          }
          const bases = [resolve(join(agentsHome(), 'skills')), resolve(join(dshHome(), 'skills'))]
          const found = (await scanSkills()).find((s) => s.name === name && bases.some((base) => resolve(s.path).startsWith(base + '\\') || resolve(s.path).startsWith(base + '/')))
          if (found === undefined) {
            json(res, 404, { ok: false, error: `skill ${JSON.stringify(name)} not found in user skill roots` })
            return
          }
          // Remove the containing bundle directory (user skills live in
          // <root>/<name>/SKILL.md) or the flat markdown file itself.
          const target = found.path.endsWith(`${sep}SKILL.md`) ? dirname(found.path) : found.path
          await rm(target, { recursive: true, force: true })
          json(res, 200, { ok: true })
          return
        }

        // ================= M2: MCP =================
        // GET /manager/api/mcp — managed + running MCP server configs
        if (req.method === 'GET' && path === '/manager/api/mcp') {
          const { managed, running } = await loadMcpServers(ctx)
          json(res, 200, { ok: true, servers: managed.map((m) => m.view).concat(running) })
          return
        }
        // POST /manager/api/mcp/save {servers: [{id, config}]} — rewrite the
        // managed MCP block in the profile patch.
        if (req.method === 'POST' && path === '/manager/api/mcp/save') {
          const body = await readBody(req)
          const servers = Array.isArray(body.servers) ? body.servers.filter((s): s is Record<string, unknown> => s !== null && typeof s === 'object') : []
          const names = new Set<string>()
          for (const s of servers) {
            const config = s.config !== null && typeof s.config === 'object' ? s.config as Record<string, unknown> : {}
            const serverName = typeof config.serverName === 'string' ? config.serverName : ''
            if (serverName === '' || !/^[A-Za-z0-9_-]{1,32}$/.test(serverName)) {
              json(res, 400, { ok: false, error: `invalid serverName ${JSON.stringify(serverName)}` })
              return
            }
            if (names.has(serverName)) {
              json(res, 400, { ok: false, error: `duplicate serverName ${JSON.stringify(serverName)}` })
              return
            }
            names.add(serverName)
            const transport = config.transport
            if (transport === 'stdio') {
              if (typeof config.command !== 'string' || config.command === '') {
                json(res, 400, { ok: false, error: `stdio server ${serverName} requires command` })
                return
              }
            } else if (transport === 'streamable-http') {
              if (typeof config.url !== 'string' || config.url === '') {
                json(res, 400, { ok: false, error: `streamable-http server ${serverName} requires url` })
                return
              }
            } else {
              json(res, 400, { ok: false, error: `invalid transport for ${serverName}` })
              return
            }
          }
          await saveMcpServers(ctx, servers)
          json(res, 200, { ok: true, note: 'MCP 配置已写入 profile；重启 web/桌面端后生效。' })
          return
        }

        // ================= M3: keys =================
        // GET /manager/api/keys — credential refs with configured state
        // (values are never echoed).
        if (req.method === 'GET' && path === '/manager/api/keys') {
          const credentials = ctx.get('credentials') as { describe?: (ref: string) => Promise<{ configured: boolean; source?: string; writable: boolean }> } | undefined
          const refs = await collectCredentialRefs(ctx)
          const rows = []
          for (const ref of refs) {
            let described: { configured: boolean; source?: string; writable: boolean } = { configured: false, writable: false }
            try {
              described = await credentials?.describe?.(ref) ?? described
            } catch {
              // keep defaults
            }
            rows.push({ ref, configured: described.configured, source: described.source, writable: described.writable })
          }
          json(res, 200, { ok: true, available: credentials?.describe !== undefined, keys: rows })
          return
        }
        // POST /manager/api/keys/set {ref, value} — store a credential
        if (req.method === 'POST' && path === '/manager/api/keys/set') {
          const body = await readBody(req)
          const ref = typeof body.ref === 'string' ? body.ref : ''
          const value = typeof body.value === 'string' ? body.value : ''
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ref)) {
            json(res, 400, { ok: false, error: 'invalid credential ref' })
            return
          }
          if (value === '') {
            json(res, 400, { ok: false, error: 'value required (use unset to clear)' })
            return
          }
          const credentials = ctx.get('credentials') as { set?: (ref: string, value: string) => Promise<void> } | undefined
          if (credentials?.set === undefined) {
            json(res, 500, { ok: false, error: 'credentials service unavailable' })
            return
          }
          await credentials.set(ref, value)
          json(res, 200, { ok: true })
          return
        }
        // POST /manager/api/keys/unset {ref} — clear a credential
        if (req.method === 'POST' && path === '/manager/api/keys/unset') {
          const body = await readBody(req)
          const ref = typeof body.ref === 'string' ? body.ref : ''
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ref)) {
            json(res, 400, { ok: false, error: 'invalid credential ref' })
            return
          }
          const credentials = ctx.get('credentials') as { unset?: (ref: string) => Promise<void> } | undefined
          if (credentials?.unset === undefined) {
            json(res, 500, { ok: false, error: 'credentials service unavailable' })
            return
          }
          await credentials.unset(ref)
          json(res, 200, { ok: true })
          return
        }

        // ================= M3: models =================
        // GET /manager/api/models — default model + configurable providers
        if (req.method === 'GET' && path === '/manager/api/models') {
          const settings = ctx.get('settings') as { get?: (ns: string) => Record<string, unknown> | undefined } | undefined
          const llm = ctx.get('llm') as { listConfigurableProviders?: () => Array<{ provider: string; displayName: string; settingsNs: string }> } | undefined
          const defaults = settings?.get?.('agent-default-model') ?? null
          const providers = (llm?.listConfigurableProviders?.() ?? []).map((entry) => {
            const section = settings?.get?.(entry.settingsNs) ?? {}
            const sectionView = { ...section }
            return {
              provider: entry.provider,
              displayName: entry.displayName,
              settingsNs: entry.settingsNs,
              section: sectionView,
            }
          })
          json(res, 200, { ok: true, default: defaults, providers })
          return
        }
        // POST /manager/api/models/default {provider, model, reasoningEffort?}
        if (req.method === 'POST' && path === '/manager/api/models/default') {
          const body = await readBody(req)
          const provider = typeof body.provider === 'string' ? body.provider : ''
          const model = typeof body.model === 'string' ? body.model : ''
          if (provider === '' || model === '') {
            json(res, 400, { ok: false, error: 'provider and model required' })
            return
          }
          const settings = ctx.get('settings') as { update?: (ns: string, patch: Record<string, unknown>) => Promise<unknown> } | undefined
          if (settings?.update === undefined) {
            json(res, 500, { ok: false, error: 'settings service unavailable' })
            return
          }
          const patch: Record<string, unknown> = { provider, model }
          if (typeof body.reasoningEffort === 'string' && body.reasoningEffort !== '') patch.reasoningEffort = body.reasoningEffort
          await settings.update('agent-default-model', patch)
          json(res, 200, { ok: true })
          return
        }
        // POST /manager/api/models/provider {settingsNs, section} — update one
        // configurable provider's settings section (registered ns only).
        if (req.method === 'POST' && path === '/manager/api/models/provider') {
          const body = await readBody(req)
          const ns = typeof body.settingsNs === 'string' ? body.settingsNs : ''
          const section = body.section !== null && typeof body.section === 'object' ? body.section as Record<string, unknown> : null
          if (ns === '' || section === null) {
            json(res, 400, { ok: false, error: 'settingsNs and section required' })
            return
          }
          const llm = ctx.get('llm') as { listConfigurableProviders?: () => Array<{ settingsNs: string }> } | undefined
          const allowed = (llm?.listConfigurableProviders?.() ?? []).some((entry) => entry.settingsNs === ns)
          if (!allowed) {
            json(res, 403, { ok: false, error: `settings namespace ${JSON.stringify(ns)} is not a configurable provider` })
            return
          }
          const settings = ctx.get('settings') as { update?: (ns: string, patch: Record<string, unknown>) => Promise<unknown> } | undefined
          if (settings?.update === undefined) {
            json(res, 500, { ok: false, error: 'settings service unavailable' })
            return
          }
          await settings.update(ns, section)
          json(res, 200, { ok: true })
          return
        }

        // ================= M3: theme =================
        // GET /manager/api/theme — theme preference + installed skin rows
        if (req.method === 'GET' && path === '/manager/api/theme') {
          const settings = ctx.get('settings') as { get?: (ns: string) => Record<string, unknown> | undefined } | undefined
          const section = settings?.get?.('ui-theme') ?? {}
          const skins: PluginRow[] = []
          for (const entry of ctx.loader.entries()) {
            const entryName = entry.options.name ?? ''
            if (entryName.toLowerCase().includes('skin')) {
              skins.push({ id: entry.options.id ?? entry.options.name, name: entryName, disabled: entry.disabled })
            }
          }
          json(res, 200, { ok: true, preference: typeof section.preference === 'string' ? section.preference : 'system', skins })
          return
        }
        // POST /manager/api/theme {preference}
        if (req.method === 'POST' && path === '/manager/api/theme') {
          const body = await readBody(req)
          const preference = typeof body.preference === 'string' ? body.preference : ''
          if (preference !== 'light' && preference !== 'dark' && preference !== 'system') {
            json(res, 400, { ok: false, error: 'preference must be light | dark | system' })
            return
          }
          const settings = ctx.get('settings') as { update?: (ns: string, patch: Record<string, unknown>) => Promise<unknown> } | undefined
          if (settings?.update === undefined) {
            json(res, 500, { ok: false, error: 'settings service unavailable' })
            return
          }
          await settings.update('ui-theme', { preference })
          json(res, 200, { ok: true })
          return
        }

        json(res, 404, { ok: false, error: 'not found' })
      } catch (error) {
        json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'dsh-manager: /manager/api routes')
}
