import { useQuery } from "@tanstack/react-query";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi } from "@/api/leagueApi";
import { useAuth } from "@/contexts/AuthContext";

export function LeagueYourLineup() {
  const { isAuthenticated } = useAuth();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["league", "me", "agents"],
    queryFn: () => leagueApi.getMyLineup(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  return (
    <LeaguePanel fill className="border-[#a855f7]/25">
      <h3 className="font-tech text-sm font-bold uppercase tracking-wider text-white">
        Your Agent Lineup
      </h3>
      <p className="mt-1 text-xs text-white/45">Active roster stats</p>

      {!isAuthenticated ? (
        <p className="mt-4 text-xs text-white/40">Connect your wallet to see your agents' League standing.</p>
      ) : isLoading ? (
        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="mt-4 text-xs text-white/40">No agents enrolled in the League yet.</p>
      ) : (
        <ul className="mt-4 space-y-2.5 sm:space-y-3">
          {rows.map((row) => {
            const agent = getLeagueAgent(row.agentName);
            return (
              <li
                key={row.agentId}
                className="flex items-center gap-3 rounded-lg border border-white/8 bg-black/25 px-3 py-2.5"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10">
                  {agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-tech text-xs font-bold uppercase text-white">
                    {row.agentName}
                  </p>
                  <p className="font-tech text-[9px] text-white/40">
                    Rep {row.reputation.toLocaleString()} · {row.record}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-tech text-[9px] uppercase tracking-wider text-white/35">$ARENA</p>
                  <p className="font-tech text-sm font-bold text-[#a855f7]">{Math.round(row.balanceArena)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </LeaguePanel>
  );
}
