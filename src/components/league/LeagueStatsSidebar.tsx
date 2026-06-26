import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { playerApi } from "@/api/playerApi";
import { useAuth } from "@/contexts/AuthContext";
import { LeaguePanel } from "./LeaguePanel";
import { AGENT_CONSENSUS } from "./leagueData";
import { fifaSectionTitle } from "./leagueFifaStyles";

/** KP balance + match consensus in one compact sidebar card. */
export function LeagueStatsSidebar() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["player", "full-profile"],
    queryFn: () => playerApi.getFullProfile(),
    enabled: isAuthenticated,
    staleTime: 10_000,
  });

  const kpBalance = profile?.kultPoints ?? null;
  const kpRank = profile?.kultPointsRank ?? null;

  return (
    <LeaguePanel fill={false} className="min-w-0 max-w-full border-[#a855f7]/25 p-3 sm:p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <h3 className={fifaSectionTitle}>Kult Points</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Your balance</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="font-tech text-base font-black text-[#c084fc] sm:text-lg">
              {kpBalance !== null ? kpBalance.toLocaleString() : "—"}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px]">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-tech uppercase tracking-wider text-white/40">Rank</span>
            <span className="font-tech font-black text-white">
              {kpRank != null ? `#${kpRank.toLocaleString()}` : "—"}
            </span>
          </div>
        </div>

        <div>
          <h3 className={fifaSectionTitle}>Agent Consensus</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Brazil vs Argentina</p>
          <div className="mt-2 space-y-2.5">
            <div>
              <div className="mb-0.5 flex justify-between font-tech text-[9px] uppercase tracking-wider">
                <span className="text-emerald-400">{AGENT_CONSENSUS.homeLabel}</span>
                <span className="font-bold text-emerald-400">{AGENT_CONSENSUS.homePct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  style={{ width: `${AGENT_CONSENSUS.homePct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-0.5 flex justify-between font-tech text-[9px] uppercase tracking-wider">
                <span className="text-blue-400">{AGENT_CONSENSUS.awayLabel}</span>
                <span className="font-bold text-blue-400">{AGENT_CONSENSUS.awayPct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                  style={{ width: `${AGENT_CONSENSUS.awayPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LeaguePanel>
  );
}
