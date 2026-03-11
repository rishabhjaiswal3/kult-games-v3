import { motion } from "framer-motion";
import { ArrowLeft, Play, Star, Clock, Users, Trophy, Share2, Zap, Shield, Gamepad2, ExternalLink } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIScanLine from "@/components/AIScanLine";

interface GameData {
  title: string;
  description: string;
  longDescription: string;
  image: string;
  category: string;
  rating: number;
  sessionLength: string;
  skillLevel: string;
  players: string;
  features: string[];
  platform: string[];
  chain: string;
  playUrl?: string;
}

const gameData: Record<string, GameData> = {
  "guess-the-ai": {
    title: "Guess The AI",
    description: "Challenge your mind. Beat the AI.",
    longDescription: "Test your wits against advanced AI opponents in this mind-bending game. Can you distinguish between human and AI-generated content? Rise through the ranks and prove your cognitive superiority on the blockchain.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png",
    category: "ACTION",
    rating: 4.8,
    sessionLength: "5-10 min",
    skillLevel: "Beginner",
    players: "1-4 Players",
    features: ["AI-Powered Opponents", "On-Chain Rewards", "Daily Challenges", "Global Leaderboard"],
    platform: ["Web", "Mobile"],
    chain: "0G Chain",
    playUrl: "https://guesstheai.xyz/",
  },
  "zero-g-pool": {
    title: "Zero G Pool",
    description: "Your favourite 8-ball, now with a cosmic twist.",
    longDescription: "Experience billiards like never before in zero gravity. Physics-defying trick shots, cosmic arenas, and multiplayer tournaments make this the ultimate pool experience on the blockchain.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png",
    category: "SPORTS",
    rating: 4.8,
    sessionLength: "10-15 min",
    skillLevel: "Intermediate",
    players: "1-2 Players",
    features: ["Zero Gravity Physics", "Multiplayer Matches", "Custom Tables", "NFT Cues"],
    platform: ["Web", "Mobile"],
    chain: "0G Chain",
    playUrl: "https://zerogpool.xyz/",
  },
  "zero-dash": {
    title: "Zero Dash",
    description: "Run. Escape. Don't look back.",
    longDescription: "An adrenaline-pumping endless runner set in a cyberpunk dystopia. Dodge obstacles, collect power-ups, and compete for the highest score on the global leaderboard.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png",
    category: "ACTION",
    rating: 4.8,
    sessionLength: "3-5 min",
    skillLevel: "All levels",
    players: "1 Player",
    features: ["Endless Runner", "Power-ups", "Daily Rewards", "Season Rankings"],
    platform: ["Web", "Mobile"],
    chain: "0G Chain",
    playUrl: "https://zerodashgame.xyz/",
  },
  "robo-wars": {
    title: "Robo Wars",
    description: "Enter the arena where metal meets mayhem.",
    longDescription: "Build, customize, and battle your robots in intense PvP combat. Earn parts, upgrade your machines, and dominate the arena in this on-chain fighting game.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png",
    category: "FIGHTING",
    rating: 4.8,
    sessionLength: "10-20 min",
    skillLevel: "Intermediate",
    players: "1-2 Players",
    features: ["Robot Customization", "PvP Battles", "Tournament Mode", "NFT Parts"],
    platform: ["Web", "Mobile"],
    chain: "0G Chain",
  },
  "highway-hustle": {
    title: "Highway Hustle",
    description: "Fast lanes. Fierce rivals. Full throttle.",
    longDescription: "Race through neon-lit highways at breakneck speed. Customize your ride, challenge rivals, and earn your way to the top of the racing leaderboard.",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png",
    category: "RACING",
    rating: 4.8,
    sessionLength: "5-10 min",
    skillLevel: "Beginner",
    players: "1-8 Players",
    features: ["High-Speed Racing", "Vehicle Upgrades", "Multiplayer Races", "Track Editor"],
    platform: ["Web", "Mobile"],
    chain: "0G Chain",
    playUrl: "https://highwayhustle.xyz/",
  },
};

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = id ? gameData[id] : null;

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Game Not Found</h1>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navbar />

      {/* Full-bleed hero image */}
      <section className="relative z-10">
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <img
            src={game.image}
            alt={game.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
          
          <AIScanLine />
          
          {/* Horizontal neon glitch lines */}
          {[15, 35, 55, 75, 88].map((top, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-[1px] pointer-events-none"
              style={{ top: `${top}%`, background: `linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.4), transparent)`, boxShadow: `0 0 8px hsl(195 100% 60% / 0.2)` }}
              animate={{ opacity: [0, 0.6, 0], x: ["-10%", "5%", "-10%"] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}

          {/* Neon border bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent" style={{ boxShadow: "0 0 15px hsl(195 100% 60% / 0.3)" }} />

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="absolute top-24 left-6 flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm text-foreground hover:text-neon-cyan hover:shadow-[0_0_10px_hsl(195_100%_60%/0.2)] transition-all z-10"
          >
            <ArrowLeft className="w-4 h-4" /> BACK
          </motion.button>

          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 right-6 z-10"
          >
            <span className="px-3 py-1.5 rounded-full text-[10px] font-display font-bold tracking-[0.2em] bg-primary/80 text-primary-foreground border border-primary/50" style={{ boxShadow: "0 0 12px hsl(195 100% 50% / 0.3)" }}>
              {game.category}
            </span>
          </motion.div>

          {/* Hero content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black text-foreground tracking-tight leading-none mb-3 glow-text">
                  {game.title.toUpperCase()}
                </h1>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-6">
                  {game.description}
                </p>

                {/* Quick stats row */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                    <span className="font-display text-sm font-bold text-foreground">{game.rating}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{game.sessionLength}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{game.players}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">{game.skillLevel}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-4">
                  <a
                    href={game.playUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 md:px-10 py-3.5 md:py-4 rounded-lg font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground btn-cyan-lightning transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/15 to-transparent"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <Play className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">PLAY GAME</span>
                  </a>
                  <button className="w-12 h-12 rounded-lg glass-panel flex items-center justify-center hover:border-neon-cyan/50 hover:text-neon-cyan hover:shadow-[0_0_15px_hsl(195_100%_60%/0.2)] transition-all">
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Game details section */}
        <div className="relative bg-background">
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[250px] rounded-full bg-neon-cyan/4 blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              {/* Main content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full" style={{ boxShadow: "0 0 8px hsl(195 100% 50% / 0.5)" }} />
                    <h2 className="font-display text-xl font-bold text-foreground tracking-wider">ABOUT</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {game.longDescription}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-10"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-neon-cyan rounded-full" style={{ boxShadow: "0 0 8px hsl(195 100% 60% / 0.5)" }} />
                    <h2 className="font-display text-xl font-bold text-foreground tracking-wider">FEATURES</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {game.features.map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group rounded-xl p-4 flex items-center gap-4 border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_15px_hsl(195_100%_50%/0.08)] transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors" style={{ boxShadow: "0 0 10px hsl(195 100% 50% / 0.1)" }}>
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-10"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-neon-cyan rounded-full" style={{ boxShadow: "0 0 8px hsl(195 100% 60% / 0.5)" }} />
                    <h2 className="font-display text-xl font-bold text-foreground tracking-wider">PREVIEW</h2>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/50 relative group">
                    <img
                      src={game.image}
                      alt={`${game.title} preview`}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 group-hover:shadow-[inset_0_0_20px_hsl(195_100%_50%/0.1)] rounded-xl transition-all duration-300" />
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="sticky top-24 space-y-6"
                >
                  <div className="rounded-xl border border-border/50 bg-card/80 overflow-hidden">
                    <div className="relative h-36 overflow-hidden">
                      <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-bold text-foreground">{game.title}</span>
                        <span className="text-xs font-mono text-primary tracking-wider text-glow-cyan">FREE</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono tracking-wider">PLATFORM</span>
                        <div className="flex gap-1.5 ml-auto">
                          {game.platform.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold bg-muted text-muted-foreground">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono tracking-wider">CHAIN</span>
                        <span className="text-xs text-neon-cyan font-display font-semibold ml-auto text-glow-cyan">{game.chain}</span>
                      </div>

                      <div className="h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

                      <a
                        href={game.playUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-6 py-3 rounded-lg font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground btn-cyan-lightning transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        PLAY GAME
                      </a>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/30 bg-card/40 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-xs font-display font-bold text-foreground tracking-wider">POWERED BY</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This game runs on the <span className="text-neon-cyan font-semibold text-glow-cyan">0G Chain</span> — a decentralized AI compute network enabling trustless, verifiable gaming with on-chain rewards.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GameDetail;
