import { ChevronRight } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { TeamFlagCircle } from "./FlagHex";
import { LeagueStadiumBackground } from "./LeagueStadiumBackground";
import { leagueApi } from "@/api/leagueApi";
import { useMakeLeaguePick, toPickResult } from "@/hooks/useMakeLeaguePick";
import { useAuth } from "@/contexts/AuthContext";

/** Rough display-only confidence badge from a conviction tier — not authoritative scoring, just a UI label. */
const CONVICTION_PCT: Record<string, number> = { LOW: 60, MEDIUM: 75, HIGH: 90 };

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-red-500/50 bg-red-500/20 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-red-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
      </span>
      Live
    </span>
  );
}

function formatStage(stage: string): string {
  return stage.replace(/_/g, " ").replace(/\w\S*/g, (w) => w[0] + w.slice(1).toLowerCase());
}

export function LeagueFeaturedBanner() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { makePick, isLoading: isPickLoading, result: pickResult, error: pickError, hasAgent } = useMakeLeaguePick();

  const { data: match, isLoading } = useQuery({
    queryKey: ["league", "matches", "featured"],
    queryFn: () => leagueApi.getFeaturedMatch(),
    staleTime: 15_000,
    refetchInterval: 15_000, // consensus/score move server-side; poll rather than fake-animate client-side
    placeholderData: keepPreviousData,
  });

  const { data: detail } = useQuery({
    queryKey: ["league", "matches", match?.id, "detail"],
    queryFn: () => leagueApi.getMatchDetail(match!.id),
    enabled: !!match?.id,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });

  const agentBets = (detail?.agentBets ?? []).slice(0, 4);

  if (isLoading) {
    return <div className="skeleton h-[420px] w-full rounded-xl" />;
  }

  if (!match) {
    return (
      <section className="w-full rounded-xl border border-white/10 bg-[#05050a] p-6 text-center">
        <p className="text-sm text-white/50">No featured match right now — check back closer to kickoff.</p>
      </section>
    );
  }

  const consensus = match.consensus;

  const isPickingThis = isPickLoading(match.id);
  const thisPick = pickResult(match.id) ?? (match.userAgentPick ? toPickResult(match.userAgentPick) : null);
  const thisPickError = pickError(match.id);

  function handleMakeYourPick() {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!hasAgent) {
      navigate("/my-agents");
      return;
    }
    void makePick(match!.id);
  }

  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[#a855f7]/40 shadow-[0_0_56px_rgba(168,85,247,0.15)]">
      <div className="relative aspect-video w-full min-w-0 max-w-full overflow-hidden sm:aspect-auto sm:h-[340px] md:h-[400px]">
        <LeagueStadiumBackground clean />
      </div>

      <div className="w-full min-w-0 border-t border-white/10 bg-[#05050a] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-tech text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:text-xs">
              Today&apos;s Featured Prediction
            </p>
            {match.isLive ? <LiveBadge /> : null}
          </div>
          <div className="sm:text-right">
            <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
              FIFA World Cup 2026™
            </p>
            <p className="font-tech text-[9px] uppercase tracking-widest text-white/55">
              {formatStage(match.stage)}{match.matchday ? ` · Matchday ${match.matchday}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-2.5 rounded-lg border border-white/12 bg-[#080914]/95 p-3 sm:p-3.5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-center">
              <TeamFlagCircle teamName={match.home} className="mx-auto h-11 w-11 border-blue-400/35 sm:h-[3.25rem] sm:w-[3.25rem]" />
              <p className="mt-1 font-tech text-xs font-black uppercase text-white">{match.home}</p>
            </div>
            <div className="min-w-[88px] text-center sm:min-w-[130px]">
              <p className="font-tech text-[8px] uppercase tracking-[0.26em] text-[#aaa9dc] sm:text-[10px]">
                {formatStage(match.stage)}{match.matchday ? ` · MD ${match.matchday}` : ""}
              </p>
              <p className="my-0.5 font-display text-3xl font-black text-[#a78bfa]">
                {match.isLive && match.homeScore !== null && match.awayScore !== null
                  ? `${match.homeScore} - ${match.awayScore}`
                  : "VS"}
              </p>
              {match.isLive ? (
                <p className="font-tech text-[9px] uppercase tracking-[0.16em] text-emerald-400 sm:text-[10px]">
                  Live{match.liveMinute !== null ? ` · ${match.liveMinute}'` : ""}
                </p>
              ) : null}
            </div>
            <div className="text-center">
              <TeamFlagCircle teamName={match.away} className="mx-auto h-11 w-11 border-cyan-400/35 sm:h-[3.25rem] sm:w-[3.25rem]" />
              <p className="mt-1 font-tech text-xs font-black uppercase text-white">{match.away}</p>
            </div>
          </div>

          <div className="mt-2.5">
            <p className="mb-1.5 text-center font-tech text-[9px] uppercase tracking-[0.28em] text-[#aaa9dc] sm:text-[10px]">Agent Consensus</p>
            <div className="flex h-10 overflow-hidden rounded-xl border border-white/15 bg-white/5 font-tech font-black text-white sm:h-11">
              <div className="flex items-center justify-center bg-gradient-to-r from-[#244ac4] to-[#2d65dd] transition-all duration-1000" style={{ width: `${consensus.homePct}%` }}>{consensus.homePct}%</div>
              <div className="flex items-center justify-center bg-[#3b3a60] transition-all duration-1000" style={{ width: `${consensus.drawPct}%` }}>{consensus.drawPct}%</div>
              <div className="flex items-center justify-center bg-gradient-to-r from-[#139bc1] to-[#117b99] transition-all duration-1000" style={{ width: `${consensus.awayPct}%` }}>{consensus.awayPct}%</div>
            </div>
            <div className="mt-1.5 grid grid-cols-3 font-tech text-[9px] uppercase tracking-wider text-white/75 sm:text-[10px]">
              <span>{match.home} win <span className="text-blue-300">↑</span></span>
              <span className="text-center">Draw</span>
              <span className="text-right">{match.away} win <span className="text-cyan-300">↓</span></span>
            </div>
          </div>

          {agentBets.length > 0 ? (
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {agentBets.map((bet) => {
                const agent = getLeagueAgent(bet.agentName);
                if (!agent) return null;
                const pickLabel = bet.winner === "HOME" ? match.home : bet.winner === "AWAY" ? match.away : "Draw";
                return (
                  <div key={bet.agentId} className="relative flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-[#101022] p-1.5" style={{ borderTopColor: agent.accentHex }}>
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border" style={{ borderColor: agent.accentHex }}>
                      <ArenaAgentMedia src={agent.img} alt={agent.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-tech text-xs font-black uppercase text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">{agent.name}</p>
                      <p className="font-tech text-[9px] font-bold uppercase tracking-wider" style={{ color: agent.accentHex }}>
                        {pickLabel} · {CONVICTION_PCT[bet.conviction] ?? 70}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {thisPick ? (
            <div className="mt-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-2.5 text-center">
              <p className="font-tech text-[9px] uppercase tracking-wider text-white/45">{thisPick.agentName}'s pick</p>
              <p className="mt-0.5 font-tech text-sm font-bold text-emerald-300">
                {thisPick.winner === "HOME" ? match.home : thisPick.winner === "AWAY" ? match.away : "Draw"} {thisPick.scoreHome}-{thisPick.scoreAway}
              </p>
              <p className="mt-0.5 font-tech text-[9px] text-white/40">{CONVICTION_PCT[thisPick.conviction] ?? 70}% confidence</p>
              {thisPick.reasoning ? <p className="mt-1 text-[10px] italic text-white/50">&ldquo;{thisPick.reasoning}&rdquo;</p> : null}
            </div>
          ) : null}
          {thisPickError ? <p className="mt-1.5 text-center text-[10px] text-rose-400">{thisPickError}</p> : null}

          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => document.getElementById("league-fight-arena")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex min-h-[32px] flex-1 items-center justify-center gap-1.5 rounded-md border border-white/25 bg-white/5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:border-[#a855f7]/50 hover:bg-[#a855f7]/25 sm:text-[10px]">Agent Battles <ChevronRight className="h-3 w-3 shrink-0" /></button>
            {!thisPick ? (
              <button
                type="button"
                disabled={isPickingThis}
                onClick={handleMakeYourPick}
                className="min-h-[32px] flex-1 rounded-md border border-[#a855f7]/50 bg-[#a855f7]/25 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-[#a855f7]/40 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[10px]"
              >
                {isPickingThis ? "Generating…" : "Make Your Pick"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
