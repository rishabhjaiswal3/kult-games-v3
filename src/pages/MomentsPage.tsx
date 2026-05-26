import { useState } from "react";

import { useCallback, useEffect, useRef } from "react";
import { MOMENTS_IFRAME_URL } from "@/lib/momentsUrl";
import { useAuth } from "@/contexts/AuthContext";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import { momentsApi } from "@/api/momentsApi";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Flame,
  Zap,
  Trophy,
  Swords,
  Target,
  Shield,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Play,
  Clock,
  Hexagon,
  TrendingUp,
  Video,
  ThumbsUp,
  Calendar,
  Loader2,
  Upload,
  X,
} from "lucide-react";

// Asset Imports
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import agentNexus from "@/assets/agent-nexus.jpg";
import agentShadow from "@/assets/agent-shadow.jpg";
import agentAegis from "@/assets/agent-aegis.jpg";
import agentVoid from "@/assets/agent-voidwalker.jpg";
import agentRage from "@/assets/agent-rageborn.jpg";
import agentLumen from "@/assets/agent-lumen.jpg";

import momentWarzone from "@/assets/moment-warzone.png";
import momentRobowars from "@/assets/moment-robowars.png";
import momentFeatured from "@/assets/moment-featured.png";

// Clan Icon helper matching the Leaderboard page
function SolanaIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M64.6 237.9c-2.4-2.4-5.7-3.8-9.1-3.8H3.8c-3.1 0-4.6 3.8-2.4 6l63 63c2.4 2.4 5.7 3.8 9.1 3.8h51.7c3.1 0 4.6-3.8 2.4-6l-63-63z" fill="currentColor" />
      <path d="M332.4 73.1c2.4 2.4 5.7 3.8 9.1 3.8h51.7c3.1 0 4.6-3.8 2.4-6l-63-63c-2.4-2.4-5.7-3.8-9.1-3.8H331.8c-3.1 0-4.6 3.8-2.4 6l63 63z" fill="currentColor" />
      <path d="M271.6 155.5c2.4 2.4 5.7 3.8 9.1 3.8h51.7c3.1 0 4.6-3.8 2.4-6l-63-63c-2.4-2.4-5.7-3.8-9.1-3.8H210.8c-3.1 0-4.6 3.8-2.4 6l63 63z" fill="currentColor" />
    </svg>
  );
}

function BaseIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ZeroGClanIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={zeroGLogo} alt="0G Logo" className={`${className} object-contain`} />;
}

function KultClanIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={kultLogo} alt="Kult Logo" className={`${className} object-contain`} />;
}

function ClanIcon({ type, className = "h-3.5 w-3.5" }: { type: string; className?: string }) {
  if (type === "solana") return <SolanaIcon className={`${className} text-teal-400`} />;
  if (type === "base") return <BaseIcon className={`${className} text-blue-500`} />;
  if (type === "zerog") return <ZeroGClanIcon className={className} />;
  if (type === "kult") return <KultClanIcon className={className} />;
  if (type === "rebel") {
    return (
      <span className="w-3.5 h-3.5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0">
        R
      </span>
    );
  }
  if (type === "shadow") {
    return (
      <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-[9px] shrink-0">
        S
      </span>
    );
  }
  if (type === "mecha") {
    return (
      <span className="w-3.5 h-3.5 rounded-full bg-gray-500/20 text-gray-400 flex items-center justify-center font-bold text-[9px] shrink-0">
        M
      </span>
    );
  }
  return null;
}

interface Moment {
  id: number;
  title: string;
  game: string;
  duration: string;
  creator: string;
  creatorAvatar: string;
  clanName: string;
  clanIconType: string;
  views: string;
  likes: string;
  isBookmarked: boolean;
  category: string;
  thumbnail: string;
  mediaType?: "image" | "video";
  assetUrl?: string;
}

