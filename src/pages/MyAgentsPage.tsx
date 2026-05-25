import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Coins,
  Hexagon,
  Info,
  LineChart,
  Plus,
  Radio,
  Search,
  Swords,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { ClanIcon } from "@/components/arena/ClanIcon";
import agentNexus from "@/assets/agent-nexus.jpg";
import agentShadow from "@/assets/agent-shadow.jpg";
import agentAegis from "@/assets/agent-aegis.jpg";
import agentVoid from "@/assets/agent-voidwalker.jpg";
import agentRage from "@/assets/agent-rageborn.jpg";
import agentLumen from "@/assets/agent-lumen.jpg";

const initialAgents = [
  {
    id: "HYBRID",
    name: "HYBRID",
    clanName: "Zerog &bull; Assassin",
    clanType: "zerog",
    active: true,
    level: 12,
    xp: 2450,
    xpTotal: 3600,
    battles: 32,
    winRate: 62.5,
    powerScore: 12850,
    image: agentNexus,
  },
  {
    id: "DEFENDER",
    name: "DEFENDER",
    clanName: "Solana &bull; Tactician",
    clanType: "solana",
    active: true,
    level: 11,
    xp: 1890,
    xpTotal: 3200,
    battles: 28,
    winRate: 60.7,
    powerScore: 11230,
    image: agentShadow,
  },
  {
    id: "TACTICIAN",
    name: "TACTICIAN",
    clanName: "Base &bull; Defender",
    clanType: "base",
    active: true,
    level: 10,
    xp: 1200,
    xpTotal: 2800,
    battles: 25,
    winRate: 64.0,
    powerScore: 10420,
    image: agentAegis,
  },
  {
    id: "SUPPORT",
    name: "SUPPORT",
    clanName: "Zerog &bull; Hybrid",
    clanType: "zerog",
    active: false,
    level: 8,
    xp: 650,
    xpTotal: 2000,
    battles: 18,
    winRate: 55.6,
    powerScore: 7890,
    image: agentVoid,
  },
  {
    id: "BERSERKER",
    name: "BERSERKER",
    clanName: "Base &bull; Berserker",
    clanType: "base",
    active: false,
    level: 6,
    xp: 350,
    xpTotal: 1600,
    battles: 10,
    winRate: 50.0,
    powerScore: 6250,
    image: agentRage,
  },
  {
    id: "ASSASSIN",
    name: "ASSASSIN",
    clanName: "Zerog &bull; Support",
    clanType: "zerog",
    active: false,
    level: 7,
    xp: 820,
    xpTotal: 1800,
    battles: 15,
    winRate: 53.3,
    powerScore: 7040,
    image: agentLumen,
  },
];

