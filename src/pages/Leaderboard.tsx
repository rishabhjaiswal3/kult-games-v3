import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown, Medal, Swords, Trophy, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { leaderboardApi } from "@/api/leaderboardApi";
import { getLeaderboardPlayerVisual } from "@/constants/arenaAgentArchetypes";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/api";

const PAGE_SIZE = 10;
const timeFilters = ["All Time", "This Week", "Today"];

const PODIUM_LAYOUT = [
  { slot: 1 as const, elevated: false, order: "order-2 sm:order-1" },
  { slot: 0 as const, elevated: true, order: "order-1 sm:order-2" },
  { slot: 2 as const, elevated: false, order: "order-3" },
];

function shortenWallet(addr: string) {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function isWalletLikeName(name: string, wallet: string) {
  const n = name.trim().toLowerCase();
  const w = wallet.trim().toLowerCase();
  if (!n || !w) return false;
  if (n === w) return true;
  if (n.includes("0x") && w.includes(n.replace(/\s/g, "").slice(0, 10))) return true;
  return shortenWallet(w) === n;
}

function playerLabels(entry: LeaderboardEntry) {
  const visual = getLeaderboardPlayerVisual(entry.wallet_address);
  const rawName = entry.name?.trim();
  const displayName =
    rawName && !isWalletLikeName(rawName, entry.wallet_address) ? rawName : visual.codename;
  return {
    displayName,
    subtitle: `${visual.archetype} · ${shortenWallet(entry.wallet_address)}`,
    portrait: visual.portrait,
    archetype: visual.archetype,
    role: visual.role,
  };
}

type PodiumTheme = {
  label: string;
  medal: string;
  pedestal: string;
  ring: string;
  glow: string;
  card: string;
  text: string;
  score: string;
  icon: ReactNode;
};

function podiumTheme(rank: number): PodiumTheme {
  if (rank === 1) {
    return {
      label: "CHAMPION",
      medal: "🥇",
      pedestal: "h-32 bg-gradient-to-t from-[hsl(40_70%_22%/0.9)] to-[hsl(40_85%_45%/0.35)]",
      ring: "ring-[hsl(40_85%_55%/0.55)]",
      glow: "shadow-[0_0_40px_hsl(40_85%_55%/0.25)]",
      card: "border-[hsl(40_85%_55%/0.35)] bg-[linear-gradient(180deg,hsl(40_50%_14%/0.85),hsl(268_32%_8%/0.92))]",
      text: "text-[hsl(40_85%_68%)]",
      score: "text-[hsl(40_85%_62%)]",
      icon: <Crown className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />,
    };
  }
  if (rank === 2) {
    return {
      label: "RUNNER UP",
      medal: "🥈",
      pedestal: "h-24 bg-gradient-to-t from-[hsl(220_20%_20%/0.9)] to-[hsl(220_15%_70%/0.28)]",
      ring: "ring-[hsl(220_15%_75%/0.4)]",
      glow: "shadow-[0_0_24px_hsl(220_15%_75%/0.12)]",
      card: "border-[hsl(220_15%_75%/0.28)] bg-[linear-gradient(180deg,hsl(220_25%_12%/0.85),hsl(268_32%_8%/0.92))]",
      text: "text-[hsl(220_15%_82%)]",
      score: "text-[hsl(220_15%_85%)]",
      icon: <Medal className="h-3.5 w-3.5 text-[hsl(0,0%,78%)]" />,
    };
  }
  return {
    label: "THIRD PLACE",
    medal: "🥉",
    pedestal: "h-20 bg-gradient-to-t from-[hsl(25_45%_18%/0.9)] to-[hsl(25_70%_50%/0.28)]",
    ring: "ring-[hsl(25_70%_50%/0.4)]",
    glow: "shadow-[0_0_24px_hsl(25_70%_50%/0.14)]",
    card: "border-[hsl(25_70%_50%/0.28)] bg-[linear-gradient(180deg,hsl(25_40%_12%/0.85),hsl(268_32%_8%/0.92))]",
    text: "text-[hsl(25_70%_62%)]",
    score: "text-[hsl(25_70%_60%)]",
    icon: <Medal className="h-3.5 w-3.5 text-[hsl(25,70%,50%)]" />,
  };
}

function PlayerAvatar({
  entry,
  className,
  badge,
}: {
  entry: LeaderboardEntry;
  className?: string;
  badge?: ReactNode;
}) {
  const { portrait, displayName } = playerLabels(entry);
  return (
    <div className={cn("relative shrink-0", className)}>
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(268_32%_8%/0.65)] ring-2 ring-white/10">
        <img src={portrait} alt={`${displayName} robot`} className="h-full w-full object-contain object-center p-0.5" loading="lazy" />
      </div>
      {badge ? (
        <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-white/10 bg-background/95 px-2 py-0.5 text-[10px] font-mono font-semibold shadow-lg">
          {badge}
        </div>
      ) : null}
    </div>
  );
}

