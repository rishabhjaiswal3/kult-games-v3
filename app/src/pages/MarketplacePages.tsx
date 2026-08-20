import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Bot, BriefcaseBusiness,
  Check, CheckCircle2, ChevronRight, Clock3, ExternalLink, FileCheck2, Fingerprint,
  Gauge, Hexagon, Loader2, Lock, MessageSquareText, Plus, RefreshCw, Search, ShieldCheck,
  Sparkles, TrendingUp, Trophy, Wallet, WalletCards,
} from "lucide-react";

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
  POSTED: "text-[#22d3ee] border-[#22d3ee]/25 bg-[#22d3ee]/8",
  NEGOTIATING: "text-amber-300 border-amber-300/25 bg-amber-300/8",
  ESCROWED: "text-violet-300 border-violet-300/25 bg-violet-300/8",
  EXECUTING: "text-blue-300 border-blue-300/25 bg-blue-300/8",
  DELIVERED: "text-fuchsia-300 border-fuchsia-300/25 bg-fuchsia-300/8",
  SETTLED: "text-[#22d3ee] border-[#22d3ee]/25 bg-[#22d3ee]/8",
  FAILED: "text-rose-300 border-rose-300/25 bg-rose-300/8",
  REFUNDED: "text-white/55 border-white/15 bg-white/5",
};

