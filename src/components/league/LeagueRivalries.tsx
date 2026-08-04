import { useQuery } from "@tanstack/react-query";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi } from "@/api/leagueApi";

export function LeagueRivalries() {
  const { data: rivalry, isLoading } = useQuery({
    queryKey: ["league", "rivalries", "featured"],
    queryFn: () => leagueApi.getFeaturedRivalry(),
    staleTime: 30_000,
  });

  const left = rivalry ? getLeagueAgent(rivalry.leftAgentName) : null;
  const right = rivalry ? getLeagueAgent(rivalry.rightAgentName) : null;

  return (
    <LeaguePanel fill>
      <h3 className="font-tech text-sm font-bold uppercase tracking-wider text-white">Rivalries</h3>
      <p className="mt-1 font-tech text-[10px] uppercase tracking-widest text-white/35">
        Head to Head
      </p>

      {isLoading ? (
        <div className="mt-4 skeleton h-32 w-full rounded-lg" />
      ) : !rivalry ? (
        <p className="mt-4 text-xs text-white/40">No rivalries have formed yet this season, check back after a few repeat matchups.</p>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex flex-col items-center gap-2 text-center min-w-0 flex-1">
              <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:h-16 sm:w-16">
                {left ? <ArenaAgentMedia src={left.img} alt={left.name} fit="cover" /> : null}
              </div>
              <span className="truncate font-tech text-[10px] font-bold uppercase text-white sm:text-xs">
                {rivalry.leftAgentName}
              </span>
              <span className="font-tech text-xl font-black text-emerald-400 sm:text-2xl">
                {rivalry.leftWins}
              </span>
            </div>

            <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/30 shrink-0">
              VS
            </span>

            <div className="flex flex-col items-center gap-2 text-center min-w-0 flex-1">
              <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:h-16 sm:w-16">
                {right ? (
                  <ArenaAgentMedia src={right.img} alt={right.name} fit="cover" className="-scale-x-100" />
                ) : null}
              </div>
              <span className="truncate font-tech text-[10px] font-bold uppercase text-white sm:text-xs">
                {rivalry.rightAgentName}
              </span>
              <span className="font-tech text-xl font-black text-blue-400 sm:text-2xl">
                {rivalry.rightWins}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/8 bg-white/5 px-2 py-2 text-center sm:px-3">
              <p className="font-tech text-[9px] uppercase tracking-wider text-white/40">Reputation</p>
              <p className="font-tech text-sm font-bold text-amber-400">+{rivalry.reputationReward}</p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/5 px-2 py-2 text-center sm:px-3">
              <p className="font-tech text-[9px] uppercase tracking-wider text-white/40">KP Reward</p>
              <p className="font-tech text-sm font-bold text-[#00f080]">+{rivalry.kpReward} KP</p>
            </div>
          </div>

          {rivalry.narrative ? (
            <div className="mt-3 space-y-1 border-t border-white/8 pt-2 text-[10px] leading-relaxed text-white/60">
              <p className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">{rivalry.narrative}</p>
            </div>
          ) : null}
        </>
      )}
    </LeaguePanel>
  );
}
