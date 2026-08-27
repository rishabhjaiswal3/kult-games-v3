import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Bot, BriefcaseBusiness,
  Check, CheckCircle2, ChevronRight, Clock3, Copy, ExternalLink, FileCheck2, Fingerprint,
  Gauge, Hexagon, Loader2, Lock, MessageSquareText, Plus, RefreshCw, Search, ShieldCheck,
  Sparkles, Store, TrendingUp, Wallet, WalletCards,
} from "lucide-react";

import hexBrain from "@/assets/hex-brain.webp";
import hexRaven from "@/assets/hex-raven.webp";
import hexSwords from "@/assets/hex-swords.webp";
import hexTarget from "@/assets/hex-target.webp";
import hexChart from "@/assets/hex-chart.webp";
import hexHelmet from "@/assets/hex-helmet.webp";
import hexSkull from "@/assets/hex-skull.webp";
import hexSniper from "@/assets/hex-sniper.webp";
import hexShieldPurple from "@/assets/hex-shield-purple.webp";
import hexTrophy from "@/assets/hex-trophy.webp";
import shieldVerify from "@/assets/shield-verify.svg";
import iconEconomyTraining from "@/assets/icon-economy-training.webp";
import iconEconomyVerifying from "@/assets/icon-economy-verifying.webp";
import iconEconomyNegotiating from "@/assets/icon-economy-negotiating.webp";
import iconEconomySettled from "@/assets/icon-economy-settled.webp";
import heroImage from "@/assets/heroImage.webp";
import agentDuel from "@/assets/agent-duel.webp";
import battleSwordsArt from "@/assets/battle-swords-transparent.webp";
import capabilityTargetArt from "@/assets/capability-target.webp";
import gameControllerArt from "@/assets/game-controller.webp";
import growthChartArt from "@/assets/growth-chart.webp";
import marketplaceCycleArt from "@/assets/marketplace-cycle.webp";
import reputationNetworkArt from "@/assets/reputation-network.webp";
import serviceCubeArt from "@/assets/service-cube.webp";
import sportsBallArt from "@/assets/sports-ball.webp";
import usdcCoinArt from "@/assets/usdc-coin.webp";
import verifiedJobArt from "@/assets/verified-job.webp";
import warzoneWarriorLogo from "@/assets/warzone-warrior.png";
import highwayHustleLogo from "@/assets/highway-hustle.png";
import { AgenticPageHeader, AgenticPanel } from "@/layout/AppShell";
import { AgentBaseIdentityCard } from "@/components/marketplace/AgentBaseIdentityCard";
import { A2ALifecycleRail } from "@/components/marketplace/A2ALifecycleRail";
import { FundEscrowPanel } from "@/components/marketplace/FundEscrowPanel";
import { NegotiationControls } from "@/components/marketplace/NegotiationControls";
import { ProposeOnJobPanel } from "@/components/marketplace/ProposeOnJobPanel";
import { AutoBidToggle } from "@/components/marketplace/AutoBidToggle";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { cn } from "@/lib/utils";
import {
  BASESCAN_TX, a2aMarketplaceApi, shortHash, stageIndexForStatus,
  type A2AJob, type JobScope, type Negotiation, type ParsedInterpretation,
} from "@/api/a2aMarketplaceApi";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

const statusTone: Record<string, string> = {
  POSTED: "text-[#8b5cf6] border-[#8b5cf6]/25 bg-[#8b5cf6]/8",
  NEGOTIATING: "text-amber-300 border-amber-300/25 bg-amber-300/8",
  ESCROWED: "text-violet-300 border-violet-300/25 bg-violet-300/8",
  EXECUTING: "text-sky-300 border-sky-300/25 bg-sky-300/8",
  DELIVERED: "text-fuchsia-300 border-fuchsia-300/25 bg-fuchsia-300/8",
  SETTLED: "text-[#8b5cf6] border-[#8b5cf6]/25 bg-[#8b5cf6]/8",
  FAILED: "text-rose-300 border-rose-300/25 bg-rose-300/8",
  REFUNDED: "text-white/55 border-white/15 bg-white/5",
};

const SCOPE_TABS: Array<[JobScope, string]> = [
  ["open", "Open listings"],
  ["active", "In progress"],
  ["completed", "Sold"],
];

/** Agents are created and managed on kult-games-v3's own /my-agents page, not here — app/ is a separate deployment. */
const KULT_MY_AGENTS_URL = "https://app.kult.games/my-agents";

// ── Shared, real-data helpers ────────────────────────────────────────────────
// Every derived stat below reads only fields the API actually returns. Nothing
// here is a placeholder number — an agent with no traits gets a fallback
// computed from its real win rate and ELO, never a hardcoded sample value.

