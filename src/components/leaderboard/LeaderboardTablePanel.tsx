import { ChevronLeft, ChevronRight, Hexagon } from "lucide-react";
import { ClanIcon, OkxWordmark } from "./ClanIcon";
import type { DisplayPlayer } from "./leaderboardUtils";
import { Button } from "@/components/ui/button";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import leaderboardBackgroundVideo from "@/assets/leaderboard_background.mp4";
import { getRankFromElo } from "@/utils/rankSystem";
import { Skeleton } from "@/components/ui/skeleton";

function TableRowSkeleton({
  showPerformanceColumns,
  showLeagueColumn,
  showKultScoreColumns,
}: {
  showPerformanceColumns: boolean;
  showLeagueColumn: boolean;
  showKultScoreColumns?: boolean;
  onPlayerClick?: (player: DisplayPlayer) => void;
}) {
  return (
    <tr aria-hidden>
      <td className="px-5 py-4"><Skeleton className="h-3 w-6 bg-white/8" /></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded bg-white/8" />
          <Skeleton className="h-3 w-28 bg-white/8" />
        </div>
      </td>
      <td className="px-5 py-4"><Skeleton className="h-3 w-16 bg-white/6" /></td>
      {showPerformanceColumns ? (
        <>
          <td className="px-5 py-4 text-center"><Skeleton className="mx-auto h-3 w-6 bg-white/6" /></td>
          <td className="px-5 py-4 text-center"><Skeleton className="mx-auto h-3 w-10 bg-white/6" /></td>
          <td className="px-5 py-4 text-center"><Skeleton className="mx-auto h-3 w-6 bg-white/6" /></td>
        </>
      ) : null}
      {showKultScoreColumns ? (
        <>
          <td className="px-5 py-4 text-right"><Skeleton className="ml-auto h-3 w-14 bg-white/8" /></td>
          <td className="px-5 py-4 text-right"><Skeleton className="ml-auto h-3 w-14 bg-white/8" /></td>
        </>
      ) : (
        <td className="px-5 py-4 text-right"><Skeleton className="ml-auto h-3 w-16 bg-white/8" /></td>
      )}
      {showLeagueColumn ? (
        <td className="px-3 py-4 text-center"><Skeleton className="mx-auto h-7 w-7 rounded bg-white/8" /></td>
      ) : null}
    </tr>
  );
}

function AgentThumb({ src, className }: { src: string; className: string }) {
  if (src.endsWith(".mp4")) {
    return <video src={src} autoPlay loop muted playsInline className={className} />;
  }
  return <img src={src} alt="" className={className} />;
}

type LeaderboardTablePanelProps = {
  rows: DisplayPlayer[];
  userRow: DisplayPlayer | null;
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  pointLabel?: string;
  showPerformanceColumns?: boolean;
  showLeagueColumn?: boolean;
  /** KULT leaderboard: separate Score + KP columns instead of a single points column. */
  showKultScoreColumns?: boolean;
};

