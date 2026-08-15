/**
 * Gateway mounts for games that must load their complete frontend instead of
 * a catalog-provided Unity/CDN URL.
 */
export const GAME_FRONTEND_URL_OVERRIDES: Readonly<Record<string, string>> = {
  // This frontend bootstraps the Kult JWT and wallet before mounting Unity.
  zerodash: "/zerodash/",
};
