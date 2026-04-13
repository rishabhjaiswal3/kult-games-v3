import { Skeleton } from "@/components/ui/skeleton";

export function AIConciergeBlockSkeleton() {
  return (
    <section className="relative py-24 z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background/90" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full bg-muted/80" />
            <Skeleton className="h-3 w-32 bg-muted/80" />
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-muted/80" />
            <Skeleton className="h-10 w-32 md:h-12 md:w-40 bg-muted/80" />
          </div>
          <Skeleton className="h-4 w-full max-w-md mx-auto bg-muted/70" />
        </div>

        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg bg-muted/80" />
                <Skeleton className="h-4 flex-1 max-w-[180px] bg-muted/80" />
              </div>
              <Skeleton className="h-3 w-full bg-muted/60" />
              <Skeleton className="h-3 w-4/5 bg-muted/50" />
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto mt-8 flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-xl bg-muted/80" />
          <Skeleton className="h-12 w-12 rounded-xl bg-muted/80 shrink-0" />
        </div>
      </div>
    </section>
  );
}
