import { motion } from "framer-motion";
import { ArrowRight, Swords, Flame, Users, Gamepad2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MageCharacter from "@/components/MageCharacter";
import mageCharacter from "@/assets/mage-character.png";
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

  return (
    <>
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-16 pb-6 md:pt-20 md:pb-8 overflow-hidden">
        {/* Background video — matched to leaderboard opacity */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
          style={{ objectPosition: 'center center' }}
        >
          <source src="/videos/SC_12-4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/80" />

        {/* AI Effects Layer */}
        <AIDataStream />
        <AIScanLine />
        <NeuralPulse />

        {/* AI Grid overlay */}
        <div className="absolute inset-0 ai-grid-overlay pointer-events-none" />

        {/* Ambient glows — matched to leaderboard */}
        <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full bg-neon-purple/3 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-0 lg:gap-0">
            {/* Left content */}
            <div className="text-center lg:text-left max-w-2xl">
              {/* AI status indicator */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 mb-6"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-neon-cyan"
                  animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
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

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-6"
              >
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]" style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}>
                  <span className="text-foreground block font-display tracking-[0.04em]">THE FUTURE OF</span>
                  <GlitchText className="gradient-text glow-text block mt-1 md:mt-2 font-display">ON-CHAIN GAMING</GlitchText>
                </h1>
                <p className="mt-3 md:mt-4 text-base md:text-xl text-muted-foreground font-body font-medium max-w-lg leading-relaxed">
                  Play. Compete. Earn. The next generation of decentralized gaming starts here.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col sm:flex-row items-center lg:items-start gap-3 md:gap-4 mt-6 md:mt-8"
              >
                <button
                  onClick={() => navigate("/store")}
                  className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider border border-neon-cyan/30 text-foreground hover:bg-neon-cyan/10 hover:border-neon-cyan/50 hover:shadow-[0_0_20px_hsl(195_100%_60%/0.15)] transition-all duration-300 flex items-center gap-2"
                >
                  EXPLORE MORE
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/events")}
                  className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider bg-neon-cyan text-background hover:shadow-[0_0_30px_hsl(195_100%_60%/0.4)] transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <Swords className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">STAKE & BATTLE</span>
                </button>
              </motion.div>
            </div>

            {/* Right - Mage character */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden md:block relative w-[320px] md:w-[420px] lg:w-[500px] self-center -mr-8 lg:-mr-16 md:mt-8 lg:-mt-12 max-h-[75vh] overflow-hidden"
            >
              <MageCharacter src={mageCharacter} alt="Kult Mage" showMask={false} animate />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats Strip — matched to leaderboard table style */}
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
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  stat.accent ? "bg-neon-cyan/15 text-neon-cyan" : "bg-muted/50 text-muted-foreground group-hover:text-neon-cyan group-hover:bg-neon-cyan/10"
                }`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider">{stat.label}</p>
                  <p className={`font-display text-sm font-bold tracking-wide ${stat.accent ? "text-neon-cyan text-glow-cyan" : "text-foreground"}`}>
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
