import roboLogo from "@/assets/roboLogo.png";

const ITEMS = [
  "AI Arena Season 1 is LIVE",
  "Double $KULT rewards this weekend!",
  "New agents drop in 2d 14h 32m",
  "Join the arena. Become legendary.",
  "NeuralReaper-7 just hit ELO 2,000",
  "QuantumSoul won 12 matches in a row",
];

const SOCIALS = ["X", "YT", "TT", "IG", "TG", "DC"];

export function ArenaTicker() {
  return (
    <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-5 overflow-hidden">
      <div className="flex items-center gap-2.5 shrink-0">
        <img src={roboLogo} alt="Kult" className="w-8 h-8 object-contain" />
        <div className="text-xs hidden sm:block">
          <div className="font-display font-bold leading-tight">KULT BROWSER</div>
          <div className="text-[10px] text-muted-foreground">v1.0.0</div>
        </div>
      </div>

      <span className="px-2 py-1 rounded text-[10px] font-bold bg-neon-green/20 text-neon-green border border-neon-green/40 shrink-0 hidden sm:flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-green live-dot" /> ALL SYSTEMS OPERATIONAL
      </span>

      <div className="flex-1 overflow-hidden relative">
        <div className="flex gap-12 whitespace-nowrap animate-marquee text-sm text-muted-foreground">
          {[...ITEMS, ...ITEMS].map((t, i) => (
            <span key={i} className="shrink-0">
              <span className="text-neon-cyan mr-2">◆</span>{t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {SOCIALS.map((s) => (
          <span key={s} className="w-7 h-7 rounded-md glass-panel flex items-center justify-center text-[10px] font-bold hover:text-neon-cyan hover:border-neon-cyan/30 transition cursor-pointer">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
