import heroVideo from "@/assets/b_c_ca_f_a_f_e_mp_.mp4";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Box, Swords, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";

const NODES = [
  { label: "NEURAL CORE",  value: "Online", pos: "top-[14%] left-[4%]",    color: "text-neon-cyan"   },
  { label: "CORTEX AI",    value: "Active", pos: "top-[18%] right-[2%]",   color: "text-neon-purple" },
  { label: "SYNAPSE LINK", value: "Stable", pos: "bottom-[16%] right-[1%]",color: "text-neon-green"  },
];

export function ArenaHero() {
  const leaderboardQ = useQuery({
    queryKey: ["aiArenaGateway", "leaderboardHeroStats"],
    queryFn: () => aiArenaGatewayApi.getGlobalLeaderboard(100),
    staleTime: 30_000,
    refetchInterval: 45_000,
  });

  const entries = leaderboardQ.data?.entries ?? [];
  const totalWins = entries.reduce((acc, entry) => acc + entry.wins, 0);
  const avgElo = entries.length ? Math.round(entries.reduce((acc, entry) => acc + entry.eloRating, 0) / entries.length) : 0;

  const stats = [
    { label: "AGENTS TRACKED", value: entries.length ? entries.length.toLocaleString() : "2,348", delta: "Live", color: "text-neon-cyan" },
    { label: "TOTAL WINS", value: totalWins ? totalWins.toLocaleString() : "8,921", delta: "Global", color: "text-neon-purple" },
    { label: "AVG ELO", value: avgElo ? avgElo.toString() : "1,000", delta: "Top agents", color: "text-neon-cyan" },
    { label: "GATEWAY", value: "Online", delta: leaderboardQ.isError ? "Degraded" : "Healthy", color: "text-neon-green" },
  ];

  return (
    <section className="glass-panel relative grid grid-cols-1 gap-5 overflow-hidden rounded-2xl p-4 sm:p-6 sm:gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-6 lg:p-7">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(270 80% 65% / 0.35), transparent 70%)" }}
      />
      <div className="pointer-events-none absolute inset-0 neural-grid opacity-[0.12]" />

      {/* ── Left: copy ── */}
      <div className="relative z-10 flex flex-col justify-center text-center lg:col-span-7 lg:min-h-0 lg:text-left">
        <div className="flex items-center gap-3 mb-5 justify-center lg:justify-start">
          <span className="text-neon-cyan font-display text-xs tracking-[0.3em]">AI ARENA</span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-neon-green/15 text-neon-green border border-neon-green/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green live-dot" /> LIVE OPS
          </span>
        </div>

        <h1 className="font-display font-black leading-[0.95] mb-1 text-foreground text-[clamp(2.8rem,8vw,4.1rem)]">
          FORGE YOUR 
        </h1>
        <h1 className="font-display font-black leading-[0.9] mb-5 gradient-text text-[clamp(3.4rem,10vw,4.9rem)]">
          CHAMPION
        </h1>

        <p className="text-muted-foreground mb-7 text-sm sm:text-base leading-relaxed mx-auto lg:mx-0">
          Spawn an autonomous operator with its own hot wallet — battle, trade, and banter while you stay in control.
        </p>

        <div className="flex gap-3 mb-4 flex-wrap justify-center lg:justify-start">
          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-6 py-3.5 font-display font-bold tracking-wider text-sm btn-eye"
          >
            <Box className="w-4 h-4 relative z-10" />
            <span className="relative z-10">CREATE AGENT</span>
          </Link>
          <a
            href="#arena-matchmaking"
            className="inline-flex items-center gap-2 px-6 py-3.5 font-display font-bold tracking-wider text-sm btn-eye-outline"
          >
            <Swords className="w-4 h-4" /> ENTER ARENA
          </a>
        </div>

        <p className="text-xs tracking-[0.25em] text-neon-purple font-display">
          FREE TO START. OWN FOREVER.
        </p>
      </div>

      {/* ── Right: video hero — full frame visible, no top gap; fills column height on lg ── */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 lg:col-span-5 lg:aspect-auto lg:h-full lg:min-h-[clamp(260px,48svh,720px)]">
        <AutoPlayVideo
          src={heroVideo}
          loop
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Edge fades to blend into the panel */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, hsl(220 45% 10% / 0.55) 0%, transparent 20%, transparent 80%, hsl(220 45% 10% / 0.55) 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 60%, hsl(220 45% 10% / 0.8) 100%)",
          }}
        />

        {/* Floating node badges */}
        {NODES.map((n) => (
          <div key={n.label} className={`absolute ${n.pos} glass-panel rounded-xl px-3 py-2 text-xs z-10`}>
            <div className={`font-display tracking-widest text-[10px] ${n.color}`}>{n.label}</div>
            <div className="text-muted-foreground text-[11px]">{n.value}</div>
          </div>
        ))}
      </div>

      {/* ── Bottom: stat strip — 2×2 grid; 4-across only when hero has room ── */}
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-12 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-panel flex min-w-0 items-start gap-2.5 rounded-xl p-3 sm:items-center sm:gap-3 sm:p-3.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neon-cyan/20 bg-neon-cyan/10 sm:h-9 sm:w-9">
              <TrendingUp className="h-3.5 w-3.5 text-neon-cyan sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[9px] tracking-widest text-muted-foreground">{s.label}</div>
              <div className="font-display text-lg font-bold leading-tight sm:text-xl">{s.value}</div>
              <div className={`mt-0.5 text-[10px] leading-snug sm:mt-1 sm:text-[11px] ${s.color}`}>{s.delta}</div>
            </div>
            <svg
              width="52"
              height="24"
              viewBox="0 0 52 24"
              aria-hidden
              className="hidden shrink-0 text-neon-cyan xl:block"
            >
              <polyline points="0,18 9,13 18,16 26,7 35,10 44,4 52,9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
}
