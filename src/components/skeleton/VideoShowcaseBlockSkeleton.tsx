import { Skeleton } from "@/components/ui/skeleton";

type VideoShowcaseBlockSkeletonProps = {
  /** Tailwind height class, e.g. h-[45vh] */
  heightClass?: string;
};

export function VideoShowcaseBlockSkeleton({ heightClass = "h-[45vh]" }: VideoShowcaseBlockSkeletonProps) {
  return (
    <div className={`relative overflow-hidden z-10 ${heightClass} border-y border-border/20`}>
      <Skeleton className="absolute inset-0 rounded-none bg-muted/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-4 z-10">
        <Skeleton className="h-3 w-40 bg-muted/70" />
        <Skeleton className="h-10 w-64 max-w-full sm:h-12 sm:w-80 bg-muted/80" />
        <Skeleton className="h-11 w-48 rounded-lg bg-muted/70" />
      </div>
    </div>
  );
}
