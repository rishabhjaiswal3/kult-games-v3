import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { leaderboardApi } from "@/api/leaderboardApi";
import type { LeaderboardEntry } from "@/types/api";

// Inline human character avatars
const AvatarCryptoKnight = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Background */}
    <rect width="80" height="80" rx="40" fill="#1a1000"/>
    {/* Shoulders / armor */}
    <path d="M10 80 Q10 58 20 54 L30 51 Q40 56 50 51 L60 54 Q70 58 70 80Z" fill="#a07010"/>
    {/* Neck */}
    <rect x="34" y="44" width="12" height="10" rx="3" fill="#c8906a"/>
    {/* Head */}
    <ellipse cx="40" cy="34" rx="18" ry="20" fill="#d4956e"/>
    {/* Hair — dark, swept back */}
    <path d="M22 28 Q22 12 40 11 Q58 12 58 28 Q55 16 40 15 Q25 16 22 28Z" fill="#1a0e00"/>
    <path d="M22 26 Q20 20 22 15 Q26 10 40 10 Q54 10 58 15 Q60 20 58 26" fill="#1a0e00"/>
    {/* Ears */}
    <ellipse cx="22" cy="34" rx="3.5" ry="5" fill="#c8906a"/>
    <ellipse cx="58" cy="34" rx="3.5" ry="5" fill="#c8906a"/>
    {/* Eyes */}
    <ellipse cx="33" cy="33" rx="4.5" ry="4" fill="white"/>
    <ellipse cx="47" cy="33" rx="4.5" ry="4" fill="white"/>
    <ellipse cx="33" cy="33.5" rx="2.5" ry="2.8" fill="#3a2000"/>
    <ellipse cx="47" cy="33.5" rx="2.5" ry="2.8" fill="#3a2000"/>
    <circle cx="34" cy="32.5" r="1" fill="white"/>
    <circle cx="48" cy="32.5" r="1" fill="white"/>
    {/* Eyebrows */}
    <path d="M29 28.5 Q33 27 37 28.5" stroke="#1a0e00" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M43 28.5 Q47 27 51 28.5" stroke="#1a0e00" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    {/* Nose */}
    <path d="M39 36 Q38 40 40 41 Q42 40 41 36" stroke="#b07850" strokeWidth="1" fill="none" strokeLinecap="round"/>
    {/* Mouth — confident smirk */}
    <path d="M34 46 Q40 50 46 46" stroke="#9a5a3a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Gold crown */}
    <path d="M26 16 L29 10 L33 15 L40 8 L47 15 L51 10 L54 16Z" fill="#ffd700" fillOpacity="0.95"/>
    <rect x="26" y="15" width="28" height="4" rx="1" fill="#e6c000"/>
    {/* Armor collar */}
    <path d="M26 54 Q30 50 40 52 Q50 50 54 54" stroke="#ffd700" strokeWidth="2" fill="none" strokeOpacity="0.8"/>
  </svg>
);

const AvatarNeonBlaze = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Background */}
    <rect width="80" height="80" rx="40" fill="#060c18"/>
    {/* Shoulders / jacket */}
    <path d="M10 80 Q10 58 20 54 L30 51 Q40 56 50 51 L60 54 Q70 58 70 80Z" fill="#1a2a4a"/>
    {/* Jacket collar lines */}
    <path d="M30 54 L36 62 L40 64 L44 62 L50 54" stroke="#4a90d0" strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
    {/* Neck */}
    <rect x="34" y="44" width="12" height="10" rx="3" fill="#b8806a"/>
    {/* Head */}
    <ellipse cx="40" cy="34" rx="18" ry="20" fill="#c4826c"/>
    {/* Hair — light, spiky/stylish */}
    <path d="M22 26 Q24 10 40 10 Q56 10 58 26 Q54 14 40 13 Q26 14 22 26Z" fill="#e8d080"/>
    <path d="M22 24 Q21 16 24 12 L28 8 L32 13 Q36 8 40 9 Q44 8 48 13 L52 8 L56 12 Q59 16 58 24" fill="#e8d080"/>
    {/* Hair highlights */}
    <path d="M32 11 Q36 8 40 10" stroke="#fff8c0" strokeWidth="1.5" strokeOpacity="0.6" fill="none"/>
    {/* Ears */}
    <ellipse cx="22" cy="34" rx="3.5" ry="5" fill="#b8806a"/>
    <ellipse cx="58" cy="34" rx="3.5" ry="5" fill="#b8806a"/>
    {/* Eyes — ice blue */}
    <ellipse cx="33" cy="33" rx="4.5" ry="4" fill="white"/>
    <ellipse cx="47" cy="33" rx="4.5" ry="4" fill="white"/>
    <ellipse cx="33" cy="33.5" rx="2.5" ry="2.8" fill="#1060a0"/>
    <ellipse cx="47" cy="33.5" rx="2.5" ry="2.8" fill="#1060a0"/>
    <circle cx="34" cy="32.5" r="1" fill="white"/>
    <circle cx="48" cy="32.5" r="1" fill="white"/>
    {/* Eyebrows */}
    <path d="M29 28.5 Q33 27.5 37 28.5" stroke="#c8a840" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M43 28.5 Q47 27.5 51 28.5" stroke="#c8a840" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    {/* Nose */}
    <path d="M39 36 Q38 40 40 41 Q42 40 41 36" stroke="#a06848" strokeWidth="1" fill="none" strokeLinecap="round"/>
    {/* Mouth — slight smile */}
    <path d="M35 46 Q40 49 45 46" stroke="#884830" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Earring */}
    <circle cx="22" cy="37" r="2" fill="#4a90d0" fillOpacity="0.9"/>
  </svg>
);

