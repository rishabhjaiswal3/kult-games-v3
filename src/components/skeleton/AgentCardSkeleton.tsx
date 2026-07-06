import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors the agent card in MyAgentsPage's loaded grid. */
export function AgentCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("arena-panel flex flex-col overflow-hidden border-white/8 bg-[#04080f]/95", className)}
      aria-hidden
    >
      <Skeleton className="aspect-[3/4] w-full rounded-none bg-white/8" />
      <div className="flex flex-1 flex-col justify-between space-y-4 p-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-2/3 bg-white/10" />
            <Skeleton className="h-2.5 w-1/2 bg-white/6" />
          </div>
          <Skeleton className="h-1 w-full rounded-full bg-white/6" />
          <div className="space-y-2 rounded border border-white/8 bg-white/[0.025] px-3 py-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Skeleton className="h-2.5 w-16 bg-white/6" />
                <Skeleton className="h-2.5 w-8 bg-white/8" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2 border-t border-white/6 pt-2">
          <Skeleton className="h-8 w-full rounded bg-white/6" />
          <Skeleton className="h-8 w-full rounded bg-white/6" />
        </div>
      </div>
    </div>
  );
}

export function AgentCardSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </>
  );
}
