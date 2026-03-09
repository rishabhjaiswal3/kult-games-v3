import { motion } from "framer-motion";
import { ArrowRight, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MageCharacter from "@/components/MageCharacter";
import mageCharacter from "@/assets/mage-character.png";
import AIDataStream from "@/components/AIDataStream";
import AIScanLine from "@/components/AIScanLine";
import GlitchText from "@/components/GlitchText";
import AITypingText from "@/components/AITypingText";
import NeuralPulse from "@/components/NeuralPulse";


const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background video */}
        <video autoPlay loop muted playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="/videos/SC_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/50" />

        {/* AI Effects Layer */}
        <AIDataStream />
        <AIScanLine />
        <NeuralPulse />
        

        {/* AI Grid overlay */}
        <div className="absolute inset-0 ai-grid-overlay pointer-events-none" />

        {/* Purple nebula glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
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
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(272 85% 58%)", "0 0 12px hsl(272 85% 58%)", "0 0 4px hsl(272 85% 58%)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-mono text-primary/70 tracking-[0.3em] uppercase">
                  <AITypingText
                    texts={[
                      "NEURAL NETWORK ACTIVE",
                      "BLOCKCHAIN SYNCED",
                      "AI MODELS LOADED",
                      "READY TO PLAY",
                    ]}
                    className="text-primary/70"
                  />
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-6"
              >
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                  <span className="text-foreground block">THE FUTURE OF</span>
                  <GlitchText className="gradient-text glow-text block mt-2">ON-CHAIN GAMING</GlitchText>
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground font-body font-medium max-w-lg leading-relaxed">
                  Play. Compete. Earn. The next generation of decentralized gaming starts here.
                </p>
              </motion.div>

              {/* AI processing bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="h-[1px] flex-1 max-w-[200px] bg-border/30 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground tracking-wider">v3.0.26 // AI-POWERED</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mt-8"
              >
                <button
                  onClick={() => navigate("/store")}
                  className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider border border-foreground/30 text-foreground hover:bg-foreground/10 transition-all duration-300 flex items-center gap-2 ai-border-glow"
                >
                  EXPLORE MORE
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/events")}
                  className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(272_85%_58%/0.4)] transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block relative w-[350px] md:w-[450px] lg:w-[550px]"
            >
              <MageCharacter src={mageCharacter} alt="Kult Mage" showMask={false} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee banner with AI flair */}
      <div className="relative z-10 py-4 border-y border-border/30 bg-muted/30 overflow-hidden">
        {/* Scanning shimmer on marquee */}
        <motion.div
          className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary/5 to-transparent z-10"
          animate={{ x: ["-128px", "calc(100vw + 128px)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mr-8">
              {["AAA QUALITY", "AI-POWERED", "ON-CHAIN", "NEURAL GAMING", "AAA QUALITY", "AI-POWERED", "ON-CHAIN", "NEURAL GAMING"].map((text, j) => (
                <div key={j} className="flex items-center gap-8">
                  <motion.span
                    className="text-primary text-lg"
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: j * 0.3 }}
                  >
                    ◆
                  </motion.span>
                  <span className="font-display text-sm md:text-base font-bold tracking-widest text-foreground uppercase">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroSection;
