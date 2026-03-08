import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 1000);
    }, 5500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 3;
      videoRef.current.play().catch(() => {});
    }
    setVideoLoaded(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            onCanPlayThrough={handleVideoLoaded}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-60' : 'opacity-0'}`}
          >
            <source src="/videos/SC_2-2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-background/40" />

          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.p
              className="font-display text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold tracking-[0.25em] uppercase gradient-text glow-text"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Entering the Kultverse
            </motion.p>

            <div className="w-48 h-[2px] bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
