import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors a training job row on TrainingPage (both "my jobs" and "global feed" lists). */
export function TrainingJobRowSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4" aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl bg-white/8" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="h-2.5 w-16 bg-white/6" />
        </div>
      </div>
      <div className="min-w-[220px] flex-1 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-2.5 w-28 bg-white/8" />
          <Skeleton className="h-2.5 w-14 bg-white/6" />
        </div>
        <Skeleton className="h-1 w-full rounded-full bg-white/6" />
        <Skeleton className="h-2 w-32 bg-white/5" />
      </div>
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-6 w-16 rounded bg-white/6" />
        <Skeleton className="h-3 w-20 bg-white/6" />
      </div>
    </div>
  );
}

export function TrainingJobListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-white/6" aria-busy="true" aria-label="Loading training jobs">
      {Array.from({ length: count }).map((_, i) => (
        <TrainingJobRowSkeleton key={i} />
      ))}
    </div>
  );
}
