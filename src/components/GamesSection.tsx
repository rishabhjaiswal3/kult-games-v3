import { motion } from "framer-motion";
import { useState } from "react";
import GameCard from "./GameCard";
import { Flame, TrendingUp, Zap } from "lucide-react";
import AIScanLine from "@/components/AIScanLine";

const games = [
  { id: "zero-g-pool", title: "Zero G Pool", description: "Your favourite 8-ball, now with a cosmic twist.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png", category: "SPORTS", rating: 4.8, sessionLength: "10-15 min", skillLevel: "Intermediate" },
  { id: "zero-dash", title: "Zero Dash", description: "Run. Escape. Don't look back.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png", category: "ACTION", rating: 4.8, sessionLength: "3-5 min", skillLevel: "All levels" },
  { id: "robo-wars", title: "Robo Wars", description: "Enter the arena where metal meets mayhem.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png", category: "FIGHTING", rating: 4.8, sessionLength: "10-20 min", skillLevel: "Intermediate" },
  { id: "highway-hustle", title: "Highway Hustle", description: "Fast lanes. Fierce rivals. Full throttle.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png", category: "RACING", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner" },
  { id: "warzone-warriors", title: "Warzone Warriors", description: "Epic battles in a decentralized warzone.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png", category: "BATTLE", rating: 4.9, sessionLength: "15-30 min", skillLevel: "Advanced" },
];

const allCategories = ["All Games", "Sports", "Action", "Fighting", "Racing", "Battle"];

const GamesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Games");

  const filtered = selectedCategory === "All Games"
    ? games
    : games.filter((g) => g.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section className="relative py-20 z-10">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none" />
      <AIScanLine />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-primary tracking-[0.2em] uppercase">
              ★ Games Hub
            </span>
            <div className="h-[1px] flex-1 max-w-[80px] bg-gradient-to-r from-primary/50 to-transparent" />
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Play Matches To Rise On The <span className="gradient-text">Leaderboard</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm max-w-lg">
                Choose your game, dominate the competition, and earn on-chain rewards.
              </p>
            </div>
            <button className="hidden md:flex px-5 py-2.5 rounded-lg font-display text-xs font-semibold tracking-wider bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              VIEW ALL GAMES
            </button>
          </div>
        </motion.div>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none"
        >
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-display font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(269_62%_52%/0.3)]"
                  : "glass-panel text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Featured highlight card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 ornate-border rounded-2xl overflow-hidden relative group cursor-pointer"
          onClick={() => window.location.href = "/game/zero-dash"}
        >
          <div className="absolute inset-0">
            <img
              src="https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png"
              alt="Featured"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
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
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-green-500 font-semibold">+32% this week</span>
                </div>
                <span className="text-xs text-muted-foreground">3-5 min sessions</span>
              </div>
            </div>
            <button className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(269_62%_52%/0.4)] transition-all flex items-center gap-2 relative overflow-hidden flex-shrink-0">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">PLAY NOW</span>
            </button>
          </div>
        </motion.div>

        {/* Game grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((game, i) => (
            <GameCard key={game.id} {...game} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
