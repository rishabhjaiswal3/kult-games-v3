import { Skeleton } from "@/components/ui/skeleton";

export function AIArenaCtaBlockSkeleton() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-background/40" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl bg-muted/60 border border-border/30" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-24 bg-muted/70" />
            <Skeleton className="h-9 w-full max-w-sm bg-muted/80" />
            <Skeleton className="h-9 w-4/5 max-w-xs bg-muted/70" />
            <Skeleton className="h-20 w-full max-w-md bg-muted/50" />
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-lg bg-muted/70" />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-12 w-48 rounded-lg bg-muted/80" />
              <Skeleton className="h-12 w-52 rounded-lg bg-muted/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
