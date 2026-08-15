import type { Game } from "@/types/api";

/** Bundled cover art for the KULT-built titles, keyed by lowercased file basename. */
const localGameImageFiles = import.meta.glob("../assets/games/allGameImages/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const LOCAL_GAME_IMAGE_BY_KEY: Record<string, string> = {};
for (const [path, url] of Object.entries(localGameImageFiles)) {
  const base = path.split("/").pop()?.replace(/\.webp$/i, "").toLowerCase();
  if (base) LOCAL_GAME_IMAGE_BY_KEY[base] = url;
}

/** Game keys (see `getGameKey`) that don't match their image's file basename exactly. */
const LOCAL_GAME_IMAGE_ALIASES: Record<string, string> = {
  robowars: "robowar",
  highwayhustleoneway: "highwayhustle",
  highwayhustletwoway: "highwayhustle",
  highwayhustlespeedrun: "highwayhustle",
  highwayhustletimebomb: "highwayhustle",
};

export function getGameName(name: Game["name"]): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
}

export function getGameImage(game: Game): string {
  const key = getGameKey(game);
  const localImage = LOCAL_GAME_IMAGE_BY_KEY[LOCAL_GAME_IMAGE_ALIASES[key] ?? key];
  if (localImage) return localImage;

  return (
    game.thumbnail?.horizontal?.url ??
    game.thumbnail?.vertical?.url ??
    game.image_url ??
    game.images?.[0]?.url ??
    ""
  );
}

export function getGameDescription(desc: Game["description"]): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  return desc?.en ?? Object.values(desc)[0] ?? "";
}

export function getGameKey(game: Game): string {
  const raw = game.identification ?? game.slug ?? getGameName(game.name);
  return raw.toLowerCase().replace(/[\s_-]+/g, "");
}
