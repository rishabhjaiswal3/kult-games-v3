import { motion } from "framer-motion";
import { ArrowRight, Swords } from "lucide-react";
import mageCharacter from "@/assets/mage-character.png";

const HeroSection = () => {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/videos/SC_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70" />

        {/* Purple nebula glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left content */}
            <div className="text-center lg:text-left max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.95]"
              >
                <span className="text-foreground">SHAPING THE</span>
                <br />
                <span className="text-foreground">FUTURE OF</span>
                <br />
                <span className="gradient-text glow-text">ON-CHAIN</span>
                <br />
                <span className="gradient-text glow-text">GAMING</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mt-8"
              >
                <button className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider border border-foreground/30 text-foreground hover:bg-foreground/10 transition-all duration-300 flex items-center gap-2">
                  EXPLORE MORE
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(270_70%_55%/0.4)] transition-all duration-300 flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  STAKE & BATTLE
                </button>
              </motion.div>
            </div>

            {/* Right - Mage character */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full" />
              <img
                src={mageCharacter}
                alt="Kult Mage"
                className="relative w-[300px] md:w-[400px] lg:w-[500px] animate-float drop-shadow-[0_0_40px_hsl(270_70%_55%/0.3)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee banner */}
      <div className="relative z-10 py-4 border-y border-border/30 bg-muted/30 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mr-8">
              {["AAA QUALITY", "ACTION-PACKED", "MIND-BENDING", "COLLECTION 0G GAMES", "AAA QUALITY", "ACTION-PACKED", "MIND-BENDING", "COLLECTION 0G GAMES"].map((text, j) => (
                <div key={j} className="flex items-center gap-8">
                  <span className="text-primary text-lg">✕</span>
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
