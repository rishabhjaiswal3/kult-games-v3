import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Copy, Database, Loader2, Shield, Swords, TrendingUp,
  Zap, Activity, ExternalLink, Trophy, Clock, MessageSquare,
  Target,
} from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { leagueApi } from "@/api/leagueApi";
import { f1Api, type F1Confidence } from "@/api/f1Api";
import { resolveAgentImage } from "@/lib/agentPortrait";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import { ClanIcon } from "@/components/arena/ClanIcon";

// ── helpers ──────────────────────────────────────────────────────────────────

function clanType(agent: AiArenaAgent): "zerog" | "solana" | "base" | "okx" {
  const c = agent.clan?.toUpperCase();
  if (c === "SOLANA") return "solana";
  if (c === "BASE") return "base";
  if (c === "OKX") return "okx";
  return "zerog";
}

function clanLabel(clan?: string) {
  const n = clan?.trim().toUpperCase();
  if (n === "SOLANA") return "Solana";
  if (n === "BASE") return "Base";
  if (n === "OKX") return "OKX";
  if (n === "ZEROG" || n === "0G") return "ZeroG";
  return clan?.trim() || "AI Arena";
}

function winRate(agent: AiArenaAgent) {
  const total = agent.wins + agent.losses + (agent.draws ?? 0);
  return total ? ((agent.wins / total) * 100).toFixed(1) : "0.0";
}

function shortHash(hash: string) {
  return `${hash.slice(0, 10)}…`;
}

async function copyText(label: string, value: string) {
  await navigator.clipboard.writeText(value);
}

function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="capitalize text-white">{label}</span>
        <span className="font-tech font-bold text-white">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#9a35ff] via-[#7c6bff] to-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.55)]"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

const STAT_COLORS = {
  purple:  { border: "border-[#9a35ff]/30", glow: "154,53,255", text: "text-[#c9a6ff]" },
  cyan:    { border: "border-[#00d4ff]/30", glow: "0,212,255",  text: "text-[#7fe6ff]" },
  emerald: { border: "border-[#00f080]/30", glow: "0,240,128",  text: "text-[#6ff0b0]" },
  amber:   { border: "border-[#ffc42e]/30", glow: "255,196,46", text: "text-[#ffd97a]" },
} as const;

function StatChip({
  icon: Icon,
  label,
  value,
  color = "purple",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: keyof typeof STAT_COLORS;
}) {
  const c = STAT_COLORS[color];
  return (
    <div
      className={`group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border ${c.border} bg-gradient-to-b from-white/[0.05] to-black/30 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 hover:-translate-y-0.5`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, rgba(${c.glow},0.16), transparent 65%)` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${c.glow},0.85), transparent)` }}
      />
      <Icon className={`relative h-4 w-4 ${c.text}`} />
      <span className="relative font-tech text-[10px] font-bold uppercase tracking-wider text-white">{label}</span>
      <span className={`relative font-tech text-lg font-black ${c.text}`} style={{ textShadow: `0 0 14px rgba(${c.glow},0.55)` }}>
        {value}
      </span>
    </div>
  );
}

// ── AI Prediction Performance ────────────────────────────────────────────────
// Combines real settled predictions from both League football
// (leagueApi.getAgentPredictionPerformance) and F1 (f1Api.getAgentAccuracy)
// into one track record for this agent -- was completely absent from the My
// Agents detail view (only battle record + traits), even though "my recent
// pick" already existed on the League page for the same real data.

const F1_CONFIDENCE_PCT: Record<F1Confidence, number> = { LOW: 60, MEDIUM: 75, HIGH: 90 };

interface PredictionRow {
  id: string;
  sport: "FOOTBALL" | "F1";
  label: string;
  predictedLabel: string;
  confidencePct: number;
  isCorrect: boolean | null;
  settledAt: string | null;
}

