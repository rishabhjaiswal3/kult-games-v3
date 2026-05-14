import { cn } from "@/lib/utils";

type ArenaBattleGifProps = {
  src: string;
  alt: string;
  className?: string;
};

/** Animated battle preview (GIF) with a subtle live-scan overlay. */
export function ArenaBattleGif({ src, alt, className }: ArenaBattleGifProps) {
  return (
    <div className={cn("relative overflow-hidden bg-black/50", className)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 100% 60% / 0.08) 2px, hsl(195 100% 60% / 0.08) 4px)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" aria-hidden />
    </div>
  );
}
