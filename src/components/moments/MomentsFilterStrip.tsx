import { useState } from "react";
import { ChevronDown, Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  "For You",
  "Trending",
  "AI Arena",
  "Warzone Warriors",
  "Racing",
  "Tournaments",
] as const;

export function MomentsFilterStrip() {
  const [active, setActive] = useState<(typeof categories)[number]>("For You");

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-white/[0.06] bg-[hsl(268_35%_6%/0.9)] px-3 py-3 sm:px-5 [scrollbar-width:none]">
      {categories.map((c) => {
        const on = active === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 font-display text-[11px] font-bold tracking-wide transition-colors",
              on
                ? "border border-neon-purple/50 bg-neon-purple text-primary-foreground shadow-[0_0_18px_hsl(278_88%_62%/0.4)]"
                : "border border-white/[0.1] bg-black/40 text-muted-foreground hover:border-neon-purple/30 hover:text-foreground",
            )}
          >
            {c === "For You" && on ? <Star className="h-3 w-3 fill-current" aria-hidden /> : null}
            {c.toUpperCase()}
          </button>
        );
      })}

      <button
        type="button"
        className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.12] bg-black/45 px-3 py-1.5 font-display text-[10px] font-bold tracking-wide text-muted-foreground hover:text-foreground"
      >
        All games
        <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </button>

      <button
        type="button"
        className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neon-purple/35 bg-black/50 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-neon-purple"
      >
        <Filter className="h-3.5 w-3.5" aria-hidden />
        Filters
      </button>
    </div>
  );
}
