/**
 * Base URLs for backend microservices. Override via Vite env in `.env` when needed.
 */

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/** Current app origin (browser) or VITE_API_URL host fallback for non-DOM contexts. */
export function appOrigin(): string {
  if (typeof window !== "undefined") {
    return trimTrailingSlash(window.location.origin);
  }
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  return apiUrl ? trimTrailingSlash(apiUrl.replace(/\/api$/i, "")) : "";
}

/** Creator Studio — same host as this app, `/studio` path. */
export function studioUrl(): string {
  return `${appOrigin()}/studio`;
}

/** Primary Kult API (games, player, leaderboard, …) — same origin as today + `/api`. */
export const MAIN_BACKEND =
  `${trimTrailingSlash(import.meta.env.VITE_API_URL ?? "https://kult-browser-rust-l2lwg.ondigitalocean.app")}/api`;

/** AI Arena gateway from 0g-aiarena frontend spec. */
export const AI_ARENA_GATEWAY_URL = trimTrailingSlash(
  import.meta.env.VITE_AI_ARENA_GATEWAY_URL ?? "https://aiarena-gateway.onrender.com"
);
