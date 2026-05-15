import heroVideo from "@/assets/b_c_ca_f_a_f_e_mp_.mp4";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Activity, Box, Swords, TrendingUp, Users, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArenaHeroStatsSkeleton } from "@/components/skeleton";
import { useArenaPage } from "@/contexts/ArenaPageContext";
import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";

const NODES = [
  { label: "NEURAL CORE", value: "Online", pos: "top-[14%] left-[4%]", color: "text-neon-cyan" },
  { label: "CORTEX AI", value: "Active", pos: "top-[18%] right-[2%]", color: "text-neon-purple" },
  { label: "SYNAPSE LINK", value: "Stable", pos: "bottom-[16%] right-[1%]", color: "text-neon-green" },
];

type HeroStat = {
  label: string;
  value: string;
  delta: string;
  color: string;
  icon: LucideIcon;
  iconBg: string;
};

function StatCard({ stat: s }: { stat: HeroStat }) {
  const Icon = s.icon;
  return (
    <div className="arena-stat-card glass-panel flex min-w-0 flex-col gap-2.5 rounded-xl p-3.5 sm:p-4">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br ${s.iconBg}`}
        >
          <Icon className={`h-4 w-4 ${s.color}`} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 truncate font-display text-[9px] tracking-[0.12em] text-muted-foreground sm:text-[10px]">
          {s.label}
        </div>
      </div>
      <div className="min-w-0 pl-0.5">
        <div className="truncate font-display text-xl font-bold leading-none tabular-nums text-foreground sm:text-2xl">
          {s.value}
        </div>
        <div className={`mt-1 truncate text-[10px] font-medium sm:text-xs ${s.color}`}>{s.delta}</div>
      </div>
    </div>
  );
}

export function ArenaHero() {
  const { openCreateAgent } = useArenaPage();
  const leaderboardQ = useAiArenaGlobalLeaderboard();

  const entries = leaderboardQ.data?.entries ?? [];
  const statsLoading = leaderboardQ.isFetching && entries.length === 0;
  const totalWins = entries.reduce((acc, entry) => acc + entry.wins, 0);

  const avgElo = entries.length
    ? Math.round(entries.reduce((acc, entry) => acc + (entry.eloRating ?? entry.score ?? 0), 0) / entries.length)
    : 0;

  const stats: HeroStat[] = [
    {
      label: "AGENTS ONLINE",
      value: entries.length ? entries.length.toLocaleString() : "2,348",
      delta: "Right now",
      color: "text-neon-cyan",
      icon: Users,
      iconBg: "from-neon-cyan/25 to-neon-purple/10 border-neon-cyan/30",
    },
    {
      label: "FIGHTS LOGGED",
      value: totalWins ? totalWins.toLocaleString() : "8,921",
      delta: "This season",
      color: "text-neon-purple",
      icon: TrendingUp,
      iconBg: "from-neon-purple/25 to-neon-pink/10 border-neon-purple/30",
    },
    {
      label: "AVG ELO",
      value: avgElo ? avgElo.toString() : "1,000",
      delta: "Top agents",
      color: "text-neon-cyan",
      icon: Activity,
      iconBg: "from-neon-cyan/20 to-neon-green/10 border-neon-cyan/25",
    },
    {
      label: "GATEWAY",
      value: leaderboardQ.isError ? "Degraded" : "Online",
      delta: leaderboardQ.isError ? "Check connection" : "Healthy",
      color: leaderboardQ.isError ? "text-orange-400" : "text-neon-green",
      icon: Wifi,
      iconBg: leaderboardQ.isError
        ? "from-orange-500/20 to-red-500/10 border-orange-400/30"
        : "from-neon-green/25 to-neon-cyan/10 border-neon-green/30",
    },
  ];

  return (
    <section className="glass-panel relative grid grid-cols-1 gap-6 overflow-hidden rounded-2xl p-4 sm:gap-7 sm:p-6 lg:grid-cols-12 lg:items-stretch lg:gap-8 lg:p-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div className="pointer-events-none absolute inset-0 neural-grid opacity-[0.12]" />

      <div className="relative z-10 flex min-w-0 flex-col justify-center text-center lg:col-span-7 lg:min-w-0 lg:pr-3 lg:text-left xl:pr-5">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5 sm:mb-5 sm:gap-3 lg:justify-start">
          <span className="font-display text-xs tracking-[0.3em] text-neon-cyan">AI ARENA</span>
          <span className="flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/15 px-3 py-1 text-[10px] font-bold tracking-widest text-neon-green">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-neon-green" /> LIVE OPS
          </span>
        </div>
        <h1 className="mb-5 font-display font-black tracking-tight text-foreground sm:mb-6">
          <span className="block text-[clamp(2rem,6vw,3.5rem)] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[2.35rem] lg:leading-[1.12] xl:text-5xl 2xl:text-6xl">
            FORGE YOUR
          </span>
          <span className="text-gradient-hero mt-1 block text-[clamp(2.35rem,7vw,4rem)] leading-[1.08] sm:mt-1.5 sm:text-6xl md:text-7xl lg:mt-1 lg:text-[2.75rem] lg:leading-[1.1] xl:text-6xl 2xl:text-7xl">
            CHAMPION
          </span>
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mb-7 sm:text-base lg:mx-0">
          Your AI agent remembers every fight — learns your style, talks trash, and pushes for the next win while you stay in command.
        </p>
        <HeroCtas openCreateAgent={openCreateAgent} />
      </div>

      <div className="relative mt-1 aspect-[4/5] w-full min-h-[280px] min-w-0 self-center overflow-hidden rounded-xl bg-[hsl(268_28%_9%)] sm:mt-0 sm:min-h-[340px] sm:aspect-[3/4] lg:col-span-5 lg:mt-0 lg:min-h-[min(560px,52svh)] lg:max-h-[min(680px,58svh)] lg:aspect-[4/5] lg:justify-self-end">
        <AutoPlayVideo
          src={heroVideo}
          loop
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
        />
        <HeroVideoFade />
        {NODES.map((n) => (
          <HeroNode key={n.label} node={n} />
        ))}
      </div>

      <div className="relative z-10 mt-1 grid grid-cols-1 gap-3 sm:mt-0 sm:grid-cols-2 sm:gap-4 lg:col-span-12 lg:mt-2 lg:grid-cols-4">
        {statsLoading ? (
          <ArenaHeroStatsSkeleton />
        ) : (
          stats.map((s) => <StatCard key={s.label} stat={s} />)
        )}
      </div>
    </section>
  );
}

function HeroCtas({ openCreateAgent }: { openCreateAgent: () => void }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap justify-center gap-3 lg:justify-start">
        <button
          type="button"
          onClick={() => {
            openCreateAgent();
            document.getElementById("arena-agents-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="btn-eye inline-flex items-center gap-2 px-6 py-3.5 font-display text-sm font-bold tracking-wider"
        >
          <Box className="relative z-10 h-4 w-4" />
          <span className="relative z-10">CREATE AI AGENT</span>
        </button>
        <a
          href="#arena-matchmaking"
          className="btn-eye-outline inline-flex items-center gap-2 px-6 py-3.5 font-display text-sm font-bold tracking-wider"
        >
          <Swords className="h-4 w-4" /> ENTER ARENA
        </a>
      </div>
      <p className="font-display text-xs tracking-[0.25em] text-neon-purple">DROP IN FREE. BUILD A LEGEND.</p>
    </>
  );
}

function HeroVideoFade() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to right, hsl(268 32% 12% / 0.45) 0%, transparent 22%, transparent 78%, hsl(268 32% 12% / 0.45) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 72%, hsl(268 32% 12% / 0.55) 100%)",
        }}
      />
    </>
  );
}

function HeroNode({ node: n }: { node: (typeof NODES)[number] }) {
  return (
    <div className={`absolute ${n.pos} z-10 glass-panel rounded-xl px-3 py-2 text-xs`}>
      <div className={`font-display text-[10px] tracking-widest ${n.color}`}>{n.label}</div>
      <div className="text-[11px] text-muted-foreground">{n.value}</div>
    </div>
  );
}
