import type { ReactNode } from "react";
import { ArrowUpRight, Crosshair, Hexagon, Shield, Swords, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import agentNexus from "@/assets/agent-nexus.jpg";
import agentShadow from "@/assets/agent-shadow.jpg";
import agentAegis from "@/assets/agent-aegis.jpg";
import agentVoid from "@/assets/agent-voidwalker.jpg";
import agentRage from "@/assets/agent-rageborn.jpg";
import heroTrio from "@/assets/hero-trio.png";
import battleIcon from "@/assets/icon-battle.jpg";
import dashboardCrest from "@/assets/dashboard-crest.png";
import battleStep1 from "@/assets/step1.mp4";
import battleStep2 from "@/assets/step2.mp4";
import battleStep3 from "@/assets/step3.mp4";
import battleStep4 from "@/assets/step4.mp4";
import battleStep5 from "@/assets/step5.mp4";

export type GameMode = {
  title: string;
  tag: string;
  body: string;
  image?: string;
  video?: string;
  tone: string;
};

const gameModes: GameMode[] = [
  {
    title: "WARZONE WARRIORS",
    tag: "2D SHOOTER",
    body: "Fast-paced 2D arcade shooter. Team up, deploy, and dominate the battlefield.",
    image: heroTrio,
    tone: "from-[#101824]/30 via-[#0b0f16]/55 to-[#070910]/95",
  },
  {
    title: "ROBOWARS",
    tag: "VEHICLE ARENA",
    body: "Build. Upgrade. Destroy. Fight in intense robotic vehicle battles.",
    video: battleStep5,
    tone: "from-[#201007]/30 via-[#100b0c]/55 to-[#070910]/95",
  },
];

const activeBattles = [
  {
    game: "WARZONE WARRIORS",
    title: "TEAM DEATHMATCH",
    map: "Dusty Outpost",
    left: "Alpha Squad",
    right: "Omega Force",
    leftScore: "18",
    rightScore: "12",
    status: "LIVE",
    time: "08:45",
    image: heroTrio,
    color: "#7b3cff",
  },
  {
    game: "ROBOWARS",
    title: "ARENA BRAWL",
    map: "Steel Pit",
    left: "Iron Titans",
    right: "Cyber Claws",
    leftScore: "3",
    rightScore: "3",
    status: "LIVE",
    time: "09:30",
    video: battleStep1,
    color: "#b037ff",
  },
  {
    game: "WARZONE WARRIORS",
    title: "CAPTURE THE FLAG",
    map: "Jungle Ruins",
    left: "Berserker",
    right: "Assassin",
    leftScore: "2",
    rightScore: "1",
    status: "LIVE",
    time: "06:12",
    image: agentShadow,
    color: "#8bc900",
  },
  {
    game: "ROBOWARS",
    title: "MECH MAYHEM",
    map: "Scrap Yard",
    left: "Dark Bots",
    right: "Hybrid",
    leftScore: "5",
    rightScore: "2",
    status: "STARTING SOON",
    time: "01:20",
    video: battleStep2,
    color: "#ffc000",
  },
  {
    game: "WARZONE WARRIORS",
    title: "DOMINATION",
    map: "Desert Storm",
    left: "Desert Foxes",
    right: "Sand Vipers",
    leftScore: "45",
    rightScore: "30",
    status: "STARTING SOON",
    time: "02:15",
    image: heroTrio,
    color: "#ffc000",
  },
  {
    game: "ROBOWARS",
    title: "CIRCUIT BREAKER",
    map: "Neon Factory",
    left: "Volt Runners",
    right: "Spark Plugs",
    leftScore: "1",
    rightScore: "0",
    status: "LIVE",
    time: "04:45",
    video: battleStep3,
    color: "#00f080",
  },
  {
    game: "WARZONE WARRIORS",
    title: "FREE FOR ALL",
    map: "Neon City",
    left: "Neon Wraiths",
    right: "Cyber Punks",
    leftScore: "10",
    rightScore: "10",
    status: "LIVE",
    time: "12:00",
    image: agentShadow,
    color: "#ff3c7b",
  },
  {
    game: "ROBOWARS",
    title: "SCRAP YARD SCRAMBLE",
    map: "Junkyard",
    left: "Scrap Titans",
    right: "Rust Buckets",
    leftScore: "7",
    rightScore: "6",
    status: "LIVE",
    time: "15:30",
    video: battleStep4,
    color: "#ff5050",
  },
];

const performers = [
  { name: "HYBRID", clan: "Zerog", img: agentNexus, rate: "68.2%", battles: "32" },
  { name: "DEFENDER", clan: "Solana", img: agentShadow, rate: "61.4%", battles: "28" },
  { name: "TACTICIAN", clan: "Base", img: agentAegis, rate: "59.3%", battles: "25" },
  { name: "SUPPORT", clan: "Zerog", img: agentVoid, rate: "57.1%", battles: "21" },
  { name: "BERSERKER", clan: "Base", img: agentRage, rate: "55.6%", battles: "18" },
];

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`mt-7 font-tech text-sm uppercase tracking-[0.08em] ${className}`}>{children}</h2>
  );
}