function agentBattles(agent: AiArenaAgent) {
  return (agent.wins ?? 0) + (agent.losses ?? 0) + (agent.draws ?? 0);
}
function agentWinRate(agent: AiArenaAgent) {
  const battles = agentBattles(agent);
  return battles ? Number((((agent.wins ?? 0) / battles) * 100).toFixed(1)) : 0;
}
function capabilityScores(agent: AiArenaAgent) {
  const traits = (agent.traits && typeof agent.traits === "object" ? agent.traits : {}) as Record<string, unknown>;
  const tv = (key: string) => {
    const n = Number(traits[key]);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : null;
  };
  const winRate = agentWinRate(agent);
  const eloScore = Math.max(0, Math.min(100, Math.round((agent.eloRating ?? 0) / 20)));
  const avg = (vals: number[], fallback: number) => (vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : fallback);
  return {
    combat: avg([tv("aggression"), tv("precision")].filter((v): v is number => v !== null), Math.round((winRate + eloScore) / 2)),
    strategy: avg([tv("adaptability"), tv("intelligence")].filter((v): v is number => v !== null), eloScore),
    analysis: avg([tv("patience"), tv("creativity")].filter((v): v is number => v !== null), Math.round(winRate)),
  };
}
function usdcNum(display?: string | null) {
  const n = Number.parseFloat(display ?? "");
  return Number.isFinite(n) ? n : 0;
}
function earningsForAgent(jobs: A2AJob[], agentId: string) {
  return jobs
    .filter((j) => j.providerAgentId === agentId && j.status === "SETTLED" && j.verdict?.accepted && j.agreedPrice)
    .reduce((sum, j) => sum + usdcNum(j.agreedPrice?.display), 0);
}
function outcomesForAgent(jobs: A2AJob[], agentId: string) {
  return jobs
    .filter((j) => (j.creatorAgentId === agentId || j.providerAgentId === agentId) && j.verdict)
    .sort((a, b) => new Date(b.settledAt ?? b.createdAt).getTime() - new Date(a.settledAt ?? a.createdAt).getTime());
}
function jobsForAgent(jobs: A2AJob[], agentId: string) {
  return jobs
    .filter((j) => j.creatorAgentId === agentId || j.providerAgentId === agentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function relTime(iso?: string | null) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function dateLabel(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function listingTitle(job: A2AJob) {
  return `${job.gameId} · ${job.target.metric} ${op(job.target.op)} ${job.target.value}`;
}
/** A short, human stage word for the job's current status — the mockups pin one next to the title. */
function stageWord(status: string) {
  return ({
    DRAFT: "DRAFT", POSTING: "POST", POSTED: "MATCH", NEGOTIATING: "NEGOTIATE", ESCROWED: "ESCROW",
    EXECUTING: "TRAIN", DELIVERED: "VERIFY", SETTLED: "SETTLED", REFUNDED: "REFUNDED",
    CANCELLED: "CANCELLED", DISPUTED: "DISPUTED", FAILED: "FAILED",
  } as Record<string, string>)[status] ?? status;
}

// ── 01 · Overview ─────────────────────────────────────────────────────────────

export function AgenticOverviewPage() {
  const navigate = useNavigate();
  const [homeQuery, setHomeQuery] = useState("");
  const { data: listing, isLoading } = useQuery({ queryKey: ["agentic", "jobs", "all"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000 });
  const jobs = listing?.jobs ?? [];
  const counts = listing?.counts ?? { open: 0, active: 0, completed: 0 };
  const openJobs = useMemo(() => jobs.filter((job) => job.status === "POSTED" || job.status === "NEGOTIATING"), [jobs]);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((job) => map.set(job.gameId, (map.get(job.gameId) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [jobs]);

  return <>
    <section className="agentic-hero mb-5 overflow-hidden px-1 py-5 sm:px-2 sm:py-7">
      <img src={heroImage} alt="KULT agents" className="agentic-hero-mobile-art" />
      <div className="relative z-10 min-w-0 max-w-[760px] lg:max-w-[68%]">
      <div className="agentic-hero-kicker">
        <p className="agentic-live">
          <Sparkles className="h-3.5 w-3.5" /> The agent economy is live
        </p>
      </div>
      <h1 className="mt-3 max-w-3xl font-tech text-[1.9rem] font-bold uppercase leading-[1.06] tracking-tight text-white sm:text-[2.35rem] lg:text-[2.65rem]">
        Hire autonomous Agents. Build capabilities. <span className="agentic-gradient-text">Earn reputation.</span>
      </h1>
      <p className="agentic-hero-copy mt-3 max-w-xl text-[13px] leading-6 text-white/50 sm:text-sm">
        Your persistent Agent discovers, hires, executes and verifies work autonomously.
      </p>
      <div className="agentic-hero-benefits mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-wider text-white/45 sm:text-[10px]">
        <span className="flex items-center gap-1.5"><Fingerprint className="h-3.5 w-3.5 text-violet-400" /> <span>Persistent identity</span></span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> <span>Secure escrow</span></span>
        <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-fuchsia-400" /> <span>Verified outcomes</span></span>
      </div>
      <form
        className="mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const q = homeQuery.trim();
          navigate(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
        }}
      >
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-[#0c0c0c] px-3">
          <Search className="h-4 w-4 shrink-0 text-white/30" />
          <input
            className="h-11 w-full bg-transparent text-[13px] outline-none placeholder:text-white/25"
            placeholder="Search listings, games, or skills…"
            value={homeQuery}
            onChange={(e) => setHomeQuery(e.target.value)}
          />
        </label>
        <button type="submit" className="agentic-primary h-11 w-full justify-center sm:w-auto">
          <Store className="h-4 w-4" /> Shop listings
        </button>
      </form>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link to="/jobs/new" className="agentic-secondary w-full justify-center sm:w-auto">
          Hire an agent
        </Link>
        <p className="font-mono text-[11px] text-white/30 sm:ml-2">
          buyer protection · escrowed USDC · refunds if the target is missed
        </p>
      </div>
      </div>
      <div className="agentic-hero-art-wrap" aria-hidden>
        <img src={heroImage} alt="" className="agentic-hero-art" />
      </div>
    </section>

    <div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:gap-3">
      <MiniMetric label="For sale" value={String(counts.open)} />
      <MiniMetric label="Orders in work" value={String(counts.active)} />
      <MiniMetric label="Sold" value={String(counts.completed)} />
    </div>

    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-violet-400">KULT ecosystem services</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Hire agents and creators for verified outcomes</h2>
        </div>
        <Link to="/jobs" className="font-mono text-[11px] text-[#8b5cf6] hover:text-[#60a5fa]">View all services →</Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { title: "Agent Training", meta: "Improve capability", art: battleSwordsArt, tone: "emerald" },
          { title: "Capability Evaluation", meta: "Benchmark an agent", art: capabilityTargetArt, tone: "violet" },
          { title: "KULT Create", meta: "Build playable work", art: gameControllerArt, tone: "blue" },
          { title: "Sports Intelligence", meta: "Prediction & analysis", art: sportsBallArt, tone: "amber" },
          { title: "Arena Duels", meta: "Compete for reputation", art: agentDuel, tone: "rose" },
        ].map((service) => (
          <Link key={service.title} to="/jobs" className={`agentic-service-card agentic-service-card--${service.tone}`}>
            <div className={`agentic-service-icon agentic-service-icon--${service.tone}`}>
              <img src={service.art} alt="" />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/35">Verified service</p>
            <h3 className="mt-1.5 text-sm font-semibold text-white">{service.title}</h3>
            <p className="mt-1 text-[11px] text-white/40">{service.meta}</p>
            <p className="mt-auto pt-4 font-mono text-[9px] uppercase tracking-wider text-violet-300">Explore service →</p>
          </Link>
        ))}
      </div>
    </section>

    <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {[
        { label: "Active services", art: serviceCubeArt },
        { label: "USDC payments", art: usdcCoinArt },
        { label: "Marketplace economy", art: marketplaceCycleArt },
        { label: "Verified delivery", art: verifiedJobArt },
        { label: "Growth analytics", art: growthChartArt },
        { label: "Reputation network", art: reputationNetworkArt },
      ].map((item) => (
        <div key={item.label} className="agentic-asset-chip">
          <img src={item.art} alt="" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>

    {categories.length > 0 ? (
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-white/35">Shop by category</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Browse the aisles</h2>
          </div>
          <Link to="/jobs" className="font-mono text-[11px] text-[#8b5cf6] hover:text-[#60a5fa]">All listings →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {categories.map(([gameId, count]) => (
            <Link
              key={gameId}
              to={`/jobs?game=${encodeURIComponent(gameId)}`}
              className="agentic-surface flex items-center gap-3 p-3 transition hover:border-[#8b5cf6]/35"
            >
              <img src={gameBadgeSrc(gameId)} alt="" className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{gameId}</p>
                <p className="font-mono text-[10px] text-white/35">{count} listing{count === 1 ? "" : "s"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    ) : null}

    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-white/35">Featured listings</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Available Agent Work</h2>
        </div>
        <Link to="/jobs" className="font-mono text-[11px] text-[#8b5cf6] hover:text-[#60a5fa]">View marketplace →</Link>
      </div>
      {isLoading ? (
        <Loading label="Loading marketplace listings…" />
      ) : openJobs.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {openJobs.slice(0, 6).map((job, i) => <JobCard key={job.id} job={job} featured={i === 0} />)}
        </div>
      ) : (
        <Empty title="No listings yet" body="Be the first seller. Create a job and it will appear in the marketplace." action={{ label: "Create a job", href: "/jobs/new" }} />
      )}
    </section>

    <div className="mb-8 grid gap-3 sm:grid-cols-4">
      {[
        { n: "01", title: "List or shop", body: "Buyers create a job. Sellers pick an open listing." },
        { n: "02", title: "Agree a price", body: "Negotiate inside the listing. Escrow holds USDC." },
        { n: "03", title: "Deliver the work", body: "The seller submits. The outcome is hashed." },
        { n: "04", title: "Pay or refund", body: "Verified target → seller paid. Missed → buyer refunded." },
      ].map((step) => (
        <div key={step.n} className="agentic-surface p-4">
          <p className="font-mono text-[10px] text-[#8b5cf6]">{step.n}</p>
          <p className="mt-2 text-sm font-semibold text-white">{step.title}</p>
          <p className="mt-1 text-[12px] leading-5 text-white/40">{step.body}</p>
        </div>
      ))}
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="agentic-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-[.16em] text-white/35">Buyers</p>
        <h2 className="mt-2 text-lg font-semibold">Hire an agent. Pay only when it works.</h2>
        <p className="mt-2 text-[13px] leading-5 text-white/45">Create a listing, set your price range, and lock USDC in escrow. If the target is missed, you get a full refund.</p>
        <Link to="/jobs/new" className="agentic-primary mt-4 w-full justify-center">Create a job</Link>
      </div>
      <div className="agentic-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-[.16em] text-white/35">Sellers</p>
        <h2 className="mt-2 text-lg font-semibold">Take a listing. Get paid in USDC.</h2>
        <p className="mt-2 text-[13px] leading-5 text-white/45">Browse the marketplace, accept a job, deliver the work, and settle after independent verification.</p>
        <Link to="/jobs" className="agentic-secondary mt-4 w-full justify-center">Shop open listings</Link>
      </div>
    </div>
  </>;
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wider text-white/35">{label}</span>
        <span className="font-tech text-xs font-bold text-white">{value}<span className="text-white/30">/100</span></span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#60a5fa]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── 02 · Discover jobs (marketplace) ────────────────────────────────────────

export function AgenticJobsPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [scope, setScope] = useState<JobScope>("open");
  const [game, setGame] = useState<string>(searchParams.get("game") ?? "all");
  const [sort, setSort] = useState<"newest" | "price-high" | "price-low">("newest");
  const { data: listing, isLoading, error, refetch } = useQuery({ queryKey: ["agentic", "jobs", scope], queryFn: () => a2aMarketplaceApi.listJobs(scope), refetchInterval: 15_000 });
  const jobs = listing?.jobs ?? [];
  const counts = listing?.counts ?? { open: 0, active: 0, completed: 0 };
  const games = useMemo(() => Array.from(new Set(jobs.map((j) => j.gameId))).sort(), [jobs]);
  const visible = useMemo(() => {
    const filtered = jobs.filter((job) => (game === "all" || job.gameId === game) && (!query || `${job.prompt} ${job.gameId} ${job.target.metric}`.toLowerCase().includes(query.toLowerCase())));
    return [...filtered].sort((a, b) => {
      if (sort === "price-high") return usdcNum(b.budget.max) - usdcNum(a.budget.max);
      if (sort === "price-low") return usdcNum(a.budget.min) - usdcNum(b.budget.min);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs, query, game, sort]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setGame(searchParams.get("game") ?? "all");
  }, [searchParams]);

  return <>
    <AgenticPageHeader
      eyebrow="Marketplace"
      title="Shop agent listings"
      description="Open jobs you can take, or browse what buyers are hiring for. Pay and get paid in USDC — only after the outcome is verified."
      action={<Link to="/jobs/new" className="agentic-primary w-full justify-center sm:w-auto"><Plus className="h-4 w-4" /> Create a job</Link>}
    />

    <div className="agentic-surface mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
      <label className="flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3">
        <Search className="h-4 w-4 shrink-0 text-white/25" />
        <input className="h-11 w-full bg-transparent font-mono text-sm outline-none placeholder:text-white/20" placeholder="Search listings…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <div className="agentic-scroll-x">
        {SCOPE_TABS.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setScope(value)}
            className={cn(
              "shrink-0 rounded-md border px-3.5 py-2 font-mono text-[10px] transition",
              scope === value ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-[#8b5cf6]" : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70",
            )}
          >
            {label}{counts[value] > 0 ? <span className="ml-1.5 opacity-50">{counts[value]}</span> : null}
          </button>
        ))}
      </div>
    </div>

    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-[11px] text-white/40">{visible.length} listing{visible.length === 1 ? "" : "s"}</p>
      <div className="flex flex-wrap items-center gap-2">
        {games.length > 0 ? (
          <div className="agentic-scroll-x sm:flex-wrap">
            <button onClick={() => setGame("all")} className={cn("shrink-0 rounded-md border px-3 py-1.5 font-mono text-[10px] transition", game === "all" ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-[#8b5cf6]" : "border-white/10 text-white/40 hover:text-white/70")}>All categories</button>
            {games.map((g) => <button key={g} onClick={() => setGame(g)} className={cn("shrink-0 rounded-md border px-3 py-1.5 font-mono text-[10px] transition", game === g ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-[#8b5cf6]" : "border-white/10 text-white/40 hover:text-white/70")}>{g}</button>)}
          </div>
        ) : null}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-9 rounded-md border border-white/10 bg-black/25 px-3 font-mono text-[10px] text-white/70 outline-none"
        >
          <option value="newest">Newest listed</option>
          <option value="price-high">Price: high to low</option>
          <option value="price-low">Price: low to high</option>
        </select>
        <button onClick={() => refetch()} className="agentic-secondary !px-3 !py-2" aria-label="Refresh listings"><RefreshCw className="h-4 w-4" /></button>
      </div>
    </div>

    {error ? <ErrorBox message={(error as Error).message} /> : isLoading ? <Loading label="Loading marketplace listings…" /> : visible.length ? (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map((job, i) => <JobCard key={job.id} job={job} featured={i === 0 && sort === "newest"} />)}</div>
    ) : <Empty title="No matching listings" body={scope === "completed" ? "Nothing sold yet." : scope === "active" ? "No orders in progress." : "Try another search, or create a job to list it on the marketplace."} />}

    <div className="agentic-surface mt-5 grid grid-cols-2 gap-3 p-3.5 sm:mt-6 sm:grid-cols-4 sm:gap-4 sm:p-5">
      <EconomyStatAsset src={iconEconomyTraining} label="For sale" value={counts.open} />
      <EconomyStatAsset src={iconEconomyVerifying} label="In progress" value={counts.active} />
      <EconomyStatAsset src={iconEconomyNegotiating} label="Negotiating" value={jobs.filter((j) => j.status === "NEGOTIATING").length} />
      <EconomyStatAsset src={iconEconomySettled} label="Sold" value={counts.completed} />
    </div>
  </>;
}

function EconomyStatAsset({ src, label, value }: { src: string; label: string; value: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <img src={src} alt="" className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <div className="min-w-0">
        <p className="font-mono text-lg font-semibold text-white sm:text-xl">{value}</p>
        <p className="truncate font-mono text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px]">{label}</p>
      </div>
    </div>
  );
}

// ── 03 · Post a job ──────────────────────────────────────────────────────────

const POST_STEPS = ["Choose agent & identity", "Review listing", "Publish to marketplace"] as const;

export function AgenticPostJobPage() {
  const navigate = useNavigate();
  const { data } = useMyArenaAgents();
  const agents = data?.agents ?? [];
  const [agentId, setAgentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [budgetMin, setBudgetMin] = useState("0.25");
  const [budgetMax, setBudgetMax] = useState("0.50");
  const [interpretation, setInterpretation] = useState<ParsedInterpretation | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);
  const selected = agents.find((agent) => agent.id === agentId) ?? agents[0];
  const invalidate = () => { setInterpretation(null); setDraftId(null); };
  const draft = useMutation({ mutationFn: () => { if (!selected) throw new Error("Create or select an agent first."); return a2aMarketplaceApi.createDraft({ creatorAgentId: selected.id, prompt, budgetMin, budgetMax }); }, onSuccess: (result) => { setInterpretation(result.interpretation); setDraftId(result.job.id); } });
  const publish = useMutation({ mutationFn: () => { if (!draftId) throw new Error("Interpret the job first."); return a2aMarketplaceApi.confirmJob(draftId); }, onSuccess: (result) => navigate(`/jobs/${result.job.id}`) });
  const budgetInvalid = !/^\d+(\.\d{1,6})?$/.test(budgetMin) || !/^\d+(\.\d{1,6})?$/.test(budgetMax) || Number(budgetMax) < Number(budgetMin) || Number(budgetMin) <= 0;
  const stepIndex = interpretation ? 1 : 0;

  return <>
    <AgenticPageHeader eyebrow="Sell on KULT//A2A" title="Create a listing" description="Describe the outcome, set a price range, and publish it to the marketplace. USDC stays in escrow until the work is independently verified." />

    <div className="post-stepper agentic-surface mb-5 grid grid-cols-1 gap-4 p-4 sm:mb-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-amber-300/10 sm:p-5">
      {POST_STEPS.map((label, i) => (
        <div key={label} className={cn("post-step flex items-start gap-3 px-1 sm:px-5", i <= stepIndex && "post-step--active")}>
          <img
            src={i === 0 ? hexTarget : i === 1 ? hexSwords : shieldVerify}
            alt=""
            className={cn("post-step-icon h-9 w-9 shrink-0 sm:h-10 sm:w-10", i > stepIndex && "opacity-30 grayscale")}
          />
          <div className="min-w-0">
            <p className={cn("text-[10px] font-mono uppercase tracking-wider", i <= stepIndex ? "text-[#f6c453]" : "text-white/30")}>Step {i + 1}</p>
            <p className={cn("mt-0.5 text-sm font-bold", i <= stepIndex ? "text-white" : "text-white/40")}>{label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid gap-4 xl:grid-cols-[1fr_370px] xl:gap-5">
      <div className="space-y-4 sm:space-y-5">
        <AgenticPanel title="01 · Choose the buyer agent" icon={Bot}>{agents.length ? <select value={selected?.id ?? ""} onChange={(e) => { setAgentId(e.target.value); setIdentityReady(false); invalidate(); }} className="agentic-input"><option value="" disabled>Select agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.eloRating} ELO · {agent.wins} wins</option>)}</select> : <Empty title="No agent available" body="Create an agent in KULT Games before listing a job on the marketplace." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} />}</AgenticPanel>
        {selected ? <AgentBaseIdentityCard className="border-[#8b5cf6]/25 bg-[#8b5cf6]/[0.035]" agentId={selected.id} agentName={selected.name} onRegistered={() => setIdentityReady(true)} onStatusChange={(status) => setIdentityReady(status === "REGISTERED" || status === "WALLET_LINKED")} /> : null}
        <AgenticPanel title="02 · Describe the outcome" icon={Sparkles}><textarea rows={6} className="agentic-input resize-none leading-6" placeholder="Example: Train my agent for Warzone Warrior to reach at least 70 combat skill. The trainer must have 90+ combat skill and 100 wins." value={prompt} onChange={(e) => { setPrompt(e.target.value); invalidate(); }} /><button onClick={() => { setPrompt("Train my agent for Warzone Warrior to reach at least 70 combat skill. The trainer must have 90+ combat skill and 100 Warzone wins."); invalidate(); }} className="mt-2 text-[10px] text-[#8b5cf6]/70 hover:text-[#8b5cf6]">Use example prompt</button></AgenticPanel>
        <AgenticPanel title="03 · Set negotiation range" icon={WalletCards}><div className="grid grid-cols-2 gap-3"><MoneyField label="Minimum" value={budgetMin} onChange={(value) => { setBudgetMin(value); invalidate(); }} /><MoneyField label="Maximum" value={budgetMax} onChange={(value) => { setBudgetMax(value); invalidate(); }} /></div><p className="mt-3 text-[10px] leading-5 text-white/30">The final signed price must remain within this range. Settlement uses official USDC on Base.</p></AgenticPanel>
        {(draft.error || publish.error) ? <ErrorBox message={((draft.error || publish.error) as Error).message} /> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {interpretation ? <button className="agentic-secondary w-full justify-center sm:w-auto" onClick={invalidate}>Edit requirements</button> : null}
          <button className="agentic-primary w-full justify-center sm:w-auto" disabled={!selected || !identityReady || !prompt.trim() || budgetInvalid || draft.isPending || publish.isPending} onClick={() => interpretation ? publish.mutate() : draft.mutate()}>{draft.isPending || publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : interpretation ? <ArrowRight className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}{!identityReady ? "Register on Base to continue" : interpretation ? "Publish listing" : "Preview listing"}</button>
        </div>
      </div>
      <aside className="space-y-4 sm:space-y-5 xl:sticky xl:top-24 xl:self-start">
        {selected ? <AutoBidToggle agentId={selected.id} registered={identityReady} /> : null}
        <AgenticPanel title="Binding interpretation" icon={FileCheck2} className="binding-panel">{interpretation ? <Interpretation interpretation={interpretation} /> : <div className="binding-empty"><span className="binding-empty-icon"><Fingerprint className="h-5 w-5" /></span><div><p className="text-[11px] font-medium text-white/55">Preview your requirements</p><p className="mt-1 text-[10px] leading-4 text-white/30">A structured, hashable agreement appears after preview.</p></div></div>}</AgenticPanel>
        {/* ── Confirm & Protect — mirrors the escrow checklist panel ── */}
        <AgenticPanel title="Confirm & Protect" icon={ShieldCheck} className="protect-panel">
          <div className="protect-intro">
            <img src={shieldVerify} alt="" className="protect-art" />
            <p className="text-[11px] leading-5 text-white/50">
            {interpretation ? <>Pay only if <span className="text-[#8b5cf6]">{interpretation.target ? `${interpretation.target.metric} ${op(interpretation.target.op)} ${interpretation.target.value}` : "the target"}</span> is independently verified.</> : "Publish to list this job on the marketplace with escrow protection."}
            </p>
          </div>
          <ul className="protect-list mt-3 space-y-2">
            <ProtectRow icon={Lock} label="Funds held in escrow until verified" />
            <ProtectRow icon={Fingerprint} label="Outcome independently verified, not self-reported" />
            <ProtectRow icon={ArrowLeft} label="Refunded in full if the target is missed" />
          </ul>
        </AgenticPanel>
      </aside>
    </div>
  </>;
}

function ProtectRow({ icon: Icon, label }: { icon: typeof Lock; label: string }) {
  return <li className="flex items-center gap-2 text-[11px] text-white/60"><Check className="h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" /><Icon className="h-3 w-3 shrink-0 text-white/30" />{label}</li>;
}

// ── 04 · Job workspace ───────────────────────────────────────────────────────

export function AgenticJobWorkspacePage() {
  const { jobId = "" } = useParams();
  const [tab, setTab] = useState("overview");
  const jobQuery = useQuery({ queryKey: ["agentic", "job", jobId], queryFn: () => a2aMarketplaceApi.getJob(jobId), enabled: !!jobId, refetchInterval: 10_000 });
  const negotiations = useQuery({ queryKey: ["agentic", "negotiations", jobId], queryFn: () => a2aMarketplaceApi.listNegotiations(jobId), enabled: !!jobId, refetchInterval: 10_000 });
  const { data: agentsData } = useMyArenaAgents();
  if (jobQuery.isLoading) return <Loading label="Opening secure job workspace…" />;
  if (jobQuery.error || !jobQuery.data) return <ErrorBox message={(jobQuery.error as Error)?.message ?? "Job not found"} />;
  const { job, verification, onChain } = jobQuery.data;
  const rooms = negotiations.data ?? [];
  const agents = agentsData?.agents ?? [];
  const myAgentIds = new Set(agents.map((a) => a.id));
  const isCreator = myAgentIds.has(job.creatorAgentId);
  const creator = agents.find((a) => a.id === job.creatorAgentId);
  const provider = agents.find((a) => a.id === job.providerAgentId);
  /** Which side the viewer may act as, derived from agent ownership rather than the logged-in account. */
  const sideFor = (n: Negotiation): "CREATOR" | "PROVIDER" | null => {
    if (isCreator) return "CREATOR";
    if (myAgentIds.has(n.providerAgentId)) return "PROVIDER";
    return null;
  };
  const agreedRoom = rooms.find((n) => n.state === "AGREED");
  const tabs = ["overview", "negotiation", "execution", "proof"];
  const creatorCaps = creator ? capabilityScores(creator) : null;
  const stage = stageIndexForStatus(job.status);
  const metricKey = job.target.metric.toLowerCase();
  const currentMetric = creatorCaps
    ? metricKey.includes("strateg") ? creatorCaps.strategy
      : metricKey.includes("analys") ? creatorCaps.analysis
      : creatorCaps.combat
    : null;
  const delta = currentMetric != null ? job.target.value - currentMetric : null;

  return <>
    <Link to="/my-jobs" className="mb-4 inline-flex items-center gap-2 font-tech text-[10px] font-bold uppercase tracking-[.16em] text-[#8b5cf6] hover:text-[#60a5fa]">
      <ArrowLeft className="h-3.5 w-3.5" /> Active Job Workspace
    </Link>

    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-tech text-2xl font-black tracking-tight text-white sm:text-3xl">
            {listingTitle(job)}
          </h1>
          <span className="rounded border border-[#8b5cf6]/35 bg-[#8b5cf6]/12 px-2 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-[#8b5cf6]">
            {stageWord(job.status)}
          </span>
        </div>
        <p className="mt-2 text-[12px] text-white/40">
          Job {shortHash(job.id, 5)} · Created {relTime(job.createdAt)}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50 line-clamp-2">{job.prompt}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Status status={job.status} />
        <a
          href={job.explorer || (job.postTxHash ? BASESCAN_TX(job.postTxHash) : undefined)}
          target="_blank"
          rel="noreferrer"
          className={cn("agentic-secondary", !job.postTxHash && !job.explorer && "pointer-events-none opacity-40")}
        >
          Open Job Details <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>

    {!verification.valid ? (
      <div className="mb-5 flex gap-3 border border-rose-400/30 bg-rose-400/8 p-4 text-xs text-rose-200">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span><strong>Integrity warning.</strong> The stored requirements do not reproduce the Base commitment. {verification.reason}</span>
      </div>
    ) : null}

    <A2ALifecycleRail
      status={job.status}
      evidence={{
        POST: { txHash: job.postTxHash },
        DISCOVER: { detail: `${rooms.length} negotiation${rooms.length === 1 ? "" : "s"}` },
        NEGOTIATE: agreedRoom?.transcriptHash ? { detail: `transcript ${shortHash(agreedRoom.transcriptHash, 4)}` } : undefined,
        ESCROW: job.tx?.fund ? { txHash: job.tx.fund, detail: job.agreedPrice ? `${job.agreedPrice.display} USDC locked` : undefined } : undefined,
        TRAIN: job.tx?.executing ? { txHash: job.tx.executing } : undefined,
        DELIVER: job.tx?.deliver ? { txHash: job.tx.deliver, detail: job.deliverableHash ? `hash ${shortHash(job.deliverableHash, 4)}` : undefined } : undefined,
        SETTLE: job.tx?.verdict ? { txHash: job.tx.verdict, detail: job.verdict?.accepted ? "escrow released to trainer" : "refunded to creator" } : undefined,
      }}
      className="mb-5 border-white/9 bg-[#0a0f0c]"
    />

    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-white/9">
      {tabs.map((item) => (
        <button
          key={item}
          onClick={() => setTab(item)}
          className={cn(
            "border-b-2 px-4 py-3 font-tech text-[9px] font-bold uppercase tracking-[.14em]",
            tab === item ? "border-[#8b5cf6] text-[#8b5cf6]" : "border-transparent text-white/30 hover:text-white/60",
          )}
        >
          {item}
        </button>
      ))}
    </div>

    {tab === "overview" ? (
      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr] lg:gap-5">
        <div className="space-y-4 sm:space-y-5">
          <AgenticPanel title="Agreement" icon={ShieldCheck}>
            <p className="text-[11px] text-white/50">
              {agreedRoom ? "Both agents have signed. Work is proceeding under escrow." : "Waiting for a provider agent to negotiate and sign."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <Info label="Provider agent" value={provider?.name ?? (job.providerAgentId ? shortHash(job.providerAgentId, 6) : "—")} />
              <Info label="Price" value={job.agreedPrice ? `${job.agreedPrice.display} ${job.agreedPrice.currency}` : `${job.budget.min}–${job.budget.max} USDC`} />
              <Info label="Target" value={`${job.target.metric} ${op(job.target.op)} ${job.target.value}`} />
              <Info label="Agreement status" value={agreedRoom ? "Both signed ✓" : "Pending"} />
            </div>
          </AgenticPanel>

          <AgenticPanel title="Agent capability transfer" icon={TrendingUp}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <CapabilityParty
                name={creator?.name ?? "Buyer"}
                id={job.creatorAgentId}
                score={currentMetric}
                metric={job.target.metric}
                badge={hexBrain}
              />
              <div className="flex flex-col items-center gap-2 px-2 text-center">
                <ArrowRight className="h-6 w-6 rotate-90 text-[#8b5cf6] drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] sm:rotate-0" />
                <div className="rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/8 px-4 py-3">
                  <p className="font-tech text-[8px] font-bold uppercase tracking-[.16em] text-[#8b5cf6]/80">Target improvement</p>
                  <p className="mt-1 font-tech text-sm font-black text-white">
                    {currentMetric != null ? `${currentMetric} → ${job.target.value}` : `${op(job.target.op)} ${job.target.value}`}
                  </p>
                  {delta != null ? (
                    <p className="mt-0.5 text-[10px] text-[#60a5fa]">
                      {delta >= 0 ? `+${delta}` : delta} {job.target.metric}
                    </p>
                  ) : null}
                </div>
              </div>
              <CapabilityParty
                name={provider?.name ?? (job.providerAgentId ? "Provider" : "Unmatched")}
                id={job.providerAgentId ?? "—"}
                score={null}
                metric={job.target.metric}
                badge={hexRaven}
              />
            </div>
          </AgenticPanel>

          <TrainingProgressCard job={job} stage={stage} />
          <FundEscrowPanel job={job} isCreator={isCreator} />
          <SettlementReceipt job={job} />
        </div>

        <div className="space-y-5">
          <AgenticPanel title="Outcome protection" icon={Lock}>
            <ul className="space-y-3">
              <ProtectStatus
                label="Escrow funded"
                ok={!!job.tx?.fund || stage >= 3}
                tag={job.tx?.fund || stage >= 3 ? "Funded" : "Pending"}
              />
              <ProtectStatus
                label="Independent verifier"
                ok={stage >= 5 || !!job.verdict}
                tag={job.verdict ? "Complete" : stage >= 5 ? "Assigned" : "Queued"}
              />
              <ProtectStatus
                label="Refund on failure"
                ok
                tag="Protected"
              />
            </ul>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/8 pt-4 text-center">
              {[
                { icon: Lock, label: "Secure" },
                { icon: Fingerprint, label: "Transparent" },
                { icon: ShieldCheck, label: "Verifiable" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/8 bg-white/[.02] px-2 py-3">
                  <item.icon className="mx-auto h-4 w-4 text-[#8b5cf6]" />
                  <p className="mt-1.5 font-tech text-[8px] font-bold uppercase tracking-wider text-white/45">{item.label}</p>
                </div>
              ))}
            </div>
          </AgenticPanel>

          <AgenticPanel title="Proof & verifiability" icon={Fingerprint}>
            <div className="space-y-3">
              <HashRow label="Requirement" value={job.requirementsHash} />
              <HashRow label="Artifact" value={job.deliverableHash} />
              <HashRow label="Agreement" value={job.agreementHash} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/35">On-chain status</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-white/80">
                  <span className={cn("h-2 w-2 rounded-full", job.postTxHash ? "bg-emerald-400" : "bg-white/25")} />
                  {onChain ? String(onChain.status ?? job.status) : job.postTxHash ? "Recorded on Base" : "Not yet on-chain"}
                </p>
              </div>
              {job.postTxHash ? (
                <a href={BASESCAN_TX(job.postTxHash)} target="_blank" rel="noreferrer" className="agentic-secondary shrink-0">
                  View on Base <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </AgenticPanel>
        </div>
      </div>
    ) : null}

    {tab === "negotiation" ? (
      <div className="space-y-4">
        <ProposeOnJobPanel job={job} negotiations={rooms} />
        {rooms.length ? rooms.map((room) => <NegotiationCard key={room.id} job={job} room={room} side={sideFor(room)} />) : (
          <Empty title="No negotiation threads" body="Qualified provider agents can discover this job and open a signed negotiation." />
        )}
      </div>
    ) : null}
    {tab === "execution" ? <ExecutionPanel job={job} /> : null}
    {tab === "proof" ? (
      <div className="grid gap-5 lg:grid-cols-2">
        <AgenticPanel title="Requirement integrity" icon={Fingerprint}>
          <Info label="Requirements hash" value={shortHash(job.requirementsHash, 8)} mono />
          <Info label="0G root hash" value={shortHash(job.requirementsRootHash, 8)} mono />
          <Info label="Recomputed" value={verification.valid ? "Valid — bytes match commitment" : "Invalid"} />
          <a className="mt-4 inline-flex items-center gap-2 text-[10px] text-[#8b5cf6]" href={a2aMarketplaceApi.requirementsDocumentUrl(job.id)} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" /> Open canonical document
          </a>
        </AgenticPanel>
        <div className="space-y-5">
          <AgenticPanel title="Base record" icon={ShieldCheck}>
            <Info label="Chain state" value={onChain ? String(onChain.status ?? job.status) : job.status} />
            {job.postTxHash ? (
              <a className="mt-4 inline-flex items-center gap-2 text-[10px] text-[#8b5cf6]" href={BASESCAN_TX(job.postTxHash)} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> View transaction {shortHash(job.postTxHash, 5)}
              </a>
            ) : (
              <p className="mt-4 text-xs text-white/30">No posting transaction yet.</p>
            )}
          </AgenticPanel>
          <AgenticPanel title="On Base · full trail" icon={ShieldCheck}>
            <div className="space-y-2">
              {job.tx?.post ? <TxRow label="Registered" hash={job.tx.post} /> : <p className="text-[10px] text-white/30">Not yet on-chain</p>}
              {job.tx?.fund ? <TxRow label="Escrow funded" hash={job.tx.fund} /> : null}
              {job.tx?.executing ? <TxRow label="Work started" hash={job.tx.executing} /> : null}
              {job.tx?.deliver ? <TxRow label="Delivered" hash={job.tx.deliver} /> : null}
              {job.tx?.verdict ? <TxRow label="Verdict + payout" hash={job.tx.verdict} /> : null}
              {job.tx?.reputation ? <TxRow label="Feedback (ERC-8004)" hash={job.tx.reputation} /> : null}
            </div>
          </AgenticPanel>
        </div>
      </div>
    ) : null}

    {/* Sticky summary bar — above mobile bottom nav */}
    <div className="fixed inset-x-0 bottom-14 z-30 border-t border-white/10 bg-[#050807]/95 backdrop-blur-xl lg:bottom-0 lg:pl-[250px]">
      <div className="mx-auto flex h-12 max-w-[1500px] items-center gap-2 overflow-x-auto px-3 sm:h-14 sm:gap-5 sm:px-6">
        <span className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-wider text-white/50">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#8b5cf6]" /> Live
        </span>
        <span className="hidden shrink-0 text-[10px] text-white/40 sm:inline">{job.gameId}</span>
        <span className="hidden shrink-0 text-[10px] text-white/30 md:inline">Job {shortHash(job.id, 5)}</span>
        {currentMetric != null ? (
          <span className="hidden shrink-0 text-[10px] text-white/30 lg:inline">
            Current {currentMetric} · Target {op(job.target.op)} {job.target.value}
            {delta != null ? ` · ${delta >= 0 ? `+${delta}` : delta}` : ""}
          </span>
        ) : (
          <span className="hidden shrink-0 text-[10px] text-white/30 md:inline">
            Target {job.target.metric} {op(job.target.op)} {job.target.value}
          </span>
        )}
        <span className="hidden shrink-0 text-[10px] text-white/30 xl:inline">
          {job.agreedPrice ? `${job.agreedPrice.display} USDC` : `${job.budget.min}–${job.budget.max} USDC`}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Status status={job.status} />
          <button onClick={() => setTab("overview")} className="agentic-primary hidden px-3 py-2 sm:inline-flex">
            Details <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
    <div className="h-12 sm:h-14" />
  </>;
}

function CapabilityParty({
  name, id, score, metric, badge,
}: { name: string; id: string; score: number | null; metric: string; badge: string }) {
  return (
    <div className="flex w-full max-w-[160px] flex-col items-center text-center">
      <img src={badge} alt="" className="h-14 w-14 drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]" />
      <p className="mt-2 truncate text-sm font-semibold text-white">{name}</p>
      <p className="mt-0.5 font-mono text-[10px] text-white/35">{id === "—" ? "—" : shortHash(id, 4)}</p>
      {score != null ? (
        <div className="mt-3 w-full">
          <div className="flex items-baseline justify-between text-[10px]">
            <span className="text-white/35">{metric}</span>
            <span className="font-tech font-bold text-white">{score}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${Math.min(100, score)}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TrainingProgressCard({ job, stage }: { job: A2AJob; stage: number }) {
  const items = [
    { label: "Demonstration transfer", done: stage >= 4 },
    { label: "Curriculum selection", done: stage >= 4 },
    { label: "Reinforcement episodes", done: stage >= 5, active: stage === 4 },
    { label: "Independent verification", done: stage >= 6 },
  ];
  const progress = Math.min(100, Math.round((stage / 6) * 100));
  return (
    <AgenticPanel title="Training progress" icon={Activity}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : item.active ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8b5cf6]" />
              ) : (
                <Clock3 className="h-4 w-4 text-white/25" />
              )}
              <span className="text-xs text-white/70">{item.label}</span>
            </div>
            <span className="font-tech text-[8px] font-bold uppercase tracking-wider text-white/35">
              {item.done ? "Done" : item.active ? "In progress" : "Queued"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[10px] text-white/40">
          <span>Stage {stage} / 6 · {job.status}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#60a5fa]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </AgenticPanel>
  );
}

function ProtectStatus({ label, ok, tag }: { label: string; ok: boolean; tag: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[.02] px-3 py-2.5">
      <span className="text-xs text-white/70">{label}</span>
      <span className={cn(
        "rounded-full border px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider",
        ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/15 bg-white/5 text-white/40",
      )}>
        {tag}
      </span>
    </li>
  );
}

function HashRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wider text-white/35">{label}</span>
      {value ? <CopyableHash value={value} /> : <span className="text-[11px] text-white/25">—</span>}
    </div>
  );
}

function CopyableHash({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
      className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] text-white/45 transition hover:text-[#8b5cf6]", className)}
      title={value}
    >
      {shortHash(value, 4)}
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

// ── 05 · My jobs ─────────────────────────────────────────────────────────────

export function AgenticMyJobsPage() {
  const [view, setView] = useState<"hiring" | "training" | "verifying" | "settled">("hiring");
  const [query, setQuery] = useState("");
  const [game, setGame] = useState("all");
  const { data: agentsData } = useMyArenaAgents();
  const myAgentIds = useMemo(() => new Set((agentsData?.agents ?? []).map((a) => a.id)), [agentsData]);
  const { data: listing, isLoading } = useQuery({ queryKey: ["agentic", "jobs", "mine"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000 });
  const all = listing?.jobs ?? [];
  const mine = useMemo(
    () => all.filter((job) => myAgentIds.has(job.creatorAgentId) || (job.providerAgentId != null && myAgentIds.has(job.providerAgentId))),
    [all, myAgentIds],
  );
  const hiring = useMemo(() => mine.filter((j) => ["POSTED", "NEGOTIATING", "ESCROWED"].includes(j.status) && myAgentIds.has(j.creatorAgentId)), [mine, myAgentIds]);
  const training = useMemo(() => mine.filter((j) => j.status === "EXECUTING"), [mine]);
  const verifying = useMemo(() => mine.filter((j) => j.status === "DELIVERED"), [mine]);
  const settled = useMemo(() => mine.filter((j) => j.status === "SETTLED" || j.status === "REFUNDED"), [mine]);
  const active = useMemo(() => mine.filter((j) => !["SETTLED", "REFUNDED", "CANCELLED", "FAILED"].includes(j.status)), [mine]);
  const totalVolume = useMemo(() => mine.reduce((sum, j) => sum + usdcNum(j.agreedPrice?.display ?? j.budget.max), 0), [mine]);

  const base =
    view === "hiring" ? hiring :
    view === "training" ? training :
    view === "verifying" ? verifying :
    settled;

  const games = useMemo(() => Array.from(new Set(base.map((j) => j.gameId))).sort(), [base]);
  const jobs = useMemo(
    () => base.filter((j) => (game === "all" || j.gameId === game) && (!query || `${j.prompt} ${j.gameId}`.toLowerCase().includes(query.toLowerCase()))),
    [base, query, game],
  );

  const tabs = [
    { key: "hiring" as const, label: "Buying", count: hiring.length },
    { key: "training" as const, label: "Selling", count: training.length },
    { key: "verifying" as const, label: "To review", count: verifying.length },
    { key: "settled" as const, label: "Completed", count: settled.length },
  ];

  return <>
    <AgenticPageHeader
      title="Your orders"
      description="Jobs you listed as a buyer, or accepted as a seller — from cart to settlement."
      action={<Link to="/jobs/new" className="agentic-primary w-full justify-center sm:w-auto"><Plus className="h-4 w-4" /> Create a job</Link>}
    />

    <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-6 sm:gap-4 lg:grid-cols-4">
      <HeaderStat icon={BriefcaseBusiness} label="Active orders" value={String(active.length).padStart(2, "0")} sub="Buying and selling" />
      <HeaderStat icon={Fingerprint} label="To review" value={String(verifying.length).padStart(2, "0")} sub="Pending delivery check" />
      <HeaderStat icon={CheckCircle2} label="Completed" value={String(settled.length).padStart(2, "0")} sub="Sold or refunded" />
      <HeaderStat icon={Wallet} label="Volume" value={totalVolume.toFixed(2)} sub="USDC · all time" />
    </div>

    <div className="agentic-scroll-x mb-4 border-b border-white/9">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setView(tab.key)}
          className={cn(
            "shrink-0 px-3 py-3 font-tech text-[10px] font-bold uppercase tracking-[.14em] transition sm:px-4",
            view === tab.key ? "border-b-2 border-[#8b5cf6] text-[#8b5cf6]" : "text-white/30 hover:text-white/60",
          )}
        >
          {tab.label}
          {tab.count > 0 ? <span className="ml-1.5 opacity-50">{tab.count}</span> : null}
        </button>
      ))}
    </div>

    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-tech text-[10px] uppercase tracking-wider text-white/35">{jobs.length} orders</p>
      <div className="flex flex-1 flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3">
          <Search className="h-4 w-4 text-white/25" />
          <input
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-white/20"
            placeholder="Search orders…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {games.length > 0 ? (
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/25 px-3 font-tech text-[9px] font-bold uppercase tracking-wider text-white/60 outline-none"
          >
            <option value="all">All Games</option>
            {games.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        ) : null}
      </div>
    </div>

    {isLoading ? (
      <Loading label="Loading operational queue…" />
    ) : jobs.length ? (
      <div className="agentic-surface divide-y divide-white/8 overflow-hidden p-0">
        {jobs.map((job) => <MyJobRow key={job.id} job={job} />)}
      </div>
    ) : (
      <Empty
        title="No orders in this view"
        body={view === "hiring" ? "Create a job to start buying work from another agent." : "Nothing here yet — switch tabs or shop the marketplace."}
      />
    )}
  </>;
}

function MyJobRow({ job }: { job: A2AJob }) {
  const badge = gameBadgeSrc(job.gameId, job.target.metric, job.id);
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex flex-col gap-3 px-3.5 py-3.5 transition hover:bg-[#8b5cf6]/[.03] sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <img src={badge} alt="" className="h-11 w-11 shrink-0 drop-shadow-[0_0_12px_rgba(34,211,238,0.25)] sm:h-12 sm:w-12" />
        <div className="min-w-0 flex-1">
          <span className="rounded border border-[#8b5cf6]/20 bg-[#8b5cf6]/8 px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-[#60a5fa]">
            {job.gameId}
          </span>
          <p className="mt-1.5 truncate text-sm font-semibold text-white">{listingTitle(job)}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-white/40 sm:line-clamp-1">{job.prompt}</p>
          <p className="mt-1.5 text-[10px] text-white/30">
            Created {dateLabel(job.createdAt)} · By {shortHash(job.creatorAgentId, 4)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/6 pt-3 sm:min-w-[200px] sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0">
        <div className="sm:text-right">
          <Status status={job.status} />
          <p className="mt-1.5 font-mono text-xs text-white/55 sm:mt-2"><span className="agentic-bounty">{job.budget.min} – {job.budget.max}</span> USDC</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[.04] px-3 py-2 font-tech text-[9px] font-bold uppercase tracking-wider text-white/70 transition group-hover:border-[#8b5cf6]/40 group-hover:text-[#8b5cf6]">
          Open listing <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function HeaderStat({ icon: Icon, label, value, sub }: { icon: typeof Activity; label: string; value: string; sub: string }) {
  return (
    <div className="agentic-surface p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-tech text-[8px] font-bold uppercase tracking-[.12em] text-white/35 sm:text-[9px]">{label}</p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/10 sm:h-8 sm:w-8 sm:rounded-xl">
          <Icon className="h-3.5 w-3.5 text-[#8b5cf6]" />
        </span>
      </div>
      <p className="mt-2 font-tech text-xl font-black text-white sm:mt-3 sm:text-2xl">{value}</p>
      <p className="mt-1 text-[8px] leading-tight text-white/30 sm:text-[9px]">{sub}</p>
    </div>
  );
}

// ── 06 · My agents ───────────────────────────────────────────────────────────

export function AgenticAgentsPage() {
  const { data, isLoading } = useMyArenaAgents();
  const agents = data?.agents ?? [];
  const { data: listing } = useQuery({ queryKey: ["agentic", "jobs", "all"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000 });
  const jobs = listing?.jobs ?? [];

  return <>
    <AgenticPageHeader eyebrow="Seller profile" title="My Agent" description="Your shopfront in the marketplace — capabilities, reputation, and what you can earn." />
    {isLoading ? <Loading label="Loading your agents…" /> : agents.length ? (
      <div className="space-y-6">
        {agents.map((agent) => <AgentProfileBlock key={agent.id} agent={agent} jobs={jobs} />)}
      </div>
    ) : <Empty title="No agents found" body="Create an agent in KULT Games before registering a commercial identity." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} />}
  </>;
}

function AgentProfileBlock({ agent, jobs }: { agent: AiArenaAgent; jobs: A2AJob[] }) {
  const [registered, setRegistered] = useState(false);
  const caps = capabilityScores(agent);
  const earnings = earningsForAgent(jobs, agent.id);
  const recent = jobsForAgent(jobs, agent.id).slice(0, 4);
  const lowest = ([
    { label: "Combat", value: caps.combat },
    { label: "Strategy", value: caps.strategy },
    { label: "Analysis", value: caps.analysis },
  ]).sort((a, b) => a.value - b.value)[0];

  return (
    <div className="space-y-5">
      {/* ── Hero — avatar, identity, stat row ── */}
      <section className="agentic-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4 lg:shrink-0">
            <img src={hexBrain} alt="" className="h-16 w-16 shrink-0 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5"><span className="truncate font-tech text-lg font-bold text-white">{agent.name}</span><Hexagon className="h-3 w-3 shrink-0 fill-[#8b5cf6] text-[#8b5cf6]" /></div>
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-white/35">{agent.clan} · {agent.archetype} · {agent.evolutionStage}</p>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 border-t border-white/8 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 xl:grid-cols-4">
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">ELO</p><p className="mt-1 font-tech text-lg font-bold text-white">{agent.eloRating ?? 0}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Win rate</p><p className="mt-1 font-tech text-lg font-bold text-white">{agentWinRate(agent)}%</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Jobs</p><p className="mt-1 font-tech text-lg font-bold text-white">{jobsForAgent(jobs, agent.id).length}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Earnings</p><p className="mt-1 font-tech text-lg font-bold text-[#8b5cf6]">{earnings.toFixed(2)} <span className="text-xs text-white/40">USDC</span></p></div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0 lg:flex-nowrap">
            <Link to="/jobs/new" className="agentic-primary w-full justify-center sm:w-auto">Create a Job</Link>
            <Link to="/reputation" className="agentic-secondary w-full justify-center sm:w-auto">View Reputation</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* ── Capabilities ── */}
        <AgenticPanel title="Capabilities" icon={Gauge}>
          <div className="space-y-3.5">
            <StatBar label="Combat" value={caps.combat} />
            <StatBar label="Strategy" value={caps.strategy} />
            <StatBar label="Analysis" value={caps.analysis} />
          </div>
        </AgenticPanel>

        {/* ── Improvement suggestions ── */}
        <AgenticPanel title="Improvement suggestions" icon={TrendingUp}>
          {lowest.value < 70 ? (
            <>
              <div className="flex items-start gap-3">
                <img
                  src={lowest.label === "Combat" ? hexSwords : lowest.label === "Strategy" ? hexTarget : hexChart}
                  alt=""
                  className="h-11 w-11 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Increase {lowest.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-white/45">{lowest.label} is holding this agent back at {lowest.value}/100. Create a job targeting this metric to hire a specialist trainer.</p>
                </div>
              </div>
              <Link to="/jobs/new" className="agentic-primary mt-4 w-full justify-center">Create a Job to improve<ChevronRight className="h-3.5 w-3.5" /></Link>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"><BadgeCheck className="h-4 w-4" /></span>
              <p className="text-[11px] leading-5 text-white/45">All tracked capabilities are performing well. Keep working jobs to build reputation.</p>
            </div>
          )}
        </AgenticPanel>

        {/* ── Recent activity ── */}
        <AgenticPanel title="Recent activity" icon={Activity}>
          {recent.length ? (
            <ul className="space-y-3">
              {recent.map((job) => (
                <li key={job.id}>
                  <Link to={`/jobs/${job.id}`} className="flex items-center justify-between gap-3 hover:opacity-80">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white/80">{job.gameId}</p>
                      <p className="mt-0.5 text-[10px] text-white/35">{relTime(job.createdAt)}</p>
                    </div>
                    <Status status={job.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="py-4 text-center text-[11px] text-white/30">No job activity yet for this agent.</p>}
        </AgenticPanel>
      </div>

      {/* ── Commercial readiness ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <AgentBaseIdentityCard agentId={agent.id} agentName={agent.name} onRegistered={() => setRegistered(true)} onStatusChange={(status) => setRegistered(status === "REGISTERED" || status === "WALLET_LINKED")} />
        <AutoBidToggle agentId={agent.id} registered={registered} />
      </div>
    </div>
  );
}

// ── 07 · Reputation ──────────────────────────────────────────────────────────

export function AgenticReputationPage() {
  const { data } = useMyArenaAgents();
  const agents = data?.agents ?? [];
  const [agentId, setAgentId] = useState("");
  const selected = agents.find((item) => item.id === agentId) ?? agents[0];
  const identity = useQuery({ queryKey: ["a2a", "identity", selected?.id], queryFn: () => a2aMarketplaceApi.getAgentIdentity(selected!.id), enabled: !!selected });
  const reputation = useQuery({ queryKey: ["a2a", "reputation", identity.data?.erc8004AgentId], queryFn: () => a2aMarketplaceApi.getOnChainReputation(identity.data!.erc8004AgentId!), enabled: !!identity.data?.erc8004AgentId });
  const { data: listing } = useQuery({ queryKey: ["agentic", "jobs", "all"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000, enabled: !!selected });
  const jobs = listing?.jobs ?? [];
  const outcomes = selected ? outcomesForAgent(jobs, selected.id) : [];
  const earnings = selected ? earningsForAgent(jobs, selected.id) : 0;
  const completedAsProvider = jobs.filter((j) => j.providerAgentId === selected?.id && j.status === "SETTLED").length;
  const passed = outcomes.filter((j) => j.verdict?.accepted).length;
  const successRate = outcomes.length ? Math.round((passed / outcomes.length) * 1000) / 10 : null;
  const score1000 = reputation.data?.averageValue != null
    ? Math.round(Math.max(0, Math.min(100, reputation.data.averageValue)) * 10)
    : null;

  const serviceHistory = useMemo(() => {
    const byGame = new Map<string, { jobs: number; settled: number; earned: number }>();
    outcomes.forEach((job) => {
      const row = byGame.get(job.gameId) ?? { jobs: 0, settled: 0, earned: 0 };
      row.jobs += 1;
      if (job.verdict?.accepted) { row.settled += 1; row.earned += usdcNum(job.agreedPrice?.display); }
      byGame.set(job.gameId, row);
    });
    return Array.from(byGame.entries()).map(([gameId, row]) => ({
      gameId,
      ...row,
      successRate: row.jobs ? Math.round((row.settled / row.jobs) * 100) : 0,
    }));
  }, [outcomes]);

  return <>
    <AgenticPageHeader
      title="Reputation"
      description="Portable marketplace reputation from verified jobs."
      action={agents.length > 1 ? (
        <select className="agentic-input max-w-xs" value={selected?.id ?? ""} onChange={(e) => setAgentId(e.target.value)}>
          {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select>
      ) : undefined}
    />

    {!selected ? (
      <Empty title="No agent selected" body="Create an agent to begin building public reputation." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} />
    ) : identity.isLoading || reputation.isLoading ? (
      <Loading label="Reading Base registry…" />
    ) : !identity.data?.erc8004AgentId ? (
      <AgentBaseIdentityCard agentId={selected.id} agentName={selected.name} className="max-w-xl" />
    ) : reputation.error ? (
      <ErrorBox message={(reputation.error as Error).message} />
    ) : (
      <div className="space-y-5">
        {/* ── Featured agent hero ── */}
        <section className="agentic-surface overflow-hidden p-5 sm:p-6">
          <p className="font-tech text-[9px] font-bold uppercase tracking-[.22em] text-[#8b5cf6]/80">Featured Agent</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <img src={hexBrain} alt="" className="h-[4.5rem] w-[4.5rem] shrink-0 drop-shadow-[0_0_22px_rgba(34,211,238,0.4)]" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-tech text-xl font-black text-white">{selected.name}</span>
                  <span className="rounded-full border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-[#60a5fa]">
                    ERC-8004 #{identity.data.erc8004AgentId}
                  </span>
                </div>
                <CopyableHash value={identity.data.eoaAddress || selected.id} className="mt-1" />
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-4 border-t border-white/8 pt-4 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 xl:grid-cols-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/35">Total Earnings</p>
                <p className="mt-1 font-tech text-base font-bold text-[#8b5cf6]">{earnings.toFixed(2)} USDC</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/35">Success Rate</p>
                <p className="mt-1 font-tech text-base font-bold text-white">
                  {successRate != null ? `${successRate}%` : reputation.data?.completionRatePercent != null ? `${reputation.data.completionRatePercent}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/35">Completed Jobs</p>
                <p className="mt-1 font-tech text-base font-bold text-white">{completedAsProvider}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/35">Repeat Buyers</p>
                <p className="mt-1 font-tech text-base font-bold text-white">{reputation.data?.distinctClients ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/35">Feedback</p>
                <p className="mt-1 font-tech text-base font-bold text-white">{reputation.data?.totalFeedback ?? 0}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
              <Link to="/jobs/new" className="agentic-primary w-full justify-center sm:w-auto">Hire this agent <ArrowRight className="h-3.5 w-3.5" /></Link>
              <Link to="/agents" className="agentic-secondary w-full justify-center sm:w-auto">Seller profile</Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr] xl:grid-cols-[1fr_1.1fr_.85fr] lg:gap-5">
          {/* ── Verified outcomes timeline ── */}
          <AgenticPanel title="Verified outcomes" icon={ShieldCheck}>
            {outcomes.length ? (
              <ol className="relative space-y-0 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-white/10">
                {outcomes.slice(0, 6).map((job) => (
                  <li key={job.id} className="relative flex gap-3 pb-4 last:pb-0">
                    <span
                      className={cn(
                        "relative z-[1] mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 bg-[#050807]",
                        job.verdict?.accepted ? "border-emerald-400" : "border-rose-400",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-tech text-[8px] font-bold uppercase tracking-wider text-[#8b5cf6]/80">{job.gameId}</span>
                        <span className="text-[9px] text-white/30">{relTime(job.settledAt ?? job.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-white/85">
                        {job.target.metric} {op(job.target.op)} {job.target.value}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className={cn(
                          "rounded-full border px-2 py-0.5 font-tech text-[8px] font-bold uppercase",
                          job.verdict?.accepted ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-rose-400/30 bg-rose-400/10 text-rose-300",
                        )}>
                          {job.verdict?.accepted ? "PASS" : "FAIL"}
                        </span>
                        {job.agreedPrice ? (
                          <span className="font-mono text-[10px] text-white/50">{job.agreedPrice.display} USDC</span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-8 text-center text-[11px] text-white/30">No verified outcomes yet.</p>
            )}
          </AgenticPanel>

          {/* ── Economic reputation score ── */}
          <AgenticPanel title="Economic reputation score" icon={Gauge}>
            <ScoreGauge value1000={score1000} raw={reputation.data?.averageValue ?? null} />
            <div className="mt-5 space-y-2.5 border-t border-white/8 pt-4">
              <ScoreRow label="Outcome Reliability" value={reputation.data?.completionRatePercent} max={100} suffix="%" />
              <ScoreRow label="Client Diversity" value={reputation.data?.distinctClients} max={Math.max(10, (reputation.data?.distinctClients ?? 0) + 3)} />
              <ScoreRow label="Total Feedback" value={reputation.data?.totalFeedback} max={Math.max(20, (reputation.data?.totalFeedback ?? 0) + 5)} />
              <Info label="Registry" value={shortHash(reputation.data?.registry, 6)} mono />
            </div>
          </AgenticPanel>

          {/* ── Why this matters ── */}
          <AgenticPanel title="Why this matters" icon={Fingerprint}>
            <div className="space-y-5">
              <Integrity label="Independently verified" body="Every outcome is verified on Base through escrowed payments and immutable records." />
              <Integrity label="Portable across markets" body="Reputation travels with the agent, readable by any ERC-8004 client." />
              <Integrity label="Earn trust, earn more" body="Higher reputation unlocks better mandates and more repeat buyers." />
            </div>
            <Link to="/jobs" className="mt-5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#8b5cf6] hover:text-[#60a5fa]">
              How reputation is calculated <ChevronRight className="h-3 w-3" />
            </Link>
          </AgenticPanel>
        </div>

        {serviceHistory.length ? (
          <AgenticPanel title="Service history" icon={Activity}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[9px] uppercase tracking-wider text-white/30">
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Jobs</th>
                    <th className="pb-3 font-medium">Success Rate</th>
                    <th className="pb-3 font-medium">Total Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceHistory.map((row) => (
                    <tr key={row.gameId} className="border-t border-white/7">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img src={gameBadgeSrc(row.gameId)} alt="" className="h-7 w-7" />
                          <span className="font-semibold text-white/80">{row.gameId}</span>
                        </div>
                      </td>
                      <td className="py-3 text-white/60">{row.jobs}</td>
                      <td className="py-3 text-white/60">{row.successRate}%</td>
                      <td className="py-3 font-mono text-[#8b5cf6]">{row.earned.toFixed(2)} USDC</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AgenticPanel>
        ) : null}
      </div>
    )}
  </>;
}

function ScoreRow({ label, value, max, suffix = "" }: { label: string; value?: number | null; max: number; suffix?: string }) {
  const n = value ?? 0;
  const pct = max > 0 ? Math.min(100, (n / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="text-white/45">{label}</span>
        <span className="font-mono text-white/80">{value != null ? `${value}${suffix}` : "—"}{value != null && !suffix ? `/${max}` : ""}</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreGauge({ value1000, raw }: { value1000: number | null; raw: number | null }) {
  const pct = value1000 != null ? Math.max(0, Math.min(100, value1000 / 10)) : 0;
  const r = 62;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const label = value1000 == null ? "No score yet" : pct >= 85 ? "Excellent" : pct >= 65 ? "Good" : pct >= 40 ? "Fair" : "Building";
  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-tech text-4xl font-black text-white">{value1000 != null ? value1000 : "—"}</span>
        <span className="mt-1 font-tech text-[9px] font-bold uppercase tracking-wider text-[#8b5cf6]">{label}</span>
        <span className="mt-0.5 text-[9px] text-white/30">{raw != null ? `Avg ${raw.toFixed(1)} · out of 1000` : "Out of 1000"}</span>
      </div>
    </div>
  );
}

// ── Shared building blocks ───────────────────────────────────────────────────

const GAME_LOGOS: Record<string, string> = {
  warzone: warzoneWarriorLogo,
  "highway-hustle": highwayHustleLogo,
};

function gameBadgeSrc(gameId: string, metric = "", salt = "") {
  return GAME_LOGOS[gameId.toLowerCase()] ?? jobBadgeSrc(metric || gameId, salt);
}

function jobBadgeSrc(metric: string, salt = "") {
  const key = `${metric} ${salt}`.toLowerCase();
  if (key.includes("combat") || key.includes("aggression") || key.includes("warrior") || key.includes("precision")) return hexHelmet;
  if (key.includes("sniper") || key.includes("aim")) return hexSniper;
  if (key.includes("strateg") || key.includes("adapt") || key.includes("intel")) return hexTarget;
  if (key.includes("analys") || key.includes("predict") || key.includes("patience") || key.includes("creat")) return hexChart;
  if (key.includes("verify") || key.includes("shield") || key.includes("defend")) return hexShieldPurple;
  if (key.includes("rank") || key.includes("trophy") || key.includes("elo")) return hexTrophy;
  if (key.includes("skull") || key.includes("special") || key.includes("tactical")) return hexSkull;
  if (key.includes("sword") || key.includes("melee")) return hexSwords;
  const pool = [hexBrain, hexHelmet, hexSkull, hexSniper, hexShieldPurple, hexTrophy, hexTarget, hexSwords];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

function JobCard({ job, featured }: { job: A2AJob; featured?: boolean }) {
  const badge = gameBadgeSrc(job.gameId, job.target.metric, job.id);
  const windowH = Math.max(1, Math.round(job.executionWindowSeconds / 3600));
  return (
    <Link
      to={`/jobs/${job.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#0e0e0e] transition hover:border-[#8b5cf6]/40",
        featured && "border-[#8b5cf6]/30",
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <img src={badge} alt="" className="h-12 w-12 shrink-0 drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/50">{job.gameId}</span>
            <Status status={job.status} />
            {featured ? <span className="rounded-md bg-[#8b5cf6]/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#8b5cf6]">Featured</span> : null}
          </div>
          <h3 className="mt-2 line-clamp-2 text-[14px] font-semibold leading-5 text-white group-hover:text-[#60a5fa]">{listingTitle(job)}</h3>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-white/40">{job.prompt}</p>
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.07] px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-white/30">Listed {relTime(job.createdAt)} · {windowH}h window</p>
          <p className="mt-0.5 font-mono text-[10px] text-white/35">Seller {shortHash(job.creatorAgentId, 4)}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[9px] uppercase tracking-wider text-white/30">Price</p>
          <p className="agentic-bounty mt-0.5 text-base">{job.budget.min}–{job.budget.max}</p>
          <p className="font-mono text-[10px] text-white/30">USDC</p>
        </div>
      </div>
    </Link>
  );
}
function NegotiationCard({ job, room, side }: { job: A2AJob; room: Negotiation; side: "CREATOR" | "PROVIDER" | null }) {
  return <AgenticPanel title={`Negotiation · ${shortHash(room.id, 5)}`} icon={MessageSquareText}>
    <div className="mb-4 flex items-center justify-between"><Status status={room.state} /><span className="font-mono text-[10px] text-white/35">{room.turn ? `${room.turn} to move` : "Closed"}</span></div>
    {!room.verification.valid ? <p className="mb-3 border border-rose-400/30 bg-rose-400/8 px-3 py-2 text-[10px] text-rose-300">Transcript failed chain verification — messages may have been altered.</p> : null}
    <ol className="space-y-2">{room.messages.map((message) => <li key={message.seq} className={cn("max-w-[85%] border p-3", message.role === "CREATOR" ? "ml-auto border-[#8b5cf6]/15 bg-[#8b5cf6]/[.04]" : "border-white/9 bg-white/[.025]")}><div className="flex items-center justify-between gap-3"><span className="font-mono text-[8px] uppercase tracking-wider text-white/30">{message.role} · {message.kind}</span>{message.price ? <span className="font-mono text-xs text-[#8b5cf6]">{message.price.display} USDC</span> : null}</div>{message.note ? <p className="mt-2 text-xs text-white/60">{message.note}</p> : null}<p className="mt-2 font-mono text-[8px] text-white/20">signed {shortHash(message.signature, 5)}</p></li>)}</ol>
    <NegotiationControls job={job} negotiation={room} side={side} />
  </AgenticPanel>;
}
function ExecutionPanel({ job }: { job: A2AJob }) { const stage = stageIndexForStatus(job.status); const items = [{ label: "Escrow funded", done: stage >= 3 }, { label: "Training execution", done: stage >= 4 }, { label: "Model delivered", done: stage >= 5 }, { label: "Independent verification", done: stage >= 6 }, { label: "USDC settlement", done: job.status === "SETTLED" }]; return <AgenticPanel title="Execution telemetry" icon={Activity}><div className="grid gap-3 md:grid-cols-5">{items.map((item, index) => <div key={item.label} className={cn("border p-4", item.done ? "border-[#8b5cf6]/20 bg-[#8b5cf6]/[.04]" : "border-white/8 bg-black/20")}><div className={cn("flex h-7 w-7 items-center justify-center border", item.done ? "border-[#8b5cf6]/30 text-[#8b5cf6]" : "border-white/10 text-white/20")}>{item.done ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</div><p className="mt-4 text-xs text-white/60">{item.label}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-white/25">{item.done ? "Completed" : index === Math.min(stage, 4) ? "Current stage" : "Waiting"}</p></div>)}</div><p className="mt-4 text-[10px] leading-5 text-white/30">Live episode and score telemetry appears here when the execution service advances the job to training. No simulated progress is shown.</p></AgenticPanel>; }
/**
 * What actually happened to the money. Shown only once a verdict exists — until
 * then there is nothing truthful to say. A rejected verdict (refund) is shown
 * as prominently as an accepted one: that the trainer can genuinely fail and
 * earn nothing is the property that makes the escrow worth using.
 */
function SettlementReceipt({ job }: { job: A2AJob }) {
  if (!job.verdict) return null;
  const { accepted } = job.verdict;
  const measured = job.verifiedValue;
  return (
    <section className={cn("rounded-xl border p-4", accepted ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/5" : "border-amber-500/40 bg-amber-500/5")}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={cn("flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em]", accepted ? "text-[#8b5cf6]" : "text-amber-300")}>
          {accepted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {accepted ? "Settled — trainer paid" : "Refunded — target missed"}
        </h3>
        {job.agreedPrice ? <span className="font-mono text-sm text-white">{job.agreedPrice.display} {job.agreedPrice.currency}</span> : null}
      </div>
      <p className="mt-2 text-[11px] text-white/60">{accepted ? "The escrow released the agreed price to the trainer's wallet. No human approved this payment." : "The work was delivered but did not reach the target, so the contract returned the full amount to the creator. No commission was taken."}</p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2 sm:gap-x-6">
        <div className="flex items-baseline justify-between gap-3 sm:justify-start sm:gap-2"><span className="text-[10px] uppercase tracking-wider text-white/40">Target</span><span className="font-mono text-[11px] text-white">{job.target.metric} {op(job.target.op)} {job.target.value}</span></div>
        <div className="flex items-baseline justify-between gap-3 sm:justify-start sm:gap-2"><span className="text-[10px] uppercase tracking-wider text-white/40">Measured</span><span className={cn("font-mono text-[11px]", accepted ? "text-[#8b5cf6]" : "text-amber-300")}>{measured === null ? "—" : String(measured)}</span></div>
      </div>
      <p className="mt-2 text-[10px] text-white/35">Measured by an independent re-run of the delivered model under a seed root generated at verification time — the trainer never saw these seeds.</p>
      {job.tx?.verdict ? <a href={BASESCAN_TX(job.tx.verdict)} target="_blank" rel="noreferrer" className={cn("mt-3 flex items-center gap-1 text-[10px]", accepted ? "text-[#8b5cf6] hover:text-[#60a5fa]" : "text-amber-300 hover:text-amber-200")}>Verdict and transfer on Base<ExternalLink className="h-2.5 w-2.5" /></a> : null}
    </section>
  );
}
function Interpretation({ interpretation }: { interpretation: ParsedInterpretation }) { return <div className="space-y-3"><Info label="Game" value={interpretation.gameId ?? "Not recognised"} /><Info label="Target" value={interpretation.target ? `${interpretation.target.metric} ${op(interpretation.target.op)} ${interpretation.target.value}` : "No target parsed"} />{interpretation.providerRequirements.map((item, index) => <Info key={index} label={index ? "" : "Provider needs"} value={`${item.metric} ${op(item.op)} ${item.value}`} />)}<Info label="Confidence" value={`${Math.round(interpretation.confidence * 100)}% · ${interpretation.method}`} />{interpretation.warnings.map((warning) => <p key={warning} className="flex gap-2 border border-amber-300/20 bg-amber-300/[.04] p-2 text-[10px] text-amber-200"><AlertTriangle className="h-3 w-3 shrink-0" />{warning}</p>)}<p className="border-t border-white/8 pt-3 text-[10px] leading-5 text-white/30">This structured interpretation—not the prose—is hashed and committed on Base.</p></div>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-white/[0.08] bg-black/20 p-3"><p className="font-mono text-[8px] uppercase tracking-wider text-white/30">{label}</p><p className="mt-2 font-mono text-lg font-semibold">{value}</p></div>; }
function Integrity({ label, body }: { label: string; body: string }) { return <div className="flex gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" /><div><p className="text-xs font-semibold text-white/70">{label}</p><p className="mt-1 text-[10px] text-white/30">{body}</p></div></div>; }
function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) { return <div className="flex items-start justify-between gap-5 border-b border-white/7 py-3 first:pt-0 last:border-0 last:pb-0"><span className="text-[9px] uppercase tracking-[.13em] text-white/28">{label}</span><span className={cn("text-right text-xs text-white/70", mono && "font-mono text-[10px]")}>{value}</span></div>; }
function TxRow({ label, hash }: { label: string; hash: string }) { return <a href={BASESCAN_TX(hash)} target="_blank" rel="noreferrer" className="flex items-baseline justify-between gap-3 transition hover:text-[#8b5cf6]"><span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span><span className="flex items-center gap-1 font-mono text-[10px] text-[#8b5cf6]">{shortHash(hash, 4)}<ExternalLink className="h-2.5 w-2.5" /></span></a>; }
function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span className="text-[9px] uppercase tracking-wider text-white/30">{label}</span><div className="mt-2 flex items-center rounded-md border border-white/10 bg-black/25 px-3"><input className="h-12 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} /><span className="font-mono text-[9px] text-[#8b5cf6]">USDC</span></div></label>; }
function Status({ status }: { status: string }) { return <span className={cn("rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide", statusTone[status] ?? "border-white/15 bg-white/5 text-white/45")}>{status}</span>; }
function Loading({ label }: { label: string }) { return <div className="agentic-surface flex min-h-48 items-center justify-center gap-3 text-xs text-white/40"><Loader2 className="h-4 w-4 animate-spin text-[#8b5cf6]" />{label}</div>; }
function Empty({ title, body, action }: { title: string; body: string; action?: { label: string; href: string } }) {
  return (
    <div className="rounded-lg border border-dashed border-white/12 px-5 py-12 text-center">
      <Store className="mx-auto h-7 w-7 text-white/15" />
      <p className="mt-3 font-mono text-xs text-white/55">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-xs text-white/30">{body}</p>
      {action ? (
        action.href.startsWith("/") ? (
          <Link to={action.href} className="agentic-primary mt-4 inline-flex">{action.label}</Link>
        ) : (
          <a href={action.href} target="_blank" rel="noreferrer" className="agentic-primary mt-4 inline-flex"><ExternalLink className="h-4 w-4" />{action.label}</a>
        )
      ) : null}
    </div>
  );
}
function ErrorBox({ message }: { message: string }) { return <div className="flex items-start gap-3 rounded-lg border border-rose-400/25 bg-rose-400/8 p-4 text-xs text-rose-200"><AlertTriangle className="h-4 w-4 shrink-0" />{message}</div>; }
function op(value: string) { return ({ gte: "≥", gt: ">", lte: "≤", lt: "<", eq: "=" } as Record<string, string>)[value] ?? value; }
