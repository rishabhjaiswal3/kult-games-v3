import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PODIUM_GRID =
  "mx-auto grid max-w-3xl grid-cols-1 items-end justify-items-center gap-4 sm:grid-cols-3 sm:gap-4 lg:max-w-4xl";

export function ArenaPodiumSkeleton() {
  return (
    <div className={cn("mb-10", PODIUM_GRID)} aria-busy="true" aria-label="Loading top champions">
      {[2, 1, 3].map((rank) => (
        <div key={rank} className="flex w-full max-w-[11rem] flex-col items-center sm:max-w-[12.5rem]">
          <div className="w-full rounded-2xl border border-white/10 bg-background/30 p-4">
            <Skeleton className={cn("mx-auto rounded-2xl", rank === 1 ? "h-16 w-16" : "h-14 w-14")} />
            <Skeleton className="mx-auto mt-3 h-3 w-24" />
            <Skeleton className="mx-auto mt-2 h-7 w-16" />
          </div>
          <Skeleton className={cn("mt-3 w-full rounded-t-xl", rank === 1 ? "h-24" : rank === 2 ? "h-16" : "h-12")} />
        </div>
      ))}
    </div>
  );
}

export function ArenaLeaderboardTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/25" aria-busy="true">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <Skeleton className="h-3 w-28 bg-muted/60" />
        <Skeleton className="h-3 w-16 bg-muted/50" />
      </div>
      <div className="space-y-0 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-white/[0.05] px-3 py-3 last:border-0">
            <Skeleton className="h-7 w-7 rounded-lg bg-muted/70" />
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-muted/70" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32 bg-muted/80" />
              <Skeleton className="h-2.5 w-20 bg-muted/55" />
            </div>
            <Skeleton className="hidden h-3 w-16 bg-muted/60 md:block" />
            <Skeleton className="h-3.5 w-12 bg-muted/75" />
            <Skeleton className="hidden h-3 w-8 bg-muted/50 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArenaHeroStatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="arena-stat-card glass-panel flex min-w-0 flex-col gap-2.5 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-muted/70" />
            <Skeleton className="h-2.5 w-20 bg-muted/60" />
          </div>
          <Skeleton className="h-7 w-16 bg-muted/80" />
          <Skeleton className="h-2.5 w-14 bg-muted/50" />
        </div>
      ))}
    </>
  );
}

export function ArenaActivitySkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5" aria-busy="true" aria-label="Loading arena activity">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-36 bg-muted/80" />
        <Skeleton className="h-5 w-14 rounded bg-muted/60" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-md bg-muted/70" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-full max-w-[220px] bg-muted/65" />
              <Skeleton className="h-2.5 w-12 bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArenaTerminalSkeleton() {
  return (
    <div className="glass-panel space-y-3 rounded-2xl p-5" aria-busy="true" aria-label="Loading arena terminal">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded bg-muted/70" />
        <Skeleton className="h-4 w-40 bg-muted/80" />
      </div>
      <div className="space-y-2 rounded-xl border border-white/[0.08] bg-black/40 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3 bg-muted/55"
            style={{ width: `${55 + (i % 3) * 12}%`, maxWidth: "28rem" }}
          />
        ))}
      </div>
    </div>
  );
}
