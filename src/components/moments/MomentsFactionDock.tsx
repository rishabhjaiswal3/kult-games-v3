import { MessageCircle, Timer, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MomentsFactionDock() {
  return (
    <footer className="sticky bottom-0 z-40 border-t border-neon-purple/30 bg-[hsl(268_38%_4%/0.98)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Tribal warfare</p>
            <p className="font-display text-sm font-black uppercase tracking-wide text-foreground">
              <span className="text-[hsl(0_76%_55%)]">Inferno</span>
              <span className="mx-1.5 text-muted-foreground/60">vs</span>
              <span className="text-neon-purple">Nyxis</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground">
            <Timer className="h-3 w-3 text-neon-cyan" aria-hidden />
            <span>
              Next rotation <span className="tabular-nums font-semibold text-foreground">12:43</span>
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 px-0 lg:px-4">
          <p className="mb-1.5 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Faction control
          </p>
          <div className="relative flex h-3 overflow-hidden rounded-full bg-black/70 ring-1 ring-white/10">
            <div
              className="h-full bg-gradient-to-r from-[hsl(0_76%_50%)] to-[hsl(20_85%_52%)]"
              style={{ width: "48.7%" }}
            />
            <div
              className="h-full bg-gradient-to-r from-neon-purple to-neon-pink"
              style={{ width: "51.3%" }}
            />
            <span className="pointer-events-none absolute left-[48.7%] top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[hsl(268_35%_12%)] shadow-lg" />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9px] font-semibold">
            <span className="text-[hsl(0_76%_55%)]">48.7%</span>
            <span className="text-neon-purple">51.3%</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <div className="hidden text-right sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Your faction</p>
            <p className="font-display text-xs font-bold text-foreground">The Shadow Clan</p>
            <p className="font-mono text-[10px] text-neon-purple">Rank #23</p>
          </div>

          <Link
            to="/ai-arena"
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-7 py-2.5 font-display text-xs font-black tracking-[0.14em] text-primary-foreground btn-eye",
              "shadow-[0_0_28px_hsl(278_88%_62%/0.45)] sm:px-9 sm:py-3",
            )}
          >
            <Zap className="h-4 w-4" aria-hidden />
            ENTER ARENA
          </Link>

          <button
            type="button"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-black/50 text-muted-foreground transition hover:border-neon-purple/35 hover:text-foreground"
            aria-label="Arena chat"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neon-purple px-1 font-mono text-[9px] font-bold text-primary-foreground">
              12
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
