/**
 * dsh-manager browser half: registers the sidebar footer entry and renders
 * the manager console overlay. All data flows over the same-origin /manager
 * JSON APIs served by the host half — no private harness internals.
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
.dshm-panel{width:min(880px,92vw);max-height:84vh;display:flex;flex-direction:column;background:#12141a;border:1px solid #262a33;border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.5);color:#e8eaf0;overflow:hidden}
.dshm-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #262a33;background:#15171e}
.dshm-head h2{margin:0;font-size:15px;font-weight:600;flex:1}
.dshm-close{background:#262a33;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px}
.dshm-close:hover{background:#333947}
.dshm-tabs{display:flex;gap:6px;padding:10px 18px 0;border-bottom:1px solid #262a33}
.dshm-tab{background:transparent;border:1px solid transparent;color:#9aa2b1;border-radius:8px 8px 0 0;padding:8px 16px;cursor:pointer;font-size:13px}
.dshm-tab.active{color:#e8eaf0;background:#1a1d25;border-color:#262a33;border-bottom-color:#1a1d25}
.dshm-body{overflow:auto;padding:16px 18px;flex:1}
.dshm-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #262a33;border-radius:10px;margin-bottom:8px;background:#181b22}
.dshm-row .dshm-name{font-weight:600;font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-row .dshm-id{font-size:11px;color:#6b7384}
.dshm-badge{font-size:10px;padding:2px 8px;border-radius:99px;background:#262a33;color:#9aa2b1}
.dshm-badge.on{background:#123;color:#5fb3ff}
.dshm-badge.off{background:#321;color:#ff9d5f}
.dshm-btn{background:#262a33;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;white-space:nowrap}
.dshm-btn:hover{background:#333947}
.dshm-btn.primary{background:#0d6efd;border-color:#0d6efd}
.dshm-btn.danger{background:#3a1d1d;border-color:#6e2a2a}
.dshm-btn:disabled{opacity:.5;cursor:default}
.dshm-input{background:#101218;border:1px solid #333947;color:#e8eaf0;border-radius:8px;padding:8px 12px;font-size:13px;flex:1;min-width:0}
.dshm-card{border:1px solid #262a33;border-radius:10px;padding:12px;background:#181b22;display:flex;flex-direction:column;gap:8px}
.dshm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.dshm-card .dshm-card-name{font-weight:600;font-size:13px}
.dshm-card .dshm-card-desc{font-size:12px;color:#9aa2b1;line-height:1.45;flex:1}
.dshm-card .dshm-card-foot{display:flex;align-items:center;gap:8px;font-size:11px;color:#6b7384}
.dshm-msg{font-size:12px;padding:8px 12px;border-radius:8px;margin-top:10px;white-space:pre-wrap;word-break:break-all;max-height:120px;overflow:auto}
.dshm-msg.ok{background:#10241a;color:#7ee2a8}
.dshm-msg.err{background:#2a1515;color:#ff9d9d}
.dshm-hint{font-size:11px;color:#6b7384;margin-top:8px}
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

/** Shared fetch helper for the /manager APIs. */
async function managerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'content-type': 'application/json' }, ...init })
  return await res.json() as T
}

