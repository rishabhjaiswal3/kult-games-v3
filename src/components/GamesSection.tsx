import { motion } from "framer-motion";
import { useState } from "react";
import GameCard from "./GameCard";
import { MessageCircle } from "lucide-react";
import mageMediate from "@/assets/mage-meditate.png";

const games = [
  {
    id: "guess-the-ai",
    title: "Guess The AI",
    description: "Challenge your mind. Beat the AI.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png",
    category: "PUZZLE",
    rating: 4.8,
    sessionLength: "5-10 min",
    skillLevel: "Beginner",
  },
  {
    id: "zero-g-pool",
    title: "Zero G Pool",
    description: "Your favourite 8-ball, now with a cosmic twist.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png",
    category: "SPORTS",
    rating: 4.8,
    sessionLength: "10-15 min",
    skillLevel: "Intermediate",
  },
  {
    id: "zero-dash",
    title: "Zero Dash",
    description: "Run. Escape. Don't look back.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png",
    category: "ACTION",
    rating: 4.8,
    sessionLength: "3-5 min",
    skillLevel: "All levels",
  },
  {
    id: "robo-wars",
    title: "Robo Wars",
    description: "Enter the arena where metal meets mayhem.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png",
    category: "FIGHTING",
    rating: 4.8,
    sessionLength: "10-20 min",
    skillLevel: "Intermediate",
  },
  {
    id: "highway-hustle",
    title: "Highway Hustle",
    description: "Fast lanes. Fierce rivals. Full throttle.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png",
    category: "RACING",
    rating: 4.8,
    sessionLength: "5-10 min",
    skillLevel: "Beginner",
  },
  {
    id: "warzone-warriors",
    title: "Warzone Warriors",
    description: "Epic battles in a decentralized warzone.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png",
    category: "BATTLE",
    rating: 4.9,
    sessionLength: "15-30 min",
    skillLevel: "Advanced",
  },
];

const allCategories = ["All Games", "Puzzle", "Sports", "Action", "Fighting", "Racing", "Battle"];

const recentPosts = [
  { icon: "telegram", text: "Fell in 0G. Entertainment Network!", date: "27.Feb.2025" },
  { icon: "discord", text: "Watching Finales, 0G Play Journal", date: "26.Feb.2025" },
  { icon: "x", text: "Getting Blazer Grand Lineup!!", date: "18.Feb.2025" },
];

const tags = ["Arcade Games", "Battle Arcade Action", "On MO", "AI Gaming", "WEB3", "Decentralized Gaming"];

const GamesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Games");

  const filtered = selectedCategory === "All Games"
    ? games
    : games.filter((g) => g.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section className="relative py-20 z-10">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs font-mono text-primary tracking-[0.2em] uppercase mb-2 block">
            ★ Games Hub
          </span>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Play Matches To Rise On The Leaderboard
            </h2>
            <button className="hidden md:flex px-5 py-2 rounded-lg font-display text-xs font-semibold tracking-wider border border-primary/30 text-primary hover:bg-primary/10 transition-all">
              0G GAMES →
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-64 flex-shrink-0 space-y-6"
          >
            {/* Categories */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-display text-sm font-bold text-foreground tracking-wider mb-4">Categories</h3>
              <div className="space-y-3">
                {allCategories.map((cat) => (
                  <label
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className={`text-sm transition-colors ${selectedCategory === cat ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {cat}
                    </span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat ? "border-primary bg-primary/20" : "border-border/50 group-hover:border-primary/50"}`}>
                      {selectedCategory === cat && <div className="w-2 h-2 rounded-sm bg-primary" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-display text-sm font-bold text-foreground tracking-wider mb-4">Recent Post</h3>
              <div className="space-y-4">
                {recentPosts.map((post, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      post.icon === "telegram" ? "bg-[hsl(200,80%,50%)]/20" : 
                      post.icon === "discord" ? "bg-[hsl(235,86%,65%)]/20" : "bg-foreground/10"
                    }`}>
                      <MessageCircle className="w-3.5 h-3.5 text-foreground/70" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/80 leading-snug">{post.text}</p>
                      <span className="text-[10px] text-muted-foreground">{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-display text-sm font-bold text-foreground tracking-wider mb-4">Popular Tag</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-[11px] text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-primary cursor-pointer transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Game grid + mage */}
          <div className="flex-1 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((game, i) => (
                <GameCard key={game.id} {...game} index={i} />
              ))}
            </div>

            {/* Mage character - large, fading into section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="hidden xl:block absolute -bottom-20 -right-16 w-[350px] h-[500px] overflow-hidden pointer-events-none"
              style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)' }}
            >
              <img
                src={mageMediate}
                alt="Mage"
                className="w-full h-auto animate-float drop-shadow-[0_0_60px_hsl(270_70%_55%/0.4)]"
              />
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-primary/15 blur-[80px]" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
