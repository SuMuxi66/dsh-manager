window.__ModuleLoader__.load({
	id: "dsh-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		//#endregion
		let react = require("react");
		//#region node_modules/react/cjs/react-jsx-runtime.production.min.js
		/**
		* @license React
		* react-jsx-runtime.production.min.js
		*
		* Copyright (c) Facebook, Inc. and its affiliates.
		*
		* This source code is licensed under the MIT license found in the
		* LICENSE file in the root directory of this source tree.
		*/
		var require_react_jsx_runtime_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
			var f = require("react");
			var k = Symbol.for("react.element");
			var l = Symbol.for("react.fragment");
			var m = Object.prototype.hasOwnProperty;
			var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
			var p = {
				key: !0,
				ref: !0,
				__self: !0,
				__source: !0
			};
			function q(c, a, g) {
				var b, d = {}, e = null, h = null;
				void 0 !== g && (e = "" + g);
				void 0 !== a.key && (e = "" + a.key);
				void 0 !== a.ref && (h = a.ref);
				for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
				if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
				return {
					$$typeof: k,
					type: c,
					key: e,
					ref: h,
					props: d,
					_owner: n.current
				};
			}
			exports.Fragment = l;
			exports.jsx = q;
			exports.jsxs = q;
		}));
		//#endregion
		//#region lib/types/client/index.js
		var import_jsx_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
			module.exports = require_react_jsx_runtime_production_min();
		})))();
		/** Required services: the slot registry (declaration may come later). */
		const inject = ["slots"];
		/** Shared stylesheet, injected once (loader removes plugin-owned tags on unload). */
		const STYLE_TAG = "dsh-manager";
		function ensureStyles() {
			if (document.querySelector(`style[data-plugin-css="${STYLE_TAG}"]`) !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-manager";
			tag.dataset.pluginCss = STYLE_TAG;
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
.dshm-btn.danger{background:#3a1d1d;border-color:#6e2a2a}
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
`;
			document.head.appendChild(tag);
		}
		/** Shared fetch helper for the /manager APIs. Throws on transport failure so
		* callers can surface a message instead of rendering undefined data. A 404
		* with `not found` means the running host process predates this route. */
		async function managerFetch(path, init) {
			const res = await fetch(path, {
				headers: { "content-type": "application/json" },
				...init
			});
			if (!res.ok && res.status !== 200) try {
				const body = await res.json();
				if (res.status === 404 && body.error === "not found") throw new Error("host 端 dsh-manager 版本过旧：请完全重启 web GUI（不是刷新页面）后重试");
				throw new Error(body.error ?? `HTTP ${res.status}`);
			} catch (error) {
				if (error instanceof Error && (error.message.startsWith("HTTP") || error.message.includes("版本过旧"))) throw error;
				throw new Error(`HTTP ${res.status}`);
			}
			return await res.json();
		}
		/** Small status message box. */
		function Msg({ msg }) {
			return msg === null ? null : (0, import_jsx_runtime.jsx)("div", {
				className: `dshm-msg ${msg.ok ? "ok" : "err"}`,
				children: msg.text
			});
		}
		/** Local busy/msg state shared by every page. */
		function useManagerState() {
			const [busy, setBusy] = (0, react.useState)(false);
			const [msg, setMsg] = (0, react.useState)(null);
			return {
				busy,
				setBusy,
				msg,
				setMsg
			};
		}
		/** ==================== 设置 → 插件 →「插件管理」tab ==================== */
		function PluginsManageTab(props) {
			const { busy, setBusy, msg, setMsg } = useManagerState();
			const [plugins, setPlugins] = (0, react.useState)([]);
			const [profile, setProfile] = (0, react.useState)("web");
			const [spec, setSpec] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(true);
			const refresh = async () => {
				try {
					const data = await managerFetch("/manager/api/plugins");
					if (data.ok !== true) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请完全重启 web GUI）" : "plugins API 错误");
					setProfile(data.profile);
					setPlugins(data.plugins);
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
			};
			(0, react.useEffect)(() => {
				refresh().then(() => setLoading(false));
			}, []);
			const toggle = async (row) => {
				setBusy(true);
				try {
					const data = await managerFetch("/manager/api/plugins/toggle", {
						method: "POST",
						body: JSON.stringify({ id: row.id })
					});
					setMsg(data.ok ? {
						ok: true,
						text: `${row.name} 已${data.action === "enabled" ? "启用" : "禁用"}（即时生效）`
					} : {
						ok: false,
						text: data.error ?? "failed"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				await refresh();
				setBusy(false);
			};
			const install = async (target) => {
				if (target === "") return;
				setBusy(true);
				setMsg(null);
				try {
					const data = await managerFetch("/manager/api/install", {
						method: "POST",
						body: JSON.stringify({ spec: target })
					});
					setMsg(data.ok ? {
						ok: true,
						text: `安装成功：${target}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。`
					} : {
						ok: false,
						text: `安装失败：${target}\n${data.output.slice(-800)}`
					});
					setSpec("");
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				setBusy(false);
			};
			const uninstall = async (row) => {
				setBusy(true);
				setMsg(null);
				try {
					const data = await managerFetch("/manager/api/uninstall", {
						method: "POST",
						body: JSON.stringify({ name: row.name })
					});
					setMsg(data.ok ? {
						ok: true,
						text: `已卸载：${row.name}\n${data.output.slice(-600)}\n重启后生效。`
					} : {
						ok: false,
						text: `卸载失败：${row.name}\n${data.output.slice(-600)}`
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsxs)("div", {
				className: "dshm-body",
				children: [
					(0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 8,
							marginBottom: 12
						},
						children: [(0, import_jsx_runtime.jsx)("input", {
							className: "dshm-input",
							placeholder: "安装插件：npm 包名 或 github:owner/repo",
							value: spec,
							onChange: (e) => setSpec(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") install(spec.trim());
							}
						}), (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshm-btn primary",
							disabled: busy || spec.trim() === "",
							onClick: () => void install(spec.trim()),
							children: "安装"
						})]
					}),
					loading ? (0, import_jsx_runtime.jsx)("div", {
						style: { color: "#6b7384" },
						children: "加载中…"
					}) : plugins.map((row) => (0, import_jsx_runtime.jsxs)("div", {
						className: "dshm-row",
						children: [
							(0, import_jsx_runtime.jsx)("span", {
								className: `dshm-badge ${row.disabled ? "off" : "on"}`,
								children: row.disabled ? "已禁用" : "已启用"
							}),
							(0, import_jsx_runtime.jsx)("span", {
								className: "dshm-name",
								title: row.id,
								children: row.name
							}),
							(0, import_jsx_runtime.jsx)("span", {
								className: "dshm-id",
								children: row.id
							}),
							(0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshm-btn",
								disabled: busy,
								onClick: () => void toggle(row),
								children: row.disabled ? "启用" : "禁用"
							}),
							(0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshm-btn danger",
								disabled: busy,
								onClick: () => void uninstall(row),
								children: "卸载"
							})
						]
					}, row.id)),
					(0, import_jsx_runtime.jsxs)("div", {
						className: "dshm-hint",
						children: [
							"profile: ",
							profile,
							" · 启停即时生效；安装/卸载需要完全重启 web 或桌面端后生效。"
						]
					}),
					(0, import_jsx_runtime.jsx)(Msg, { msg })
				]
			});
		}
		/** ==================== 设置 → 插件 →「插件市场」tab ==================== */
		function MarketStoreTab(props) {
			const { busy, setBusy, msg, setMsg } = useManagerState();
			const [market, setMarket] = (0, react.useState)([]);
			const load = async () => {
				try {
					const data = await managerFetch("/manager/api/market");
					if (data.ok !== true) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请完全重启 web GUI）" : "market API 错误");
					setMarket(data.plugins);
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
			};
			(0, react.useEffect)(() => {
				load();
			}, []);
			const install = async (repo) => {
				setBusy(true);
				setMsg(null);
				try {
					const data = await managerFetch("/manager/api/install", {
						method: "POST",
						body: JSON.stringify({ spec: `github:${repo}` })
					});
					setMsg(data.ok ? {
						ok: true,
						text: `安装成功：${repo}\n${data.output.slice(-800)}\n重启 web/桌面端后生效。`
					} : {
						ok: false,
						text: `安装失败：${repo}\n${data.output.slice(-800)}`
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsxs)("div", {
				className: "dshm-body",
				children: [(0, import_jsx_runtime.jsx)("div", {
					className: "dshm-grid",
					children: market.map((row) => (0, import_jsx_runtime.jsxs)("div", {
						className: "dshm-card",
						children: [
							(0, import_jsx_runtime.jsxs)("div", {
								className: "dshm-card-name",
								children: [
									row.name,
									" ",
									(0, import_jsx_runtime.jsxs)("span", {
										style: {
											color: "#6b7384",
											fontWeight: 400
										},
										children: ["★", row.stars]
									})
								]
							}),
							(0, import_jsx_runtime.jsx)("div", {
								className: "dshm-card-desc",
								children: row.desc
							}),
							(0, import_jsx_runtime.jsxs)("div", {
								className: "dshm-card-foot",
								children: [(0, import_jsx_runtime.jsx)("a", {
									href: `https://github.com/${row.repo}`,
									target: "_blank",
									rel: "noreferrer",
									style: {
										color: "#5fb3ff",
										textDecoration: "none"
									},
									children: row.repo
								}), (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn primary",
									style: { marginLeft: "auto" },
									disabled: busy,
									onClick: () => void install(row.repo),
									children: "安装"
								})]
							})
						]
					}, row.repo + row.name))
				}), (0, import_jsx_runtime.jsx)(Msg, { msg })]
			});
		}
		/** ==================== 设置 → Skills 管理 ==================== */
		function SkillsPage(props) {
			const { busy, setBusy, msg, setMsg } = useManagerState();
			const [skills, setSkills] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [detail, setDetail] = (0, react.useState)(null);
			const [installOpen, setInstallOpen] = (0, react.useState)(false);
			const [newName, setNewName] = (0, react.useState)("");
			const [newContent, setNewContent] = (0, react.useState)("");
			const [importResult, setImportResult] = (0, react.useState)(null);
			const [importing, setImporting] = (0, react.useState)(false);
			const fileRef = { current: null };
			const refresh = async () => {
				try {
					const data = await managerFetch("/manager/api/skills");
					if (data.ok !== true) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请完全重启 web GUI）" : "skills API 错误");
					setSkills(data.skills);
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
			};
			(0, react.useEffect)(() => {
				refresh().then(() => setLoading(false));
			}, []);
			const showDetail = async (skill) => {
				if (skill.path === void 0) {
					setDetail({
						name: skill.name,
						content: "（无文件路径，无法查看详情）"
					});
					return;
				}
				const data = await managerFetch(`/manager/api/skills/detail?path=${encodeURIComponent(skill.path)}`);
				setDetail(data.ok ? {
					name: skill.name,
					content: data.content
				} : {
					name: skill.name,
					content: data.error ?? "读取失败"
				});
			};
			const install = async () => {
				setBusy(true);
				setMsg(null);
				try {
					const data = await managerFetch("/manager/api/skills/install", {
						method: "POST",
						body: JSON.stringify({
							name: newName.trim(),
							content: newContent
						})
					});
					setMsg(data.ok ? {
						ok: true,
						text: `技能 ${newName.trim()} 已安装到用户 skills 目录。`
					} : {
						ok: false,
						text: data.error ?? "failed"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				setInstallOpen(false);
				setNewName("");
				setNewContent("");
				await refresh();
				setBusy(false);
			};
			const importFile = async (file) => {
				const content = await file.text();
				setBusy(true);
				setMsg(null);
				try {
					const data = await managerFetch("/manager/api/skills/import", {
						method: "POST",
						body: JSON.stringify({
							filename: file.name,
							content
						})
					});
					setMsg(data.ok ? {
						ok: true,
						text: `已导入技能 ${data.name ?? file.name}（名称取自 frontmatter，否则取自文件名）。`
					} : {
						ok: false,
						text: data.error ?? "导入失败"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				await refresh();
				setBusy(false);
			};
			const onFilePicked = (e) => {
				const file = e.target.files?.[0];
				if (file !== void 0) importFile(file);
				e.target.value = "";
			};
			const importAll = async () => {
				setImporting(true);
				setMsg(null);
				setImportResult(null);
				try {
					const data = await managerFetch("/manager/api/skills/import-all", { method: "POST" });
					if (data.ok) {
						setImportResult(data);
						const total = data.imported.length + data.skipped.length + data.errors.length;
						setMsg({
							ok: true,
							text: `全局扫描完成：共扫描 ${total} 个技能，导入 ${data.imported.length} 个，跳过 ${data.skipped.length} 个重复，${data.errors.length} 个错误。`
						});
					} else setMsg({
						ok: false,
						text: "全局扫描导入失败"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				await refresh();
				setImporting(false);
			};
			const uninstall = async (skill) => {
				setBusy(true);
				setMsg(null);
				try {
					const data = await managerFetch("/manager/api/skills/uninstall", {
						method: "POST",
						body: JSON.stringify({ name: skill.name })
					});
					setMsg(data.ok ? {
						ok: true,
						text: `技能 ${skill.name} 已移除（仅限用户目录中的技能）。`
					} : {
						ok: false,
						text: data.error ?? "failed"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				await refresh();
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsxs)("div", {
				className: "dshm-page",
				children: [(0, import_jsx_runtime.jsx)("div", {
					className: "dshm-head",
					children: (0, import_jsx_runtime.jsx)("h2", { children: "Skills 管理" })
				}), (0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-body",
					children: [
						(0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 8,
								marginBottom: 12
							},
							children: [
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn primary",
									onClick: () => setInstallOpen((v) => !v),
									children: "+ 新建用户技能"
								}),
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn",
									onClick: () => fileRef.current?.click(),
									children: "📄 导入 md 文件"
								}),
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn",
									disabled: importing,
									onClick: () => void importAll(),
									children: "🔍 全局扫描导入"
								}),
								(0, import_jsx_runtime.jsx)("input", {
									ref: (el) => {
										fileRef.current = el;
									},
									type: "file",
									accept: ".md,.markdown",
									style: { display: "none" },
									onChange: onFilePicked
								})
							]
						}),
						importResult !== null && importResult.imported.length > 0 && (0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-msg ok",
							style: { marginBottom: 12 },
							children: [
								(0, import_jsx_runtime.jsx)("strong", { children: "导入的技能：" }),
								importResult.imported.join("、"),
								importResult.skipped.length > 0 && (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									(0, import_jsx_runtime.jsx)("br", {}),
									(0, import_jsx_runtime.jsx)("strong", { children: "跳过的重复：" }),
									importResult.skipped.map((s) => s.name).join("、")
								] }),
								importResult.errors.length > 0 && (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									(0, import_jsx_runtime.jsx)("br", {}),
									(0, import_jsx_runtime.jsx)("strong", { children: "错误：" }),
									importResult.errors.join("、")
								] })
							]
						}),
						installOpen && (0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-form",
							children: [
								(0, import_jsx_runtime.jsx)("div", {
									className: "dshm-form-row",
									children: (0, import_jsx_runtime.jsx)("input", {
										className: "dshm-input",
										placeholder: "技能名称（小写字母/数字/中划线，如 my-helper）",
										value: newName,
										onChange: (e) => setNewName(e.target.value)
									})
								}),
								(0, import_jsx_runtime.jsx)("textarea", {
									className: "dshm-textarea",
									rows: 6,
									placeholder: "SKILL.md 内容，以 YAML frontmatter 开头：\n---\nname: my-helper\ndescription: 一句话描述\n---\n\n# 使用说明\n...",
									value: newContent,
									onChange: (e) => setNewContent(e.target.value)
								}),
								(0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-form-row",
									children: [(0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dshm-btn primary",
										disabled: busy || newName.trim() === "" || newContent === "",
										onClick: () => void install(),
										children: "安装"
									}), (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dshm-btn",
										onClick: () => setInstallOpen(false),
										children: "取消"
									})]
								})
							]
						}),
						detail !== null && (0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-detail",
							children: [(0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 8
								},
								children: [(0, import_jsx_runtime.jsx)("strong", {
									style: { fontSize: 13 },
									children: detail.name
								}), (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn",
									style: { marginLeft: "auto" },
									onClick: () => setDetail(null),
									children: "关闭"
								})]
							}), (0, import_jsx_runtime.jsx)("pre", { children: detail.content })]
						}),
						loading ? (0, import_jsx_runtime.jsx)("div", {
							style: { color: "#6b7384" },
							children: "加载中…"
						}) : skills.map((skill) => (0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-row",
							children: [
								(0, import_jsx_runtime.jsx)("span", {
									className: "dshm-name",
									title: skill.description,
									children: skill.name
								}),
								(0, import_jsx_runtime.jsx)("span", {
									className: "dshm-id",
									style: {
										flex: 1,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap"
									},
									children: skill.description
								}),
								skill.source !== void 0 && (0, import_jsx_runtime.jsx)("span", {
									className: "dshm-badge",
									children: skill.source
								}),
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn",
									onClick: () => void showDetail(skill),
									children: "详情"
								}),
								(skill.source === "user-agents" || skill.source === "user-dsh") && (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn danger",
									disabled: busy,
									onClick: () => void uninstall(skill),
									children: "卸载"
								})
							]
						}, skill.name + (skill.source ?? ""))),
						(0, import_jsx_runtime.jsx)("div", {
							className: "dshm-hint",
							children: "用户技能存于 ~/.dsh/skills（新建/导入/卸载均在此）· 展示范围：~/.dsh/skills、~/.agents/skills、项目级与内置 bundled。"
						}),
						(0, import_jsx_runtime.jsx)(Msg, { msg })
					]
				})]
			});
		}
		/** ==================== 设置 → MCP 管理 ==================== */
		function McpPage(props) {
			const { busy, setBusy, msg, setMsg } = useManagerState();
			const [view, setView] = (0, react.useState)("configured");
			const [servers, setServers] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [editing, setEditing] = (0, react.useState)(null);
			const [market, setMarket] = (0, react.useState)([]);
			const [marketLoading, setMarketLoading] = (0, react.useState)(false);
			const [marketQuery, setMarketQuery] = (0, react.useState)("");
			const refresh = async () => {
				try {
					const data = await managerFetch("/manager/api/mcp");
					if (data.ok !== true) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请完全重启 web GUI）" : "mcp API 错误");
					setServers(data.servers);
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
			};
			(0, react.useEffect)(() => {
				refresh().then(() => setLoading(false));
			}, []);
			const searchMarket = async (query) => {
				setMarketLoading(true);
				setMsg(null);
				try {
					const data = await managerFetch(`/manager/api/mcp/market?q=${encodeURIComponent(query)}`);
					if (data.ok) setMarket(data.servers ?? []);
					else {
						setMarket([]);
						setMsg({
							ok: false,
							text: data.error ?? "商店搜索失败"
						});
					}
				} catch (error) {
					setMarket([]);
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				setMarketLoading(false);
			};
			(0, react.useEffect)(() => {
				searchMarket("");
			}, []);
			const installFromMarket = async (row) => {
				if (row.url === null) {
					setMsg({
						ok: false,
						text: `${row.name} 没有可用的远程连接（无 streamable-http 部署），暂不支持一键安装。`
					});
					return;
				}
				setBusy(true);
				setMsg(null);
				try {
					const data = await managerFetch("/manager/api/mcp/install-market", {
						method: "POST",
						body: JSON.stringify({
							name: row.id,
							url: row.url
						})
					});
					setMsg(data.ok ? {
						ok: true,
						text: data.note ?? "已安装。"
					} : {
						ok: false,
						text: data.error ?? "安装失败"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				await refresh();
				setBusy(false);
			};
			const save = async (server) => {
				setBusy(true);
				setMsg(null);
				const config = {
					serverName: server.serverName,
					transport: server.transport
				};
				if (server.transport === "stdio") {
					if (server.command !== void 0) config.command = server.command;
					if (server.args !== void 0) config.args = server.args;
				} else if (server.url !== void 0) config.url = server.url;
				const env = {};
				for (const row of server.env) {
					if (row.key === "") continue;
					env[row.key] = row.value === null ? null : row.value;
				}
				for (const key of server.removedEnv) env[key] = null;
				if (Object.keys(env).length > 0) config.env = env;
				const headers = {};
				for (const row of server.headers) {
					if (row.key === "") continue;
					headers[row.key] = row.value === null ? null : row.value;
				}
				for (const key of server.removedHeaders) headers[key] = null;
				if (Object.keys(headers).length > 0) config.headers = headers;
				const next = [...servers.filter((s) => s.id !== server.id), {
					...server,
					config
				}];
				try {
					const data = await managerFetch("/manager/api/mcp/save", {
						method: "POST",
						body: JSON.stringify({ servers: next })
					});
					setMsg(data.ok ? {
						ok: true,
						text: data.note ?? "已保存。"
					} : {
						ok: false,
						text: data.error ?? "failed"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				setEditing(null);
				await refresh();
				setBusy(false);
			};
			const remove = async (server) => {
				setBusy(true);
				setMsg(null);
				const next = servers.filter((s) => s.id !== server.id);
				try {
					const data = await managerFetch("/manager/api/mcp/save", {
						method: "POST",
						body: JSON.stringify({ servers: next })
					});
					setMsg(data.ok ? {
						ok: true,
						text: `已删除 MCP 服务器 ${server.serverName}。重启后生效。`
					} : {
						ok: false,
						text: data.error ?? "failed"
					});
				} catch (error) {
					setMsg({
						ok: false,
						text: error instanceof Error ? error.message : String(error)
					});
				}
				await refresh();
				setBusy(false);
			};
			const newServer = () => ({
				id: `mcp-${Date.now().toString(36)}`,
				serverName: "",
				transport: "stdio",
				env: [],
				headers: [],
				removedEnv: [],
				removedHeaders: [],
				running: false
			});
			const editServer = (server) => {
				setEditing({
					...server,
					env: server.env.map((row) => ({
						key: row.key,
						value: "",
						set: row.set
					})),
					headers: server.headers.map((row) => ({
						key: row.key,
						value: "",
						set: row.set
					})),
					removedEnv: [],
					removedHeaders: []
				});
			};
			const updateEnvRow = (server, index, patch) => {
				const env = server.env.map((row, i) => i === index ? {
					...row,
					...patch
				} : row);
				setEditing({
					...server,
					env
				});
			};
			const removeEnvRow = (server, index) => {
				const row = server.env[index];
				const env = server.env.filter((_, i) => i !== index);
				const removed = row !== void 0 && row.set && row.key !== "" ? [...server.removedEnv, row.key] : server.removedEnv;
				setEditing({
					...server,
					env,
					removedEnv: removed
				});
			};
			return (0, import_jsx_runtime.jsxs)("div", {
				className: "dshm-page",
				children: [(0, import_jsx_runtime.jsx)("div", {
					className: "dshm-head",
					children: (0, import_jsx_runtime.jsx)("h2", { children: "MCP 管理" })
				}), (0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-body",
					children: [
						(0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 8,
								marginBottom: 12
							},
							children: [
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: `dshm-btn${view === "configured" ? " primary" : ""}`,
									onClick: () => setView("configured"),
									children: "已配置"
								}),
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: `dshm-btn${view === "market" ? " primary" : ""}`,
									onClick: () => setView("market"),
									children: "开源商店"
								}),
								view === "configured" && (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn",
									onClick: () => setEditing(newServer()),
									children: "+ 新增"
								}), (0, import_jsx_runtime.jsx)("span", {
									className: "dshm-hint",
									style: { margin: "auto 0 auto auto" },
									children: "写入 profile 的 cordis.patch.yml 托管块，重启后生效。"
								})] })
							]
						}),
						editing !== null && (0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-form",
							children: [
								(0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-form-row",
									children: [(0, import_jsx_runtime.jsx)("input", {
										className: "dshm-input",
										placeholder: "配置行 id（如 mcp-chrome）",
										value: editing.id,
										onChange: (e) => setEditing({
											...editing,
											id: e.target.value
										})
									}), (0, import_jsx_runtime.jsx)("input", {
										className: "dshm-input",
										placeholder: "serverName（工具名前缀，如 chrome-devtools）",
										value: editing.serverName,
										onChange: (e) => setEditing({
											...editing,
											serverName: e.target.value
										})
									})]
								}),
								(0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-form-row",
									children: [(0, import_jsx_runtime.jsxs)("select", {
										className: "dshm-select",
										value: editing.transport,
										onChange: (e) => setEditing({
											...editing,
											transport: e.target.value
										}),
										children: [(0, import_jsx_runtime.jsx)("option", {
											value: "stdio",
											children: "stdio（子进程）"
										}), (0, import_jsx_runtime.jsx)("option", {
											value: "streamable-http",
											children: "streamable-http（URL）"
										})]
									}), editing.transport === "stdio" ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("input", {
										className: "dshm-input",
										placeholder: "command（如 npx）",
										value: editing.command ?? "",
										onChange: (e) => setEditing({
											...editing,
											command: e.target.value
										})
									}), (0, import_jsx_runtime.jsx)("input", {
										className: "dshm-input",
										placeholder: "args（逗号分隔，如 -y,chrome-devtools-mcp）",
										value: (editing.args ?? []).join(","),
										onChange: (e) => setEditing({
											...editing,
											args: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
										})
									})] }) : (0, import_jsx_runtime.jsx)("input", {
										className: "dshm-input",
										placeholder: "url（如 http://localhost:3000/mcp）",
										value: editing.url ?? "",
										onChange: (e) => setEditing({
											...editing,
											url: e.target.value
										})
									})]
								}),
								(0, import_jsx_runtime.jsx)("div", {
									className: "dshm-sec-title",
									children: "env（已设置的行留空 = 保留原值；输入新值 = 覆盖；× = 删除）"
								}),
								editing.env.map((row, i) => (0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-kv",
									children: [
										(0, import_jsx_runtime.jsx)("input", {
											className: "dshm-input",
											placeholder: "环境变量名",
											value: row.key,
											onChange: (e) => updateEnvRow(editing, i, { key: e.target.value })
										}),
										(0, import_jsx_runtime.jsx)("input", {
											className: "dshm-input",
											type: row.set ? "password" : "text",
											placeholder: row.set ? "已设置（留空保留）" : "值",
											value: row.value === null ? "" : row.value,
											onChange: (e) => updateEnvRow(editing, i, { value: e.target.value })
										}),
										(0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dshm-btn danger",
											onClick: () => removeEnvRow(editing, i),
											children: "×"
										})
									]
								}, i)),
								(0, import_jsx_runtime.jsx)("div", {
									className: "dshm-sec-title",
									children: "headers"
								}),
								editing.headers.map((row, i) => (0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-kv",
									children: [
										(0, import_jsx_runtime.jsx)("input", {
											className: "dshm-input",
											placeholder: "Header 名",
											value: row.key,
											onChange: (e) => setEditing({
												...editing,
												headers: editing.headers.map((h, j) => j === i ? {
													...h,
													key: e.target.value
												} : h)
											})
										}),
										(0, import_jsx_runtime.jsx)("input", {
											className: "dshm-input",
											type: row.set ? "password" : "text",
											placeholder: row.set ? "已设置（留空保留）" : "值",
											value: row.value === null ? "" : row.value,
											onChange: (e) => setEditing({
												...editing,
												headers: editing.headers.map((h, j) => j === i ? {
													...h,
													value: e.target.value
												} : h)
											})
										}),
										(0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dshm-btn danger",
											onClick: () => {
												const h = editing.headers[i];
												const headers = editing.headers.filter((_, j) => j !== i);
												const removedHeaders = h !== void 0 && h.set && h.key !== "" ? [...editing.removedHeaders, h.key] : editing.removedHeaders;
												setEditing({
													...editing,
													headers,
													removedHeaders
												});
											},
											children: "×"
										})
									]
								}, i)),
								(0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-form-row",
									children: [(0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dshm-btn",
										onClick: () => setEditing({
											...editing,
											env: [...editing.env, {
												key: "",
												value: "",
												set: false
											}]
										}),
										children: "+ env 行"
									}), (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dshm-btn",
										onClick: () => setEditing({
											...editing,
											headers: [...editing.headers, {
												key: "",
												value: "",
												set: false
											}]
										}),
										children: "+ header 行"
									})]
								}),
								(0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-form-row",
									children: [(0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dshm-btn primary",
										disabled: busy || editing.id === "" || editing.serverName === "",
										onClick: () => void save(editing),
										children: "保存"
									}), (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dshm-btn",
										onClick: () => setEditing(null),
										children: "取消"
									})]
								})
							]
						}),
						view === "market" ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							(0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: 8,
									marginBottom: 12
								},
								children: [(0, import_jsx_runtime.jsx)("input", {
									className: "dshm-input",
									placeholder: "搜索 MCP 开源商店（Smithery），如 github / browser / sqlite",
									value: marketQuery,
									onChange: (e) => setMarketQuery(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter") searchMarket(marketQuery.trim());
									}
								}), (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn primary",
									disabled: marketLoading,
									onClick: () => void searchMarket(marketQuery.trim()),
									children: "搜索"
								})]
							}),
							(0, import_jsx_runtime.jsx)("div", {
								className: "dshm-hint",
								style: { marginBottom: 10 },
								children: "数据源：Smithery 开源 MCP 商店（registry.smithery.ai）· 支持远程部署的一键安装"
							}),
							marketLoading ? (0, import_jsx_runtime.jsx)("div", {
								style: { color: "#6b7384" },
								children: "搜索中…"
							}) : market.length === 0 ? (0, import_jsx_runtime.jsx)("div", {
								style: { color: "#6b7384" },
								children: "没有结果，换个关键词试试。"
							}) : (0, import_jsx_runtime.jsx)("div", {
								className: "dshm-grid",
								children: market.map((row) => (0, import_jsx_runtime.jsxs)("div", {
									className: "dshm-card",
									children: [
										(0, import_jsx_runtime.jsxs)("div", {
											className: "dshm-card-name",
											children: [
												row.name,
												row.verified && (0, import_jsx_runtime.jsx)("span", {
													className: "dshm-badge ok",
													style: { marginLeft: 6 },
													children: "verified"
												}),
												(0, import_jsx_runtime.jsxs)("span", {
													style: {
														color: "#6b7384",
														fontWeight: 400,
														marginLeft: 6
													},
													children: ["▴", row.useCount]
												})
											]
										}),
										(0, import_jsx_runtime.jsx)("div", {
											className: "dshm-card-desc",
											children: row.description
										}),
										(0, import_jsx_runtime.jsxs)("div", {
											className: "dshm-card-foot",
											children: [(0, import_jsx_runtime.jsx)("span", {
												className: "dshm-mono",
												style: {
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
													flex: 1
												},
												children: row.id
											}), (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "dshm-btn primary",
												disabled: busy || row.url === null,
												title: row.url === null ? "该服务器无远程部署，无法一键安装" : row.url ?? "",
												onClick: () => void installFromMarket(row),
												children: "安装"
											})]
										})
									]
								}, row.id))
							})
						] }) : loading ? (0, import_jsx_runtime.jsx)("div", {
							style: { color: "#6b7384" },
							children: "加载中…"
						}) : servers.map((server) => (0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-row",
							children: [
								(0, import_jsx_runtime.jsx)("span", {
									className: `dshm-badge ${server.running ? "on" : "off"}`,
									children: server.running ? "运行中" : "未加载"
								}),
								(0, import_jsx_runtime.jsx)("span", {
									className: "dshm-name",
									children: server.serverName
								}),
								(0, import_jsx_runtime.jsx)("span", {
									className: "dshm-id",
									children: server.transport === "stdio" ? `${server.command ?? ""} ${(server.args ?? []).join(" ")}` : server.url ?? ""
								}),
								(server.env.length > 0 || server.headers.length > 0) && (0, import_jsx_runtime.jsxs)("span", {
									className: "dshm-badge",
									children: [
										"env:",
										server.env.length,
										" hdr:",
										server.headers.length
									]
								}),
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn",
									onClick: () => editServer(server),
									children: "编辑"
								}),
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn danger",
									disabled: busy,
									onClick: () => void remove(server),
									children: "删除"
								})
							]
						}, server.id)),
						(0, import_jsx_runtime.jsx)(Msg, { msg })
					]
				})]
			});
		}
		/**
		* Plugin body: distribute manager surfaces across the official settings
		* panel —
		*   settings.plugins.tab → 插件管理 / 插件市场 (inside 设置 → 插件)
		*   settings.section     → Skills 管理 / MCP 管理 (own pages)
		* @param ctx - client root context (slots injected).
		*/
		function apply(ctx) {
			ensureStyles();
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				id: "dsh-manager-plugins",
				name: "settings.plugins.tab",
				order: 50,
				label: "插件管理",
				inject: () => ({})
			}, PluginsManageTab));
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				id: "dsh-manager-market",
				name: "settings.plugins.tab",
				order: 60,
				label: "插件市场",
				inject: () => ({})
			}, MarketStoreTab));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				id: "dsh-manager-skills",
				name: "settings.section",
				order: 51,
				label: "Skills 管理",
				inject: () => ({})
			}, SkillsPage));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				id: "dsh-manager-mcp",
				name: "settings.section",
				order: 52,
				label: "MCP 管理",
				inject: () => ({})
			}, McpPage));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map