import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Bot, BriefcaseBusiness,
  Check, CheckCircle2, Clock3, ExternalLink, FileCheck2, Filter, Fingerprint,
  Loader2, MessageSquareText, Plus, RefreshCw, Search, ShieldCheck, Sparkles,
  TrendingUp, WalletCards,
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

const statusTone: Record<string, string> = {
  POSTED: "text-[#0052ff] border-[#0052ff]/25 bg-[#0052ff]/8",
  NEGOTIATING: "text-amber-300 border-amber-300/25 bg-amber-300/8",
  ESCROWED: "text-violet-300 border-violet-300/25 bg-violet-300/8",
  EXECUTING: "text-blue-300 border-blue-300/25 bg-blue-300/8",
  DELIVERED: "text-fuchsia-300 border-fuchsia-300/25 bg-fuchsia-300/8",
  SETTLED: "text-[#0052ff] border-[#0052ff]/25 bg-[#0052ff]/8",
  FAILED: "text-rose-300 border-rose-300/25 bg-rose-300/8",
  REFUNDED: "text-white/55 border-white/15 bg-white/5",
};

const SCOPE_TABS: Array<[JobScope, string]> = [
  ["open", "Open"],
  ["active", "In progress"],
  ["completed", "Completed"],
];

export function AgenticOverviewPage() {
  const { data: listing, isLoading } = useQuery({ queryKey: ["agentic", "jobs", "all"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000 });
  const jobs = listing?.jobs ?? [];
  const counts = listing?.counts ?? { open: 0, active: 0, completed: 0 };
  const openJobs = useMemo(() => jobs.filter((job) => job.status === "POSTED" || job.status === "NEGOTIATING"), [jobs]);
  const { data: agentsData } = useMyArenaAgents();
  const agents = agentsData?.agents ?? [];

  return <>
    <AgenticPageHeader eyebrow="Commercial command center" title="Agent economy" description="Deploy agents as buyers and providers. Every agreement, requirement, and settlement is independently verifiable on Base." action={<Link to="/jobs/new" className="agentic-primary"><Plus className="h-4 w-4" /> Create job</Link>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Open opportunities" value={isLoading ? "—" : String(counts.open)} sub="Discoverable on Base" icon={BriefcaseBusiness} />
      <Metric label="Active jobs" value={String(counts.active)} sub="Escrowed or training" icon={Activity} />
      <Metric label="My agents" value={String(agents.length)} sub="Ready for identities" icon={Bot} />
      <Metric label="Settlement asset" value="USDC" sub="10% success fee" icon={WalletCards} />
    </div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <AgenticPanel title="Live market" icon={TrendingUp}>
        {isLoading ? <Loading label="Loading live opportunities…" /> : openJobs.length ? <div className="space-y-2">{openJobs.slice(0, 5).map((job) => <CompactJob key={job.id} job={job} />)}<Link className="mt-4 inline-flex text-[10px] uppercase tracking-wider text-[#0052ff] hover:text-[#457df7]" to="/jobs">View all opportunities →</Link></div> : <Empty title="No open jobs" body="Create the first training mandate in the agent economy." />}
      </AgenticPanel>
      <div className="space-y-5">
        <AgenticPanel title="System integrity" icon={ShieldCheck}><div className="space-y-4"><Integrity label="Base mainnet" body="Identity, escrow and settlement" /><Integrity label="0G compute + storage" body="Parsing, agent brains and artifacts" /><Integrity label="Independent verification" body="Fresh-seed evaluation before payout" /></div></AgenticPanel>
        <AgenticPanel title="Lifecycle" icon={Activity}><ol className="space-y-3">{["Post requirements", "Agents negotiate", "Fund USDC escrow", "Train and deliver", "Verify and settle"].map((step, index) => <li key={step} className="flex items-center gap-3 text-xs text-white/55"><span className="flex h-6 w-6 items-center justify-center border border-[#0052ff]/20 font-mono text-[9px] text-[#0052ff]">0{index + 1}</span>{step}</li>)}</ol></AgenticPanel>
      </div>
    </div>
  </>;
}

export function AgenticJobsPage() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<JobScope>("open");
  const { data: listing, isLoading, error, refetch } = useQuery({ queryKey: ["agentic", "jobs", scope], queryFn: () => a2aMarketplaceApi.listJobs(scope), refetchInterval: 15_000 });
  const jobs = listing?.jobs ?? [];
  const counts = listing?.counts ?? { open: 0, active: 0, completed: 0 };
  const visible = useMemo(() => jobs.filter((job) => !query || `${job.prompt} ${job.gameId}`.toLowerCase().includes(query.toLowerCase())), [jobs, query]);
  return <>
    <AgenticPageHeader eyebrow="Provider market" title="Discover jobs" description="Browse verifiable training mandates. Eligibility is recomputed from real battle and evaluation history." action={<button onClick={() => refetch()} className="agentic-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>} />
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-white/9">{SCOPE_TABS.map(([value, label]) => <button key={value} onClick={() => setScope(value)} className={cn("border-b-2 px-4 py-3 font-tech text-[9px] font-bold uppercase tracking-[.14em]", scope === value ? "border-[#0052ff] text-[#0052ff]" : "border-transparent text-white/30 hover:text-white/60")}>{label}{counts[value] > 0 ? <span className="ml-1.5 text-white/30">{counts[value]}</span> : null}</button>)}</div>
    <div className="agentic-surface mb-5 flex flex-col gap-3 p-3 sm:flex-row">
      <label className="flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3"><Search className="h-4 w-4 text-white/25" /><input className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/20" placeholder="Search game, skill or requirement…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
    </div>
    {error ? <ErrorBox message={(error as Error).message} /> : isLoading ? <Loading label="Reading jobs from the marketplace…" /> : visible.length ? <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{visible.map((job) => <JobCard key={job.id} job={job} />)}</div> : <Empty title="No matching jobs" body={scope === "completed" ? "No completed jobs yet." : scope === "active" ? "Nothing in progress." : "Try another search or post a new mandate."} />}
  </>;
}

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
  return <>
    <AgenticPageHeader eyebrow="Create mandate" title="Post a job" description="Describe the outcome in plain English. You will review the exact parsed requirements before anything is committed on Base." />
    <div className="grid gap-5 xl:grid-cols-[1fr_370px]">
      <div className="space-y-5">
        <AgenticPanel title="01 · Choose the buyer agent" icon={Bot}>{agents.length ? <select value={selected?.id ?? ""} onChange={(e) => { setAgentId(e.target.value); invalidate(); }} className="agentic-input"><option value="" disabled>Select agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.eloRating} ELO · {agent.wins} wins</option>)}</select> : <Empty title="No agent available" body="Create an agent in KULT Games before posting commercial work." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} />}</AgenticPanel>
        <AgenticPanel title="02 · Describe the outcome" icon={Sparkles}><textarea rows={7} className="agentic-input resize-none leading-6" placeholder="Example: Train my agent for Warzone Warrior to reach at least 70 combat skill. The trainer must have 90+ combat skill and 100 wins." value={prompt} onChange={(e) => { setPrompt(e.target.value); invalidate(); }} /><button onClick={() => { setPrompt("Train my agent for Warzone Warrior to reach at least 70 combat skill. The trainer must have 90+ combat skill and 100 Warzone wins."); invalidate(); }} className="mt-2 text-[10px] text-[#0052ff]/70 hover:text-[#0052ff]">Use example prompt</button></AgenticPanel>
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
      </aside>
    </div>
  </>;
}

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
    <Link to="/jobs" className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/35 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Discover jobs</Link>
    <AgenticPageHeader eyebrow={`Job ${shortHash(job.id, 5)}`} title={`${job.gameId} mandate`} description={job.prompt} action={<Status status={job.status} />} />
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
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-white/9">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("border-b-2 px-4 py-3 font-tech text-[9px] font-bold uppercase tracking-[.14em]", tab === item ? "border-[#0052ff] text-[#0052ff]" : "border-transparent text-white/30 hover:text-white/60")}>{item}</button>)}</div>
    {tab === "overview" ? <div className="space-y-5">
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
      <AgenticPanel title="Requirement integrity" icon={Fingerprint}><Info label="Requirements hash" value={shortHash(job.requirementsHash, 8)} mono /><Info label="0G root hash" value={shortHash(job.requirementsRootHash, 8)} mono /><Info label="Recomputed" value={verification.valid ? "Valid — bytes match commitment" : "Invalid"} /><a className="mt-4 inline-flex items-center gap-2 text-[10px] text-[#0052ff]" href={a2aMarketplaceApi.requirementsDocumentUrl(job.id)} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open canonical document</a></AgenticPanel>
      <div className="space-y-5">
        <AgenticPanel title="Base record" icon={ShieldCheck}><Info label="Chain state" value={onChain ? String(onChain.status ?? job.status) : job.status} />{job.postTxHash ? <a className="mt-4 inline-flex items-center gap-2 text-[10px] text-[#0052ff]" href={BASESCAN_TX(job.postTxHash)} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> View transaction {shortHash(job.postTxHash, 5)}</a> : <p className="mt-4 text-xs text-white/30">No posting transaction yet.</p>}</AgenticPanel>
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
  </>;
}

export function AgenticMyJobsPage() {
  const [view, setView] = useState("hiring");
  const { data: agentsData } = useMyArenaAgents();
  const myAgentIds = useMemo(() => new Set((agentsData?.agents ?? []).map((a) => a.id)), [agentsData]);
  const { data: listing, isLoading } = useQuery({ queryKey: ["agentic", "jobs", "mine"], queryFn: () => a2aMarketplaceApi.listJobs("all"), refetchInterval: 15_000 });
  const all = listing?.jobs ?? [];
  const hiring = useMemo(() => all.filter((job) => myAgentIds.has(job.creatorAgentId)), [all, myAgentIds]);
  const working = useMemo(() => all.filter((job) => job.providerAgentId && myAgentIds.has(job.providerAgentId)), [all, myAgentIds]);
  const jobs = view === "hiring" ? hiring : working;
  return <><AgenticPageHeader eyebrow="Operations queue" title="My jobs" description="Track mandates your agents created or joined. Prioritise anything waiting for a signature, decision, or delivery." action={<Link to="/jobs/new" className="agentic-primary"><Plus className="h-4 w-4" /> New job</Link>} /><div className="mb-5 flex border-b border-white/9"><button onClick={() => setView("hiring")} className={cn("px-5 py-3 font-tech text-[10px] uppercase tracking-wider", view === "hiring" ? "border-b-2 border-[#0052ff] text-[#0052ff]" : "text-white/30")}>Hiring {hiring.length ? <span className="ml-1 text-white/30">{hiring.length}</span> : null}</button><button onClick={() => setView("working")} className={cn("px-5 py-3 font-tech text-[10px] uppercase tracking-wider", view === "working" ? "border-b-2 border-[#0052ff] text-[#0052ff]" : "text-white/30")}>Working {working.length ? <span className="ml-1 text-white/30">{working.length}</span> : null}</button></div>{isLoading ? <Loading label="Loading operational queue…" /> : jobs.length ? <div className="space-y-3">{jobs.map((job) => <CompactJob key={job.id} job={job} action />)}</div> : <Empty title={view === "hiring" ? "No active hiring jobs" : "No provider assignments"} body={view === "hiring" ? "Post a training mandate to start hiring another agent." : "Discover work your agent qualifies for."} />}</>;
}

export function AgenticAgentsPage() {
  const { data, isLoading } = useMyArenaAgents();
  const agents = data?.agents ?? [];
  return <><AgenticPageHeader eyebrow="Commercial identities" title="My agents" description="Register ERC-8004 identities and inspect the verified performance used for marketplace eligibility." />{isLoading ? <Loading label="Loading your agents…" /> : agents.length ? <div className="grid gap-5 xl:grid-cols-2">{agents.map((agent) => <div key={agent.id} className="space-y-3"><AgenticPanel title={agent.name} icon={Bot}><div className="grid grid-cols-3 gap-3"><MiniMetric label="ELO" value={String(agent.eloRating ?? 0)} /><MiniMetric label="Wins" value={String(agent.wins ?? 0)} /><MiniMetric label="Losses" value={String(agent.losses ?? 0)} /></div><div className="mt-4 flex flex-wrap gap-2"><Tag>{agent.clan}</Tag><Tag>{agent.archetype}</Tag><Tag>{agent.evolutionStage}</Tag></div></AgenticPanel><AgentBaseIdentityCardWithAutoBid agentId={agent.id} agentName={agent.name} /></div>)}</div> : <Empty title="No agents found" body="Create an agent in KULT Games before registering a commercial identity." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} />}</>;
}

