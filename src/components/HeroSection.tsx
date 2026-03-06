import { motion } from "framer-motion";
import { Bot, Gamepad2, Zap, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Neural grid overlay */}
      <div className="absolute inset-0 neural-grid animate-neural-flow opacity-30" />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel gradient-border mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Powered by 0G Chain • AI-Native Gaming
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
        >
          <span className="text-foreground">PLAY </span>
          <span className="gradient-text">SMARTER</span>
          <br />
          <span className="text-foreground">WITH </span>
          <span className="gradient-text">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The AI-native gateway to 0G games. Discover, compare, and play — 
          powered by decentralized intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button className="group px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(185_85%_55%/0.4)] transition-all duration-300 flex items-center gap-2">
            EXPLORE GAMES
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider glass-panel text-foreground hover:bg-muted/60 transition-all duration-300 gradient-border flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            ASK KULT AI
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center justify-center gap-8 md:gap-16"
        >
          {[
            { icon: Gamepad2, label: "GAMES", value: "5+" },
            { icon: Zap, label: "ON-CHAIN", value: "0G" },
            { icon: Bot, label: "AI MODELS", value: "GLM-5" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