function StatsRail() {
  const stats = [
    { label: "TOTAL BATTLES", value: "128", icon: Swords, color: "#0089ff" },
    { label: "WINS", value: "82", icon: Trophy, color: "#ffc000" },
    { label: "WIN RATE", value: "64.1%", icon: Crosshair, color: "#b338ff" },
    { label: "TOTAL REWARDS", value: "2,450", suffix: "$ARENA", icon: Hexagon, color: "#ffc000" },
  ];
  return (
    <div className="arena-panel grid grid-cols-2 divide-x divide-white/8 overflow-hidden md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-4 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-white/[0.04]">
            <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
          </div>
          <div>
            <div className="font-tech text-[9px] text-white/48">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold">
              {stat.value}{" "}
              {stat.suffix && <span className="text-xs text-white/45">{stat.suffix}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RankCard() {
  return (
    <div className="arena-panel relative min-h-[94px] overflow-hidden p-4">
      <div className="font-tech text-[9px] text-white/50">ARENA RANK</div>
      <div className="mt-2 text-xl font-bold">#1,248</div>
      <div className="mt-1 text-xs text-white/55">TOP 11%</div>
      <img src={dashboardCrest} alt="" className="absolute right-4 top-0 h-[116px] w-[120px] object-contain" />
    </div>
  );
}

function GameModeCard({ mode }: { mode: GameMode }) {
  return (
    <article className="arena-panel relative h-[260px] overflow-hidden">
      {mode.video ? (
        <video src={mode.video} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-78" />
      ) : (
        <img src={mode.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-78" />
      )}
      <div className={`absolute inset-0 bg-gradient-to-r ${mode.tone}`} />
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div>
          <h3 className="font-tech text-4xl font-black italic tracking-[-0.04em] text-white drop-shadow">
            {mode.title}
          </h3>
          <span className="mt-4 inline-flex rounded border border-[#9f2dff]/70 bg-[#5b1499]/35 px-2 py-1 font-tech text-[9px] text-[#d773ff]">
            {mode.tag}
          </span>
          <p className="mt-2 max-w-[250px] text-xs leading-relaxed text-white/72">{mode.body}</p>
        </div>
        <button
          type="button"
          className="flex h-10 w-[145px] items-center justify-center gap-3 rounded border border-[#9b32ff]/70 bg-[#170d26]/65 font-tech text-[10px]"
        >
          ENTER ARENA <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function Team({ name, color, right = false }: { name: string; color: string; right?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${right ? "justify-end text-right" : ""}`}>
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded"
        style={{ background: `${color}24`, color }}
      >
        <Shield className="h-4 w-4" />
      </span>
      <span className="truncate text-white/70">{name}</span>
    </div>
  );
}

function BattleCard({ battle }: { battle: (typeof activeBattles)[number] }) {
  return (
    <article className="arena-panel overflow-hidden flex flex-col h-full">
      <div className="relative h-[118px] shrink-0">
        {battle.video ? (
          <video src={battle.video} autoPlay loop muted playsInline className="h-full w-full object-cover opacity-75" />
        ) : (
          <img src={battle.image} alt="" className="h-full w-full object-cover opacity-75" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050913] via-black/25 to-transparent" />
        <span className="absolute left-3 top-3 rounded border border-[#a231ff] bg-[#5b1499]/60 px-2 py-1 font-tech text-[9px] text-[#d773ff]">
          {battle.game}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-tech text-sm">{battle.title}</h3>
        <p className="mt-1 text-xs text-white/70">{battle.map}</p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
          <Team color={battle.color} name={battle.left} />
          <span className="text-white/56">VS</span>
          <Team color="#79d814" name={battle.right} right />
        </div>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center text-2xl font-semibold">
          <span>{battle.leftScore}</span>
          <span className="font-tech text-sm text-[#ffb44c]">VS</span>
          <span className="text-right">{battle.rightScore}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className={battle.status === "LIVE" ? "text-red-500" : "text-[#ffc000]"}>● {battle.status}</span>
          <span className="text-white/72">{battle.time}</span>
        </div>
        <div className="mt-auto pt-3">
          <button
            type="button"
            className="h-9 w-full rounded border border-[#9b32ff]/70 bg-[#230b35]/75 font-tech text-[10px]"
          >
            {battle.status === "LIVE" ? "WATCH NOW" : "JOIN BATTLE"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Rewards() {
  const rewards = [
    ["WIN REWARD", "100 $ARENA", "#b338ff"],
    ["KILL BONUS", "25 $ARENA", "#0089ff"],
    ["VICTORY STREAK", "50 $ARENA", "#ffc000"],
    ["TOP PERFORMER", "75 $ARENA", "#00f080"],
  ] as const;
  return (
    <aside className="arena-panel h-fit p-4">
      <div className="space-y-4">
        {rewards.map(([label, value, color]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-3 text-white/72">
              <span className="grid h-8 w-8 place-items-center rounded" style={{ background: `${color}1f`, color }}>
                <Hexagon className="h-5 w-5" />
              </span>
              {label}
            </span>
            <span className="font-semibold text-[#00f080]">{value}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-7 flex h-10 w-full items-center justify-center gap-3 rounded border border-[#9b32ff]/70 bg-[#230b35]/65 font-tech text-[10px]"
      >
        VIEW ALL REWARDS <ArrowUpRight className="h-4 w-4" />
      </button>
    </aside>
  );
}

function PerformerCard({ agent }: { agent: (typeof performers)[number] }) {
  return (
    <article className="arena-panel flex items-center gap-3 p-3">
      <img src={agent.img} alt={agent.name} className="h-[86px] w-[70px] rounded object-cover object-top" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-tech text-xs">{agent.name}</h3>
        <p className="mt-1 text-[11px] text-white/55">{agent.clan}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-[10px] text-white/45">Win Rate</div>
            <div className="text-lg font-semibold">{agent.rate}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/45">Battles</div>
            <div className="text-lg font-semibold">{agent.battles}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

const BattlesPage = () => {
  return (
    <ArenaPageLayout>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">BATTLE ARENA</h1>
        <p className="mt-2 text-sm text-white/68">Compete in epic battles across different games and modes.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
        <StatsRail />
        <RankCard />
      </div>
      <SectionTitle>CHOOSE YOUR GAME</SectionTitle>
      <div className="grid gap-3 xl:grid-cols-2">
        {gameModes.map((mode) => (
          <GameModeCard key={mode.title} mode={mode} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="mb-3">
            <SectionTitle className="!mt-0">ACTIVE BATTLES</SectionTitle>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeBattles.map((battle) => (
              <BattleCard key={battle.title} battle={battle} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-3">
              <SectionTitle className="!mt-0">BATTLE REWARDS</SectionTitle>
            </div>
            <Rewards />
          </div>
          <div>
            <SectionTitle className="mt-0">YOUR TOP PERFORMERS</SectionTitle>
            <div className="mt-3 grid gap-3">
              {performers.map((agent) => (
                <PerformerCard key={agent.name} agent={agent} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ArenaPageLayout>
  );
};

export default BattlesPage;
