import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const VIDEO_DURATION = 4000; // Only first 4 seconds

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hasExitedRef = useRef(false);

  useEffect(() => {
    // Progress bar animation
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: "100%",
        duration: VIDEO_DURATION / 1000,
        ease: "power1.inOut",
      });
    }

    const timer = setTimeout(() => {
      startExit();
    }, VIDEO_DURATION);

    return () => clearTimeout(timer);
  }, []);

  // Stop video at 4 seconds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      if (video.currentTime >= 4) {
        video.pause();
        startExit();
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const handleVideoReady = () => {
    setVideoLoaded(true);
  };

  const startExit = () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    onComplete();

    const container = containerRef.current;
    const veil = veilRef.current;
    const video = videoRef.current;

    if (!container || !veil || !video) {
      setShow(false);
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => setShow(false),
    });

    timeline.to(veil, { opacity: 0, duration: 0.5, ease: "power2.out" });
    timeline.to(video, { opacity: 0, scale: 1.05, filter: "blur(12px)", duration: 0.7, ease: "power3.out" }, 0);
    timeline.to(container, { opacity: 0, duration: 0.7, ease: "power3.out" }, 0.05);
  };

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Cyan ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, hsl(195 100% 50% / 0.08) 0%, transparent 60%)"
      }} />

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedData={handleVideoReady}
        className={`max-h-screen max-w-full object-contain transition-opacity duration-700 ${videoLoaded ? "opacity-80" : "opacity-0"}`}
        style={{ filter: "hue-rotate(-10deg) saturate(1.3) brightness(0.9)" }}
      >
        <source src="/videos/loader.mp4" type="video/mp4" />
      </video>

      {/* Overlay veil */}
      <div ref={veilRef} className="absolute inset-0 bg-background/15" />

      {/* Cyan scan line */}
      <div
        className="absolute left-0 right-0 h-[2px] animate-[loaderScan_2s_linear_infinite] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.6), transparent)",
          boxShadow: "0 0 15px hsl(195 100% 60% / 0.4), 0 0 30px hsl(195 100% 60% / 0.2)",
        }}
      />

      {/* Progress bar at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[2px] bg-muted/30 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="h-full w-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, hsl(195 100% 50%), hsl(195 80% 80%))",
            boxShadow: "0 0 10px hsl(195 100% 50% / 0.6), 0 0 20px hsl(195 100% 50% / 0.3)",
          }}
        />
      </div>

      {/* Loading text */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
        <span className="text-[10px] font-mono text-neon-cyan/60 tracking-[0.4em] uppercase animate-pulse">
          INITIALIZING
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
