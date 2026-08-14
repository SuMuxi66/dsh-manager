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
    return (_jsx("button", { type: "button", "aria-label": "\u7BA1\u7406\u63A7\u5236\u53F0", title: "\u7BA1\u7406\u63A7\u5236\u53F0\uFF1A\u63D2\u4EF6 / \u5E02\u573A / Skills / MCP / Keys / \u6A21\u578B / \u76AE\u80A4", onClick: open, style: {
            width: 28, height: 28, borderRadius: 8, border: '1px solid #333947',
            background: '#1a1d25', color: '#9aa2b1', cursor: 'pointer', fontSize: 15,
            lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }, children: "\u2699" }));
}
/** Small status message box. */
function Msg({ msg }) {
    return msg === null ? null : _jsx("div", { className: `dshm-msg ${msg.ok ? 'ok' : 'err'}`, children: msg.text });
}
/** ==================== M1: plugins tab ==================== */
function PluginsTab({ busy, setBusy, msg, setMsg }) {
    const [plugins, setPlugins] = useState([]);
    const [profile, setProfile] = useState('web');
    const [spec, setSpec] = useState('');
    const [loading, setLoading] = useState(true);
    const refresh = async () => {
        const data = await managerFetch('/manager/api/plugins');
        setProfile(data.profile);
        setPlugins(data.plugins);
    };
    useEffect(() => { void refresh().then(() => setLoading(false)); }, []);
    const toggle = async (row) => {
        setBusy(true);
        const data = await managerFetch('/manager/api/plugins/toggle', { method: 'POST', body: JSON.stringify({ id: row.id }) });
        setMsg(data.ok ? { ok: true, text: `${row.name} 已${data.action === 'enabled' ? '启用' : '禁用'}（即时生效）` } : { ok: false, text: data.error ?? 'failed' });
        await refresh();
        setBusy(false);
    };
    const install = async (target) => {
        if (target === '')
            return;
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/install', {
            method: 'POST', body: JSON.stringify({ spec: target })
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
            method: 'POST', body: JSON.stringify({ name: row.name })
        });
        setMsg(data.ok
            ? { ok: true, text: `已卸载：${row.name}\n${data.output.slice(-600)}\n重启后生效。` }
            : { ok: false, text: `卸载失败：${row.name}\n${data.output.slice(-600)}` });
        setBusy(false);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 12 }, children: [_jsx("input", { className: "dshm-input", placeholder: "\u5B89\u88C5\u63D2\u4EF6\uFF1Anpm \u5305\u540D \u6216 github:owner/repo", value: spec, onChange: (e) => setSpec(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                            void install(spec.trim()); } }), _jsx("button", { type: "button", className: "dshm-btn primary", disabled: busy || spec.trim() === '', onClick: () => void install(spec.trim()), children: "\u5B89\u88C5" })] }), loading ? _jsx("div", { style: { color: '#6b7384' }, children: "\u52A0\u8F7D\u4E2D\u2026" }) : plugins.map((row) => (_jsxs("div", { className: "dshm-row", children: [_jsx("span", { className: `dshm-badge ${row.disabled ? 'off' : 'on'}`, children: row.disabled ? '已禁用' : '已启用' }), _jsx("span", { className: "dshm-name", title: row.id, children: row.name }), _jsx("span", { className: "dshm-id", children: row.id }), _jsx("button", { type: "button", className: "dshm-btn", disabled: busy, onClick: () => void toggle(row), children: row.disabled ? '启用' : '禁用' }), _jsx("button", { type: "button", className: "dshm-btn danger", disabled: busy, onClick: () => void uninstall(row), children: "\u5378\u8F7D" })] }, row.id))), _jsxs("div", { className: "dshm-hint", children: ["profile: ", profile, " \u00B7 \u542F\u505C\u5373\u65F6\u751F\u6548\uFF1B\u5B89\u88C5/\u5378\u8F7D\u9700\u8981\u91CD\u542F web \u6216\u684C\u9762\u7AEF\u540E\u751F\u6548\u3002"] })] }));
}
/** ==================== M1: market tab ==================== */
function MarketTab({ busy, setBusy, msg, setMsg }) {
    const [market, setMarket] = useState([]);
    const load = async () => {
        const data = await managerFetch('/manager/api/market');
        setMarket(data.plugins);
    };
    useEffect(() => { void load(); }, []);
    const install = async (repo) => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/install', {
            method: 'POST', body: JSON.stringify({ spec: `github:${repo}` })
        });
        setMsg(data.ok
            ? { ok: true, text: `安装成功：${repo}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。` }
            : { ok: false, text: `安装失败：${repo}\n${data.output.slice(-800)}` });
        setBusy(false);
    };
    return (_jsx("div", { className: "dshm-grid", children: market.map((row) => (_jsxs("div", { className: "dshm-card", children: [_jsxs("div", { className: "dshm-card-name", children: [row.name, " ", _jsxs("span", { style: { color: '#6b7384', fontWeight: 400 }, children: ["\u2605", row.stars] })] }), _jsx("div", { className: "dshm-card-desc", children: row.desc }), _jsxs("div", { className: "dshm-card-foot", children: [_jsx("a", { href: `https://github.com/${row.repo}`, target: "_blank", rel: "noreferrer", style: { color: '#5fb3ff', textDecoration: 'none' }, children: row.repo }), _jsx("button", { type: "button", className: "dshm-btn primary", style: { marginLeft: 'auto' }, disabled: busy, onClick: () => void install(row.repo), children: "\u5B89\u88C5" })] })] }, row.repo + row.name))) }));
}
/** ==================== M2: skills tab ==================== */
function SkillsTab({ busy, setBusy, msg, setMsg }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);
    const [installOpen, setInstallOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');
    const refresh = async () => {
        const data = await managerFetch('/manager/api/skills');
        setSkills(data.skills);
    };
    useEffect(() => { void refresh().then(() => setLoading(false)); }, []);
    const showDetail = async (skill) => {
        if (skill.path === undefined) {
            setDetail({ name: skill.name, content: '（无文件路径，无法查看详情）' });
            return;
        }
        const data = await managerFetch(`/manager/api/skills/detail?path=${encodeURIComponent(skill.path)}`);
        setDetail(data.ok ? { name: skill.name, content: data.content } : { name: skill.name, content: data.error ?? '读取失败' });
    };
    const install = async () => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/skills/install', {
            method: 'POST', body: JSON.stringify({ name: newName.trim(), content: newContent })
        });
        setMsg(data.ok ? { ok: true, text: `技能 ${newName.trim()} 已安装到用户 skills 目录。` } : { ok: false, text: data.error ?? 'failed' });
        setInstallOpen(false);
        setNewName('');
        setNewContent('');
        await refresh();
        setBusy(false);
    };
    const uninstall = async (skill) => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/skills/uninstall', {
            method: 'POST', body: JSON.stringify({ name: skill.name })
        });
        setMsg(data.ok ? { ok: true, text: `技能 ${skill.name} 已移除（仅限用户目录中的技能）。` } : { ok: false, text: data.error ?? 'failed' });
        await refresh();
        setBusy(false);
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 12 }, children: _jsx("button", { type: "button", className: "dshm-btn primary", onClick: () => setInstallOpen((v) => !v), children: "+ \u5B89\u88C5\u7528\u6237\u6280\u80FD" }) }), installOpen && (_jsxs("div", { className: "dshm-form", children: [_jsx("div", { className: "dshm-form-row", children: _jsx("input", { className: "dshm-input", placeholder: "\u6280\u80FD\u540D\u79F0\uFF08\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57/\u4E2D\u5212\u7EBF\uFF0C\u5982 my-helper\uFF09", value: newName, onChange: (e) => setNewName(e.target.value) }) }), _jsx("textarea", { className: "dshm-textarea", rows: 6, placeholder: 'SKILL.md 内容，以 YAML frontmatter 开头：\n---\nname: my-helper\ndescription: 一句话描述\n---\n\n# 使用说明\n...', value: newContent, onChange: (e) => setNewContent(e.target.value) }), _jsxs("div", { className: "dshm-form-row", children: [_jsx("button", { type: "button", className: "dshm-btn primary", disabled: busy || newName.trim() === '' || newContent === '', onClick: () => void install(), children: "\u5B89\u88C5" }), _jsx("button", { type: "button", className: "dshm-btn", onClick: () => setInstallOpen(false), children: "\u53D6\u6D88" })] })] })), detail !== null && (_jsxs("div", { className: "dshm-detail", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("strong", { style: { fontSize: 13 }, children: detail.name }), _jsx("button", { type: "button", className: "dshm-btn", style: { marginLeft: 'auto' }, onClick: () => setDetail(null), children: "\u5173\u95ED" })] }), _jsx("pre", { children: detail.content })] })), loading ? _jsx("div", { style: { color: '#6b7384' }, children: "\u52A0\u8F7D\u4E2D\u2026" }) : skills.map((skill) => (_jsxs("div", { className: "dshm-row", children: [_jsx("span", { className: "dshm-name", title: skill.description, children: skill.name }), _jsx("span", { className: "dshm-id", style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: skill.description }), skill.source !== undefined && _jsx("span", { className: "dshm-badge", children: skill.source }), _jsx("button", { type: "button", className: "dshm-btn", onClick: () => void showDetail(skill), children: "\u8BE6\u60C5" }), skill.source === 'user' && (_jsx("button", { type: "button", className: "dshm-btn danger", disabled: busy, onClick: () => void uninstall(skill), children: "\u5378\u8F7D" }))] }, skill.name + (skill.source ?? '')))), _jsx("div", { className: "dshm-hint", children: "Skills \u76EE\u5F55\uFF1A\u7528\u6237\u7EA7 ~/.agents/skills \u00B7 \u9879\u76EE\u7EA7 .dsh/skills \u4E0E .agents/skills \u00B7 \u5185\u7F6E bundled\u3002" })] }));
}
/** ==================== M2: MCP tab ==================== */
function McpTab({ busy, setBusy, msg, setMsg }) {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const refresh = async () => {
        const data = await managerFetch('/manager/api/mcp');
        setServers(data.servers);
    };
    useEffect(() => { void refresh().then(() => setLoading(false)); }, []);
    const save = async (server) => {
        setBusy(true);
        setMsg(null);
        const config = {
            serverName: server.serverName,
            transport: server.transport,
        };
        if (server.transport === 'stdio') {
            if (server.command !== undefined)
                config.command = server.command;
            if (server.args !== undefined)
                config.args = server.args;
        }
        else {
            if (server.url !== undefined)
                config.url = server.url;
        }
        // env/headers: '' keeps the previous value, null removes the key,
        // a non-empty value overwrites it (host side merges with the old config).
        const env = {};
        for (const row of server.env) {
            if (row.key === '')
                continue;
            env[row.key] = row.value === null ? null : row.value;
        }
        for (const key of server.removedEnv)
            env[key] = null;
        if (Object.keys(env).length > 0)
            config.env = env;
        const headers = {};
        for (const row of server.headers) {
            if (row.key === '')
                continue;
            headers[row.key] = row.value === null ? null : row.value;
        }
        for (const key of server.removedHeaders)
            headers[key] = null;
        if (Object.keys(headers).length > 0)
            config.headers = headers;
        const next = [...servers.filter((s) => s.id !== server.id), { ...server, config }];
        const data = await managerFetch('/manager/api/mcp/save', {
            method: 'POST', body: JSON.stringify({ servers: next })
        });
        setMsg(data.ok ? { ok: true, text: data.note ?? '已保存。' } : { ok: false, text: data.error ?? 'failed' });
        setEditing(null);
        await refresh();
        setBusy(false);
    };
    const remove = async (server) => {
        setBusy(true);
        setMsg(null);
        const next = servers.filter((s) => s.id !== server.id);
        const data = await managerFetch('/manager/api/mcp/save', {
            method: 'POST', body: JSON.stringify({ servers: next })
        });
        setMsg(data.ok ? { ok: true, text: `已删除 MCP 服务器 ${server.serverName}。重启后生效。` } : { ok: false, text: data.error ?? 'failed' });
        await refresh();
        setBusy(false);
    };
    const newServer = () => ({
        id: `mcp-${Date.now().toString(36)}`, serverName: '', transport: 'stdio', env: [], headers: [], removedEnv: [], removedHeaders: [], running: false,
    });
    const editServer = (server) => {
        setEditing({
            ...server,
            env: server.env.map((row) => ({ key: row.key, value: '', set: row.set })),
            headers: server.headers.map((row) => ({ key: row.key, value: '', set: row.set })),
            removedEnv: [],
            removedHeaders: [],
        });
    };
    const updateEnvRow = (server, index, patch) => {
        const env = server.env.map((row, i) => (i === index ? { ...row, ...patch } : row));
        setEditing({ ...server, env });
    };
    const removeEnvRow = (server, index) => {
        const row = server.env[index];
        const env = server.env.filter((_, i) => i !== index);
        const removed = row !== undefined && row.set && row.key !== '' ? [...server.removedEnv, row.key] : server.removedEnv;
        setEditing({ ...server, env, removedEnv: removed });
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 12 }, children: [_jsx("button", { type: "button", className: "dshm-btn primary", onClick: () => setEditing(newServer()), children: "+ \u65B0\u589E MCP \u670D\u52A1\u5668" }), _jsx("span", { className: "dshm-hint", style: { margin: 'auto 0 auto auto' }, children: "\u5199\u5165 profile \u7684 cordis.patch.yml \u6258\u7BA1\u5757\uFF0C\u91CD\u542F\u540E\u751F\u6548\u3002" })] }), editing !== null && (_jsxs("div", { className: "dshm-form", children: [_jsxs("div", { className: "dshm-form-row", children: [_jsx("input", { className: "dshm-input", placeholder: "\u914D\u7F6E\u884C id\uFF08\u5982 mcp-chrome\uFF09", value: editing.id, onChange: (e) => setEditing({ ...editing, id: e.target.value }) }), _jsx("input", { className: "dshm-input", placeholder: "serverName\uFF08\u5DE5\u5177\u540D\u524D\u7F00\uFF0C\u5982 chrome-devtools\uFF09", value: editing.serverName, onChange: (e) => setEditing({ ...editing, serverName: e.target.value }) })] }), _jsxs("div", { className: "dshm-form-row", children: [_jsxs("select", { className: "dshm-select", value: editing.transport, onChange: (e) => setEditing({ ...editing, transport: e.target.value }), children: [_jsx("option", { value: "stdio", children: "stdio\uFF08\u5B50\u8FDB\u7A0B\uFF09" }), _jsx("option", { value: "streamable-http", children: "streamable-http\uFF08URL\uFF09" })] }), editing.transport === 'stdio' ? (_jsxs(_Fragment, { children: [_jsx("input", { className: "dshm-input", placeholder: "command\uFF08\u5982 npx\uFF09", value: editing.command ?? '', onChange: (e) => setEditing({ ...editing, command: e.target.value }) }), _jsx("input", { className: "dshm-input", placeholder: "args\uFF08\u9017\u53F7\u5206\u9694\uFF0C\u5982 -y,chrome-devtools-mcp\uFF09", value: (editing.args ?? []).join(','), onChange: (e) => setEditing({ ...editing, args: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }) })] })) : (_jsx("input", { className: "dshm-input", placeholder: "url\uFF08\u5982 http://localhost:3000/mcp\uFF09", value: editing.url ?? '', onChange: (e) => setEditing({ ...editing, url: e.target.value }) }))] }), _jsx("div", { className: "dshm-sec-title", children: "env\uFF08\u5DF2\u8BBE\u7F6E\u7684\u884C\u7559\u7A7A = \u4FDD\u7559\u539F\u503C\uFF1B\u8F93\u5165\u65B0\u503C = \u8986\u76D6\uFF1B\u00D7 = \u5220\u9664\uFF09" }), editing.env.map((row, i) => (_jsxs("div", { className: "dshm-kv", children: [_jsx("input", { className: "dshm-input", placeholder: "\u73AF\u5883\u53D8\u91CF\u540D", value: row.key, onChange: (e) => updateEnvRow(editing, i, { key: e.target.value }) }), _jsx("input", { className: "dshm-input", type: row.set ? 'password' : 'text', placeholder: row.set ? '已设置（留空保留）' : '值', value: row.value === null ? '' : row.value, onChange: (e) => updateEnvRow(editing, i, { value: e.target.value }) }), _jsx("button", { type: "button", className: "dshm-btn danger", onClick: () => removeEnvRow(editing, i), children: "\u00D7" })] }, i))), _jsx("div", { className: "dshm-sec-title", children: "headers" }), editing.headers.map((row, i) => (_jsxs("div", { className: "dshm-kv", children: [_jsx("input", { className: "dshm-input", placeholder: "Header \u540D", value: row.key, onChange: (e) => setEditing({ ...editing, headers: editing.headers.map((h, j) => (j === i ? { ...h, key: e.target.value } : h)) }) }), _jsx("input", { className: "dshm-input", type: row.set ? 'password' : 'text', placeholder: row.set ? '已设置（留空保留）' : '值', value: row.value === null ? '' : row.value, onChange: (e) => setEditing({ ...editing, headers: editing.headers.map((h, j) => (j === i ? { ...h, value: e.target.value } : h)) }) }), _jsx("button", { type: "button", className: "dshm-btn danger", onClick: () => {
                                    const h = editing.headers[i];
                                    const headers = editing.headers.filter((_, j) => j !== i);
                                    const removedHeaders = h !== undefined && h.set && h.key !== '' ? [...editing.removedHeaders, h.key] : editing.removedHeaders;
                                    setEditing({ ...editing, headers, removedHeaders });
                                }, children: "\u00D7" })] }, i))), _jsxs("div", { className: "dshm-form-row", children: [_jsx("button", { type: "button", className: "dshm-btn", onClick: () => setEditing({ ...editing, env: [...editing.env, { key: '', value: '', set: false }] }), children: "+ env \u884C" }), _jsx("button", { type: "button", className: "dshm-btn", onClick: () => setEditing({ ...editing, headers: [...editing.headers, { key: '', value: '', set: false }] }), children: "+ header \u884C" })] }), _jsxs("div", { className: "dshm-form-row", children: [_jsx("button", { type: "button", className: "dshm-btn primary", disabled: busy || editing.id === '' || editing.serverName === '', onClick: () => void save(editing), children: "\u4FDD\u5B58" }), _jsx("button", { type: "button", className: "dshm-btn", onClick: () => setEditing(null), children: "\u53D6\u6D88" })] })] })), loading ? _jsx("div", { style: { color: '#6b7384' }, children: "\u52A0\u8F7D\u4E2D\u2026" }) : servers.map((server) => (_jsxs("div", { className: "dshm-row", children: [_jsx("span", { className: `dshm-badge ${server.running ? 'on' : 'off'}`, children: server.running ? '运行中' : '未加载' }), _jsx("span", { className: "dshm-name", children: server.serverName }), _jsx("span", { className: "dshm-id", children: server.transport === 'stdio' ? `${server.command ?? ''} ${(server.args ?? []).join(' ')}` : server.url ?? '' }), (server.env.length > 0 || server.headers.length > 0) && (_jsxs("span", { className: "dshm-badge", children: ["env:", server.env.length, " hdr:", server.headers.length] })), _jsx("button", { type: "button", className: "dshm-btn", onClick: () => editServer(server), children: "\u7F16\u8F91" }), _jsx("button", { type: "button", className: "dshm-btn danger", disabled: busy, onClick: () => void remove(server), children: "\u5220\u9664" })] }, server.id)))] }));
}
/** ==================== M3: keys tab ==================== */
function KeysTab({ busy, setBusy, msg, setMsg }) {
    const [keys, setKeys] = useState([]);
    const [available, setAvailable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [setRef, setSetRef] = useState('');
    const [setValue, setSetValue] = useState('');
    const refresh = async () => {
        const data = await managerFetch('/manager/api/keys');
        setAvailable(data.available);
        setKeys(data.keys);
    };
    useEffect(() => { void refresh().then(() => setLoading(false)); }, []);
    const setKey = async () => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/keys/set', {
            method: 'POST', body: JSON.stringify({ ref: setRef.trim(), value: setValue })
        });
        setMsg(data.ok ? { ok: true, text: `已保存 ${setRef.trim()}（值已加密存储，不再回显）。` } : { ok: false, text: data.error ?? 'failed' });
        setSetRef('');
        setSetValue('');
        await refresh();
        setBusy(false);
    };
    const unset = async (row) => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/keys/unset', {
            method: 'POST', body: JSON.stringify({ ref: row.ref })
        });
        setMsg(data.ok ? { ok: true, text: `已清除 ${row.ref}` } : { ok: false, text: data.error ?? 'failed' });
        await refresh();
        setBusy(false);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dshm-sec", children: [_jsx("div", { className: "dshm-sec-title", children: "\u8BBE\u7F6E / \u66F4\u65B0 Key\uFF08\u503C\u4E0D\u4F1A\u56DE\u663E\uFF0C\u53EA\u4F1A\u663E\u793A\u5DF2\u914D\u7F6E\u72B6\u6001\uFF09" }), _jsx("div", { className: "dshm-form", children: _jsxs("div", { className: "dshm-form-row", children: [_jsx("input", { className: "dshm-input", placeholder: "\u73AF\u5883\u53D8\u91CF\u540D\uFF08\u5982 DEEPSEEK_V4_FLASH_API_KEY\uFF09", value: setRef, onChange: (e) => setSetRef(e.target.value) }), _jsx("input", { className: "dshm-input", type: "password", placeholder: "Key \u503C", value: setValue, onChange: (e) => setSetValue(e.target.value) }), _jsx("button", { type: "button", className: "dshm-btn primary", disabled: busy || setRef.trim() === '' || setValue === '', onClick: () => void setKey(), children: "\u4FDD\u5B58" })] }) })] }), _jsxs("div", { className: "dshm-sec", children: [_jsx("div", { className: "dshm-sec-title", children: "\u5DF2\u8BC6\u522B\u7684\u51ED\u636E\u5F15\u7528\uFF08\u6765\u81EA\u6A21\u578B\u4F9B\u5E94\u5546\u914D\u7F6E\uFF09" }), !available ? _jsx("div", { className: "dshm-hint", children: "credentials \u670D\u52A1\u4E0D\u53EF\u7528\uFF08\u5F53\u524D profile \u672A\u63D0\u4F9B\uFF09\u3002" })
                        : loading ? _jsx("div", { style: { color: '#6b7384' }, children: "\u52A0\u8F7D\u4E2D\u2026" })
                            : keys.length === 0 ? _jsx("div", { className: "dshm-hint", children: "\u672A\u53D1\u73B0\u6A21\u578B\u4F9B\u5E94\u5546\u7684 apiKeyEnv \u5F15\u7528\u3002" })
                                : keys.map((row) => (_jsxs("div", { className: "dshm-row", children: [_jsx("span", { className: `dshm-badge ${row.configured ? 'ok' : 'off'}`, children: row.configured ? '已配置' : '未配置' }), _jsx("span", { className: "dshm-name dshm-mono", children: row.ref }), row.source !== undefined && _jsxs("span", { className: "dshm-id", children: ["\u6765\u6E90: ", row.source] }), row.writable && (_jsx("button", { type: "button", className: "dshm-btn danger", disabled: busy, onClick: () => void unset(row), children: "\u6E05\u9664" }))] }, row.ref)))] })] }));
}
/** ==================== M3: models tab ==================== */
function ModelsTab({ busy, setBusy, msg, setMsg }) {
    const [defaults, setDefaults] = useState(null);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [defProvider, setDefProvider] = useState('');
    const [defModel, setDefModel] = useState('');
    const [defEffort, setDefEffort] = useState('');
    const [editingNs, setEditingNs] = useState(null);
    const [editBaseUrl, setEditBaseUrl] = useState('');
    const [editApiKeyEnv, setEditApiKeyEnv] = useState('');
    const refresh = async () => {
        const data = await managerFetch('/manager/api/models');
        setDefaults(data.default);
        setProviders(data.providers);
        if (data.default !== null) {
            setDefProvider(String(data.default.provider ?? ''));
            setDefModel(String(data.default.model ?? ''));
            setDefEffort(String(data.default.reasoningEffort ?? ''));
        }
    };
    useEffect(() => { void refresh().then(() => setLoading(false)); }, []);
    const saveDefault = async () => {
        setBusy(true);
        setMsg(null);
        const body = { provider: defProvider.trim(), model: defModel.trim() };
        if (defEffort !== '')
            body.reasoningEffort = defEffort;
        const data = await managerFetch('/manager/api/models/default', {
            method: 'POST', body: JSON.stringify(body)
        });
        setMsg(data.ok ? { ok: true, text: '默认模型已更新。' } : { ok: false, text: data.error ?? 'failed' });
        await refresh();
        setBusy(false);
    };
    const openProvider = (row) => {
        setEditingNs(row.settingsNs);
        const section = row.section ?? {};
        setEditBaseUrl(String(section.baseURL ?? ''));
        setEditApiKeyEnv(String(section.apiKeyEnv ?? ''));
    };
    const saveProvider = async () => {
        if (editingNs === null)
            return;
        setBusy(true);
        setMsg(null);
        const current = providers.find((p) => p.settingsNs === editingNs)?.section ?? {};
        const section = { ...current, baseURL: editBaseUrl.trim(), apiKeyEnv: editApiKeyEnv.trim() };
        const data = await managerFetch('/manager/api/models/provider', {
            method: 'POST', body: JSON.stringify({ settingsNs: editingNs, section })
        });
        setMsg(data.ok ? { ok: true, text: `供应商 ${editingNs} 已更新。` } : { ok: false, text: data.error ?? 'failed' });
        setEditingNs(null);
        await refresh();
        setBusy(false);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dshm-sec", children: [_jsx("div", { className: "dshm-sec-title", children: "\u9ED8\u8BA4\u6A21\u578B\uFF08agent-default-model\uFF09" }), loading ? _jsx("div", { style: { color: '#6b7384' }, children: "\u52A0\u8F7D\u4E2D\u2026" }) : (_jsx("div", { className: "dshm-form", children: _jsxs("div", { className: "dshm-form-row", children: [_jsx("input", { className: "dshm-input", placeholder: "provider\uFF08\u5982 deepseek-official / pi-ai\uFF09", value: defProvider, onChange: (e) => setDefProvider(e.target.value) }), _jsx("input", { className: "dshm-input", placeholder: "model\uFF08\u5982 deepseek-v4-flash\uFF09", value: defModel, onChange: (e) => setDefModel(e.target.value) }), _jsxs("select", { className: "dshm-select", value: defEffort, onChange: (e) => setDefEffort(e.target.value), children: [_jsx("option", { value: "", children: "\u9ED8\u8BA4\u63A8\u7406\u5F3A\u5EA6" }), _jsx("option", { value: "min", children: "min" }), _jsx("option", { value: "medium", children: "medium" }), _jsx("option", { value: "max", children: "max" })] }), _jsx("button", { type: "button", className: "dshm-btn primary", disabled: busy || defProvider === '' || defModel === '', onClick: () => void saveDefault(), children: "\u4FDD\u5B58" })] }) }))] }), _jsxs("div", { className: "dshm-sec", children: [_jsx("div", { className: "dshm-sec-title", children: "\u6A21\u578B\u4F9B\u5E94\u5546\uFF08configurable providers\uFF09" }), providers.map((row) => (_jsxs("div", { className: "dshm-row", style: { alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsxs("div", { children: [_jsx("span", { className: "dshm-name", children: row.displayName }), " ", _jsxs("span", { className: "dshm-id", children: [row.provider, " \u00B7 ", row.settingsNs] })] }), _jsxs("div", { className: "dshm-mono", style: { marginTop: 4 }, children: ["baseURL: ", String(row.section.baseURL ?? '-'), _jsx("br", {}), "apiKeyEnv: ", String(row.section.apiKeyEnv ?? '-'), _jsx("br", {}), "models: ", Array.isArray(row.section.models) ? row.section.models.map((m) => m.id ?? '').join(', ') : '-'] })] }), _jsx("button", { type: "button", className: "dshm-btn", onClick: () => openProvider(row), children: "\u7F16\u8F91" })] }, row.settingsNs)))] }), editingNs !== null && (_jsxs("div", { className: "dshm-form", children: [_jsxs("div", { className: "dshm-sec-title", children: ["\u7F16\u8F91\u4F9B\u5E94\u5546\uFF1A", editingNs] }), _jsx("div", { className: "dshm-form-row", children: _jsx("input", { className: "dshm-input", placeholder: "baseURL\uFF08\u5982 http://host:port/v1\uFF09", value: editBaseUrl, onChange: (e) => setEditBaseUrl(e.target.value) }) }), _jsx("div", { className: "dshm-form-row", children: _jsx("input", { className: "dshm-input", placeholder: "apiKeyEnv\uFF08\u73AF\u5883\u53D8\u91CF\u540D\uFF0C\u5982 MY_API_KEY\uFF09", value: editApiKeyEnv, onChange: (e) => setEditApiKeyEnv(e.target.value) }) }), _jsxs("div", { className: "dshm-form-row", children: [_jsx("button", { type: "button", className: "dshm-btn primary", disabled: busy, onClick: () => void saveProvider(), children: "\u4FDD\u5B58" }), _jsx("button", { type: "button", className: "dshm-btn", onClick: () => setEditingNs(null), children: "\u53D6\u6D88" })] })] })), _jsx("div", { className: "dshm-hint", children: "models \u5217\u8868\u7B49\u5176\u4ED6\u5B57\u6BB5\u4FDD\u7559\u539F\u503C\uFF1B\u4FEE\u6539\u4F9B\u5E94\u5546\u540E\u5230 Keys \u9875\u914D\u7F6E\u5BF9\u5E94 apiKeyEnv\u3002" })] }));
}
/** ==================== M3: theme tab ==================== */
function ThemeTab({ busy, setBusy, msg, setMsg }) {
    const [preference, setPreference] = useState('system');
    const [skins, setSkins] = useState([]);
    const [loading, setLoading] = useState(true);
    const refresh = async () => {
        const data = await managerFetch('/manager/api/theme');
        setPreference(data.preference);
        setSkins(data.skins);
    };
    useEffect(() => { void refresh().then(() => setLoading(false)); }, []);
    const savePreference = async (value) => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/theme', {
            method: 'POST', body: JSON.stringify({ preference: value })
        });
        setMsg(data.ok ? { ok: true, text: `主题已切换为 ${value}（即时生效）。` } : { ok: false, text: data.error ?? 'failed' });
        setPreference(value);
        setBusy(false);
    };
    const toggleSkin = async (row) => {
        setBusy(true);
        setMsg(null);
        const data = await managerFetch('/manager/api/plugins/toggle', { method: 'POST', body: JSON.stringify({ id: row.id }) });
        setMsg(data.ok ? { ok: true, text: `${row.name} 已${data.action === 'enabled' ? '启用' : '禁用'}（即时生效）` } : { ok: false, text: data.error ?? 'failed' });
        await refresh();
        setBusy(false);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dshm-sec", children: [_jsx("div", { className: "dshm-sec-title", children: "\u4E3B\u9898\u504F\u597D\uFF08ui-theme\uFF09" }), loading ? _jsx("div", { style: { color: '#6b7384' }, children: "\u52A0\u8F7D\u4E2D\u2026" }) : (_jsx("div", { className: "dshm-form", children: _jsx("div", { className: "dshm-form-row", children: ['light', 'dark', 'system'].map((value) => (_jsx("button", { type: "button", className: `dshm-btn ${preference === value ? 'primary' : ''}`, disabled: busy, onClick: () => void savePreference(value), children: value === 'light' ? '浅色' : value === 'dark' ? '深色' : '跟随系统' }, value))) }) }))] }), _jsxs("div", { className: "dshm-sec", children: [_jsx("div", { className: "dshm-sec-title", children: "\u5DF2\u5B89\u88C5\u76AE\u80A4\u63D2\u4EF6\uFF08\u542F\u505C\u5373\u65F6\u751F\u6548\uFF09" }), skins.map((row) => (_jsxs("div", { className: "dshm-row", children: [_jsx("span", { className: `dshm-badge ${row.disabled ? 'off' : 'on'}`, children: row.disabled ? '已禁用' : '已启用' }), _jsx("span", { className: "dshm-name", children: row.name }), _jsx("button", { type: "button", className: "dshm-btn", disabled: busy, onClick: () => void toggleSkin(row), children: row.disabled ? '启用' : '禁用' })] }, row.id))), skins.length === 0 && _jsx("div", { className: "dshm-hint", children: "\u672A\u68C0\u6D4B\u5230\u76AE\u80A4\u63D2\u4EF6\uFF08\u88C5 dsh-web-ui / dsh-skin \u7CFB\u5217\u540E\u51FA\u73B0\uFF09\u3002" })] })] }));
}
/** Shared panel body: header + tabs + tab pages. Rendered either inside the
 * floating overlay (sidebar ⚙) or as a page in the official settings panel
 * (settings.section slot). `onClose` is optional — the settings page has the
 * panel's own Close, the overlay shows its own. */
