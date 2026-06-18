import type { LucideIcon } from "lucide-react";
import {
  Crown,
  Clapperboard,
  FileText,
  Gamepad2,
  Home,
  Medal,
  Package,
  PenTool,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { AccessFeature, BrowserAccessSession } from "@/lib/accessControl";
import { hasFeature } from "@/lib/accessControl";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  tag?: string;
  requiresAuth?: boolean;
  /** When set, clicking the item navigates to this external URL instead of the internal path. */
  externalUrl?: string;
  feature?: AccessFeature;
};

export const APP_NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "League", path: "/league", icon: Medal, feature: "league" },
  { label: "AI Arena", path: "/ai-arena", icon: Sparkles, feature: "ai_arena" },
  { label: "Games", path: "/games", icon: Gamepad2, feature: "games" },
  { label: "Moments", path: "/moments", icon: FileText, feature: "moments" },
  { label: "Creator Platform", path: "/creator-platform", icon: PenTool, feature: "creator_platform" },
  { label: "Creator Studio", path: "/creator-studio", icon: Clapperboard, feature: "creator_studio" },
  { label: "Inventory", path: "/inventory", icon: Package, feature: "full_browser" },
  { label: "Achievements", path: "/achievements", icon: Trophy, feature: "league" },
  { label: "Leaderboard", path: "/leaderboard", icon: Crown, feature: "league" },
];

export function navItemsForAccess(session: BrowserAccessSession | null, isAuthenticated: boolean): NavItem[] {
  return APP_NAV_ITEMS.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return !item.feature || hasFeature(session, item.feature);
  });
}

export function navLabelForPath(pathname: string): string {
  if (pathname.startsWith("/game/")) return "Games";
  if (pathname === "/") return "Home";
  const item = APP_NAV_ITEMS.find((n) => n.path === pathname);
  return item?.label ?? "Dashboard";
}
