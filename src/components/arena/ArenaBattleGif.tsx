import AutoPlayVideo from "@/components/AutoplayVideo";
import type { ArenaBattleMediaItem } from "@/constants/arenaLiveBattleMedia";
import { cn } from "@/lib/utils";

type ArenaBattleMediaProps = {
  media: ArenaBattleMediaItem;
  alt: string;
  className?: string;
};

function ArenaBattleMediaOverlay() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 100% 60% / 0.08) 2px, hsl(195 100% 60% / 0.08) 4px)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" aria-hidden />
    </>
  );
}

/** Live battle preview — action clips (video) or still arena shots (image). */
export function ArenaBattleGif({ media, alt, className }: ArenaBattleMediaProps) {
  return (
    <div className={cn("relative overflow-hidden bg-black/50", className)}>
      {media.kind === "video" ? (
        <AutoPlayVideo
          src={media.src}
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          aria-label={alt}
        />
      ) : (
        <img
          src={media.src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      )}
      <ArenaBattleMediaOverlay />
    </div>
  );
}
