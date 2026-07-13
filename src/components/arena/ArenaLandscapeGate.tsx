import { useEffect, useState, type ReactNode } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsDesktopLayout } from "@/hooks/useMediaQuery";

type ArenaLandscapeGateProps = {
  children: ReactNode;
  /** When true, mobile portrait users must rotate before seeing the game. */
  active?: boolean;
  className?: string;
};

function useIsPortraitViewport() {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const update = () => setIsPortrait(window.innerHeight > window.innerWidth);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return isPortrait;
}

/**
 * Blocks the arena game on mobile portrait until the user rotates to landscape.
 * Desktop layout is unaffected.
 */
export function ArenaLandscapeGate({
  children,
  active = true,
  className,
}: ArenaLandscapeGateProps) {
  const isDesktop = useIsDesktopLayout();
  const isPortrait = useIsPortraitViewport();
  const requireRotation = active && !isDesktop && isPortrait;

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        className={cn(
          "h-full w-full",
          requireRotation && "invisible pointer-events-none select-none",
        )}
        aria-hidden={requireRotation}
      >
        {children}
      </div>

      {requireRotation ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#030710] px-6">
          <div className="max-w-xs text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#9a35ff]/35 bg-[#9a35ff]/10 shadow-[0_0_40px_rgba(154,53,255,0.2)]">
              <Smartphone
                className="h-10 w-10 text-[#c084fc] animate-[arena-phone-rotate_2.4s_ease-in-out_infinite]"
                aria-hidden
              />
            </div>
            <h2 className="font-display text-xl font-black uppercase tracking-wide text-white">
              Rotate your device
            </h2>
            <p className="mt-2 font-tech text-[11px] leading-relaxed uppercase tracking-wider text-white/45">
              This battle is built for landscape. Turn your phone sideways to continue.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
