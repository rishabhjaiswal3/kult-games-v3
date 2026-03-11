import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GameCard from "./GameCard";
import { Flame, TrendingUp, Zap, Sparkles, ChevronRight } from "lucide-react";
import AIScanLine from "@/components/AIScanLine";

const games = [
  { id: "zero-g-pool", title: "Zero G Pool", description: "Your favourite 8-ball, now with a cosmic twist.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png", category: "SPORTS", rating: 4.8, sessionLength: "10-15 min", skillLevel: "Intermediate" },
  { id: "zero-dash", title: "Zero Dash", description: "Run. Escape. Don't look back.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png", category: "ACTION", rating: 4.8, sessionLength: "3-5 min", skillLevel: "All levels" },
  { id: "robo-wars", title: "Robo Wars", description: "Enter the arena where metal meets mayhem.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png", category: "FIGHTING", rating: 4.8, sessionLength: "10-20 min", skillLevel: "Intermediate" },
  { id: "highway-hustle", title: "Highway Hustle", description: "Fast lanes. Fierce rivals. Full throttle.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png", category: "RACING", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner" },
  { id: "guess-the-ai", title: "Guess The AI", description: "Challenge your mind. Beat the AI.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png", category: "ACTION", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner" },
];

const allCategories = ["All Games", "Sports", "Action", "Fighting", "Racing"];

const GamesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Games");

  const filtered = selectedCategory === "All Games"
    ? games
    : games.filter((g) => g.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section className="relative py-20 z-10 overflow-hidden">
      {/* Background video like leaderboard */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.08]">
        <source src="/videos/SC_12-4.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/85" />

      <AIScanLine />

      {/* Ambient glows — leaderboard style */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-neon-purple/3 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header — leaderboard style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              className="w-2 h-2 rounded-full bg-neon-cyan"
              animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">
              <Zap className="w-3 h-3 inline mr-1" /> Games Hub
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                Play Matches To Rise On The <span className="gradient-text glow-text">Leaderboard</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg text-sm">
                Choose your game, dominate the competition, and earn on-chain rewards.
              </p>
            </div>
            <button className="hidden md:flex px-5 py-2.5 rounded-lg font-display text-xs font-semibold tracking-wider bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-background hover:shadow-[0_0_20px_hsl(195_100%_60%/0.3)] transition-all duration-300 items-center gap-2">
              VIEW ALL GAMES
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Category filter pills — leaderboard style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none"
        >
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-display font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-neon-cyan text-background shadow-[0_0_15px_hsl(195_100%_60%/0.3)]"
                  : "glass-panel text-muted-foreground hover:text-foreground hover:border-neon-cyan/30"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Featured highlight card — leaderboard podium style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-10 rounded-xl overflow-hidden relative group cursor-pointer border border-neon-cyan/20 bg-card/50 backdrop-blur-sm hover:border-neon-cyan/40 transition-all duration-300"
          onClick={() => window.location.href = "/game/zero-dash"}
        >
          <div className="absolute inset-0">
            <img
              src="https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png"
              alt="Featured"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/50" />
          </div>

          {/* Neon scan line — leaderboard style */}
          <motion.div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute left-0 right-0 h-[1px]"
              style={{ background: "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.4), transparent)" }}
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-[hsl(var(--gold))]" />
                <span className="text-xs font-display font-bold text-[hsl(var(--gold))] tracking-wider">FEATURED GAME</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-black text-foreground tracking-tight">
                ZERO DASH
              </h3>
              <p className="text-muted-foreground mt-2 text-sm max-w-md">
                Run. Escape. Don't look back. The most played game on the platform this week.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="text-xs text-neon-cyan font-semibold text-glow-cyan">+32% this week</span>
                </div>
                <span className="text-xs text-muted-foreground">3-5 min sessions</span>
              </div>
            </div>
            <button className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider bg-neon-cyan text-background hover:shadow-[0_0_30px_hsl(195_100%_60%/0.4)] transition-all duration-300 flex items-center gap-2 relative overflow-hidden flex-shrink-0">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">PLAY NOW</span>
            </button>
          </div>
        </motion.div>

        {/* Game grid — staggered like leaderboard rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((game, i) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
              >
                <GameCard {...game} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
