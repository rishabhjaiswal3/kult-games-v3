/**
 * Base URLs for backend microservices. Override via Vite env in `.env` when needed.
 */

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/** Primary Kult API (games, player, leaderboard, …) — same origin as today + `/api`. */
export const MAIN_BACKEND =
  `${trimTrailingSlash(import.meta.env.VITE_API_URL ?? "https://kult-browser-rust-l2lwg.ondigitalocean.app")}/api`;

/** AI Warzone microservice — own routes and behavior, not the main API envelope. */
export const AI_WARZONE_URL = trimTrailingSlash(
  import.meta.env.VITE_AI_WARZONE_URL ?? "https://ai-warzone.onrender.com"
);
