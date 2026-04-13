import type { Game } from "@/types/api";

export function isGameDownloadable(game: Game): boolean {
  const enabled = game.isDownloadable === true || game.is_downloadable === true;
  return enabled && Boolean((game.url ?? "").trim());
}

export function gameDownloadUrl(game: Game): string {
  return (game.url ?? "").trim();
}
