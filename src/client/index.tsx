/**
 * dsh-manager browser half: distributes its surfaces across the official
 * settings panel —
 *   设置 → 插件 →「插件管理」tab：loader 清单 / 运行时启停 / 持久卸载 / 安装
 *   设置 → 插件 →「插件市场」tab：GitHub dsh-plugin 市场浏览 + 一键安装
 *   设置 →「Skills 管理」页：技能目录列表 / 详情 / 新建 / md 导入 / 卸载
 *   设置 →「MCP 管理」页：已配置 MCP 服务器 + Smithery 开源商店
 * All data flows over the same-origin /manager JSON APIs served by the host
 * half — no private harness internals.
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

/** Shared stylesheet, injected once (loader removes plugin-owned tags on unload). */
const STYLE_TAG = 'dsh-manager'
function ensureStyles(): void {
  if (document.querySelector(`style[data-plugin-css="${STYLE_TAG}"]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-manager'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = `
.dshm-page{display:flex;flex-direction:column;min-height:0;font-family:system-ui,sans-serif;color:var(--dsw-alias-label-primary,#e8eaf0)}
.dshm-page .dshm-tabs{border-radius:12px 12px 0 0}
.dshm-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l2,#262a33);background:var(--dsw-alias-bg-layer-3,#15171e)}
.dshm-head h2{margin:0;font-size:15px;font-weight:600;flex:1}
.dshm-tabs{display:flex;gap:6px;padding:10px 18px 0;border-bottom:1px solid var(--dsw-alias-border-l2,#262a33);flex-wrap:wrap}
.dshm-tab{background:transparent;border:1px solid transparent;color:var(--dsw-alias-label-secondary,#9aa2b1);border-radius:8px 8px 0 0;padding:8px 14px;cursor:pointer;font-size:13px}
.dshm-tab.active{color:var(--dsw-alias-label-primary,#e8eaf0);background:var(--dsw-alias-bg-layer-2,#1a1d25);border-color:var(--dsw-alias-border-l2,#262a33);border-bottom-color:var(--dsw-alias-bg-layer-2,#1a1d25)}
.dshm-body{overflow:auto;padding:16px 18px;flex:1}
.dshm-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2,#262a33);border-radius:10px;margin-bottom:8px;background:var(--dsw-alias-bg-layer-3,#181b22)}
.dshm-row .dshm-name{font-weight:600;font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-row .dshm-id{font-size:11px;color:var(--dsw-alias-label-tertiary,#6b7384)}
.dshm-badge{font-size:10px;padding:2px 8px;border-radius:99px;background:var(--dsw-alias-bg-layer-3,#262a33);color:var(--dsw-alias-label-secondary,#9aa2b1);white-space:nowrap}
.dshm-badge.on{background:#123;color:#5fb3ff}
.dshm-badge.off{background:#321;color:#ff9d5f}
.dshm-badge.ok{background:#10241a;color:#7ee2a8}
.dshm-btn{background:var(--dsw-alias-bg-layer-3,#262a33);border:1px solid var(--dsw-alias-border-l2,#333947);color:var(--dsw-alias-label-primary,#e8eaf0);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;white-space:nowrap}
.dshm-btn:hover{background:var(--dsw-alias-bg-hover,#333947)}
.dshm-btn.primary{background:var(--dsw-alias-accent,#0d6efd);border-color:var(--dsw-alias-accent,#0d6efd)}
.dshm-btn.danger{background:#dc3545;border-color:#dc3545;color:#fff}
.dshm-btn.danger:hover{background:#bb2d3b}
.dshm-btn:disabled{opacity:.5;cursor:default}
.dshm-input{background:var(--dsw-alias-bg-base,#101218);border:1px solid var(--dsw-alias-border-l2,#333947);color:var(--dsw-alias-label-primary,#e8eaf0);border-radius:8px;padding:8px 12px;font-size:13px;flex:1;min-width:0}
.dshm-input:focus{outline:1px solid var(--dsw-alias-accent,#0d6efd)}
.dshm-select{background:var(--dsw-alias-bg-base,#101218);border:1px solid var(--dsw-alias-border-l2,#333947);color:var(--dsw-alias-label-primary,#e8eaf0);border-radius:8px;padding:8px 10px;font-size:13px}
.dshm-textarea{background:var(--dsw-alias-bg-base,#101218);border:1px solid var(--dsw-alias-border-l2,#333947);color:var(--dsw-alias-label-primary,#e8eaf0);border-radius:8px;padding:8px 12px;font-size:12px;font-family:ui-monospace,Consolas,monospace;width:100%;box-sizing:border-box;resize:vertical}
.dshm-card{border:1px solid var(--dsw-alias-border-l2,#262a33);border-radius:10px;padding:12px;background:var(--dsw-alias-bg-layer-3,#181b22);display:flex;flex-direction:column;gap:8px}
.dshm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.dshm-card .dshm-card-name{font-weight:600;font-size:13px}
.dshm-card .dshm-card-desc{font-size:12px;color:var(--dsw-alias-label-secondary,#9aa2b1);line-height:1.45;flex:1}
.dshm-card .dshm-card-foot{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#6b7384)}
.dshm-msg{font-size:12px;padding:8px 12px;border-radius:8px;margin-top:10px;white-space:pre-wrap;word-break:break-all;max-height:140px;overflow:auto}
.dshm-msg.ok{background:#10241a;color:#7ee2a8}
.dshm-msg.err{background:#2a1515;color:#ff9d9d}
.dshm-hint{font-size:11px;color:var(--dsw-alias-label-tertiary,#6b7384);margin-top:8px}
.dshm-sec{margin-bottom:14px}
.dshm-sec-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#9aa2b1);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em}
.dshm-form{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--dsw-alias-border-l2,#262a33);border-radius:10px;background:var(--dsw-alias-bg-layer-3,#15171e);margin-bottom:10px}
.dshm-form-row{display:flex;gap:8px;align-items:center}
.dshm-kv{display:flex;gap:8px;align-items:center;margin-bottom:6px}
.dshm-kv .dshm-input{flex:1}
.dshm-mono{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:var(--dsw-alias-label-secondary,#9aa2b1)}
.dshm-detail{border:1px solid var(--dsw-alias-border-l2,#262a33);border-radius:10px;background:var(--dsw-alias-bg-layer-3,#15171e);padding:12px;margin-bottom:10px}
.dshm-detail pre{white-space:pre-wrap;word-break:break-word;font-size:12px;color:var(--dsw-alias-label-primary,#c8cdd8);max-height:280px;overflow:auto;margin:8px 0 0}
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

/** One Smithery store server row. */
interface MarketServer {
  id: string
  name: string
  description: string
  verified: boolean
  useCount: number
  url: string | null
}

/** Shared fetch helper for the /manager APIs. Throws on transport failure so
 * callers can surface a message instead of rendering undefined data. A 404
 * with `not found` means the running host process predates this route. */
async function managerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'content-type': 'application/json' }, ...init })
  if (!res.ok && res.status !== 200) {
    // the host answers 4xx/5xx with JSON {ok:false,error}
    try {
      const body = await res.json() as { error?: string }
      if (res.status === 404 && body.error === 'not found') {
        throw new Error('host 端 dsh-manager 版本过旧：请完全重启 web GUI（不是刷新页面）后重试')
      }
      throw new Error(body.error ?? `HTTP ${res.status}`)
    } catch (error) {
      if (error instanceof Error && (error.message.startsWith('HTTP') || error.message.includes('版本过旧'))) throw error
      throw new Error(`HTTP ${res.status}`)
    }
  }
  return await res.json() as T
}

/** Small status message box. */
function Msg({ msg }: { msg: { ok: boolean; text: string } | null }): ReactNode {
  return msg === null ? null : <div className={`dshm-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>
}

/** Local busy/msg state shared by every page. */
function useManagerState(): { busy: boolean; setBusy: (v: boolean) => void; msg: { ok: boolean; text: string } | null; setMsg: (v: { ok: boolean; text: string } | null) => void } {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  return { busy, setBusy, msg, setMsg }
}

/** ==================== 设置 → 插件 →「插件管理」tab ==================== */
function PluginsManageTab(props: Record<string, unknown>): ReactNode {
  const { busy, setBusy, msg, setMsg } = useManagerState()
  const [plugins, setPlugins] = useState<PluginRow[]>([])
  const [profile, setProfile] = useState('web')
  const [spec, setSpec] = useState('')
  const [loading, setLoading] = useState(true)

  const refresh = async (): Promise<void> => {
    try {
      const data = await managerFetch<{ ok: boolean; profile: string; plugins: PluginRow[] }>('/manager/api/plugins')
      if (data.ok !== true) throw new Error(data.ok === undefined ? 'host 端未加载 dsh-manager（请完全重启 web GUI）' : 'plugins API 错误')
      setProfile(data.profile)
      setPlugins(data.plugins)
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const toggle = async (row: PluginRow): Promise<void> => {
    setBusy(true)
    try {
      const data = await managerFetch<{ ok: boolean; action: string; error?: string }>(
        '/manager/api/plugins/toggle', { method: 'POST', body: JSON.stringify({ id: row.id }) })
      setMsg(data.ok ? { ok: true, text: `${row.name} 已${data.action === 'enabled' ? '启用' : '禁用'}（即时生效）` } : { ok: false, text: data.error ?? 'failed' })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    await refresh()
    setBusy(false)
  }

  const install = async (target: string): Promise<void> => {
    if (target === '') return
    setBusy(true)
    setMsg(null)
    try {
      const data = await managerFetch<{ ok: boolean; output: string }>('/manager/api/install', {
        method: 'POST', body: JSON.stringify({ spec: target }) })
      setMsg(data.ok
        ? { ok: true, text: `安装成功：${target}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。` }
        : { ok: false, text: `安装失败：${target}\n${data.output.slice(-800)}` })
      setSpec('')
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    setBusy(false)
  }

  const uninstall = async (row: PluginRow): Promise<void> => {
    setBusy(true)
    setMsg(null)
    try {
      const data = await managerFetch<{ ok: boolean; output: string }>('/manager/api/uninstall', {
        method: 'POST', body: JSON.stringify({ name: row.name }) })
      setMsg(data.ok
        ? { ok: true, text: `已卸载：${row.name}\n${data.output.slice(-600)}\n重启后生效。` }
        : { ok: false, text: `卸载失败：${row.name}\n${data.output.slice(-600)}` })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    setBusy(false)
  }

  return (
    <div className="dshm-body">
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
      <div className="dshm-hint">profile: {profile} · 启停即时生效；安装/卸载需要完全重启 web 或桌面端后生效。</div>
      <Msg msg={msg} />
    </div>
  )
}

/** ==================== 设置 → 插件 →「插件市场」tab ==================== */
function MarketStoreTab(props: Record<string, unknown>): ReactNode {
  const { busy, setBusy, msg, setMsg } = useManagerState()
  const [market, setMarket] = useState<MarketRow[]>([])

  const load = async (): Promise<void> => {
    try {
      const data = await managerFetch<{ ok: boolean; plugins: MarketRow[] }>('/manager/api/market')
      if (data.ok !== true) throw new Error(data.ok === undefined ? 'host 端未加载 dsh-manager（请完全重启 web GUI）' : 'market API 错误')
      setMarket(data.plugins)
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
  }
  useEffect(() => { void load() }, [])

  const install = async (repo: string): Promise<void> => {
    setBusy(true)
    setMsg(null)
    try {
      const data = await managerFetch<{ ok: boolean; output: string }>('/manager/api/install', {
        method: 'POST', body: JSON.stringify({ spec: `github:${repo}` }) })
      setMsg(data.ok
        ? { ok: true, text: `安装成功：${repo}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。` }
        : { ok: false, text: `安装失败：${repo}\n${data.output.slice(-800)}` })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    setBusy(false)
  }

  return (
    <div className="dshm-body">
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
      <Msg msg={msg} />
    </div>
  )
}

/** ==================== 设置 → Skills 管理 ==================== */
function SkillsPage(props: Record<string, unknown>): ReactNode {
  const { busy, setBusy, msg, setMsg } = useManagerState()
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<{ name: string; content: string } | null>(null)
  const [installOpen, setInstallOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState('')
  const [importResult, setImportResult] = useState<{ imported: string[]; skipped: Array<{ name: string; reason: string }>; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileRef = { current: null as HTMLInputElement | null }

  const refresh = async (): Promise<void> => {
    try {
      const data = await managerFetch<{ ok: boolean; skills: SkillRow[] }>('/manager/api/skills')
      if (data.ok !== true) throw new Error(data.ok === undefined ? 'host 端未加载 dsh-manager（请完全重启 web GUI）' : 'skills API 错误')
      setSkills(data.skills)
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
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
    try {
      const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/skills/install', {
        method: 'POST', body: JSON.stringify({ name: newName.trim(), content: newContent }) })
      setMsg(data.ok ? { ok: true, text: `技能 ${newName.trim()} 已安装到用户 skills 目录。` } : { ok: false, text: data.error ?? 'failed' })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    setInstallOpen(false)
    setNewName('')
    setNewContent('')
    await refresh()
    setBusy(false)
  }

  const importFile = async (file: File): Promise<void> => {
    const content = await file.text()
    setBusy(true)
    setMsg(null)
    try {
      const data = await managerFetch<{ ok: boolean; name?: string; error?: string }>('/manager/api/skills/import', {
        method: 'POST', body: JSON.stringify({ filename: file.name, content }) })
      setMsg(data.ok
        ? { ok: true, text: `已导入技能 ${data.name ?? file.name}（名称取自 frontmatter，否则取自文件名）。` }
        : { ok: false, text: data.error ?? '导入失败' })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    await refresh()
    setBusy(false)
  }

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file !== undefined) void importFile(file)
    e.target.value = ''
  }

  const importAll = async (): Promise<void> => {
    setImporting(true)
    setMsg(null)
    setImportResult(null)
    try {
      const data = await managerFetch<{ ok: boolean; imported: string[]; skipped: Array<{ name: string; reason: string }>; errors: string[] }>('/manager/api/skills/import-all', { method: 'POST' })
      if (data.ok) {
        setImportResult(data)
        const total = data.imported.length + data.skipped.length + data.errors.length
        setMsg({ ok: true, text: `全局扫描完成：共扫描 ${total} 个技能，导入 ${data.imported.length} 个，跳过 ${data.skipped.length} 个重复，${data.errors.length} 个错误。` })
      } else {
        setMsg({ ok: false, text: '全局扫描导入失败' })
      }
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    await refresh()
    setImporting(false)
  }

  const uninstall = async (skill: SkillRow): Promise<void> => {
    setBusy(true)
    setMsg(null)
    try {
      const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/skills/uninstall', {
        method: 'POST', body: JSON.stringify({ name: skill.name }) })
      setMsg(data.ok ? { ok: true, text: `技能 ${skill.name} 已移除（仅限用户目录中的技能）。` } : { ok: false, text: data.error ?? 'failed' })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    await refresh()
    setBusy(false)
  }

  return (
    <div className="dshm-page">
      <div className="dshm-head"><h2>Skills 管理</h2></div>
      <div className="dshm-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button type="button" className="dshm-btn primary" onClick={() => setInstallOpen((v) => !v)}>+ 新建用户技能</button>
          <button type="button" className="dshm-btn" onClick={() => fileRef.current?.click()}>📄 导入 md 文件</button>
          <button type="button" className="dshm-btn" disabled={importing} onClick={() => void importAll()}>🔍 全局扫描导入</button>
          <input ref={(el) => { fileRef.current = el }} type="file" accept=".md,.markdown" style={{ display: 'none' }} onChange={onFilePicked} />
        </div>
        {importResult !== null && importResult.imported.length > 0 && (
          <div className="dshm-msg ok" style={{ marginBottom: 12 }}>
            <strong>导入的技能：</strong>{importResult.imported.join('、')}
            {importResult.skipped.length > 0 && <><br /><strong>跳过的重复：</strong>{importResult.skipped.map((s) => s.name).join('、')}</>}
            {importResult.errors.length > 0 && <><br /><strong>错误：</strong>{importResult.errors.join('、')}</>}
          </div>
        )}
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
            {(skill.source === 'user-agents' || skill.source === 'user-dsh') && (
              <button type="button" className="dshm-btn danger" disabled={busy} onClick={() => void uninstall(skill)}>卸载</button>
            )}
          </div>
        ))}
        <div className="dshm-hint">用户技能存于 ~/.dsh/skills（新建/导入/卸载均在此）· 展示范围：~/.dsh/skills、~/.agents/skills、项目级与内置 bundled。</div>
        <Msg msg={msg} />
      </div>
    </div>
  )
}

/** ==================== 设置 → MCP 管理 ==================== */
function McpPage(props: Record<string, unknown>): ReactNode {
  const { busy, setBusy, msg, setMsg } = useManagerState()
  const [view, setView] = useState<'configured' | 'market'>('configured')
  const [servers, setServers] = useState<McpServer[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<McpServer | null>(null)
  // market state
  const [market, setMarket] = useState<MarketServer[]>([])
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketQuery, setMarketQuery] = useState('')

  const refresh = async (): Promise<void> => {
    try {
      const data = await managerFetch<{ ok: boolean; servers: McpServer[] }>('/manager/api/mcp')
      if (data.ok !== true) throw new Error(data.ok === undefined ? 'host 端未加载 dsh-manager（请完全重启 web GUI）' : 'mcp API 错误')
      setServers(data.servers)
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
  }
  useEffect(() => { void refresh().then(() => setLoading(false)) }, [])

  const searchMarket = async (query: string): Promise<void> => {
    setMarketLoading(true)
    setMsg(null)
    try {
      const data = await managerFetch<{ ok: boolean; servers?: MarketServer[]; error?: string }>(
        `/manager/api/mcp/market?q=${encodeURIComponent(query)}`)
      if (data.ok) {
        setMarket(data.servers ?? [])
      } else {
        setMarket([])
        setMsg({ ok: false, text: data.error ?? '商店搜索失败' })
      }
    } catch (error) {
      setMarket([])
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    setMarketLoading(false)
  }
  useEffect(() => { void searchMarket('') }, [])

  const installFromMarket = async (row: MarketServer): Promise<void> => {
    if (row.url === null) {
      setMsg({ ok: false, text: `${row.name} 没有可用的远程连接（无 streamable-http 部署），暂不支持一键安装。` })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const data = await managerFetch<{ ok: boolean; error?: string; note?: string }>('/manager/api/mcp/install-market', {
        method: 'POST', body: JSON.stringify({ name: row.id, url: row.url }) })
      setMsg(data.ok ? { ok: true, text: data.note ?? '已安装。' } : { ok: false, text: data.error ?? '安装失败' })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    await refresh()
    setBusy(false)
  }

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
    try {
      const data = await managerFetch<{ ok: boolean; error?: string; note?: string }>('/manager/api/mcp/save', {
        method: 'POST', body: JSON.stringify({ servers: next }) })
      setMsg(data.ok ? { ok: true, text: data.note ?? '已保存。' } : { ok: false, text: data.error ?? 'failed' })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
    setEditing(null)
    await refresh()
    setBusy(false)
  }

  const remove = async (server: McpServer): Promise<void> => {
    setBusy(true)
    setMsg(null)
    const next = servers.filter((s) => s.id !== server.id)
    try {
      const data = await managerFetch<{ ok: boolean; error?: string }>('/manager/api/mcp/save', {
        method: 'POST', body: JSON.stringify({ servers: next }) })
      setMsg(data.ok ? { ok: true, text: `已删除 MCP 服务器 ${server.serverName}。重启后生效。` } : { ok: false, text: data.error ?? 'failed' })
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : String(error) })
    }
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
    <div className="dshm-page">
      <div className="dshm-head"><h2>MCP 管理</h2></div>
      <div className="dshm-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button type="button" className={`dshm-btn${view === 'configured' ? ' primary' : ''}`} onClick={() => setView('configured')}>已配置</button>
          <button type="button" className={`dshm-btn${view === 'market' ? ' primary' : ''}`} onClick={() => setView('market')}>开源商店</button>
          {view === 'configured' && (
            <>
              <button type="button" className="dshm-btn" onClick={() => setEditing(newServer())}>+ 新增</button>
              <span className="dshm-hint" style={{ margin: 'auto 0 auto auto' }}>写入 profile 的 cordis.patch.yml 托管块，重启后生效。</span>
            </>
          )}
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
        {view === 'market' ? (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="dshm-input" placeholder="搜索 MCP 开源商店（Smithery），如 github / browser / sqlite" value={marketQuery}
                onChange={(e) => setMarketQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void searchMarket(marketQuery.trim()) }} />
              <button type="button" className="dshm-btn primary" disabled={marketLoading} onClick={() => void searchMarket(marketQuery.trim())}>搜索</button>
            </div>
            <div className="dshm-hint" style={{ marginBottom: 10 }}>数据源：Smithery 开源 MCP 商店（registry.smithery.ai）· 支持远程部署的一键安装</div>
            {marketLoading ? <div style={{ color: '#6b7384' }}>搜索中…</div>
              : market.length === 0 ? <div style={{ color: '#6b7384' }}>没有结果，换个关键词试试。</div>
              : <div className="dshm-grid">
                {market.map((row) => (
                  <div key={row.id} className="dshm-card">
                    <div className="dshm-card-name">
                      {row.name}
                      {row.verified && <span className="dshm-badge ok" style={{ marginLeft: 6 }}>verified</span>}
                      <span style={{ color: '#6b7384', fontWeight: 400, marginLeft: 6 }}>▴{row.useCount}</span>
                    </div>
                    <div className="dshm-card-desc">{row.description}</div>
                    <div className="dshm-card-foot">
                      <span className="dshm-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{row.id}</span>
                      <button type="button" className="dshm-btn primary" disabled={busy || row.url === null}
                        title={row.url === null ? '该服务器无远程部署，无法一键安装' : row.url ?? ''}
                        onClick={() => void installFromMarket(row)}>安装</button>
                    </div>
                  </div>
                ))}
              </div>}
          </>
        ) : (
          loading ? <div style={{ color: '#6b7384' }}>加载中…</div> : servers.map((server) => (
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
          ))
        )}
        <Msg msg={msg} />
      </div>
    </div>
  )
}

/**
 * Plugin body: distribute manager surfaces across the official settings
 * panel —
 *   settings.plugins.tab → 插件管理 / 插件市场 (inside 设置 → 插件)
 *   settings.section     → Skills 管理 / MCP 管理 (own pages)
 * @param ctx - client root context (slots injected).
 */
export function apply(ctx: ManagerCtx): void {
  ensureStyles()
  // 设置 → 插件 →「插件管理」tab
  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    id: 'dsh-manager-plugins',
    name: 'settings.plugins.tab',
    order: 50,
    label: '插件管理',
    inject: () => ({}),
  }, PluginsManageTab))
  // 设置 → 插件 →「插件市场」tab
  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    id: 'dsh-manager-market',
    name: 'settings.plugins.tab',
    order: 60,
    label: '插件市场',
    inject: () => ({}),
  }, MarketStoreTab))
  // 设置 →「Skills 管理」独立页
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    id: 'dsh-manager-skills',
    name: 'settings.section',
    order: 51,
    label: 'Skills 管理',
    inject: () => ({}),
  }, SkillsPage))
  // 设置 →「MCP 管理」独立页
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    id: 'dsh-manager-mcp',
    name: 'settings.section',
    order: 52,
    label: 'MCP 管理',
    inject: () => ({}),
  }, McpPage))
}
