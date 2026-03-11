import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import kultLogo from "@/assets/kult-logo.png";

const DURATION = 5300; // 4.2 seconds

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hasExitedRef = useRef(false);

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: "100%",
        duration: DURATION / 1000,
        ease: "power1.inOut",
      });
    }

    const timer = setTimeout(startExit, DURATION);
    return () => clearTimeout(timer);
  }, []);

  const startExit = () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    onComplete();

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.03,
        duration: 0.7,
        ease: "power3.out",
        onComplete: () => setShow(false),
      });
    } else {
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "hsl(220 50% 4%)" }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.04, 1], filter: ["brightness(0.92)", "brightness(1)", "brightness(0.92)"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        >
          <source src="/videos/loader.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(278_100%_70%/0.14),transparent_38%),linear-gradient(180deg,hsl(220_50%_4%/0.3),hsl(220_50%_4%/0.88))]" />

      {/* Ambient glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(278 100% 70% / 0.14) 0%, hsl(270 80% 60% / 0.08) 38%, transparent 68%)",
        }}
      />
      <div className="absolute top-[12%] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[hsl(278_100%_70%/0.12)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[14%] h-[220px] w-[220px] rounded-full bg-[hsl(195_100%_60%/0.08)] blur-[110px] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-[540px] flex-col items-center gap-7 px-6">
        {/* Logo lockup */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
          }}
          className="relative flex flex-col items-center"
        >
          <motion.div
            className="absolute inset-[-18px] rounded-[32px] border border-[hsl(278_100%_75%/0.16)]"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-[-8px] rounded-[24px] border border-[hsl(195_100%_60%/0.08)]"
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative rounded-[24px] border border-[hsl(278_100%_75%/0.18)] bg-[linear-gradient(135deg,hsl(265_90%_18%/0.72),hsl(220_45%_10%/0.35))] px-8 py-6 backdrop-blur-xl shadow-[0_0_40px_hsl(270_82%_58%/0.18)]">
            <img src={kultLogo} alt="Kult Games" className="h-12 w-auto md:h-14" />
          </div>
        </motion.div>

        {/* Brand heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="text-center"
        >
          <motion.div
            animate={{
              textShadow: [
                "0 0 10px hsl(278 100% 70% / 0.18)",
                "0 0 22px hsl(278 100% 70% / 0.3)",
                "0 0 10px hsl(278 100% 70% / 0.18)",
              ],
            }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="font-display text-3xl md:text-5xl font-black tracking-[0.22em] text-foreground"
          >
            KULT GAMES
          </motion.div>
          <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.48em] text-[hsl(278_100%_82%/0.72)]">
            AI-Native On-Chain Play
          </p>
        </motion.div>

        {/* Horizontal divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
          className="h-[1px] w-[240px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(278 100% 78% / 0.4), transparent)",
          }}
        />

        {/* Progress bar */}
        <div className="w-full max-w-[280px]">
          <div className="mb-2 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.35em] text-muted-foreground/70">
            <span>Initializing</span>
            <span>0G Sync</span>
          </div>
          <div className="relative h-[6px] overflow-hidden rounded-full border border-[hsl(278_100%_75%/0.14)] bg-white/5 p-[1px]">
            <motion.div
              className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-120%", "320%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            />
            <div
              ref={progressRef}
              className="h-full w-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, hsl(270 82% 52%), hsl(278 100% 70%), hsl(195 100% 65%))",
                boxShadow: "0 0 14px hsl(278 100% 70% / 0.55)",
              }}
            />
          </div>
        </div>

        {/* Pulsing status text */}
        <motion.span
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="text-[8px] font-mono text-[hsl(278_100%_82%/0.52)] tracking-[0.5em] uppercase -mt-2"
        >
          ENTERING THE VOID
        </motion.span>
      </div>

      {/* Cinematic scanning light */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(278 100% 78% / 0.35), hsl(195 100% 80% / 0.45), hsl(278 100% 78% / 0.35), transparent)",
          boxShadow: "0 0 12px hsl(278 100% 78% / 0.28)",
        }}
        animate={{ top: ["-1px", "100%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
      />

      {/* Corner accents */}
      {[
        "top-6 left-6 border-t border-l",
        "top-6 right-6 border-t border-r",
        "bottom-6 left-6 border-b border-l",
        "bottom-6 right-6 border-b border-r",
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute ${cls} border-[hsl(278_100%_75%/0.24)] w-7 h-7 pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.08 }}
        />
      ))}
    </div>
  );
};

export default LoadingScreen;
