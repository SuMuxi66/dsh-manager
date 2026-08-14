import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
/** Required services: the slot registry (declaration may come later). */
export const inject = ['slots'];
/** Shared overlay stylesheet, injected once (loader removes plugin-owned tags on unload). */
const STYLE_TAG = 'dsh-manager';
function ensureStyles() {
    if (document.querySelector(`style[data-plugin-css="${STYLE_TAG}"]`) !== null)
        return;
    const tag = document.createElement('style');
    tag.dataset.plugin = 'dsh-manager';
    tag.dataset.pluginCss = STYLE_TAG;
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
`;
    document.head.appendChild(tag);
}
/** Shared fetch helper for the /manager APIs. */
async function managerFetch(path, init) {
    const res = await fetch(path, { headers: { 'content-type': 'application/json' }, ...init });
    return await res.json();
}
/** Sidebar footer entry: opens the manager overlay. */
function ManagerButton({ open }) {
    return (_jsx("button", { type: "button", "aria-label": "\u7BA1\u7406\u63A7\u5236\u53F0", title: "\u7BA1\u7406\u63A7\u5236\u53F0\uFF1A\u63D2\u4EF6 / \u5E02\u573A", onClick: open, style: {
            width: 28, height: 28, borderRadius: 8, border: '1px solid #333947',
            background: '#1a1d25', color: '#9aa2b1', cursor: 'pointer', fontSize: 15,
            lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }, children: "\u2699" }));
}
/** The manager console overlay. */
function ManagerOverlay({ onClose }) {
    const [tab, setTab] = useState('plugins');
    const [plugins, setPlugins] = useState([]);
    const [profile, setProfile] = useState('web');
    const [market, setMarket] = useState([]);
    const [spec, setSpec] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshPlugins = async () => {
        const data = await managerFetch('/manager/api/plugins');
        setProfile(data.profile);
        setPlugins(data.plugins);
    };
    useEffect(() => {
        void (async () => {
            await refreshPlugins();
            setLoading(false);
        })();
    }, []);
    const loadMarket = async () => {
        const data = await managerFetch('/manager/api/market');
        setMarket(data.plugins);
    };
    useEffect(() => { void loadMarket(); }, []);
    const toggle = async (row) => {
        setBusy(true);
        const data = await managerFetch('/manager/api/plugins/toggle', { method: 'POST', body: JSON.stringify({ id: row.id }) });
        setMsg(data.ok ? { ok: true, text: `${row.name} 已${data.action === 'enabled' ? '启用' : '禁用'}（即时生效）` } : { ok: false, text: data.error ?? 'failed' });
        await refreshPlugins();
        setBusy(false);
    };
    const install = async (target) => {
        if (target === '')
            return;
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/install', {
            method: 'POST', body: JSON.stringify({ spec: target }),
        });
        setMsg(data.ok
            ? { ok: true, text: `安装成功：${target}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。` }
            : { ok: false, text: `安装失败：${target}\n${data.output.slice(-800)}` });
        setSpec('');
        setBusy(false);
    };
    const uninstall = async (row) => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/uninstall', {
            method: 'POST', body: JSON.stringify({ name: row.name }),
        });
        setMsg(data.ok
            ? { ok: true, text: `已卸载：${row.name}\n${data.output.slice(-600)}\n重启后生效。` }
            : { ok: false, text: `卸载失败：${row.name}\n${data.output.slice(-600)}` });
        setBusy(false);
    };
    return (_jsx("div", { className: "dshm-root", onClick: onClose, children: _jsxs("div", { className: "dshm-panel", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "dshm-head", children: [_jsxs("h2", { children: ["DSH \u7BA1\u7406\u63A7\u5236\u53F0 ", _jsxs("span", { style: { color: '#6b7384', fontWeight: 400 }, children: ["profile: ", profile] })] }), _jsx("button", { type: "button", className: "dshm-close", onClick: onClose, children: "\u5173\u95ED" })] }), _jsxs("div", { className: "dshm-tabs", children: [_jsx("button", { type: "button", className: `dshm-tab${tab === 'plugins' ? ' active' : ''}`, onClick: () => setTab('plugins'), children: "\u63D2\u4EF6" }), _jsx("button", { type: "button", className: `dshm-tab${tab === 'market' ? ' active' : ''}`, onClick: () => setTab('market'), children: "\u5E02\u573A" })] }), _jsxs("div", { className: "dshm-body", children: [tab === 'plugins' && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 12 }, children: [_jsx("input", { className: "dshm-input", placeholder: "\u5B89\u88C5\u63D2\u4EF6\uFF1Anpm \u5305\u540D \u6216 github:owner/repo", value: spec, onChange: (e) => setSpec(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                                                void install(spec.trim()); } }), _jsx("button", { type: "button", className: "dshm-btn primary", disabled: busy || spec.trim() === '', onClick: () => void install(spec.trim()), children: "\u5B89\u88C5" })] }), loading ? _jsx("div", { style: { color: '#6b7384' }, children: "\u52A0\u8F7D\u4E2D\u2026" }) : plugins.map((row) => (_jsxs("div", { className: "dshm-row", children: [_jsx("span", { className: `dshm-badge ${row.disabled ? 'off' : 'on'}`, children: row.disabled ? '已禁用' : '已启用' }), _jsx("span", { className: "dshm-name", title: row.id, children: row.name }), _jsx("span", { className: "dshm-id", children: row.id }), _jsx("button", { type: "button", className: "dshm-btn", disabled: busy, onClick: () => void toggle(row), children: row.disabled ? '启用' : '禁用' }), _jsx("button", { type: "button", className: "dshm-btn danger", disabled: busy, onClick: () => void uninstall(row), children: "\u5378\u8F7D" })] }, row.id))), _jsx("div", { className: "dshm-hint", children: "\u542F\u505C\u5373\u65F6\u751F\u6548\uFF1B\u5B89\u88C5/\u5378\u8F7D\u9700\u8981\u91CD\u542F web \u6216\u684C\u9762\u7AEF\u540E\u751F\u6548\u3002" })] })), tab === 'market' && (_jsx("div", { className: "dshm-grid", children: market.map((row) => (_jsxs("div", { className: "dshm-card", children: [_jsxs("div", { className: "dshm-card-name", children: [row.name, " ", _jsxs("span", { style: { color: '#6b7384', fontWeight: 400 }, children: ["\u2605", row.stars] })] }), _jsx("div", { className: "dshm-card-desc", children: row.desc }), _jsxs("div", { className: "dshm-card-foot", children: [_jsx("a", { href: `https://github.com/${row.repo}`, target: "_blank", rel: "noreferrer", style: { color: '#5fb3ff', textDecoration: 'none' }, children: row.repo }), _jsx("button", { type: "button", className: "dshm-btn primary", style: { marginLeft: 'auto' }, disabled: busy, onClick: () => void install(`github:${row.repo}`), children: "\u5B89\u88C5" })] })] }, row.repo + row.name))) })), msg !== null && _jsx("div", { className: `dshm-msg ${msg.ok ? 'ok' : 'err'}`, children: msg.text })] })] }) }));
}
/**
 * Plugin body: register the sidebar footer entry once the sidebar declares it.
 * @param ctx - client root context (slots injected).
 */
export function apply(ctx) {
    ensureStyles();
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        // list-kind slots require a stable item id alongside the slot name
        id: 'dsh-manager',
        name: 'sidebar.footer.action',
        inject: () => ({}),
    }, (props) => {
        const [open, setOpen] = useState(false);
        return (_jsxs(_Fragment, { children: [_jsx(ManagerButton, { open: () => setOpen(true) }), open && _jsx(ManagerOverlay, { onClose: () => setOpen(false) })] }));
    }));
}
