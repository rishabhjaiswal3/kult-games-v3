import { cn } from "@/lib/utils";

type ArenaAgentMediaProps = {
  src: string;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
  /** "intrinsic" sizes to the asset aspect ratio inside a flex/grid frame; "fill" stretches to the frame. */
  layout?: "fill" | "intrinsic";
  position?: "center" | "top";
};

export function ArenaAgentMedia({
  src,
  alt,
  className,
  fit = "cover",
  layout = "fill",
  position,
}: ArenaAgentMediaProps) {
  const objectPosition = position === "top" ? "object-top" : "object-center";
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  const sizeClass = layout === "intrinsic" ? "h-auto w-auto max-h-full max-w-full" : "h-full w-full";
  const mediaClass = cn("block", sizeClass, fitClass, objectPosition, className);

  if (src.endsWith(".mp4")) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className={mediaClass}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={mediaClass}
      loading="lazy"
      decoding="async"
    />
  );
}
