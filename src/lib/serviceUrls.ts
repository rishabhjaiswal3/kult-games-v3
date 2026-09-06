/**
 * Base URLs for backend microservices. Override via Vite env in `.env` when needed.
 */

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/** Creator Studio public mount point. Keep this independent from the main API origin. */
export function studioUrl(): string {
  const studioBase = trimTrailingSlash(
    import.meta.env.VITE_CREATOR_STUDIO_URL ?? "https://app.kult.games/create",
  );
  // Always enter through auto-auth to reuse the existing Privy session and warm the studio's API JWT cache.
  return `${studioBase}/auto-auth`;
}

/** Primary Kult API (games, player, leaderboard, …), same origin as today + `/api`. */
export const MAIN_BACKEND =
  `${trimTrailingSlash(import.meta.env.VITE_API_URL ?? "https://kult-browser-rust-l2lwg.ondigitalocean.app")}/api`;

/** Public CDN containing marketplace inventory media. */
export const ASSET_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_ASSET_URL ?? "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com",
);

/** Creator Studio's own backend (issues the studio's JWT) — a separate service from MAIN_BACKEND. */
export const CREATOR_STUDIO_BACKEND = trimTrailingSlash(
  import.meta.env.VITE_CREATOR_STUDIO_API_URL ?? "https://tg.kult.games/api",
);

/** AI Arena gateway from 0g-aiarena frontend spec. */
export const AI_ARENA_GATEWAY_URL = trimTrailingSlash(
  import.meta.env.VITE_AI_ARENA_GATEWAY_URL ?? "https://aiarena-gateway.kult.games"
);
