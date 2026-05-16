import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown, Medal, Sparkles, Swords, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { leaderboardApi } from "@/api/leaderboardApi";
import { AgentNameKeyChip, agentNameAccentFromAgentId } from "@/components/arena/AgentNameKeyChip";
import { ArenaLeaderboardTableSkeleton, ArenaPodiumSkeleton } from "@/components/skeleton";
import { getLeaderboardPlayerVisual } from "@/constants/arenaAgentArchetypes";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/api";

const PAGE_SIZE = 10;
const timeFilters = ["All Time", "This Week", "Today"];

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
  pedestal: string;
  ring: string;
  glow: string;
  card: string;
  score: string;
  icon: ReactNode;
};

function podiumTheme(rank: number): PodiumTheme {
  if (rank === 1) {
    return {
      label: "CHAMPION",
      pedestal: "h-28 bg-gradient-to-t from-[hsl(40_70%_22%/0.9)] to-[hsl(40_85%_45%/0.35)]",
      ring: "ring-[hsl(40_85%_55%/0.55)]",
      glow: "shadow-[0_0_40px_hsl(40_85%_55%/0.25)]",
      card: "border-[hsl(40_85%_55%/0.35)] bg-[linear-gradient(180deg,hsl(40_50%_14%/0.85),hsl(268_32%_8%/0.92))]",
      score: "text-[hsl(40_85%_62%)]",
      icon: <Crown className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />,
    };
  }
  if (rank === 2) {
    return {
      label: "RUNNER UP",
      pedestal: "h-20 bg-gradient-to-t from-[hsl(220_20%_20%/0.9)] to-[hsl(220_15%_70%/0.28)]",
      ring: "ring-[hsl(220_15%_75%/0.4)]",
      glow: "shadow-[0_0_24px_hsl(220_15%_75%/0.12)]",
      card: "border-[hsl(220_15%_75%/0.28)] bg-[linear-gradient(180deg,hsl(220_25%_12%/0.85),hsl(268_32%_8%/0.92))]",
      score: "text-[hsl(220_15%_85%)]",
      icon: <Medal className="h-3.5 w-3.5 text-[hsl(0,0%,78%)]" />,
    };
  }
  return {
    label: "THIRD PLACE",
    pedestal: "h-16 bg-gradient-to-t from-[hsl(25_45%_18%/0.9)] to-[hsl(25_70%_50%/0.28)]",
    ring: "ring-[hsl(25_70%_50%/0.4)]",
    glow: "shadow-[0_0_24px_hsl(25_70%_50%/0.14)]",
    card: "border-[hsl(25_70%_50%/0.28)] bg-[linear-gradient(180deg,hsl(25_40%_12%/0.85),hsl(268_32%_8%/0.92))]",
    score: "text-[hsl(25_70%_60%)]",
    icon: <Medal className="h-3.5 w-3.5 text-[hsl(25,70%,50%)]" />,
  };
}

