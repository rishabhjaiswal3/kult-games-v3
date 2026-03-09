import { motion } from "framer-motion";
import { ArrowLeft, Play, Star, Clock, Users, Trophy, Share2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MageCharacter from "@/components/MageCharacter";
import mageBattle from "@/assets/mage-battle.png";

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
  screenshots: string[];
}

const gameData: Record<string, {
  title: string; description: string; longDescription: string; image: string; category: string; rating: number; sessionLength: string; skillLevel: string; players: string; features: string[]; screenshots: string[];
}> = {
  "guess-the-ai": { title: "Guess The AI", description: "Challenge your mind. Beat the AI.", longDescription: "Test your wits against advanced AI opponents in this mind-bending puzzle game. Can you distinguish between human and AI-generated content? Rise through the ranks and prove your cognitive superiority on the blockchain.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png", category: "PUZZLE", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner", players: "1-4 Players", features: ["AI-Powered Opponents", "On-Chain Rewards", "Daily Challenges", "Global Leaderboard"], screenshots: ["https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png"] },
  "zero-g-pool": { title: "Zero G Pool", description: "Your favourite 8-ball, now with a cosmic twist.", longDescription: "Experience billiards like never before in zero gravity. Physics-defying trick shots, cosmic arenas, and multiplayer tournaments make this the ultimate pool experience on the blockchain.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png", category: "SPORTS", rating: 4.8, sessionLength: "10-15 min", skillLevel: "Intermediate", players: "1-2 Players", features: ["Zero Gravity Physics", "Multiplayer Matches", "Custom Tables", "NFT Cues"], screenshots: ["https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png"] },
  "zero-dash": { title: "Zero Dash", description: "Run. Escape. Don't look back.", longDescription: "An adrenaline-pumping endless runner set in a cyberpunk dystopia. Dodge obstacles, collect power-ups, and compete for the highest score on the global leaderboard.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png", category: "ACTION", rating: 4.8, sessionLength: "3-5 min", skillLevel: "All levels", players: "1 Player", features: ["Endless Runner", "Power-ups", "Daily Rewards", "Season Rankings"], screenshots: ["https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png"] },
  "robo-wars": { title: "Robo Wars", description: "Enter the arena where metal meets mayhem.", longDescription: "Build, customize, and battle your robots in intense PvP combat. Earn parts, upgrade your machines, and dominate the arena in this on-chain fighting game.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png", category: "FIGHTING", rating: 4.8, sessionLength: "10-20 min", skillLevel: "Intermediate", players: "1-2 Players", features: ["Robot Customization", "PvP Battles", "Tournament Mode", "NFT Parts"], screenshots: ["https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png"] },
  "highway-hustle": { title: "Highway Hustle", description: "Fast lanes. Fierce rivals. Full throttle.", longDescription: "Race through neon-lit highways at breakneck speed. Customize your ride, challenge rivals, and earn your way to the top of the racing leaderboard.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png", category: "RACING", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner", players: "1-8 Players", features: ["High-Speed Racing", "Vehicle Upgrades", "Multiplayer Races", "Track Editor"], screenshots: ["https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png"] },
  "warzone-warriors": { title: "Warzone Warriors", description: "Epic battles in a decentralized warzone.", longDescription: "Enter the ultimate battlefield where strategy meets skill. Command your warriors, conquer territories, and earn exclusive rewards in this on-chain strategy combat game.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png", category: "BATTLE", rating: 4.9, sessionLength: "15-30 min", skillLevel: "Advanced", players: "2-16 Players", features: ["Territory Conquest", "Clan Wars", "Strategic Combat", "Exclusive NFTs"], screenshots: ["https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png"] },
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

      <section className="relative pt-24 pb-20 z-10">
        {/* Hero banner */}
        <div className="relative h-[450px] md:h-[500px] overflow-hidden">
          <img src={game.image} alt={game.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 120px 40px hsl(269 62% 52% / 0.15)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm text-foreground hover:text-primary transition-colors z-10">
            <ArrowLeft className="w-4 h-4" /> BACK
          </motion.button>
        </div>

        <div className="container mx-auto px-6 -mt-32 relative z-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Game thumbnail */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-[200px] h-[150px] md:w-[260px] md:h-[180px] rounded-xl overflow-hidden flex-shrink-0 ai-border-glow glow-border"
            >
              <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
            </motion.div>

            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <span className="text-xs font-mono text-primary tracking-[0.2em]">{game.category}</span>
                <h1 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight mt-2">{game.title}</h1>
                <p className="text-muted-foreground mt-4 text-lg leading-relaxed max-w-2xl">{game.longDescription}</p>

                <div className="flex flex-wrap items-center gap-6 mt-8">
                  <div className="flex items-center gap-2"><Star className="w-4 h-4 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" /><span className="font-display text-sm font-bold text-foreground">{game.rating}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /><span className="text-sm">{game.sessionLength}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /><span className="text-sm">{game.players}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Trophy className="w-4 h-4" /><span className="text-sm">{game.skillLevel}</span></div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button className="px-10 py-4 rounded-lg font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(269_62%_52%/0.4)] transition-all duration-300 flex items-center gap-3">
                    <Play className="w-5 h-5 fill-current" /> PLAY NOW
                  </button>
                  <button className="w-12 h-12 rounded-lg glass-panel flex items-center justify-center hover:border-primary/50 transition-colors">
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
                <h2 className="font-display text-xl font-bold text-foreground tracking-wider mb-6">FEATURES</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {game.features.map((feature, i) => (
                    <motion.div key={feature} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="glass-panel rounded-lg p-4 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar mage */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="hidden lg:block w-[340px] xl:w-[400px] flex-shrink-0 relative">
              <MageCharacter src={mageBattle} alt="Mage" flip showMask={false} glowColor="blue" loading="eager" />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GameDetail;
