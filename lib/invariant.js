//#region lib/types/invariant.js
/**
* Package-owned invariant companion for dsh-manager.
* @module dsh-manager/invariant
*/
/** Cordis companion plugin name. */
const name = "dsh-manager-invariant";
/** No services required. */
const inject = [];
/**
* No runtime invariant: a pure API-surface plugin whose behavior is asserted
* end-to-end by the Playwright suite (scripts/e2e-manager.mjs) — live loader
* state after toggles, market responses, and install round-trips.
*/
const apply = () => {};
//#endregion
export { apply, inject, name };
