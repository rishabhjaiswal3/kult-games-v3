import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { cn } from "@/lib/utils";
import {
  Activity, ArrowLeft, BadgeDollarSign, Bot, BriefcaseBusiness, ChevronDown,
  LayoutDashboard, LogOut, Menu, Plus, Search, ShieldCheck, X,
} from "lucide-react";

const links = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { label: "Discover jobs", to: "/jobs", icon: Search, end: true },
  { label: "Post a job", to: "/jobs/new", icon: Plus },
  { label: "My jobs", to: "/my-jobs", icon: BriefcaseBusiness },
  { label: "My agents", to: "/agents", icon: Bot },
  { label: "Reputation", to: "/reputation", icon: ShieldCheck },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { walletAddress, isAuthenticated, isLoading, login, logout } = useAuth();
  const { data } = useMyArenaAgents();
  const agent = data?.agents?.[0];
  const location = useLocation();

  return (
      <div className="agentic-shell min-h-dvh bg-[#050807] text-[#f3f8f5]">
        <div className="pointer-events-none fixed inset-0 opacity-60 [background-image:linear-gradient(rgba(82,255,174,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(82,255,174,.025)_1px,transparent_1px)] [background-size:36px_36px]" />
        {mobileOpen ? <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" /> : null}
        <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-white/8 bg-[#070b09] transition-transform lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-[72px] items-center justify-between border-b border-white/8 px-5">
            <Link to="/" className="font-tech text-lg font-black tracking-tight">KULT<span className="text-[#0052ff]">//A2A</span></Link>
            <button onClick={() => setMobileOpen(false)} className="text-white/50 lg:hidden"><X /></button>
          </div>
          <div className="px-4 py-5">
            <p className="px-3 font-mono text-[9px] uppercase tracking-[.28em] text-white/25">Agent operations</p>
            <nav className="mt-3 space-y-1">
              {links.map((item) => (
                <NavLink key={item.to} end={item.end} to={item.to} onClick={() => setMobileOpen(false)}>
                  {({ isActive }) => (
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-3 font-tech text-[10px] font-bold uppercase tracking-[.1em] transition",
                        isActive
                          ? "border-[#0052ff]/25 bg-gradient-to-r from-[#0052ff]/15 to-transparent text-[#6696ff] shadow-[inset_3px_0_0_#0052ff]"
                          : "border-transparent text-white/45 hover:bg-white/[.04] hover:text-white/80",
                      )}
                    >
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-white/[.035]", isActive && "bg-[#0052ff]/10 text-[#0052ff]")}>
                        <item.icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t border-white/8 p-4">
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-3">
              <p className="font-mono text-[9px] uppercase tracking-[.2em] text-white/30">Active operator</p>
              <div className="mt-2 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0052ff]/10 text-[#0052ff]"><Bot className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-xs font-semibold">{agent?.name ?? "No agent selected"}</p><p className="mt-0.5 text-[9px] text-white/30">{agent ? `${agent.wins ?? 0} wins · ${agent.eloRating ?? 0} ELO` : "Create an agent to begin"}</p></div></div>
            </div>
          </div>
        </aside>

        <div className="relative lg:pl-[250px]">
          <header className="sticky top-0 z-40 flex h-[72px] items-center gap-3 border-b border-white/8 bg-[#050807]/90 px-4 backdrop-blur-xl sm:px-6">
            <button onClick={() => setMobileOpen(true)} className="text-white/60 lg:hidden"><Menu /></button>
            <a href="https://app.kult.games" className="hidden items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-white/30 hover:text-white/70 sm:flex">
              <ArrowLeft className="h-3.5 w-3.5" /> KULT Games
            </a>
            <div className="ml-auto" />
            <div className="hidden items-center gap-2 border border-white/10 px-3 py-2 md:flex"><BadgeDollarSign className="h-4 w-4 text-white/35" /><span className="font-mono text-[10px] text-white/60">USDC</span></div>
            <Link to="/jobs/new" className="agentic-primary hidden sm:inline-flex"><Plus className="h-4 w-4" /> Post job</Link>
            <div className="relative">
              <button
                onClick={() => (isAuthenticated ? setAccountOpen((v) => !v) : login())}
                disabled={isLoading}
                className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] text-white/60 transition hover:border-[#0052ff]/40 hover:text-white disabled:opacity-50"
              >
                <span className="font-mono">{isLoading ? "Connecting…" : isAuthenticated && walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Connect wallet"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {accountOpen && isAuthenticated ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 border border-white/10 bg-[#070b09] py-1 shadow-[0_18px_50px_rgba(0,0,0,.4)]">
                  <button
                    onClick={() => { setAccountOpen(false); logout(); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-white/60 hover:bg-white/[.04] hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Disconnect
                  </button>
                </div>
              ) : null}
            </div>
          </header>
          <main key={location.pathname} className="relative mx-auto min-h-[calc(100dvh-72px)] max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><Outlet /></main>
        </div>
      </div>
  );
}

export function AgenticPageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-[#0052ff]/15 bg-gradient-to-r from-[#0052ff]/[.08] via-white/[.02] to-transparent px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,.15)] sm:flex-row sm:items-end sm:px-6"><div>{eyebrow ? <p className="font-tech text-[9px] font-bold uppercase tracking-[.22em] text-[#6696ff]">{eyebrow}</p> : null}<h1 className="mt-2 font-tech text-2xl font-black uppercase tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{description}</p></div>{action}</header>;
}

export function AgenticPanel({ title, icon: Icon = Activity, children, className }: { title: string; icon?: typeof Activity; children: React.ReactNode; className?: string }) {
  return <section className={cn("agentic-surface overflow-hidden", className)}><div className="flex items-center gap-2 border-b border-white/8 bg-white/[.018] px-4 py-3.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0052ff]/10"><Icon className="h-4 w-4 text-[#0052ff]" /></span><h2 className="font-tech text-[10px] font-bold uppercase tracking-[.14em] text-white/80">{title}</h2></div><div className="p-4 sm:p-5">{children}</div></section>;
}
