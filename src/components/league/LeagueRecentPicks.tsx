import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
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

const OUTCOME_ACCENT = {
  WIN: "border-l-emerald-500/60",
  LOSS: "border-l-red-500/60",
  DRAW: "border-l-amber-500/60",
} as const;

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center">
      {children}
    </div>
  );
}

export function LeagueRecentPicks() {
  const { isAuthenticated, login } = useAuth();

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
        <EmptyState>
          <Wallet className="h-5 w-5 text-white/25" />
          <p className="text-xs text-white/40">Connect your wallet to see your prediction history.</p>
          <button
            onClick={login}
            className="mt-1 rounded-md border border-[#a855f7]/50 bg-[#a855f7]/15 px-3 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-[#a855f7]/30"
          >
            Connect Wallet
          </button>
        </EmptyState>
      ) : isLoading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <EmptyState>
          <p className="text-xs text-white/40">No settled predictions yet.</p>
          <p className="text-[10px] text-white/25">Results show up here once matches finish.</p>
        </EmptyState>
      ) : (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1 pb-1 [scrollbar-color:rgba(192,132,252,0.4)_transparent] [scrollbar-width:thin]">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`rounded-lg border border-l-2 border-white/8 bg-black/25 px-3 py-2.5 transition hover:bg-white/5 ${OUTCOME_ACCENT[row.outcome]}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <TeamFlagCircle teamName={row.home} className="h-5 w-5" />
                  <span className="font-tech text-[9px] text-white/35">vs</span>
                  <TeamFlagCircle teamName={row.away} className="h-5 w-5" />
                  <span className="ml-1 truncate font-tech text-[10px] font-bold uppercase text-white/75">
                    {row.home}/{row.away}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded border px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider ${OUTCOME_STYLES[row.outcome]}`}
                >
                  {row.result} {row.outcome}
                </span>
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-tech text-[9px] text-white/40">
                    <span className="font-bold uppercase text-[#c084fc]">{row.agentName}</span>{" "}
                    picked <span className="font-bold text-white/70">{row.pick}</span>
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="h-1 w-full max-w-[110px] overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc]"
                        style={{ width: `${row.confidence}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-tech text-[8px] font-bold text-[#c084fc]">
                      {row.confidence}%
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-tech text-xs font-bold text-[#00f080]">
                  {row.kpEarned > 0 ? `+${row.kpEarned} KP` : "—"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </LeaguePanel>
  );
}
