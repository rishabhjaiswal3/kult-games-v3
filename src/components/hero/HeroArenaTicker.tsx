import { useMemo } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { buildLiveEcosystemItems } from "@/lib/liveEcosystemFeed";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  live: "border-neon-green/30 bg-neon-green/8 text-neon-green",
  event: "border-neon-cyan/30 bg-neon-cyan/8 text-neon-cyan",
  battle: "border-neon-purple/30 bg-neon-purple/8 text-neon-purple",
  banter: "border-primary/30 bg-primary/8 text-[hsl(278_100%_82%)]",
  season: "border-orange-400/30 bg-orange-500/8 text-orange-300",
} as const;

export function HeroArenaTicker() {
  const items = useMemo(() => buildLiveEcosystemItems(), []);
  const loop = [...items, ...items];

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/[0.08] bg-background/55 backdrop-blur-md"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
        <motion.div className="flex shrink-0 items-center gap-2">
          <Swords className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="font-display text-[9px] font-bold uppercase tracking-[0.28em] text-neon-cyan sm:text-[10px]">
            Arena Feed
          </span>
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-neon-green" />
        </motion.div>
        <div className="relative min-w-0 flex-1 overflow-hidden mask-fade-x">
          <div className="hero-arena-marquee flex w-max items-center gap-3">
            {loop.map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-wide sm:px-3 sm:text-[10px]",
                  TONE_STYLES[item.tone]
                )}
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
