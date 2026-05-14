import { Eye } from "lucide-react";
import { ArenaBattleGif } from "@/components/arena/ArenaBattleGif";
import { pickArenaBattleGif } from "@/constants/arenaLiveBattleMedia";
import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_BATTLES = [
  { a: "ShadowByte", b: "NovaStrike", eloA: 2056, eloB: 1987, watch: "1.2K" },
  { a: "QuantumSoul", b: "VoidWalker", eloA: 2124, eloB: 1888, watch: "956" },
  { a: "InfernoX", b: "AetherX", eloA: 2011, eloB: 1756, watch: "743" },
  { a: "NeuralReaper-7", b: "CipherX", eloA: 1789, eloB: 1642, watch: "532" },
];

export function ArenaLiveBattles() {
  const leaderboardQ = useAiArenaGlobalLeaderboard();

  const apiBattles = (() => {
    const entries = leaderboardQ.data?.entries ?? [];
    if (entries.length < 2) return [];
    const out: Array<{ a: string; b: string; eloA: number; eloB: number; watch: string }> = [];
    for (let i = 0; i < entries.length - 1; i += 2) {
      const left = entries[i];
      const right = entries[i + 1];
      out.push({
        a: left.name,
        b: right.name,
        eloA: left.eloRating,
        eloB: right.eloRating,
        watch: `${Math.max(100, Math.round((left.wins + right.wins) * 4))}`,
      });
    }
    return out.slice(0, 4);
  })();

  const battles = apiBattles.length ? apiBattles : FALLBACK_BATTLES;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold tracking-wider">LIVE BATTLES</h3>
        <button type="button" className="font-display text-xs tracking-widest text-neon-purple transition hover:text-neon-cyan">
          VIEW ALL →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {leaderboardQ.isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="overflow-hidden rounded-xl border border-border/40 bg-card/40 p-3">
                <Skeleton className="h-28 w-full rounded-lg sm:h-32" />
                <Skeleton className="mt-3 h-3 w-3/4" />
                <Skeleton className="mt-2 h-3 w-2/3" />
                <Skeleton className="mt-3 h-3 w-1/2" />
              </div>
            ))
          : battles.map((b, idx) => (
              <div
                key={`${b.a}-${b.b}`}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-card/40 transition hover:border-neon-cyan/40"
              >
                <div className="relative">
                  <ArenaBattleGif
                    src={pickArenaBattleGif(idx)}
                    alt={`${b.a} vs ${b.b} live battle`}
                    className="h-28 w-full transition duration-300 group-hover:scale-105 sm:h-32"
                  />
                  <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-destructive/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    <span className="live-dot h-1 w-1 rounded-full bg-white" /> LIVE
                  </span>
                  <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-display text-lg font-black text-white drop-shadow-lg">
                    VS
                  </span>
                </div>
                <div className="p-3">
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span className="truncate">{b.a}</span>
                    <span className="truncate text-right">{b.b}</span>
                  </div>
                  <div className="mb-2 flex justify-between text-[10px] text-muted-foreground">
                    <span>ELO {b.eloA}</span>
                    <span>ELO {b.eloB}</span>
                  </div>
                  <div className="flex items-center gap-1 border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3 shrink-0" />
                    <span>{b.watch} watching</span>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div
        className="mt-5 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(270 80% 65% / 0.6), hsl(195 100% 60% / 0.6), transparent)",
        }}
      />
    </div>
  );
}
