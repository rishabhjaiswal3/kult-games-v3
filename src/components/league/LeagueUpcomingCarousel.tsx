import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TeamFlagHex } from "./FlagHex";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi, type MatchListItem } from "@/api/leagueApi";
import { formatKickoffDisplay, useCountdown } from "@/lib/matchTime";
import { fifaMakePickBtn, fifaSectionTitle, fifaSubTitle } from "./leagueFifaStyles";
import { useMakeLeaguePick, toPickResult, type PickResult } from "@/hooks/useMakeLeaguePick";
import { useAuth } from "@/contexts/AuthContext";

const CONVICTION_PCT: Record<string, number> = { LOW: 60, MEDIUM: 75, HIGH: 90 };

function pickLabel(pick: PickResult, match: MatchListItem): string {
  const outcome = pick.winner === "HOME" ? match.home : pick.winner === "AWAY" ? match.away : "Draw";
  return `${outcome} ${pick.scoreHome}-${pick.scoreAway}`;
}

function UpcomingMatchCard({
  match,
  onMakePick,
  isLoading,
  result,
  error,
}: {
  match: MatchListItem;
  onMakePick: (matchId: string) => void;
  isLoading: boolean;
  result: PickResult | null;
  error: string | null;
}) {
  const countdown = useCountdown(match.kickoffAt);

  return (
    <article className="w-[min(100%,240px)] shrink-0 snap-center rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/40 p-3.5 sm:w-[230px]">
      <div className="flex items-center justify-center gap-2">
        <TeamFlagHex teamName={match.home} size="md" />
        <span className="font-tech text-[10px] font-bold uppercase text-white/45">vs</span>
        <TeamFlagHex teamName={match.away} size="md" />
      </div>
      <p className="mt-2.5 text-center font-tech text-[11px] font-bold uppercase text-white/90">
        {match.home} vs {match.away}
      </p>
      <p className="mt-1 text-center font-tech text-[10px] uppercase tracking-wider text-[#c084fc]">
        {formatKickoffDisplay(match.kickoffAt)}
      </p>
      <p className="mt-1 text-center font-tech text-[9px] uppercase tracking-widest text-white/50">
        {match.stage.replace(/_/g, " ")}
      </p>
      <div className="mt-2.5 flex items-center justify-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-amber-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        Locks in {countdown}
      </div>

      {result ? (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-2 text-center">
          <p className="font-tech text-[9px] uppercase tracking-wider text-white/45">{result.agentName}'s pick</p>
          <p className="mt-0.5 font-tech text-xs font-bold text-emerald-300">{pickLabel(result, match)}</p>
          <p className="mt-0.5 font-tech text-[9px] text-white/40">{CONVICTION_PCT[result.conviction] ?? 70}% confidence</p>
        </div>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onMakePick(match.id)}
          className={`mt-3 ${fifaMakePickBtn} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isLoading ? "Generating…" : "Make Pick"}
        </button>
      )}
      {error ? <p className="mt-1.5 text-center text-[9px] text-rose-400">{error}</p> : null}
    </article>
  );
}

export function LeagueUpcomingCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { makePick, isLoading, result, error, hasAgent } = useMakeLeaguePick();

  const { data, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["league", "matches", "scheduled"],
    queryFn: () => leagueApi.listMatches({ status: "SCHEDULED", limit: 10 }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const scroll = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.offsetWidth + 12 : 200;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  function handleMakePick(matchId: string) {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!hasAgent) {
      navigate("/my-agents");
      return;
    }
    void makePick(matchId);
  }

  const matches = data?.matches ?? [];

  return (
    <LeaguePanel fill={false}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className={fifaSectionTitle}>Upcoming Matches</h3>
          <p className={fifaSubTitle}>Group stage fixtures · make your pick before kickoff</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Previous matches"
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70 transition hover:border-[#a855f7]/40 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next matches"
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70 transition hover:border-[#a855f7]/40 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoadingMatches ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-48 w-[230px] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <p className="py-4 text-[11px] text-white/40">No scheduled matches found.</p>
      ) : (
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-none"
        >
          {matches.map((match) => (
            <UpcomingMatchCard
              key={match.id}
              match={match}
              onMakePick={handleMakePick}
              isLoading={isLoading(match.id)}
              result={result(match.id) ?? (match.userAgentPick ? toPickResult(match.userAgentPick) : null)}
              error={error(match.id)}
            />
          ))}
        </div>
      )}
    </LeaguePanel>
  );
}
