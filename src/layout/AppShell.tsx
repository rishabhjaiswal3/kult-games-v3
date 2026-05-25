import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/layout/AppSidebar";
import { AppTopbar } from "@/layout/AppTopbar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { navLabelForPath } from "@/layout/navConfig";
import { usesArenaLayout } from "@/layout/arenaRoutes";
import { cn } from "@/lib/utils";

export type AppShellOutletContext = {
  isGameChromeVisible: boolean;
  toggleGameChrome: () => void;
} | null;

export function AppShell() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGameChromeVisible, setIsGameChromeVisible] = useState(true);
  const activeLabel = navLabelForPath(pathname);
  const isGamePlay = /^\/game\/[^/]+\/play$/.test(pathname);
  const isMoments = pathname === "/moments";
  const isAIArenaLanding = pathname === "/ai-arena";
  const isArenaLayout = usesArenaLayout(pathname);
  const isHome = pathname === "/";
  const isLeaderboard = pathname === "/leaderboard";
  const isAutonomous = pathname === "/autonomous";
  const isAchievements = pathname === "/achievements";
  
  const showDashboardTopbar = isHome || isAIArenaLanding || isLeaderboard || isAutonomous || isAchievements || isMoments;
  const hideAppTopbar = isArenaLayout || showDashboardTopbar;
  const scrollableMain = isAIArenaLanding || isArenaLayout || showDashboardTopbar || isGamePlay;
  const showGameChrome = !isGamePlay || isGameChromeVisible;
  const showGameTopbar = !hideAppTopbar && showGameChrome;
  const outletContext: AppShellOutletContext = isGamePlay
    ? {
        isGameChromeVisible,
        toggleGameChrome: () => setIsGameChromeVisible((current) => !current),
      }
    : null;

  return (
    <div className="arena-app-shell h-dvh min-h-0 overflow-hidden bg-[#03070d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(139,37,255,0.18),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(33,144,255,0.12),transparent_32%)]" />
      <div className="relative flex h-dvh min-h-0 overflow-hidden">
        <AppSidebar
          activeLabel={activeLabel}
          isCollapsed={isCollapsed}
          isHidden={!showGameChrome}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <main
          className={cn(
            "relative flex h-full min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            showGameChrome ? (isCollapsed ? "lg:ml-[72px]" : "lg:ml-[225px]") : "lg:ml-0"
          )}
        >
          {scrollableMain ? (
            <div
              className={cn(
                "arena-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden",
                isGamePlay ? "overflow-hidden" : "overflow-y-auto"
              )}
            >
              {showDashboardTopbar ? <DashboardTopbar /> : null}
              {!hideAppTopbar ? (
                isGamePlay ? (
                  <div
                    className={cn(
                      "shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      showGameTopbar ? "max-h-24 translate-y-0 opacity-100" : "max-h-0 -translate-y-3 opacity-0 pointer-events-none"
                    )}
                  >
                    <AppTopbar />
                  </div>
                ) : (
                  <AppTopbar />
                )
              ) : null}
              <Outlet context={outletContext} />
            </div>
          ) : (
            <div className="arena-scroll mx-auto min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-y-auto overflow-x-hidden">
              {showDashboardTopbar ? <DashboardTopbar /> : null}
              {!hideAppTopbar ? <AppTopbar /> : null}
              <div className="px-4 py-5 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
