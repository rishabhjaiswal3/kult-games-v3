import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type GamesCarouselSkeletonProps = {
  count?: number;
  className?: string;
};

/**
 * Placeholder row matching {@link GameCard} width in the home games carousel.
 */
export function GamesCarouselSkeleton({ count = 5, className }: GamesCarouselSkeletonProps) {
  return (
    <div className={cn(className)}>
      <div className="flex gap-5 overflow-hidden pb-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[260px] md:w-[280px] snap-start rounded-xl overflow-hidden bg-card/80 border border-border/50"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-none bg-muted/80" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4 bg-muted/80" />
              <Skeleton className="h-3 w-1/2 bg-muted/80" />
              <Skeleton className="h-1 w-full bg-muted/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