function ManagerPanel({ onClose }) {
    const [tab, setTab] = useState('plugins');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const tabs = [
        { id: 'plugins', label: '插件' },
        { id: 'market', label: '市场' },
        { id: 'skills', label: 'Skills' },
        { id: 'mcp', label: 'MCP' },
        { id: 'keys', label: 'Keys' },
        { id: 'models', label: '模型' },
        { id: 'theme', label: '皮肤' },
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dshm-head", children: [_jsx("h2", { children: "DSH \u7BA1\u7406\u63A7\u5236\u53F0" }), onClose !== undefined && (_jsx("button", { type: "button", className: "dshm-close", onClick: onClose, children: "\u5173\u95ED" }))] }), _jsx("div", { className: "dshm-tabs", children: tabs.map((t) => (_jsx("button", { type: "button", className: `dshm-tab${tab === t.id ? ' active' : ''}`, onClick: () => { setTab(t.id); setMsg(null); }, children: t.label }, t.id))) }), _jsxs("div", { className: "dshm-body", children: [tab === 'plugins' && _jsx(PluginsTab, { busy: busy, setBusy: setBusy, msg: msg, setMsg: setMsg }), tab === 'market' && _jsx(MarketTab, { busy: busy, setBusy: setBusy, msg: msg, setMsg: setMsg }), tab === 'skills' && _jsx(SkillsTab, { busy: busy, setBusy: setBusy, msg: msg, setMsg: setMsg }), tab === 'mcp' && _jsx(McpTab, { busy: busy, setBusy: setBusy, msg: msg, setMsg: setMsg }), tab === 'keys' && _jsx(KeysTab, { busy: busy, setBusy: setBusy, msg: msg, setMsg: setMsg }), tab === 'models' && _jsx(ModelsTab, { busy: busy, setBusy: setBusy, msg: msg, setMsg: setMsg }), tab === 'theme' && _jsx(ThemeTab, { busy: busy, setBusy: setBusy, msg: msg, setMsg: setMsg }), _jsx(Msg, { msg: msg })] })] }));
}
/** Floating overlay entry (sidebar footer ⚙). */
function ManagerOverlay({ onClose }) {
    return (_jsx("div", { className: "dshm-root", onClick: onClose, children: _jsx("div", { className: "dshm-panel", onClick: (e) => e.stopPropagation(), children: _jsx(ManagerPanel, { onClose: onClose }) }) }));
}
/** Official settings-panel page entry (settings.section slot). */
function ManagerSection(props) {
    // The settings panel provides its own page frame, scroll, and Close; we
    // render the panel body inline (the `close` owner prop stays available).
    return (_jsx("div", { className: "dshm-page", children: _jsx(ManagerPanel, {}) }));
}
/**
 * Plugin body: register the sidebar footer entry AND the official settings
 * panel page once their slots declare.
 * @param ctx - client root context (slots injected).
 */
export function apply(ctx) {
    ensureStyles();
    // Sidebar footer shortcut (floating overlay).
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        // list-kind slots require a stable item id alongside the slot name
        id: 'dsh-manager',
        name: 'sidebar.footer.action',
        inject: () => ({}),
    }, (props) => {
        const [open, setOpen] = useState(false);
        return (_jsxs(_Fragment, { children: [_jsx(ManagerButton, { open: () => setOpen(true) }), open && _jsx(ManagerOverlay, { onClose: () => setOpen(false) })] }));
    }));
    // Official settings panel page (sidebar 设置 → left page list).
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        id: 'dsh-manager',
        name: 'settings.section',
        order: 50,
        label: '管理控制台',
        inject: () => ({}),
    }, ManagerSection));
}
