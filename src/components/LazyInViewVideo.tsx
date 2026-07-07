import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LazyInViewVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
  srcLoader: () => Promise<{ default: string }>;
  rootMargin?: string;
  wrapperClassName?: string;
};

/** Loads and plays a video only when it enters (or nears) the viewport. */
export function LazyInViewVideo({
  srcLoader,
  rootMargin = "240px",
  wrapperClassName = "absolute inset-0",
  className,
  ...videoProps
}: LazyInViewVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

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
      {src ? (
        <video
          {...videoProps}
          src={src}
          preload="none"
          className={cn("h-full w-full object-cover", className)}
        />
      ) : null}
    </div>
  );
}
