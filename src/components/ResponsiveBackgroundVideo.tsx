import { useMediaQuery } from "@/hooks/useMediaQuery";

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
};

/** Renders only one hero video for the active breakpoint to avoid double downloads. */
export function ResponsiveBackgroundVideo({
  mobileSrc,
  desktopSrc,
  breakpoint = "sm",
  className = "absolute inset-0 h-full w-full object-cover",
  desktopClassName,
  mobileClassName,
}: ResponsiveBackgroundVideoProps) {
  const isDesktop = useMediaQuery(BREAKPOINT_QUERIES[breakpoint]);
  const src = isDesktop ? desktopSrc : mobileSrc;
  const resolvedClassName = isDesktop ? (desktopClassName ?? className) : (mobileClassName ?? className);

  return (
    <video
      key={src}
      aria-hidden
      autoPlay
      loop
      muted
      playsInline
      preload={isDesktop ? "auto" : "metadata"}
      src={src}
      className={resolvedClassName}
    />
  );
}
