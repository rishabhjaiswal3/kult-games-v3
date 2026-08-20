import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { cn } from "@/lib/utils";
import {
  Activity, ArrowLeft, BadgeDollarSign, Bot, BriefcaseBusiness, ChevronDown, Copy,
  LayoutDashboard, LogOut, Menu, Plus, Search, ShieldCheck, X,
} from "lucide-react";

const links = [
  { label: "Home", to: "/", icon: LayoutDashboard, end: true },
  { label: "Marketplace", to: "/jobs", icon: Search, end: true },
  { label: "Hire Agent", to: "/jobs/new", icon: Plus },
  { label: "My Agent", to: "/agents", icon: Bot },
  { label: "Activity", to: "/my-jobs", icon: BriefcaseBusiness },
  { label: "Reputation", to: "/reputation", icon: ShieldCheck },
];

/** Primary destinations for the mobile bottom bar (keeps Hire in header CTA). */
const mobileLinks = links.filter((l) => l.to !== "/jobs/new");

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { walletAddress, isAuthenticated, isLoading, login, logout } = useAuth();
  const { data } = useMyArenaAgents();
  const agent = data?.agents?.[0];
  const location = useLocation();
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : null;

  return (
    <div className="agentic-shell min-h-dvh bg-[#050807] text-[#f3f8f5]">
      <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:radial-gradient(ellipse_at_top,rgba(34,211,238,0.06),transparent_55%),linear-gradient(rgba(34,211,238,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.03)_1px,transparent_1px)] [background-size:auto,40px_40px,40px_40px]" />

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col border-r border-white/8 bg-[#070b09]/98 backdrop-blur-xl transition-transform duration-200 lg:w-[250px] lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/8 px-5 sm:h-[72px]">
          <Link to="/" onClick={() => setMobileOpen(false)} className="font-tech text-lg font-black tracking-tight">
            KULT<span className="text-[#22d3ee]">//A2A</span>
          </Link>
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">
          <p className="px-3 font-mono text-[9px] uppercase tracking-[.28em] text-white/25">Agent operations</p>
          <nav className="mt-3 space-y-1">
            {links.map((item) => (
              <NavLink key={item.to} end={item.end} to={item.to} onClick={() => setMobileOpen(false)}>
                {({ isActive }) => (
                  <span
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-3 font-tech text-[10px] font-bold uppercase tracking-[.1em] transition",
                      isActive
                        ? "border-[#22d3ee]/25 bg-gradient-to-r from-[#22d3ee]/15 to-transparent text-[#67e8f9] shadow-[inset_3px_0_0_#22d3ee]"
                        : "border-transparent text-white/45 hover:bg-white/[.04] hover:text-white/80",
                    )}
                  >
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-white/[.035]", isActive && "bg-[#22d3ee]/10 text-[#22d3ee]")}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/8 p-4">
          <div className="rounded-xl border border-white/10 bg-white/[.025] p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0052ff]/20 text-[8px] font-bold text-[#8eb4ff]">B</span>
              <p className="font-mono text-[9px] uppercase tracking-[.2em] text-white/45">Base Mainnet</p>
            </div>
            {isAuthenticated && walletAddress ? (
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(walletAddress)}
                className="mt-2 flex w-full items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-white/70 transition hover:text-[#22d3ee]"
                title={walletAddress}
              >
                {shortWallet}
                <Copy className="h-3 w-3 shrink-0 opacity-50" />
              </button>
            ) : (
              <p className="mt-2 font-mono text-[11px] text-white/30">Wallet not connected</p>
            )}
            <div className="mt-3 flex items-center gap-3 border-t border-white/8 pt-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22d3ee]/10 text-[#22d3ee]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{agent?.name ?? "No agent selected"}</p>
                <p className="mt-0.5 text-[9px] text-white/30">
                  {agent ? `${agent.wins ?? 0} wins · ${agent.eloRating ?? 0} ELO` : "Create an agent to begin"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative lg:pl-[250px]">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-white/8 bg-[#050807]/92 px-3 backdrop-blur-xl sm:h-[72px] sm:gap-3 sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-white/60 hover:bg-white/5 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="font-tech text-sm font-black tracking-tight lg:hidden">
            KULT<span className="text-[#22d3ee]">//A2A</span>
          </Link>
          <a href="https://app.kult.games" className="hidden items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-white/30 hover:text-white/70 sm:flex">
            <ArrowLeft className="h-3.5 w-3.5" /> KULT Games
          </a>
          <div className="ml-auto" />
          <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-2 md:flex">
            <BadgeDollarSign className="h-4 w-4 text-white/35" />
            <span className="font-mono text-[10px] text-white/60">USDC</span>
          </div>
          <Link to="/jobs/new" className="agentic-primary !px-3 !py-2 sm:!px-4 sm:!py-2.5" aria-label="Post job">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Post job</span>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => (isAuthenticated ? setAccountOpen((v) => !v) : login())}
              disabled={isLoading}
              className="flex max-w-[9.5rem] items-center gap-1.5 truncate rounded-full border border-white/10 px-2.5 py-2 text-[10px] text-white/60 transition hover:border-[#22d3ee]/40 hover:text-white disabled:opacity-50 sm:max-w-none sm:gap-2 sm:px-3"
            >
              <span className="truncate font-mono">
                {isLoading ? "…" : isAuthenticated && shortWallet ? shortWallet : "Connect"}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
            {accountOpen && isAuthenticated ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-44 border border-white/10 bg-[#070b09] py-1 shadow-[0_18px_50px_rgba(0,0,0,.4)]">
                <button
                  type="button"
                  onClick={() => { setAccountOpen(false); logout(); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-white/60 hover:bg-white/[.04] hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" /> Disconnect
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main
          key={location.pathname}
          className="agentic-page relative mx-auto min-h-[calc(100dvh-3.5rem)] max-w-[1500px] px-3 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:min-h-[calc(100dvh-72px)] sm:px-6 sm:py-7 sm:pb-10 lg:px-8 lg:py-9 lg:pb-9"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070b09]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-14 max-w-lg items-stretch justify-between">
          {mobileLinks.map((item) => (
            <NavLink key={item.to} end={item.end} to={item.to} className="min-w-0 flex-1">
              {({ isActive }) => (
                <span
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-0.5 px-1 font-tech text-[8px] font-bold uppercase tracking-wider transition",
                    isActive ? "text-[#22d3ee]" : "text-white/35",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]")} />
                  <span className="truncate">{item.label.split(" ")[0]}</span>
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function AgenticPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="font-tech text-[9px] font-bold uppercase tracking-[.22em] text-[#67e8f9]">{eyebrow}</p> : null}
        <h1 className={cn("font-tech text-[1.75rem] font-black tracking-tight text-white sm:text-4xl", eyebrow ? "mt-2" : "")}>
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-white/45 sm:text-sm sm:leading-6">{description}</p>
      </div>
      {action ? <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">{action}</div> : null}
    </header>
  );
}

export function AgenticPanel({
  title,
  icon: Icon = Activity,
  children,
  className,
}: {
  title: string;
  icon?: typeof Activity;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("agentic-surface overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/[.018] px-3.5 py-3 sm:px-4 sm:py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22d3ee]/10">
          <Icon className="h-4 w-4 text-[#22d3ee]" />
        </span>
        <h2 className="font-tech text-[10px] font-bold uppercase tracking-[.14em] text-white/80">{title}</h2>
      </div>
      <div className="p-3.5 sm:p-5">{children}</div>
    </section>
  );
}