function PodiumCard({
  entry,
  elevated,
  className,
}: {
  entry: LeaderboardEntry;
  elevated?: boolean;
  className?: string;
}) {
  const theme = podiumTheme(entry.rank);
  const { displayName, subtitle } = playerLabels(entry);
  const thumbSize = elevated ? "h-24 w-24 md:h-28 md:w-28" : "h-[4.5rem] w-[4.5rem] md:h-20 md:w-20";

  return (
    <motion.div
      className={cn("flex w-full flex-col items-center", elevated && "md:-mt-6", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: elevated ? 0.08 : 0 }}
    >
      <div
        className={cn(
          "relative z-10 w-full rounded-2xl border px-4 pb-5 pt-6 text-center backdrop-blur-md",
          theme.card,
          theme.glow,
          elevated && "md:px-5 md:pb-6 md:pt-7"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

        <div className="mb-3 flex justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/80 px-2.5 py-1 font-display text-[10px] font-bold tracking-[0.16em]",
              theme.text
            )}
          >
            <span aria-hidden>{theme.medal}</span>
            {theme.icon}
            {theme.label}
          </span>
        </div>

        <div className="relative mx-auto mb-4 w-fit">
          {elevated ? (
            <motion.div
              className="pointer-events-none absolute -inset-3 rounded-2xl border border-[hsl(40_85%_55%/0.35)]"
              animate={{ scale: [1, 1.1, 1], opacity: [0.45, 0.12, 0.45] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
          <PlayerAvatar
            entry={entry}
            className={thumbSize}
            badge={
              <>
                {theme.icon}
                <span>#{entry.rank}</span>
              </>
            }
          />
        </div>

        <h3 className={cn("truncate px-1 font-display text-base font-bold md:text-lg", theme.text)}>{displayName}</h3>
        <p className="mt-1 truncate px-1 font-mono text-[10px] text-muted-foreground">{subtitle}</p>
        {entry.level ? (
          <p className="mt-2 font-mono text-[10px] tracking-wider text-muted-foreground">Level {entry.level}</p>
        ) : null}
        <p className={cn("mt-3 font-display text-3xl font-black tabular-nums md:text-4xl", theme.score)}>
          {Math.round(entry.score).toLocaleString()}
        </p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">SCORE</p>
        {entry.wins != null ? (
          <p className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            <Swords className="h-3 w-3 text-neon-cyan/80" />
            {entry.wins} wins
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "relative -mt-1 w-full rounded-t-2xl border border-white/[0.1] border-b-0",
          theme.pedestal,
          elevated && "shadow-[0_-12px_40px_hsl(40_85%_55%/0.15)]"
        )}
      >
        <span className="absolute inset-x-0 top-2 text-center font-display text-4xl font-black text-white/[0.06]">
          {entry.rank}
        </span>
      </div>
    </motion.div>
  );
}

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-4 w-4 text-[hsl(var(--gold))]" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-[hsl(0,0%,78%)]" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-[hsl(25,70%,50%)]" />;
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-background/50 font-display text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

function rowAccent(rank: number) {
  if (rank === 1) return "bg-[hsl(40_85%_55%/0.04)] hover:bg-[hsl(40_85%_55%/0.08)]";
  if (rank === 2) return "bg-[hsl(220_15%_75%/0.03)] hover:bg-[hsl(220_15%_75%/0.07)]";
  if (rank === 3) return "bg-[hsl(25_70%_50%/0.04)] hover:bg-[hsl(25_70%_50%/0.08)]";
  return "hover:bg-neon-cyan/[0.04]";
}

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", "global", page, PAGE_SIZE],
    queryFn: () => leaderboardApi.getGlobal(page, PAGE_SIZE),
    staleTime: 60_000,
  });

  const players = data?.entries ?? [];
  const total = data?.total ?? players.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tableRows = page === 1 ? players.slice(3) : players;
  const maxScore = Math.max(...players.map((p) => p.score), 1);

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 z-0">
        <AutoPlayVideo src="/videos/SC_7.mp4" loop className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background/92" />
      </div>

      <section className="relative z-10 overflow-hidden pt-24 pb-16">
        <motion.div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
          style={{
            backgroundImage: `
            linear-gradient(hsl(195 100% 50% / 0.45) 1px, transparent 1px),
            linear-gradient(90deg, hsl(195 100% 50% / 0.45) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8">
          <div className="glass-panel relative mb-10 overflow-hidden rounded-2xl p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="pointer-events-none absolute inset-0 opacity-35" style={{ background: "var(--gradient-glow)" }} />
            <div className="relative z-10 max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="live-dot h-2 w-2 rounded-full bg-neon-cyan" />
                <span className="font-display text-[10px] tracking-[0.28em] text-neon-cyan">GLOBAL RANKINGS</span>
              </div>
              <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                LEADER<span className="text-gradient-hero">BOARD</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Top pilots ranked by arena score — each wallet is paired with a fighter spirit from the roster.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {timeFilters.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeFilter(tf)}
                    className={`rounded-full px-4 py-1.5 font-display text-xs font-semibold tracking-wider transition-all ${
                      timeFilter === tf ? "btn-eye" : "btn-eye-outline"
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative z-10 mt-6 hidden h-36 w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-black/30 lg:mt-0 lg:block lg:h-40 lg:w-72">
              <AutoPlayVideo src="/videos/SC_7.mp4" loop className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/40" />
            </div>
          </div>

          {page === 1 ? (
            <div className="mb-12">
              <div className="mb-5 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[hsl(var(--gold))]" />
                <span className="font-display text-[10px] tracking-[0.28em] text-muted-foreground">TOP CHAMPIONS</span>
              </div>

              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3 sm:gap-6">
                {isLoading
                  ? PODIUM_LAYOUT.map(({ slot, order }) => (
                      <div key={slot} className={cn("flex flex-col items-center", order)}>
                        <div className="glass-panel w-full rounded-2xl p-5">
                          <Skeleton className={cn("mx-auto rounded-2xl", slot === 0 ? "h-24 w-24" : "h-16 w-16")} />
                          <Skeleton className="mx-auto mt-4 h-4 w-28" />
                          <Skeleton className="mx-auto mt-2 h-8 w-20" />
                        </div>
                        <Skeleton className={cn("mt-3 w-full rounded-t-xl", slot === 0 ? "h-32" : slot === 1 ? "h-24" : "h-20")} />
                      </div>
                    ))
                  : PODIUM_LAYOUT.map(({ slot, elevated, order }) => {
                      const entry = players[slot];
                      if (!entry) return null;
                      return <PodiumCard key={entry.rank} entry={entry} elevated={elevated} className={order} />;
                    })}
              </div>
            </div>
          ) : null}

          <div className="glass-panel overflow-hidden rounded-2xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                {page === 1 ? "RANKS 4–10" : `RANKS ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">{total} pilots · page {page}/{totalPages}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-background/30 text-left">
                    <th className="p-4 text-[10px] font-mono tracking-wider text-muted-foreground">RANK</th>
                    <th className="p-4 text-[10px] font-mono tracking-wider text-muted-foreground">FIGHTER</th>
                    <th className="hidden p-4 text-[10px] font-mono tracking-wider text-muted-foreground md:table-cell">ARCHETYPE</th>
                    <th className="hidden p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground sm:table-cell">LEVEL</th>
                    <th className="p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground">SCORE</th>
                    <th className="hidden p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground sm:table-cell">WINS</th>
                    <th className="hidden p-4 text-center text-[10px] font-mono tracking-wider text-muted-foreground lg:table-cell">POWER</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading &&
                    Array.from({ length: page === 1 ? 7 : PAGE_SIZE }).map((_, i) => (
                      <tr key={i} className="border-b border-border/10">
                        <td className="p-4"><Skeleton className="h-7 w-7 rounded-lg" /></td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                        </td>
                        <td className="hidden p-4 md:table-cell"><Skeleton className="h-4 w-16" /></td>
                        <td className="hidden p-4 sm:table-cell"><Skeleton className="ml-auto h-4 w-8" /></td>
                        <td className="p-4"><Skeleton className="ml-auto h-4 w-16" /></td>
                        <td className="hidden p-4 sm:table-cell"><Skeleton className="ml-auto h-4 w-8" /></td>
                        <td className="hidden p-4 lg:table-cell"><Skeleton className="mx-auto h-4 w-20" /></td>
                      </tr>
                    ))}
                  {!isLoading && tableRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center font-mono text-sm text-muted-foreground">
                        NO DATA AVAILABLE
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    tableRows.map((p) => {
                      const { displayName, subtitle, archetype } = playerLabels(p);
                      const powerPct = Math.round((p.score / maxScore) * 100);
                      return (
                        <tr key={`${p.rank}-${p.wallet_address}`} className={cn("group border-b border-white/[0.06] transition-colors", rowAccent(p.rank))}>
                          <td className="p-4">{rankIcon(p.rank)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <PlayerAvatar entry={p} className="h-10 w-10" />
                              <div className="min-w-0">
                                <p className="truncate font-display text-sm font-semibold text-foreground transition group-hover:text-neon-cyan">
                                  {displayName}
                                </p>
                                <p className="truncate font-mono text-[10px] text-muted-foreground">{subtitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden p-4 md:table-cell">
                            <span className="inline-flex rounded-full border border-white/10 bg-background/50 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {archetype}
                            </span>
                          </td>
                          <td className="hidden p-4 text-right text-sm text-muted-foreground sm:table-cell">{p.level ?? "—"}</td>
                          <td className="p-4 text-right font-display text-sm font-bold tabular-nums text-foreground">
                            {Math.round(p.score).toLocaleString()}
                          </td>
                          <td className="hidden p-4 text-right text-sm text-muted-foreground sm:table-cell">{p.wins ?? "—"}</td>
                          <td className="hidden p-4 lg:table-cell">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-neon-cyan/60 to-neon-cyan"
                                  style={{ width: `${powerPct}%` }}
                                />
                              </div>
                              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/60" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
              <p className="font-mono text-[10px] text-muted-foreground">
                Showing {tableRows.length} of {total} ranked pilots
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 rounded-lg border-white/15 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[4.5rem] text-center font-mono text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 rounded-lg border-white/15 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
