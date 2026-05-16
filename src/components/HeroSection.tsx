import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Swords, Flame, Users, Gamepad2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { HeroMotionLayer } from "@/components/hero/HeroMotionLayer";
import { HeroArenaTicker } from "@/components/hero/HeroArenaTicker";

const liveStats = [
  { icon: Users, label: "PLAYERS ONLINE", value: "12,847", accent: true },
  { icon: Gamepad2, label: "GAMES PLAYED", value: "1.2M+" },
  { icon: Trophy, label: "PRIZES WON", value: "420 ETH" },
  { icon: Flame, label: "TRENDING", value: "Zero Dash" },
];

const line1Words = ["SHAPING", "THE", "FUTURE", "OF"];
const line2Words = ["ON-CHAIN", "GAMING"];

const wordStagger = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.15 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface HeroSectionProps {
  onExploreGames: () => void;
}

function HeroGlowButton({
  children,
  onClick,
  variant = "outline",
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "outline" | "primary";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const isPrimary = variant === "primary";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg px-10 py-4 font-display text-sm font-semibold tracking-wider ${
        isPrimary ? "btn-eye" : "btn-eye-outline"
      } ${className}`}
      whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: isPrimary
            ? "radial-gradient(circle at 50% 50%, hsl(270 82% 58% / 0.35), transparent 65%)"
            : "radial-gradient(circle at 50% 50%, hsl(195 100% 60% / 0.22), transparent 65%)",
        }}
        animate={reduceMotion ? undefined : { opacity: [0.15, 0.45, 0.15] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="pointer-events-none absolute -inset-px rounded-lg opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: isPrimary
            ? "0 0 28px hsl(270 82% 58% / 0.45), inset 0 0 20px hsl(278 100% 82% / 0.08)"
            : "0 0 24px hsl(195 100% 60% / 0.35), inset 0 0 16px hsl(195 100% 60% / 0.06)",
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

const HeroSection = ({ onExploreGames }: HeroSectionProps) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <section className="relative flex min-h-[82dvh] flex-col items-center justify-start overflow-hidden pt-28 sm:pt-32 md:min-h-[90dvh] md:justify-end md:pb-24 md:pt-12">
        {/* Video */}
        <div className="absolute inset-0">
          <AutoPlayVideo
            src="/videos/SC_1-3.mp4"
            loop
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center center" }}
          />
          <motion.div
            className="hero-hologram-flicker absolute inset-0 mix-blend-overlay"
            animate={reduceMotion ? undefined : { opacity: [0.04, 0.12, 0.06, 0.14, 0.04] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, hsl(195 100% 70% / 0.15) 48%, transparent 62%)",
            }}
          />
        </div>

        <HeroMotionLayer />

        {/* Overlays */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-background/70 via-background/20 to-background/90 md:hidden" />
        <motion.div
          className="absolute inset-0 z-[2] hidden bg-gradient-to-b from-background/15 via-background/5 to-background/88 md:block"
          animate={reduceMotion ? undefined : { opacity: [0.92, 1, 0.94, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background/45 via-transparent to-background/45" />

        {/* Breathing ambient glows */}
        <motion.div
          className="pointer-events-none absolute top-40 left-1/4 z-[2] h-[400px] w-[500px] rounded-full bg-neon-cyan/6 blur-[150px]"
          animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-1/4 bottom-20 z-[2] h-[300px] w-[400px] rounded-full bg-primary/8 blur-[120px]"
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="pointer-events-none absolute top-1/2 right-0 z-[2] h-[300px] w-[300px] rounded-full bg-neon-purple/5 blur-[120px]"
          animate={reduceMotion ? undefined : { x: [0, -20, 0], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Content */}
        <div className="relative z-10 flex w-full -translate-y-0 flex-col items-center md:-translate-y-10">
          <motion.div
            className="mb-6 px-4 text-center md:mb-8"
            initial="hidden"
            animate="show"
          >
            <motion.div
              className="mb-5 flex items-center justify-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.5 }}
            >
              <motion.div
                className="h-px w-10 rounded-full bg-gradient-to-r from-transparent to-neon-cyan/60"
                animate={reduceMotion ? undefined : { scaleX: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono font-medium uppercase tracking-[0.42em] text-neon-purple drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                Next Generation
              </span>
              <motion.div
                className="h-px w-10 rounded-full bg-gradient-to-l from-transparent to-neon-cyan/60"
                animate={reduceMotion ? undefined : { scaleX: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            <h1
              className="font-black uppercase leading-[0.95] tracking-tight"
              style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}
            >
              <span className="block font-display text-3xl tracking-[0.04em] text-foreground sm:text-4xl md:text-6xl lg:text-7xl xl:text-7xl">
                {line1Words.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={i}
                    variants={wordStagger}
                    className="mr-[0.26em] inline-block last:mr-0"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>

              <motion.span
                className="hero-gradient-title relative mt-1 block font-display text-3xl sm:text-4xl md:mt-2 md:text-6xl lg:text-7xl xl:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.65 }}
              >
                {line2Words.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={i + line1Words.length}
                    variants={wordStagger}
                    className="mr-[0.26em] inline-block last:mr-0"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </h1>

            <motion.div
              className="mx-auto mt-5 h-[2px] w-20 rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(195 100% 60%), hsl(195 60% 80%), transparent)",
                boxShadow: "0 0 14px hsl(195 100% 60% / 0.55)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            />
          </motion.div>

          <motion.div
            className="mt-6 flex flex-col items-center justify-center gap-4 px-4 sm:flex-row md:mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
          >
            <HeroGlowButton onClick={onExploreGames} variant="outline">
              EXPLORE GAMES
            </HeroGlowButton>
            <HeroGlowButton onClick={() => navigate("/moments")} variant="primary" className="min-w-[250px]">
              Moments
            </HeroGlowButton>
          </motion.div>
        </div>

        {/* <HeroArenaTicker /> */}
      </section>

      {/* Live stats — animated strip */}
      <div className="relative z-10 overflow-hidden border-b border-border/30 bg-card/95">
        <motion.div
          className="pointer-events-none absolute inset-y-0 z-10 w-32 bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent"
          animate={reduceMotion ? undefined : { x: ["-128px", "calc(100vw + 128px)"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 divide-x divide-border/20 md:grid-cols-4">
            {liveStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-neon-cyan/[0.04] md:px-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.45 }}
                whileHover={reduceMotion ? undefined : { backgroundColor: "hsl(195 100% 60% / 0.06)" }}
              >
                <motion.div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    stat.accent
                      ? "bg-neon-cyan/15 text-neon-cyan"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-neon-cyan/10 group-hover:text-neon-cyan"
                  }`}
                  whileHover={reduceMotion ? undefined : { scale: 1.08, boxShadow: "0 0 18px hsl(195 100% 60% / 0.25)" }}
                >
                  <stat.icon className="h-4 w-4" />
                </motion.div>
                <div>
                  <p className="text-[10px] font-mono tracking-wider text-muted-foreground">{stat.label}</p>
                  <p
                    className={`font-display text-sm font-bold tracking-wide ${
                      stat.accent ? "text-glow-cyan text-neon-cyan" : "text-foreground"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
                {stat.accent ? (
                  <motion.div
                    className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neon-green"
                    style={{ boxShadow: "0 0 6px hsl(150 100% 50%)" }}
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
