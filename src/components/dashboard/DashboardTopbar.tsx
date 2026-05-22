import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronRight, Hexagon, Menu, Wallet } from "lucide-react";
import dashboardAvatar from "@/assets/dashboard-avatar.png";

export function DashboardTopbar() {
  const [openPanel, setOpenPanel] = useState<"arena" | "wallet" | "notifications" | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const togglePanel = (panel: "arena" | "wallet" | "notifications") => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  const handleConnectWallet = () => {
    setIsConnected((current) => !current);
    setOpenPanel("wallet");
  };

  return (
    <header className="z-30 shrink-0 border-b border-white/10 bg-[#03070d]/88 backdrop-blur-xl">
      <div className="relative mx-auto flex min-h-[68px] max-w-[1284px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => togglePanel("arena")}
            className="flex shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-2 font-tech text-[10px] transition hover:bg-white/6 sm:gap-3 sm:text-xs"
          >
            <span className="flex items-center gap-2 text-[#ffc000]">
              <Hexagon className="h-4 w-4" /> $ARENA 1.00
            </span>
            <span className="text-[#00f080]">+4.35%</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => togglePanel("wallet")}
            className="flex h-10 items-center gap-2 rounded-md border border-white/12 bg-white/[0.02] px-2 font-tech text-xs text-white/86 transition hover:bg-white/6 sm:px-3"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{isConnected ? "0x63f6...5eca" : "Wallet"}</span>
            <ChevronRight className="hidden h-3.5 w-3.5 rotate-90 sm:block" />
          </button>
          <Link to="/ai-arena" aria-label="Open AI Arena">
            <img
              src={dashboardAvatar}
              alt="Wallet avatar"
              className="h-9 w-9 rounded-lg border border-[#8b27ff]/40 object-cover transition hover:border-[#b54cff] sm:h-10 sm:w-10"
            />
          </Link>
          <button
            type="button"
            onClick={() => {
              togglePanel("notifications");
              setHasUnreadNotifications(false);
            }}
            className="relative rounded-md p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
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
            className="btn-primary block rounded-md px-3 py-2.5 font-tech text-[10px] sm:px-5 sm:py-3 sm:text-[11px]"
          >
            {isConnected ? "DISCONNECT" : "CONNECT WALLET"}
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"))}
            className="rounded-md p-2 text-white/72 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      {openPanel && (
        <div className="absolute right-4 top-full z-50 w-[calc(100vw-2rem)] max-w-sm rounded-md border border-white/12 bg-[#060b15] p-4 shadow-2xl shadow-black/40 sm:right-6 lg:right-8">
          {openPanel === "arena" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="font-tech text-xs uppercase text-white/55">$Arena Market</span>
                <span className="font-tech text-xs text-[#00f080]">+4.35%</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-2xl font-semibold">$1.00</span>
                <Link to="/leaderboard" className="font-tech text-[10px] text-[#b65cff] hover:text-white">
                  VIEW RANKS
                </Link>
              </div>
            </div>
          )}
          {openPanel === "wallet" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="font-tech text-xs uppercase text-white/55">Wallet</span>
                <span className={`font-tech text-[10px] ${isConnected ? "text-[#00f080]" : "text-white/45"}`}>
                  {isConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              <div className="mt-3 rounded border border-white/10 bg-white/[0.02] p-3 font-tech text-xs">
                {isConnected ? "0x63f6...5eca" : "Connect a wallet to access your arena balance."}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/inventory"
                  className="rounded-md border border-white/10 px-3 py-2 text-center font-tech text-[10px] text-white/76 hover:bg-white/5"
                >
                  INVENTORY
                </Link>
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="rounded-md border border-[#8b29ff]/60 bg-[#46136f]/70 px-3 py-2 font-tech text-[10px] hover:bg-[#5b1b90]"
                >
                  {isConnected ? "DISCONNECT" : "CONNECT"}
                </button>
              </div>
            </div>
          )}
          {openPanel === "notifications" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="font-tech text-xs uppercase text-white/55">Notifications</span>
                <button
                  type="button"
                  onClick={() => setOpenPanel(null)}
                  className="font-tech text-[10px] text-[#b65cff] hover:text-white"
                >
                  CLOSE
                </button>
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <Link to="/ai-arena" className="block rounded border border-white/8 bg-white/[0.02] p-3 hover:bg-white/5">
                  NEXUS-01 battle result is ready.
                </Link>
                <Link to="/ai-arena" className="block rounded border border-white/8 bg-white/[0.02] p-3 hover:bg-white/5">
                  Training slot completed.
                </Link>
                <Link to="/leaderboard" className="block rounded border border-white/8 bg-white/[0.02] p-3 hover:bg-white/5">
                  New achievement progress unlocked.
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
