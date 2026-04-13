import { Skeleton } from "@/components/ui/skeleton";
import { GamesCarouselSkeleton } from "@/components/skeleton/GamesCarouselSkeleton";

type GamesSectionSkeletonProps = {
  cardCount?: number;
};

export function GamesSectionSkeleton({ cardCount = 5 }: GamesSectionSkeletonProps) {
  return (
    <section className="relative py-16 md:py-24 z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background/90" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full bg-neon-cyan/40" />
              <Skeleton className="h-3 w-48 md:w-64 bg-muted/80" />
            </div>
            <Skeleton className="h-8 w-full max-w-md md:h-10 md:max-w-xl bg-muted/80" />
            <Skeleton className="h-8 w-4/5 max-w-sm md:h-10 bg-muted/70" />
          </div>
          <div className="hidden lg:flex gap-3 shrink-0">
            <Skeleton className="h-14 w-14 rounded-full bg-muted/80" />
            <Skeleton className="h-14 w-14 rounded-full bg-muted/80" />
          </div>
        </div>

        <div className="relative">
          <GamesCarouselSkeleton count={cardCount} />
          <div className="absolute top-0 left-0 bottom-4 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>

        <div className="mt-8 flex justify-center">
          <Skeleton className="h-11 w-44 rounded-lg bg-muted/80" />
        </div>
      </div>
    </section>
  );
}
