import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, HelpCircle, LogIn, LogOut, Menu, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccess } from "@/contexts/AccessContext";
import { requestOpenLoginModal } from "@/lib/loginModalBus";
import { useTour } from "@/tour/TourProvider";
import dashboardAvatar from "@/assets/dashboard-avatar.png";

export function DashboardTopbar() {
  const [openPanel, setOpenPanel] = useState<"notifications" | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const { canUse } = useAccess();
  const { isRunning, startWebsiteTour } = useTour();
  const showArenaLinks = canUse("ai_arena");
  const showLeagueLinks = canUse("league");
  const showNotifications = showArenaLinks || showLeagueLinks;
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePanel = (panel: "notifications") => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  const handleConnectWallet = () => {
    if (isAuthenticated) {
      void logout();
      setOpenPanel(null);
      return;
    }
    setOpenPanel(null);
    requestOpenLoginModal();
  };

  return (
    <>
      <header ref={containerRef} className="relative z-30 shrink-0 border-b border-white/10 bg-[#03070d]/88 backdrop-blur-xl">
        <div className="relative mx-auto flex min-h-[54px] max-w-full flex-nowrap items-center justify-between gap-1.5 px-3 py-1.5 sm:min-h-[60px] sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" aria-label="Open dashboard" className="shrink-0 sm:hidden" data-tour="dashboard-profile">
                <img
                  src={dashboardAvatar}
                  alt="Profile"
                  className="h-9 w-9 rounded-lg border border-[#8b27ff]/40 object-cover transition hover:border-[#b54cff]"
                />
              </Link>
            ) : null}
          </div>
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={startWebsiteTour}
              data-tour="tour-start"
              aria-label="Start website tour"
              aria-busy={isRunning}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2.5 font-tech text-[13px] font-black uppercase tracking-[0.12em] text-cyan-100/90 transition hover:border-cyan-200/40 hover:bg-cyan-300/12 hover:text-white min-[430px]:px-3"
            >
              {isRunning ? <Sparkles className="h-3.5 w-3.5" /> : <HelpCircle className="h-3.5 w-3.5" />}
              <span className="hidden min-[430px]:inline">{isRunning ? "Touring" : "Tour"}</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" aria-label="Open dashboard" className="hidden shrink-0 sm:block" data-tour="dashboard-profile">
                  <img
                    src={dashboardAvatar}
                    alt="Profile"
                    className="h-9 w-9 rounded-lg border border-[#8b27ff]/40 object-cover transition hover:border-[#b54cff] sm:h-10 sm:w-10"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    togglePanel("notifications");
                    setHasUnreadNotifications(false);
                  }}
                  data-tour="topbar-notifications"
                  className="relative hidden shrink-0 rounded-md p-1.5 text-white/70 transition hover:bg-white/5 hover:text-white min-[380px]:block sm:p-2"
                  aria-label="Open notifications"
                >
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#8b29ff]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  data-tour="topbar-connect"
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-red-400/18 bg-red-500/[0.06] px-2.5 font-tech text-[9px] font-bold uppercase tracking-[0.12em] text-red-300/85 transition-all hover:border-red-300/38 hover:bg-red-500/12 hover:text-red-200 min-[430px]:px-3"
                >
                  <LogOut className="h-3.5 w-3.5 min-[430px]:hidden" />
                  <span className="hidden min-[430px]:inline">Disconnect</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectWallet}
                data-tour="topbar-connect"
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-[#9a35ff]/55 bg-gradient-to-r from-[#9a35ff] to-[#7c2bcc] px-2.5 font-tech text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-[0_0_20px_rgba(154,53,255,0.25)] transition-all hover:border-[#c084fc]/70 hover:shadow-[0_0_28px_rgba(154,53,255,0.4)] hover:brightness-110 min-[430px]:px-4"
              >
                <LogIn className="h-3.5 w-3.5 min-[430px]:hidden" />
                <span className="hidden min-[430px]:inline">Connect wallet</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"))}
              className="shrink-0 rounded-md p-1.5 text-white/72 transition hover:bg-white/5 hover:text-white sm:p-2 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        {openPanel && (
          <div className="absolute right-4 top-full z-50 w-[calc(100vw-2rem)] max-w-sm rounded-md border border-white/12 bg-[#060b15] p-4 shadow-2xl shadow-black/40 sm:right-6 lg:right-8">
            {openPanel === "notifications" && (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/65">Notifications</span>
                  <button
                    type="button"
                    onClick={() => setOpenPanel(null)}
                    className="text-xs font-semibold text-[#b65cff] hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3 space-y-3 text-sm">
                  {showArenaLinks ? (
                    <>
                      <Link to="/ai-arena" className="block rounded border border-white/8 bg-white/[0.02] p-3 hover:bg-white/5">
                        HYBRID battle result is ready
                      </Link>
                      <Link to="/ai-arena" className="block rounded border border-white/8 bg-white/[0.02] p-3 hover:bg-white/5">
                        Training slot completed
                      </Link>
                    </>
                  ) : null}
                  {showLeagueLinks ? (
                    <Link to="/leaderboard" className="block rounded border border-white/8 bg-white/[0.02] p-3 hover:bg-white/5">
                      New achievement progress unlocked
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
