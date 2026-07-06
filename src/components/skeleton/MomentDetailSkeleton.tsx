import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors MomentDetailPage's loaded layout: media + meta + sidebar info cards. */
export function MomentDetailSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" aria-busy="true" aria-label="Loading moment">
      {/* ── Main column ── */}
      <div className="min-w-0 space-y-5">
        <Skeleton className="aspect-video w-full rounded-lg bg-white/8" />

        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-2/3 max-w-sm bg-white/10" />
              <Skeleton className="h-3 w-40 bg-white/6" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0 rounded bg-white/8" />
          </div>
          <Skeleton className="h-4 w-full bg-white/6" />
          <Skeleton className="h-4 w-4/5 bg-white/6" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full bg-white/8" />
            <Skeleton className="h-5 w-20 rounded-full bg-white/8" />
            <Skeleton className="h-5 w-14 rounded-full bg-white/8" />
          </div>
        </div>

        <div className="arena-panel border-white/8 bg-[#04080f]/95 flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-20 bg-white/8" />
          <Skeleton className="h-8 w-20 bg-white/8" />
          <Skeleton className="h-8 w-20 bg-white/8" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-32 bg-white/8" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-white/8" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24 bg-white/6" />
                <Skeleton className="h-3 w-full bg-white/6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className="space-y-4">
        <div className="arena-panel border-white/8 bg-[#04080f]/95 space-y-4 p-5">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-2.5 w-16 bg-white/6" />
                <Skeleton className="h-2.5 w-20 bg-white/8" />
              </div>
            ))}
          </div>
        </div>
        <div className="arena-panel border-white/8 bg-[#04080f]/95 space-y-3 p-5">
          <Skeleton className="h-3 w-28 bg-white/10" />
          <Skeleton className="h-3 w-full bg-white/6" />
          <Skeleton className="h-3 w-4/5 bg-white/6" />
        </div>
      </aside>
    </div>
  );
}
