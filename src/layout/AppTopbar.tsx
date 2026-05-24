import { Link } from "react-router-dom";
import { Bell, Copy, Menu, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppTopbar() {
  const { isAuthenticated, walletAddress, player, logout, login } = useAuth();

  const displayName =
    player?.name?.trim() ||
    (walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Player");

  const copyWalletAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success("Wallet address copied");
    } catch {
      toast.error("Could not copy wallet address");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#03070d]/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link to="/" className="font-tech text-xl font-bold lg:hidden">
            KULT <span className="text-[#9a35ff]">GAMES</span>
          </Link>
          <span className="hidden sm:inline font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
            Browser gaming · AI Arena
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className="flex h-10 items-center gap-2 rounded-md border border-white/12 bg-white/[0.02] px-3 font-tech text-xs text-white/86 transition hover:bg-white/6"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#060b15]">
                {walletAddress ? (
                  <>
                    <div className="px-2 py-2">
                      <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                        <p className="font-tech text-[9px] uppercase tracking-wider text-white/45">Wallet</p>
                        <p className="mt-1 break-all font-mono text-[11px] text-white/82">
                          {walletAddress}
                        </p>
                        <button
                          type="button"
                          onClick={() => void copyWalletAddress()}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 font-tech text-[9px] uppercase tracking-wider text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Wallet
                        </button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard & agents</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ai-arena">AI Arena</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={login}
              className="btn-arena-primary rounded-md px-4 py-2.5 font-tech text-[10px] sm:text-[11px]"
            >
              CONNECT WALLET
            </button>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              className="relative rounded-md p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#8b29ff]" />
            </button>
          ) : null}

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
    </header>
  );
}
