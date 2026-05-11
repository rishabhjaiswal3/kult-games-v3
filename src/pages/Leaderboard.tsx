import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { leaderboardApi } from "@/api/leaderboardApi";
import type { LeaderboardEntry } from "@/types/api";

// Cyberpunk-themed avatars matching the Kult browser theme
const AvatarGold = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="80" height="80" rx="40" fill="#0d0a00"/>
    {/* Outer hex glow */}
    <path d="M40 6L68 22V58L40 74L12 58V22Z" fill="none" stroke="#c8960a" strokeWidth="1" strokeOpacity="0.3"/>
    {/* Helmet base */}
    <path d="M18 54Q18 32 40 28Q62 32 62 54L56 62H24Z" fill="#1a1400"/>
    <path d="M18 54Q18 32 40 28Q62 32 62 54L56 62H24Z" fill="none" stroke="#d4a010" strokeWidth="1.2" strokeOpacity="0.7"/>
    {/* Helmet top dome */}
    <path d="M24 42Q22 24 40 20Q58 24 56 42Z" fill="#111000"/>
    <path d="M24 42Q22 24 40 20Q58 24 56 42Z" fill="none" stroke="#c8960a" strokeWidth="1" strokeOpacity="0.5"/>
    {/* Visor — amber glow */}
    <path d="M26 40Q26 34 40 33Q54 34 54 40Q54 48 40 49Q26 48 26 40Z" fill="#c8780a" fillOpacity="0.18"/>
    <path d="M26 40Q26 34 40 33Q54 34 54 40Q54 48 40 49Q26 48 26 40Z" fill="none" stroke="#e8a020" strokeWidth="1.5"/>
    {/* Visor inner glow lines */}
    <line x1="30" y1="39" x2="50" y2="39" stroke="#f0c040" strokeWidth="0.8" strokeOpacity="0.6"/>
    <line x1="30" y1="42" x2="50" y2="42" stroke="#f0c040" strokeWidth="0.5" strokeOpacity="0.35"/>
    {/* Center eye */}
    <ellipse cx="40" cy="41" rx="4" ry="3" fill="#c88010" fillOpacity="0.9"/>
    <ellipse cx="40" cy="41" rx="2" ry="1.8" fill="#ffe060"/>
    <circle cx="40" cy="41" r="0.8" fill="white" fillOpacity="0.9"/>
    {/* Circuit lines on helmet */}
    <path d="M24 50L20 48M36 62L32 68M44 62L48 68" stroke="#d4a010" strokeWidth="0.8" strokeOpacity="0.5"/>
    <circle cx="20" cy="48" r="1.5" fill="#d4a010" fillOpacity="0.6"/>
    {/* Crown spikes */}
    <path d="M28 25L26 16L32 22M40 22L40 12M52 25L54 16L48 22" fill="none" stroke="#e8c040" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="26" cy="16" r="2" fill="#ffd700"/>
    <circle cx="40" cy="12" r="2.2" fill="#ffd700"/>
    <circle cx="54" cy="16" r="2" fill="#ffd700"/>
    {/* Neck / collar */}
    <path d="M30 62H50L52 70H28Z" fill="#1a1400" stroke="#d4a010" strokeWidth="0.8" strokeOpacity="0.5"/>
  </svg>
);

const AvatarSilver = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="80" height="80" rx="40" fill="#040c14"/>
    {/* Outer ring */}
    <circle cx="40" cy="40" r="34" fill="none" stroke="#2a8aaa" strokeWidth="0.8" strokeOpacity="0.35"/>
    {/* Hood shape */}
    <path d="M15 80Q14 54 22 46Q26 42 40 40Q54 42 58 46Q66 54 65 80Z" fill="#061420"/>
    <path d="M15 80Q14 54 22 46Q26 42 40 40Q54 42 58 46Q66 54 65 80Z" fill="none" stroke="#18a0c0" strokeWidth="0.8" strokeOpacity="0.4"/>
    {/* Face mask upper */}
    <path d="M24 36Q24 18 40 16Q56 18 56 36Z" fill="#080e18"/>
    {/* Visor — cyan neon */}
    <path d="M27 38Q27 30 40 29Q53 30 53 38Q53 47 40 47.5Q27 47 27 38Z" fill="#00aacc" fillOpacity="0.12"/>
    <path d="M27 38Q27 30 40 29Q53 30 53 38Q53 47 40 47.5Q27 47 27 38Z" fill="none" stroke="#00d4ff" strokeWidth="1.4"/>
    {/* Scan line */}
    <line x1="28" y1="37" x2="52" y2="37" stroke="#40e0ff" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="30" y1="40" x2="50" y2="40" stroke="#40e0ff" strokeWidth="0.6" strokeOpacity="0.4"/>
    {/* Dual eyes — cyan */}
    <ellipse cx="34" cy="37" rx="3.5" ry="2.5" fill="#00aacc" fillOpacity="0.25"/>
    <ellipse cx="34" cy="37" rx="2" ry="1.5" fill="#40e8ff"/>
    <ellipse cx="46" cy="37" rx="3.5" ry="2.5" fill="#00aacc" fillOpacity="0.25"/>
    <ellipse cx="46" cy="37" rx="2" ry="1.5" fill="#40e8ff"/>
    {/* Data chip on cheek */}
    <rect x="21" y="38" width="5" height="3" rx="0.5" fill="#0a1c2a" stroke="#18a0c0" strokeWidth="0.7"/>
    <line x1="22" y1="39.5" x2="25" y2="39.5" stroke="#18c0e0" strokeWidth="0.6"/>
    {/* Collar tech detail */}
    <path d="M28 48H52L54 56H26Z" fill="#080e18" stroke="#18a0c0" strokeWidth="0.8" strokeOpacity="0.5"/>
    <line x1="32" y1="52" x2="48" y2="52" stroke="#18c0e0" strokeWidth="0.6" strokeOpacity="0.5"/>
    {/* Hood line down sides */}
    <path d="M24 36Q20 44 22 50" stroke="#18a0c0" strokeWidth="1" strokeOpacity="0.4" fill="none"/>
    <path d="M56 36Q60 44 58 50" stroke="#18a0c0" strokeWidth="1" strokeOpacity="0.4" fill="none"/>
  </svg>
);

