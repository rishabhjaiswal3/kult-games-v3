import { motion } from "framer-motion";
import { Crown, Medal, Sparkles, Swords, Trophy, TrendingUp } from "lucide-react";
import { type ReactNode } from "react";
import {
  ArenaLeaderboardTableSkeleton,
  ArenaPodiumSkeleton,
} from "@/components/skeleton";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import {
  leaderboardElo,
  leaderboardName,
  useEnrichedArenaLeaderboard,
} from "@/hooks/useEnrichedArenaLeaderboard";
import type { AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { cn } from "@/lib/utils";

const DEMO_LEADERBOARD_ENTRIES: AiArenaLeaderboardEntry[] = [
  {
    rank: 1,
    agentId: "agent-shadowbyte",
    score: 2056,
    eloRating: 2056,
    name: "ShadowByte",
    archetype: "Assassin",
    clan: "Void Collective",
    wins: 42,
  },
  {
    rank: 2,
    agentId: "agent-novastrike",
    score: 821,
    eloRating: 821,
    name: "NovaStrike",
    archetype: "Berserker",
    clan: "Neon Vanguard",
    wins: 38,
  },
    {
    rank: 3,
    agentId: "agent-cyberclaw",
    score: 287,
    eloRating: 287,
    name: "NovaStrike",
    archetype: "Berserker",
    clan: "Neon Vanguard",
    wins: 34,
  },
    {
    rank: 4,
    agentId: "my-agent",
    score: 198,
    eloRating: 198,
    name: "NovaStrike",
    archetype: "Berserker",
    clan: "Neon Vanguard",
    wins: 31,
  },
    {
    rank: 5,
    agentId: "agent-novastrike",
    score: 197,
    eloRating: 197,
    name: "NovaStrike",
    archetype: "Berserker",
    clan: "Neon Vanguard",
    wins: 30,
  },
];

type PodiumTheme = {
  label: string;
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
      pedestal: "h-28 bg-gradient-to-t from-[hsl(40_70%_22%/0.9)] to-[hsl(40_85%_45%/0.35)]",
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
      pedestal: "h-20 bg-gradient-to-t from-[hsl(220_20%_20%/0.9)] to-[hsl(220_15%_70%/0.28)]",
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
    pedestal: "h-16 bg-gradient-to-t from-[hsl(25_45%_18%/0.9)] to-[hsl(25_70%_50%/0.28)]",
    ring: "ring-[hsl(25_70%_50%/0.4)]",
    glow: "shadow-[0_0_24px_hsl(25_70%_50%/0.14)]",
    card: "border-[hsl(25_70%_50%/0.28)] bg-[linear-gradient(180deg,hsl(25_40%_12%/0.85),hsl(268_32%_8%/0.92))]",
    text: "text-[hsl(25_70%_62%)]",
    score: "text-[hsl(25_70%_60%)]",
    icon: <Medal className="h-3.5 w-3.5 text-[hsl(25,70%,50%)]" />,
  };
}

function agentMeta(entry: AiArenaLeaderboardEntry) {
  if (entry.archetype && entry.clan) return `${entry.archetype} · ${entry.clan}`;
  if (entry.archetype) return entry.archetype;
  if (entry.clan) return entry.clan;
  return "AI Arena agent";
}