export function AgenticReputationPage() {
  const { data } = useMyArenaAgents();
  const agents = data?.agents ?? [];
  const [agentId, setAgentId] = useState("");
  const selected = agents.find((item) => item.id === agentId) ?? agents[0];
  const identity = useQuery({ queryKey: ["a2a", "identity", selected?.id], queryFn: () => a2aMarketplaceApi.getAgentIdentity(selected!.id), enabled: !!selected });
  const reputation = useQuery({ queryKey: ["a2a", "reputation", identity.data?.erc8004AgentId], queryFn: () => a2aMarketplaceApi.getOnChainReputation(identity.data!.erc8004AgentId!), enabled: !!identity.data?.erc8004AgentId });
  return <><AgenticPageHeader eyebrow="Public trust layer" title="Reputation & ledger" description="Read the portable ERC-8004 reputation written on Base after independently verified work." />{agents.length ? <select className="agentic-input mb-5 max-w-md" value={selected?.id ?? ""} onChange={(e) => setAgentId(e.target.value)}>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select> : null}{!selected ? <Empty title="No agent selected" body="Create an agent to begin building public reputation." action={{ label: "Create an agent on KULT Games", href: KULT_MY_AGENTS_URL }} /> : identity.isLoading || reputation.isLoading ? <Loading label="Reading Base registry…" /> : !identity.data?.erc8004AgentId ? <AgentBaseIdentityCard agentId={selected.id} agentName={selected.name} className="max-w-xl" /> : reputation.error ? <ErrorBox message={(reputation.error as Error).message} /> : <div className="grid gap-5 lg:grid-cols-[1fr_360px]"><AgenticPanel title="ERC-8004 scorecard" icon={BadgeCheck}><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Average score" value={reputation.data?.averageValue?.toFixed(1) ?? "—"} sub="Registry value" icon={TrendingUp} /><Metric label="Completion" value={reputation.data?.completionRatePercent != null ? `${reputation.data.completionRatePercent}%` : "—"} sub="Verified jobs" icon={CheckCircle2} /><Metric label="Feedback" value={String(reputation.data?.totalFeedback ?? 0)} sub="On-chain records" icon={MessageSquareText} /><Metric label="Clients" value={String(reputation.data?.distinctClients ?? 0)} sub="Distinct buyers" icon={Bot} /></div></AgenticPanel><AgenticPanel title="Registry identity" icon={Fingerprint}><Info label="Agent" value={selected.name} /><Info label="ERC-8004 ID" value={`#${identity.data.erc8004AgentId}`} /><Info label="Registry" value={shortHash(reputation.data?.registry, 6)} mono /><p className="mt-4 border-t border-white/8 pt-4 text-[10px] leading-5 text-white/30">Reputation is portable and readable by any ERC-8004 client, not only KULT.</p></AgenticPanel></div>}</>;
}

/** Base identity card plus the auto-bid switch, which only makes sense once the agent can actually act on it. */
function AgentBaseIdentityCardWithAutoBid({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [registered, setRegistered] = useState(false);
  return <>
    <AgentBaseIdentityCard agentId={agentId} agentName={agentName} onRegistered={() => setRegistered(true)} onStatusChange={(status) => setRegistered(status === "REGISTERED" || status === "WALLET_LINKED")} />
    <AutoBidToggle agentId={agentId} registered={registered} />
  </>;
}

function JobCard({ job }: { job: A2AJob }) { return <Link to={`/jobs/${job.id}`} className="agentic-surface group p-5 transition hover:-translate-y-0.5 hover:border-[#0052ff]/30 hover:shadow-[0_18px_55px_rgba(6,182,212,.08)]"><div className="flex items-center justify-between"><span className="font-tech text-[9px] font-bold uppercase tracking-[.18em] text-[#0052ff]/70">{job.gameId}</span><Status status={job.status} /></div><h3 className="mt-4 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white/80 group-hover:text-white">{job.prompt}</h3><div className="mt-4 flex flex-wrap gap-2"><Tag>Target {job.target.metric} {op(job.target.op)} {job.target.value}</Tag>{job.providerRequirements.slice(0, 2).map((item, index) => <Tag key={index}>{item.metric} {op(item.op)} {item.value}</Tag>)}</div><div className="mt-5 flex items-end justify-between border-t border-white/8 pt-4"><div><p className="text-[9px] uppercase tracking-wider text-white/25">Negotiation range</p><p className="mt-1 font-mono text-sm text-[#457df7]">{job.budget.min}–{job.budget.max} USDC</p></div><ArrowRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-[#0052ff]" /></div></Link>; }
function CompactJob({ job, action }: { job: A2AJob; action?: boolean }) { return <Link to={`/jobs/${job.id}`} className="flex flex-col gap-3 rounded-lg border border-white/8 bg-black/20 p-4 transition hover:border-[#0052ff]/25 hover:bg-[#0052ff]/[.025] sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-tech text-[9px] font-bold uppercase tracking-wider text-[#0052ff]">{job.gameId}</span><Status status={job.status} /></div><p className="mt-2 truncate text-xs text-white/65">{job.prompt}</p></div><div className="flex items-center justify-between gap-5"><span className="font-mono text-xs text-white/70">{job.budget.min}–{job.budget.max} USDC</span>{action ? <span className="text-[9px] uppercase tracking-wider text-[#0052ff]">Open workspace</span> : <ArrowRight className="h-4 w-4 text-white/20" />}</div></Link>; }
function NegotiationCard({ job, room, side }: { job: A2AJob; room: Negotiation; side: "CREATOR" | "PROVIDER" | null }) {
  return <AgenticPanel title={`Negotiation · ${shortHash(room.id, 5)}`} icon={MessageSquareText}>
    <div className="mb-4 flex items-center justify-between"><Status status={room.state} /><span className="font-mono text-[10px] text-white/35">{room.turn ? `${room.turn} to move` : "Closed"}</span></div>
    {!room.verification.valid ? <p className="mb-3 border border-rose-400/30 bg-rose-400/8 px-3 py-2 text-[10px] text-rose-300">Transcript failed chain verification — messages may have been altered.</p> : null}
    <ol className="space-y-2">{room.messages.map((message) => <li key={message.seq} className={cn("max-w-[85%] border p-3", message.role === "CREATOR" ? "ml-auto border-[#0052ff]/15 bg-[#0052ff]/[.04]" : "border-white/9 bg-white/[.025]")}><div className="flex items-center justify-between gap-3"><span className="font-mono text-[8px] uppercase tracking-wider text-white/30">{message.role} · {message.kind}</span>{message.price ? <span className="font-mono text-xs text-[#0052ff]">{message.price.display} USDC</span> : null}</div>{message.note ? <p className="mt-2 text-xs text-white/60">{message.note}</p> : null}<p className="mt-2 font-mono text-[8px] text-white/20">signed {shortHash(message.signature, 5)}</p></li>)}</ol>
    <NegotiationControls job={job} negotiation={room} side={side} />
  </AgenticPanel>;
}
function ExecutionPanel({ job }: { job: A2AJob }) { const stage = stageIndexForStatus(job.status); const items = [{ label: "Escrow funded", done: stage >= 3 }, { label: "Training execution", done: stage >= 4 }, { label: "Model delivered", done: stage >= 5 }, { label: "Independent verification", done: stage >= 6 }, { label: "USDC settlement", done: job.status === "SETTLED" }]; return <AgenticPanel title="Execution telemetry" icon={Activity}><div className="grid gap-3 md:grid-cols-5">{items.map((item, index) => <div key={item.label} className={cn("border p-4", item.done ? "border-[#0052ff]/20 bg-[#0052ff]/[.04]" : "border-white/8 bg-black/20")}><div className={cn("flex h-7 w-7 items-center justify-center border", item.done ? "border-[#0052ff]/30 text-[#0052ff]" : "border-white/10 text-white/20")}>{item.done ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</div><p className="mt-4 text-xs text-white/60">{item.label}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-white/25">{item.done ? "Completed" : index === Math.min(stage, 4) ? "Current stage" : "Waiting"}</p></div>)}</div><p className="mt-4 text-[10px] leading-5 text-white/30">Live episode and score telemetry appears here when the execution service advances the job to training. No simulated progress is shown.</p></AgenticPanel>; }
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
    <section className={cn("rounded-xl border p-4", accepted ? "border-[#0052ff]/40 bg-[#0052ff]/5" : "border-amber-500/40 bg-amber-500/5")}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={cn("flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em]", accepted ? "text-[#0052ff]" : "text-amber-300")}>
          {accepted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {accepted ? "Settled — trainer paid" : "Refunded — target missed"}
        </h3>
        {job.agreedPrice ? <span className="font-mono text-sm text-white">{job.agreedPrice.display} {job.agreedPrice.currency}</span> : null}
      </div>
      <p className="mt-2 text-[11px] text-white/60">{accepted ? "The escrow released the agreed price to the trainer's wallet. No human approved this payment." : "The work was delivered but did not reach the target, so the contract returned the full amount to the creator. No commission was taken."}</p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2 sm:gap-x-6">
        <div className="flex items-baseline justify-between gap-3 sm:justify-start sm:gap-2"><span className="text-[10px] uppercase tracking-wider text-white/40">Target</span><span className="font-mono text-[11px] text-white">{job.target.metric} {op(job.target.op)} {job.target.value}</span></div>
        <div className="flex items-baseline justify-between gap-3 sm:justify-start sm:gap-2"><span className="text-[10px] uppercase tracking-wider text-white/40">Measured</span><span className={cn("font-mono text-[11px]", accepted ? "text-[#0052ff]" : "text-amber-300")}>{measured === null ? "—" : String(measured)}</span></div>
      </div>
      <p className="mt-2 text-[10px] text-white/35">Measured by an independent re-run of the delivered model under a seed root generated at verification time — the trainer never saw these seeds.</p>
      {job.tx?.verdict ? <a href={BASESCAN_TX(job.tx.verdict)} target="_blank" rel="noreferrer" className={cn("mt-3 flex items-center gap-1 text-[10px]", accepted ? "text-[#0052ff] hover:text-[#457df7]" : "text-amber-300 hover:text-amber-200")}>Verdict and transfer on Base<ExternalLink className="h-2.5 w-2.5" /></a> : null}
    </section>
  );
}
function Interpretation({ interpretation }: { interpretation: ParsedInterpretation }) { return <div className="space-y-3"><Info label="Game" value={interpretation.gameId ?? "Not recognised"} /><Info label="Target" value={interpretation.target ? `${interpretation.target.metric} ${op(interpretation.target.op)} ${interpretation.target.value}` : "No target parsed"} />{interpretation.providerRequirements.map((item, index) => <Info key={index} label={index ? "" : "Provider needs"} value={`${item.metric} ${op(item.op)} ${item.value}`} />)}<Info label="Confidence" value={`${Math.round(interpretation.confidence * 100)}% · ${interpretation.method}`} />{interpretation.warnings.map((warning) => <p key={warning} className="flex gap-2 border border-amber-300/20 bg-amber-300/[.04] p-2 text-[10px] text-amber-200"><AlertTriangle className="h-3 w-3 shrink-0" />{warning}</p>)}<p className="border-t border-white/8 pt-3 text-[10px] leading-5 text-white/30">This structured interpretation—not the prose—is hashed and committed on Base.</p></div>; }
function Metric({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Activity }) { return <div className="agentic-surface p-4"><div className="flex items-center justify-between"><p className="font-tech text-[9px] font-bold uppercase tracking-[.14em] text-white/35">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0052ff]/10"><Icon className="h-4 w-4 text-[#0052ff]/70" /></span></div><p className="mt-4 font-tech text-2xl font-black text-white">{value}</p><p className="mt-1 text-[10px] text-white/30">{sub}</p></div>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-white/8 bg-black/20 p-3"><p className="font-tech text-[8px] font-bold uppercase tracking-wider text-white/30">{label}</p><p className="mt-2 font-tech text-lg font-bold">{value}</p></div>; }
function Integrity({ label, body }: { label: string; body: string }) { return <div className="flex gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0052ff]" /><div><p className="text-xs font-semibold text-white/70">{label}</p><p className="mt-1 text-[10px] text-white/30">{body}</p></div></div>; }
function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) { return <div className="flex items-start justify-between gap-5 border-b border-white/7 py-3 first:pt-0 last:border-0 last:pb-0"><span className="text-[9px] uppercase tracking-[.13em] text-white/28">{label}</span><span className={cn("text-right text-xs text-white/70", mono && "font-mono text-[10px]")}>{value}</span></div>; }
function TxRow({ label, hash }: { label: string; hash: string }) { return <a href={BASESCAN_TX(hash)} target="_blank" rel="noreferrer" className="flex items-baseline justify-between gap-3 transition hover:text-[#0052ff]"><span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span><span className="flex items-center gap-1 font-mono text-[10px] text-[#0052ff]">{shortHash(hash, 4)}<ExternalLink className="h-2.5 w-2.5" /></span></a>; }
function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span className="text-[9px] uppercase tracking-wider text-white/30">{label}</span><div className="mt-2 flex items-center rounded-lg border border-white/10 bg-black/25 px-3"><input className="h-12 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} /><span className="font-mono text-[9px] text-[#0052ff]">USDC</span></div></label>; }
function Status({ status }: { status: string }) { return <span className={cn("rounded-full border px-2.5 py-1 font-tech text-[8px] font-bold uppercase tracking-[.11em]", statusTone[status] ?? "border-white/15 bg-white/5 text-white/45")}>{status}</span>; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-white/9 bg-white/[.035] px-2.5 py-1 font-tech text-[8px] font-semibold uppercase tracking-wider text-white/42">{children}</span>; }
function Loading({ label }: { label: string }) { return <div className="agentic-surface flex min-h-48 items-center justify-center gap-3 text-xs text-white/40"><Loader2 className="h-4 w-4 animate-spin text-[#0052ff]" />{label}</div>; }
/** Agents are created and managed on kult-games-v3's own /my-agents page, not here — app/ is a separate deployment. */
const KULT_MY_AGENTS_URL = "https://app.kult.games/my-agents";
function Empty({ title, body, action }: { title: string; body: string; action?: { label: string; href: string } }) { return <div className="rounded-xl border border-dashed border-white/12 px-5 py-12 text-center"><BriefcaseBusiness className="mx-auto h-7 w-7 text-white/15" /><p className="mt-3 font-tech text-xs font-bold uppercase tracking-wider text-white/55">{title}</p><p className="mx-auto mt-2 max-w-sm text-xs text-white/30">{body}</p>{action ? <a href={action.href} target="_blank" rel="noreferrer" className="agentic-primary mt-4 inline-flex"><ExternalLink className="h-4 w-4" />{action.label}</a> : null}</div>; }
function ErrorBox({ message }: { message: string }) { return <div className="flex items-start gap-3 rounded-lg border border-rose-400/25 bg-rose-400/8 p-4 text-xs text-rose-200"><AlertTriangle className="h-4 w-4 shrink-0" />{message}</div>; }
function op(value: string) { return ({ gte: "≥", gt: ">", lte: "≤", lt: "<", eq: "=" } as Record<string, string>)[value] ?? value; }
