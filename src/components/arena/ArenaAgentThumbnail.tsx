import { getArenaAgentPortrait } from "@/constants/arenaAgentArchetypes";
import { cn } from "@/lib/utils";

/** Crop agent portraits from the top so faces stay visible in small frames. */
export const AGENT_PORTRAIT_MEDIA_CLASS =
  "absolute inset-0 h-full w-full object-cover object-top";

type ArenaAgentThumbnailProps = {
  agent: { id: string; archetype?: string | null; name?: string };
  className?: string;
  mediaClassName?: string;
  size?: "sm" | "md";
};

const sizeClass = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
} as const;

export function ArenaAgentThumbnail({ agent, className, mediaClassName, size = "sm" }: ArenaAgentThumbnailProps) {
  const src = getArenaAgentPortrait(agent);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[hsl(268_32%_8%/0.65)]",
        sizeClass[size],
        className
      )}
    >
      {src.endsWith(".mp4") ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className={cn(AGENT_PORTRAIT_MEDIA_CLASS, mediaClassName)}
        />
      ) : (
        <img
          src={src}
          alt={agent.name ? `${agent.name} portrait` : "Agent portrait"}
          className={cn(AGENT_PORTRAIT_MEDIA_CLASS, mediaClassName)}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
