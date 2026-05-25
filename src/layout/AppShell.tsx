import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/layout/AppSidebar";
import { AppTopbar } from "@/layout/AppTopbar";
import { MobileBottomNav } from "@/layout/MobileBottomNav";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { navLabelForPath } from "@/layout/navConfig";
import { usesArenaLayout } from "@/layout/arenaRoutes";
import { cn } from "@/lib/utils";

export function AppShell() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeLabel = navLabelForPath(pathname);
  const isMoments = pathname === "/moments";
  const isAIArenaLanding = pathname === "/ai-arena";
  const isArenaLayout = usesArenaLayout(pathname);
  const isHome = pathname === "/";
  const isLeaderboard = pathname === "/leaderboard";
  const isAutonomous = pathname === "/autonomous";
  const isAchievements = pathname === "/achievements";
  
  const showDashboardTopbar = isHome || isAIArenaLanding || isLeaderboard || isAutonomous || isAchievements || isMoments;
  const hideAppTopbar = isArenaLayout || showDashboardTopbar;
  const scrollableMain = isAIArenaLanding || isArenaLayout || showDashboardTopbar;

  return (
    <div className="arena-app-shell h-dvh min-h-0 overflow-hidden bg-[#03070d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(139,37,255,0.18),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(33,144,255,0.12),transparent_32%)]" />
      <div className="relative flex h-dvh min-h-0 overflow-hidden">
        <AppSidebar activeLabel={activeLabel} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        <main className={cn("flex h-full min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300", isCollapsed ? "lg:ml-[72px]" : "lg:ml-[225px]")}>
          {scrollableMain ? (
            <div className="arena-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-24 sm:pb-0">
              {showDashboardTopbar ? <DashboardTopbar /> : null}
              {!hideAppTopbar ? <AppTopbar /> : null}
              <Outlet />
            </div>
          ) : (
            <div className="arena-scroll mx-auto min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-y-auto overflow-x-hidden pb-24 sm:pb-0">
              {showDashboardTopbar ? <DashboardTopbar /> : null}
              {!hideAppTopbar ? <AppTopbar /> : null}
              <div className="px-4 py-5 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          )}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
