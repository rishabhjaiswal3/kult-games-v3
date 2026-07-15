import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PageRouteFallback } from "@/components/PageRouteFallback";
import { AppSidebar } from "@/layout/AppSidebar";
import { AppTopbar } from "@/layout/AppTopbar";
import { MobileBottomNav } from "@/layout/MobileBottomNav";
import { PageLoginPrompt } from "@/components/LoginPromptToast";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { isMomentsPath, usesMomentsInternalScroll } from "@/constants/moments";
import { navLabelForPath } from "@/layout/navConfig";
import { usesArenaLayout } from "@/layout/arenaRoutes";
import { cn } from "@/lib/utils";

export type AppShellOutletContext = {
  isGameChromeVisible: boolean;
  toggleGameChrome: () => void;
};

export function AppShell() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGameChromeVisible, setIsGameChromeVisible] = useState(true);
  const activeLabel = navLabelForPath(pathname);
  const isMoments = isMomentsPath(pathname);
  const isMomentsInternalScroll = usesMomentsInternalScroll(pathname);
  const isAIArenaLanding = pathname === "/ai-arena";
  const isArenaLayout = usesArenaLayout(pathname);
  const isHome = pathname === "/";
  const isLeaderboard = pathname === "/leaderboard";
  const isAutonomous = pathname === "/autonomous";
  const isAchievements = pathname === "/achievements";
  const isLeague = pathname === "/league" || pathname === "/f1";
  const isGamePlay = /^\/game\/[^/]+\/play$/.test(pathname);

  useEffect(() => {
    if (!isGamePlay) {
      setIsGameChromeVisible(true);
    }
  }, [isGamePlay]);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  const showDashboardTopbar = isHome || isAIArenaLanding || isLeaderboard || isAutonomous || isAchievements || isMoments || isLeague;
  const hideAppTopbar = isArenaLayout || showDashboardTopbar;
  const isFullBleedRoute = isAIArenaLanding || isArenaLayout || showDashboardTopbar || isGamePlay;
  const showSidebar = !isGamePlay || isGameChromeVisible;
  const showTopbar = !hideAppTopbar && (!isGamePlay || isGameChromeVisible);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const shellOutletContext = useMemo<AppShellOutletContext>(
    () => ({
      isGameChromeVisible,
      toggleGameChrome: () => setIsGameChromeVisible((current) => !current),
    }),
    [isGameChromeVisible]
  );

  return (
    <div className="arena-app-shell h-dvh min-h-0 overflow-hidden bg-[#03070d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(139,37,255,0.18),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(33,144,255,0.12),transparent_32%)]" />
      <div className="relative flex h-dvh min-h-0 overflow-hidden">
        {showSidebar ? (
          <AppSidebar activeLabel={activeLabel} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        ) : null}
        <main
          className={cn(
            "flex h-full min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300",
            showSidebar ? (isCollapsed ? "lg:ml-[72px]" : "lg:ml-[225px]") : "lg:ml-0"
          )}
        >
          {isFullBleedRoute ? (
            <div
              ref={mainScrollRef}
              className={cn(
                "arena-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden",
                isMomentsInternalScroll && "xl:overflow-hidden",
                isGamePlay || isHome ? "pb-0" : isAIArenaLanding ? "pb-32 sm:pb-0" : "pb-24 sm:pb-0"
              )}
            >
              {showDashboardTopbar ? <DashboardTopbar /> : null}
              {showTopbar ? <AppTopbar /> : null}
              <div
                className={cn(
                  "flex min-w-0 flex-col",
                  isMomentsInternalScroll ? "xl:min-h-0 xl:flex-1" : "min-h-0 flex-1",
                )}
              >
                <Suspense fallback={<PageRouteFallback />}>
                  <Outlet context={shellOutletContext} />
                </Suspense>
              </div>
            </div>
          ) : (
            <div ref={mainScrollRef} className="arena-scroll mx-auto min-h-0 w-full max-w-full flex-1 flex-col overflow-y-auto overflow-x-hidden pb-32 sm:pb-0">
              {showDashboardTopbar ? <DashboardTopbar /> : null}
              {showTopbar ? <AppTopbar /> : null}
              <div className="px-4 py-5 sm:px-6 lg:px-8">
                <Suspense fallback={<PageRouteFallback />}>
                  <Outlet context={shellOutletContext} />
                </Suspense>
              </div>
            </div>
          )}
        </main>
        <MobileBottomNav />
        <PageLoginPrompt />
      </div>
    </div>
  );
}
