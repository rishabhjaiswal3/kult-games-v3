import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const DURATION = 3200; // 3.2 seconds

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

  const brandLetters = "KULT GAMES".split("");

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "hsl(220 50% 4%)" }}
    >
      {/* Radial ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(195 100% 50% / 0.1) 0%, hsl(270 80% 60% / 0.05) 40%, transparent 65%)",
        }}
      />

      {/* Pulsing rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-neon-cyan/15"
          initial={{ width: 60, height: 60, opacity: 0 }}
          animate={{
            width: [60, 60 + i * 140],
            height: [60, 60 + i * 140],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: i * 0.65,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-7">
        {/* Hexagon K logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative"
        >
          {/* Rotating dashed ring */}
          <motion.div
            className="absolute inset-[-14px] rounded-full border border-dashed border-neon-cyan/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          {/* Counter-rotating ring */}
          <motion.div
            className="absolute inset-[-6px] rounded-full border border-neon-cyan/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />

          <svg viewBox="0 0 100 100" width="76" height="76">
            <motion.polygon
              points="50,4 96,28 96,72 50,96 4,72 4,28"
              fill="none"
              stroke="hsl(195 100% 60%)"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{
                filter: "drop-shadow(0 0 8px hsl(195 100% 60% / 0.7))",
              }}
            />
            <motion.text
              x="50"
              y="64"
              textAnchor="middle"
              fill="hsl(195 100% 85%)"
              fontSize="40"
              fontFamily="Orbitron, sans-serif"
              fontWeight="900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{
                filter: "drop-shadow(0 0 10px hsl(195 100% 60%))",
              }}
            >
              K
            </motion.text>
          </svg>
        </motion.div>

        {/* Brand name with letter stagger */}
        <div className="flex items-center">
          {brandLetters.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.4,
                delay: 0.7 + i * 0.05,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className={`font-display font-black text-xl tracking-[0.2em] ${
                char === " " ? "w-3 inline-block" : "text-foreground"
              }`}
              style={
                char !== " "
                  ? { textShadow: "0 0 18px hsl(195 100% 60% / 0.5)" }
                  : {}
              }
            >
              {char !== " " ? char : "\u00A0"}
            </motion.span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="text-[8px] font-mono text-neon-cyan/55 tracking-[0.55em] uppercase"
        >
          ON-CHAIN GAMING
        </motion.span>

        {/* Horizontal divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="w-[200px] h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.4), transparent)",
          }}
        />

        {/* Progress bar */}
        <div className="w-[200px] h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full w-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(195 100% 50%), hsl(195 80% 75%))",
              boxShadow: "0 0 10px hsl(195 100% 50% / 0.7)",
            }}
          />
        </div>

        {/* Pulsing status text */}
        <motion.span
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="text-[8px] font-mono text-neon-cyan/45 tracking-[0.5em] uppercase -mt-3"
        >
          INITIALIZING
        </motion.span>
      </div>

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.5), hsl(195 100% 80% / 0.7), hsl(195 100% 60% / 0.5), transparent)",
          boxShadow: "0 0 12px hsl(195 100% 60% / 0.4)",
        }}
        animate={{ top: ["-1px", "100%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
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
          className={`absolute ${cls} border-neon-cyan/25 w-7 h-7 pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.08 }}
        />
      ))}
    </div>
  );
};

export default LoadingScreen;
