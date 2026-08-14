/**
 * dsh-manager browser half: registers the sidebar footer entry and renders
 * the manager console overlay. All data flows over the same-origin /manager
 * JSON APIs served by the host half — no private harness internals. Tabs:
 * 插件 / 市场 (M1), Skills / MCP (M2), 皮肤 (M3).
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
 * Plugin body: register the sidebar footer entry AND the official settings
 * panel page once their slots declare.
 * @param ctx - client root context (slots injected).
 */
export declare function apply(ctx: ManagerCtx): void;
export {};
