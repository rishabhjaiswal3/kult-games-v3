import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TeamFlagHex } from "./FlagHex";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi, type MatchListItem } from "@/api/leagueApi";
import { formatKickoffDisplay, useCountdown } from "@/lib/matchTime";
import { fifaMakePickBtn, fifaSectionTitle, fifaSubTitle } from "./leagueFifaStyles";
import { useMakeLeaguePick } from "@/hooks/useMakeLeaguePick";
import { useAuth } from "@/contexts/AuthContext";

function UpcomingMatchCard({
  match,
  onMakePick,
  isThisMatchLoading,
  isThisMatchDone,
}: {
  match: MatchListItem;
  onMakePick: (matchId: string) => void;
  isThisMatchLoading: boolean;
  isThisMatchDone: boolean;
}) {
  const countdown = useCountdown(match.kickoffAt);

  return (
    <article className="w-[min(100%,210px)] shrink-0 snap-center rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/40 p-3.5 sm:w-[190px]">
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
      <button
        type="button"
        disabled={isThisMatchLoading}
        onClick={() => onMakePick(match.id)}
        className={`mt-3 ${fifaMakePickBtn} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isThisMatchLoading ? "Generating…" : isThisMatchDone ? "✓ Picked" : "Make Pick"}
      </button>
    </article>
  );
}

export function LeagueUpcomingCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { makePick, status, pickedMatchId, hasAgent, error } = useMakeLeaguePick();

  const { data, isLoading } = useQuery({
    queryKey: ["league", "matches", "scheduled"],
    queryFn: () => leagueApi.listMatches({ status: "SCHEDULED", limit: 10 }),
    staleTime: 30_000,
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

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-48 w-[190px] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <p className="py-4 text-[11px] text-white/40">No scheduled matches found.</p>
      ) : (
        <>
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-none"
          >
            {matches.map((match) => (
              <UpcomingMatchCard
                key={match.id}
                match={match}
                onMakePick={handleMakePick}
                isThisMatchLoading={status === "loading" && pickedMatchId === match.id}
                isThisMatchDone={status === "success" && pickedMatchId === match.id}
              />
            ))}
          </div>
          {status === "error" && pickedMatchId ? (
            <p className="mt-2 text-[10px] text-rose-400">{error}</p>
          ) : null}
        </>
      )}
    </LeaguePanel>
  );
}