function PodiumCard({ entry, elevated }: { entry: AiArenaLeaderboardEntry; elevated?: boolean }) {
  const theme = podiumTheme(entry.rank);
  const thumbSize = elevated ? "h-16 w-16 md:h-20 md:w-20" : "h-14 w-14 md:h-16 md:w-16";

  return (
    <div className={cn("flex w-full max-w-[11rem] flex-col items-center sm:max-w-[12.5rem] lg:max-w-[13rem]", elevated && "md:-mt-4")}>
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
            <div className={cn("relative overflow-hidden rounded-2xl ring-2", thumbSize, theme.ring)}>
              <ArenaAgentThumbnail
                agent={{ id: entry.agentId, archetype: entry.archetype, name: entry.name }}
                className="h-full w-full rounded-2xl border-0"
              />
              <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-background/95 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider shadow-lg">
                {theme.icon}
                <span>#{entry.rank}</span>
              </div>
            </div>
          </div>

          <span className="mb-1 font-display text-[9px] tracking-[0.22em] text-muted-foreground">{theme.label}</span>
          <h3 className={cn("max-w-full truncate font-display text-sm font-bold md:text-base", theme.text)}>
            {leaderboardName(entry)}
          </h3>
          <p className="mt-0.5 max-w-full truncate font-mono text-[10px] text-muted-foreground">{agentMeta(entry)}</p>
          <p className={cn("mt-2 font-display text-xl font-black tabular-nums md:text-2xl", theme.score)}>
            {leaderboardElo(entry).toLocaleString()}
          </p>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">ELO RATING</p>
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

export function ArenaAgentsLeaderboard() {
  const { data, isLoading, isError } = useEnrichedArenaLeaderboard();
  const apiEntries = data?.entries ?? [];
  const isDemo = !isLoading && (isError || apiEntries.length === 0);
  const entries = isDemo ? DEMO_LEADERBOARD_ENTRIES : apiEntries;
  const top3 = [entries[1], entries[0], entries[2]].filter(Boolean) as AiArenaLeaderboardEntry[];
  const maxElo = Math.max(...entries.map(leaderboardElo), 1);

  return (
    <section id="arena-leaderboard" className="scroll-mt-24">
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
                <span className="font-display text-[10px] tracking-[0.28em] text-neon-cyan">LIVE RANKINGS</span>
              </div>
              <h2 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Agents <span className="text-gradient-hero">leaderboard</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Top AI agents ranked by global ELO on the arena gateway — updated as battles resolve.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-background/40 px-4 py-3 text-center min-w-[7rem]">
                <p className="font-display text-xl font-black tabular-nums text-foreground">{entries.length || "—"}</p>
                <p className="font-mono text-[10px] tracking-wider text-muted-foreground">RANKED</p>
              </div>
              <div className="rounded-xl border border-neon-cyan/25 bg-neon-cyan/5 px-4 py-3 text-center min-w-[7rem]">
                <p className="flex items-center justify-center gap-1 font-display text-xl font-black tabular-nums text-neon-cyan">
                  <Sparkles className="h-4 w-4" />
                  {top3[1] ? leaderboardElo(top3[1]).toLocaleString() : "—"}
                </p>
                <p className="font-mono text-[10px] tracking-wider text-muted-foreground">TOP ELO</p>
              </div>
            </div>
          </header>

          {isLoading ? (
            <>
              <ArenaPodiumSkeleton />
              <ArenaLeaderboardTableSkeleton rows={5} />
            </>
          ) : (
            <>
          
              {top3.length > 0 ? (
              <div className="mb-10">
                <div className="mb-5 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[hsl(var(--gold))]" />
                  <span className="font-display text-[10px] tracking-[0.28em] text-muted-foreground">TOP CHAMPIONS</span>
                </div>
                <div className="mx-auto grid max-w-3xl grid-cols-1 items-end justify-items-center gap-4 sm:grid-cols-3 sm:gap-4 lg:max-w-4xl">
                  {top3.map((entry, i) => (
                    <PodiumCard key={entry.agentId} entry={entry} elevated={i === 1} />
                  ))}
                </div>
              </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/25">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                  <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">FULL STANDINGS</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {entries.length} agents{isDemo ? " · demo" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-background/30 text-left">
                        <th className="p-4 text-[10px] font-mono tracking-wider text-muted-foreground">RANK</th>
                        <th className="p-4 text-[10px] font-mono tracking-wider text-muted-foreground">AGENT</th>
                        <th className="hidden p-4 text-[10px] font-mono tracking-wider text-muted-foreground md:table-cell">ARCHETYPE</th>
                        <th className="p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground">ELO</th>
                        <th className="hidden p-4 text-right text-[10px] font-mono tracking-wider text-muted-foreground sm:table-cell">WINS</th>
                        <th className="hidden p-4 text-center text-[10px] font-mono tracking-wider text-muted-foreground lg:table-cell">POWER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const elo = leaderboardElo(entry);
                        const powerPct = Math.round((elo / maxElo) * 100);
                        return (
                          <tr
                            key={entry.agentId}
                            className={cn("border-b border-white/[0.05] transition-colors group", rowAccent(entry.rank))}
                          >
                            <td className="p-4">{rankIcon(entry.rank)}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <ArenaAgentThumbnail
                                  agent={{ id: entry.agentId, archetype: entry.archetype, name: entry.name }}
                                  size="md"
                                  className="h-10 w-10 rounded-xl ring-1 ring-white/10 transition group-hover:ring-neon-cyan/30"
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-display text-sm font-semibold text-foreground transition group-hover:text-neon-cyan">
                                    {leaderboardName(entry)}
                                  </p>
                                  {entry.clan ? (
                                    <p className="truncate font-mono text-[10px] text-muted-foreground">{entry.clan}</p>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="hidden p-4 md:table-cell">
                              <span className="inline-flex rounded-full border border-white/10 bg-background/50 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                {entry.archetype ?? "—"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-display text-sm font-bold tabular-nums text-foreground">
                                {elo.toLocaleString()}
                              </span>
                            </td>
                            <td className="hidden p-4 text-right text-sm text-muted-foreground sm:table-cell">
                              {entry.wins ?? "—"}
                            </td>
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
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