const AvatarPhantomX = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Background */}
    <rect width="80" height="80" rx="40" fill="#100800"/>
    {/* Shoulders / hoodie */}
    <path d="M10 80 Q10 58 18 54 L28 50 Q40 56 52 50 L62 54 Q70 58 70 80Z" fill="#2a1808"/>
    {/* Hoodie edge */}
    <path d="M28 52 Q34 60 40 62 Q46 60 52 52" stroke="#c86820" strokeWidth="1.5" fill="none" strokeOpacity="0.6"/>
    {/* Neck */}
    <rect x="34" y="44" width="12" height="10" rx="3" fill="#8a5840"/>
    {/* Head */}
    <ellipse cx="40" cy="34" rx="18" ry="20" fill="#9a6448"/>
    {/* Hair — dark, medium length */}
    <path d="M22 30 Q22 12 40 11 Q58 12 58 30 Q56 16 40 14 Q24 16 22 30Z" fill="#0a0600"/>
    <path d="M22 28 Q21 18 23 13 Q28 8 40 9 Q52 8 57 13 Q59 18 58 28" fill="#0a0600"/>
    {/* Side hair */}
    <path d="M22 30 Q20 36 22 40" stroke="#0a0600" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M58 30 Q60 36 58 40" stroke="#0a0600" strokeWidth="5" strokeLinecap="round" fill="none"/>
    {/* Ears */}
    <ellipse cx="22" cy="34" rx="3.5" ry="5" fill="#8a5840"/>
    <ellipse cx="58" cy="34" rx="3.5" ry="5" fill="#8a5840"/>
    {/* Eyes — amber/orange */}
    <ellipse cx="33" cy="33" rx="4.5" ry="4" fill="white"/>
    <ellipse cx="47" cy="33" rx="4.5" ry="4" fill="white"/>
    <ellipse cx="33" cy="33.5" rx="2.5" ry="2.8" fill="#804010"/>
    <ellipse cx="47" cy="33.5" rx="2.5" ry="2.8" fill="#804010"/>
    <circle cx="34" cy="32.5" r="1" fill="white"/>
    <circle cx="48" cy="32.5" r="1" fill="white"/>
    {/* Eyebrows — slightly furrowed */}
    <path d="M29 28 Q33 26.5 37 27.5" stroke="#0a0600" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M43 27.5 Q47 26.5 51 28" stroke="#0a0600" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Nose */}
    <path d="M39 36 Q38 40 40 41 Q42 40 41 36" stroke="#7a4428" strokeWidth="1" fill="none" strokeLinecap="round"/>
    {/* Mouth — neutral/serious */}
    <path d="M35 46 Q40 47 45 46" stroke="#6a3820" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Scar / face mark */}
    <path d="M46 28 L48 33" stroke="#c86820" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round"/>
  </svg>
);

const PlayerAvatar = ({ rank }: { rank: number; }) => {
  if (rank === 1) return <AvatarCryptoKnight />;
  if (rank === 2) return <AvatarNeonBlaze />;
  if (rank === 3) return <AvatarPhantomX />;
  return null;
};

const timeFilters = ["All Time", "This Week", "Today"];

