import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { basename } from "node:path";
//#region lib/types/index.js
/**
* dsh-manager host half: serves the /manager JSON APIs — plugin inventory
* (live loader state), runtime enable/disable (loader.create/remove), and
* persistent install/uninstall by forwarding to the `dsh plugin` CLI in the
* active profile. The plugin market endpoint returns the built-in curated
* list, optionally refreshed from the GitHub dsh-plugin topic (proxy via
* `DSH_MANAGER_GITHUB_PROXY`).
* @module dsh-manager
*/
/** Stable Cordis plugin name. */
const name = "dsh-manager";
/** Services required before the manager APIs can mount. */
const inject = ["webServer", "loader"];
const require = createRequire(import.meta.url);
/** Resolve the dsh CLI bin for plugin forwarding, or null when absent. */
function resolveDshBin() {
	const explicit = process.env.DSH_MANAGER_DSH_BIN;
	if (explicit !== void 0 && explicit !== "") return explicit;
	try {
		return require.resolve("@deepseek-ai/dsh/lib/bin.js");
	} catch {
		return null;
	}
}
/**
* The profile name the running tree boots from: the cordis.yml directory's
* basename ($DSH_HOME/profiles/<name>). Falls back to 'web'.
* @param ctx - plugin context carrying the config-tree baseUrl.
*/
function profileName(ctx) {
	if (ctx.baseUrl === void 0) return "web";
	return basename(ctx.baseUrl);
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
function runDshPlugin(ctx, args) {
	const bin = resolveDshBin();
	const profile = profileName(ctx);
	const argv = bin !== null ? [
		bin,
		"plugin",
		"--profile",
		profile,
		...args
	] : [
		"dsh",
		"plugin",
		"--profile",
		profile,
		...args
	];
	return new Promise((resolvePromise) => {
		const child = spawn(process.execPath, argv, {
			env: process.env,
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			],
			windowsHide: true
		});
		let output = "";
		const collect = (chunk) => {
			output += chunk.toString();
		};
		child.stdout?.on("data", collect);
		child.stderr?.on("data", collect);
		child.on("error", (error) => {
			resolvePromise({
				ok: false,
				output: `failed to spawn dsh: ${error.message}`
			});
		});
		child.on("exit", (code) => {
			resolvePromise({
				ok: code === 0,
				output
			});
		});
	});
}
/** The built-in curated dsh-plugin market (name, repo, stars, description). */
const CURATED_MARKET = [
	{
		name: "dsh-web-ui",
		repo: "zhu1090093659/dsh-web-ui",
		stars: "920",
		desc: "插件与皮肤合集：任务看板、Git 图谱、右侧面板、宠物、实时 token 统计、皮肤中心"
	},
	{
		name: "dsh-TUI",
		repo: "ccch1mneyyy/dsh-TUI",
		stars: "488",
		desc: "Claude Code 风格全屏交互终端插件"
	},
	{
		name: "awesome-dsh-plugins",
		repo: "AdamPlatin123/awesome-dsh-plugins",
		stars: "508",
		desc: "dsh 插件雷达：自动扫描发现的插件候选索引"
	},
	{
		name: "dsh-web-ui-settings",
		repo: "zhu1090093659/dsh-web-ui",
		stars: "920",
		desc: "皮肤中心设置界面（独立安装版）"
	},
	{
		name: "dsh-skins",
		repo: "zhu1090093659/dsh-web-ui",
		stars: "920",
		desc: "皮肤合集包：8 款调色板注册进官方主题运行时"
	},
	{
		name: "dsh-theme",
		repo: "oil-oil/dsh-theme",
		stars: "1",
		desc: "实时主题编辑器：9 套调色板 + 强调色/字体/字号控制"
	},
	{
		name: "dsh-skin",
		repo: "KinGao294/dsh-skin",
		stars: "0",
		desc: "皮肤切换器 + 自定义毛玻璃壁纸（透明度/模糊）"
	},
	{
		name: "modlens",
		repo: "liustack/modlens",
		stars: "856",
		desc: "视觉插件：粘贴图片得到结构化 JSON 证据（OCR/布局/语义）"
	},
	{
		name: "dsh-vision-toolkit",
		repo: "Anionex/dsh-vision-toolkit",
		stars: "232",
		desc: "纯文本模型的视觉任务：图片问答/长截图 OCR/UI 还原"
	},
	{
		name: "dsh-find-plugins",
		repo: "Nagi-ovo/dsh-find-plugins",
		stars: "51",
		desc: "插件发现工具"
	},
	{
		name: "dsh-agent-teams",
		repo: "NanmiCoder/dsh-agent-teams",
		stars: "141",
		desc: "AgentTeams 多智能体协作插件"
	},
	{
		name: "dsh-browser",
		repo: "Lum1104/dsh-browser",
		stars: "46",
		desc: "Chrome 侧边栏扩展：DSH 直接操控浏览器"
	},
	{
		name: "dsh-custom-tool",
		repo: "omdsh-dev/dsh-custom-tool",
		stars: "18",
		desc: "Monaco 编辑器创建和管理沙箱化 JS 工具"
	},
	{
		name: "dsh-remote-sandbox",
		repo: "weijiafu14/dsh-remote-sandbox",
		stars: "0",
		desc: "E2B 远程沙箱：崩溃恢复 + 工作区同步"
	},
	{
		name: "dsh-self-checking-profile",
		repo: "SLAPaper/dsh-self-checking-profile",
		stars: "1",
		desc: "Self Checking 沙箱模式 web profile"
	},
	{
		name: "openpencil",
		repo: "ZSeven-W/dsh-openpencil",
		stars: "45",
		desc: "OpenPencil 设计稿预览与编辑插件"
	},
	{
		name: "tokenbank",
		repo: "wink-run/tokenbank",
		stars: "69",
		desc: "本地 LLM 网关：token 统计/智能路由/配额共享"
	},
	{
		name: "whale-girl",
		repo: "vlln/whale-girl",
		stars: "59",
		desc: "DSH Web GUI 桌面宠物（QQ 宠物形态）"
	},
	{
		name: "dsh-genui",
		repo: "omdsh-dev/dsh-genui",
		stars: "36",
		desc: "GenUI：对话内联渲染交互式 UI 组件"
	},
	{
		name: "dsh-at-file",
		repo: "omdsh-dev/dsh-at-file",
		stars: "62",
		desc: "Codex 风格 @file 引用：搜索工作区文件并附到提示词"
	}
];
/**
* Fetch the live GitHub topic listing through an optional proxy
* (DSH_MANAGER_GITHUB_PROXY). Returns null on any failure so the caller
* falls back to the curated list.
*/
async function fetchGitHubMarket() {
	const proxy = process.env.DSH_MANAGER_GITHUB_PROXY;
	try {
		const res = await fetch("https://api.github.com/search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=30", {
			signal: AbortSignal.timeout(15e3),
			...proxy !== void 0 ? { dispatcher: void 0 } : {}
		});
		if (!res.ok) return null;
		return ((await res.json()).items ?? []).map((item) => ({
			name: item.full_name.split("/")[1] ?? item.full_name,
			repo: item.full_name,
			stars: String(item.stargazers_count),
			desc: item.description ?? ""
		}));
	} catch {
		return null;
	}
}
/** JSON response helper. */
function json(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(payload),
		"cache-control": "no-store"
	});
	res.end(payload);
}
/** Read the request body as JSON (bounded). */
function readBody(req) {
	return new Promise((resolvePromise, reject) => {
		const chunks = [];
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > 1e6) {
				reject(/* @__PURE__ */ new Error("body too large"));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => {
			try {
				resolvePromise(chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {});
			} catch (error) {
				reject(error instanceof Error ? error : new Error(String(error)));
			}
		});
		req.on("error", reject);
	});
}
/**
* Mount the manager routes on the shared web server: exact GET/POST under
* /manager/api.
* @param ctx - plugin context carrying webServer and loader.
*/
function apply(ctx) {
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: "/manager/api",
		handler: async (req, res) => {
			const path = new URL(req.url ?? "/", "http://localhost").pathname;
			try {
				if (req.method === "GET" && path === "/manager/api/plugins") {
					const rows = [];
					for (const entry of ctx.loader.entries()) rows.push({
						id: entry.options.id ?? entry.options.name,
						name: entry.options.name,
						disabled: entry.disabled
					});
					json(res, 200, {
						ok: true,
						profile: profileName(ctx),
						plugins: rows
					});
					return;
				}
				if (req.method === "GET" && path === "/manager/api/market") {
					const live = await fetchGitHubMarket();
					json(res, 200, {
						ok: true,
						live: live !== null,
						plugins: live ?? CURATED_MARKET
					});
					return;
				}
				if (req.method === "POST" && path === "/manager/api/plugins/toggle") {
					const body = await readBody(req);
					const id = typeof body.id === "string" ? body.id : "";
					const entry = [...ctx.loader.entries()].find((candidate) => (candidate.options.id ?? candidate.options.name) === id);
					if (entry === void 0) {
						json(res, 404, {
							ok: false,
							error: `unknown plugin ${JSON.stringify(id)}`
						});
						return;
					}
					if (entry.disabled) {
						await ctx.loader.create({ name: entry.options.name });
						json(res, 200, {
							ok: true,
							action: "enabled"
						});
					} else {
						await ctx.loader.remove(entry.options.id);
						json(res, 200, {
							ok: true,
							action: "disabled"
						});
					}
					return;
				}
				if (req.method === "POST" && path === "/manager/api/install") {
					const body = await readBody(req);
					const spec = typeof body.spec === "string" ? body.spec : "";
					if (spec === "") {
						json(res, 400, {
							ok: false,
							error: "spec required"
						});
						return;
					}
					const result = await runDshPlugin(ctx, ["add", spec]);
					json(res, result.ok ? 200 : 500, {
						ok: result.ok,
						output: result.output.slice(-4e3)
					});
					return;
				}
				if (req.method === "POST" && path === "/manager/api/uninstall") {
					const body = await readBody(req);
					const pkg = typeof body.name === "string" ? body.name : "";
					if (pkg === "") {
						json(res, 400, {
							ok: false,
							error: "name required"
						});
						return;
					}
					const result = await runDshPlugin(ctx, ["remove", pkg]);
					json(res, result.ok ? 200 : 500, {
						ok: result.ok,
						output: result.output.slice(-4e3)
					});
					return;
				}
				json(res, 404, {
					ok: false,
					error: "not found"
				});
			} catch (error) {
				json(res, 500, {
					ok: false,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		}
	}), "dsh-manager: /manager/api routes");
}
//#endregion
export { apply, inject, name };
