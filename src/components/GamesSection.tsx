import { motion } from "framer-motion";
import GameCard from "./GameCard";

const games = [
  {
    title: "Guess the AI",
    description: "Challenge your mind. Beat the AI.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png",
    category: "PUZZLE",
    rating: 4.8,
    aiSummary: "Perfect for short brain-teaser sessions. Tests pattern recognition and critical thinking against evolving AI opponents.",
    sessionLength: "5-10 min",
    skillLevel: "Beginner",
  },
  {
    title: "Zero G Pool",
    description: "Your favourite 8-ball, now with a cosmic twist.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png",
    category: "SPORTS",
    rating: 4.8,
    aiSummary: "Best fit for competitive players who enjoy physics-based precision. Zero gravity mechanics add strategic depth to classic pool.",
    sessionLength: "10-15 min",
    skillLevel: "Intermediate",
  },
  {
    title: "Zero Dash",
    description: "Run. Escape. Don't look back.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png",
    category: "ACTION",
    rating: 4.8,
    aiSummary: "High-adrenaline endless runner with quick reflexes required. Great for fast sessions and leaderboard competition.",
    sessionLength: "3-5 min",
    skillLevel: "All levels",
  },
  {
    title: "Robo Wars",
    description: "Enter the arena where metal meets mayhem.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png",
    category: "FIGHTING",
    rating: 4.8,
    aiSummary: "Ideal for players who enjoy tactical combat and build strategy. Deeper learning curve with high replayability.",
    sessionLength: "10-20 min",
    skillLevel: "Intermediate",
  },
  {
    title: "Highway Hustle",
    description: "Fast lanes. Fierce rivals. Full throttle.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png",
    category: "RACING",
    rating: 4.8,
    aiSummary: "Lowest friction entry point — pick up and race immediately. Excellent for casual competition with friends.",
    sessionLength: "5-10 min",
    skillLevel: "Beginner",
  },
];

const GamesSection = () => {
  return (
    <section className="relative py-24 z-10">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono text-primary tracking-[0.2em] uppercase">
              AI-Ranked for you
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            0G <span className="gradient-text">GAME SHELF</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Every game ranked by AI based on play style, session length, and skill curve
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game, i) => (
            <GameCard key={game.title} {...game} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
