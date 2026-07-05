/**
 * Base URLs for backend microservices. Override via Vite env in `.env` when needed.
 */

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/** Creator Studio — served at `/studio/` on the main app host (nginx routes this, not the SPA). */
export function studioUrl(): string {
  const host = trimTrailingSlash(
    import.meta.env.VITE_API_URL ?? "https://kult-browser-rust-l2lwg.ondigitalocean.app",
  ).replace(/\/api$/i, "");
  return `${host}/studio/`;
}

/** Primary Kult API (games, player, leaderboard, …) — same origin as today + `/api`. */
export const MAIN_BACKEND =
  `${trimTrailingSlash(import.meta.env.VITE_API_URL ?? "https://kult-browser-rust-l2lwg.ondigitalocean.app")}/api`;

/** AI Arena gateway from 0g-aiarena frontend spec. */
export const AI_ARENA_GATEWAY_URL = trimTrailingSlash(
  import.meta.env.VITE_AI_ARENA_GATEWAY_URL ?? "https://aiarena-gateway.onrender.com"
);
