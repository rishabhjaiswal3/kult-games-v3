import { Info, Swords, Trophy } from "lucide-react";
import { getRankFromElo } from "@/utils/rankSystem";

type LeaderboardSidebarProps = {
  userRank?: number;
  userPoints?: number;
  seasonProgress?: number;
  /** Raw ELO for deriving rank badge & league name. */
  userElo?: number;
  pointLabel?: string;
  title?: string;
  rankLabel?: string;
  infoItems?: string[];
};

export function LeaderboardSidebar({
  userRank,
  userPoints = 0,
  seasonProgress = 62,
  userElo,
  pointLabel = "PTS",
  title = "SEASON 1",
  rankLabel: rankHeading = "YOUR SEASON RANK",
  infoItems = [
    "Climb the ranks by earning points through supported activity.",
    "Different game modes can have separate leaderboards.",
    "Leaderboard data is read from the active backend ranking source.",
  ],
}: LeaderboardSidebarProps) {
  const rankValue = userRank != null ? `#${userRank}` : "UNRANKED";
  const leagueInfo = userElo != null ? getRankFromElo(userElo) : null;

  return (
    <aside className="space-y-4">
      <div className="arena-panel relative overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <span className="font-tech text-sm font-bold tracking-wide">{title}</span>
          <span className="animate-pulse rounded border border-[#9a35ff]/40 bg-[#9a35ff]/20 px-2 py-0.5 font-tech text-[9px] font-bold uppercase text-[#d7a8ff]">
            ● LIVE
          </span>
        </div>
        <p className="mt-1 text-[11px] text-white/45">Leaderboard data updates from backend rankings.</p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="font-tech text-[10px] uppercase tracking-wider text-white/45">{rankHeading}</div>
            <div className="mt-1 font-tech text-lg font-bold tracking-wide text-[#bf7fff]">{rankValue}</div>
            <div className="mt-1 text-[11px] text-white/60">
              <strong className="text-white">{userPoints.toLocaleString()}</strong> {pointLabel}
            </div>
          </div>
          {leagueInfo ? (
            <div className="flex flex-col items-center gap-1">
              <img
                src={leagueInfo.image}
                alt={leagueInfo.name}
                title={leagueInfo.name}
                className="h-[72px] w-[72px] object-contain drop-shadow-[0_0_12px_rgba(154,53,255,0.25)]"
              />
              <span
                className="font-tech text-[8px] uppercase tracking-widest"
                style={{ color: leagueInfo.color }}
              >
                {leagueInfo.shortName}
              </span>
            </div>
          ) : (
            <div className="h-[76px] w-[80px]" />
          )}
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/8 bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6e22ff] to-[#bd3aff] shadow-[0_0_8px_#9a35ff]"
            style={{ width: `${seasonProgress}%` }}
          />
        </div>
      </div>

      <div className="arena-panel space-y-4 p-5">
        <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">
          LEADERBOARD INFO
        </h3>
        <ul className="space-y-3.5">
          {infoItems.map((item, index) => {
            const Icon = index === 0 ? Trophy : index === 1 ? Swords : Info;
            return (
              <li key={item} className="flex gap-3 text-[11px] leading-relaxed text-white/66">
                <Icon className="h-4 w-4 shrink-0 text-white/45" />
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