// 8 Moment items matching mockup list
const INITIAL_MOMENTS: Moment[] = [
  {
    id: 1,
    title: "Clutch 1v5 Victory",
    game: "WARZONE WARRIORS",
    duration: "00:45",
    creator: "HYBRID",
    creatorAvatar: agentNexus,
    clanName: "Zerog",
    clanIconType: "zerog",
    views: "12.4K",
    likes: "2.1K",
    isBookmarked: false,
    category: "CLUTCH",
    thumbnail: momentWarzone,
  },
  {
    id: 2,
    title: "Last Bot Standing",
    game: "ROBOWARS",
    duration: "01:12",
    creator: "TACTICIAN",
    creatorAvatar: agentAegis,
    clanName: "Base",
    clanIconType: "base",
    views: "8.7K",
    likes: "1.6K",
    isBookmarked: true,
    category: "TRENDING",
    thumbnail: momentRobowars,
  },
  {
    id: 3,
    title: "Helicopter Rampage",
    game: "WARZONE WARRIORS",
    duration: "00:30",
    creator: "DEFENDER",
    creatorAvatar: agentShadow,
    clanName: "Solana",
    clanIconType: "solana",
    views: "8.7K",
    likes: "1.6K",
    isBookmarked: false,
    category: "EPIC PLAYS",
    thumbnail: momentWarzone,
  },
  {
    id: 4,
    title: "Perfect Counter Attack",
    game: "ROBOWARS",
    duration: "01:45",
    creator: "SUPPORT",
    creatorAvatar: agentVoid,
    clanName: "Zerog",
    clanIconType: "zerog",
    views: "9.3K",
    likes: "1.8K",
    isBookmarked: false,
    category: "TOP PLAYS",
    thumbnail: momentRobowars,
  },
  {
    id: 5,
    title: "Flag Capture Under Fire",
    game: "WARZONE WARRIORS",
    duration: "00:28",
    creator: "IRONFIST",
    creatorAvatar: agentLumen,
    clanName: "Berserker",
    clanIconType: "rebel",
    views: "5.6K",
    likes: "892",
    isBookmarked: false,
    category: "VICTORIES",
    thumbnail: momentWarzone,
  },
  {
    id: 6,
    title: "Double Kill Machine",
    game: "ROBOWARS",
    duration: "01:08",
    creator: "BERSERKER",
    creatorAvatar: agentRage,
    clanName: "Base",
    clanIconType: "base",
    views: "7.1K",
    likes: "1.3K",
    isBookmarked: false,
    category: "KILLS",
    thumbnail: momentRobowars,
  },
  {
    id: 7,
    title: "Sniper God Mode",
    game: "WARZONE WARRIORS",
    duration: "00:37",
    creator: "SPECTER",
    creatorAvatar: agentAegis,
    clanName: "Assassin",
    clanIconType: "shadow",
    views: "4.9K",
    likes: "721",
    isBookmarked: false,
    category: "TRENDING",
    thumbnail: momentWarzone,
  },
  {
    id: 8,
    title: "Comeback of the Century",
    game: "ROBOWARS",
    duration: "02:01",
    creator: "OMEGA PRIME",
    creatorAvatar: agentLumen,
    clanName: "Hybrid",
    clanIconType: "mecha",
    views: "10.2K",
    likes: "2.3K",
    isBookmarked: false,
    category: "CLUTCH",
    thumbnail: momentRobowars,
  },
];

type MainTab = "DISCOVER" | "MY MOMENTS" | "BOOKMARKS" | "RECENTLY WATCHED";
type SubCategory = "TRENDING" | "EPIC PLAYS" | "TOP PLAYS" | "CLUTCH" | "KILLS" | "VICTORIES";

