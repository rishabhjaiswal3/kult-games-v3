import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Swords, Flame, Users, Gamepad2, Trophy, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import AIDataStream from "@/components/AIDataStream";
import AIScanLine from "@/components/AIScanLine";
import GlitchText from "@/components/GlitchText";
import AITypingText from "@/components/AITypingText";
import NeuralPulse from "@/components/NeuralPulse";

const liveStats = [
  { icon: Users, label: "PLAYERS ONLINE", value: "12,847", accent: true },
  { icon: Gamepad2, label: "GAMES PLAYED", value: "1.2M+" },
  { icon: Trophy, label: "PRIZES WON", value: "420 ETH" },
  { icon: Flame, label: "TRENDING", value: "Zero Dash" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <>
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        {/* Full-screen cinematic video with parallax */}
        <motion.div className="absolute inset-0" style={{ scale: videoScale }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center center" }}
          >
            <source src="/videos/SC_1-3.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/40" />

        {/* AI Effects */}
        <AIDataStream />
        <AIScanLine />
        <NeuralPulse />
        <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-30" />

        {/* Ambient glows */}
        <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/6 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-[120px] pointer-events-none" />

        {/* Main content with parallax */}
        <motion.div
          className="container mx-auto px-4 md:px-6 relative z-10"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="text-center max-w-4xl mx-auto">
            {/* AI status indicator */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-neon-cyan"
                animate={{
                  opacity: [1, 0.3, 1],
                  boxShadow: [
                    "0 0 4px hsl(195 100% 60%)",
                    "0 0 15px hsl(195 100% 60%)",
                    "0 0 4px hsl(195 100% 60%)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono text-neon-cyan/70 tracking-[0.3em] uppercase">
                <AITypingText
                  texts={[
                    "NEURAL NETWORK ACTIVE",
                    "BLOCKCHAIN SYNCED",
                    "AI MODELS LOADED",
                    "READY TO PLAY",
                  ]}
                  className="text-neon-cyan/70"
                />
              </span>
            </motion.div>

            {/* Main heading - massive & cinematic */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-[0.95]"
                style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}
              >
                <span className="text-foreground block font-display tracking-[0.04em]">
                  THE FUTURE OF
                </span>
                <GlitchText className="gradient-text glow-text block mt-2 md:mt-3 font-display">
                  ON-CHAIN GAMING
                </GlitchText>
              </h1>
              <p className="mt-5 md:mt-6 text-base md:text-xl text-muted-foreground font-body font-medium max-w-xl mx-auto leading-relaxed">
                Play. Compete. Earn. The next generation of decentralized gaming
                starts here.
              </p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <button
                onClick={() => navigate("/store")}
                className="px-10 py-4 rounded-lg font-display text-sm font-semibold tracking-wider border border-neon-cyan/30 text-foreground hover:bg-neon-cyan/10 hover:border-neon-cyan/50 hover:shadow-[0_0_30px_hsl(195_100%_60%/0.2)] transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                EXPLORE MORE
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/events")}
                className="px-10 py-4 rounded-lg font-display text-sm font-semibold tracking-wider bg-neon-cyan text-background hover:shadow-[0_0_40px_hsl(195_100%_60%/0.5)] transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <Swords className="w-4 h-4 relative z-10" />
                <span className="relative z-10">STAKE & BATTLE</span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[9px] font-mono text-neon-cyan/50 tracking-[0.3em]">SCROLL</span>
          <ChevronDown className="w-4 h-4 text-neon-cyan/50" />
        </motion.div>

        {/* Cinematic letterbox bars */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" style={{ boxShadow: "0 0 20px hsl(195 100% 60% / 0.3)" }} />
      </section>

      {/* Live Stats Strip */}
      <div className="relative z-10 border-y border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-neon-cyan/8 to-transparent z-10"
          animate={{ x: ["-128px", "calc(100vw + 128px)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20">
            {liveStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 py-4 px-4 md:px-6 group hover:bg-neon-cyan/3 transition-colors"
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
                      stat.accent
                        ? "text-neon-cyan text-glow-cyan"
                        : "text-foreground"
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
