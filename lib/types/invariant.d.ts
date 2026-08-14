/**
 * Package-owned invariant companion for dsh-manager.
 * @module dsh-manager/invariant
 */
/** Cordis companion plugin name. */
export declare const name = "dsh-manager-invariant";
/** No services required. */
export declare const inject: never[];
/**
 * No runtime invariant: a pure API-surface plugin whose behavior is asserted
 * end-to-end by the Playwright suite (scripts/e2e-manager.mjs) — live loader
 * state after toggles, market responses, and install round-trips.
 */
export declare const apply: () => void;
