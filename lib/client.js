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
			return await (await fetch(path, {
				headers: { "content-type": "application/json" },
				...init
			})).json();
		}
		/** Sidebar footer entry: opens the manager overlay. */
		function ManagerButton({ open }) {
			return (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "管理控制台",
				title: "管理控制台：插件 / 市场",
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
		/** The manager console overlay. */
		function ManagerOverlay({ onClose }) {
			const [tab, setTab] = (0, react.useState)("plugins");
			const [plugins, setPlugins] = (0, react.useState)([]);
			const [profile, setProfile] = (0, react.useState)("web");
			const [market, setMarket] = (0, react.useState)([]);
			const [spec, setSpec] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [msg, setMsg] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const refreshPlugins = async () => {
				const data = await managerFetch("/manager/api/plugins");
				setProfile(data.profile);
				setPlugins(data.plugins);
			};
			(0, react.useEffect)(() => {
				(async () => {
					await refreshPlugins();
					setLoading(false);
				})();
			}, []);
			const loadMarket = async () => {
				const data = await managerFetch("/manager/api/market");
				setMarket(data.plugins);
			};
			(0, react.useEffect)(() => {
				loadMarket();
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
				await refreshPlugins();
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
			return (0, import_jsx_runtime.jsx)("div", {
				className: "dshm-root",
				onClick: onClose,
				children: (0, import_jsx_runtime.jsxs)("div", {
					className: "dshm-panel",
					onClick: (e) => e.stopPropagation(),
					children: [
						(0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-head",
							children: [(0, import_jsx_runtime.jsxs)("h2", { children: ["DSH 管理控制台 ", (0, import_jsx_runtime.jsxs)("span", {
								style: {
									color: "#6b7384",
									fontWeight: 400
								},
								children: ["profile: ", profile]
							})] }), (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshm-close",
								onClick: onClose,
								children: "关闭"
							})]
						}),
						(0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-tabs",
							children: [(0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `dshm-tab${tab === "plugins" ? " active" : ""}`,
								onClick: () => setTab("plugins"),
								children: "插件"
							}), (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `dshm-tab${tab === "market" ? " active" : ""}`,
								onClick: () => setTab("market"),
								children: "市场"
							})]
						}),
						(0, import_jsx_runtime.jsxs)("div", {
							className: "dshm-body",
							children: [
								tab === "plugins" && (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
									(0, import_jsx_runtime.jsx)("div", {
										className: "dshm-hint",
										children: "启停即时生效；安装/卸载需要重启 web 或桌面端后生效。"
									})
								] }),
								tab === "market" && (0, import_jsx_runtime.jsx)("div", {
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
													onClick: () => void install(`github:${row.repo}`),
													children: "安装"
												})]
											})
										]
									}, row.repo + row.name))
								}),
								msg !== null && (0, import_jsx_runtime.jsx)("div", {
									className: `dshm-msg ${msg.ok ? "ok" : "err"}`,
									children: msg.text
								})
							]
						})
					]
				})
			});
		}
		/**
		* Plugin body: register the sidebar footer entry once the sidebar declares it.
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
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map