/** Sidebar footer entry: opens the manager overlay. */
function ManagerButton({ open }: { open: () => void }): ReactNode {
  return (
    <button
      type="button"
      aria-label="管理控制台"
      title="管理控制台：插件 / 市场"
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

/** The manager console overlay. */
function ManagerOverlay({ onClose }: { onClose: () => void }): ReactNode {
  const [tab, setTab] = useState<'plugins' | 'market'>('plugins')
  const [plugins, setPlugins] = useState<PluginRow[]>([])
  const [profile, setProfile] = useState('web')
  const [market, setMarket] = useState<MarketRow[]>([])
  const [spec, setSpec] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshPlugins = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; profile: string; plugins: PluginRow[] }>('/manager/api/plugins')
    setProfile(data.profile)
    setPlugins(data.plugins)
  }

  useEffect(() => {
    void (async () => {
      await refreshPlugins()
      setLoading(false)
    })()
  }, [])

  const loadMarket = async (): Promise<void> => {
    const data = await managerFetch<{ ok: boolean; plugins: MarketRow[] }>('/manager/api/market')
    setMarket(data.plugins)
  }
  useEffect(() => { void loadMarket() }, [])

  const toggle = async (row: PluginRow): Promise<void> => {
    setBusy(true)
    const data = await managerFetch<{ ok: boolean; action: string; error?: string }>(
      '/manager/api/plugins/toggle',
      { method: 'POST', body: JSON.stringify({ id: row.id }) },
    )
    setMsg(data.ok ? { ok: true, text: `${row.name} 已${data.action === 'enabled' ? '启用' : '禁用'}（即时生效）` } : { ok: false, text: data.error ?? 'failed' })
    await refreshPlugins()
    setBusy(false)
  }

  const install = async (target: string): Promise<void> => {
    if (target === '') return
    setBusy(true)
    setMsg(null)
    const data = await managerFetch<{ ok: boolean; output: string }>('/manager/api/install', {
      method: 'POST', body: JSON.stringify({ spec: target }),
    })
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
      method: 'POST', body: JSON.stringify({ name: row.name }),
    })
    setMsg(data.ok
      ? { ok: true, text: `已卸载：${row.name}\n${data.output.slice(-600)}\n重启后生效。` }
      : { ok: false, text: `卸载失败：${row.name}\n${data.output.slice(-600)}` })
    setBusy(false)
  }

  return (
    <div className="dshm-root" onClick={onClose}>
      <div className="dshm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dshm-head">
          <h2>DSH 管理控制台 <span style={{ color: '#6b7384', fontWeight: 400 }}>profile: {profile}</span></h2>
          <button type="button" className="dshm-close" onClick={onClose}>关闭</button>
        </div>
        <div className="dshm-tabs">
          <button type="button" className={`dshm-tab${tab === 'plugins' ? ' active' : ''}`} onClick={() => setTab('plugins')}>插件</button>
          <button type="button" className={`dshm-tab${tab === 'market' ? ' active' : ''}`} onClick={() => setTab('market')}>市场</button>
        </div>
        <div className="dshm-body">
          {tab === 'plugins' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  className="dshm-input"
                  placeholder="安装插件：npm 包名 或 github:owner/repo"
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void install(spec.trim()) }}
                />
                <button type="button" className="dshm-btn primary" disabled={busy || spec.trim() === ''} onClick={() => void install(spec.trim())}>
                  安装
                </button>
              </div>
              {loading ? <div style={{ color: '#6b7384' }}>加载中…</div> : plugins.map((row) => (
                <div key={row.id} className="dshm-row">
                  <span className={`dshm-badge ${row.disabled ? 'off' : 'on'}`}>{row.disabled ? '已禁用' : '已启用'}</span>
                  <span className="dshm-name" title={row.id}>{row.name}</span>
                  <span className="dshm-id">{row.id}</span>
                  <button type="button" className="dshm-btn" disabled={busy} onClick={() => void toggle(row)}>
                    {row.disabled ? '启用' : '禁用'}
                  </button>
                  <button type="button" className="dshm-btn danger" disabled={busy} onClick={() => void uninstall(row)}>卸载</button>
                </div>
              ))}
              <div className="dshm-hint">启停即时生效；安装/卸载需要重启 web 或桌面端后生效。</div>
            </>
          )}
          {tab === 'market' && (
            <div className="dshm-grid">
              {market.map((row) => (
                <div key={row.repo + row.name} className="dshm-card">
                  <div className="dshm-card-name">{row.name} <span style={{ color: '#6b7384', fontWeight: 400 }}>★{row.stars}</span></div>
                  <div className="dshm-card-desc">{row.desc}</div>
                  <div className="dshm-card-foot">
                    <a href={`https://github.com/${row.repo}`} target="_blank" rel="noreferrer" style={{ color: '#5fb3ff', textDecoration: 'none' }}>{row.repo}</a>
                    <button type="button" className="dshm-btn primary" style={{ marginLeft: 'auto' }} disabled={busy} onClick={() => void install(`github:${row.repo}`)}>
                      安装
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {msg !== null && <div className={`dshm-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
        </div>
      </div>
    </div>
  )
}

/**
 * Plugin body: register the sidebar footer entry once the sidebar declares it.
 * @param ctx - client root context (slots injected).
 */
export function apply(ctx: ManagerCtx): void {
  ensureStyles()
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
}
