/**
 * dsh-manager host half: serves the /manager JSON APIs — plugin inventory
 * (live loader state), runtime enable/disable (loader.create/remove), and
 * persistent install/uninstall by forwarding to the `dsh plugin` CLI in the
 * active profile. The plugin market endpoint returns the built-in curated
 * list, optionally refreshed from the GitHub dsh-plugin topic (proxy via
 * `DSH_MANAGER_GITHUB_PROXY`).
 * @module dsh-manager
 */
import type { Context } from '@deepseek-ai/cordis';
/** Stable Cordis plugin name. */
export declare const name = "dsh-manager";
/** Services required before the manager APIs can mount. */
export declare const inject: string[];
/**
 * Mount the manager routes on the shared web server: exact GET/POST under
 * /manager/api.
 * @param ctx - plugin context carrying webServer and loader.
 */
export declare function apply(ctx: Context): void;
