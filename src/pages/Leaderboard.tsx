import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    if (rank === 1) return <Crown className="w-5 h-5 text-[hsl(var(--gold))]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[hsl(0,0%,75%)]" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-[hsl(25,70%,50%)]" />;
    return <span className="text-sm font-display font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <section className="relative pt-24 pb-20 z-10 overflow-hidden">
        <div className="absolute top-24 right-0 w-full lg:w-[60%] pointer-events-none">
          <div className="relative overflow-hidden lg:rounded-l-[32px]">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full aspect-[16/9] object-cover opacity-70"
            >
              <source src="/videos/SC_7.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-l from-background/10 via-background/18 to-background/58" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-transparent to-background/40" />
          </div>
        </div>

        {/* Ambient glows */}
        <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-[245px] w-full sm:mt-[420px] lg:mt-0 lg:w-[42%] rounded-[28px] border border-neon-cyan/15 bg-[linear-gradient(135deg,hsl(195_100%_12%/0.36),hsl(220_45%_10%/0.62),hsl(220_45%_10%/0.2))] px-6 py-7 backdrop-blur-md shadow-[0_0_40px_hsl(195_100%_60%/0.1)] md:px-8 md:py-9"
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  className="w-2 h-2 rounded-full bg-neon-cyan flex-shrink-0"
                  animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-mono text-neon-cyan/60 tracking-[0.2em] uppercase">
                  <Trophy className="w-3 h-3 inline mr-1" /> Rankings
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                LEADER<span className="gradient-text">BOARD</span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-md text-sm">Climb the ranks. Prove your dominance. Earn eternal glory on-chain.</p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-2 mt-6">
                {timeFilters.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeFilter(tf)}
                    className={`px-4 py-1.5 rounded-full font-display text-xs font-semibold tracking-wider transition-all duration-300 ${
                      timeFilter === tf ? "btn-eye" : "glass-panel btn-eye-outline"
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-12 max-w-3xl mx-auto">
            {[players[1], players[0], players[2]].map((p, i) => {
              const isFirst = i === 1;
              const colors = p.rank === 1
                ? { bg: "bg-[hsl(var(--gold))]/20", text: "text-[hsl(var(--gold))]", border: "border-[hsl(var(--gold))]/50", glow: "shadow-[0_0_50px_hsl(40_85%_58%/0.35),0_0_100px_hsl(40_85%_58%/0.15)]" }
                : p.rank === 2
                ? { bg: "bg-foreground/8", text: "text-foreground/80", border: "border-foreground/25", glow: "shadow-[0_0_20px_hsl(0_0%_75%/0.1)]" }
                : { bg: "bg-[hsl(25,70%,50%)]/15", text: "text-[hsl(25,70%,50%)]", border: "border-[hsl(25,70%,50%)]/30", glow: "shadow-[0_0_20px_hsl(25_70%_50%/0.1)]" };

              return (
                <motion.div
                  key={p.rank}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`rounded-xl p-4 md:p-6 text-center border backdrop-blur-sm ${colors.border} ${colors.glow} ${isFirst ? "-mt-4 md:-mt-8 bg-[hsl(var(--gold))]/5" : "mt-2 md:mt-4 bg-card/60"}`}
                >
                  {isFirst ? (
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[hsl(var(--gold))]/60"
                        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.2, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute inset-[-4px] rounded-full border border-[hsl(var(--gold))]/30"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      />
                      <div className={`w-full h-full rounded-full flex items-center justify-center font-display font-bold text-lg md:text-xl ${colors.bg} ${colors.text}`}
                        style={{ boxShadow: "0 0 20px hsl(40 85% 58% / 0.4)" }}
                      >
                        {p.avatar}
                      </div>
                    </div>
                  ) : (
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 flex items-center justify-center font-display font-bold text-base md:text-lg ${colors.bg} ${colors.text}`}>
                      {p.avatar}
                    </div>
                  )}

                  <div className="mb-1">{getRankIcon(p.rank)}</div>
                  <h3 className={`font-display text-xs md:text-sm font-bold mt-1 truncate ${isFirst ? "text-[hsl(var(--gold))]" : "text-foreground"}`}>{p.name}</h3>
                  <p className={`font-display text-base md:text-xl font-bold mt-1 ${isFirst ? "text-[hsl(var(--gold))]" : "text-neon-cyan"}`}>{p.score.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.wins} WINS</p>
                </motion.div>
              );
            })}
          </div>

          {/* Full table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl overflow-hidden border border-border/50 bg-card/70 backdrop-blur-md"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    <th className="text-left p-4 text-[10px] font-mono text-muted-foreground tracking-wider">RANK</th>
                    <th className="text-left p-4 text-[10px] font-mono text-muted-foreground tracking-wider">PLAYER</th>
                    <th className="text-left p-4 text-[10px] font-mono text-muted-foreground tracking-wider hidden md:table-cell">TOP GAME</th>
                    <th className="text-right p-4 text-[10px] font-mono text-muted-foreground tracking-wider">SCORE</th>
                    <th className="text-right p-4 text-[10px] font-mono text-muted-foreground tracking-wider hidden sm:table-cell">WINS</th>
                    <th className="text-center p-4 text-[10px] font-mono text-muted-foreground tracking-wider">TREND</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <motion.tr
                      key={p.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="border-b border-border/10 hover:bg-neon-cyan/3 transition-colors group"
                    >
                      <td className="p-4">{getRankIcon(p.rank)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center text-xs font-display font-bold text-neon-cyan group-hover:bg-neon-cyan/20 transition-colors">{p.avatar}</div>
                          <span className="font-display text-sm font-semibold text-foreground group-hover:text-neon-cyan transition-colors">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground font-mono hidden md:table-cell">{p.game}</td>
                      <td className="p-4 text-right font-display text-sm font-bold text-foreground">{p.score.toLocaleString()}</td>
                      <td className="p-4 text-right text-sm text-muted-foreground hidden sm:table-cell">{p.wins}</td>
                      <td className="p-4 text-center">
                        {p.change === "up" && <ChevronUp className="w-4 h-4 text-neon-cyan mx-auto" />}
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
