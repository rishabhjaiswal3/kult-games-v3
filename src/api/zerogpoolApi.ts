const DEFAULT_API_URL = "https://zerogpoolgame.onrender.com/api";

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_ZEROGPOOL_API_URL as string | undefined;
  return (raw?.trim() || DEFAULT_API_URL).replace(/\/$/, "");
}

/**
 * Mirrors zerogpool-frontend's `loginWithWallet` (src/lib/api.ts) — this is the same
 * `/auth/login` call the standalone Zero G Pool frontend fires on wallet connect, which
 * triggers the backend's on-chain `recordSession` write.
 */
export async function recordZeroGPoolSessionStart(walletAddress: string): Promise<void> {
  const wallet = walletAddress?.trim();
  if (!wallet) return;

  try {
    await fetch(`${getBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: wallet }),
    });
  } catch (error) {
    console.warn("[ZeroGPool] Failed to record session start", error);
  }
}
