const DEFAULT_API_URL = "https://zerodashbackend.onrender.com";

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_ZERODASH_API_URL as string | undefined;
  return (raw?.trim() || DEFAULT_API_URL).replace(/\/$/, "");
}

/**
 * Mirrors zerodashgame's `/player/game-sync` call (react-version's GameCanvas.jsx bridge) —
 * fired here explicitly on "Play now" click instead of waiting on the Unity build to report it.
 *
 * Deliberately omits `highScore`/`coins`: the backend overwrites `coins` unconditionally when
 * present (no max-with-previous guard like `highScore` has), so sending a placeholder `0` would
 * reset the player's real coin balance. Omitting both fields is a safe no-op ping — it still
 * creates the player profile on first run and submits a `player.save` event to the 0G DA
 * pipeline, without touching saved progress.
 */
export async function recordZeroDashSessionStart(walletAddress: string): Promise<void> {
  const wallet = walletAddress?.trim();
  if (!wallet) return;

  try {
    await fetch(`${getBaseUrl()}/player/game-sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wallet}`,
      },
      body: JSON.stringify({ client: "kult-games-v3-start", ts: Date.now() }),
    });
  } catch (error) {
    console.warn("[ZeroDash] Failed to record session start", error);
  }
}
