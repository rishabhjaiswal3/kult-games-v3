import b1 from "@/assets/battle-1.jpg";
import b2 from "@/assets/battle-2.jpg";
import b3 from "@/assets/battle-3.jpg";
import b4 from "@/assets/battle-4.jpg";
import { Eye } from "lucide-react";
import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";

const BATTLE_IMAGES = [b1, b2, b3, b4];

const FALLBACK_BATTLES = [
  { img: b1, a: "ShadowByte",     b: "NovaStrike",  eloA: 2056, eloB: 1987, watch: "1.2K" },
  { img: b2, a: "QuantumSoul",    b: "VoidWalker",  eloA: 2124, eloB: 1888, watch: "956"  },
  { img: b3, a: "InfernoX",       b: "AetherX",     eloA: 2011, eloB: 1756, watch: "743"  },
  { img: b4, a: "NeuralReaper-7", b: "CipherX",     eloA: 1789, eloB: 1642, watch: "532"  },
];

export function ArenaLiveBattles() {
  const leaderboardQ = useAiArenaGlobalLeaderboard();

  const apiBattles = (() => {
    const entries = leaderboardQ.data?.entries ?? [];
    if (entries.length < 2) return [];
    const out: Array<{ img: string; a: string; b: string; eloA: number; eloB: number; watch: string }> = [];
    for (let i = 0; i < entries.length - 1; i += 2) {
      const left = entries[i];
      const right = entries[i + 1];
      out.push({
        img: BATTLE_IMAGES[(i / 2) % BATTLE_IMAGES.length],
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
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold tracking-wider text-sm">LIVE BATTLES</h3>
        <button type="button" className="text-xs font-display tracking-widest text-neon-purple hover:text-neon-cyan transition">
          VIEW ALL →
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {leaderboardQ.isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-border/40 bg-card/40 p-3">
                <Skeleton className="h-28 sm:h-32 w-full rounded-lg" />
                <Skeleton className="h-3 w-3/4 mt-3" />
                <Skeleton className="h-3 w-2/3 mt-2" />
                <Skeleton className="h-3 w-1/2 mt-3" />
              </div>
            ))
          : battles.map((b) => (
          <div key={b.a} className="rounded-xl overflow-hidden border border-border/40 bg-card/40 hover:border-neon-cyan/40 transition group cursor-pointer">
            <div className="relative">
              <img
                src={b.img}
                alt={`${b.a} vs ${b.b}`}
                width={400}
                height={220}
                className="w-full h-28 sm:h-32 object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/80 text-white flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-white live-dot" /> LIVE
              </span>
              <span className="absolute inset-0 flex items-center justify-center font-display font-black text-lg text-white drop-shadow-lg pointer-events-none">VS</span>
            </div>
            <div className="p-3">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="truncate">{b.a}</span><span className="truncate text-right">{b.b}</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
                <span>ELO {b.eloA}</span><span>ELO {b.eloB}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                <Eye className="w-3 h-3 shrink-0" /><span>{b.watch} watching</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(270 80% 65% / 0.6), hsl(195 100% 60% / 0.6), transparent)" }} />
    </div>
  );
}
