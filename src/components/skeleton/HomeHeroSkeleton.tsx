import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full hero stack: video area + marquee strip + stats row (matches {@link HeroSection} layout).
 */
export function HomeHeroSkeleton() {
  return (
    <>
      <section className="relative min-h-[82dvh] md:min-h-[90dvh] flex flex-col items-center justify-end overflow-hidden pt-28 sm:pt-32 md:pt-12 md:pb-24 bg-background">
        <Skeleton className="absolute inset-0 rounded-none bg-muted/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/95" />

        <div className="w-full relative z-10 flex flex-col items-center pb-8 md:pb-12 px-4">
          <div className="text-center mb-8 space-y-4 max-w-4xl">
            <Skeleton className="h-3 w-40 mx-auto bg-muted/70" />
            <Skeleton className="h-12 sm:h-16 md:h-20 w-full max-w-2xl mx-auto bg-muted/80" />
            <Skeleton className="h-12 sm:h-16 md:h-20 w-4/5 max-w-xl mx-auto bg-muted/70" />
            <Skeleton className="h-1 w-20 mx-auto rounded-full bg-muted/60" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-12 w-44 rounded-lg bg-muted/80" />
            <Skeleton className="h-12 w-44 rounded-lg bg-muted/70" />
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 h-px bg-border/30" />
      </section>

      <div className="relative z-10 border-y border-border/20 bg-card/40 py-4 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex gap-6 justify-center flex-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24 md:w-32 bg-muted/60" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 border-b border-border/30 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0 bg-muted/80" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-2 w-16 bg-muted/60" />
                  <Skeleton className="h-4 w-20 bg-muted/80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
