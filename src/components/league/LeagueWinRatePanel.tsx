import { useQuery } from "@tanstack/react-query";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi } from "@/api/leagueApi";
import { useAuth } from "@/contexts/AuthContext";

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** "18-2" -> { wins: 18, losses: 2 }, same record format leagueReadService.predictionRecord() produces. */
function parseRecord(record: string): { wins: number; losses: number } {
  const [wins, losses] = record.split("-").map((n) => parseInt(n, 10));
  return { wins: Number.isFinite(wins) ? wins : 0, losses: Number.isFinite(losses) ? losses : 0 };
}

export function LeagueWinRatePanel() {
  const { isAuthenticated } = useAuth();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["league", "me", "agents"],
    queryFn: () => leagueApi.getMyLineup(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const totals = (rows ?? []).reduce(
    (acc, row) => {
      const { wins, losses } = parseRecord(row.record);
      return { wins: acc.wins + wins, losses: acc.losses + losses };
    },
    { wins: 0, losses: 0 },
  );
  const totalPredictions = totals.wins + totals.losses;
  const winRate = totalPredictions > 0 ? Math.round((totals.wins / totalPredictions) * 100) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - winRate / 100);

  return (
    <LeaguePanel fill={false} className="overflow-hidden border-[#a855f7]/30 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.18),transparent_45%),#070811] p-4">
      {!isAuthenticated ? (
        <p className="text-xs text-white/40">Connect your wallet to see your prediction win rate.</p>
      ) : isLoading ? (
        <div className="flex items-center gap-3.5">
          <div className="skeleton h-20 w-20 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
        </div>
      ) : totalPredictions === 0 ? (
        <p className="text-xs text-white/40">No settled predictions yet, your win rate shows up here once picks start settling.</p>
      ) : (
        <div className="flex items-center gap-3.5">
          <div className="relative grid h-20 w-20 shrink-0 place-items-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72" aria-label={`${winRate}% win rate`}>
              <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="7" />
              <circle
                cx="36"
                cy="36"
                r={RADIUS}
                fill="none"
                stroke="url(#league-win-rate-gradient)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
              <defs>
                <linearGradient id="league-win-rate-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute font-tech text-lg font-black text-white">{winRate}%</span>
          </div>
          <div className="min-w-0">
            <p className="font-tech text-base font-black text-white">Win rate</p>
            <p className="mt-0.5 text-sm text-white/50">{totals.wins} wins · {totals.losses} losses</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-white/30">Across {rows?.length ?? 0} agent{rows?.length === 1 ? "" : "s"}</p>
          </div>
        </div>
      )}
    </LeaguePanel>
  );
}