/** Real prediction accuracy as a ring -- colorful conic-gradient donut with the percentage in the center. */
function AccuracyRing({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  return (
    <div
      className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
      style={{
        background:
          pct == null
            ? "conic-gradient(rgba(255,255,255,0.08) 0deg, rgba(255,255,255,0.08) 360deg)"
            : `conic-gradient(#00f080 0deg, #00d4ff ${value * 1.8 * 0.5}deg, #9a35ff ${value * 3.6}deg, rgba(255,255,255,0.08) ${value * 3.6}deg)`,
      }}
    >
      <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[#0a0b12]">
        <div className="text-center">
          <p className="font-tech text-lg font-black text-white">{pct != null ? `${Math.round(pct)}%` : "—"}</p>
          <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">Accuracy</p>
        </div>
      </div>
    </div>
  );
}

function PredictionMiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
      <p className="font-tech text-base font-black" style={{ color }}>{value}</p>
      <p className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}

function AiPredictionPerformanceSection({ agentId }: { agentId: string }) {
  const footballQ = useQuery({
    queryKey: ["league", "agent-predictions", agentId],
    queryFn: () => leagueApi.getAgentPredictionPerformance(agentId),
    enabled: !!agentId,
    staleTime: 30_000,
  });

  const f1Q = useQuery({
    queryKey: ["f1", "agent-accuracy", agentId],
    queryFn: () => f1Api.getAgentAccuracy(agentId),
    enabled: !!agentId,
    staleTime: 30_000,
  });

  const rows = useMemo<PredictionRow[]>(() => {
    const football: PredictionRow[] = (footballQ.data?.recent ?? []).map((p) => ({
      id: `fb-${p.id}`,
      sport: "FOOTBALL",
      label: `${p.home} vs ${p.away}`,
      predictedLabel: `${p.predictedScore}${p.actualScore ? ` (actual ${p.actualScore})` : ""}`,
      confidencePct: p.confidence,
      isCorrect: p.isCorrect,
      settledAt: p.settledAt,
    }));
    const f1: PredictionRow[] = (f1Q.data?.history ?? []).map((h) => ({
      id: `f1-${h.raceId}-${h.market}`,
      sport: "F1",
      label: `${h.grandPrixName.replace(/\s*Grand Prix\s*/i, " GP ")}· ${h.market === "WINNER" ? "Winner" : h.market === "PODIUM" ? "Podium" : "Fastest Lap"}`,
      predictedLabel: h.predictedDriverName,
      confidencePct: h.confidence ? F1_CONFIDENCE_PCT[h.confidence] : 70,
      isCorrect: h.isCorrect,
      settledAt: h.settledAt,
    }));
    return [...football, ...f1].sort((a, b) => new Date(b.settledAt ?? 0).getTime() - new Date(a.settledAt ?? 0).getTime());
  }, [footballQ.data, f1Q.data]);

  const isLoading = footballQ.isLoading || f1Q.isLoading;
  const total = (footballQ.data?.overall.total ?? 0) + (f1Q.data?.overall.total ?? 0);
  const correct = (footballQ.data?.overall.correct ?? 0) + (f1Q.data?.overall.correct ?? 0);
  const incorrect = total - correct;
  const winRatePct = total > 0 ? (correct / total) * 100 : null;

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (const row of rows) {
      if (row.isCorrect == null) continue;
      if (row.isCorrect) streak++;
      else break;
    }
    return streak;
  }, [rows]);

  const avgConfidence = rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.confidencePct, 0) / rows.length) : null;

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />;
  }
  if (total === 0) return null;

  return (
    <section className="rounded-2xl border border-[#00d4ff]/25 bg-gradient-to-br from-[#00d4ff]/[0.05] to-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-[#00d4ff]" />
        <h4 className="font-tech text-[11px] font-bold uppercase tracking-[0.18em] text-white">AI Prediction Performance</h4>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <AccuracyRing pct={winRatePct} />
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
          <PredictionMiniStat label="Predictions" value={total} color="#ffffff" />
          <PredictionMiniStat label="Correct" value={correct} color="#00f080" />
          <PredictionMiniStat label="Incorrect" value={incorrect} color="#f43f5e" />
          <PredictionMiniStat label="Streak" value={currentStreak} color="#9a35ff" />
          <PredictionMiniStat label="Avg Confidence" value={avgConfidence != null ? `${avgConfidence}%` : "—"} color="#00d4ff" />
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10">
                {["Sport", "Match", "Prediction", "Confidence", "Result"].map((h) => (
                  <th key={h} className="pb-2 font-mono text-[9px] font-bold uppercase tracking-wider text-white/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 12).map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-2">
                    <span className="font-tech text-[9px] font-bold uppercase text-white/60">{row.sport === "F1" ? "F1" : "⚽"}</span>
                  </td>
                  <td className="max-w-[180px] truncate py-2 pr-2 font-mono text-[11px] text-white">{row.label}</td>
                  <td className="max-w-[160px] truncate py-2 pr-2 font-mono text-[11px] text-white/70">{row.predictedLabel}</td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#00d4ff]" style={{ width: `${row.confidencePct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-white/50">{row.confidencePct}%</span>
                    </div>
                  </td>
                  <td className="py-2">
                    {row.isCorrect == null ? (
                      <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-tech text-[9px] font-bold uppercase text-white/40">Pending</span>
                    ) : row.isCorrect ? (
                      <span className="rounded border border-emerald-500/35 bg-emerald-500/15 px-1.5 py-0.5 font-tech text-[9px] font-bold uppercase text-emerald-400">Win</span>
                    ) : (
                      <span className="rounded border border-rose-500/35 bg-rose-500/15 px-1.5 py-0.5 font-tech text-[9px] font-bold uppercase text-rose-400">Loss</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export interface AiArenaAgentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AiArenaAgent | null;
}

export function AiArenaAgentDetailModal({ open, onOpenChange, agent }: AiArenaAgentDetailModalProps) {
  // Live agent profile (richer data)
  const profileQ = useQuery({
    queryKey: ["arena-agent-profile", agent?.id],
    queryFn: () => aiArenaGatewayApi.getAgentById(agent!.id),
    enabled: open && !!agent?.id,
    staleTime: 30_000,
  });

  // Evolution data
  const evolutionQ = useQuery({
    queryKey: ["arena-agent-evolution", agent?.id],
    queryFn: () => aiArenaGatewayApi.getAgentEvolution(agent!.id),
    enabled: open && !!agent?.id,
    staleTime: 30_000,
  });

  // Training jobs for this agent
  const trainingQ = useQuery({
    queryKey: ["arena-agent-training", agent?.id],
    queryFn: () => aiArenaGatewayApi.getAgentTrainingJobs(agent!.id),
    enabled: open && !!agent?.id,
    staleTime: 30_000,
  });

  // Wallet balance
  const walletQ = useQuery({
    queryKey: ["arena-agent-wallet", agent?.id],
    queryFn: () => aiArenaGatewayApi.getAgentWalletBalance(agent!.id),
    enabled: open && !!agent?.id,
    staleTime: 30_000,
  });

  // Leaderboard rank for this agent
  const leaderboardQ = useQuery({
    queryKey: ["arena-leaderboard-rank", agent?.id],
    queryFn: () => aiArenaGatewayApi.getLeaderboardRankForAgent(agent!.id),
    enabled: open && !!agent?.id,
    staleTime: 60_000,
  });

  // Battle memories (0G Storage archives)
  const memoriesQ = useQuery({
    queryKey: ["arena-agent-memories", agent?.id],
    queryFn: () => aiArenaGatewayApi.getAgentMemories(agent!.id, 1, 10),
    enabled: open && !!agent?.id,
    staleTime: 60_000,
  });

  if (!agent) return null;

  const profile     = profileQ.data ?? agent;
  const traits      = (profile.traits as Record<string, number>) ?? {};
  const traitKeys   = Object.keys(traits);
  const meta        = profile.metadata as Record<string, unknown> | null | undefined;
  const metadataHash  = (profile.metadataRootHash ?? meta?.metadataRootHash) as string | null | undefined;
  const avatarHash    = (profile.avatarRootHash   ?? meta?.avatarRootHash)   as string | null | undefined;
  const inftTokenId   = profile.inftTokenId;
  const agentImage    = resolveAgentImage(profile);

  const activeTrainingJobs = (trainingQ.data ?? []).filter(
    (j) => j.status === "RUNNING" || j.status === "QUEUED"
  );
  const completedJobs = (trainingQ.data ?? []).filter((j) => j.status === "COMPLETED");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent size="xl">
        {/* Header */}
        <ArenaDialogHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#9a35ff]/40 bg-gradient-to-br from-[#9a35ff]/25 to-[#9a35ff]/5 shadow-[0_0_18px_rgba(154,53,255,0.35)]">
              {agentImage.endsWith(".mp4") ? (
                <video src={agentImage} autoPlay loop muted playsInline className="h-full w-full object-cover object-top" />
              ) : (
                <img src={agentImage} alt={profile.name} className="h-full w-full object-cover object-top" />
              )}
            </div>
            <div className="min-w-0">
              <ArenaDialogTitle className="truncate bg-gradient-to-r from-white to-[#c9a6ff] bg-clip-text font-tech text-lg font-black uppercase tracking-wide text-transparent">
                {profile.name}
              </ArenaDialogTitle>
              <ArenaDialogDescription className="flex items-center gap-2 text-[11px] text-white">
                <ClanIcon type={clanType(profile)} className="h-3 w-3" />
                <span>{clanLabel(profile.clan)} · {profile.archetype} · {profile.evolutionStage}</span>
              </ArenaDialogDescription>
            </div>
            {profileQ.isFetching && <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin text-white" />}
          </div>
        </ArenaDialogHeader>

        <ArenaDialogBody className="space-y-5 scrollbar-none">

          {/* ── Stats grid ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip icon={TrendingUp} label="ELO" value={profile.eloRating.toLocaleString()} color="purple" />
            <StatChip icon={Swords}     label="Win Rate" value={`${winRate(profile)}%`} color="cyan" />
            <StatChip icon={Shield}     label="Battles" value={(profile.wins + profile.losses + (profile.draws ?? 0)).toLocaleString()} color="emerald" />
            <StatChip
              icon={Trophy}
              label="Rank"
              value={leaderboardQ.data?.rank ? `#${leaderboardQ.data.rank}` : leaderboardQ.isLoading ? "…" : "—"}
              color="amber"
            />
          </div>

          {/* ── Battle record ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-black/30 p-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h4 className="mb-4 font-tech text-[11px] font-bold uppercase tracking-[0.18em] text-white">Battle Record</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] py-2.5">
                <div className="font-tech text-2xl font-black text-emerald-400 [text-shadow:0_0_16px_rgba(0,240,128,0.5)]">{profile.wins}</div>
                <div className="mt-0.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white">Wins</div>
              </div>
              <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.06] py-2.5">
                <div className="font-tech text-2xl font-black text-rose-400 [text-shadow:0_0_16px_rgba(244,63,94,0.5)]">{profile.losses}</div>
                <div className="mt-0.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white">Losses</div>
              </div>
              <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.06] py-2.5">
                <div className="font-tech text-2xl font-black text-amber-400 [text-shadow:0_0_16px_rgba(255,196,46,0.5)]">{profile.draws ?? 0}</div>
                <div className="mt-0.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white">Draws</div>
              </div>
            </div>
          </section>

          {/* ── AI Prediction Performance (League football + F1) ─────── */}
          <AiPredictionPerformanceSection agentId={profile.id} />

          {/* ── Traits ───────────────────────────────────────────────── */}
          {traitKeys.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.045] to-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <h4 className="mb-3 font-tech text-[11px] font-bold uppercase tracking-[0.18em] text-white">Traits</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {traitKeys.map((k) => (
                  <TraitBar key={k} label={k} value={Number(traits[k])} />
                ))}
              </div>
            </section>
          )}

          {/* ── Evolution ────────────────────────────────────────────── */}
          {evolutionQ.data && (
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.045] to-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <h4 className="mb-2 font-tech text-[11px] font-bold uppercase tracking-[0.18em] text-white">Evolution</h4>
              <div className="flex flex-wrap gap-4 text-[12px]">
                <span className="text-white">Stage <span className="font-bold text-white">{evolutionQ.data.currentStage}</span></span>
                <span className="text-white">Battles <span className="font-bold text-white">{evolutionQ.data.totalBattles}</span></span>
                <span className="text-white">ELO <span className="font-bold text-white">{evolutionQ.data.eloRating}</span></span>
                <span className={`font-bold ${evolutionQ.data.eligibleForEvolution ? "text-emerald-400" : "text-white"}`}>
                  {evolutionQ.data.eligibleForEvolution ? "✓ Evolution Ready" : "Not eligible yet"}
                </span>
              </div>
            </section>
          )}

          {/* ── Training ─────────────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.045] to-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-tech text-[11px] font-bold uppercase tracking-[0.18em] text-white">Training</h4>
              {trainingQ.isFetching && <Loader2 className="h-3 w-3 animate-spin text-white" />}
            </div>
            {trainingQ.isLoading ? (
              <div className="text-[12px] text-white">Loading…</div>
            ) : (trainingQ.data ?? []).length === 0 ? (
              <div className="text-[12px] text-white">No training jobs found.</div>
            ) : (
              <div className="space-y-2">
                {activeTrainingJobs.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/8 px-3 py-2">
                    <Activity className="h-3.5 w-3.5 animate-pulse text-sky-400" />
                    <span className="font-tech text-[11px] font-bold text-sky-300">
                      {activeTrainingJobs.length} active job{activeTrainingJobs.length > 1 ? "s" : ""} running
                    </span>
                  </div>
                )}
                {(trainingQ.data ?? []).slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded border border-white/5 bg-white/2 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-purple-400/60" />
                      <span className="text-[11px] text-white">{job.type?.replace(/_/g, " ") ?? "Training"}</span>
                    </div>
                    <span className={`font-tech text-[10px] font-bold uppercase ${
                      job.status === "COMPLETED" ? "text-emerald-400" :
                      job.status === "RUNNING"   ? "text-sky-400" :
                      job.status === "FAILED"    ? "text-rose-400" : "text-amber-400"
                    }`}>{job.status}</span>
                  </div>
                ))}
                {completedJobs.length > 0 && (
                  <div className="pt-1 text-right text-[10px] text-white">
                    {completedJobs.length} completed session{completedJobs.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── 0G Storage ───────────────────────────────────────────── */}
          {(metadataHash || avatarHash || inftTokenId) && (
            <section className="rounded-xl border border-[#9a35ff]/25 bg-[#9a35ff]/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-[#9a35ff]" />
                <h4 className="font-tech text-[11px] font-bold uppercase tracking-wider text-[#9a35ff]">0G Storage & Chain</h4>
              </div>
              <div className="space-y-2.5 text-[12px]">
                {inftTokenId && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-white">INFT Token</span>
                    <span className="font-mono font-bold text-emerald-400">#{inftTokenId}</span>
                    <a
                      href={`https://chainscan.0g.ai/token/0xf39310130EA1d8ca76e84A5A90D24f8Bd4f1656F?a=${inftTokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-[#9a35ff]/60 underline transition hover:text-[#9a35ff]"
                    >
                      view on 0G Chain <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                )}
                {metadataHash && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-white">Metadata root hash</span>
                    <button
                      type="button"
                      className="flex items-center gap-1 font-mono text-[#00d4ff]/80 transition hover:text-[#00d4ff]"
                      onClick={() => void copyText("Metadata root hash", metadataHash)}
                    >
                      <span>{shortHash(metadataHash)}</span>
                      <Copy className="h-2.5 w-2.5 shrink-0" />
                    </button>
                    <a
                      href={`https://storagescan.0g.ai/tx/${metadataHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-[#9a35ff]/60 underline transition hover:text-[#9a35ff]"
                    >
                      view on 0G scan <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                )}
                {avatarHash && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-white">Avatar root hash</span>
                    <button
                      type="button"
                      className="flex items-center gap-1 font-mono text-[#00d4ff]/80 transition hover:text-[#00d4ff]"
                      onClick={() => void copyText("Avatar root hash", avatarHash)}
                    >
                      <span>{shortHash(avatarHash)}</span>
                      <Copy className="h-2.5 w-2.5 shrink-0" />
                    </button>
                    <a
                      href={`https://storagescan.0g.ai/tx/${avatarHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-[#9a35ff]/60 underline transition hover:text-[#9a35ff]"
                    >
                      view on 0G scan <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                )}
                <p className="text-[11px] text-white">
                  Agent metadata and avatar are permanently stored on 0G Storage Network.
                </p>
              </div>
            </section>
          )}

          {/* ── Battle Memories (0G Storage) ────────────────────────── */}
          <section className="rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-[#00d4ff]" />
                <h4 className="font-tech text-[11px] font-bold uppercase tracking-wider text-[#00d4ff]">
                  Battle Memories
                </h4>
                {memoriesQ.data?.total != null && (
                  <span className="rounded-full border border-[#00d4ff]/25 bg-[#00d4ff]/10 px-1.5 py-0.5 font-mono text-[9px] text-[#00d4ff]/70">
                    {memoriesQ.data.total}
                  </span>
                )}
              </div>
              {memoriesQ.isFetching && <Loader2 className="h-3 w-3 animate-spin text-white" />}
            </div>

            {memoriesQ.isLoading ? (
              <div className="text-[12px] text-white">Loading memories…</div>
            ) : (memoriesQ.data?.memories ?? []).length === 0 ? (
              <div className="space-y-1">
                <div className="text-[12px] text-white">No battle memories yet.</div>
                <div className="text-[11px] text-white">
                  Complete a match to generate AI commentary and store it permanently on 0G Storage.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(memoriesQ.data?.memories ?? []).map((mem) => {
                  const isWin  = mem.metadata?.outcome === "WIN";
                  const isLoss = mem.metadata?.outcome === "LOSS";
                  const bid    = mem.metadata?.battleId as string | undefined;
                  return (
                    <div
                      key={mem.id}
                      className="rounded-lg border border-white/5 bg-[#04080f]/60 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-tech text-[9px] font-bold uppercase tracking-wider ${
                            isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-white"
                          }`}
                        >
                          {isWin ? "✓ WIN" : isLoss ? "✗ LOSS" : mem.metadata?.outcome ?? mem.type}
                        </span>
                        <span className="font-mono text-[9px] text-white">
                          {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] italic leading-relaxed text-white">
                        "{mem.content.length > 180 ? `${mem.content.slice(0, 180)}…` : mem.content}"
                      </p>
                      {bid && (
                        <div className="flex items-center gap-1 text-[9px] text-white">
                          <span>Battle:</span>
                          <span className="font-mono">{bid.slice(0, 8)}…{bid.slice(-4)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(memoriesQ.data?.total ?? 0) > 10 && (
                  <p className="text-right font-mono text-[10px] text-white">
                    Showing 10 of {memoriesQ.data?.total} memories · stored on 0G Storage
                  </p>
                )}
              </div>
            )}
            <p className="mt-2 text-[10px] text-white">
              AI-generated commentary archived permanently on 0G decentralised storage.
            </p>
          </section>

          {/* ── Wallet ───────────────────────────────────────────────── */}
          {walletQ.data?.wallet && (
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.045] to-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <h4 className="mb-3 font-tech text-[11px] font-bold uppercase tracking-[0.18em] text-white">Custodial Wallet</h4>
              <div className="space-y-2 text-[12px]">
                {walletQ.data.wallet.solanaAddress && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-white">Solana</span>
                    <button
                      type="button"
                      className="flex items-center gap-1 break-all font-mono text-white transition hover:text-white"
                      onClick={() => void copyText("Solana address", walletQ.data.wallet.solanaAddress)}
                    >
                      {walletQ.data.wallet.solanaAddress.slice(0, 20)}…
                      <Copy className="h-2.5 w-2.5 shrink-0" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 pt-1">
                  <div>
                    <div className="font-tech text-[10px] uppercase text-white">ARENA Balance</div>
                    <div className="font-tech text-sm font-bold text-purple-300">{walletQ.data.wallet.balanceArena.toLocaleString()} ARENA</div>
                  </div>
                  <div>
                    <div className="font-tech text-[10px] uppercase text-white">SOL Balance</div>
                    <div className="font-tech text-sm font-bold text-cyan-300">{walletQ.data.wallet.balanceSol} SOL</div>
                  </div>
                  {walletQ.data.wallet.isFrozen && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-400">
                      <Shield className="h-3 w-3" /> Wallet frozen
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── Agent ID ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-white">
              <Clock className="h-3 w-3" />
              <span>Created {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 font-mono text-[11px] text-white transition hover:text-white"
              onClick={() => void copyText("Agent ID", profile.id)}
            >
              {profile.id.slice(0, 8)}…
              <Copy className="h-2.5 w-2.5" />
            </button>
          </div>

        </ArenaDialogBody>
      </ArenaDialogContent>
    </Dialog>
  );
}
