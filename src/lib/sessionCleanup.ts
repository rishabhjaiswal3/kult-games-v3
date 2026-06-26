import { StorageKeys, TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";

export function clearBrowserAccessSession() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(StorageKeys.local.browserAccessSession);
}

export function clearUserSessionCache() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(StorageKeys.local.aiArenaAccessToken);
    localStorage.removeItem(StorageKeys.local.aiArenaRefreshToken);
    localStorage.removeItem(StorageKeys.local.aiArenaTokenExpiresAt);
    localStorage.removeItem(StorageKeys.local.aiArenaUserId);
    localStorage.removeItem(StorageKeys.local.aiArenaCustodialSolanaAddress);
    localStorage.removeItem(StorageKeys.local.aiArenaLastBattleId);
    localStorage.removeItem(StorageKeys.local.arenaBattlePayload);
    localStorage.removeItem(StorageKeys.local.aiAgentInfo);
  }

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(StorageKeys.session.warzoneAgentWalletVerified);
    sessionStorage.removeItem(StorageKeys.session.warzoneAgentId);
    sessionStorage.removeItem(StorageKeys.session.arenaQueuedGameId);
  }
}

export function clearLogoutSessionState() {
  clearUserSessionCache();
  clearBrowserAccessSession();
}
