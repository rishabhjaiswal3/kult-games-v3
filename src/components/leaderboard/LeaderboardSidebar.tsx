import { Trophy } from "lucide-react";
import { RANKS, getRankFromElo, getRankProgress, eloToNextRank } from "@/utils/rankSystem";

type LeaderboardSidebarProps = {
  userRank?: number;
  userPoints?: number;
  seasonProgress?: number;
  /** Raw ELO for deriving rank badge & league name. */
  userElo?: number;
  pointLabel?: string;
  title?: string;
  /** Optional richer stats — render when provided, hide gracefully otherwise. */
  totalPlayers?: number;
  weeklyDelta?: number;
  pointsToday?: number;
  pointsWeek?: number;
  streak?: number;
  aboutTitle?: string;
  aboutText?: string;
};

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString()}`;
}

export function LeaderboardSidebar({
  userRank,
  userPoints = 0,
  seasonProgress = 62,
  userElo,
  pointLabel = "PTS",
  title = "Your Rank",
  totalPlayers,
  weeklyDelta,
  pointsToday,
  pointsWeek,
  streak,
  aboutTitle = "About Reputation.",
  aboutText = "Your score reflects contribution across KULT games, league and arena, updated live from verified activity. No token conversion, cash value, or guaranteed reward is implied.",
}: LeaderboardSidebarProps) {
  const rankValue = userRank != null ? `#${userRank.toLocaleString()}` : "UNRANKED";
  const topPercent =
    userRank != null && totalPlayers != null && totalPlayers > 0
      ? Math.max(1, Math.ceil((userRank / totalPlayers) * 100))
      : null;

  const leagueInfo = userElo != null ? getRankFromElo(userElo) : null;
  const nextRank = leagueInfo ? RANKS.find((r) => r.tier === leagueInfo.tier + 1) ?? null : null;
  const repToNext = userElo != null ? eloToNextRank(userElo) : null;
  const progress = userElo != null ? getRankProgress(userElo) : seasonProgress;

  const stats: { label: string; value: string; tone: "up" | "neutral" | "streak" }[] = [
    { label: "TODAY", value: pointsToday != null ? formatSigned(pointsToday) : "—", tone: "up" },
    { label: "THIS WEEK", value: pointsWeek != null ? formatSigned(pointsWeek) : "—", tone: "up" },
    { label: "STREAK", value: streak != null ? `🔥 ${streak}` : "—", tone: "streak" },
  ];

  return (
    <aside className="space-y-4">
      {/* ── Your Rank ───────────────────────────────────────────── */}
      <div className="arena-panel relative overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-tech text-sm font-bold tracking-wide">
            <Trophy className="h-4 w-4 text-[#f5c451]" />
            {title}
          </span>
          <span className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            LIVE
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-tech text-4xl font-black tracking-tight text-white">{rankValue}</span>
          {weeklyDelta != null && weeklyDelta !== 0 ? (
            <span
              className={`font-tech text-[13px] font-bold ${
                weeklyDelta > 0 ? "text-emerald-400" : "text-red-400/80"
              }`}
            >
              {weeklyDelta > 0 ? "▲" : "▼"}
              {Math.abs(weeklyDelta)} this week
            </span>
          ) : null}
        </div>
        {totalPlayers != null ? (
          <p className="mt-1.5 text-[12px] text-white/45">
            of {totalPlayers.toLocaleString()} players
            {topPercent != null ? <span> · top {topPercent}%</span> : null}
          </p>
        ) : null}

        {/* tier progress panel */}
        {leagueInfo ? (
          <div className="mt-4 rounded-xl border border-white/8 bg-black/25 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-tech text-sm font-bold" style={{ color: leagueInfo.color }}>
                <span
                  className="h-2.5 w-2.5 rotate-45 rounded-[2px]"
                  style={{ background: leagueInfo.color, boxShadow: `0 0 8px ${leagueInfo.color}99` }}
                />
                {leagueInfo.name}
              </span>
              {nextRank ? (
                <span className="font-tech text-[11px] text-white/40">next: {nextRank.name}</span>
              ) : (
                <span className="font-tech text-[11px] uppercase text-white/40">max tier</span>
              )}
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-white/8 bg-white/5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${leagueInfo.color}cc, ${leagueInfo.color})`,
                  boxShadow: `0 0 8px ${leagueInfo.color}88`,
                }}
              />
            </div>

            {nextRank && repToNext != null ? (
              <p className="mt-2.5 text-[12px]" style={{ color: leagueInfo.color }}>
                <strong>{repToNext.toLocaleString()} {pointLabel}</strong>{" "}
                <span className="text-white/55">to {nextRank.name}</span>
              </p>
            ) : (
              <p className="mt-2.5 text-[12px] text-white/55">
                <strong className="text-white">{userPoints.toLocaleString()}</strong> {pointLabel}
              </p>
            )}
          </div>
        ) : (
          /* Fallback panel for modes without a league tier (e.g. KULT Points) */
          <div className="mt-4 rounded-xl border border-white/8 bg-black/25 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-tech text-sm font-bold text-[#bf7fff]">
                <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#bf7fff] shadow-[0_0_8px_rgba(191,127,255,0.6)]" />
                Total Score
              </span>
              <span className="font-tech text-[11px] text-white/40">{pointLabel}</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-white/8 bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6e22ff] to-[#bd3aff] shadow-[0_0_8px_#9a35ff]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2.5 text-[12px] text-white/55">
              <strong className="text-white">{userPoints.toLocaleString()}</strong> {pointLabel} earned
            </p>
          </div>
        )}

        {/* stat tiles */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-2 py-3 text-center">
              <div
                className={`font-tech text-base font-bold ${
                  stat.tone === "up" ? "text-emerald-400" : "text-white"
                }`}
              >
                {stat.value}
              </div>
              <div className="mt-1 font-tech text-[9px] uppercase tracking-wider text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rank Tiers ──────────────────────────────────────────── */}
      <div className="arena-panel overflow-hidden p-5">
        <h3 className="font-tech text-xs font-bold uppercase tracking-[0.2em] text-white/55">Rank Tiers</h3>
        <ul className="mt-4 -mx-2 divide-y divide-white/6">
          {[...RANKS].reverse().map((tier) => {
            const isYou = leagueInfo?.tier === tier.tier;
            return (
              <li
                key={tier.tier}
                className={`flex items-center justify-between rounded-lg px-2 py-2.5 transition ${
                  isYou ? "bg-white/[0.05]" : ""
                }`}
              >
                <span className="flex items-center gap-2.5 font-tech text-[13px] font-semibold" style={{ color: tier.color }}>
                  <span
                    className="h-2.5 w-2.5 rotate-45 rounded-[2px]"
                    style={{ background: tier.color, boxShadow: isYou ? `0 0 8px ${tier.color}aa` : "none" }}
                  />
                  {tier.name}
                  {isYou ? <span className="font-tech text-[10px] uppercase tracking-wider text-white/45">◄ you</span> : null}
                </span>
                <span className="font-mono text-[12px] text-white/40">{tier.minElo.toLocaleString()}+</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── About Reputation ────────────────────────────────────── */}
      <div className="arena-panel p-5">
        <p className="text-[12px] leading-relaxed text-white/50">
          <strong className="font-semibold text-white/80">{aboutTitle}</strong>{" "}
          <span className="italic">{aboutText}</span>
        </p>
      </div>
    </aside>
  );
}
