import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { buildLiveEcosystemItems, type LiveEcosystemTone } from "@/lib/liveEcosystemFeed";

const TONE_STYLES: Record<LiveEcosystemTone, string> = {
  live: "border-neon-green/35 bg-neon-green/10 text-neon-green",
  event: "border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan",
  battle: "border-neon-purple/35 bg-neon-purple/10 text-neon-purple",
  banter: "border-primary/35 bg-primary/10 text-[hsl(278_100%_82%)]",
  season: "border-orange-400/35 bg-orange-500/10 text-orange-300",
};

interface LiveEcosystemLayerProps {
  className?: string;
  compact?: boolean;
}

export function LiveEcosystemLayer({ className, compact = false }: LiveEcosystemLayerProps) {
  const items = useMemo(() => buildLiveEcosystemItems(), []);
  const loop = [...items, ...items];

  return (
    <section
      className={cn(
        "relative z-10 overflow-hidden border-y border-white/[0.08] bg-card/35 backdrop-blur-sm",
        compact ? "py-2.5" : "py-3.5",
        className
      )}
      aria-label="Live ecosystem activity"
    >
      <div className={cn("container mx-auto px-4 sm:px-6", compact ? "space-y-2" : "space-y-3")}>
        <div className="flex items-center gap-2.5">
          <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-neon-green" />
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-neon-cyan sm:text-xs">
            Live Ecosystem
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-neon-cyan/40 to-transparent" />
        </div>

        <div className="relative overflow-hidden mask-fade-x">
          <div className="ecosystem-marquee flex w-max items-center gap-3 sm:gap-4">
            {loop.map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-wide sm:px-4 sm:text-[11px]",
                  TONE_STYLES[item.tone]
                )}
              >
                {(item.tone === "live" || item.tone === "event") && (
                  <span className="live-dot h-1 w-1 rounded-full bg-current opacity-80" />
                )}
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveEcosystemLayer;