export function MomentsPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("DISCOVER");
  const [activeCategory, setActiveCategory] = useState<SubCategory>("TRENDING");
  const [moments, setMoments] = useState<Moment[]>(INITIAL_MOMENTS);
  const [createOpen, setCreateOpen] = useState(false);

  // Filters State
  const [selectedGame, setSelectedGame] = useState("ALL GAMES");
  const [selectedMode, setSelectedMode] = useState("ALL MODES");
  const [selectedBestOf, setSelectedBestOf] = useState("BEST OF");
  const [selectedTime, setSelectedTime] = useState("ANY TIME");
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown UI triggers
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, login, player } = useAuth();

  const sendAuthToIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const walletAddress = localStorage.getItem(WALLET_KEY);

    iframe.contentWindow.postMessage(
      {
        type: "KULT_AUTH",
        payload: token
          ? { token, player: { walletAddress, name: player?.name ?? null } }
          : null,
      },
      MOMENTS_IFRAME_URL,
    );
  }, [isAuthenticated, player]);

  useEffect(() => {
    sendAuthToIframe();
  }, [sendAuthToIframe]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleDropdownSelect = (dropdown: string, val: string) => {
    if (dropdown === "game") setSelectedGame(val);
    if (dropdown === "mode") setSelectedMode(val);
    if (dropdown === "bestOf") setSelectedBestOf(val);
    if (dropdown === "time") setSelectedTime(val);
    setActiveDropdown(null);
  };

  const handleBookmarkToggle = (id: number) => {
    setMoments(
      moments.map((m) => (m.id === id ? { ...m, isBookmarked: !m.isBookmarked } : m))
    );
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      toast.error("Connect wallet first");
      login();
      return;
    }
    setCreateOpen(true);
  };

  const handleMomentCreated = (moment: Moment) => {
    setMoments((current) => [moment, ...current]);
  };

  // Filter moments array based on Search, Tabs, and Filters
  const filteredMoments = moments.filter((m) => {
    // Search filter
    if (
      searchQuery &&
      !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.creator.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Main Tabs filter
    if (activeTab === "BOOKMARKS" && !m.isBookmarked) return false;
    if (activeTab === "MY MOMENTS") return false; // Mock empty

    // Game filter
    if (selectedGame !== "ALL GAMES") {
      const formattedGame = selectedGame.replace(/\s+/g, "").toUpperCase();
      const formattedMGame = m.game.replace(/\s+/g, "").toUpperCase();
      if (!formattedMGame.includes(formattedGame) && !formattedGame.includes(formattedMGame)) {
        return false;
      }
    }

    return true;
  });

  return (
    <>
      <div className="min-h-full text-foreground bg-transparent">
      {/* Background Glow */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(circle_at_78%_12%,rgba(139,37,255,0.15),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(33,144,255,0.1),transparent_32%)]" />

          <section className="mx-auto max-w-[1284px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_376px]">
              
              {/* Left Column Feed area */}
              <div className="min-w-0 space-y-4">
                
                {/* Header */}
                <div>
                  <h1 className="font-tech text-3xl font-bold tracking-tight text-white">MOMENTS</h1>
                  <p className="mt-1 text-[11px] text-white/55 font-medium">
                    Epic plays, insane clutches, and legendary victories. Replay and share your best battles.
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="flex h-9 items-center gap-2 rounded border border-purple-500/35 bg-purple-600/18 px-4 text-[10px] font-tech font-black uppercase tracking-wider text-purple-100 shadow-[0_0_18px_rgba(154,53,255,0.12)] transition hover:border-purple-400/70 hover:bg-purple-600/28"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Create Moment
                  </button>
                </div>

                {/* Sub Navigation tabs */}
                <div className="border-b border-white/8 flex items-center gap-6 text-xs font-bold tracking-wide select-none">
                  {(["DISCOVER", "MY MOMENTS", "BOOKMARKS", "RECENTLY WATCHED"] as MainTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2.5 relative transition-all uppercase cursor-pointer hover:text-white ${
                        activeTab === tab ? "text-white" : "text-white/45"
                      }`}
                    >
                      <span>{tab}</span>
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a35ff]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 relative z-30">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* ALL GAMES Filter */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown("game")}
                        className="bg-[#0a0f1b]/60 border border-white/8 rounded px-3 py-1.5 text-[10px] uppercase font-tech font-bold text-white/70 flex items-center justify-between gap-2.5 cursor-pointer hover:border-white/15 hover:text-white transition h-[34px]"
                      >
                        <span>{selectedGame}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                      </button>
                      {activeDropdown === "game" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("game")} />
                          <div className="absolute left-0 mt-1 w-48 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl z-50">
                            {["ALL GAMES", "WARZONE WARRIORS", "ROBOWARS", "HIGHWAY HUSTLE"].map((g) => (
                              <button
                                key={g}
                                onClick={() => handleDropdownSelect("game", g)}
                                className={`w-full text-left rounded px-2.5 py-1.5 text-[10px] uppercase font-tech font-bold transition hover:bg-white/5 hover:text-white ${
                                  selectedGame === g ? "text-purple-400 bg-white/[0.02]" : "text-white/60"
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* ALL MODES Filter */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown("mode")}
                        className="bg-[#0a0f1b]/60 border border-white/8 rounded px-3 py-1.5 text-[10px] uppercase font-tech font-bold text-white/70 flex items-center justify-between gap-2.5 cursor-pointer hover:border-white/15 hover:text-white transition h-[34px]"
                      >
                        <span>{selectedMode}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                      </button>
                      {activeDropdown === "mode" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("mode")} />
                          <div className="absolute left-0 mt-1 w-44 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl z-50">
                            {["ALL MODES", "1V1 ARENA", "5V5 SHOWDOWN", "AUTONOMOUS"].map((m) => (
                              <button
                                key={m}
                                onClick={() => handleDropdownSelect("mode", m)}
                                className={`w-full text-left rounded px-2.5 py-1.5 text-[10px] uppercase font-tech font-bold transition hover:bg-white/5 hover:text-white ${
                                  selectedMode === m ? "text-purple-400 bg-white/[0.02]" : "text-white/60"
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* BEST OF Filter */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown("bestOf")}
                        className="bg-[#0a0f1b]/60 border border-white/8 rounded px-3 py-1.5 text-[10px] uppercase font-tech font-bold text-white/70 flex items-center justify-between gap-2.5 cursor-pointer hover:border-white/15 hover:text-white transition h-[34px]"
                      >
                        <span>{selectedBestOf}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                      </button>
                      {activeDropdown === "bestOf" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("bestOf")} />
                          <div className="absolute left-0 mt-1 w-44 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl z-50">
                            {["BEST OF", "MOST VIEWS", "MOST LIKES", "TOP CREATORS"].map((b) => (
                              <button
                                key={b}
                                onClick={() => handleDropdownSelect("bestOf", b)}
                                className={`w-full text-left rounded px-2.5 py-1.5 text-[10px] uppercase font-tech font-bold transition hover:bg-white/5 hover:text-white ${
                                  selectedBestOf === b ? "text-purple-400 bg-white/[0.02]" : "text-white/60"
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* TIME Filter */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown("time")}
                        className="bg-[#0a0f1b]/60 border border-white/8 rounded px-3 py-1.5 text-[10px] uppercase font-tech font-bold text-white/70 flex items-center justify-between gap-2.5 cursor-pointer hover:border-white/15 hover:text-white transition h-[34px]"
                      >
                        <span>{selectedTime}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                      </button>
                      {activeDropdown === "time" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("time")} />
                          <div className="absolute left-0 mt-1 w-44 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl z-50">
                            {["ANY TIME", "LAST 24 HOURS", "THIS WEEK", "THIS MONTH"].map((t) => (
                              <button
                                key={t}
                                onClick={() => handleDropdownSelect("time", t)}
                                className={`w-full text-left rounded px-2.5 py-1.5 text-[10px] uppercase font-tech font-bold transition hover:bg-white/5 hover:text-white ${
                                  selectedTime === t ? "text-purple-400 bg-white/[0.02]" : "text-white/60"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                  </div>

                  {/* Search and Sliders filter icons */}
                  <div className="flex items-center gap-2 max-sm:w-full">
                    <div className="relative max-sm:flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search moments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#0a0f1b]/60 border border-white/8 rounded pl-9 pr-3 py-1.5 text-xs text-white/86 placeholder-white/30 focus:outline-none focus:border-purple-500/50 w-[200px] max-sm:w-full h-[34px] transition"
                      />
                    </div>
                    <button className="bg-[#0a0f1b]/60 border border-white/8 rounded p-2 text-white/60 hover:text-white hover:border-white/15 transition cursor-pointer flex items-center justify-center h-[34px] w-[34px]">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategory Pills Row */}
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 pt-1 relative z-10">
                  {[
                    { label: "TRENDING", icon: Flame, desc: "Most popular" },
                    { label: "EPIC PLAYS", icon: Zap, desc: "Insane plays" },
                    { label: "TOP PLAYS", icon: Trophy, desc: "Community voted" },
                    { label: "CLUTCH", icon: Swords, desc: "1vX & Comebacks" },
                    { label: "KILLS", icon: Target, desc: "Multi kills" },
                    { label: "VICTORIES", icon: Shield, desc: "Epic wins" },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.label;
                    return (
                      <button
                        key={cat.label}
                        onClick={() => setActiveCategory(cat.label as SubCategory)}
                        className={`arena-panel flex flex-col items-start p-3 text-left transition cursor-pointer flex-1 min-w-[100px] border-white/8 bg-[#04080f]/90 ${
                          isActive
                            ? "border-purple-500/40 bg-gradient-to-br from-purple-950/40 to-purple-900/10 shadow-[0_0_12px_rgba(154,53,255,0.1)]"
                            : "hover:bg-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#b95cff]" : "text-white/45"}`} />
                          <span className="font-tech text-[10px] font-bold tracking-wider">{cat.label}</span>
                        </div>
                        <span className="mt-1 text-[8px] font-semibold text-white/45 leading-none uppercase">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Trending Grid Title */}
                <div className="flex items-center justify-between pt-3">
                  <h2 className="font-tech text-xs tracking-wider uppercase font-semibold text-white/86">
                    {activeCategory} MOMENTS
                  </h2>
                  <button className="text-[10px] text-purple-400 font-tech font-bold uppercase tracking-wider hover:text-purple-300 transition">
                    View All &rarr;
                  </button>
                </div>

                {/* Moments Grid Feed (8 Cards) */}
                {filteredMoments.length === 0 ? (
                  <div className="arena-panel p-12 text-center border-white/8 bg-[#04080f]/80">
                    <Video className="h-10 w-10 text-white/20 mx-auto" />
                    <p className="mt-3 text-sm font-semibold text-white/60">No moments found matching filters</p>
                    <button
                      onClick={() => {
                        setSelectedGame("ALL GAMES");
                        setSelectedMode("ALL MODES");
                        setSearchQuery("");
                      }}
                      className="mt-4 text-[10px] font-tech font-bold uppercase text-purple-400 border border-purple-500/25 rounded px-4 py-2 hover:bg-purple-500/10 transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMoments.map((item) => (
                      <div key={item.id} className="flex flex-col">
                        
                        {/* Hover Playable Thumbnail Video Card */}
                        <div className="relative aspect-[16/9] rounded overflow-hidden bg-black/40 border border-white/8 group cursor-pointer">
                          
                          {item.mediaType === "video" && item.assetUrl ? (
                            <video
                              src={item.assetUrl}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          )}
                          
                          {/* Dark overlay backdrop */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:via-black/30 transition-all duration-300" />
                          
                          {/* Game Mode label badge */}
                          <div
                            className={`absolute top-3 left-3 text-[9px] font-tech font-black px-2 py-0.5 rounded tracking-wide border uppercase select-none ${
                              item.game === "ROBOWARS"
                                ? "bg-sky-950/80 border-sky-500/35 text-sky-400"
                                : "bg-purple-950/80 border-purple-500/35 text-[#d6acff]"
                            }`}
                          >
                            {item.game === "ROBOWARS" ? "ROBOWARS" : "WARZONE WARRIORS"}
                          </div>

                          {/* Video Duration Badge */}
                          <div className="absolute top-3 right-3 bg-[#03070d]/80 border border-white/10 text-white text-[9px] font-tech font-black px-1.5 py-0.5 rounded tracking-wide">
                            {item.duration}
                          </div>

                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#9a35ff] group-hover:border-purple-400 group-hover:shadow-[0_0_15px_rgba(154,53,255,0.45)] transition duration-300">
                              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                            </div>
                          </div>

                        </div>

                        {/* Title and stats detail */}
                        <div className="mt-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-sm text-white/90 leading-snug hover:text-purple-400 transition cursor-pointer truncate">
                              {item.title}
                            </h3>
                            <div className="mt-1.5 flex items-center justify-between">
                              
                              {/* Creator line */}
                              <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                                <span>by {item.creator}</span>
                                <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                              </div>

                              {/* Clan Name and Icon */}
                              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                <ClanIcon type={item.clanIconType} className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate max-w-[90px]">{item.clanName}</span>
                              </div>

                            </div>
                          </div>

                          {/* Stats footer row */}
                          <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between text-xs text-white/45 font-semibold">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-white/30" />
                                <span>{item.views}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-white/30 hover:text-red-500 transition cursor-pointer" />
                                <span>{item.likes}</span>
                              </span>
                            </div>
                            <button
                              onClick={() => handleBookmarkToggle(item.id)}
                              className="text-white/30 hover:text-purple-400 transition cursor-pointer"
                            >
                              <Bookmark
                                className={`h-4 w-4 ${
                                  item.isBookmarked ? "fill-purple-500 text-purple-500" : ""
                                }`}
                              />
                            </button>
                          </div>

                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* Load More moments bar */}
                <div className="flex justify-center pt-4 relative z-10">
                  <button className="bg-[#0a0f1b]/60 border border-white/8 hover:border-purple-500/30 hover:bg-purple-950/10 rounded px-6 py-2.5 text-[10px] font-tech font-bold uppercase tracking-wider text-purple-400/90 transition cursor-pointer flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 animate-bounce" />
                    <span>LOAD MORE MOMENTS</span>
                  </button>
                </div>

              </div>

              {/* Right Column sidebar info details */}
              <aside className="space-y-4">
                
                {/* FEATURED MOMENT card */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                    FEATURED MOMENT
                  </h3>
                  
                  {/* Aspect video player card */}
                  <div className="relative aspect-[16/10] rounded overflow-hidden bg-black/40 border border-white/8 group cursor-pointer">
                    <img
                      src={momentFeatured}
                      alt="Featured Moment"
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 text-[8px] font-tech font-black px-2 py-0.5 rounded tracking-wide border bg-sky-950/80 border-sky-500/35 text-sky-400 uppercase select-none">
                      ROBOWARS
                    </div>

                    <div className="absolute top-3 right-3 bg-[#03070d]/80 border border-white/10 text-white text-[8px] font-tech font-black px-1.5 py-0.5 rounded tracking-wide">
                      01:28
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#9a35ff] group-hover:border-purple-400 group-hover:shadow-[0_0_15px_rgba(154,53,255,0.5)] transition duration-300">
                        <Play className="h-5.5 w-5.5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Creator details and description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white hover:text-purple-400 cursor-pointer transition">
                        Unstoppable Dominance
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-white/50">
                        <span>by HYBRID</span>
                        <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-white/55 font-medium">
                      Perfect strategy, flawless execution. That's how legends are made.
                    </p>
                  </div>

                  {/* Share Stats */}
                  <div className="pt-3 border-t border-white/6 flex items-center justify-between text-[10px] text-white/45 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-white/30" />
                      <span>15.2K</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-white/30" />
                      <span>2.8K</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Share2 className="h-4 w-4 text-white/30 hover:text-purple-400 cursor-pointer" />
                      <span>345</span>
                    </span>
                  </div>

                  {/* Glow purple watch button */}
                  <button className="w-full bg-[#9a35ff] hover:bg-[#8525eb] text-white text-[10px] font-tech font-bold uppercase tracking-wider py-2.5 rounded shadow-[0_0_15px_rgba(154,53,255,0.3)] hover:shadow-[0_0_20px_rgba(154,53,255,0.5)] transition flex items-center justify-center gap-2 cursor-pointer">
                    <span>WATCH NOW</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                </div>

                {/* MOMENTS STATS card */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                    MOMENTS STATS
                  </h3>

                  <div className="divide-y divide-white/6 text-[11px] font-medium">
                    
                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5 text-white/55">
                        <Video className="h-4 w-4 text-white/30" />
                        <span>Total Moments</span>
                      </div>
                      <span className="font-tech font-bold text-white">1,268</span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5 text-white/55">
                        <Calendar className="h-4 w-4 text-white/30" />
                        <span>This Week</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-tech font-bold text-white">156</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded text-[8px] ml-1 select-none animate-pulse">
                          +18%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5 text-white/55">
                        <Eye className="h-4 w-4 text-white/30" />
                        <span>Total Views</span>
                      </div>
                      <span className="font-tech font-bold text-white">2.48M</span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5 text-white/55">
                        <ThumbsUp className="h-4 w-4 text-white/30" />
                        <span>Total Likes</span>
                      </div>
                      <span className="font-tech font-bold text-white">412K</span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5 text-white/55">
                        <Clock className="h-4 w-4 text-white/30" />
                        <span>Avg. Watch Time</span>
                      </div>
                      <span className="font-tech font-bold text-white">00:47</span>
                    </div>

                  </div>
                </div>

                {/* TOP CREATORS card */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                      TOP CREATORS
                    </h3>
                    <button className="text-[10px] text-purple-400 font-tech font-bold uppercase tracking-wider hover:text-purple-300 transition">
                      View All
                    </button>
                  </div>

                  <div className="space-y-3 font-semibold text-xs">
                    {[
                      { rank: 1, name: "HYBRID", avatar: agentNexus, views: "12.4K" },
                      { rank: 2, name: "TACTICIAN", avatar: agentAegis, views: "9.8K" },
                      { rank: 3, name: "DEFENDER", avatar: agentShadow, views: "7.6K" },
                      { rank: 4, name: "SUPPORT", avatar: agentVoid, views: "6.3K" },
                      { rank: 5, name: "BERSERKER", avatar: agentRage, views: "5.9K" },
                    ].map((creator) => (
                      <div key={creator.rank} className="flex items-center justify-between py-0.5 hover:bg-white/[0.01] transition">
                        
                        <div className="flex items-center gap-3">
                          <span className="font-tech text-[10px] font-black text-white/45 w-3 text-center">
                            {creator.rank}
                          </span>
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-white/5">
                            <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center gap-1 text-white/90">
                            <span>{creator.name}</span>
                            <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-white/55">
                          <Eye className="h-3.5 w-3.5 text-white/30" />
                          <span>{creator.views}</span>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>

              </aside>

            </div>
          </section>
      </div>
      <CreateMomentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleMomentCreated}
      />
    </>
  );
}

export default MomentsPage;

type CreateMomentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (moment: Moment) => void;
};

const ACCEPTED_MOMENT_MEDIA = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm";

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function CreateMomentDialog({ open, onOpenChange, onCreated }: CreateMomentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [game, setGame] = useState("WARZONE WARRIORS");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = (revokePreview = true) => {
    setTitle("");
    setDescription("");
    setTags("");
    setGame("WARZONE WARRIORS");
    setFile(null);
    setDuration(null);
    if (revokePreview && previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (nextFile: File | undefined) => {
    if (!nextFile) return;
    if (!ACCEPTED_MOMENT_MEDIA.split(",").includes(nextFile.type)) {
      toast.error("Use JPG, PNG, GIF, WebP, MP4, or WebM");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setPreviewUrl(objectUrl);
    setDuration(null);

    if (nextFile.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const seconds = video.duration;
        if (!Number.isFinite(seconds) || seconds <= 0) {
          toast.error("Could not read video duration");
          reset();
          return;
        }
        if (seconds > 60) {
          toast.error("Video clips must be 60 seconds or shorter");
          reset();
          return;
        }
        setDuration(seconds);
      };
      video.onerror = () => {
        toast.error("Could not read video metadata");
        reset();
      };
      video.src = objectUrl;
    }
  };

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    if (!file) {
      toast.error("Choose an image or video clip");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await momentsApi.createFromFile({
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim().replace(/^#/, ""))
          .filter(Boolean)
          .slice(0, 10),
        relatedGames: [game.toLowerCase().replace(/\s+/g, "-")],
        assetFile: file,
      });

      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      const localUrl = previewUrl ?? "";
      onCreated({
        id: Date.now(),
        title: title.trim(),
        game,
        duration: mediaType === "video" ? formatDuration(duration ?? 0) : "00:00",
        creator: "YOU",
        creatorAvatar: agentNexus,
        clanName: "Kult",
        clanIconType: "kult",
        views: "0",
        likes: "0",
        isBookmarked: false,
        category: "RECENT",
        thumbnail: mediaType === "image" ? localUrl : momentFeatured,
        mediaType,
        assetUrl: localUrl,
      });

      toast.success("Moment created", { description: result.momentId });
      onOpenChange(false);
      reset(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create moment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-white/10 bg-[#050914] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <h2 className="font-tech text-sm font-black uppercase tracking-wider text-white">Create Moment</h2>
            <p className="mt-1 text-[11px] text-white/45">Share an image, GIF, or video clip up to 60 seconds.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 text-white/50 hover:text-white"
            aria-label="Close create moment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded border border-dashed border-white/15 bg-white/[0.03] text-left transition hover:border-purple-400/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_MOMENT_MEDIA}
              onChange={(event) => handleFile(event.target.files?.[0])}
              className="hidden"
            />
            {previewUrl ? (
              file?.type.startsWith("video/") ? (
                <video src={previewUrl} className="h-full w-full object-cover" controls playsInline preload="metadata" />
              ) : (
                <img src={previewUrl} alt="Moment preview" className="h-full w-full object-cover" />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-7 w-7 text-purple-300" />
                <span className="text-xs font-bold text-white/75">Choose media</span>
                <span className="text-[10px] text-white/38">JPG, PNG, GIF, WebP, MP4, WebM</span>
              </div>
            )}
          </button>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            placeholder="Moment title"
            className="h-10 w-full rounded border border-white/10 bg-[#080d19] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-400/60"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Describe the play..."
            className="w-full resize-none rounded border border-white/10 bg-[#080d19] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-400/60"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={game}
              onChange={(event) => setGame(event.target.value)}
              className="h-10 rounded border border-white/10 bg-[#080d19] px-3 text-xs font-bold uppercase text-white outline-none focus:border-purple-400/60"
            >
              <option>WARZONE WARRIORS</option>
              <option>ROBOWARS</option>
              <option>HIGHWAY HUSTLE</option>
            </select>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Tags, comma separated"
              className="h-10 rounded border border-white/10 bg-[#080d19] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-400/60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/8 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            className="h-9 rounded border border-white/10 px-4 text-[10px] font-tech font-bold uppercase text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="flex h-9 items-center gap-2 rounded bg-purple-600 px-4 text-[10px] font-tech font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