const MyAgentsPage = () => {
  const navigate = useNavigate();
  const [activeFilterTab, setActiveFilterTab] = useState<string>("ALL AGENTS");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recently Used");
  const totalAgents = initialAgents.length;
  const activeAgents = initialAgents.filter((agent) => agent.active).length;
  const inactiveAgents = totalAgents - activeAgents;
  const totalBattles = initialAgents.reduce((sum, agent) => sum + agent.battles, 0);
  const averageWinRate =
    totalAgents > 0
      ? initialAgents.reduce((sum, agent) => sum + agent.winRate, 0) / totalAgents
      : 0;
  const filterTabs = [
    { label: "ALL AGENTS", key: "ALL AGENTS" },
    { label: `ACTIVE (${activeAgents})`, key: "ACTIVE" },
    { label: `INACTIVE (${inactiveAgents})`, key: "INACTIVE" },
    { label: "ARCHIVED (0)", key: "ARCHIVED" },
  ] as const;

  const filteredAgents = initialAgents.filter((agent) => {
    const matchesTab =
      activeFilterTab === "ALL AGENTS" ||
      (activeFilterTab === "ACTIVE" && agent.active) ||
      (activeFilterTab === "INACTIVE" && !agent.active) ||
      (activeFilterTab === "ARCHIVED" && false);
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <ArenaPageLayout>
      <div>
        <h1 className="font-tech text-3xl font-bold uppercase tracking-tight text-white">MY AGENTS</h1>
        <p className="mt-1 text-[11px] font-medium text-white/55">Manage, train, and deploy your AI agents.</p>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">TOTAL AGENTS</span>
            <span className="font-tech block text-xl font-bold text-white">{totalAgents}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <UserRound className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">ACTIVE AGENTS</span>
            <div className="flex items-center gap-1.5">
              <span className="font-tech text-xl font-bold text-white">{activeAgents}</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <Radio className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">TOTAL BATTLES</span>
            <span className="font-tech block text-xl font-bold text-white">{totalBattles}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Swords className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">WIN RATE</span>
            <span className="font-tech block text-xl font-bold text-white">{averageWinRate.toFixed(1)}%</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">TOTAL EARNINGS</span>
            <div className="flex items-baseline gap-1">
              <span className="font-tech text-xl font-bold text-white">1,250.50</span>
              <span className="font-tech text-[8px] font-bold text-white/40">SARENA</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Coins className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      <div className="arena-panel flex flex-wrap items-center justify-between gap-3 border-white/8 bg-[#04080f]/95 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilterTab(tab.key)}
              className={`rounded px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider transition ${
                activeFilterTab === tab.key
                  ? "bg-[#9a35ff] text-white"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex max-sm:w-full items-center gap-2">
          <div className="relative max-sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[180px] max-sm:w-full rounded border border-white/8 bg-[#03070d]/60 py-1.5 pl-9 pr-4 text-xs font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/50"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer appearance-none rounded border border-white/8 bg-[#03070d]/60 py-1.5 pl-3 pr-8 text-xs font-semibold text-white/70 outline-none hover:text-white"
            >
              <option value="Recently Used">Sort by: Recently Used</option>
              <option value="Level">Sort by: Level</option>
              <option value="Win Rate">Sort by: Win Rate</option>
              <option value="Power Score">Sort by: Power Score</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded bg-[#9a35ff] px-3.5 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-purple-600"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>CREATE AGENT</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredAgents.map((agent) => {
          const xpPct = Math.round((agent.xp / agent.xpTotal) * 100);
          return (
            <div
              key={agent.id}
              className={`arena-panel relative flex flex-col overflow-hidden border-white/8 bg-[#04080f]/95 group ${
                agent.active ? "ring-1 ring-[#9a35ff]/15" : ""
              }`}
            >
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border-b border-white/6 bg-black/45">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-[#04080f]/10 to-transparent" />
                <div className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded border border-white/10 bg-black/40 px-2 py-0.5 font-tech text-[8px] font-black tracking-wide">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${agent.active ? "animate-pulse bg-emerald-500" : "bg-white/30"}`}
                  />
                  <span className="uppercase text-white/80">{agent.active ? "ACTIVE" : "INACTIVE"}</span>
                </div>
                <button
                  type="button"
                  className="absolute right-3.5 top-3.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-white/10 bg-black/40 text-white/40 transition hover:bg-black/60 hover:text-white"
                >
                  &bull;&bull;&bull;
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-4 p-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold leading-none text-white/95">{agent.name}</span>
                      <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/40">
                      <ClanIcon type={agent.clanType} className="h-3.5 w-3.5" />
                      <span dangerouslySetInnerHTML={{ __html: agent.clanName }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-[9px] font-semibold text-white/50">
                      <span className="font-tech font-bold text-white">LV. {agent.level}</span>
                      <span className="font-tech">
                        {agent.xp.toLocaleString()} / {agent.xpTotal.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-[#9a35ff]" style={{ width: `${xpPct}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-semibold uppercase text-white/30">Battles</span>
                      <span className="font-tech text-[10px] font-bold text-white/86">{agent.battles}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-semibold uppercase text-white/30">Win Rate</span>
                      <span className="font-tech text-[10px] font-bold text-white/86">{agent.winRate}%</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-semibold uppercase text-white/30">Power Score</span>
                      <span className="block truncate font-tech text-[10px] font-bold text-purple-400">
                        {agent.powerScore.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 border-t border-white/6 pt-2">
                  <button
                    type="button"
                    className="flex-1 cursor-pointer rounded border border-white/8 bg-[#0a0f1b]/60 py-2 text-center font-tech text-[9px] font-bold uppercase tracking-wider text-purple-400 transition hover:border-purple-500/35 hover:bg-purple-950/10"
                  >
                    MANAGE AGENT
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer rounded border border-white/8 bg-[#0a0f1b]/60 p-2 text-white/40 transition hover:border-white/20 hover:text-white"
                  >
                    <LineChart className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="arena-panel flex flex-wrap items-center justify-between gap-3 border-white/8 bg-[#04080f]/95 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">
              Your AI agents are your digital assets.
            </h4>
            <p className="text-[9px] font-semibold leading-none text-white/40">
              Train them, battle with them, and own them on-chain.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/ai-arena")}
          className="flex cursor-pointer items-center gap-1.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-5 py-2.5 font-tech text-[9px] font-bold uppercase tracking-wider text-purple-400 transition hover:border-purple-500/35 hover:bg-purple-950/10"
        >
          <span>LEARN MORE</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </ArenaPageLayout>
  );
};

export default MyAgentsPage;
