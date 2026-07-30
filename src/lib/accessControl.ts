export type AccessFeature =
  | "ai_arena"
  | "league"
  | "moments"
  | "games"
  | "creator_platform"
  | "creator_studio"
  | "full_browser";

export type AccessTier = "tier_1" | "tier_2" | "tier_3" | "tier_4" | "tier_5" | "tier_6";

export type BrowserAccessSession = {
  tier: AccessTier;
  label: string;
  features: AccessFeature[];
  accessToken: string;
  expiresAt: number;
};

export function hasFeature(session: BrowserAccessSession | null, feature: AccessFeature) {
  if (!session) return false;
  return session.features.includes("full_browser") || session.features.includes(feature);
}

export function isAccessSessionValid(session: BrowserAccessSession | null) {
  return Boolean(session?.accessToken && session.expiresAt > Date.now());
}

export function featureForPath(pathname: string): AccessFeature | null {
  if (pathname === "/") return null;
  if (pathname === "/ai-arena" || pathname === "/dashboard" || pathname === "/my-agents" || pathname === "/training" || pathname === "/battles") return "ai_arena";
  if (pathname.startsWith("/arena/")) return "ai_arena";
  if (pathname === "/games" || pathname.startsWith("/game/")) return "games";
  if (pathname === "/moments" || pathname.startsWith("/moments/")) return "moments";
  if (pathname === "/league" || pathname === "/leaderboard" || pathname === "/achievements") return "league";
  if (pathname === "/creator-platform") return "creator_platform";
  if (
    pathname === "/create" ||
    pathname.startsWith("/create/") ||
    pathname === "/studio" ||
    pathname.startsWith("/studio/")
  ) {
    return "creator_studio";
  }
  if (pathname === "/autonomous") return "ai_arena";
  if (pathname === "/inventory") return "full_browser";
  return null;
}

export function canAccessPath(session: BrowserAccessSession | null, pathname: string) {
  const feature = featureForPath(pathname);
  return !feature || hasFeature(session, feature);
}

/** Safe fallback when a route requires a feature the user does not have — home is always open. */
export function firstAllowedPath(_session: BrowserAccessSession | null) {
  return "/";
}
