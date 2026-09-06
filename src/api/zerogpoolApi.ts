const DEFAULT_API_URL = "https://api-zerogpool.kult.games/api";

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_ZEROGPOOL_API_URL as string | undefined;
  return (raw?.trim() || DEFAULT_API_URL).replace(/\/$/, "");
}

/**
 * Calls zerogpoolgame's `/player/auth/login`, which triggers the backend's on-chain
 * `recordSession` write — the same effect zerogpool-frontend's `loginWithWallet`
 * (src/lib/api.ts) has when it fires on wallet connect.
 */
export async function recordZeroGPoolSessionStart(walletAddress: string): Promise<void> {
  const wallet = walletAddress?.trim();
  if (!wallet) return;

  try {
    await fetch(`${getBaseUrl()}/player/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: wallet }),
    });
  } catch (error) {
    console.warn("[ZeroGPool] Failed to record session start", error);
  }
}
