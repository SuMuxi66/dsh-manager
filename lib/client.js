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
		/** Shared overlay stylesheet, injected once (loader removes plugin-owned tags on unload). */
		const STYLE_TAG = "dsh-manager";
		function ensureStyles() {
			if (document.querySelector(`style[data-plugin-css="${STYLE_TAG}"]`) !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-manager";
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
		/** Shared fetch helper for the /manager APIs. Throws on transport failure so
		* callers can surface a message instead of rendering undefined data. */
		async function managerFetch(path, init) {
			const res = await fetch(path, {
				headers: { "content-type": "application/json" },
				...init
			});
			if (!res.ok && res.status !== 200) try {
				const body = await res.json();
				throw new Error(body.error ?? `HTTP ${res.status}`);
			} catch (error) {
				if (error instanceof Error && error.message.startsWith("HTTP")) throw error;
				throw new Error(`HTTP ${res.status}`);
			}
			return await res.json();
		}
		/** Guards a state-loading call: on failure shows the error instead of crashing. */
		async function loadInto(setter, onError, loader) {
			try {
				const data = await loader();
				if (data !== null && typeof data === "object" && "ok" in data && data.ok !== true) {
					onError(`API 错误：${data.error ?? "unknown error"}`);
					return;
				}
				setter(data);
			} catch (error) {
				onError(error instanceof Error ? error.message : String(error));
			}
		}
		/** Sidebar footer entry: opens the manager overlay. */
		function ManagerButton({ open }) {
			return (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "管理控制台",
				title: "管理控制台：插件 / 市场 / Skills / MCP / Keys / 模型 / 皮肤",
				onClick: open,
				style: {
					width: 28,
					height: 28,
					borderRadius: 8,
					border: "1px solid #333947",
					background: "#1a1d25",
					color: "#9aa2b1",
					cursor: "pointer",
					fontSize: 15,
					lineHeight: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
				},
				children: "⚙"
			});
		}
		/** Small status message box. */
		function Msg({ msg }) {
			return msg === null ? null : (0, import_jsx_runtime.jsx)("div", {
				className: `dshm-msg ${msg.ok ? "ok" : "err"}`,
				children: msg.text
			});
		}
		/** ==================== M1: plugins tab ==================== */
		function PluginsTab({ busy, setBusy, msg, setMsg }) {
			const [plugins, setPlugins] = (0, react.useState)([]);
			const [profile, setProfile] = (0, react.useState)("web");
			const [spec, setSpec] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(true);
			const refresh = async () => {
				await loadInto((data) => {
					setProfile(data.profile);
					setPlugins(data.plugins);
				}, (msg) => setMsg({
					ok: false,
					text: msg
				}), async () => {
					const data = await managerFetch("/manager/api/plugins");
					if (!data.ok) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请重启 web/桌面端）" : "plugins API 错误");
					return data;
				});
			};
			(0, react.useEffect)(() => {
				refresh().then(() => setLoading(false));
			}, []);
			const toggle = async (row) => {
				setBusy(true);
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
				await refresh();
				setBusy(false);
			};
			const install = async (target) => {
				if (target === "") return;
				setBusy(true);
				setMsg(null);
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
				setBusy(false);
			};
			const uninstall = async (row) => {
				setBusy(true);
				setMsg(null);
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
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
						" · 启停即时生效；安装/卸载需要重启 web 或桌面端后生效。"
					]
				})
			] });
		}
		/** ==================== M1: market tab ==================== */
		function MarketTab({ busy, setBusy, msg, setMsg }) {
			const [market, setMarket] = (0, react.useState)([]);
			const load = async () => {
				await loadInto((data) => setMarket(data.plugins), (msg) => setMsg({
					ok: false,
					text: msg
				}), async () => {
					const data = await managerFetch("/manager/api/market");
					if (!data.ok) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请重启 web/桌面端）" : "market API 错误");
					return data;
				});
			};
			(0, react.useEffect)(() => {
				load();
			}, []);
			const install = async (repo) => {
				setBusy(true);
				setMsg(null);
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
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsx)("div", {
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
			});
		}
		/** ==================== M2: skills tab ==================== */
		function SkillsTab({ busy, setBusy, msg, setMsg }) {
			const [skills, setSkills] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [detail, setDetail] = (0, react.useState)(null);
			const [installOpen, setInstallOpen] = (0, react.useState)(false);
			const [newName, setNewName] = (0, react.useState)("");
			const [newContent, setNewContent] = (0, react.useState)("");
			const fileRef = { current: null };
			const refresh = async () => {
				await loadInto((data) => setSkills(data.skills), (msg) => setMsg({
					ok: false,
					text: msg
				}), async () => {
					const data = await managerFetch("/manager/api/skills");
					if (!data.ok) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请重启 web/桌面端）" : "skills API 错误");
					return data;
				});
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
				await refresh();
				setBusy(false);
			};
			const onFilePicked = (e) => {
				const file = e.target.files?.[0];
				if (file !== void 0) importFile(file);
				e.target.value = "";
			};
			const uninstall = async (skill) => {
				setBusy(true);
				setMsg(null);
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
				await refresh();
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
					children: "Skills 目录：用户级 ~/.agents/skills · 项目级 .dsh/skills 与 .agents/skills · 内置 bundled。"
				})
			] });
		}
		/** ==================== M2: MCP tab ==================== */
		function McpTab({ busy, setBusy, msg, setMsg }) {
			const [view, setView] = (0, react.useState)("configured");
			const [servers, setServers] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [editing, setEditing] = (0, react.useState)(null);
			const [market, setMarket] = (0, react.useState)([]);
			const [marketLoading, setMarketLoading] = (0, react.useState)(false);
			const [marketQuery, setMarketQuery] = (0, react.useState)("");
			const refresh = async () => {
				await loadInto((data) => setServers(data.servers), (msg) => setMsg({
					ok: false,
					text: msg
				}), async () => {
					const data = await managerFetch("/manager/api/mcp");
					if (!data.ok) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请重启 web/桌面端）" : "mcp API 错误");
					return data;
				});
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
				setEditing(null);
				await refresh();
				setBusy(false);
			};
			const remove = async (server) => {
				setBusy(true);
				setMsg(null);
				const next = servers.filter((s) => s.id !== server.id);
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
			return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
				] }) : (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: loading ? (0, import_jsx_runtime.jsx)("div", {
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
				}, server.id)) })
			] });
		}
		/** ==================== M3: models tab ==================== */
		function ModelsTab({ busy, setBusy, msg, setMsg }) {
			const [defaults, setDefaults] = (0, react.useState)(null);
			const [providers, setProviders] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [defProvider, setDefProvider] = (0, react.useState)("");
			const [defModel, setDefModel] = (0, react.useState)("");
			const [defEffort, setDefEffort] = (0, react.useState)("");
			const [editingNs, setEditingNs] = (0, react.useState)(null);
			const [editBaseUrl, setEditBaseUrl] = (0, react.useState)("");
			const [editApiKeyEnv, setEditApiKeyEnv] = (0, react.useState)("");
			const refresh = async () => {
				await loadInto((data) => {
					setDefaults(data.default);
					setProviders(data.providers);
					if (data.default !== null) {
						setDefProvider(String(data.default.provider ?? ""));
						setDefModel(String(data.default.model ?? ""));
						setDefEffort(String(data.default.reasoningEffort ?? ""));
					}
				}, (msg) => setMsg({
					ok: false,
					text: msg
				}), async () => {
					const data = await managerFetch("/manager/api/models");
					if (!data.ok) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请重启 web/桌面端）" : "models API 错误");
					return data;
				});
			};
			(0, react.useEffect)(() => {
				refresh().then(() => setLoading(false));
			}, []);
			const saveDefault = async () => {
				setBusy(true);
				setMsg(null);
				const body = {
					provider: defProvider.trim(),
					model: defModel.trim()
				};
				if (defEffort !== "") body.reasoningEffort = defEffort;
				const data = await managerFetch("/manager/api/models/default", {
					method: "POST",
					body: JSON.stringify(body)
				});
				setMsg(data.ok ? {
					ok: true,
					text: "默认模型已更新。"
				} : {
					ok: false,
					text: data.error ?? "failed"
				});
				await refresh();
				setBusy(false);
			};
			const openProvider = (row) => {
				setEditingNs(row.settingsNs);
				const section = row.section ?? {};
				setEditBaseUrl(String(section.baseURL ?? ""));
				setEditApiKeyEnv(String(section.apiKeyEnv ?? ""));
			};
			const saveProvider = async () => {
				if (editingNs === null) return;
				setBusy(true);
				setMsg(null);
				const section = {
					...providers.find((p) => p.settingsNs === editingNs)?.section ?? {},
					baseURL: editBaseUrl.trim(),
					apiKeyEnv: editApiKeyEnv.trim()
				};
				const data = await managerFetch("/manager/api/models/provider", {
					method: "POST",
					body: JSON.stringify({
						settingsNs: editingNs,
						section
					})
				});
				setMsg(data.ok ? {
					ok: true,
					text: `供应商 ${editingNs} 已更新。`
				} : {
					ok: false,
					text: data.error ?? "failed"
				});
				setEditingNs(null);
				await refresh();
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				(0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-sec",
					children: [(0, import_jsx_runtime.jsx)("div", {
						className: "dshm-sec-title",
						children: "默认模型（agent-default-model）"
					}), loading ? (0, import_jsx_runtime.jsx)("div", {
						style: { color: "#6b7384" },
						children: "加载中…"
					}) : (0, import_jsx_runtime.jsx)("div", {
						className: "dshm-form",
						children: (0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-form-row",
							children: [
								(0, import_jsx_runtime.jsx)("input", {
									className: "dshm-input",
									placeholder: "provider（如 deepseek-official / pi-ai）",
									value: defProvider,
									onChange: (e) => setDefProvider(e.target.value)
								}),
								(0, import_jsx_runtime.jsx)("input", {
									className: "dshm-input",
									placeholder: "model（如 deepseek-v4-flash）",
									value: defModel,
									onChange: (e) => setDefModel(e.target.value)
								}),
								(0, import_jsx_runtime.jsxs)("select", {
									className: "dshm-select",
									value: defEffort,
									onChange: (e) => setDefEffort(e.target.value),
									children: [
										(0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "默认推理强度"
										}),
										(0, import_jsx_runtime.jsx)("option", {
											value: "min",
											children: "min"
										}),
										(0, import_jsx_runtime.jsx)("option", {
											value: "medium",
											children: "medium"
										}),
										(0, import_jsx_runtime.jsx)("option", {
											value: "max",
											children: "max"
										})
									]
								}),
								(0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshm-btn primary",
									disabled: busy || defProvider === "" || defModel === "",
									onClick: () => void saveDefault(),
									children: "保存"
								})
							]
						})
					})]
				}),
				(0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-sec",
					children: [(0, import_jsx_runtime.jsx)("div", {
						className: "dshm-sec-title",
						children: "模型供应商（configurable providers）"
					}), providers.map((row) => (0, import_jsx_runtime.jsxs)("div", {
						className: "dshm-row",
						style: { alignItems: "flex-start" },
						children: [(0, import_jsx_runtime.jsxs)("div", {
							style: {
								flex: 1,
								minWidth: 0
							},
							children: [(0, import_jsx_runtime.jsxs)("div", { children: [
								(0, import_jsx_runtime.jsx)("span", {
									className: "dshm-name",
									children: row.displayName
								}),
								" ",
								(0, import_jsx_runtime.jsxs)("span", {
									className: "dshm-id",
									children: [
										row.provider,
										" · ",
										row.settingsNs
									]
								})
							] }), (0, import_jsx_runtime.jsxs)("div", {
								className: "dshm-mono",
								style: { marginTop: 4 },
								children: [
									"baseURL: ",
									String(row.section.baseURL ?? "-"),
									(0, import_jsx_runtime.jsx)("br", {}),
									"apiKeyEnv: ",
									String(row.section.apiKeyEnv ?? "-"),
									(0, import_jsx_runtime.jsx)("br", {}),
									"models: ",
									Array.isArray(row.section.models) ? row.section.models.map((m) => m.id ?? "").join(", ") : "-"
								]
							})]
						}), (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshm-btn",
							onClick: () => openProvider(row),
							children: "编辑"
						})]
					}, row.settingsNs))]
				}),
				editingNs !== null && (0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-form",
					children: [
						(0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-sec-title",
							children: ["编辑供应商：", editingNs]
						}),
						(0, import_jsx_runtime.jsx)("div", {
							className: "dshm-form-row",
							children: (0, import_jsx_runtime.jsx)("input", {
								className: "dshm-input",
								placeholder: "baseURL（如 http://host:port/v1）",
								value: editBaseUrl,
								onChange: (e) => setEditBaseUrl(e.target.value)
							})
						}),
						(0, import_jsx_runtime.jsx)("div", {
							className: "dshm-form-row",
							children: (0, import_jsx_runtime.jsx)("input", {
								className: "dshm-input",
								placeholder: "apiKeyEnv（环境变量名，如 MY_API_KEY）",
								value: editApiKeyEnv,
								onChange: (e) => setEditApiKeyEnv(e.target.value)
							})
						}),
						(0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-form-row",
							children: [(0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshm-btn primary",
								disabled: busy,
								onClick: () => void saveProvider(),
								children: "保存"
							}), (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshm-btn",
								onClick: () => setEditingNs(null),
								children: "取消"
							})]
						})
					]
				}),
				(0, import_jsx_runtime.jsx)("div", {
					className: "dshm-hint",
					children: "models 列表等其他字段保留原值；修改供应商后到 Keys 页配置对应 apiKeyEnv。"
				})
			] });
		}
		/** ==================== M3: theme tab ==================== */
		function ThemeTab({ busy, setBusy, msg, setMsg }) {
			const [preference, setPreference] = (0, react.useState)("system");
			const [skins, setSkins] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const refresh = async () => {
				await loadInto((data) => {
					setPreference(data.preference);
					setSkins(data.skins);
				}, (msg) => setMsg({
					ok: false,
					text: msg
				}), async () => {
					const data = await managerFetch("/manager/api/theme");
					if (!data.ok) throw new Error(data.ok === void 0 ? "host 端未加载 dsh-manager（请重启 web/桌面端）" : "theme API 错误");
					return data;
				});
			};
			(0, react.useEffect)(() => {
				refresh().then(() => setLoading(false));
			}, []);
			const savePreference = async (value) => {
				setBusy(true);
				setMsg(null);
				const data = await managerFetch("/manager/api/theme", {
					method: "POST",
					body: JSON.stringify({ preference: value })
				});
				setMsg(data.ok ? {
					ok: true,
					text: `主题已切换为 ${value}（即时生效）。`
				} : {
					ok: false,
					text: data.error ?? "failed"
				});
				setPreference(value);
				setBusy(false);
			};
			const toggleSkin = async (row) => {
				setBusy(true);
				setMsg(null);
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
				await refresh();
				setBusy(false);
			};
			return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsxs)("div", {
				className: "dshm-sec",
				children: [(0, import_jsx_runtime.jsx)("div", {
					className: "dshm-sec-title",
					children: "主题偏好（ui-theme）"
				}), loading ? (0, import_jsx_runtime.jsx)("div", {
					style: { color: "#6b7384" },
					children: "加载中…"
				}) : (0, import_jsx_runtime.jsx)("div", {
					className: "dshm-form",
					children: (0, import_jsx_runtime.jsx)("div", {
						className: "dshm-form-row",
						children: [
							"light",
							"dark",
							"system"
						].map((value) => (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `dshm-btn ${preference === value ? "primary" : ""}`,
							disabled: busy,
							onClick: () => void savePreference(value),
							children: value === "light" ? "浅色" : value === "dark" ? "深色" : "跟随系统"
						}, value))
					})
				})]
			}), (0, import_jsx_runtime.jsxs)("div", {
				className: "dshm-sec",
				children: [
					(0, import_jsx_runtime.jsx)("div", {
						className: "dshm-sec-title",
						children: "已安装皮肤插件（启停即时生效）"
					}),
					skins.map((row) => (0, import_jsx_runtime.jsxs)("div", {
						className: "dshm-row",
						children: [
							(0, import_jsx_runtime.jsx)("span", {
								className: `dshm-badge ${row.disabled ? "off" : "on"}`,
								children: row.disabled ? "已禁用" : "已启用"
							}),
							(0, import_jsx_runtime.jsx)("span", {
								className: "dshm-name",
								children: row.name
							}),
							(0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshm-btn",
								disabled: busy,
								onClick: () => void toggleSkin(row),
								children: row.disabled ? "启用" : "禁用"
							})
						]
					}, row.id)),
					skins.length === 0 && (0, import_jsx_runtime.jsx)("div", {
						className: "dshm-hint",
						children: "未检测到皮肤插件（装 dsh-web-ui / dsh-skin 系列后出现）。"
					})
				]
			})] });
		}
		/** Shared panel body: header + tabs + tab pages. Rendered either inside the
		* floating overlay (sidebar ⚙) or as a page in the official settings panel
		* (settings.section slot). `onClose` is optional — the settings page has the
		* panel's own Close, the overlay shows its own. */
		function ManagerPanel({ onClose }) {
			const [tab, setTab] = (0, react.useState)("plugins");
			const [busy, setBusy] = (0, react.useState)(false);
			const [msg, setMsg] = (0, react.useState)(null);
			return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				(0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-head",
					children: [(0, import_jsx_runtime.jsx)("h2", { children: "DSH 管理控制台" }), onClose !== void 0 && (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshm-close",
						onClick: onClose,
						children: "关闭"
					})]
				}),
				(0, import_jsx_runtime.jsx)("div", {
					className: "dshm-tabs",
					children: [
						{
							id: "plugins",
							label: "插件"
						},
						{
							id: "market",
							label: "市场"
						},
						{
							id: "skills",
							label: "Skills"
						},
						{
							id: "mcp",
							label: "MCP"
						},
						{
							id: "models",
							label: "模型"
						},
						{
							id: "theme",
							label: "皮肤"
						}
					].map((t) => (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `dshm-tab${tab === t.id ? " active" : ""}`,
						onClick: () => {
							setTab(t.id);
							setMsg(null);
						},
						children: t.label
					}, t.id))
				}),
				(0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-body",
					children: [
						tab === "plugins" && (0, import_jsx_runtime.jsx)(PluginsTab, {
							busy,
							setBusy,
							msg,
							setMsg
						}),
						tab === "market" && (0, import_jsx_runtime.jsx)(MarketTab, {
							busy,
							setBusy,
							msg,
							setMsg
						}),
						tab === "skills" && (0, import_jsx_runtime.jsx)(SkillsTab, {
							busy,
							setBusy,
							msg,
							setMsg
						}),
						tab === "mcp" && (0, import_jsx_runtime.jsx)(McpTab, {
							busy,
							setBusy,
							msg,
							setMsg
						}),
						tab === "models" && (0, import_jsx_runtime.jsx)(ModelsTab, {
							busy,
							setBusy,
							msg,
							setMsg
						}),
						tab === "theme" && (0, import_jsx_runtime.jsx)(ThemeTab, {
							busy,
							setBusy,
							msg,
							setMsg
						}),
						(0, import_jsx_runtime.jsx)(Msg, { msg })
					]
				})
			] });
		}
		/** Floating overlay entry (sidebar footer ⚙). */
		function ManagerOverlay({ onClose }) {
			return (0, import_jsx_runtime.jsx)("div", {
				className: "dshm-root",
				onClick: onClose,
				children: (0, import_jsx_runtime.jsx)("div", {
					className: "dshm-panel",
					onClick: (e) => e.stopPropagation(),
					children: (0, import_jsx_runtime.jsx)(ManagerPanel, { onClose })
				})
			});
		}
		/** Official settings-panel page entry (settings.section slot). */
		function ManagerSection(props) {
			return (0, import_jsx_runtime.jsx)("div", {
				className: "dshm-page",
				children: (0, import_jsx_runtime.jsx)(ManagerPanel, {})
			});
		}
		/**
		* Plugin body: register the sidebar footer entry AND the official settings
		* panel page once their slots declare.
		* @param ctx - client root context (slots injected).
		*/
		function apply(ctx) {
			ensureStyles();
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				id: "dsh-manager",
				name: "sidebar.footer.action",
				inject: () => ({})
			}, (props) => {
				const [open, setOpen] = (0, react.useState)(false);
				return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)(ManagerButton, { open: () => setOpen(true) }), open && (0, import_jsx_runtime.jsx)(ManagerOverlay, { onClose: () => setOpen(false) })] });
			}));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				id: "dsh-manager",
				name: "settings.section",
				order: 50,
				label: "管理控制台",
				inject: () => ({})
			}, ManagerSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map