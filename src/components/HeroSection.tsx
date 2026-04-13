import { motion } from "framer-motion";
import { Swords, Flame, Users, Gamepad2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AutoPlayVideo from "@/components/AutoPlayVideo";

const liveStats = [
  { icon: Users, label: "PLAYERS ONLINE", value: "12,847", accent: true },
  { icon: Gamepad2, label: "GAMES PLAYED", value: "1.2M+" },
  { icon: Trophy, label: "PRIZES WON", value: "420 ETH" },
  { icon: Flame, label: "TRENDING", value: "Zero Dash" },
];

const marqueeItems = [
  "AAA QUALITY",
  "ACTION - PACKED",
  "MIND - BENDING",
  "COLLECTION OF GAMES",
  "ON-CHAIN REWARDS",
  "AI POWERED",
];

const particles = [
  { left: "8%",  top: "22%", size: 2,   delay: 0,    dur: 4.2 },
  { left: "85%", top: "16%", size: 1.5, delay: 0.8,  dur: 5.5 },
  { left: "22%", top: "68%", size: 2.5, delay: 1.2,  dur: 3.8 },
  { left: "72%", top: "62%", size: 1,   delay: 0.3,  dur: 6.0 },
  { left: "48%", top: "28%", size: 2,   delay: 1.8,  dur: 4.6 },
  { left: "92%", top: "45%", size: 1.5, delay: 0.6,  dur: 5.2 },
  { left: "5%",  top: "52%", size: 1,   delay: 1.4,  dur: 4.0 },
  { left: "58%", top: "78%", size: 2,   delay: 2.0,  dur: 3.6 },
  { left: "38%", top: "42%", size: 1,   delay: 0.5,  dur: 7.0 },
  { left: "65%", top: "85%", size: 1.5, delay: 1.7,  dur: 4.8 },
];

const line1Words = ["SHAPING", "THE", "FUTURE", "OF"];
const line2Words = ["ON-CHAIN", "GAMING"];

interface HeroSectionProps {
  onExploreGames: () => void;
}

const HeroSection = ({ onExploreGames }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <>
      <section
        className="relative min-h-[82dvh] md:min-h-[90dvh] flex flex-col items-center justify-start md:justify-end overflow-hidden pt-28 sm:pt-32 md:pt-12 md:pb-24"
      >
        <div className="absolute inset-0">
          <AutoPlayVideo src="/videos/SC_1-3.mp4" loop className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center center" }} />
        </div>

        {/* Mobile overlay: dark at top for text readability */}
        <div className="absolute inset-0 md:hidden bg-gradient-to-b from-background/70 via-background/20 to-background/90" />

        {/* Desktop overlay: transparent at top (show character eyes), dark at bottom for text */}
        <div className="absolute inset-0 hidden md:block bg-gradient-to-b from-background/15 via-background/5 to-background/88" />

        {/* Side vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/45 via-transparent to-background/45" />

        {/* Ambient glows */}
        <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/6 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-[120px] pointer-events-none" />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-neon-cyan pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              boxShadow: `0 0 ${p.size * 4}px hsl(195 100% 60% / 0.8)`,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.25, 0.75, 0.25],
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="w-full relative z-10 flex flex-col items-center md:-translate-y-10">
          {/* Heading */}
          <div className="text-center mb-6 md:mb-8 px-4">
            {/* Pre-heading label */}
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="h-[1px] w-10 rounded-full bg-gradient-to-r from-transparent to-neon-cyan/60" />
              <span className="text-[9px] font-mono uppercase tracking-[0.45em] text-neon-cyan/65">Next Generation</span>
              <div className="h-[1px] w-10 rounded-full bg-gradient-to-l from-transparent to-neon-cyan/60" />
            </div>

            <h1
              className="font-black tracking-tight leading-[0.95] uppercase"
              style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}
            >
              {/* Line 1 — word stagger */}
              <span className="block font-display text-3xl tracking-[0.04em] text-foreground sm:text-4xl md:text-6xl lg:text-7xl xl:text-7xl">
                {line1Words.map((word) => (
                  <span key={word} className="mr-[0.26em] inline-block last:mr-0">
                    {word}
                  </span>
                ))}
              </span>

              {/* Line 2 — gradient + stagger */}
              <span
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-7xl block mt-1 md:mt-2 font-display"
                style={{
                  color: "hsl(278 100% 80%)",
                  textShadow: "0 0 18px hsl(270 82% 58% / 0.75), 0 0 42px hsl(270 82% 58% / 0.4), 0 0 72px hsl(278 100% 70% / 0.22)",
                }}
              >
                {line2Words.map((word) => (
                  <span key={word} className="mr-[0.26em] inline-block last:mr-0">
                    {word}
                  </span>
                ))}
              </span>
            </h1>

            {/* Decorative accent line */}
            <div
              className="mx-auto mt-5 h-[2px] w-20 rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(195 100% 60%), hsl(195 60% 80%), transparent)",
                boxShadow: "0 0 14px hsl(195 100% 60% / 0.55)",
              }}
            />
          </div>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-col items-center justify-center gap-4 px-4 sm:flex-row md:mt-8">
            <button
              onClick={onExploreGames}
              className="px-10 py-4 rounded-lg font-display text-sm font-semibold tracking-wider btn-eye-outline"
            >
              EXPLORE GAMES
            </button>
            <button
              onClick={() => navigate("/events")}
              className="px-10 py-4 rounded-lg font-display text-sm font-semibold tracking-wider btn-eye flex items-center gap-2 relative overflow-hidden"
            >
              <Swords className="w-4 h-4 relative z-10" />
              <span className="relative z-10">STAKE & BATTLE</span>
            </button>
          </div>
        </div>

        {/* Bottom neon line */}
        <div
          className="absolute bottom-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"
          style={{ boxShadow: "0 0 20px hsl(195 100% 60% / 0.3)" }}
        />
      </section>

      {/* Marquee strip */}
      <div className="relative z-10 border-y border-neon-cyan/20 bg-card overflow-hidden py-4">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 z-10 pointer-events-none" />
        <motion.div
          className="flex items-center gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="text-neon-cyan text-lg">✦</span>
              <span className="font-display text-sm md:text-base font-bold text-foreground tracking-[0.15em] uppercase">
                {item}
              </span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Live Stats Strip */}
      <div className="relative z-10 border-b border-border/30 bg-card/95 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-neon-cyan/8 to-transparent z-10"
          animate={{ x: ["-128px", "calc(100vw + 128px)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20">
            {liveStats.map((stat) => (
              <div
                key={stat.label}
                className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-neon-cyan/3 md:px-6"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    stat.accent
                      ? "bg-neon-cyan/15 text-neon-cyan"
                      : "bg-muted/50 text-muted-foreground group-hover:text-neon-cyan group-hover:bg-neon-cyan/10"
                  }`}
                >
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
                    {stat.label}
                  </p>
                  <p
                    className={`font-display text-sm font-bold tracking-wide ${
                      stat.accent ? "text-neon-cyan text-glow-cyan" : "text-foreground"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
                {stat.accent && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-neon-green ml-auto flex-shrink-0"
                    style={{ boxShadow: "0 0 6px hsl(150 100% 50%)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
