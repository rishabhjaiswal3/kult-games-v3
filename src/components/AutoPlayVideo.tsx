import { useEffect, useRef } from "react";

interface AutoPlayVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  type?: string;
}

/**
 * Wraps <video> to reliably autoplay on client-side navigation (React Router).
 * Calls video.load() + video.play() after mount, since the `autoPlay` HTML
 * attribute only fires on hard page loads in some browsers.
 */
const AutoPlayVideo = ({ src, type = "video/mp4", className, style, ...props }: AutoPlayVideoProps) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {/* autoplay blocked — silently ignore */});
  }, [src]);

  return (
    <video ref={ref} autoPlay muted playsInline preload="auto" {...props} className={className} style={style}>
      <source src={src} type={type} />
    </video>
  );
};

export default AutoPlayVideo;