const AvatarBronze = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="80" height="80" rx="40" fill="#0e0808"/>
    {/* Outer diamond frame */}
    <path d="M40 8L64 32L64 48L40 72L16 48L16 32Z" fill="none" stroke="#8040c0" strokeWidth="0.8" strokeOpacity="0.35"/>
    {/* Neural mesh helmet */}
    <path d="M20 52Q18 32 40 26Q62 32 60 52L52 64H28Z" fill="#120a18"/>
    <path d="M20 52Q18 32 40 26Q62 32 60 52L52 64H28Z" fill="none" stroke="#7030a8" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Neural grid overlay on helmet */}
    <path d="M28 34L40 30L52 34M26 40L40 36L54 40M28 46L40 43L52 46" stroke="#9050d0" strokeWidth="0.5" strokeOpacity="0.35" fill="none"/>
    {/* Visor — purple glow */}
    <path d="M27 40Q27 33 40 32Q53 33 53 40Q53 48 40 49Q27 48 27 40Z" fill="#7030a8" fillOpacity="0.15"/>
    <path d="M27 40Q27 33 40 32Q53 33 53 40Q53 48 40 49Q27 48 27 40Z" fill="none" stroke="#9c50e0" strokeWidth="1.3"/>
    {/* Tri-eye — orange / purple */}
    <ellipse cx="33" cy="40" rx="3" ry="2.2" fill="#6020a0" fillOpacity="0.3"/>
    <ellipse cx="33" cy="40" rx="1.8" ry="1.3" fill="#c060ff"/>
    <ellipse cx="47" cy="40" rx="3" ry="2.2" fill="#6020a0" fillOpacity="0.3"/>
    <ellipse cx="47" cy="40" rx="1.8" ry="1.3" fill="#c060ff"/>
    <circle cx="40" cy="40" r="1.8" fill="#ff7020" fillOpacity="0.9"/>
    <circle cx="40" cy="40" r="0.9" fill="white" fillOpacity="0.95"/>
    {/* Circuit nodes on helmet */}
    <circle cx="24" cy="44" r="1.5" fill="#7030a8" fillOpacity="0.7"/>
    <path d="M24 44L28 46" stroke="#7030a8" strokeWidth="0.7" strokeOpacity="0.6"/>
    <circle cx="56" cy="44" r="1.5" fill="#7030a8" fillOpacity="0.7"/>
    <path d="M56 44L52 46" stroke="#7030a8" strokeWidth="0.7" strokeOpacity="0.6"/>
    {/* Circuit at top */}
    <path d="M34 27L30 20M40 26L40 18M46 27L50 20" stroke="#9050d0" strokeWidth="0.8" strokeOpacity="0.5" strokeLinecap="round"/>
    <circle cx="40" cy="18" r="2" fill="#9050d0" fillOpacity="0.8"/>
    {/* Lower collar */}
    <path d="M30 64H50L52 72H28Z" fill="#120a18" stroke="#7030a8" strokeWidth="0.8" strokeOpacity="0.5"/>
  </svg>
);

const PlayerAvatar = ({ rank }: { rank: number }) => {
  if (rank === 1) return <AvatarGold />;
  if (rank === 2) return <AvatarSilver />;
  if (rank === 3) return <AvatarBronze />;
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
    <div className="min-h-screen bg-transparent relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <AutoPlayVideo src="/videos/SC_7.mp4" loop className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background/92" />
      </div>

      <section className="relative pt-24 pb-20 z-10 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="w-full px-6 md:px-8 xl:px-12 relative z-10">
          <div className="mb-12">
            <div
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
                <p className="text-muted-foreground mt-3 text-lg md:text-xl leading-tight whitespace-nowrap">
                  Climb the ranks. Prove your dominance. Earn eternal glory on-chain.
                </p>

                <div className="flex gap-2 mt-6">
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
                </div>
              </div>

              {/* Video — bottom on mobile/tablet, right on desktop */}
              <div className="order-last w-full lg:w-[500px] flex-shrink-0 pointer-events-none flex items-center">
                <div className="relative overflow-hidden w-full lg:rounded-l-[32px]">
                  <AutoPlayVideo src="/videos/SC_7.mp4" loop className="w-full aspect-[16/9] object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-l from-background/10 via-background/18 to-background/58" />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-transparent to-background/40" />
                </div>
              </div>
            </div>
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
                <div
                  key={p.rank}
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
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div
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
                    <tr
                      key={p.rank}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
