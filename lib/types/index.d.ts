/**
 * dsh-manager host half: serves the /manager JSON APIs —
 * M1: plugin inventory (live loader state), runtime enable/disable, persistent
 *     install/uninstall by forwarding to the `dsh plugin` CLI, plugin market.
 * M2: skills catalog (list/detail/install/uninstall into the user agents
 *     home), MCP server configuration (managed block in the profile patch).
 * M3: credential keys (describe/set/unset — never echoes values), model
 *     provider settings (default model + configurable providers), theme
 *     preference and skin rows — all removed; skin/theming is left to the
 *     official web-ui skin center.
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
