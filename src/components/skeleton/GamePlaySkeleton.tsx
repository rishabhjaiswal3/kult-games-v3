import { Skeleton } from "@/components/ui/skeleton";

export function GamePlaySkeleton() {
  return (
    <div className="flex h-screen w-screen flex-col bg-background" aria-busy="true" aria-label="Loading game">
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur-sm">
        <Skeleton className="h-9 w-24 rounded-lg bg-muted/70" />
        <Skeleton className="h-5 w-40 bg-muted/80" />
        <Skeleton className="ml-auto h-9 w-28 rounded-lg bg-muted/65" />
      </div>
      <div className="relative min-h-0 flex-1 p-4">
        <Skeleton className="h-full w-full rounded-xl bg-muted/45" />
      </div>
    </div>
  );
}
