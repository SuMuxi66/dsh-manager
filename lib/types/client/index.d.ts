/**
 * dsh-manager browser half: registers the sidebar footer entry and renders
 * the manager console overlay. All data flows over the same-origin /manager
 * JSON APIs served by the host half — no private harness internals.
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
 * Plugin body: register the sidebar footer entry once the sidebar declares it.
 * @param ctx - client root context (slots injected).
 */
export declare function apply(ctx: ManagerCtx): void;
export {};
