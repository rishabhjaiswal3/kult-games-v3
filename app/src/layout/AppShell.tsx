import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { cn } from "@/lib/utils";
import {
  Activity, ArrowLeft, BadgeDollarSign, Bot, BriefcaseBusiness, ChevronDown, Copy,
  LayoutDashboard, LogOut, Menu, Plus, Search, ShieldCheck, Store, X,
} from "lucide-react";

const links = [
  { label: "Home", shortLabel: "Home", to: "/", icon: LayoutDashboard, end: true },
  { label: "Marketplace", shortLabel: "Market", to: "/jobs", icon: Store, end: true },
  { label: "Post a job", shortLabel: "Post", to: "/jobs/new", icon: Plus },
  { label: "My agent", shortLabel: "Agent", to: "/agents", icon: Bot },
  { label: "Orders", shortLabel: "Orders", to: "/my-jobs", icon: BriefcaseBusiness },
  { label: "Reputation", shortLabel: "Rep", to: "/reputation", icon: ShieldCheck },
];

const mobileLinks = links.filter((l) => l.to !== "/jobs/new");

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [headerQuery, setHeaderQuery] = useState("");
  const { walletAddress, isAuthenticated, isLoading, login, logout } = useAuth();
  const { data } = useMyArenaAgents();
  const agent = data?.agents?.[0];
  const location = useLocation();
  const navigate = useNavigate();
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : null;

  const goSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = headerQuery.trim();
    navigate(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
    setHeaderQuery("");
    setMobileOpen(false);
  };

  return (
    <div className="agentic-shell min-h-dvh bg-[#090909] text-[#ececec]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.06),transparent_42%)]" />

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
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col border-r border-white/[0.07] bg-[#0b0b0b] transition-transform duration-200 lg:w-[236px] lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/[0.07] px-5 sm:h-16">
          <Link to="/" onClick={() => setMobileOpen(false)} className="font-mono text-[13px] font-semibold tracking-tight">
            KULT<span className="text-[#22d3ee]">//A2A</span>
          </Link>
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded p-1.5 text-white/50 hover:bg-white/5 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 font-mono text-[9px] uppercase tracking-[.22em] text-white/30">Shop · Hire · Earn</p>
          <nav className="mt-3 space-y-0.5">
            {links.map((item) => (
              <NavLink key={item.to} end={item.end} to={item.to} onClick={() => setMobileOpen(false)}>
                {({ isActive }) => (
                  <span
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[12px] transition",
                      isActive
                        ? "bg-white/[0.06] text-[#22d3ee]"
                        : "text-white/50 hover:bg-white/[0.03] hover:text-white/85",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/[0.07] p-4">
          <div className="rounded-md border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
              <p className="font-mono text-[9px] uppercase tracking-[.18em] text-white/40">Base · USDC</p>
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
            <div className="mt-3 flex items-center gap-3 border-t border-white/[0.07] pt-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-white/50">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{agent?.name ?? "No agent yet"}</p>
                <p className="mt-0.5 font-mono text-[9px] text-white/30">
                  {agent ? `${agent.wins ?? 0} wins · ${agent.eloRating ?? 0} ELO` : "Register to sell"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative lg:pl-[236px]">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-white/[0.07] bg-[#090909]/92 px-3 backdrop-blur-xl sm:h-16 sm:gap-3 sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded p-2 text-white/60 hover:bg-white/5 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="font-mono text-[13px] font-semibold tracking-tight lg:hidden">
            KULT<span className="text-[#22d3ee]">//A2A</span>
          </Link>
          <a href="https://app.kult.games" className="hidden items-center gap-2 px-1 font-mono text-[10px] text-white/30 hover:text-white/70 xl:flex">
            <ArrowLeft className="h-3.5 w-3.5" /> kult.games
          </a>
          <form onSubmit={goSearch} className="ml-1 hidden min-w-0 flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 md:flex lg:max-w-md">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/30" />
            <input
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              placeholder="Search the marketplace…"
              className="h-9 w-full bg-transparent font-mono text-[12px] outline-none placeholder:text-white/25"
            />
          </form>
          <p className="agentic-live ml-2 hidden xl:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22d3ee]" />
            live marketplace
          </p>
          <div className="ml-auto" />
          <div className="hidden items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 lg:flex">
            <BadgeDollarSign className="h-3.5 w-3.5 text-[#22d3ee]" />
            <span className="font-mono text-[10px] text-white/60">USDC</span>
          </div>
          <Link to="/jobs/new" className="agentic-primary !px-3 !py-2" aria-label="Post a job">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Post a job</span>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => (isAuthenticated ? setAccountOpen((v) => !v) : login())}
              disabled={isLoading}
              className="flex max-w-[9.5rem] items-center gap-1.5 truncate rounded-md border border-white/10 px-2.5 py-2 font-mono text-[10px] text-white/60 transition hover:border-[#22d3ee]/40 hover:text-white disabled:opacity-50 sm:max-w-none sm:px-3"
            >
              <span className="truncate">
                {isLoading ? "…" : isAuthenticated && shortWallet ? shortWallet : "Connect"}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
            {accountOpen && isAuthenticated ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-44 border border-white/10 bg-[#0b0b0b] py-1">
                <button
                  type="button"
                  onClick={() => { setAccountOpen(false); logout(); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left font-mono text-[10px] text-white/60 hover:bg-white/[.04] hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" /> Disconnect
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main
          key={location.pathname}
          className="agentic-page relative mx-auto min-h-[calc(100dvh-3.5rem)] max-w-[1280px] px-3 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:min-h-[calc(100dvh-4rem)] sm:px-6 sm:py-8 lg:px-8"
        >
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-[#0b0b0b]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-14 max-w-lg items-stretch justify-between">
          {mobileLinks.map((item) => (
            <NavLink key={item.to} end={item.end} to={item.to} className="min-w-0 flex-1">
              {({ isActive }) => (
                <span
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-0.5 px-1 font-mono text-[8px] uppercase tracking-wider transition",
                    isActive ? "text-[#22d3ee]" : "text-white/35",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="max-w-full truncate">{item.shortLabel}</span>
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
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#22d3ee]/80">{eyebrow}</p> : null}
        <h1 className={cn("text-[1.65rem] font-semibold tracking-tight text-white sm:text-3xl", eyebrow ? "mt-2" : "")}>
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-white/45 sm:text-sm">{description}</p>
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
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <Icon className="h-3.5 w-3.5 text-[#22d3ee]" />
        <h2 className="font-mono text-[11px] text-white/70">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
