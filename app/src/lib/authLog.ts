/**
 * Login-flow tracing.
 *
 * Enabled in production too: sign-in problems only reproduce against the real Privy
 * app + backend, so the deployed build has to be diagnosable. Set
 * `localStorage.kult_auth_debug = "0"` to silence it.
 */

const PREFIX = "[kult-auth]";
const DEBUG_FLAG_KEY = "kult_auth_debug";

function enabled() {
  try {
    return localStorage.getItem(DEBUG_FLAG_KEY) !== "0";
  } catch {
    return true;
  }
}

/** Never log full tokens — enough to correlate across events, useless if leaked. */
export function tokenFingerprint(token: string | null | undefined) {
  if (!token) return null;
  return `len=${token.length}:${token.slice(0, 6)}…${token.slice(-4)}`;
}

export function shortAddress(address: string | null | undefined) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function authLog(event: string, data?: Record<string, unknown>) {
  if (!enabled()) return;
  if (data) console.info(`${PREFIX} ${event}`, data);
  else console.info(`${PREFIX} ${event}`);
}

export function authWarn(event: string, data?: Record<string, unknown>) {
  if (!enabled()) return;
  console.warn(`${PREFIX} ${event}`, data ?? "");
}
