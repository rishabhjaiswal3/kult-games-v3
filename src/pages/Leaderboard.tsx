import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import mageVictory from "@/assets/mage-victory.png";

const players = [
  { rank: 1, name: "CryptoKnight", avatar: "CK", score: 98750, wins: 342, change: "up", game: "Robo Wars" },
  { rank: 2, name: "NeonBlaze", avatar: "NB", score: 87200, wins: 298, change: "up", game: "Zero Dash" },
  { rank: 3, name: "PhantomX", avatar: "PX", score: 76800, wins: 267, change: "down", game: "Highway Hustle" },
  { rank: 4, name: "VoidWalker", avatar: "VW", score: 65400, wins: 234, change: "up", game: "Zero G Pool" },
  { rank: 5, name: "ShadowMage", avatar: "SM", score: 54200, wins: 198, change: "same", game: "Guess The AI" },
  { rank: 6, name: "PixelHunter", avatar: "PH", score: 48900, wins: 176, change: "up", game: "Robo Wars" },
  { rank: 7, name: "StormBreaker", avatar: "SB", score: 42100, wins: 155, change: "down", game: "Zero Dash" },
  { rank: 8, name: "ArcaneWolf", avatar: "AW", score: 38700, wins: 142, change: "up", game: "Highway Hustle" },
  { rank: 9, name: "CyberNova", avatar: "CN", score: 35200, wins: 128, change: "down", game: "Zero G Pool" },
  { rank: 10, name: "RuneMaster", avatar: "RM", score: 31500, wins: 115, change: "same", game: "Guess The AI" },
];

const timeFilters = ["All Time", "This Week", "Today"];

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState("All Time");

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-[hsl(40,80%,55%)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[hsl(0,0%,75%)]" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-[hsl(25,70%,50%)]" />;
    return <span className="text-sm font-display font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navbar />

      <section className="relative pt-24 pb-20 z-10">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-10">
          <source src="/videos/SC_7.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/85" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header with large mage rising behind content */}
          <div className="relative mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-xs font-mono text-primary tracking-[0.2em] uppercase mb-2 block">
                <Trophy className="w-3 h-3 inline mr-1" /> Rankings
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                LEADER<span className="gradient-text">BOARD</span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-md text-sm">Climb the ranks. Prove your dominance. Earn eternal glory on-chain.</p>
            </motion.div>

            {/* Large mage - upper body visible, lower body fades behind content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:block absolute -right-4 xl:right-8 -top-8 w-[320px] xl:w-[400px] h-[500px] xl:h-[600px] overflow-hidden pointer-events-none"
              style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)' }}
            >
              <img
                src={mageVictory}
                alt="Victory Mage"
                className="w-full h-auto animate-float drop-shadow-[0_0_60px_hsl(270_70%_55%/0.4)]"
              />
              {/* Glow behind mage */}
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-primary/20 blur-[80px]" />
            </motion.div>
          </div>

          {/* Time filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-3 mb-8">
            {timeFilters.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-5 py-2 rounded-lg font-display text-xs font-semibold tracking-wider transition-all ${
                  timeFilter === tf
                    ? "bg-primary text-primary-foreground"
                    : "glass-panel text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </motion.div>

          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            {[players[1], players[0], players[2]].map((p, i) => (
              <motion.div
                key={p.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`glass-panel rounded-xl p-4 text-center ${i === 1 ? "ornate-border -mt-4" : ""}`}
              >
                <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center font-display font-bold text-lg ${
                  p.rank === 1 ? "bg-[hsl(40,80%,55%)]/20 text-[hsl(40,80%,55%)]" :
                  p.rank === 2 ? "bg-foreground/10 text-foreground" :
                  "bg-[hsl(25,70%,50%)]/20 text-[hsl(25,70%,50%)]"
                }`}>
                  {p.avatar}
                </div>
                {getRankIcon(p.rank)}
                <h3 className="font-display text-sm font-bold text-foreground mt-2">{p.name}</h3>
                <p className="text-primary font-display text-lg font-bold mt-1">{p.score.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{p.wins} WINS</p>
              </motion.div>
            ))}
          </div>

          {/* Full table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4 text-xs font-display font-semibold text-muted-foreground tracking-wider">RANK</th>
                    <th className="text-left p-4 text-xs font-display font-semibold text-muted-foreground tracking-wider">PLAYER</th>
                    <th className="text-left p-4 text-xs font-display font-semibold text-muted-foreground tracking-wider hidden md:table-cell">TOP GAME</th>
                    <th className="text-right p-4 text-xs font-display font-semibold text-muted-foreground tracking-wider">SCORE</th>
                    <th className="text-right p-4 text-xs font-display font-semibold text-muted-foreground tracking-wider hidden sm:table-cell">WINS</th>
                    <th className="text-center p-4 text-xs font-display font-semibold text-muted-foreground tracking-wider">TREND</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <motion.tr
                      key={p.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="border-b border-border/10 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">{getRankIcon(p.rank)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-display font-bold text-primary">
                            {p.avatar}
                          </div>
                          <span className="font-display text-sm font-semibold text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground font-mono hidden md:table-cell">{p.game}</td>
                      <td className="p-4 text-right font-display text-sm font-bold text-foreground">{p.score.toLocaleString()}</td>
                      <td className="p-4 text-right text-sm text-muted-foreground hidden sm:table-cell">{p.wins}</td>
                      <td className="p-4 text-center">
                        {p.change === "up" && <ChevronUp className="w-4 h-4 text-green-500 mx-auto" />}
                        {p.change === "down" && <ChevronDown className="w-4 h-4 text-destructive mx-auto" />}
                        {p.change === "same" && <TrendingUp className="w-4 h-4 text-muted-foreground mx-auto" />}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
