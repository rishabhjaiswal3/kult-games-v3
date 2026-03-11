import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GameCard from "./GameCard";
import { Zap, ChevronRight } from "lucide-react";
import AIScanLine from "@/components/AIScanLine";
import mageVictory from "@/assets/mage-victory.png";

const games = [
  { id: "guess-the-ai", title: "Guess The AI", description: "Challenge your mind. Beat the AI.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png", category: "ACTION", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner" },
  { id: "zero-g-pool", title: "Zero G Pool", description: "Your favourite 8-ball, now with a cosmic twist.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png", category: "SPORTS", rating: 4.8, sessionLength: "10-15 min", skillLevel: "Intermediate" },
  { id: "zero-dash", title: "Zero Dash", description: "Run. Escape. Don't look back.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png", category: "ACTION", rating: 4.8, sessionLength: "3-5 min", skillLevel: "All levels" },
  { id: "robo-wars", title: "Robo Wars", description: "Enter the arena where metal meets mayhem.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png", category: "FIGHTING", rating: 4.8, sessionLength: "10-20 min", skillLevel: "Intermediate" },
  { id: "highway-hustle", title: "Highway Hustle", description: "Fast lanes. Fierce rivals. Full throttle.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png", category: "RACING", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner" },
];

const GamesSection = () => {
  return (
    <section className="relative py-16 md:py-24 z-10 overflow-hidden">
      {/* Background video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.12]">
        <source src="/videos/SC_2-3.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/80" />

      <AIScanLine />

      {/* Ambient glows */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header - matching reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                className="w-2 h-2 rounded-full bg-neon-cyan"
                animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">
                A CURATED GAMES COLLECTION
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              We Believe In Quality Over{" "}
              <span className="gradient-text glow-text">Quantity</span>
            </h2>
          </div>

          {/* Mage character accent - floating on the right */}
          <div className="hidden lg:block relative w-32 h-32 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-neon-purple/10 blur-[30px]" />
            <img
              src={mageVictory}
              alt="AI Mage"
              className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_20px_hsl(270_80%_60%/0.3)]"
            />
          </div>
        </motion.div>

        {/* Horizontal scrolling game cards - matching reference layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="flex-shrink-0 w-[260px] md:w-[280px] snap-start"
              >
                <GameCard {...game} index={i} />
              </motion.div>
            ))}
          </div>

          {/* Fade edges for scroll indication */}
          <div className="absolute top-0 right-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={() => window.location.href = "/store"}
            className="px-8 py-3 rounded-lg font-display text-xs font-semibold tracking-wider bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-background hover:shadow-[0_0_20px_hsl(195_100%_60%/0.3)] transition-all duration-300 flex items-center gap-2"
          >
            VIEW ALL GAMES
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GamesSection;
