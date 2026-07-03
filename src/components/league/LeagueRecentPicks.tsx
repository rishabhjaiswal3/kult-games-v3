import { useQuery } from "@tanstack/react-query";
import { TeamFlagCircle } from "./FlagHex";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi } from "@/api/leagueApi";
import { fifaSectionTitle, fifaSubTitle } from "./leagueFifaStyles";
import { useAuth } from "@/contexts/AuthContext";

const OUTCOME_STYLES = {
  WIN: "border-emerald-500/35 bg-emerald-500/15 text-emerald-400",
  LOSS: "border-red-500/35 bg-red-500/15 text-red-400",
  DRAW: "border-amber-500/35 bg-amber-500/15 text-amber-400",
} as const;

export function LeagueRecentPicks() {
  const { isAuthenticated } = useAuth();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["league", "me", "predictions", 10],
    queryFn: () => leagueApi.getMyRecentPicks(10),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  return (
    <LeaguePanel fill>
      <h3 className={fifaSectionTitle}>My Recent Picks</h3>
      <p className={fifaSubTitle}>Match results & KP earned this week</p>

      {!isAuthenticated ? (
        <p className="mt-3 text-xs text-white/40">Connect your wallet to see your prediction history.</p>
      ) : isLoading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="mt-3 text-xs text-white/40">No settled predictions yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto scrollbar-none">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-white/8 font-tech text-[9px] uppercase tracking-wider text-white/40">
                <th className="pb-2 pr-3">Match</th>
                <th className="pb-2 pr-3">Your Pick</th>
                <th className="pb-2 pr-3">Agent Confidence</th>
                <th className="pb-2 pr-3">Result</th>
                <th className="pb-2 text-right">KP Earned</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-1.5">
                      <TeamFlagCircle teamName={row.home} className="h-5 w-5" />
                      <span className="font-tech text-[9px] text-white/35">vs</span>
                      <TeamFlagCircle teamName={row.away} className="h-5 w-5" />
                      <span className="ml-1 font-tech text-[10px] font-bold uppercase text-white/75">
                        {row.home}/{row.away}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 font-tech text-[10px] font-bold text-white/80">
                    {row.pick}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:w-24">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc]"
                          style={{ width: `${row.confidence}%` }}
                        />
                      </div>
                      <span className="font-tech text-[9px] font-bold text-[#c084fc]">
                        {row.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-flex rounded border px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider ${OUTCOME_STYLES[row.outcome]}`}
                    >
                      {row.result} {row.outcome}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-tech text-[10px] font-bold text-[#00f080]">
                    {row.kpEarned > 0 ? `+${row.kpEarned} KP` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LeaguePanel>
  );
}
