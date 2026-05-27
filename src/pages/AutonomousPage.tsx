import { useState } from "react";
import {
  Radio,
  Coins,
  CheckCircle,
  Target,
  Clock,
  Settings as SettingsIcon,
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  Lock,
  Activity,
  Zap,
  Hexagon,
} from "lucide-react";

import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";

// Asset Imports
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import rewardCrate from "@/assets/reward-crate.png";
import graphSvg from "@/assets/Graph.svg";


// Clan Icon helper matching other pages
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

function ClanIcon({ type, className = "h-3.5 w-3.5" }: { type: string; className?: string }) {
  if (type === "solana") return <SolanaIcon className={`${className} text-teal-400`} />;
  if (type === "base") return <BaseIcon className={`${className} text-blue-500`} />;
  if (type === "zerog") return <ZeroGClanIcon className={className} />;
  return null;
}

const AutonomousPage = () => {
  const [autonomousMode, setAutonomousMode] = useState(true);

  const myAgentsQ = useMyArenaAgents(1, 10);
  const myAgents = myAgentsQ.data?.agents ?? [];
  const activeAgents = myAgents.slice(0, 3);

  // Radar chart projections for 6 axes (Earnings, Win Rate, Efficiency, Safety, Growth, Adaptability)
  const radarLabels = ["Earnings", "Win Rate", "Efficiency", "Safety", "Growth", "Adaptability"];
  const strategyStats = [84, 72, 78, 88, 76, 72];
  const averageStats = [60, 65, 55, 62, 58, 60];

  // Helper to generate SVG points for hexagon radar
  const getRadarPoints = (stats: number[], scale = 1) => {
    const center = 100;
    const rMax = 70;
    return stats
      .map((val, i) => {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        const radius = (val / 100) * rMax * scale;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="min-h-full text-foreground bg-transparent">
      {/* Background Glow */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(circle_at_80%_15%,rgba(155,51,255,0.14),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(33,150,255,0.08),transparent_35%)]" />

          <section className="mx-auto max-w-[1284px] px-4 py-5 sm:px-6 lg:px-8 space-y-4">
            
            {/* Top Title Section */}
            <div>
              <h1 className="font-tech text-3xl font-bold tracking-tight text-white uppercase">AUTONOMOUS COMMAND</h1>
              <p className="mt-1 text-[11px] text-white/55 font-medium">
                Your agents operate, earn, and grow even when you're away.
              </p>
            </div>

            {/* Top Metric Boxes Strip */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 relative z-10">
              
              {/* Box 1 */}
              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">
                    AUTONOMOUS AGENTS
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-tech text-xl font-bold text-white">3 / 5</span>
                    <span className="text-[10px] text-white/45">Active</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Radio className="h-4.5 w-4.5 animate-pulse" />
                </div>
              </div>

              {/* Box 2 */}
              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">
                    TOTAL EARNED (24H)
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-tech text-xl font-bold text-white">245.60</span>
                    <span className="text-[8px] font-tech font-bold text-[#b85eff]">$ARENA</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Coins className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Box 3 */}
              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">
                    MISSIONS COMPLETED
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tech text-xl font-bold text-white">28</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded select-none">
                      +12%
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Box 4 */}
              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">
                    SUCCESS RATE
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tech text-xl font-bold text-white">78.6%</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded select-none">
                      +8.4%
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Target className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Box 5 */}
              <div className="arena-panel p-4 flex items-center justify-between border-white/8 bg-[#04080f]/90">
                <div className="space-y-1">
                  <span className="text-[9px] font-tech font-bold uppercase text-white/40 tracking-wider">
                    ACTIVE TIME (24H)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tech text-xl font-bold text-white">18h 45m</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded select-none animate-pulse">
                      +15m
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
              </div>

            </div>

            {/* Main Content Layout Grid */}
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_376px]">
              
              {/* Left Column Feed area */}
              <div className="min-w-0 space-y-4">
                
                {/* Autonomous Status Area */}
                <div className="grid gap-4 md:grid-cols-2">
                  
                  {/* Left Block: Brain pulse animation */}
                  <div className="arena-panel p-5 flex flex-col items-center justify-center border-white/8 bg-[#04080f]/95 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(154,53,255,0.06),transparent_60%)]" />
                    
                    {/* Animated Scanning Circle */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-[ping_3s_infinite]" />
                      <div className="absolute inset-3 rounded-full border border-purple-500/25 animate-[spin_10s_linear_infinite]" style={{ borderTopColor: "#9a35ff" }} />
                      <div className="absolute inset-6 rounded-full border border-purple-500/10 border-dashed" />
                      
                      {/* Interactive Brain SVG */}
                      <svg className="w-16 h-16 text-[#9a35ff] drop-shadow-[0_0_15px_rgba(154,53,255,0.6)] animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.88A2.5 2.5 0 0 1 9.5 2Z" fill="currentColor" opacity="0.9" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.88A2.5 2.5 0 0 0 14.5 2Z" fill="currentColor" opacity="0.9" />
                      </svg>
                    </div>

                    <div className="mt-4 text-center space-y-1 relative z-10">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-tech text-xs tracking-wider uppercase font-bold text-white">
                          SYSTEM ACTIVE
                        </span>
                      </div>
                      <p className="text-[10px] text-white/45 uppercase font-semibold">
                        Your agents are operating autonomously
                      </p>
                    </div>

                    {/* Manage Settings Button */}
                    <button className="mt-5 bg-[#0a0f1b]/60 border border-white/8 hover:border-purple-500/35 hover:bg-purple-950/10 rounded px-5 py-2 text-[10px] font-tech font-bold uppercase tracking-wider text-purple-400 transition cursor-pointer flex items-center gap-1.5">
                      <SettingsIcon className="h-3.5 w-3.5" />
                      <span>MANAGE SETTINGS</span>
                    </button>

                  </div>

                  {/* Right Block: Characteristic highlights */}
                  <div className="arena-panel p-5 border-white/8 bg-[#04080f]/95 space-y-4">
                    <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                      AUTONOMOUS STATUS
                    </h3>

                    <div className="space-y-3.5">
                      {[
                        { title: "Continuous Operations", desc: "Agents run missions, battles, and training 24/7", color: "text-[#b85eff]" },
                        { title: "Smart Decision Making", desc: "AI adapts to conditions and makes optimal decisions", color: "text-[#b85eff]" },
                        { title: "Risk Management", desc: "Automatic threat detection and resource protection", color: "text-[#b85eff]" },
                        { title: "Auto Resource Optimization", desc: "Maximize earnings and growth efficiency", color: "text-[#b85eff]" },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <div className={`mt-0.5 w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 ${item.color}`}>
                            <Zap className="h-2.5 w-2.5 fill-current" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-semibold text-xs text-white/90 leading-tight">{item.title}</h4>
                            <p className="text-[10px] text-white/50 leading-relaxed font-medium">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

                {/* Active Autonomous Agents Table */}
                <div className="arena-panel border-white/8 bg-[#04080f]/95 overflow-hidden">
                  <div className="p-5 border-b border-white/8 flex items-center justify-between">
                    <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                      ACTIVE AUTONOMOUS AGENTS
                    </h3>
                    <span className="text-[10px] text-purple-400 font-tech font-bold uppercase tracking-wider select-none">
                      {activeAgents.length} Agents Active
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/6 text-white/40 font-bold uppercase tracking-wider text-[9px] bg-white/[0.01]">
                          <th className="w-[240px] px-5 py-3">Agent</th>
                          <th className="px-5 py-3">Current Mission</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Earnings (24h)</th>
                          <th className="px-5 py-3 text-center">Uptime</th>
                          <th className="px-5 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6 font-medium">
                        
                        {activeAgents.length > 0 ? (
                          activeAgents.map((agent, i) => (
                            <tr key={agent.id} className="hover:bg-white/[0.01] transition">
                              <td className="w-[240px] px-5 py-4">
                                <div className="flex min-w-0 items-center gap-4">
                                  <ArenaAgentThumbnail agent={agent} className="h-14 w-14 rounded-lg" size="md" />
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex min-w-0 items-center gap-1.5">
                                      <span className="min-w-0 truncate font-bold text-white text-sm leading-tight">{agent.name}</span>
                                      <Hexagon className="h-3 w-3 shrink-0 fill-[#9a35ff] text-[#9a35ff]" />
                                    </div>
                                    <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-white/45">
                                      <ClanIcon type={agent.clan.toLowerCase()} className="h-3.5 w-3.5 shrink-0" />
                                      <span className="min-w-0 truncate uppercase tracking-wide">{agent.clan} &bull; {agent.archetype}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="space-y-0.5">
                                  <span className="text-white/86 text-xs leading-tight font-semibold">
                                    {i === 0 ? "Resource Raid" : i === 1 ? "Training Focus" : "Arena Battles"}
                                  </span>
                                  <p className="text-[9px] text-white/40 leading-none">
                                    {i === 0 ? "Dusty Outpost" : i === 1 ? "Adaptability Drill" : "3v3 Skirmish"}
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider font-tech">In Progress</span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-baseline gap-1 font-tech">
                                  <span className="font-bold text-white">{[85.40, 72.30, 87.90][i % 3]}</span>
                                  <span className="text-[8px] font-bold text-white/40">$ARENA</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center font-tech font-bold text-white/70">
                                {["6h 24m", "5h 58m", "6h 05m"][i % 3]}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button className="bg-[#0a0f1b]/60 border border-white/8 hover:border-purple-500/35 hover:bg-purple-950/10 rounded px-2.5 py-1 text-[9px] font-tech font-bold uppercase tracking-wider text-purple-400 transition cursor-pointer">
                                    VIEW AGENT
                                  </button>
                                  <button className="bg-[#0a0f1b]/60 border border-white/8 hover:border-white/20 rounded p-1 text-white/40 hover:text-white transition cursor-pointer">
                                    &bull;&bull;&bull;
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-white/40 text-sm">
                              No active agents available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-white/8 flex justify-center bg-white/[0.005]">
                    <button className="text-[10px] text-purple-400 font-tech font-bold uppercase tracking-wider hover:text-purple-300 transition cursor-pointer flex items-center gap-1.5">
                      <span>VIEW ALL AGENTS</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* How Autonomous Mode Works banner */}
                <div className="arena-panel p-5 border-white/8 bg-[#04080f]/95 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-4.5 w-4.5 text-purple-400 shrink-0" />
                    <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">
                      HOW AUTONOMOUS MODE WORKS
                    </span>
                  </div>

                  {/* Step diagram */}
                  <div className="flex items-center gap-4 text-[10px] text-white/50 font-semibold max-sm:w-full max-sm:justify-between">
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-white">
                        <span>1. SET STRATEGY</span>
                      </div>
                      <p className="text-[8px] text-white/35 font-medium uppercase">Choose goals and risk</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-white/25" />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-white">
                        <span>2. AGENTS OPERATE</span>
                      </div>
                      <p className="text-[8px] text-white/35 font-medium uppercase">AI executes decisions</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-white/25" />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-white">
                        <span>3. EARN & GROW</span>
                      </div>
                      <p className="text-[8px] text-white/35 font-medium uppercase">Earn rewards & XP</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-white/25" />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-white">
                        <span>4. REVIEW</span>
                      </div>
                      <p className="text-[8px] text-white/35 font-medium uppercase">Optimize strategy</p>
                    </div>

                  </div>

                  {/* Toggle button */}
                  <div className="flex items-center gap-2.5">
                    <span className="font-tech text-[10px] font-bold text-white/50 uppercase">AUTONOMOUS MODE</span>
                    <button
                      onClick={() => setAutonomousMode(!autonomousMode)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-300 outline-none ${
                        autonomousMode ? "bg-[#9a35ff]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                          autonomousMode ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                    <span className="font-tech text-[10px] font-black text-white">{autonomousMode ? "ON" : "OFF"}</span>
                  </div>

                </div>

              </div>

              {/* Right Column sidebar info details */}
              <aside className="space-y-4">
                
                {/* AUTONOMOUS STRATEGY card */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                    AUTONOMOUS STRATEGY
                  </h3>

                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wide block">Current Strategy</span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-white font-tech uppercase">
                      <span>Balanced Growth</span>
                      <Sliders className="h-3.5 w-3.5 text-purple-400 hover:text-purple-300 transition cursor-pointer" />
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                      A balanced approach focusing on earnings, training, and win rate improvement.
                    </p>
                  </div>

                  {/* Strategy Allocations */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wide block">Strategy Allocation</span>
                    
                    <div className="space-y-1 text-[10px] font-semibold text-white/70">
                      <div className="flex justify-between">
                        <span>Earnings</span>
                        <span className="font-tech">40%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-[#9a35ff] h-full rounded-full" style={{ width: "40%" }} />
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] font-semibold text-white/70">
                      <div className="flex justify-between">
                        <span>Training</span>
                        <span className="font-tech">30%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-[#9a35ff] h-full rounded-full" style={{ width: "30%" }} />
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] font-semibold text-white/70">
                      <div className="flex justify-between">
                        <span>Battles</span>
                        <span className="font-tech">20%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full rounded-full" style={{ width: "20%" }} />
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] font-semibold text-white/70">
                      <div className="flex justify-between">
                        <span>Exploration</span>
                        <span className="font-tech">10%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: "10%" }} />
                      </div>
                    </div>

                  </div>

                  <button className="w-full bg-[#0a0f1b]/60 border border-white/8 hover:border-purple-500/35 hover:bg-purple-950/10 text-purple-400 text-[10px] font-tech font-bold uppercase tracking-wider py-2.5 rounded transition flex items-center justify-center gap-2 cursor-pointer">
                    <span>EDIT STRATEGY</span>
                  </button>

                </div>

                {/* STRATEGY PERFORMANCE radar card */}
                <div className="arena-panel p-4 sm:p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <h3 className="font-tech text-[11px] uppercase text-white/86 tracking-wider font-semibold leading-snug sm:text-xs">
                    STRATEGY PERFORMANCE (7D)
                  </h3>

                  {/* SVG Spider Radar Chart */}
                  <div className="relative flex justify-center py-1 sm:py-2">
                    <div className="relative w-full max-w-[300px] aspect-[1.22/1]">
                      {/* Centered Image */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <img src={graphSvg} alt="Strategy performance radar chart" className="w-[65%] h-[65%] object-contain" />
                      </div>
                      
                      {/* SVG Overlay for text labels */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 244 200">
                        {radarLabels.map((lbl, i) => {
                          const angle = (i * 60 - 90) * (Math.PI / 180);
                          const x = 122 + 87 * Math.cos(angle);
                          const y = 100 + 82 * Math.sin(angle);
                          const anchor = i === 0 || i === 3 ? "middle" : i < 3 ? "start" : "end";
                          
                          const val = strategyStats[i];
                          
                          return (
                            <g key={lbl}>
                              <text
                                x={x}
                                y={y - 2}
                                textAnchor={anchor}
                                fill="rgba(255, 255, 255, 0.5)"
                                fontSize="7.5"
                                fontWeight="600"
                                className="font-sans uppercase"
                              >
                                {lbl}
                              </text>
                              <text
                                x={x}
                                y={y + 6}
                                textAnchor={anchor}
                                fill="#fff"
                                fontSize="8"
                                fontWeight="bold"
                                className="font-tech"
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[9px] font-semibold tracking-wider text-white/50">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <div className="w-2.5 h-2.5 bg-[#9a35ff]/20 border border-[#9a35ff] rounded-sm" />
                      <span>THIS STRATEGY</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <div className="w-2.5 h-0.5 border-t border-white/35 border-dashed" />
                      <span>AVERAGE</span>
                    </div>
                  </div>

                </div>

                {/* AUTO-LOOT & REWARDS card */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 flex items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                      AUTO-LOOT & REWARDS
                    </h3>
                    <p className="text-[10px] text-white/55 leading-relaxed font-semibold">
                      Auto-collect loot, rewards, and resources.
                    </p>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-white/40 uppercase tracking-wide font-medium">Collected (24h)</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-tech text-base font-bold text-white">152.30</span>
                        <span className="text-[8px] font-tech font-bold text-[#b85eff]">$ARENA</span>
                      </div>
                    </div>
                    <button className="bg-[#0a0f1b]/60 border border-white/8 hover:border-purple-500/35 hover:bg-purple-950/10 rounded px-5 py-2 text-[9px] font-tech font-bold uppercase tracking-wider text-purple-400 transition cursor-pointer w-full text-center">
                      VIEW LOOT
                    </button>
                  </div>

                  <div className="w-28 h-28 relative flex items-center justify-center shrink-0">
                    {/* Glowing background */}
                    <div className="absolute inset-0 bg-[#9a35ff]/20 blur-xl rounded-full" />
                    <img src={rewardCrate} alt="Auto Loot Crate" className="w-20 h-20 object-contain relative z-10 animate-bounce" style={{ animationDuration: "3s" }} />
                  </div>
                </div>

                {/* AUTONOMOUS LOG card */}
                <div className="arena-panel p-5 relative overflow-hidden bg-[#04080f]/95 border-white/8 space-y-4">
                  <h3 className="font-tech text-xs uppercase text-white/86 tracking-wider font-semibold">
                    AUTONOMOUS LOG
                  </h3>
                  <p className="text-[10px] text-white/45 font-semibold leading-none">
                    View all autonomous activities and decisions.
                  </p>

                  {/* Log list */}
                  <div className="space-y-3 text-[10px] font-semibold text-white/70">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                        <span className="text-white/60">
                          <strong className="text-white font-bold">HYBRID</strong> completed Resource Raid
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-emerald-400 font-bold font-tech">+18.60 $ARENA</span>
                        <p className="text-[8px] text-white/35 font-medium mt-0.5">2m ago</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                        <span className="text-white/60">
                          <strong className="text-white font-bold">TACTICIAN</strong> completed Adaptability Drill
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-emerald-400 font-bold font-tech">+12.40 $ARENA</span>
                        <p className="text-[8px] text-white/35 font-medium mt-0.5">15m ago</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                        <span className="text-white/60">
                          <strong className="text-white font-bold">DEFENDER</strong> won Arena Battle
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-emerald-400 font-bold font-tech">+22.30 $ARENA</span>
                        <p className="text-[8px] text-white/35 font-medium mt-0.5">28m ago</p>
                      </div>
                    </div>

                  </div>

                  <button className="w-full bg-[#0a0f1b]/60 border border-white/8 hover:border-purple-500/35 hover:bg-purple-950/10 text-purple-400 text-[10px] font-tech font-bold uppercase tracking-wider py-2.5 rounded transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>VIEW FULL LOG</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                </div>

              </aside>

            </div>

          </section>
        </div>
  );
}

export default AutonomousPage;
