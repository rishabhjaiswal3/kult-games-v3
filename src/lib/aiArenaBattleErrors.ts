import axios from "axios";

/** Gateway returns `{ error: "Battle not found" }` (often 404) after a battle is cleaned up. */
export function isBattleNotFoundError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const payload = error.response?.data as { error?: unknown } | undefined;
  const message =
    typeof payload?.error === "string"
      ? payload.error
      : typeof error.message === "string"
        ? error.message
        : "";
  return /battle not found/i.test(message) || error.response?.status === 404;
}

type BattlePollQuery = {
  state: {
    error: unknown;
    data?: { battle?: { status?: string } | null } | null;
  };
};

/**
 * Poll while a battle is live. Stop once it ends, errors, or is missing
 * ("Battle not found") so we don't keep hammering the gateway.
 */
export function battleLiveRefetchInterval(
  query: BattlePollQuery,
  intervalMs = 2_000
): number | false {
  if (query.state.error) return false;
  const status = query.state.data?.battle?.status;
  if (!status || status === "PENDING" || status === "INITIALIZING" || status === "IN_PROGRESS") {
    return intervalMs;
  }
  return false;
}
