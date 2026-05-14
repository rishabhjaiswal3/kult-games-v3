/** Looping battle previews generated from arena footage (`public/gifs/arena-battles/`). */
export const ARENA_LIVE_BATTLE_GIFS = [
  "/gifs/arena-battles/battle-1.gif",
  "/gifs/arena-battles/battle-2.gif",
  "/gifs/arena-battles/battle-3.gif",
  "/gifs/arena-battles/battle-4.gif",
] as const;

export const ARENA_LIVE_FEED_GIF = "/gifs/arena-battles/battle-feed.gif";

export function pickArenaBattleGif(index: number): string {
  return ARENA_LIVE_BATTLE_GIFS[index % ARENA_LIVE_BATTLE_GIFS.length];
}
