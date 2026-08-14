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
import { Context } from '@deepseek-ai/cordis';
interface SlotsLike {
    inject(name: string, setup: () => unknown): void;
    register(entry: Record<string, unknown>, component: unknown): unknown;
}
interface ManagerCtx extends Context {
    slots: SlotsLike;
}
/** Required services: the slot registry (declaration may come later). */
export declare const inject: string[];
/**
 * Plugin body: distribute manager surfaces across the official settings
 * panel —
 *   settings.plugins.tab → 插件管理 / 插件市场 (inside 设置 → 插件)
 *   settings.section     → Skills 管理 / MCP 管理 (own pages)
 * @param ctx - client root context (slots injected).
 */
export declare function apply(ctx: ManagerCtx): void;
export {};
