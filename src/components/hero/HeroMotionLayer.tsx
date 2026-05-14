import { motion, useReducedMotion } from "framer-motion";
import NeuralPulse from "@/components/NeuralPulse";
import AIDataStream from "@/components/AIDataStream";

const NEURAL_NODES = [
  { x: 12, y: 28 },
  { x: 28, y: 18 },
  { x: 45, y: 35 },
  { x: 62, y: 22 },
  { x: 78, y: 40 },
  { x: 88, y: 18 },
  { x: 18, y: 58 },
  { x: 35, y: 72 },
  { x: 55, y: 65 },
  { x: 72, y: 78 },
  { x: 90, y: 62 },
];

const NEURAL_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [0, 6], [2, 8], [6, 7], [7, 8], [8, 9], [9, 10], [5, 10],
  [3, 8], [1, 4],
];

const PARTICLES = [
  { left: "6%", top: "18%", size: 2, delay: 0, dur: 4.2, drift: 12 },
  { left: "88%", top: "14%", size: 1.5, delay: 0.8, dur: 5.5, drift: -10 },
  { left: "20%", top: "72%", size: 2.5, delay: 1.2, dur: 3.8, drift: 8 },
  { left: "74%", top: "58%", size: 1, delay: 0.3, dur: 6, drift: -14 },
  { left: "46%", top: "24%", size: 2, delay: 1.8, dur: 4.6, drift: 6 },
  { left: "94%", top: "42%", size: 1.5, delay: 0.6, dur: 5.2, drift: -8 },
  { left: "4%", top: "48%", size: 1, delay: 1.4, dur: 4, drift: 10 },
  { left: "60%", top: "82%", size: 2, delay: 2, dur: 3.6, drift: -6 },
  { left: "36%", top: "38%", size: 1, delay: 0.5, dur: 7, drift: 5 },
  { left: "68%", top: "88%", size: 1.5, delay: 1.7, dur: 4.8, drift: -9 },
  { left: "52%", top: "52%", size: 1.2, delay: 2.2, dur: 5.8, drift: 7 },
  { left: "82%", top: "30%", size: 1.8, delay: 0.9, dur: 4.4, drift: -11 },
];

export function HeroMotionLayer() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/[0.03] via-transparent to-primary/[0.04]" />
      </motion.div>
    );
  }

  return (
    <motion.div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <NeuralPulse className="opacity-70" />
      <AIDataStream />

      {/* Holographic scanlines + flicker */}
      <motion.div
        className="hero-hologram-overlay absolute inset-0"
        animate={{ opacity: [0.35, 0.55, 0.4, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 mix-blend-screen opacity-[0.12]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 100% 60% / 0.04) 2px, hsl(195 100% 60% / 0.04) 3px)",
        }}
        animate={{ backgroundPositionY: ["0px", "24px"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Neural mesh */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.22]" viewBox="0 0 100 100" preserveAspectRatio="none">
        {NEURAL_EDGES.map(([a, b], i) => {
          const from = NEURAL_NODES[a];
          const to = NEURAL_NODES[b];
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="hsl(195 100% 60%)"
              strokeWidth="0.12"
              strokeOpacity={0.35}
              initial={{ pathLength: 0, opacity: 0.1 }}
              animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: 5 + (i % 3), repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
            />
          );
        })}
        {NEURAL_NODES.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={0.35}
            fill="hsl(195 100% 65%)"
            animate={{ opacity: [0.3, 0.9, 0.3], r: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2.5 + (i % 4) * 0.4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>

      {/* Floating neural particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-neon-cyan"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * 5}px hsl(195 100% 60% / 0.85)`,
          }}
          animate={{
            y: [0, -22, 0],
            x: [0, p.drift, 0],
            opacity: [0.2, 0.85, 0.2],
            scale: [1, 1.35, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Energy pulses from bottom center */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute left-1/2 bottom-[12%] -translate-x-1/2 rounded-full border border-neon-cyan/25"
          style={{ boxShadow: "0 0 40px hsl(195 100% 60% / 0.08)" }}
          animate={{
            width: ["80px", "520px", "80px"],
            height: ["40px", "180px", "40px"],
            opacity: [0.35, 0, 0.35],
          }}
          transition={{
            duration: 4.5 + i * 1.2,
            repeat: Infinity,
            delay: i * 1.6,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Horizontal energy sweep */}
      <motion.div
        className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent"
        animate={{ x: ["-10%", "110%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}
