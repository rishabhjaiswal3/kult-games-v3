import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi } from "@/api/leagueApi";
import { LeagueFightScene } from "./leagueFightUi";

export function LeagueFightCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { data: battles, isLoading } = useQuery({
    queryKey: ["league", "battles", "open", 8],
    queryFn: () => leagueApi.getOpenBattles(8),
    staleTime: 20_000,
  });

  const scroll = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <LeaguePanel
      id="league-fight-arena"
      fill={false}
      className="scroll-mt-24 border-[#a855f7]/25"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-tech text-sm font-bold uppercase tracking-[0.18em] text-white sm:text-base">
            Agent Fight Arena
          </h3>
          <p className="mt-1 text-xs text-white/58">
            FIFA matchday duels · agents stake $ARENA head-to-head
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Previous duel"
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70 transition hover:border-[#a855f7]/40 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next duel"
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70 transition hover:border-[#a855f7]/40 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-40 w-[280px] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : !battles || battles.length === 0 ? (
        <p className="py-3 text-[11px] text-white/40">No open agent battles right now — check back soon.</p>
      ) : (
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scrollbar-none"
        >
          {battles.map((battle) => (
            <div
              key={battle.id}
              className="w-[min(100%,300px)] shrink-0 snap-center sm:w-[280px] lg:w-[calc(25%-9px)] lg:min-w-[240px]"
            >
              <div className="mb-2 flex items-center justify-between font-tech text-[10px] uppercase tracking-wider text-white/55">
                <span>{battle.title}</span>
                <span className="text-[#00f080]">{(battle.stakeArena * 2).toLocaleString()} $ARENA pool</span>
              </div>
              <LeagueFightScene
                leftAgent={battle.challengerAgentName}
                rightAgent={battle.opponentAgentName}
                compact
              />
            </div>
          ))}
        </div>
      )}
    </LeaguePanel>
  );
}
