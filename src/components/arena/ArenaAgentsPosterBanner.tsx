import type { ReactNode } from "react";
import { agentsPoster } from "@/constants/arenaAgentArchetypes";
import { cn } from "@/lib/utils";

type ArenaAgentsPosterBannerProps = {
  children: ReactNode;
  className?: string;
  imageAlt?: string;
  /**
   * `full` — 3:2 poster frame, faces visible (home + roster hero).
   * `cinematic` — wide crop for compact layouts.
   */
  variant?: "full" | "cinematic";
};

export function ArenaAgentsPosterBanner({
  children,
  className,
  imageAlt = "AI Arena agent roster — six archetypes united under 0G",
  variant = "full",
}: ArenaAgentsPosterBannerProps) {
  const isFull = variant === "full";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(268_32%_8%)] shadow-[0_24px_80px_hsl(270_80%_20%/0.18)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, hsl(278 88% 62% / 0.14), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 80%, hsl(198 92% 68% / 0.08), transparent 50%)",
        }}
      />

      <div className={cn("relative", isFull ? "flex flex-col" : "overflow-hidden")}>
        <div
          className={cn(
            "relative w-full bg-[hsl(268_32%_6%)]",
            isFull ? "aspect-[3/2]" : "aspect-[21/9] min-h-[200px] sm:min-h-[240px] md:aspect-[2.4/1] lg:min-h-[320px]"
          )}
        >
          <img
            src={agentsPoster}
            alt={imageAlt}
            className={cn(
              "block h-full w-full",
              isFull ? "object-contain object-center" : "object-cover object-center"
            )}
            loading="lazy"
            decoding="async"
          />

          {isFull ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[hsl(268_32%_8%/0.95)] via-[hsl(268_32%_10%/0.45)] to-transparent" />
          ) : (
            <>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(268_32%_8%)] via-[hsl(268_32%_10%/0.55)] to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[hsl(268_32%_8%/0.88)] via-[hsl(268_32%_8%/0.35)] to-[hsl(268_32%_8%/0.88)]" />
            </>
          )}
        </div>

        <div
          className={cn(
            "relative z-[2]",
            isFull
              ? "border-t border-white/[0.06] bg-[hsl(268_32%_8%/0.94)] backdrop-blur-sm"
              : "absolute inset-0 flex flex-col justify-end"
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