function TableRow({
  player,
  highlighted,
  pointLabel,
  showPerformanceColumns,
  showLeagueColumn,
  showKultScoreColumns,
  onPlayerClick,
}: {
  player: DisplayPlayer;
  highlighted?: boolean;
  pointLabel: string;
  showPerformanceColumns: boolean;
  showLeagueColumn: boolean;
  showKultScoreColumns?: boolean;
  onPlayerClick?: (player: DisplayPlayer) => void;
}) {
  return (
    <tr
      onClick={() => onPlayerClick?.(player)}
      onKeyDown={(event) => {
        if (onPlayerClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onPlayerClick(player);
        }
      }}
      role={onPlayerClick ? "button" : undefined}
      tabIndex={onPlayerClick ? 0 : undefined}
      aria-label={onPlayerClick ? `View details for ${player.name}` : undefined}
      className={
        highlighted
          ? `border border-[#9a35ff]/35 bg-[#9a35ff]/8 shadow-[0_0_15px_rgba(154,53,255,0.08)] ${onPlayerClick ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9a35ff]" : ""}`
          : `transition hover:bg-white/[0.02] ${onPlayerClick ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9a35ff]" : ""}`
      }
    >
      <td className={`px-5 py-4 font-tech text-[11px] ${highlighted ? "text-[#d6acff]" : ""}`}>
        {player.rank}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 overflow-hidden rounded border bg-white/5 ${
              highlighted ? "border-[#9a35ff]/40 bg-[#9a35ff]/25 shadow-[0_0_8px_rgba(154,53,255,0.2)]" : "border-white/10"
            }`}
          >
            <AgentThumb src={player.avatar} className="h-full w-full object-cover object-top" />
          </div>
          <span className={`font-semibold tracking-wide ${highlighted ? "font-bold text-white" : ""}`}>
            {player.name}
          </span>
          {player.showHexagon ? (
            <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
          ) : null}
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-white/70">
          <ClanIcon type={player.clanIconType} className="h-3.5 w-3.5" />
          {player.clanIconType === "okx" ? (
            <OkxWordmark className="h-2.5" />
          ) : (
            <span className={highlighted ? "font-semibold text-white/90" : ""}>{player.clanName}</span>
          )}
        </div>
      </td>
      {showPerformanceColumns ? (
        <>
          <td className="px-5 py-4 text-center">{player.wins ?? "—"}</td>
          <td className={`px-5 py-4 text-center ${highlighted ? "text-[#d6acff]" : ""}`}>
            {player.winRate ?? "—"}
          </td>
          <td className="px-5 py-4 text-center">{player.battles ?? "—"}</td>
        </>
      ) : null}
      {showKultScoreColumns ? (
        <>
          <td className={`px-5 py-4 text-right font-semibold ${highlighted ? "font-bold text-[#d6acff]" : ""}`}>
            {player.score ?? "0"}
          </td>
          <td className={`px-5 py-4 text-right font-semibold ${highlighted ? "font-bold text-[#d6acff]" : ""}`}>
            {player.kultPoints ?? "0"} KP
          </td>
        </>
      ) : (
        <td className={`px-5 py-4 text-right font-semibold ${highlighted ? "font-bold text-[#d6acff]" : ""}`}>
          {player.points} {pointLabel}
        </td>
      )}
      {showLeagueColumn ? (
        <td className="px-3 py-4 text-center">
          {player.eloRating != null ? (
            <img
              src={getRankFromElo(player.eloRating).image}
              alt={getRankFromElo(player.eloRating).name}
              className="mx-auto h-7 w-7 object-contain"
            />
          ) : null}
        </td>
      ) : null}
    </tr>
  );
}

export function LeaderboardTablePanel({
  rows,
  userRow,
  page,
  totalPages,
  isLoading,
  onPageChange,
  pointLabel = "PTS",
  showPerformanceColumns = true,
  showLeagueColumn = true,
  showKultScoreColumns = false,
  onPlayerClick,
}: LeaderboardTablePanelProps) {
  const showUserGap = userRow && !rows.some((r) => r.wallet === userRow.wallet);
  const columnCount =
    4 +
    (showPerformanceColumns ? 3 : 0) +
    (showKultScoreColumns ? 2 : 1) +
    (showLeagueColumn ? 1 : 0);

  return (
    <div className="arena-panel relative overflow-hidden border border-white/8">
      <AutoPlayVideo
        src={leaderboardBackgroundVideo}
        loop
        className="absolute inset-0 h-full w-full object-cover pointer-events-none opacity-25"
      />
      <div className="absolute inset-0 bg-[#04080f]/15 pointer-events-none" />

      <div className="relative z-10 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.01] font-tech text-[10px] uppercase tracking-wider text-white/45">
              <th className="px-5 py-4 font-semibold">Rank</th>
              <th className="px-5 py-4 font-semibold">Player</th>
              <th className="px-5 py-4 font-semibold">Clan</th>
              {showPerformanceColumns ? (
                <>
                  <th className="px-5 py-4 text-center font-semibold">Wins</th>
                  <th className="px-5 py-4 text-center font-semibold">Win Rate</th>
                  <th className="px-5 py-4 text-center font-semibold">Battles</th>
                </>
              ) : null}
              {showKultScoreColumns ? (
                <>
                  <th className="px-5 py-4 text-right font-semibold">Score</th>
                  <th className="px-5 py-4 text-right font-semibold">KP</th>
                </>
              ) : (
                <th className="px-5 py-4 text-right font-semibold">{pointLabel === "KP" ? "KP" : "Points"}</th>
              )}
              {showLeagueColumn ? (
                <th className="w-12 px-3 py-4 text-center font-semibold">League</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 font-medium text-white/86">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton
                  key={i}
                  showPerformanceColumns={showPerformanceColumns}
                  showLeagueColumn={showLeagueColumn}
                  showKultScoreColumns={showKultScoreColumns}
                  onPlayerClick={onPlayerClick}
                />
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-16 text-center font-tech text-white/45">
                  NO RANKINGS YET
                </td>
              </tr>
            ) : (
              rows.map((player) => (
                <TableRow
                  key={`${player.rank}-${player.wallet}`}
                  player={player}
                  pointLabel={pointLabel}
                  showPerformanceColumns={showPerformanceColumns}
                  showLeagueColumn={showLeagueColumn}
                  showKultScoreColumns={showKultScoreColumns}
                  onPlayerClick={onPlayerClick}
                />
              ))
            )}

            {showUserGap && userRow ? (
              <>
                <tr className="bg-white/[0.005]">
                  <td colSpan={columnCount} className="py-2.5 text-center text-white/20 select-none">
                    •••
                  </td>
                </tr>
                <TableRow
                  player={userRow}
                  highlighted
                  pointLabel={pointLabel}
                  showPerformanceColumns={showPerformanceColumns}
                  showLeagueColumn={showLeagueColumn}
                  showKultScoreColumns={showKultScoreColumns}
                />
              </>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2 border-t border-white/8 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="h-8 rounded-md border-white/15 bg-transparent px-2 text-white hover:bg-white/5"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[4.5rem] text-center font-tech text-xs text-white/55">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="h-8 rounded-md border-white/15 bg-transparent px-2 text-white hover:bg-white/5"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
