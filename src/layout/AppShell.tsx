import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/layout/AppSidebar";
import { AppTopbar } from "@/layout/AppTopbar";
import { navLabelForPath } from "@/layout/navConfig";
import { usesArenaLayout } from "@/layout/arenaRoutes";

export function AppShell() {
  const { pathname } = useLocation();
  const activeLabel = navLabelForPath(pathname);
  const isMoments = pathname === "/moments";
  const isAIArenaLanding = pathname === "/ai-arena";
  const isArenaLayout = usesArenaLayout(pathname);
  const hideAppTopbar = isMoments || isArenaLayout || isAIArenaLanding;

  return (
    <div className="arena-app-shell h-dvh min-h-0 overflow-hidden bg-[#03070d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(139,37,255,0.18),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(33,144,255,0.12),transparent_32%)]" />
      <div className="relative flex h-dvh min-h-0 overflow-hidden">
        <AppSidebar activeLabel={activeLabel} />
        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col lg:ml-[225px]">
          {!hideAppTopbar ? <AppTopbar /> : null}
          {isMoments || isAIArenaLanding ? (
            <div className="arena-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
              <Outlet />
            </div>
          ) : isArenaLayout ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <Outlet />
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
