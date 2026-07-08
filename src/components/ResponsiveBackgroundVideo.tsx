import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

type Breakpoint = "sm" | "md";

const BREAKPOINT_QUERIES: Record<Breakpoint, string> = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
};

type ResponsiveBackgroundVideoProps = {
  mobileSrc: string;
  desktopSrc: string;
  breakpoint?: Breakpoint;
  className?: string;
  desktopClassName?: string;
  mobileClassName?: string;
  /** Wrapper around video + skeleton. Use for aspect-ratio / absolute fill. */
  wrapperClassName?: string;
  placeholderClassName?: string;
};

const DEFAULT_PLACEHOLDER =
  "absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_32%_18%,rgba(154,53,255,0.28),transparent_52%),radial-gradient(circle_at_78%_42%,rgba(0,137,255,0.16),transparent_48%),linear-gradient(145deg,rgba(7,10,20,0.98),rgba(4,8,15,0.92))]";

/** Renders only one hero video for the active breakpoint to avoid double downloads. */
export function ResponsiveBackgroundVideo({
  mobileSrc,
  desktopSrc,
  breakpoint = "sm",
  className = "absolute inset-0 h-full w-full object-cover",
  desktopClassName,
  mobileClassName,
  wrapperClassName = "absolute inset-0",
  placeholderClassName = DEFAULT_PLACEHOLDER,
}: ResponsiveBackgroundVideoProps) {
  const isDesktop = useMediaQuery(BREAKPOINT_QUERIES[breakpoint]);
  const src = isDesktop ? desktopSrc : mobileSrc;
  const resolvedClassName = isDesktop ? (desktopClassName ?? className) : (mobileClassName ?? className);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markLoaded = () => setIsLoaded(true);

    // Cached videos may already be ready before listeners attach.
    if (video.readyState >= 2) {
      markLoaded();
    }

    video.addEventListener("loadeddata", markLoaded);
    video.addEventListener("canplay", markLoaded);
    video.play().catch(() => undefined);

    return () => {
      video.removeEventListener("loadeddata", markLoaded);
      video.removeEventListener("canplay", markLoaded);
    };
  }, [src]);

  return (
    <div className={wrapperClassName} aria-hidden>
      {!isLoaded ? <div className={placeholderClassName} /> : null}
      <video
        ref={videoRef}
        key={src}
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={src}
        onLoadedData={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
        className={cn(resolvedClassName, !isLoaded && "opacity-0")}
      />
    </div>
  );
}
