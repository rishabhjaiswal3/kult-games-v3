import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ArenaOpenLobbyCardSkeletonProps = {
  className?: string;
};

export function ArenaOpenLobbyCardSkeleton({ className }: ArenaOpenLobbyCardSkeletonProps) {
  return (
    <li
      className={cn("rounded-2xl border border-white/[0.08] bg-card/45 p-4 sm:p-5", className)}
      aria-hidden
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Skeleton className="h-24 w-24 shrink-0 rounded-2xl bg-muted/70 sm:h-28 sm:w-28" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-36 max-w-full bg-muted/80" />
            <Skeleton className="h-3 w-28 bg-muted/60" />
            <Skeleton className="mt-2 h-8 w-16 bg-muted/75" />
            <Skeleton className="h-2 w-20 bg-muted/50" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <Skeleton className="h-6 w-20 rounded-full bg-muted/60" />
          <Skeleton className="h-3 w-24 bg-muted/50" />
          <Skeleton className="h-3 w-28 bg-muted/55" />
          <Skeleton className="mt-1 h-9 w-full rounded-lg bg-muted/70 sm:w-28" />
        </div>
      </div>
    </li>
  );
}

export function ArenaOpenLobbyGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <ul className="mt-4 grid gap-3 lg:grid-cols-2" aria-busy="true" aria-label="Loading open lobbies">
      {Array.from({ length: count }).map((_, i) => (
        <ArenaOpenLobbyCardSkeleton key={i} />
      ))}
    </ul>
  );
}
