/**
 * dsh-manager browser half: registers the sidebar footer entry and renders
 * the manager console overlay. All data flows over the same-origin /manager
 * JSON APIs served by the host half — no private harness internals. Tabs:
 * 插件 / 市场 (M1), Skills / MCP (M2), Keys / 模型 / 皮肤 (M3).
 * @module dsh-manager/client
 */

import { Context } from '@deepseek-ai/cordis'
import { useEffect, useState, type ReactNode } from 'react'

// The npm-published @deepseek-ai/dsh-client-ui-slots omits its type files;
// declare the minimal slot-registry surface this plugin uses. Runtime shape
// is the official slots service (inject/register).
interface SlotsLike {
  inject(name: string, setup: () => unknown): void
  register(entry: Record<string, unknown>, component: unknown): unknown
}
interface ManagerCtx extends Context {
  slots: SlotsLike
}

/** Required services: the slot registry (declaration may come later). */
export const inject = ['slots']

/** Shared overlay stylesheet, injected once (loader removes plugin-owned tags on unload). */
const STYLE_TAG = 'dsh-manager'
function ensureStyles(): void {
  if (document.querySelector(`style[data-plugin-css="${STYLE_TAG}"]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-manager'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = `
.dshm-root{position:fixed;inset:0;z-index:9999;background:rgba(8,10,14,.72);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.dshm-page{display:flex;flex-direction:column;min-height:0;font-family:system-ui,sans-serif;color:#e8eaf0}
.dshm-page .dshm-head{border-radius:12px 12px 0 0}
.dshm-page .dshm-body{max-height:none}
.dshm-panel{width:min(980px,94vw);max-height:88vh;display:flex;flex-direction:column;background:#12141a;border:1px solid #262a33;border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.5);color:#e8eaf0;overflow:hidden}
.dshm-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #262a33;background:#15171e}
.dshm-head h2{margin:0;font-size:15px;font-weight:600;flex:1}
.dshm-close{background:#262a33;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px}
.dshm-close:hover{background:#333947}
.dshm-tabs{display:flex;gap:6px;padding:10px 18px 0;border-bottom:1px solid #262a33;flex-wrap:wrap}
.dshm-tab{background:transparent;border:1px solid transparent;color:#9aa2b1;border-radius:8px 8px 0 0;padding:8px 14px;cursor:pointer;font-size:13px}
.dshm-tab.active{color:#e8eaf0;background:#1a1d25;border-color:#262a33;border-bottom-color:#1a1d25}
.dshm-body{overflow:auto;padding:16px 18px;flex:1}
.dshm-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #262a33;border-radius:10px;margin-bottom:8px;background:#181b22}
.dshm-row .dshm-name{font-weight:600;font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-row .dshm-id{font-size:11px;color:#6b7384}
.dshm-badge{font-size:10px;padding:2px 8px;border-radius:99px;background:#262a33;color:#9aa2b1;white-space:nowrap}
.dshm-badge.on{background:#123;color:#5fb3ff}
.dshm-badge.off{background:#321;color:#ff9d5f}
.dshm-badge.ok{background:#10241a;color:#7ee2a8}
.dshm-btn{background:#262a33;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;white-space:nowrap}
.dshm-btn:hover{background:#333947}
.dshm-btn.primary{background:#0d6efd;border-color:#0d6efd}
.dshm-btn.danger{background:#3a1d1d;border-color:#6e2a2a}
.dshm-btn:disabled{opacity:.5;cursor:default}
.dshm-input{background:#101218;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:8px 12px;font-size:13px;flex:1;min-width:0}
.dshm-input:focus{outline:1px solid #0d6efd}
.dshm-select{background:#101218;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:8px 10px;font-size:13px}
.dshm-textarea{background:#101218;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:8px 12px;font-size:12px;font-family:ui-monospace,Consolas,monospace;width:100%;box-sizing:border-box;resize:vertical}
.dshm-card{border:1px solid #262a33;border-radius:10px;padding:12px;background:#181b22;display:flex;flex-direction:column;gap:8px}
.dshm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.dshm-card .dshm-card-name{font-weight:600;font-size:13px}
.dshm-card .dshm-card-desc{font-size:12px;color:#9aa2b1;line-height:1.45;flex:1}
.dshm-card .dshm-card-foot{display:flex;align-items:center;gap:8px;font-size:11px;color:#6b7384}
.dshm-msg{font-size:12px;padding:8px 12px;border-radius:8px;margin-top:10px;white-space:pre-wrap;word-break:break-all;max-height:140px;overflow:auto}
.dshm-msg.ok{background:#10241a;color:#7ee2a8}
.dshm-msg.err{background:#2a1515;color:#ff9d9d}
.dshm-hint{font-size:11px;color:#6b7384;margin-top:8px}
.dshm-sec{margin-bottom:14px}
.dshm-sec-title{font-size:12px;font-weight:600;color:#9aa2b1;margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em}
.dshm-form{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid #262a33;border-radius:10px;background:#15171e;margin-bottom:10px}
.dshm-form-row{display:flex;gap:8px;align-items:center}
.dshm-kv{display:flex;gap:8px;align-items:center;margin-bottom:6px}
.dshm-kv .dshm-input{flex:1}
.dshm-mono{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:#9aa2b1}
.dshm-detail{border:1px solid #262a33;border-radius:10px;background:#15171e;padding:12px;margin-bottom:10px}
.dshm-detail pre{white-space:pre-wrap;word-break:break-word;font-size:12px;color:#c8cdd8;max-height:280px;overflow:auto;margin:8px 0 0}
.dshm-toggle{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#9aa2b1;cursor:pointer}
`
  document.head.appendChild(tag)
}

/** One loader entry. */
interface PluginRow {
  id: string
  name: string
  disabled: boolean
}

/** One market entry. */
interface MarketRow {
  name: string
  repo: string
  stars: string
  desc: string
}

/** One skill summary. */
interface SkillRow {
  name: string
  description: string
  whenToUse?: string
  invocation?: string
  source?: string
  provider?: string
  path?: string
}

/** One MCP server view. */
interface McpServer {
  id: string
  serverName: string
  transport: string
  command?: string
  args?: string[]
  cwd?: string
  url?: string
  env: Array<{ key: string; value: string | null; set: boolean }>
  headers: Array<{ key: string; value: string | null; set: boolean }>
  removedEnv: string[]
  removedHeaders: string[]
  running: boolean
}

/** One credential ref row. */
interface KeyRow {
  ref: string
  configured: boolean
  source?: string
  writable: boolean
}

/** One configurable provider. */
interface ProviderRow {
  provider: string
  displayName: string
  settingsNs: string
  section: Record<string, unknown>
}

/** Shared fetch helper for the /manager APIs. */
async function managerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'content-type': 'application/json' }, ...init })
  return await res.json() as T
}

type Tab = 'plugins' | 'market' | 'skills' | 'mcp' | 'keys' | 'models' | 'theme'

/** Sidebar footer entry: opens the manager overlay. */
function ManagerButton({ open }: { open: () => void }): ReactNode {
  return (
    <button
      type="button"
      aria-label="管理控制台"
      title="管理控制台：插件 / 市场 / Skills / MCP / Keys / 模型 / 皮肤"
      onClick={open}
      style={{
        width: 28, height: 28, borderRadius: 8, border: '1px solid #333947',
        background: '#1a1d25', color: '#9aa2b1', cursor: 'pointer', fontSize: 15,
        lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      ⚙
    </button>
  )
}

/** Small status message box. */
function Msg({ msg }: { msg: { ok: boolean; text: string } | null }): ReactNode {
  return msg === null ? null : <div className={`dshm-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>
}

/** ==================== M1: plugins tab ==================== */
function PluginsTab({ busy, setBusy, msg, setMsg }: {
  busy: boolean
  setBusy: (v: boolean) => void
  msg: { ok: boolean; text: string } | null
  setMsg: (v: { ok: boolean; text: string } | null) => void
}): ReactNode {
  const [plugins, setPlugins] = useState<PluginRow[]>([])
  const [profile, setProfile] = useState('web')
  const [spec, setSpec] = useState('')
  const [loading, setLoading] = useState(true)

  const refresh = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; profile: string; plugins: PluginRow[] }>('/manager/api/plugins')
    setProfile(data.profile)
    setPlugins(data.plugins)
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const toggle = async (row: PluginRow): Promise<void> => {
    setBusy(true)
    const data = await managerFetch<{ ok: boolean; action: string; error?: string }>(
      '/manager/api/plugins/toggle', { method: 'POST', body: JSON.stringify({ id: row.id }) })
    setMsg(data.ok ? { ok: true, text: `${row.name} 已${data.action === 'enabled' ? '启用' : '禁用'}（即时生效）` } : { ok: false, text: data.error ?? 'failed' })
    await refresh()
    setBusy(false)
  }

  const install = async (target: string): Promise<void> => {
    if (target === '') return
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; output: string }>('/manager/api/install', {
      method: 'POST', body: JSON.stringify({ spec: target }) })
    setMsg(data.ok
      ? { ok: true, text: `安装成功：${target}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。` }
      : { ok: false, text: `安装失败：${target}\n${data.output.slice(-800)}` })
    setSpec('')
    setBusy(false)
  }

  const uninstall = async (row: PluginRow): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; output: string }>('/manager/api/uninstall', {
      method: 'POST', body: JSON.stringify({ name: row.name }) })
    setMsg(data.ok
      ? { ok: true, text: `已卸载：${row.name}\n${data.output.slice(-600)}\n重启后生效。` }
      : { ok: false, text: `卸载失败：${row.name}\n${data.output.slice(-600)}` })
    setBusy(false)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="dshm-input" placeholder="安装插件：npm 包名 或 github:owner/repo" value={spec}
          onChange={(e) => setSpec(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void install(spec.trim()) }} />
        <button type="button" className="dshm-btn primary" disabled={busy || spec.trim() === ''} onClick={() => void install(spec.trim())}>安装</button>
      </div>
      {loading ? <div style={{ color: '#6b7384' }}>加载中…</div> : plugins.map((row) => (
        <div key={row.id} className="dshm-row">
          <span className={`dshm-badge ${row.disabled ? 'off' : 'on'}`}>{row.disabled ? '已禁用' : '已启用'}</span>
          <span className="dshm-name" title={row.id}>{row.name}</span>
          <span className="dshm-id">{row.id}</span>
          <button type="button" className="dshm-btn" disabled={busy} onClick={() => void toggle(row)}>{row.disabled ? '启用' : '禁用'}</button>
          <button type="button" className="dshm-btn danger" disabled={busy} onClick={() => void uninstall(row)}>卸载</button>
        </div>
      ))}
      <div className="dshm-hint">profile: {profile} · 启停即时生效；安装/卸载需要重启 web 或桌面端后生效。</div>
    </>
  )
}

/** ==================== M1: market tab ==================== */
function MarketTab({ busy, setBusy, msg, setMsg }: {
  busy: boolean
  setBusy: (v: boolean) => void
  msg: { ok: boolean; text: string } | null
  setMsg: (v: { ok: boolean; text: string } | null) => void
}): ReactNode {
  const [market, setMarket] = useState<MarketRow[]>([])

  const load = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; plugins: MarketRow[] }>('/manager/api/market')
    setMarket(data.plugins)
  }
  useEffect(() => { void load() }, [])

  const install = async (repo: string): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; output: string }>('/manager/api/install', {
      method: 'POST', body: JSON.stringify({ spec: `github:${repo}` }) })
    setMsg(data.ok
      ? { ok: true, text: `安装成功：${repo}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。` }
      : { ok: false, text: `安装失败：${repo}\n${data.output.slice(-800)}` })
    setBusy(false)
  }

  return (
    <div className="dshm-grid">
      {market.map((row) => (
        <div key={row.repo + row.name} className="dshm-card">
          <div className="dshm-card-name">{row.name} <span style={{ color: '#6b7384', fontWeight: 400 }}>★{row.stars}</span></div>
          <div className="dshm-card-desc">{row.desc}</div>
          <div className="dshm-card-foot">
            <a href={`https://github.com/${row.repo}`} target="_blank" rel="noreferrer" style={{ color: '#5fb3ff', textDecoration: 'none' }}>{row.repo}</a>
            <button type="button" className="dshm-btn primary" style={{ marginLeft: 'auto' }} disabled={busy} onClick={() => void install(row.repo)}>安装</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/** ==================== M2: skills tab ==================== */
function SkillsTab({ busy, setBusy, msg, setMsg }: {
  busy: boolean
  setBusy: (v: boolean) => void
  msg: { ok: boolean; text: string } | null
  setMsg: (v: { ok: boolean; text: string } | null) => void
}): ReactNode {
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<{ name: string; content: string } | null>(null)
  const [installOpen, setInstallOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState('')

  const refresh = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; skills: SkillRow[] }>('/manager/api/skills')
    setSkills(data.skills)
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const showDetail = async (skill: SkillRow): Promise<void> => {
    if (skill.path === undefined) {
      setDetail({ name: skill.name, content: '（无文件路径，无法查看详情）' })
      return
    }
    const data = await managerFetch<{ ok: boolean; content: string; error?: string }>(`/manager/api/skills/detail?path=${encodeURIComponent(skill.path)}`)
    setDetail(data.ok ? { name: skill.name, content: data.content } : { name: skill.name, content: data.error ?? '读取失败' })
  }

  const install = async (): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/skills/install', {
      method: 'POST', body: JSON.stringify({ name: newName.trim(), content: newContent }) })
    setMsg(data.ok ? { ok: true, text: `技能 ${newName.trim()} 已安装到用户 skills 目录。` } : { ok: false, text: data.error ?? 'failed' })
    setInstallOpen(false)
    setNewName('')
    setNewContent('')
    await refresh()
    setBusy(false)
  }

  const uninstall = async (skill: SkillRow): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/skills/uninstall', {
      method: 'POST', body: JSON.stringify({ name: skill.name }) })
    setMsg(data.ok ? { ok: true, text: `技能 ${skill.name} 已移除（仅限用户目录中的技能）。` } : { ok: false, text: data.error ?? 'failed' })
    await refresh()
    setBusy(false)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" className="dshm-btn primary" onClick={() => setInstallOpen((v) => !v)}>+ 安装用户技能</button>
      </div>
      {installOpen && (
        <div className="dshm-form">
          <div className="dshm-form-row">
            <input className="dshm-input" placeholder="技能名称（小写字母/数字/中划线，如 my-helper）" value={newName}
              onChange={(e) => setNewName(e.target.value)} />
          </div>
          <textarea className="dshm-textarea" rows={6} placeholder={'SKILL.md 内容，以 YAML frontmatter 开头：\n---\nname: my-helper\ndescription: 一句话描述\n---\n\n# 使用说明\n...'} value={newContent}
            onChange={(e) => setNewContent(e.target.value)} />
          <div className="dshm-form-row">
            <button type="button" className="dshm-btn primary" disabled={busy || newName.trim() === '' || newContent === ''} onClick={() => void install()}>安装</button>
            <button type="button" className="dshm-btn" onClick={() => setInstallOpen(false)}>取消</button>
          </div>
        </div>
      )}
      {detail !== null && (
        <div className="dshm-detail">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 13 }}>{detail.name}</strong>
            <button type="button" className="dshm-btn" style={{ marginLeft: 'auto' }} onClick={() => setDetail(null)}>关闭</button>
          </div>
          <pre>{detail.content}</pre>
        </div>
      )}
      {loading ? <div style={{ color: '#6b7384' }}>加载中…</div> : skills.map((skill) => (
        <div key={skill.name + (skill.source ?? '')} className="dshm-row">
          <span className="dshm-name" title={skill.description}>{skill.name}</span>
          <span className="dshm-id" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.description}</span>
          {skill.source !== undefined && <span className="dshm-badge">{skill.source}</span>}
          <button type="button" className="dshm-btn" onClick={() => void showDetail(skill)}>详情</button>
          {skill.source === 'user' && (
            <button type="button" className="dshm-btn danger" disabled={busy} onClick={() => void uninstall(skill)}>卸载</button>
          )}
        </div>
      ))}
      <div className="dshm-hint">Skills 目录：用户级 ~/.agents/skills · 项目级 .dsh/skills 与 .agents/skills · 内置 bundled。</div>
    </>
  )
}

/** ==================== M2: MCP tab ==================== */
function McpTab({ busy, setBusy, msg, setMsg }: {
  busy: boolean
  setBusy: (v: boolean) => void
  msg: { ok: boolean; text: string } | null
  setMsg: (v: { ok: boolean; text: string } | null) => void
}): ReactNode {
  const [servers, setServers] = useState<McpServer[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<McpServer | null>(null)

  const refresh = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; servers: McpServer[] }>('/manager/api/mcp')
    setServers(data.servers)
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const save = async (server: McpServer): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const config: Record<string, unknown> = {
      serverName: server.serverName,
      transport: server.transport,
    }
    if (server.transport === 'stdio') {
      if (server.command !== undefined) config.command = server.command
      if (server.args !== undefined) config.args = server.args
    } else {
      if (server.url !== undefined) config.url = server.url
    }
    // env/headers: '' keeps the previous value, null removes the key,
    // a non-empty value overwrites it (host side merges with the old config).
    const env: Record<string, unknown> = {}
    for (const row of server.env) {
      if (row.key === '') continue
      env[row.key] = row.value === null ? null : row.value
    }
    for (const key of server.removedEnv) env[key] = null
    if (Object.keys(env).length > 0) config.env = env
    const headers: Record<string, unknown> = {}
    for (const row of server.headers) {
      if (row.key === '') continue
      headers[row.key] = row.value === null ? null : row.value
    }
    for (const key of server.removedHeaders) headers[key] = null
    if (Object.keys(headers).length > 0) config.headers = headers
    const next = [...servers.filter((s) => s.id !== server.id), { ...server, config }]
    const data = await managerFetch<{ ok: boolean; error?: string; note?: string }>('/manager/api/mcp/save', {
      method: 'POST', body: JSON.stringify({ servers: next }) })
    setMsg(data.ok ? { ok: true, text: data.note ?? '已保存。' } : { ok: false, text: data.error ?? 'failed' })
    setEditing(null)
    await refresh()
    setBusy(false)
  }

  const remove = async (server: McpServer): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const next = servers.filter((s) => s.id !== server.id)
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/mcp/save', {
      method: 'POST', body: JSON.stringify({ servers: next }) })
    setMsg(data.ok ? { ok: true, text: `已删除 MCP 服务器 ${server.serverName}。重启后生效。` } : { ok: false, text: data.error ?? 'failed' })
    await refresh()
    setBusy(false)
  }

  const newServer = (): McpServer => ({
    id: `mcp-${Date.now().toString(36)}`, serverName: '', transport: 'stdio', env: [], headers: [], removedEnv: [], removedHeaders: [], running: false,
  })

  const editServer = (server: McpServer): void => {
    setEditing({
      ...server,
      env: server.env.map((row) => ({ key: row.key, value: '', set: row.set })),
      headers: server.headers.map((row) => ({ key: row.key, value: '', set: row.set })),
      removedEnv: [],
      removedHeaders: [],
    })
  }

  const updateEnvRow = (server: McpServer, index: number, patch: Partial<{ key: string; value: string | null }>): void => {
    const env = server.env.map((row, i) => (i === index ? { ...row, ...patch } : row))
    setEditing({ ...server, env })
  }

  const removeEnvRow = (server: McpServer, index: number): void => {
    const row = server.env[index]
    const env = server.env.filter((_, i) => i !== index)
    const removed = row !== undefined && row.set && row.key !== '' ? [...server.removedEnv, row.key] : server.removedEnv
    setEditing({ ...server, env, removedEnv: removed })
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" className="dshm-btn primary" onClick={() => setEditing(newServer())}>+ 新增 MCP 服务器</button>
        <span className="dshm-hint" style={{ margin: 'auto 0 auto auto' }}>写入 profile 的 cordis.patch.yml 托管块，重启后生效。</span>
      </div>
      {editing !== null && (
        <div className="dshm-form">
          <div className="dshm-form-row">
            <input className="dshm-input" placeholder="配置行 id（如 mcp-chrome）" value={editing.id}
              onChange={(e) => setEditing({ ...editing, id: e.target.value })} />
            <input className="dshm-input" placeholder="serverName（工具名前缀，如 chrome-devtools）" value={editing.serverName}
              onChange={(e) => setEditing({ ...editing, serverName: e.target.value })} />
          </div>
          <div className="dshm-form-row">
            <select className="dshm-select" value={editing.transport}
              onChange={(e) => setEditing({ ...editing, transport: e.target.value })}>
              <option value="stdio">stdio（子进程）</option>
              <option value="streamable-http">streamable-http（URL）</option>
            </select>
            {editing.transport === 'stdio' ? (
              <>
                <input className="dshm-input" placeholder="command（如 npx）" value={editing.command ?? ''}
                  onChange={(e) => setEditing({ ...editing, command: e.target.value })} />
                <input className="dshm-input" placeholder="args（逗号分隔，如 -y,chrome-devtools-mcp）" value={(editing.args ?? []).join(',')}
                  onChange={(e) => setEditing({ ...editing, args: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
              </>
            ) : (
              <input className="dshm-input" placeholder="url（如 http://localhost:3000/mcp）" value={editing.url ?? ''}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
            )}
          </div>
          <div className="dshm-sec-title">env（已设置的行留空 = 保留原值；输入新值 = 覆盖；× = 删除）</div>
          {editing.env.map((row, i) => (
            <div key={i} className="dshm-kv">
              <input className="dshm-input" placeholder="环境变量名" value={row.key}
                onChange={(e) => updateEnvRow(editing, i, { key: e.target.value })} />
              <input className="dshm-input" type={row.set ? 'password' : 'text'}
                placeholder={row.set ? '已设置（留空保留）' : '值'}
                value={row.value === null ? '' : row.value}
                onChange={(e) => updateEnvRow(editing, i, { value: e.target.value })} />
              <button type="button" className="dshm-btn danger" onClick={() => removeEnvRow(editing, i)}>×</button>
            </div>
          ))}
          <div className="dshm-sec-title">headers</div>
          {editing.headers.map((row, i) => (
            <div key={i} className="dshm-kv">
              <input className="dshm-input" placeholder="Header 名" value={row.key}
                onChange={(e) => setEditing({ ...editing, headers: editing.headers.map((h, j) => (j === i ? { ...h, key: e.target.value } : h)) })} />
              <input className="dshm-input" type={row.set ? 'password' : 'text'}
                placeholder={row.set ? '已设置（留空保留）' : '值'}
                value={row.value === null ? '' : row.value}
                onChange={(e) => setEditing({ ...editing, headers: editing.headers.map((h, j) => (j === i ? { ...h, value: e.target.value } : h)) })} />
              <button type="button" className="dshm-btn danger"
                onClick={() => {
                  const h = editing.headers[i]
                  const headers = editing.headers.filter((_, j) => j !== i)
                  const removedHeaders = h !== undefined && h.set && h.key !== '' ? [...editing.removedHeaders, h.key] : editing.removedHeaders
                  setEditing({ ...editing, headers, removedHeaders })
                }}>×</button>
            </div>
          ))}
          <div className="dshm-form-row">
            <button type="button" className="dshm-btn" onClick={() => setEditing({ ...editing, env: [...editing.env, { key: '', value: '', set: false }] })}>+ env 行</button>
            <button type="button" className="dshm-btn" onClick={() => setEditing({ ...editing, headers: [...editing.headers, { key: '', value: '', set: false }] })}>+ header 行</button>
          </div>
          <div className="dshm-form-row">
            <button type="button" className="dshm-btn primary" disabled={busy || editing.id === '' || editing.serverName === ''}
              onClick={() => void save(editing)}>保存</button>
            <button type="button" className="dshm-btn" onClick={() => setEditing(null)}>取消</button>
          </div>
        </div>
      )}
      {loading ? <div style={{ color: '#6b7384' }}>加载中…</div> : servers.map((server) => (
        <div key={server.id} className="dshm-row">
          <span className={`dshm-badge ${server.running ? 'on' : 'off'}`}>{server.running ? '运行中' : '未加载'}</span>
          <span className="dshm-name">{server.serverName}</span>
          <span className="dshm-id">{server.transport === 'stdio' ? `${server.command ?? ''} ${(server.args ?? []).join(' ')}` : server.url ?? ''}</span>
          {(server.env.length > 0 || server.headers.length > 0) && (
            <span className="dshm-badge">env:{server.env.length} hdr:{server.headers.length}</span>
          )}
          <button type="button" className="dshm-btn" onClick={() => editServer(server)}>编辑</button>
          <button type="button" className="dshm-btn danger" disabled={busy} onClick={() => void remove(server)}>删除</button>
        </div>
      ))}
    </>
  )
}

/** ==================== M3: keys tab ==================== */
function KeysTab({ busy, setBusy, msg, setMsg }: {
  busy: boolean
  setBusy: (v: boolean) => void
  msg: { ok: boolean; text: string } | null
  setMsg: (v: { ok: boolean; text: string } | null) => void
}): ReactNode {
  const [keys, setKeys] = useState<KeyRow[]>([])
  const [available, setAvailable] = useState(true)
  const [loading, setLoading] = useState(true)
  const [setRef, setSetRef] = useState('')
  const [setValue, setSetValue] = useState('')

  const refresh = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; available: boolean; keys: KeyRow[] }>('/manager/api/keys')
    setAvailable(data.available)
    setKeys(data.keys)
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const setKey = async (): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/keys/set', {
      method: 'POST', body: JSON.stringify({ ref: setRef.trim(), value: setValue }) })
    setMsg(data.ok ? { ok: true, text: `已保存 ${setRef.trim()}（值已加密存储，不再回显）。` } : { ok: false, text: data.error ?? 'failed' })
    setSetRef('')
    setSetValue('')
    await refresh()
    setBusy(false)
  }

  const unset = async (row: KeyRow): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/keys/unset', {
      method: 'POST', body: JSON.stringify({ ref: row.ref }) })
    setMsg(data.ok ? { ok: true, text: `已清除 ${row.ref}` } : { ok: false, text: data.error ?? 'failed' })
    await refresh()
    setBusy(false)
  }

  return (
    <>
      <div className="dshm-sec">
        <div className="dshm-sec-title">设置 / 更新 Key（值不会回显，只会显示已配置状态）</div>
        <div className="dshm-form">
          <div className="dshm-form-row">
            <input className="dshm-input" placeholder="环境变量名（如 DEEPSEEK_V4_FLASH_API_KEY）" value={setRef}
              onChange={(e) => setSetRef(e.target.value)} />
            <input className="dshm-input" type="password" placeholder="Key 值" value={setValue}
              onChange={(e) => setSetValue(e.target.value)} />
            <button type="button" className="dshm-btn primary" disabled={busy || setRef.trim() === '' || setValue === ''}
              onClick={() => void setKey()}>保存</button>
          </div>
        </div>
      </div>
      <div className="dshm-sec">
        <div className="dshm-sec-title">已识别的凭据引用（来自模型供应商配置）</div>
        {!available ? <div className="dshm-hint">credentials 服务不可用（当前 profile 未提供）。</div>
          : loading ? <div style={{ color: '#6b7384' }}>加载中…</div>
          : keys.length === 0 ? <div className="dshm-hint">未发现模型供应商的 apiKeyEnv 引用。</div>
          : keys.map((row) => (
            <div key={row.ref} className="dshm-row">
              <span className={`dshm-badge ${row.configured ? 'ok' : 'off'}`}>{row.configured ? '已配置' : '未配置'}</span>
              <span className="dshm-name dshm-mono">{row.ref}</span>
              {row.source !== undefined && <span className="dshm-id">来源: {row.source}</span>}
              {row.writable && (
                <button type="button" className="dshm-btn danger" disabled={busy} onClick={() => void unset(row)}>清除</button>
              )}
            </div>
          ))}
      </div>
    </>
  )
}

/** ==================== M3: models tab ==================== */
function ModelsTab({ busy, setBusy, msg, setMsg }: {
  busy: boolean
  setBusy: (v: boolean) => void
  msg: { ok: boolean; text: string } | null
  setMsg: (v: { ok: boolean; text: string } | null) => void
}): ReactNode {
  const [defaults, setDefaults] = useState<Record<string, unknown> | null>(null)
  const [providers, setProviders] = useState<ProviderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [defProvider, setDefProvider] = useState('')
  const [defModel, setDefModel] = useState('')
  const [defEffort, setDefEffort] = useState('')
  const [editingNs, setEditingNs] = useState<string | null>(null)
  const [editBaseUrl, setEditBaseUrl] = useState('')
  const [editApiKeyEnv, setEditApiKeyEnv] = useState('')

  const refresh = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; default: Record<string, unknown> | null; providers: ProviderRow[] }>('/manager/api/models')
    setDefaults(data.default)
    setProviders(data.providers)
    if (data.default !== null) {
      setDefProvider(String(data.default.provider ?? ''))
      setDefModel(String(data.default.model ?? ''))
      setDefEffort(String(data.default.reasoningEffort ?? ''))
    }
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const saveDefault = async (): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const body: Record<string, unknown> = { provider: defProvider.trim(), model: defModel.trim() }
    if (defEffort !== '') body.reasoningEffort = defEffort
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/models/default', {
      method: 'POST', body: JSON.stringify(body) })
    setMsg(data.ok ? { ok: true, text: '默认模型已更新。' } : { ok: false, text: data.error ?? 'failed' })
    await refresh()
    setBusy(false)
  }

  const openProvider = (row: ProviderRow): void => {
    setEditingNs(row.settingsNs)
    const section = row.section ?? {}
    setEditBaseUrl(String(section.baseURL ?? ''))
    setEditApiKeyEnv(String(section.apiKeyEnv ?? ''))
  }

  const saveProvider = async (): Promise<void> => {
    if (editingNs === null) return
    setBusy(true)
    setMsg(null)
    const current = providers.find((p) => p.settingsNs === editingNs)?.section ?? {}
    const section = { ...current, baseURL: editBaseUrl.trim(), apiKeyEnv: editApiKeyEnv.trim() }
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/models/provider', {
      method: 'POST', body: JSON.stringify({ settingsNs: editingNs, section }) })
    setMsg(data.ok ? { ok: true, text: `供应商 ${editingNs} 已更新。` } : { ok: false, text: data.error ?? 'failed' })
    setEditingNs(null)
    await refresh()
    setBusy(false)
  }

  return (
    <>
      <div className="dshm-sec">
        <div className="dshm-sec-title">默认模型（agent-default-model）</div>
        {loading ? <div style={{ color: '#6b7384' }}>加载中…</div> : (
          <div className="dshm-form">
            <div className="dshm-form-row">
              <input className="dshm-input" placeholder="provider（如 deepseek-official / pi-ai）" value={defProvider}
                onChange={(e) => setDefProvider(e.target.value)} />
              <input className="dshm-input" placeholder="model（如 deepseek-v4-flash）" value={defModel}
                onChange={(e) => setDefModel(e.target.value)} />
              <select className="dshm-select" value={defEffort} onChange={(e) => setDefEffort(e.target.value)}>
                <option value="">默认推理强度</option>
                <option value="min">min</option>
                <option value="medium">medium</option>
                <option value="max">max</option>
              </select>
              <button type="button" className="dshm-btn primary" disabled={busy || defProvider === '' || defModel === ''}
                onClick={() => void saveDefault()}>保存</button>
            </div>
          </div>
        )}
      </div>
      <div className="dshm-sec">
        <div className="dshm-sec-title">模型供应商（configurable providers）</div>
        {providers.map((row) => (
          <div key={row.settingsNs} className="dshm-row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div><span className="dshm-name">{row.displayName}</span> <span className="dshm-id">{row.provider} · {row.settingsNs}</span></div>
              <div className="dshm-mono" style={{ marginTop: 4 }}>
                baseURL: {String(row.section.baseURL ?? '-')}<br />
                apiKeyEnv: {String(row.section.apiKeyEnv ?? '-')}<br />
                models: {Array.isArray(row.section.models) ? (row.section.models as Array<{ id?: string }>).map((m) => m.id ?? '').join(', ') : '-'}
              </div>
            </div>
            <button type="button" className="dshm-btn" onClick={() => openProvider(row)}>编辑</button>
          </div>
        ))}
      </div>
      {editingNs !== null && (
        <div className="dshm-form">
          <div className="dshm-sec-title">编辑供应商：{editingNs}</div>
          <div className="dshm-form-row">
            <input className="dshm-input" placeholder="baseURL（如 http://host:port/v1）" value={editBaseUrl}
              onChange={(e) => setEditBaseUrl(e.target.value)} />
          </div>
          <div className="dshm-form-row">
            <input className="dshm-input" placeholder="apiKeyEnv（环境变量名，如 MY_API_KEY）" value={editApiKeyEnv}
              onChange={(e) => setEditApiKeyEnv(e.target.value)} />
          </div>
          <div className="dshm-form-row">
            <button type="button" className="dshm-btn primary" disabled={busy} onClick={() => void saveProvider()}>保存</button>
            <button type="button" className="dshm-btn" onClick={() => setEditingNs(null)}>取消</button>
          </div>
        </div>
      )}
      <div className="dshm-hint">models 列表等其他字段保留原值；修改供应商后到 Keys 页配置对应 apiKeyEnv。</div>
    </>
  )
}

/** ==================== M3: theme tab ==================== */
function ThemeTab({ busy, setBusy, msg, setMsg }: {
  busy: boolean
  setBusy: (v: boolean) => void
  msg: { ok: boolean; text: string } | null
  setMsg: (v: { ok: boolean; text: string } | null) => void
}): ReactNode {
  const [preference, setPreference] = useState('system')
  const [skins, setSkins] = useState<PluginRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; preference: string; skins: PluginRow[] }>('/manager/api/theme')
    setPreference(data.preference)
    setSkins(data.skins)
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const savePreference = async (value: string): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/theme', {
      method: 'POST', body: JSON.stringify({ preference: value }) })
    setMsg(data.ok ? { ok: true, text: `主题已切换为 ${value}（即时生效）。` } : { ok: false, text: data.error ?? 'failed' })
    setPreference(value)
    setBusy(false)
  }

  const toggleSkin = async (row: PluginRow): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; action: string; error?: string }>(
      '/manager/api/plugins/toggle', { method: 'POST', body: JSON.stringify({ id: row.id }) })
    setMsg(data.ok ? { ok: true, text: `${row.name} 已${data.action === 'enabled' ? '启用' : '禁用'}（即时生效）` } : { ok: false, text: data.error ?? 'failed' })
    await refresh()
    setBusy(false)
  }

  return (
    <>
      <div className="dshm-sec">
        <div className="dshm-sec-title">主题偏好（ui-theme）</div>
        {loading ? <div style={{ color: '#6b7384' }}>加载中…</div> : (
          <div className="dshm-form">
            <div className="dshm-form-row">
              {(['light', 'dark', 'system'] as const).map((value) => (
                <button key={value} type="button"
                  className={`dshm-btn ${preference === value ? 'primary' : ''}`}
                  disabled={busy} onClick={() => void savePreference(value)}>
                  {value === 'light' ? '浅色' : value === 'dark' ? '深色' : '跟随系统'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="dshm-sec">
        <div className="dshm-sec-title">已安装皮肤插件（启停即时生效）</div>
        {skins.map((row) => (
          <div key={row.id} className="dshm-row">
            <span className={`dshm-badge ${row.disabled ? 'off' : 'on'}`}>{row.disabled ? '已禁用' : '已启用'}</span>
            <span className="dshm-name">{row.name}</span>
            <button type="button" className="dshm-btn" disabled={busy} onClick={() => void toggleSkin(row)}>{row.disabled ? '启用' : '禁用'}</button>
          </div>
        ))}
        {skins.length === 0 && <div className="dshm-hint">未检测到皮肤插件（装 dsh-web-ui / dsh-skin 系列后出现）。</div>}
      </div>
    </>
  )
}

/** Shared panel body: header + tabs + tab pages. Rendered either inside the
 * floating overlay (sidebar ⚙) or as a page in the official settings panel
 * (settings.section slot). `onClose` is optional — the settings page has the
 * panel's own Close, the overlay shows its own. */
function ManagerPanel({ onClose }: { onClose?: () => void }): ReactNode {
  const [tab, setTab] = useState<Tab>('plugins')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'plugins', label: '插件' },
    { id: 'market', label: '市场' },
    { id: 'skills', label: 'Skills' },
    { id: 'mcp', label: 'MCP' },
    { id: 'keys', label: 'Keys' },
    { id: 'models', label: '模型' },
    { id: 'theme', label: '皮肤' },
  ]

  return (
    <>
      <div className="dshm-head">
        <h2>DSH 管理控制台</h2>
        {onClose !== undefined && (
          <button type="button" className="dshm-close" onClick={onClose}>关闭</button>
        )}
      </div>
      <div className="dshm-tabs">
        {tabs.map((t) => (
          <button key={t.id} type="button" className={`dshm-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => { setTab(t.id); setMsg(null) }}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="dshm-body">
        {tab === 'plugins' && <PluginsTab busy={busy} setBusy={setBusy} msg={msg} setMsg={setMsg} />}
        {tab === 'market' && <MarketTab busy={busy} setBusy={setBusy} msg={msg} setMsg={setMsg} />}
        {tab === 'skills' && <SkillsTab busy={busy} setBusy={setBusy} msg={msg} setMsg={setMsg} />}
        {tab === 'mcp' && <McpTab busy={busy} setBusy={setBusy} msg={msg} setMsg={setMsg} />}
        {tab === 'keys' && <KeysTab busy={busy} setBusy={setBusy} msg={msg} setMsg={setMsg} />}
        {tab === 'models' && <ModelsTab busy={busy} setBusy={setBusy} msg={msg} setMsg={setMsg} />}
        {tab === 'theme' && <ThemeTab busy={busy} setBusy={setBusy} msg={msg} setMsg={setMsg} />}
        <Msg msg={msg} />
      </div>
    </>
  )
}

/** Floating overlay entry (sidebar footer ⚙). */
function ManagerOverlay({ onClose }: { onClose: () => void }): ReactNode {
  return (
    <div className="dshm-root" onClick={onClose}>
      <div className="dshm-panel" onClick={(e) => e.stopPropagation()}>
        <ManagerPanel onClose={onClose} />
      </div>
    </div>
  )
}

/** Official settings-panel page entry (settings.section slot). */
function ManagerSection(props: Record<string, unknown>): ReactNode {
  // The settings panel provides its own page frame, scroll, and Close; we
  // render the panel body inline (the `close` owner prop stays available).
  return (
    <div className="dshm-page">
      <ManagerPanel />
    </div>
  )
}

/**
 * Plugin body: register the sidebar footer entry AND the official settings
 * panel page once their slots declare.
 * @param ctx - client root context (slots injected).
 */
export function apply(ctx: ManagerCtx): void {
  ensureStyles()
  // Sidebar footer shortcut (floating overlay).
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    // list-kind slots require a stable item id alongside the slot name
    id: 'dsh-manager',
    name: 'sidebar.footer.action',
    inject: () => ({}),
  }, (props: Record<string, unknown>) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <ManagerButton open={() => setOpen(true)} />
        {open && <ManagerOverlay onClose={() => setOpen(false)} />}
      </>
    )
  }))
  // Official settings panel page (sidebar 设置 → left page list).
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    id: 'dsh-manager',
    name: 'settings.section',
    order: 50,
    label: '管理控制台',
    inject: () => ({}),
  }, ManagerSection))
}