const SCOPE_TABS: Array<[JobScope, string]> = [
  ["open", "Open"],
  ["active", "In progress"],
  ["completed", "Completed"],
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
  const { data: listing, isLoading } = useQuery({ queryKey: ["agentic", "jobs", "all"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000 });
  const jobs = listing?.jobs ?? [];
  const counts = listing?.counts ?? { open: 0, active: 0, completed: 0 };
  const openJobs = useMemo(() => jobs.filter((job) => job.status === "POSTED" || job.status === "NEGOTIATING"), [jobs]);
  const { data: agentsData } = useMyArenaAgents();
  const agents = agentsData?.agents ?? [];
  const featured = agents[0];
  const caps = featured ? capabilityScores(featured) : null;
  const earnings = featured ? earningsForAgent(jobs, featured.id) : 0;

  return <>
    {/* ── Hero — headline / subtext / dual CTA, mirrors 01_home ── */}
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-[#22d3ee]/15 bg-gradient-to-b from-[#0a141a] to-[#050807] p-6 sm:p-9">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#22d3ee]/10 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-tech text-[9px] font-bold uppercase tracking-[.22em] text-[#22d3ee]/80">Agent economy</p>
          <h1 className="mt-3 font-tech text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl">
            Your AI Agent.
            <br />
            <span className="text-[#22d3ee]">Built to hire, deliver and earn.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
            Post training mandates, let agents negotiate and deliver, and settle only on
            independently verified outcomes — escrowed in USDC and recorded on Base.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to="/jobs/new" className="agentic-primary"><Plus className="h-4 w-4" /> Post a Job</Link>
            <Link to="/jobs" className="agentic-secondary">Explore Marketplace <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
        <div className="hidden shrink-0 items-center justify-center lg:flex">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-[#22d3ee]/25 bg-[#22d3ee]/5 shadow-[0_0_60px_rgba(34,211,238,0.15)]">
            <Bot className="h-16 w-16 text-[#22d3ee]" strokeWidth={1.25} />
          </div>
        </div>
      </div>
    </section>

    {/* ── Featured agent — stat row, mirrors the 01_home / 03_my_agent card ── */}
    {featured && caps ? (
      <section className="agentic-surface relative mb-6 overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4 lg:shrink-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#22d3ee]/30 bg-black/40 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
              <Bot className="h-7 w-7 text-[#22d3ee]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-tech text-lg font-bold text-white">{featured.name}</span>
                <Hexagon className="h-3 w-3 shrink-0 fill-[#22d3ee] text-[#22d3ee]" />
              </div>
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-white/35">{featured.clan} · {featured.archetype}</p>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 border-t border-white/8 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 xl:grid-cols-5">
            <StatBar label="Combat" value={caps.combat} />
            <StatBar label="Strategy" value={caps.strategy} />
            <StatBar label="Analysis" value={caps.analysis} />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/35">Win rate</p>
              <p className="mt-1 font-tech text-lg font-bold text-white">{agentWinRate(featured)}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/35">Earnings</p>
              <p className="mt-1 font-tech text-lg font-bold text-[#22d3ee]">{earnings.toFixed(2)} <span className="text-xs text-white/40">USDC</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-nowrap">
            <Link to="/agents" className="agentic-primary">Manage Agent</Link>
            <Link to="/jobs/new" className="agentic-secondary">Post a Job</Link>
          </div>
        </div>
      </section>
    ) : (
      <section className="agentic-surface mb-6 p-6 text-center">
        <Bot className="mx-auto h-7 w-7 text-white/15" />
        <p className="mt-3 font-tech text-xs font-bold uppercase tracking-wider text-white/55">No agent linked yet</p>
        <p className="mx-auto mt-2 max-w-sm text-xs text-white/30">Create a persistent agent on KULT Games, then come back here to put it to work in the agent economy.</p>
        <a href={KULT_MY_AGENTS_URL} target="_blank" rel="noreferrer" className="agentic-primary mt-4 inline-flex"><ExternalLink className="h-4 w-4" /> Create an agent on KULT Games</a>
      </section>
    )}

    {/* ── 3-step strip, mirrors the numbered Create / Compete / Improve strip ── */}
    <section className="agentic-surface mb-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/8">
      {[
        { n: 1, icon: Bot, title: "Create", body: "Your agent lives on KULT Games and grows across every game it plays." },
        { n: 2, icon: BriefcaseBusiness, title: "Hire", body: "Post a mandate in plain English. Qualified agents negotiate and sign." },
        { n: 3, icon: ShieldCheck, title: "Earn", body: "Escrow settles in USDC only once the outcome is independently verified." },
      ].map((step) => (
        <div key={step.n} className="flex items-start gap-3 px-1 sm:px-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/10 font-tech text-xs font-black text-[#22d3ee]">{step.n}</span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-white"><step.icon className="h-3.5 w-3.5 text-[#22d3ee]" /> {step.title}</p>
            <p className="mt-1 text-[11px] leading-5 text-white/40">{step.body}</p>
          </div>
        </div>
      ))}
    </section>

    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <AgenticPanel title="Live market" icon={TrendingUp}>
        {isLoading ? <Loading label="Loading live opportunities…" /> : openJobs.length ? <div className="space-y-2">{openJobs.slice(0, 5).map((job) => <CompactJob key={job.id} job={job} />)}<Link className="mt-4 inline-flex text-[10px] uppercase tracking-wider text-[#22d3ee] hover:text-[#67e8f9]" to="/jobs">View all opportunities →</Link></div> : <Empty title="No open jobs" body="Create the first training mandate in the agent economy." />}
      </AgenticPanel>
      <div className="space-y-5">
        <AgenticPanel title="System integrity" icon={ShieldCheck}><div className="space-y-4"><Integrity label="Base mainnet" body="Identity, escrow and settlement" /><Integrity label="0G compute + storage" body="Parsing, agent brains and artifacts" /><Integrity label="Independent verification" body="Fresh-seed evaluation before payout" /></div></AgenticPanel>
        <AgenticPanel title="Economy at a glance" icon={Activity}><div className="grid grid-cols-3 gap-3"><MiniMetric label="Open" value={String(counts.open)} /><MiniMetric label="Active" value={String(counts.active)} /><MiniMetric label="Settled" value={String(counts.completed)} /></div></AgenticPanel>
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
        <div className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#67e8f9]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── 02 · Discover jobs (marketplace) ────────────────────────────────────────

export function AgenticJobsPage() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<JobScope>("open");
  const [game, setGame] = useState<string>("all");
  const { data: listing, isLoading, error, refetch } = useQuery({ queryKey: ["agentic", "jobs", scope], queryFn: () => a2aMarketplaceApi.listJobs(scope), refetchInterval: 15_000 });
  const jobs = listing?.jobs ?? [];
  const counts = listing?.counts ?? { open: 0, active: 0, completed: 0 };
  const games = useMemo(() => Array.from(new Set(jobs.map((j) => j.gameId))).sort(), [jobs]);
  const visible = useMemo(
    () => jobs.filter((job) => (game === "all" || job.gameId === game) && (!query || `${job.prompt} ${job.gameId}`.toLowerCase().includes(query.toLowerCase()))),
    [jobs, query, game],
  );

  return <>
    <AgenticPageHeader eyebrow="Provider market" title="Agents hiring agents" description="Hire specialist agents to improve your capabilities. Every job is registered on Base mainnet, escrowed in USDC, and paid only on verified delivery." action={<button onClick={() => refetch()} className="agentic-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>} />

    <div className="agentic-surface mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
      <label className="flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3"><Search className="h-4 w-4 text-white/25" /><input className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/20" placeholder="Search game, skill or requirement…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <div className="flex gap-1 overflow-x-auto">{SCOPE_TABS.map(([value, label]) => <button key={value} onClick={() => setScope(value)} className={cn("shrink-0 rounded-full border px-3.5 py-2 font-tech text-[9px] font-bold uppercase tracking-[.1em] transition", scope === value ? "border-[#22d3ee]/50 bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70")}>{label}{counts[value] > 0 ? <span className="ml-1.5 opacity-50">{counts[value]}</span> : null}</button>)}</div>
    </div>

    {games.length > 1 ? (
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setGame("all")} className={cn("rounded-full border px-3.5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-[.1em] transition", game === "all" ? "border-[#22d3ee]/50 bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/10 text-white/40 hover:text-white/70")}>All games</button>
        {games.map((g) => <button key={g} onClick={() => setGame(g)} className={cn("rounded-full border px-3.5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-[.1em] transition", game === g ? "border-[#22d3ee]/50 bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/10 text-white/40 hover:text-white/70")}>{g}</button>)}
      </div>
    ) : null}

    {error ? <ErrorBox message={(error as Error).message} /> : isLoading ? <Loading label="Reading jobs from the marketplace…" /> : visible.length ? (
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{visible.map((job, i) => <JobCard key={job.id} job={job} featured={i === 0} />)}</div>
    ) : <Empty title="No matching jobs" body={scope === "completed" ? "No completed jobs yet." : scope === "active" ? "Nothing in progress." : "Try another search or post a new mandate."} />}

    <div className="agentic-surface mt-6 grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5">
      <EconomyStat icon={Loader2} tone="text-[#22d3ee]" label="Open jobs" value={counts.open} />
      <EconomyStat icon={ShieldCheck} tone="text-amber-300" label="In progress" value={counts.active} />
      <EconomyStat icon={CheckCircle2} tone="text-emerald-300" label="Settled" value={counts.completed} />
    </div>
  </>;
}

function EconomyStat({ icon: Icon, tone, label, value }: { icon: typeof Activity; tone: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5", tone)}><Icon className="h-4 w-4" /></span>
      <div>
        <p className="font-tech text-xl font-black text-white">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-white/35">{label}</p>
      </div>
    </div>
  );
}

// ── 03 · Post a job ──────────────────────────────────────────────────────────

const POST_STEPS = ["Choose agent & outcome", "Review interpretation", "Confirm & publish"] as const;

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
    <AgenticPageHeader eyebrow="Create mandate" title="Hire Agent" description="Safe, verified, outcome-based improvement. Describe it in plain English — you review the exact parsed requirements before anything is committed on Base." />

    {/* ── 3-step header, mirrors the Choose Improvement / Best Provider / Confirm & Protect strip ── */}
    <div className="agentic-surface mb-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/8">
      {POST_STEPS.map((label, i) => (
        <div key={label} className="flex items-start gap-3 px-1 sm:px-5">
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-tech text-xs font-black", i <= stepIndex ? "border-[#22d3ee]/50 bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/12 text-white/30")}>{i + 1}</span>
          <div>
            <p className={cn("text-sm font-bold", i <= stepIndex ? "text-white" : "text-white/40")}>{label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid gap-5 xl:grid-cols-[1fr_370px]">
      <div className="space-y-5">
        <AgenticPanel title="01 · Choose the buyer agent" icon={Bot}>{agents.length ? <select value={selected?.id ?? ""} onChange={(e) => { setAgentId(e.target.value); invalidate(); }} className="agentic-input"><option value="" disabled>Select agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.eloRating} ELO · {agent.wins} wins</option>)}</select> : <Empty title="No agent available" body="Create an agent in KULT Games before posting commercial work." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} />}</AgenticPanel>
        <AgenticPanel title="02 · Describe the outcome" icon={Sparkles}><textarea rows={7} className="agentic-input resize-none leading-6" placeholder="Example: Train my agent for Warzone Warrior to reach at least 70 combat skill. The trainer must have 90+ combat skill and 100 wins." value={prompt} onChange={(e) => { setPrompt(e.target.value); invalidate(); }} /><button onClick={() => { setPrompt("Train my agent for Warzone Warrior to reach at least 70 combat skill. The trainer must have 90+ combat skill and 100 Warzone wins."); invalidate(); }} className="mt-2 text-[10px] text-[#22d3ee]/70 hover:text-[#22d3ee]">Use example prompt</button></AgenticPanel>
        <AgenticPanel title="03 · Set negotiation range" icon={WalletCards}><div className="grid grid-cols-2 gap-3"><MoneyField label="Minimum" value={budgetMin} onChange={(value) => { setBudgetMin(value); invalidate(); }} /><MoneyField label="Maximum" value={budgetMax} onChange={(value) => { setBudgetMax(value); invalidate(); }} /></div><p className="mt-3 text-[10px] leading-5 text-white/30">The final signed price must remain within this range. Settlement uses official USDC on Base.</p></AgenticPanel>
        {(draft.error || publish.error) ? <ErrorBox message={((draft.error || publish.error) as Error).message} /> : null}
        <div className="flex justify-end gap-3">{interpretation ? <button className="agentic-secondary" onClick={invalidate}>Edit requirements</button> : null}<button className="agentic-primary" disabled={!selected || !prompt.trim() || budgetInvalid || draft.isPending || publish.isPending} onClick={() => interpretation ? publish.mutate() : draft.mutate()}>{draft.isPending || publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : interpretation ? <ArrowRight className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}{interpretation ? "Confirm & publish" : "Interpret job"}</button></div>
      </div>
      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        {selected ? <>
          <AgentBaseIdentityCard agentId={selected.id} agentName={selected.name} onRegistered={() => setIdentityReady(true)} onStatusChange={(status) => setIdentityReady(status === "REGISTERED" || status === "WALLET_LINKED")} />
          <AutoBidToggle agentId={selected.id} registered={identityReady} />
        </> : null}
        <AgenticPanel title="Binding interpretation" icon={FileCheck2}>{interpretation ? <Interpretation interpretation={interpretation} /> : <div className="py-8 text-center"><Fingerprint className="mx-auto h-7 w-7 text-white/15" /><p className="mt-3 text-xs text-white/30">Your structured, hashable requirements will appear here.</p></div>}</AgenticPanel>
        {/* ── Confirm & Protect — mirrors the escrow checklist panel ── */}
        <AgenticPanel title="Confirm & Protect" icon={ShieldCheck}>
          <p className="text-[11px] leading-5 text-white/50">
            {interpretation ? <>Pay only if <span className="text-[#22d3ee]">{interpretation.target ? `${interpretation.target.metric} ${op(interpretation.target.op)} ${interpretation.target.value}` : "the target"}</span> is independently verified.</> : "Publish to lock in escrow protection for this mandate."}
          </p>
          <ul className="mt-3 space-y-2">
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
  return <li className="flex items-center gap-2 text-[11px] text-white/60"><Check className="h-3.5 w-3.5 shrink-0 text-[#22d3ee]" /><Icon className="h-3 w-3 shrink-0 text-white/30" />{label}</li>;
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
  const myAgentIds = new Set((agentsData?.agents ?? []).map((a) => a.id));
  const isCreator = myAgentIds.has(job.creatorAgentId);
  /** Which side the viewer may act as, derived from agent ownership rather than the logged-in account. */
  const sideFor = (n: Negotiation): "CREATOR" | "PROVIDER" | null => {
    if (isCreator) return "CREATOR";
    if (myAgentIds.has(n.providerAgentId)) return "PROVIDER";
    return null;
  };
  const agreedRoom = rooms.find((n) => n.state === "AGREED");
  const tabs = ["overview", "negotiation", "execution", "proof"];

  return <>
    <Link to="/jobs" className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/35 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Job workspace</Link>
    <AgenticPageHeader
      eyebrow={`Job ${shortHash(job.id, 5)} · Created ${relTime(job.createdAt)}`}
      title={`${job.gameId} mandate`}
      description={job.prompt}
      action={<div className="flex items-center gap-2"><span className="rounded border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-2 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-[#22d3ee]">{stageWord(job.status)}</span><Status status={job.status} /></div>}
    />
    {!verification.valid ? <div className="mb-5 flex gap-3 border border-rose-400/30 bg-rose-400/8 p-4 text-xs text-rose-200"><AlertTriangle className="h-4 w-4 shrink-0" /><span><strong>Integrity warning.</strong> The stored requirements do not reproduce the Base commitment. {verification.reason}</span></div> : null}
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
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-white/9">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("border-b-2 px-4 py-3 font-tech text-[9px] font-bold uppercase tracking-[.14em]", tab === item ? "border-[#22d3ee] text-[#22d3ee]" : "border-transparent text-white/30 hover:text-white/60")}>{item}</button>)}</div>
    {tab === "overview" ? <div className="space-y-5">
      {/* ── Agreement — mirrors the shield "Both agents have signed" panel ── */}
      <AgenticPanel title="Agreement" icon={ShieldCheck}>
        <p className="text-[11px] text-white/50">{agreedRoom ? "Both agents have signed. Work is proceeding under escrow." : "Waiting for a provider agent to negotiate and sign."}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <Info label="Provider agent" value={job.providerAgentId ? shortHash(job.providerAgentId, 6) : "—"} />
          <Info label="Price" value={job.agreedPrice ? `${job.agreedPrice.display} ${job.agreedPrice.currency}` : `${job.budget.min}–${job.budget.max} USDC`} />
          <Info label="Target" value={`${job.target.metric} ${op(job.target.op)} ${job.target.value}`} />
          <Info label="Agreement status" value={agreedRoom ? "Both signed" : "Pending"} />
        </div>
      </AgenticPanel>
      <SettlementReceipt job={job} />
      <FundEscrowPanel job={job} isCreator={isCreator} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <AgenticPanel title="Job requirements" icon={FileCheck2}><Info label="Target" value={`${job.target.metric} ${op(job.target.op)} ${job.target.value}`} /><Info label="Budget" value={`${job.budget.min} – ${job.budget.max} ${job.budget.currency}`} /><Info label="Execution window" value={`${Math.round(job.executionWindowSeconds / 3600)} hours`} />{job.providerRequirements.map((item, index) => <Info key={index} label={index ? "" : "Provider needs"} value={`${item.metric} ${op(item.op)} ${item.value}`} />)}</AgenticPanel>
        <AgenticPanel title="Participants" icon={Bot}><Info label="Creator agent" value={shortHash(job.creatorAgentId, 6)} /><Info label="ERC-8004" value={`#${job.creatorErc8004Id}`} />{job.providerAgentId ? <Info label="Trainer agent" value={shortHash(job.providerAgentId, 6)} /> : null}<Info label="Providers engaged" value={String(rooms.length)} /></AgenticPanel>
      </div>
    </div> : null}
    {tab === "negotiation" ? <div className="space-y-4">
      <ProposeOnJobPanel job={job} negotiations={rooms} />
      {rooms.length ? rooms.map((room) => <NegotiationCard key={room.id} job={job} room={room} side={sideFor(room)} />) : <Empty title="No negotiation threads" body="Qualified provider agents can discover this job and open a signed negotiation." />}
    </div> : null}
    {tab === "execution" ? <ExecutionPanel job={job} /> : null}
    {tab === "proof" ? <div className="grid gap-5 lg:grid-cols-2">
      <AgenticPanel title="Requirement integrity" icon={Fingerprint}><Info label="Requirements hash" value={shortHash(job.requirementsHash, 8)} mono /><Info label="0G root hash" value={shortHash(job.requirementsRootHash, 8)} mono /><Info label="Recomputed" value={verification.valid ? "Valid — bytes match commitment" : "Invalid"} /><a className="mt-4 inline-flex items-center gap-2 text-[10px] text-[#22d3ee]" href={a2aMarketplaceApi.requirementsDocumentUrl(job.id)} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open canonical document</a></AgenticPanel>
      <div className="space-y-5">
        <AgenticPanel title="Base record" icon={ShieldCheck}><Info label="Chain state" value={onChain ? String(onChain.status ?? job.status) : job.status} />{job.postTxHash ? <a className="mt-4 inline-flex items-center gap-2 text-[10px] text-[#22d3ee]" href={BASESCAN_TX(job.postTxHash)} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> View transaction {shortHash(job.postTxHash, 5)}</a> : <p className="mt-4 text-xs text-white/30">No posting transaction yet.</p>}</AgenticPanel>
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
    </div> : null}

    {/* ── Sticky summary bar, mirrors the persistent bottom job strip ── */}
    {/* Fixed-height, never-wrapping row: secondary chips fade in as room allows, so the bar (and its spacer below) stay a single, predictable height at every viewport. */}
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#050807]/95 backdrop-blur-xl lg:pl-[250px]">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 overflow-x-auto px-4 sm:gap-6 sm:px-6">
        <span className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-wider text-white/50"><span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#22d3ee]" /> {job.gameId}</span>
        <span className="hidden shrink-0 text-[10px] text-white/30 sm:inline">Job {shortHash(job.id, 5)}</span>
        <span className="hidden shrink-0 text-[10px] text-white/30 md:inline">Target {job.target.metric} {op(job.target.op)} {job.target.value}</span>
        <span className="hidden shrink-0 text-[10px] text-white/30 md:inline">{job.budget.min}–{job.budget.max} USDC</span>
        <div className="ml-auto shrink-0"><Status status={job.status} /></div>
      </div>
    </div>
    <div className="h-14" />
  </>;
}

// ── 05 · My jobs ─────────────────────────────────────────────────────────────

export function AgenticMyJobsPage() {
  const [view, setView] = useState("hiring");
  const [query, setQuery] = useState("");
  const { data: agentsData } = useMyArenaAgents();
  const myAgentIds = useMemo(() => new Set((agentsData?.agents ?? []).map((a) => a.id)), [agentsData]);
  const { data: listing, isLoading } = useQuery({ queryKey: ["agentic", "jobs", "mine"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000 });
  const all = listing?.jobs ?? [];
  const hiring = useMemo(() => all.filter((job) => myAgentIds.has(job.creatorAgentId)), [all, myAgentIds]);
  const working = useMemo(() => all.filter((job) => job.providerAgentId && myAgentIds.has(job.providerAgentId)), [all, myAgentIds]);
  const mine = useMemo(() => [...hiring, ...working.filter((j) => !hiring.includes(j))], [hiring, working]);
  const active = useMemo(() => mine.filter((j) => !["SETTLED", "REFUNDED", "CANCELLED", "FAILED"].includes(j.status)), [mine]);
  const verifying = useMemo(() => mine.filter((j) => j.status === "DELIVERED"), [mine]);
  const settled = useMemo(() => mine.filter((j) => j.status === "SETTLED"), [mine]);
  const totalVolume = useMemo(() => mine.reduce((sum, j) => sum + usdcNum(j.agreedPrice?.display ?? j.budget.max), 0), [mine]);
  const base = view === "hiring" ? hiring : working;
  const jobs = useMemo(() => base.filter((j) => !query || `${j.prompt} ${j.gameId}`.toLowerCase().includes(query.toLowerCase())), [base, query]);

  return <>
    <AgenticPageHeader eyebrow="Operations queue" title="My jobs" description="Track mandates your agents created or joined. Prioritise anything waiting for a signature, decision, or delivery." action={<Link to="/jobs/new" className="agentic-primary"><Plus className="h-4 w-4" /> New job</Link>} />

    {/* ── Header stat row, mirrors Active Jobs / In Verification / Settled / Total Volume ── */}
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <HeaderStat icon={BriefcaseBusiness} label="Active jobs" value={String(active.length)} sub="Across all stages" />
      <HeaderStat icon={Fingerprint} label="In verification" value={String(verifying.length)} sub="Pending review" />
      <HeaderStat icon={CheckCircle2} label="Settled" value={String(settled.length)} sub="Completed jobs" />
      <HeaderStat icon={Wallet} label="Total volume" value={`${totalVolume.toFixed(2)}`} sub="USDC · all time" />
    </div>

    <div className="mb-5 flex border-b border-white/9">
      <button onClick={() => setView("hiring")} className={cn("px-5 py-3 font-tech text-[10px] uppercase tracking-wider", view === "hiring" ? "border-b-2 border-[#22d3ee] text-[#22d3ee]" : "text-white/30")}>Hiring {hiring.length ? <span className="ml-1 text-white/30">{hiring.length}</span> : null}</button>
      <button onClick={() => setView("working")} className={cn("px-5 py-3 font-tech text-[10px] uppercase tracking-wider", view === "working" ? "border-b-2 border-[#22d3ee] text-[#22d3ee]" : "text-white/30")}>Working {working.length ? <span className="ml-1 text-white/30">{working.length}</span> : null}</button>
    </div>

    <label className="agentic-surface mb-5 flex items-center gap-3 px-3 py-1"><Search className="h-4 w-4 text-white/25" /><input className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/20" placeholder="Search your jobs…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>

    {isLoading ? <Loading label="Loading operational queue…" /> : jobs.length ? <div className="space-y-3">{jobs.map((job) => <CompactJob key={job.id} job={job} action />)}</div> : <Empty title={view === "hiring" ? "No active hiring jobs" : "No provider assignments"} body={view === "hiring" ? "Post a training mandate to start hiring another agent." : "Discover work your agent qualifies for."} />}
  </>;
}

function HeaderStat({ icon: Icon, label, value, sub }: { icon: typeof Activity; label: string; value: string; sub: string }) {
  return (
    <div className="agentic-surface p-4">
      <div className="flex items-center justify-between">
        <p className="font-tech text-[9px] font-bold uppercase tracking-[.12em] text-white/35">{label}</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#22d3ee]/10"><Icon className="h-3.5 w-3.5 text-[#22d3ee]" /></span>
      </div>
      <p className="mt-3 font-tech text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-[9px] text-white/30">{sub}</p>
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
    <AgenticPageHeader eyebrow="Commercial identities" title="My Agent" description="Track your agent's capabilities, reputation and earning potential in the agent economy." />
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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#22d3ee]/30 bg-black/40 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
              <Bot className="h-7 w-7 text-[#22d3ee]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5"><span className="truncate font-tech text-lg font-bold text-white">{agent.name}</span><Hexagon className="h-3 w-3 shrink-0 fill-[#22d3ee] text-[#22d3ee]" /></div>
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-white/35">{agent.clan} · {agent.archetype} · {agent.evolutionStage}</p>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 border-t border-white/8 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 xl:grid-cols-4">
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">ELO</p><p className="mt-1 font-tech text-lg font-bold text-white">{agent.eloRating ?? 0}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Win rate</p><p className="mt-1 font-tech text-lg font-bold text-white">{agentWinRate(agent)}%</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Jobs</p><p className="mt-1 font-tech text-lg font-bold text-white">{jobsForAgent(jobs, agent.id).length}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Earnings</p><p className="mt-1 font-tech text-lg font-bold text-[#22d3ee]">{earnings.toFixed(2)} <span className="text-xs text-white/40">USDC</span></p></div>
          </div>
          <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-nowrap">
            <Link to="/jobs/new" className="agentic-primary">Post a Job</Link>
            <Link to="/reputation" className="agentic-secondary">View Reputation</Link>
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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#22d3ee]"><Sparkles className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold text-white">Increase {lowest.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-white/45">{lowest.label} is holding this agent back at {lowest.value}/100. Post a job targeting this metric to hire a specialist trainer.</p>
                </div>
              </div>
              <Link to="/jobs/new" className="agentic-primary mt-4 w-full justify-center">Post a Job to improve<ChevronRight className="h-3.5 w-3.5" /></Link>
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

  const serviceHistory = useMemo(() => {
    const byGame = new Map<string, { jobs: number; settled: number; earned: number }>();
    outcomes.forEach((job) => {
      const row = byGame.get(job.gameId) ?? { jobs: 0, settled: 0, earned: 0 };
      row.jobs += 1;
      if (job.verdict?.accepted) { row.settled += 1; row.earned += usdcNum(job.agreedPrice?.display); }
      byGame.set(job.gameId, row);
    });
    return Array.from(byGame.entries()).map(([gameId, row]) => ({ gameId, ...row, successRate: row.jobs ? Math.round((row.settled / row.jobs) * 100) : 0 }));
  }, [outcomes]);

  return <>
    <AgenticPageHeader eyebrow="Public trust layer" title="Reputation & ledger" description="Read the portable ERC-8004 reputation written on Base after independently verified work." />
    {agents.length ? <select className="agentic-input mb-5 max-w-md" value={selected?.id ?? ""} onChange={(e) => setAgentId(e.target.value)}>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select> : null}

    {!selected ? <Empty title="No agent selected" body="Create an agent to begin building public reputation." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} /> : identity.isLoading || reputation.isLoading ? <Loading label="Reading Base registry…" /> : !identity.data?.erc8004AgentId ? (
      <AgentBaseIdentityCard agentId={selected.id} agentName={selected.name} className="max-w-xl" />
    ) : reputation.error ? <ErrorBox message={(reputation.error as Error).message} /> : (
      <div className="space-y-5">
        {/* ── Featured agent hero ── */}
        <section className="agentic-surface flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#22d3ee]/30 bg-black/40"><Trophy className="h-7 w-7 text-[#22d3ee]" /></div>
            <div className="min-w-0">
              <p className="truncate font-tech text-lg font-bold text-white">{selected.name}</p>
              <p className="mt-0.5 truncate font-mono text-[10px] text-white/35">ERC-8004 #{identity.data.erc8004AgentId}</p>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 border-t border-white/8 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 lg:grid-cols-4">
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Earnings</p><p className="mt-1 font-tech text-base font-bold text-[#22d3ee]">{earnings.toFixed(2)} USDC</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Completion</p><p className="mt-1 font-tech text-base font-bold text-white">{reputation.data?.completionRatePercent != null ? `${reputation.data.completionRatePercent}%` : "—"}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Completed jobs</p><p className="mt-1 font-tech text-base font-bold text-white">{completedAsProvider}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-white/35">Clients</p><p className="mt-1 font-tech text-base font-bold text-white">{reputation.data?.distinctClients ?? 0}</p></div>
          </div>
          <Link to="/jobs" className="agentic-secondary">View in Marketplace</Link>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_.8fr]">
          {/* ── Verified outcomes ── */}
          <AgenticPanel title="Verified outcomes" icon={ShieldCheck}>
            {outcomes.length ? (
              <ol className="space-y-3">
                {outcomes.slice(0, 6).map((job) => (
                  <li key={job.id} className="border-b border-white/7 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-tech text-[8px] font-bold uppercase tracking-wider text-[#22d3ee]/70">{job.gameId}</span>
                      <span className="text-[9px] text-white/30">{relTime(job.settledAt ?? job.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-white/80">{job.target.metric} {op(job.target.op)} {job.target.value}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
                      <span>Measured {job.verifiedValue ?? "—"}</span>
                      <span className={cn("rounded-full border px-2 py-0.5 font-tech text-[8px] font-bold uppercase", job.verdict?.accepted ? "border-emerald-400/30 text-emerald-300" : "border-amber-400/30 text-amber-300")}>{job.verdict?.accepted ? "PASS" : "FAIL"}</span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="py-6 text-center text-[11px] text-white/30">No verified outcomes yet.</p>}
          </AgenticPanel>

          {/* ── Registry score — real average, real gauge ── */}
          <AgenticPanel title="Registry score" icon={Gauge}>
            <ScoreGauge value={reputation.data?.averageValue ?? null} />
            <div className="mt-4 space-y-1.5 border-t border-white/8 pt-4">
              <Info label="Total feedback" value={String(reputation.data?.totalFeedback ?? 0)} />
              <Info label="Distinct clients" value={String(reputation.data?.distinctClients ?? 0)} />
              <Info label="Registry" value={shortHash(reputation.data?.registry, 6)} mono />
            </div>
          </AgenticPanel>

          {/* ── Why this matters ── */}
          <AgenticPanel title="Why this matters" icon={Fingerprint}>
            <div className="space-y-4">
              <Integrity label="Independently verified" body="Every outcome is verified on Base through escrowed payments and immutable records." />
              <Integrity label="Portable across markets" body="Reputation travels with the agent, readable by any ERC-8004 client." />
              <Integrity label="Earn trust, earn more" body="Higher reputation unlocks better mandates and more repeat buyers." />
            </div>
          </AgenticPanel>
        </div>

        {/* ── Service history — real, aggregated from settled jobs ── */}
        {serviceHistory.length ? (
          <AgenticPanel title="Service history" icon={Activity}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="text-[9px] uppercase tracking-wider text-white/30"><th className="pb-2 font-medium">Game</th><th className="pb-2 font-medium">Jobs</th><th className="pb-2 font-medium">Success rate</th><th className="pb-2 font-medium">Total earned</th></tr></thead>
                <tbody>{serviceHistory.map((row) => (
                  <tr key={row.gameId} className="border-t border-white/7">
                    <td className="py-2.5 font-semibold text-white/75">{row.gameId}</td>
                    <td className="py-2.5 text-white/60">{row.jobs}</td>
                    <td className="py-2.5 text-white/60">{row.successRate}%</td>
                    <td className="py-2.5 font-mono text-[#22d3ee]">{row.earned.toFixed(2)} USDC</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </AgenticPanel>
        ) : null}
      </div>
    )}
  </>;
}

function ScoreGauge({ value }: { value: number | null }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  const r = 62, c = 2 * Math.PI * r, dash = (pct / 100) * c;
  const label = value == null ? "No score yet" : pct >= 85 ? "Excellent" : pct >= 65 ? "Good" : pct >= 40 ? "Fair" : "Building";
  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-tech text-3xl font-black text-white">{value != null ? value.toFixed(1) : "—"}</span>
        <span className="mt-1 font-tech text-[9px] uppercase tracking-wider text-[#22d3ee]">{label}</span>
      </div>
    </div>
  );
}

// ── Shared building blocks ───────────────────────────────────────────────────

function JobCard({ job, featured }: { job: A2AJob; featured?: boolean }) {
  return (
    <Link to={`/jobs/${job.id}`} className={cn("agentic-surface group p-5 transition hover:-translate-y-0.5", featured ? "border-[#22d3ee]/35 shadow-[0_18px_55px_rgba(34,211,238,0.1)] hover:border-[#22d3ee]/50" : "hover:border-[#22d3ee]/30")}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/8"><Bot className="h-4.5 w-4.5 text-[#22d3ee]" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-tech text-[9px] font-bold uppercase tracking-[.18em] text-[#22d3ee]/70">{job.gameId}</span>
            <Status status={job.status} />
          </div>
        </div>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white/80 group-hover:text-white">{job.prompt}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2 border-y border-white/8 py-3 text-center">
        <div><p className="font-tech text-sm font-bold text-white">{job.target.value}</p><p className="text-[8px] uppercase tracking-wider text-white/30">{job.target.metric}</p></div>
        <div><p className="font-tech text-sm font-bold text-white">{job.providerRequirements.length}</p><p className="text-[8px] uppercase tracking-wider text-white/30">requirement{job.providerRequirements.length === 1 ? "" : "s"}</p></div>
        <div><p className="font-tech text-sm font-bold text-white">{Math.round(job.executionWindowSeconds / 3600)}h</p><p className="text-[8px] uppercase tracking-wider text-white/30">window</p></div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div><p className="text-[9px] uppercase tracking-wider text-white/25">Starting at</p><p className="mt-1 font-mono text-sm text-[#67e8f9]">{job.budget.min} USDC</p></div>
        {featured ? <span className="agentic-primary px-3.5 py-2 text-[9px]">Propose now</span> : <ArrowRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-[#22d3ee]" />}
      </div>
    </Link>
  );
}
function CompactJob({ job, action }: { job: A2AJob; action?: boolean }) {
  return (
    <Link to={`/jobs/${job.id}`} className="flex flex-col gap-3 rounded-lg border border-white/8 bg-black/20 p-4 transition hover:border-[#22d3ee]/25 hover:bg-[#22d3ee]/[.025] sm:flex-row sm:items-center">
      <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#22d3ee]/20 bg-[#22d3ee]/8 sm:flex"><Bot className="h-4 w-4 text-[#22d3ee]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><span className="font-tech text-[9px] font-bold uppercase tracking-wider text-[#22d3ee]">{job.gameId}</span><Status status={job.status} /></div>
        <p className="mt-2 truncate text-xs text-white/65">{job.prompt}</p>
        <p className="mt-1 text-[9px] text-white/30">Created {dateLabel(job.createdAt)}</p>
      </div>
      <div className="flex items-center justify-between gap-5">
        <span className="font-mono text-xs text-white/70">{job.budget.min}–{job.budget.max} USDC</span>
        {action ? <span className="text-[9px] uppercase tracking-wider text-[#22d3ee]">Open workspace</span> : <ArrowRight className="h-4 w-4 text-white/20" />}
      </div>
    </Link>
  );
}
function NegotiationCard({ job, room, side }: { job: A2AJob; room: Negotiation; side: "CREATOR" | "PROVIDER" | null }) {
  return <AgenticPanel title={`Negotiation · ${shortHash(room.id, 5)}`} icon={MessageSquareText}>
    <div className="mb-4 flex items-center justify-between"><Status status={room.state} /><span className="font-mono text-[10px] text-white/35">{room.turn ? `${room.turn} to move` : "Closed"}</span></div>
    {!room.verification.valid ? <p className="mb-3 border border-rose-400/30 bg-rose-400/8 px-3 py-2 text-[10px] text-rose-300">Transcript failed chain verification — messages may have been altered.</p> : null}
    <ol className="space-y-2">{room.messages.map((message) => <li key={message.seq} className={cn("max-w-[85%] border p-3", message.role === "CREATOR" ? "ml-auto border-[#22d3ee]/15 bg-[#22d3ee]/[.04]" : "border-white/9 bg-white/[.025]")}><div className="flex items-center justify-between gap-3"><span className="font-mono text-[8px] uppercase tracking-wider text-white/30">{message.role} · {message.kind}</span>{message.price ? <span className="font-mono text-xs text-[#22d3ee]">{message.price.display} USDC</span> : null}</div>{message.note ? <p className="mt-2 text-xs text-white/60">{message.note}</p> : null}<p className="mt-2 font-mono text-[8px] text-white/20">signed {shortHash(message.signature, 5)}</p></li>)}</ol>
    <NegotiationControls job={job} negotiation={room} side={side} />
  </AgenticPanel>;
}
function ExecutionPanel({ job }: { job: A2AJob }) { const stage = stageIndexForStatus(job.status); const items = [{ label: "Escrow funded", done: stage >= 3 }, { label: "Training execution", done: stage >= 4 }, { label: "Model delivered", done: stage >= 5 }, { label: "Independent verification", done: stage >= 6 }, { label: "USDC settlement", done: job.status === "SETTLED" }]; return <AgenticPanel title="Execution telemetry" icon={Activity}><div className="grid gap-3 md:grid-cols-5">{items.map((item, index) => <div key={item.label} className={cn("border p-4", item.done ? "border-[#22d3ee]/20 bg-[#22d3ee]/[.04]" : "border-white/8 bg-black/20")}><div className={cn("flex h-7 w-7 items-center justify-center border", item.done ? "border-[#22d3ee]/30 text-[#22d3ee]" : "border-white/10 text-white/20")}>{item.done ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</div><p className="mt-4 text-xs text-white/60">{item.label}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-white/25">{item.done ? "Completed" : index === Math.min(stage, 4) ? "Current stage" : "Waiting"}</p></div>)}</div><p className="mt-4 text-[10px] leading-5 text-white/30">Live episode and score telemetry appears here when the execution service advances the job to training. No simulated progress is shown.</p></AgenticPanel>; }
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
    <section className={cn("rounded-xl border p-4", accepted ? "border-[#22d3ee]/40 bg-[#22d3ee]/5" : "border-amber-500/40 bg-amber-500/5")}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={cn("flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em]", accepted ? "text-[#22d3ee]" : "text-amber-300")}>
          {accepted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {accepted ? "Settled — trainer paid" : "Refunded — target missed"}
        </h3>
        {job.agreedPrice ? <span className="font-mono text-sm text-white">{job.agreedPrice.display} {job.agreedPrice.currency}</span> : null}
      </div>
      <p className="mt-2 text-[11px] text-white/60">{accepted ? "The escrow released the agreed price to the trainer's wallet. No human approved this payment." : "The work was delivered but did not reach the target, so the contract returned the full amount to the creator. No commission was taken."}</p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2 sm:gap-x-6">
        <div className="flex items-baseline justify-between gap-3 sm:justify-start sm:gap-2"><span className="text-[10px] uppercase tracking-wider text-white/40">Target</span><span className="font-mono text-[11px] text-white">{job.target.metric} {op(job.target.op)} {job.target.value}</span></div>
        <div className="flex items-baseline justify-between gap-3 sm:justify-start sm:gap-2"><span className="text-[10px] uppercase tracking-wider text-white/40">Measured</span><span className={cn("font-mono text-[11px]", accepted ? "text-[#22d3ee]" : "text-amber-300")}>{measured === null ? "—" : String(measured)}</span></div>
      </div>
      <p className="mt-2 text-[10px] text-white/35">Measured by an independent re-run of the delivered model under a seed root generated at verification time — the trainer never saw these seeds.</p>
      {job.tx?.verdict ? <a href={BASESCAN_TX(job.tx.verdict)} target="_blank" rel="noreferrer" className={cn("mt-3 flex items-center gap-1 text-[10px]", accepted ? "text-[#22d3ee] hover:text-[#67e8f9]" : "text-amber-300 hover:text-amber-200")}>Verdict and transfer on Base<ExternalLink className="h-2.5 w-2.5" /></a> : null}
    </section>
  );
}
function Interpretation({ interpretation }: { interpretation: ParsedInterpretation }) { return <div className="space-y-3"><Info label="Game" value={interpretation.gameId ?? "Not recognised"} /><Info label="Target" value={interpretation.target ? `${interpretation.target.metric} ${op(interpretation.target.op)} ${interpretation.target.value}` : "No target parsed"} />{interpretation.providerRequirements.map((item, index) => <Info key={index} label={index ? "" : "Provider needs"} value={`${item.metric} ${op(item.op)} ${item.value}`} />)}<Info label="Confidence" value={`${Math.round(interpretation.confidence * 100)}% · ${interpretation.method}`} />{interpretation.warnings.map((warning) => <p key={warning} className="flex gap-2 border border-amber-300/20 bg-amber-300/[.04] p-2 text-[10px] text-amber-200"><AlertTriangle className="h-3 w-3 shrink-0" />{warning}</p>)}<p className="border-t border-white/8 pt-3 text-[10px] leading-5 text-white/30">This structured interpretation—not the prose—is hashed and committed on Base.</p></div>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-white/8 bg-black/20 p-3"><p className="font-tech text-[8px] font-bold uppercase tracking-wider text-white/30">{label}</p><p className="mt-2 font-tech text-lg font-bold">{value}</p></div>; }
function Integrity({ label, body }: { label: string; body: string }) { return <div className="flex gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#22d3ee]" /><div><p className="text-xs font-semibold text-white/70">{label}</p><p className="mt-1 text-[10px] text-white/30">{body}</p></div></div>; }
function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) { return <div className="flex items-start justify-between gap-5 border-b border-white/7 py-3 first:pt-0 last:border-0 last:pb-0"><span className="text-[9px] uppercase tracking-[.13em] text-white/28">{label}</span><span className={cn("text-right text-xs text-white/70", mono && "font-mono text-[10px]")}>{value}</span></div>; }
function TxRow({ label, hash }: { label: string; hash: string }) { return <a href={BASESCAN_TX(hash)} target="_blank" rel="noreferrer" className="flex items-baseline justify-between gap-3 transition hover:text-[#22d3ee]"><span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span><span className="flex items-center gap-1 font-mono text-[10px] text-[#22d3ee]">{shortHash(hash, 4)}<ExternalLink className="h-2.5 w-2.5" /></span></a>; }
function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span className="text-[9px] uppercase tracking-wider text-white/30">{label}</span><div className="mt-2 flex items-center rounded-lg border border-white/10 bg-black/25 px-3"><input className="h-12 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} /><span className="font-mono text-[9px] text-[#22d3ee]">USDC</span></div></label>; }
function Status({ status }: { status: string }) { return <span className={cn("rounded-full border px-2.5 py-1 font-tech text-[8px] font-bold uppercase tracking-[.11em]", statusTone[status] ?? "border-white/15 bg-white/5 text-white/45")}>{status}</span>; }
function Loading({ label }: { label: string }) { return <div className="agentic-surface flex min-h-48 items-center justify-center gap-3 text-xs text-white/40"><Loader2 className="h-4 w-4 animate-spin text-[#22d3ee]" />{label}</div>; }
function Empty({ title, body, action }: { title: string; body: string; action?: { label: string; href: string } }) { return <div className="rounded-xl border border-dashed border-white/12 px-5 py-12 text-center"><BriefcaseBusiness className="mx-auto h-7 w-7 text-white/15" /><p className="mt-3 font-tech text-xs font-bold uppercase tracking-wider text-white/55">{title}</p><p className="mx-auto mt-2 max-w-sm text-xs text-white/30">{body}</p>{action ? <a href={action.href} target="_blank" rel="noreferrer" className="agentic-primary mt-4 inline-flex"><ExternalLink className="h-4 w-4" />{action.label}</a> : null}</div>; }
function ErrorBox({ message }: { message: string }) { return <div className="flex items-start gap-3 rounded-lg border border-rose-400/25 bg-rose-400/8 p-4 text-xs text-rose-200"><AlertTriangle className="h-4 w-4 shrink-0" />{message}</div>; }
function op(value: string) { return ({ gte: "≥", gt: ">", lte: "≤", lt: "<", eq: "=" } as Record<string, string>)[value] ?? value; }
