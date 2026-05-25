import { useState } from "react";
import {
  Trophy,
  Award,
  Zap,
  Target,
  Shield,
  Lock,
  CheckCircle,
  Eye,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Flame,
  Swords,
  Package,
  Layers,
  Sparkles,
  Hexagon,
  HelpCircle,
} from "lucide-react";

// Asset Imports
import rewardCrate from "@/assets/reward-crate.png";


const AchievementsPage = () => {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const tabs = ["OVERVIEW", "ALL ACHIEVEMENTS", "IN PROGRESS", "COMPLETED", "LOCKED"];

  const categories = [
    { name: "BATTLES", icon: Swords, count: 24, total: 45, color: "border-purple-500/20 text-[#b85eff] bg-purple-950/10" },
    { name: "AGENTS", icon: Hexagon, count: 8, total: 20, color: "border-blue-500/20 text-blue-400 bg-blue-950/10" },
    { name: "TRAINING", icon: Zap, count: 6, total: 15, color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/10" },
    { name: "AUTONOMOUS", icon: Flame, count: 4, total: 12, color: "border-amber-500/20 text-amber-400 bg-amber-950/10" },
    { name: "COLLECTION", icon: Package, count: 3, total: 15, color: "border-indigo-500/20 text-indigo-400 bg-indigo-950/10" },
    { name: "SPECIAL", icon: StarIcon, count: 0, total: 21, color: "border-white/10 text-white/40 bg-white/5" },
  ];

  const achievements = [
    {
      id: 1,
      name: "FIRST BLOOD",
      desc: "Win your first battle in any game mode.",
      points: 50,
      unlocked: true,
      unlockedDate: "May 12, 2024",
      icon: Swords,
      color: "from-purple-500/20 to-purple-950/40 border-purple-500/40 text-purple-400",
    },
    {
      id: 2,
      name: "SHARP SHOOTER",
      desc: "Achieve a 10 kill streak in Warzone Warriors.",
      points: 100,
      unlocked: true,
      unlockedDate: "May 14, 2024",
      icon: Target,
      color: "from-emerald-500/20 to-emerald-950/40 border-emerald-500/40 text-emerald-400",
    },
    {
      id: 3,
      name: "ARENA DOMINATOR",
      desc: "Win 50 battles in any game mode.",
      points: 200,
      unlocked: true,
      unlockedDate: "May 18, 2024",
      icon: Shield,
      color: "from-blue-500/20 to-blue-950/40 border-blue-500/40 text-blue-400",
    },
    {
      id: 4,
      name: "CHAMPION",
      desc: "Reach top 1 on the leaderboard.",
      points: 500,
      unlocked: true,
      unlockedDate: "May 12, 2024",
      icon: Trophy,
      color: "from-amber-500/20 to-amber-950/40 border-amber-500/40 text-amber-400",
    },
    {
      id: 5,
      name: "UNSTOPPABLE",
      desc: "Win 100 battles without losing.",
      points: 300,
      unlocked: false,
      icon: Swords,
      color: "from-white/5 to-white/10 border-white/8 text-white/30",
    },
    {
      id: 6,
      name: "MECH MASTER",
      desc: "Win 25 battles in RoboWars.",
      points: 150,
      unlocked: false,
      icon: Target,
      color: "from-white/5 to-white/10 border-white/8 text-white/30",
    },
    {
      id: 7,
      name: "AI OVERLORD",
      desc: "Train an agent to level 50.",
      points: 250,
      unlocked: false,
      icon: Zap,
      color: "from-white/5 to-white/10 border-white/8 text-white/30",
    },
    {
      id: 8,
      name: "COLLECTOR",
      desc: "Collect 50 rare items.",
      points: 100,
      unlocked: false,
      icon: Package,
      color: "from-white/5 to-white/10 border-white/8 text-white/30",
    },
  ];

  function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }

  // Filter Logic
  const filteredAchievements = achievements.filter((item) => {
    const matchesTab =
      activeTab === "OVERVIEW" ||
      activeTab === "ALL ACHIEVEMENTS" ||
      (activeTab === "COMPLETED" && item.unlocked) ||
      (activeTab === "LOCKED" && !item.unlocked) ||
      (activeTab === "IN PROGRESS" && !item.unlocked);

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-full text-foreground bg-transparent">
      {/* Background Glow */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(circle_at_80%_15%,rgba(155,51,255,0.12),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(33,150,255,0.06),transparent_35%)]" />

          <section className="mx-auto max-w-[1284px] px-4 py-5 sm:px-6 lg:px-8 space-y-4">
            
            {/* Top Title Section */}
            <div>
              <h1 className="font-tech text-3xl font-bold tracking-tight text-white uppercase">ACHIEVEMENTS</h1>
              <p className="mt-1 text-[11px] text-white/55 font-medium">
                Complete challenges, unlock achievements, and earn exclusive rewards.
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">ACHIEVEMENT POINTS</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tech text-xl font-bold text-white">2,450</span>
                    <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1 py-0.5 rounded select-none">
                      +150 this week
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Award className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">ACHIEVEMENTS UNLOCKED</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-tech text-xl font-bold text-white">45 / 128</span>
                    <span className="text-[10px] text-white/45">35%</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Trophy className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">CATEGORIES COMPLETED</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-tech text-xl font-bold text-white">6 / 12</span>
                    <span className="text-[10px] text-white/45">50%</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Next Reward Progress */}
              <div className="arena-panel p-4 border-white/8 bg-[#04080f]/90 flex flex-col justify-between">
                <div className="flex justify-between text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">
                  <span>NEXT REWARD</span>
                  <span className="text-white/60">2,800 PTS</span>
                </div>
                <div className="space-y-1.5 mt-1.5">
                  <div className="flex justify-between items-baseline text-[10px] font-semibold text-white/70">
                    <span>Legendary Crate</span>
                    <span className="font-tech text-[9px]">350 / 2,800</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-[#9a35ff] h-full rounded-full" style={{ width: "35%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Strip */}
            <div className="arena-panel p-3 border-white/8 bg-[#04080f]/95 flex flex-wrap items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider transition ${
                      activeTab === tab
                        ? "bg-[#9a35ff] text-white"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2 max-sm:w-full">
                {/* Search */}
                <div className="relative max-sm:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#03070d]/60 border border-white/8 rounded pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/20 focus:border-purple-500/50 outline-none w-[180px] max-sm:w-full transition font-semibold"
                  />
                </div>

                {/* Category selector */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#03070d]/60 border border-white/8 rounded px-3 py-1.5 text-xs text-white/70 hover:text-white font-semibold outline-none appearance-none pr-8 cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Battles">Battles</option>
                    <option value="Agents">Agents</option>
                    <option value="Training">Training</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="Collection">Collection</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/35 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Main Content Layout Grid */}
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_376px]">
              
              {/* Left Column achievements content */}
              <div className="min-w-0 space-y-4">
                
                {/* Categories progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                      ACHIEVEMENT CATEGORIES
                    </h3>
                    <button className="text-[10px] text-purple-400 font-tech font-bold uppercase tracking-wider hover:text-purple-300 transition cursor-pointer">
                      View All Categories
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat, i) => {
                      const Icon = cat.icon;
                      const pct = Math.round((cat.count / cat.total) * 100);
                      return (
                        <div key={i} className={`arena-panel p-4 border-white/8 bg-[#04080f]/95 flex flex-col justify-between space-y-3`}>
                          <div className="flex items-center justify-between">
                            <span className="font-tech text-xs font-bold text-white uppercase">{cat.name}</span>
                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${cat.color}`}>
                              <Icon className="h-3.5 w-3.5 fill-current" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-baseline text-[10px] font-semibold text-white/50">
                              <span className="font-tech font-bold text-white/70">{cat.count} / {cat.total}</span>
                              <span className="font-tech">{pct}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="bg-[#9a35ff] h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Achievements List */}
                <div className="space-y-3">
                  <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                    RECENT ACHIEVEMENTS
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredAchievements.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl p-5 border bg-gradient-to-br from-[#0a0f1b]/95 to-[#04080f]/95 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300 relative overflow-visible group hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 border-white/10 ${
                            !item.unlocked ? "opacity-60" : ""
                          }`}
                        >
                          {/* Inner glow shadow for completed items */}
                          {item.unlocked && (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl pointer-events-none transition group-hover:opacity-100 opacity-50" />
                          )}

                          {/* Lock Overlays */}
                          {!item.unlocked && (
                            <div className="absolute top-3 right-3 bg-black/60 border border-white/10 text-white/50 text-[10px] font-tech font-black px-2 py-1 rounded-md tracking-widest select-none flex items-center gap-1.5 z-10">
                              <Lock className="h-3 w-3" />
                              <span>LOCKED</span>
                            </div>
                          )}

                          {/* Achievement badge/logo */}
                          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 relative bg-gradient-to-br shadow-inner ${item.color}`}>
                            <Icon className="h-7 w-7 fill-current drop-shadow-md" />
                            {item.unlocked && (
                              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#04080f] flex items-center justify-center text-white shadow-sm z-10">
                                <CheckCircle className="h-3 w-3 fill-current" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col h-full justify-center">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-bold text-sm text-white leading-tight uppercase truncate drop-shadow-sm">
                                {item.name}
                              </h4>
                              {item.unlocked && (
                                <span className="text-[10px] text-white/50 font-semibold uppercase font-tech tracking-wider select-none shrink-0">
                                  {item.unlockedDate}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed font-medium mb-3">
                              {item.desc}
                            </p>
                            
                            {/* Points badge */}
                            <div className="mt-auto flex items-center gap-1.5 text-[11px] font-bold font-tech text-[#b85eff] bg-[#b85eff]/10 self-start px-2.5 py-1 rounded-md border border-[#b85eff]/20">
                              <span className="drop-shadow-sm">+{item.points} PTS</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button className="bg-[#0a0f1b]/60 border border-white/8 hover:border-purple-500/35 hover:bg-purple-950/10 text-purple-400 text-[10px] font-tech font-bold uppercase tracking-wider px-6 py-2.5 rounded transition flex items-center gap-1.5 cursor-pointer">
                    <span>VIEW ALL ACHIEVEMENTS</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>

              {/* Right Column sidebar details */}
              <aside className="space-y-4">
                
                {/* ACHIEVEMENT OVERVIEW Donut Chart */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                    ACHIEVEMENT OVERVIEW
                  </h3>

                  {/* SVG Donut Chart */}
                  <div className="flex justify-center items-center py-2 relative">
                    <svg className="w-full max-w-[150px] aspect-square" viewBox="0 0 100 100">
                      {/* Background circle ring */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="10" />

                      {/* Segments: Common 62%, Rare 22%, Epic 11%, Legendary 5% */}
                      {/* Radius: 38. Circumference = 238.76 */}
                      
                      {/* Common (62%): stroke-dasharray="148.0 238.76" color: #64748b */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#64748b" strokeWidth="10" strokeDasharray="148.0 238.76" strokeDashoffset="0" transform="rotate(-90 50 50)" />

                      {/* Rare (22%): stroke-dasharray="52.5 238.76" stroke-dashoffset="-148.0" color: #3b82f6 */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="52.5 238.76" strokeDashoffset="-148.0" transform="rotate(-90 50 50)" />

                      {/* Epic (11%): stroke-dasharray="26.3 238.76" stroke-dashoffset="-200.5" color: #9a35ff */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#9a35ff" strokeWidth="10" strokeDasharray="26.3 238.76" strokeDashoffset="-200.5" transform="rotate(-90 50 50)" />

                      {/* Legendary (5%): stroke-dasharray="11.9 238.76" stroke-dashoffset="-226.8" color: #f59e0b */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="11.9 238.76" strokeDashoffset="-226.8" transform="rotate(-90 50 50)" />

                      {/* Center label */}
                      <g className="font-tech text-center">
                        <text x="50" y="47" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">45</text>
                        <text x="50" y="58" textAnchor="middle" fill="rgba(255, 255, 255, 0.4)" fontSize="6" fontWeight="bold" className="uppercase tracking-wider">Unlocked</text>
                      </g>
                    </svg>
                  </div>

                  {/* Legend list */}
                  <div className="space-y-2 pt-2 text-[10px] font-semibold text-white/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#64748b]" />
                        <span>Common</span>
                      </div>
                      <span className="font-tech text-white">28 (22%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                        <span>Rare</span>
                      </div>
                      <span className="font-tech text-white">10 (22%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#9a35ff]" />
                        <span>Epic</span>
                      </div>
                      <span className="font-tech text-white">5 (11%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                        <span>Legendary</span>
                      </div>
                      <span className="font-tech text-white">2 (4%)</span>
                    </div>
                  </div>

                </div>

                {/* MILESTONE REWARDS card */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                    MILESTONE REWARDS
                  </h3>

                  <div className="space-y-3.5">
                    
                    {/* Reward 1 */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0 bg-white/5 relative flex items-center justify-center">
                        <img src={rewardCrate} alt="Bronze Crate" className="w-8 h-8 object-contain opacity-50" />
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <CheckCircle className="h-5.5 w-5.5 fill-[#04080f] stroke-2" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5 text-[10px] font-semibold text-white/50">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold leading-none">2,500 Points</span>
                          <span className="text-emerald-400 font-tech font-bold uppercase tracking-wider">CLAIMED</span>
                        </div>
                        <span className="leading-none text-[9px] text-white/30">Bronze Crate</span>
                      </div>
                    </div>

                    {/* Reward 2 */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0 bg-white/5 relative flex items-center justify-center">
                        <img src={rewardCrate} alt="Silver Crate" className="w-8 h-8 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5 text-[10px] font-semibold text-white/50">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold leading-none">5,000 Points</span>
                          <span className="font-tech font-bold text-white/70">2,450 / 5,000</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-[#9a35ff] h-full rounded-full" style={{ width: "49%" }} />
                          </div>
                          <span className="leading-none text-[9px] text-white/30 block">Silver Crate</span>
                        </div>
                      </div>
                    </div>

                    {/* Reward 3 */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0 bg-white/5 relative flex items-center justify-center">
                        <img src={rewardCrate} alt="Gold Crate" className="w-8 h-8 object-contain opacity-40" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5 text-[10px] font-semibold text-white/50">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold leading-none">10,000 Points</span>
                          <span className="font-tech font-bold text-white/30">2,450 / 10,000</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-[#9a35ff]/40 h-full rounded-full" style={{ width: "24.5%" }} />
                          </div>
                          <span className="leading-none text-[9px] text-white/30 block">Gold Crate</span>
                        </div>
                      </div>
                    </div>

                    {/* Reward 4 */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0 bg-white/5 relative flex items-center justify-center">
                        <img src={rewardCrate} alt="Diamond Crate" className="w-8 h-8 object-contain opacity-40" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5 text-[10px] font-semibold text-white/50">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold leading-none">25,000 Points</span>
                          <span className="font-tech font-bold text-white/30">2,450 / 25,000</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-[#9a35ff]/30 h-full rounded-full" style={{ width: "9.8%" }} />
                          </div>
                          <span className="leading-none text-[9px] text-white/30 block">Diamond Crate</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* RECENTLY UNLOCKED feed */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                      RECENTLY UNLOCKED
                    </h3>
                    <button className="text-[10px] text-purple-400 font-tech font-bold uppercase tracking-wider hover:text-purple-300 transition cursor-pointer">
                      View All
                    </button>
                  </div>

                  <div className="space-y-3.5 text-[10px] font-semibold text-white/50">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                          <Swords className="h-3.5 w-3.5 fill-current" />
                        </div>
                        <div className="space-y-0.5 leading-none">
                          <span className="text-white font-bold block uppercase">First Blood</span>
                          <span className="text-[#b85eff] font-tech font-bold text-[9px]">+50 PTS</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-white/35">May 12, 2024</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                          <Target className="h-3.5 w-3.5 fill-current" />
                        </div>
                        <div className="space-y-0.5 leading-none">
                          <span className="text-white font-bold block uppercase">Sharp Shooter</span>
                          <span className="text-[#b85eff] font-tech font-bold text-[9px]">+100 PTS</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-white/35">May 14, 2024</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                          <Trophy className="h-3.5 w-3.5 fill-current" />
                        </div>
                        <div className="space-y-0.5 leading-none">
                          <span className="text-white font-bold block uppercase">Champion</span>
                          <span className="text-[#b85eff] font-tech font-bold text-[9px]">+500 PTS</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-white/35">May 12, 2024</span>
                    </div>

                  </div>
                </div>

              </aside>

            </div>

          </section>
        </div>
  );
}

export default AchievementsPage;