function getAvatarUrl(walletAddress: string, name?: string) {
  const seed = name ?? walletAddress;
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

function getDisplayName(entry: LeaderboardEntry) {
  if (entry.name) return entry.name;
  const addr = entry.wallet_address;
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : `Player #${entry.rank}`;
}

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState("All Time");

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: () => leaderboardApi.getGlobal(1, 50),
    staleTime: 60_000,
  });

  const players = data?.entries ?? [];
  const top3 = [players[1], players[0], players[2]].filter(Boolean) as LeaderboardEntry[];

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
        {/* Ambient glows */}
        <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="w-full px-6 md:px-8 xl:px-12 relative z-10">
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col lg:flex-row justify-between w-full rounded-[28px] border border-neon-cyan/15 bg-[linear-gradient(135deg,hsl(195_100%_12%/0.36),hsl(220_45%_10%/0.62),hsl(220_45%_10%/0.2))] overflow-hidden backdrop-blur-md shadow-[0_0_40px_hsl(195_100%_60%/0.1)]"
            >
              {/* Text content */}
              <div className="relative z-10 order-first px-6 py-7 md:px-8 md:py-9">
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
              </div>

              {/* Video — bottom on mobile/tablet, right on desktop */}
              <div className="order-last w-full lg:w-[500px] flex-shrink-0 pointer-events-none flex items-center">
                <div className="relative overflow-hidden w-full lg:rounded-l-[32px]">
                  <AutoPlayVideo src="/videos/SC_7.mp4" loop className="w-full aspect-[16/9] object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-l from-background/10 via-background/18 to-background/58" />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-transparent to-background/40" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-12 w-full items-end">
            {isLoading
              ? [0, 1, 2].map((i) => (
                  <div key={i} className={`rounded-2xl border border-border/30 bg-card/50 p-5 flex flex-col items-center gap-3 ${i === 1 ? "pb-8" : ""}`}>
                    <Skeleton className={`rounded-full ${i === 1 ? "w-20 h-20" : "w-16 h-16"}`} />
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))
            : top3.map((p, i) => {
              const isFirst = i === 1;

              const theme =
                p.rank === 1
                  ? {
                      accent: "hsl(40 85% 58%)",
                      accentMuted: "hsl(40 85% 58% / 0.12)",
                      accentBorder: "hsl(40 85% 58% / 0.55)",
                      accentGlow: "hsl(40 85% 58% / 0.35)",
                      cardBg: "linear-gradient(160deg, hsl(40 60% 14% / 0.75), hsl(220 45% 10% / 0.90))",
                      topBar: "linear-gradient(90deg, transparent, hsl(40 85% 58% / 0.9), transparent)",
                      textAccent: "text-[hsl(40_85%_62%)]",
                      avatarBg: "bg-[hsl(40_60%_16%)]",
                      scoreColor: "text-[hsl(40_85%_62%)]",
                      shadow: "shadow-[0_0_60px_hsl(40_85%_58%/0.3),0_0_120px_hsl(40_85%_58%/0.12),inset_0_1px_0_hsl(40_85%_80%/0.15)]",
                    }
                  : p.rank === 2
                  ? {
                      accent: "hsl(220 15% 75%)",
                      accentMuted: "hsl(220 15% 75% / 0.10)",
                      accentBorder: "hsl(220 15% 75% / 0.35)",
                      accentGlow: "hsl(220 15% 75% / 0.15)",
                      cardBg: "linear-gradient(160deg, hsl(220 25% 14% / 0.72), hsl(220 40% 9% / 0.88))",
                      topBar: "linear-gradient(90deg, transparent, hsl(220 15% 75% / 0.7), transparent)",
                      textAccent: "text-[hsl(220_15%_80%)]",
                      avatarBg: "bg-[hsl(220_20%_16%)]",
                      scoreColor: "text-[hsl(220_15%_82%)]",
                      shadow: "shadow-[0_0_30px_hsl(220_15%_75%/0.12),inset_0_1px_0_hsl(220_15%_90%/0.1)]",
                    }
                  : {
                      accent: "hsl(25 70% 52%)",
                      accentMuted: "hsl(25 70% 52% / 0.10)",
                      accentBorder: "hsl(25 70% 52% / 0.38)",
                      accentGlow: "hsl(25 70% 52% / 0.18)",
                      cardBg: "linear-gradient(160deg, hsl(25 45% 13% / 0.72), hsl(220 40% 9% / 0.88))",
                      topBar: "linear-gradient(90deg, transparent, hsl(25 70% 52% / 0.75), transparent)",
                      textAccent: "text-[hsl(25_70%_60%)]",
                      avatarBg: "bg-[hsl(25_45%_16%)]",
                      scoreColor: "text-[hsl(25_70%_62%)]",
                      shadow: "shadow-[0_0_30px_hsl(25_70%_52%/0.15),inset_0_1px_0_hsl(25_70%_70%/0.1)]",
                    };

              return (
                <motion.div
                  key={p.rank}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${theme.shadow}`}
                  style={{
                    background: theme.cardBg,
                    borderColor: theme.accentBorder,
                    marginBottom: isFirst ? "0px" : undefined,
                  }}
                >
                  {/* Top accent bar */}
                  <div className="h-[2px] w-full" style={{ background: theme.topBar }} />

                  {/* Subtle inner glow overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accentGlow}, transparent 65%)` }}
                  />

                  <div className={`relative flex flex-col items-center text-center px-3 md:px-5 pt-5 md:pt-7 pb-4 md:pb-6 ${isFirst ? "pt-6 md:pt-9" : ""}`}>
                    {/* Avatar */}
                    <div className="relative mb-3 md:mb-4">
                      {isFirst && (
                        <>
                          <motion.div
                            className="absolute inset-[-6px] rounded-full"
                            style={{ border: `1.5px solid ${theme.accentBorder}` }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="absolute inset-[-12px] rounded-full"
                            style={{ border: `1px solid ${theme.accentGlow}` }}
                            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                          />
                        </>
                      )}
                      <div
                        className={`${isFirst ? "w-16 h-16 md:w-20 md:h-20" : "w-12 h-12 md:w-16 md:h-16"} rounded-full overflow-hidden ${theme.avatarBg}`}
                        style={{
                          boxShadow: isFirst ? `0 0 24px ${theme.accentGlow}, inset 0 1px 0 hsl(0 0% 100% / 0.12)` : `inset 0 1px 0 hsl(0 0% 100% / 0.08)`,
                          outline: `2px solid ${theme.accentBorder}`,
                          outlineOffset: "2px",
                        }}
                      >
                        <PlayerAvatar rank={p.rank} />
                      </div>
                    </div>

                    {/* Rank badge */}
                    <div
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full mb-2 text-[10px] font-mono font-semibold tracking-widest"
                      style={{ background: theme.accentMuted, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
                    >
                      {getRankIcon(p.rank)}
                      <span>#{p.rank}</span>
                    </div>

                    {/* Name */}
                    <h3 className={`font-display text-xs md:text-sm font-bold truncate w-full ${theme.textAccent}`}>{getDisplayName(p)}</h3>

                    {/* Score */}
                    <p className={`font-display ${isFirst ? "text-xl md:text-2xl" : "text-base md:text-lg"} font-black mt-1.5 tabular-nums ${theme.scoreColor}`}>
                      {p.score.toLocaleString()}
                    </p>

                    {/* Wins + game */}
                    {p.wins != null && <p className="text-[10px] text-muted-foreground font-mono mt-0.5 tracking-wider">{p.wins} WINS</p>}
                    {p.game && (
                      <span
                        className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider"
                        style={{ background: theme.accentMuted, color: theme.accent }}
                      >
                        {p.game.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Bottom podium step indicator */}
                  <div
                    className="h-1 w-full mt-auto"
                    style={{ background: `linear-gradient(90deg, transparent, ${theme.accentBorder}, transparent)`, opacity: 0.6 }}
                  />
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
                  {isLoading && Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/10">
                      <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="p-4 hidden sm:table-cell"><Skeleton className="h-4 w-8 ml-auto" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-4 mx-auto" /></td>
                    </tr>
                  ))}
                  {!isLoading && players.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-muted-foreground text-sm font-mono">
                        NO DATA AVAILABLE
                      </td>
                    </tr>
                  )}
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
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                            <img src={getAvatarUrl(p.wallet_address, p.name)} alt={getDisplayName(p)} className="w-full h-full object-contain p-0.5" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          </div>
                          <span className="font-display text-sm font-semibold text-foreground group-hover:text-neon-cyan transition-colors">{getDisplayName(p)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground font-mono hidden md:table-cell">{p.game ?? "—"}</td>
                      <td className="p-4 text-right font-display text-sm font-bold text-foreground">{p.score.toLocaleString()}</td>
                      <td className="p-4 text-right text-sm text-muted-foreground hidden sm:table-cell">{p.wins ?? "—"}</td>
                      <td className="p-4 text-center">
                        <TrendingUp className="w-4 h-4 text-muted-foreground mx-auto" />
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
