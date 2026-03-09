import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const VIDEO_START_TIME = 1;
const VIDEO_FALLBACK_HIDE_DELAY = 9800;

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasExitedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const seekToStart = () => {
        video.currentTime = VIDEO_START_TIME;
        video.removeEventListener("loadedmetadata", seekToStart);
      };
      if (video.readyState >= 1) {
        video.currentTime = VIDEO_START_TIME;
      } else {
        video.addEventListener("loadedmetadata", seekToStart);
      }
    }
    const videoTimer = setTimeout(() => {
      startExit();
    }, VIDEO_FALLBACK_HIDE_DELAY);

    return () => {
      clearTimeout(videoTimer);
    };
  }, []);

  const handleVideoReady = () => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - VIDEO_START_TIME) > 0.15) {
      video.currentTime = VIDEO_START_TIME;
    }
    setVideoLoaded(true);
  };

  const startExit = () => {
    if (hasExitedRef.current) {
      return;
    }

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
      onComplete: () => {
        setShow(false);
      },
    });

    timeline.to(veil, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });
    timeline.to(
      video,
      {
        opacity: 0,
        scale: 1.045,
        filter: "blur(10px)",
        duration: 0.65,
        ease: "power3.out",
      },
      0
    );
    timeline.to(
      container,
      {
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
      },
      0.05
    );
  };

  const handleVideoEnded = () => {
    startExit();
  };

  if (!show) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedData={handleVideoReady}
        onEnded={handleVideoEnded}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-70" : "opacity-0"}`}
      >
        <source src="/videos/SC_2-2.mp4" type="video/mp4" />
      </video>
      <div ref={veilRef} className="absolute inset-0 bg-background/28" />
    </div>
  );
};

export default LoadingScreen;