function PodiumCard({
  entry,
  elevated,
  maxScore,
  className,
}: {
  entry: LeaderboardEntry;
  elevated?: boolean;
  maxScore: number;
  className?: string;
}) {
  const theme = podiumTheme(entry.rank);
  const { displayName, subtitle, portrait } = playerLabels(entry);
  const thumbSize = elevated ? "h-16 w-16 md:h-20 md:w-20" : "h-14 w-14 md:h-16 md:w-16";
  const scoreVal = Math.round(entry.score);
  const powerPct = Math.round((scoreVal / Math.max(maxScore, 1)) * 100);
  const nameAccent = agentNameAccentFromAgentId(entry.wallet_address);

  return (
    <div className={cn("flex w-full max-w-[11rem] flex-col items-center sm:max-w-[12.5rem] lg:max-w-[13rem]", elevated && "md:-mt-4", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: elevated ? 0.1 : 0 }}
        className={cn(
          "relative w-full rounded-2xl border px-3 pb-3 pt-4 backdrop-blur-md",
          theme.card,
          theme.glow,
          elevated && "md:px-4 md:pb-4 md:pt-5"
        )}
      >
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
          aria-hidden
        />

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            {elevated ? (
              <motion.div
                className="pointer-events-none absolute -inset-2 rounded-2xl border border-[hsl(40_85%_55%/0.35)]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.45, 0.12, 0.45] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            <div className={cn("relative overflow-hidden rounded-2xl bg-[hsl(268_32%_8%/0.95)] ring-2", thumbSize, theme.ring)}>
              <img
                src={portrait}
                alt=""
                className="h-full w-full object-contain object-center p-0.5"
                loading="lazy"
              />
              <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-background/95 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider shadow-lg">
                {theme.icon}
                <span>#{entry.rank}</span>
              </div>
            </div>
          </div>

          <span className="mb-1 font-display text-[9px] tracking-[0.22em] text-muted-foreground">{theme.label}</span>
          <motion.span
            className="group mb-0 inline-flex max-w-full justify-center"
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
          >
            <AgentNameKeyChip name={displayName} accent={nameAccent} size="comfortable" className="max-w-full" />
          </motion.span>
          <p className="mt-0.5 max-w-full truncate font-mono text-[10px] text-muted-foreground">{subtitle}</p>
          {entry.level != null ? (
            <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">Level {entry.level}</p>
          ) : null}
          <p className={cn("mt-2 font-display text-xl font-black tabular-nums md:text-2xl", theme.score)}>
            {scoreVal.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">SCORE</p>

          <div className="mt-3 w-full px-0.5">
            <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
              <span>POWER</span>
              <span className="font-semibold tabular-nums text-neon-green drop-shadow-[0_0_10px_hsl(142_76%_48%/0.65)]">
                {powerPct}%
              </span>
            </div>
            <div
              className="relative h-2 w-full overflow-hidden rounded-full border border-neon-green/40 bg-black/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.75)]"
              role="presentation"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[hsl(138_72%_38%)] via-neon-green to-[hsl(158_76%_54%)] shadow-[0_0_16px_hsl(142_76%_52%/0.9),0_0_28px_hsl(142_76%_52%/0.35)]"
                style={{
                  width: `${powerPct}%`,
                  minWidth: powerPct > 0 ? "8px" : undefined,
                }}
              />
            </div>
          </div>

          {entry.wins != null ? (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              <Swords className="h-3 w-3 text-neon-cyan/80" />
              {entry.wins} wins
            </p>
          ) : null}
        </div>
      </motion.div>

      <div className={cn("mt-3 w-full rounded-t-xl border border-white/[0.08]", theme.pedestal)} />
    </div>
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

  const playersRaw = data?.entries ?? [];
  /** Never render more than one page-worth — backend may ignore `limit`. */
  const players = playersRaw.slice(0, PAGE_SIZE);
  const total = data?.total ?? players.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tableRows = page === 1 ? players.slice(3) : players;
  const maxScore = Math.max(...players.map((p) => p.score), 1);
  const top3 =
    page === 1 ? ([players[1], players[0], players[2]].filter(Boolean) as LeaderboardEntry[]) : [];
  const championScore = players.find((p) => p.rank === 1);
  const headlineTopScore =
    championScore != null ? Math.round(championScore.score) : players[0] != null ? Math.round(players[0].score) : null;

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 z-0">
        <AutoPlayVideo src="/videos/SC_7.mp4" loop className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background/92" />
      </div>

      <section className="relative z-10 scroll-mt-28 overflow-hidden pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-16 md:scroll-mt-32">
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
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[hsl(268_28%_6%/0.72)] backdrop-blur-xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `
              linear-gradient(hsl(195 100% 50% / 0.5) 1px, transparent 1px),
              linear-gradient(90deg, hsl(195 100% 50% / 0.5) 1px, transparent 1px)
            `,
                backgroundSize: "48px 48px",
              }}
            />

            <div className="relative z-10 p-5 sm:p-6 lg:p-8">
              <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="live-dot h-2 w-2 rounded-full bg-neon-cyan" />
                    <span className="font-display text-[10px] tracking-[0.28em] text-neon-cyan">
                      LIVE RANKINGS
                    </span>
                  </div>
                  <h1 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    Global <span className="text-gradient-hero">leaderboard</span>
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Top pilots ranked by arena score — each wallet wears a fighter spirit from the roster. Climb wins,
                    bank score, chase the podium.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {timeFilters.map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeFilter(tf)}
                        className={cn(
                          "rounded-full px-4 py-1.5 font-display text-xs font-semibold tracking-wider transition-all",
                          timeFilter === tf ? "btn-eye" : "btn-eye-outline"
                        )}
                      >
                        {tf.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="min-w-[7rem] rounded-xl border border-white/10 bg-background/40 px-4 py-3 text-center">
                    <p className="font-display text-xl font-black tabular-nums text-foreground">{total}</p>
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground">PILOTS</p>
                  </div>
                  <div className="min-w-[7rem] rounded-xl border border-neon-cyan/25 bg-neon-cyan/5 px-4 py-3 text-center">
                    <p className="flex items-center justify-center gap-1 font-display text-xl font-black tabular-nums text-neon-cyan">
                      <Sparkles className="h-4 w-4" aria-hidden />
                      {headlineTopScore != null ? headlineTopScore.toLocaleString() : "—"}
                    </p>
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground">TOP SCORE</p>
                  </div>
                </div>
              </header>

              {isLoading ? (
                <>
                  {page === 1 ? (
                    <>
                      <ArenaPodiumSkeleton />
                      <ArenaLeaderboardTableSkeleton rows={7} />
                    </>
                  ) : (
                    <ArenaLeaderboardTableSkeleton rows={PAGE_SIZE} />
                  )}
                </>
              ) : (
                <>
                  {page === 1 && top3.length > 0 ? (
                    <div className="mb-10">
                      <div className="mb-5 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-[hsl(var(--gold))]" aria-hidden />
                        <span className="font-display text-[10px] tracking-[0.28em] text-muted-foreground">
                          TOP CHAMPIONS
                        </span>
                      </div>
                      <div className="mx-auto grid max-w-3xl grid-cols-1 items-end justify-items-center gap-4 sm:grid-cols-3 sm:gap-4 lg:max-w-4xl">
                        {top3.map((entry, i) => (
                          <PodiumCard key={entry.rank} entry={entry} elevated={i === 1} maxScore={maxScore} />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/25">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                      <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                        {page === 1 ? "FULL STANDINGS" : `RANKS ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {total} pilots · page {page}/{totalPages}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="border-b border-white/10 bg-background/30 text-left">
                            <th className="p-4 text-[10px] font-mono tracking-wider text-muted-foreground">
                              RANK
                            </th>
                            <th className="p-4 text-[10px] font-mono tracking-wider text-muted-foreground">
                              FIGHTER
                            </th>
                            <th className="hidden p-4 text-[10px] font-mono tracking-wider text-muted-foreground md:table-cell">
                              ARCHETYPE
                            </th>
                            <th className="hidden p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground sm:table-cell">
                              LEVEL
                            </th>
                            <th className="p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground">
                              SCORE
                            </th>
                            <th className="hidden p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground sm:table-cell">
                              WINS
                            </th>
                            <th className="hidden p-4 text-center text-[10px] font-mono tracking-wider text-neon-green lg:table-cell">
                              POWER
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-12 text-center font-mono text-sm text-muted-foreground">
                                NO DATA AVAILABLE
                              </td>
                            </tr>
                          )}
                          {tableRows.map((p) => {
                            const { displayName, subtitle, archetype, portrait } = playerLabels(p);
                            const powerPct = Math.round((Math.round(p.score) / maxScore) * 100);
                            const walletAccent = agentNameAccentFromAgentId(p.wallet_address);
                            return (
                              <tr
                                key={`${p.rank}-${p.wallet_address}`}
                                className={cn(
                                  "group border-b border-white/[0.05] transition-colors",
                                  rowAccent(p.rank)
                                )}
                              >
                                <td className="p-4">{rankIcon(p.rank)}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[hsl(268_32%_8%/0.65)] ring-1 ring-white/10 transition group-hover:ring-neon-cyan/30">
                                      <img
                                        src={portrait}
                                        alt=""
                                        className="h-full w-full object-contain object-center p-0.5"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="mb-0.5 inline-flex max-w-full min-w-0">
                                        <AgentNameKeyChip
                                          name={displayName}
                                          accent={walletAccent}
                                          size="table"
                                          className="max-w-full"
                                        />
                                      </div>
                                      <p className="truncate font-mono text-[10px] text-muted-foreground">{subtitle}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden p-4 md:table-cell">
                                  <span className="inline-flex rounded-full border border-white/10 bg-background/50 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                    {archetype}
                                  </span>
                                </td>
                                <td className="hidden p-4 text-right text-sm text-muted-foreground sm:table-cell">
                                  {p.level ?? "—"}
                                </td>
                                <td className="p-4 text-right">
                                  <span className="font-display text-sm font-bold tabular-nums text-foreground">
                                    {Math.round(p.score).toLocaleString()}
                                  </span>
                                </td>
                                <td className="hidden p-4 text-right text-sm text-muted-foreground sm:table-cell">
                                  {p.wins ?? "—"}
                                </td>
                                <td className="hidden p-4 lg:table-cell">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="relative flex flex-col items-stretch gap-1">
                                      <div className="h-2.5 w-[5.5rem] overflow-hidden rounded-full border border-neon-green/35 bg-black/55 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-[hsl(138_72%_38%)] via-neon-green to-[hsl(158_76%_54%)] shadow-[0_0_14px_hsl(142_76%_52%/0.85),0_0_22px_hsl(142_76%_52%/0.3)]"
                                          style={{
                                            width: `${powerPct}%`,
                                            minWidth: powerPct > 0 ? "8px" : undefined,
                                          }}
                                        />
                                      </div>
                                      <span className="text-center font-mono text-[9px] font-semibold tabular-nums text-neon-green drop-shadow-[0_0_8px_hsl(142_76%_48%/0.45)]">
                                        {powerPct}%
                                      </span>
                                    </div>
                                    <TrendingUp
                                      className="h-4 w-4 shrink-0 text-neon-green drop-shadow-[0_0_10px_hsl(142_76%_52%/0.65)]"
                                      aria-hidden
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5" style={{display:'felx',justifyContent:'center'}}>
                      {/* <p className="font-mono text-[10px] text-muted-foreground">
                        Showing {tableRows.length} of {total} ranked pilots on this page
                      </p> */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={page <= 1 || isLoading}
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
                          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                          className="h-8 rounded-lg border-white/15 px-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
