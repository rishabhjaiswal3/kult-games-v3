import { ChevronRight, Heart, Trophy, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const rankStyles: Record<number, string> = {
  1: "bg-[hsl(42_95%_48%/0.95)] text-amber-950 ring-amber-300/50",
  2: "bg-[hsl(220_12%_72%/0.95)] text-slate-900 ring-white/40",
  3: "bg-[hsl(24_55%_42%/0.95)] text-amber-100 ring-amber-700/40",
};

const creators = [
  { rank: 1, name: "Nyxis Prime", arena: "AI Arena", count: "128.4K", trend: "up" as const },
  { rank: 2, name: "VoidStrike", arena: "Warzone Warriors", count: "98.8K", trend: "up" as const },
  { rank: 3, name: "RavenHex", arena: "Racing League", count: "87.9K", trend: "down" as const },
  { rank: 4, name: "LunarGrid", arena: "AI Arena", count: "72.9K", trend: "up" as const },
  { rank: 5, name: "NovaFlux", arena: "Tournaments", count: "71.9K", trend: "neutral" as const },
];

const liveActivity = [
  { icon: Upload, tone: "text-neon-purple", text: "Nyxis Prime uploaded a new moment", time: "2m ago" },
  { icon: Trophy, tone: "text-[hsl(var(--gold))]", text: "VoidStrike hit #2 on Warzone board", time: "5m ago" },
  { icon: Heart, tone: "text-rose-400", text: "Echo liked your moment", time: "7m ago" },
  { icon: Upload, tone: "text-neon-cyan", text: "RavenHex clipped a legendary finish", time: "12m ago" },
];

const hashtags = [
  { tag: "#AIrena", count: "24.5K moments" },
  { tag: "#WarzoneWarriors", count: "18.2K moments" },
  { tag: "#ClipIt", count: "12.8K moments" },
  { tag: "#KultMoments", count: "9.4K moments" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <button
        type="button"
        className="flex items-center gap-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-neon-purple transition hover:text-neon-cyan"
      >
        View all
        <ChevronRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 64 14" className="h-3.5 w-14 shrink-0" aria-hidden>
      <polyline
        fill="none"
        stroke="hsl(278 88% 58%)"
        strokeWidth="2"
        strokeLinecap="round"
        points="0,11 8,9 18,10 30,6 42,8 54,4 64,3"
      />
    </svg>
  );
}

export function MomentsRightSidebar() {
  return (
    <aside className="flex flex-col gap-6 overflow-y-auto border-t border-white/[0.06] bg-[hsl(268_35%_5%/0.97)] px-4 py-5 lg:max-h-[calc(100dvh-4rem)] lg:border-l lg:border-t-0 lg:pb-4">
      <section>
        <SectionHeader title="Top creators" />
        <ul className="space-y-2">
          {creators.map((c) => (
            <li
              key={c.rank}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-black/40 px-2.5 py-2 transition hover:border-neon-purple/30 hover:bg-black/55"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-black ring-1",
                  rankStyles[c.rank] ?? "bg-white/10 text-muted-foreground ring-white/15",
                )}
              >
                {c.rank}
              </span>
              <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-neon-purple/50 to-black/60 ring-1 ring-white/10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xs font-bold text-foreground">{c.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{c.arena}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] font-bold tabular-nums text-neon-purple">{c.count}</p>
                {c.trend === "up" ? (
                  <span className="text-[9px] text-emerald-400">▲</span>
                ) : c.trend === "down" ? (
                  <span className="text-[9px] text-rose-400">▼</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-white/[0.08] bg-black/42 p-3">
        <SectionHeader title="Live activity" />
        <ul className="space-y-2.5">
          {liveActivity.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.text} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/50",
                    item.tone,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] leading-snug text-foreground/90">{item.text}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{item.time}</p>
                </div>
                <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-neon-purple/25 to-black/70" />
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionHeader title="Trending hashtags" />
        <ul className="space-y-2">
          {hashtags.map((row) => (
            <li
              key={row.tag}
              className="flex items-center justify-between gap-2 rounded-lg border border-neon-purple/15 bg-black/38 px-2.5 py-2 [background-image:linear-gradient(90deg,hsl(278_88%_62%/0.06),transparent)]"
            >
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-bold text-neon-purple">{row.tag}</p>
                <p className="text-[9px] text-muted-foreground">{row.count}</p>
              </div>
              <Sparkline />
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
