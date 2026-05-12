import battleImg from "@/assets/battle-1.jpg";
import { Play } from "lucide-react";

export function ArenaLiveDuelFeed() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold tracking-wider text-sm">LIVE DUEL FEED</h3>
        <span className="px-2 py-1 rounded text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive live-dot" /> LIVE
        </span>
      </div>

      <div className="relative rounded-xl overflow-hidden mb-4">
        <img src={battleImg} alt="Live battle" width={768} height={512} className="w-full h-44 object-cover" loading="lazy" />
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/45 transition"
          aria-label="Watch live battle"
        >
          <span className="w-14 h-14 rounded-full bg-foreground/90 text-background flex items-center justify-center shadow-[0_0_24px_hsl(195_100%_50%/0.5)]">
            <Play className="w-6 h-6 ml-0.5" />
          </span>
        </button>
        <span className="absolute top-3 right-3 text-xs font-display bg-background/70 px-2 py-1 rounded backdrop-blur-sm">02:45</span>
        <span className="absolute top-3 left-3 text-[9px] font-bold bg-destructive/80 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-white live-dot" /> LIVE
        </span>
      </div>

      <div className="flex items-center justify-between text-sm font-semibold mb-2">
        <span>ShadowByte</span>
        <span className="text-muted-foreground text-xs font-normal">vs</span>
        <span>NovaStrike</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>ELO 2056</span><span>ELO 1987</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-4">
        <div className="h-full rounded-full" style={{ width: "62%", background: "linear-gradient(90deg, hsl(195 100% 60%), hsl(270 80% 65%))" }} />
      </div>

      <button type="button" className="w-full text-center text-xs font-display tracking-widest text-neon-purple hover:text-neon-cyan transition">
        WATCH LIVE BATTLE →
      </button>
    </div>
  );
}
