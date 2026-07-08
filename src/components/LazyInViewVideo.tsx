import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LazyInViewVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
  srcLoader: () => Promise<{ default: string }>;
  rootMargin?: string;
  wrapperClassName?: string;
  placeholderClassName?: string;
};

/** Loads and plays a video only when it enters (or nears) the viewport. */
export function LazyInViewVideo({
  srcLoader,
  rootMargin = "240px",
  wrapperClassName = "absolute inset-0",
  placeholderClassName = "absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_35%_20%,rgba(154,53,255,0.18),transparent_55%),linear-gradient(135deg,rgba(9,14,25,0.96),rgba(4,8,15,0.9))]",
  className,
  ...videoProps
}: LazyInViewVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoaded(false);
    }
  }, [src]);

  useEffect(() => {
    const node = containerRef.current;
    if (!src || !node) return;

    const video = node.querySelector("video");
    video?.play().catch(() => undefined);
  }, [src]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void srcLoader().then((module) => setSrc(module.default));
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, src, srcLoader]);

  return (
    <div ref={containerRef} className={wrapperClassName} aria-hidden={videoProps["aria-hidden"]}>
      {!isLoaded ? <div className={placeholderClassName} /> : null}
      {src ? (
        <video
          {...videoProps}
          src={src}
          preload="none"
          onLoadedData={(event) => {
            setIsLoaded(true);
            videoProps.onLoadedData?.(event);
          }}
          className={cn("h-full w-full object-cover", className)}
        />
      ) : null}
    </div>
  );
}
