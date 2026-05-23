import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Box,
  ArrowUp,
  Swords,
  Globe,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  Sparkles,
  Radio,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroVideo from "@/assets/hero-video.mp4";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import agentNexus from "@/assets/agent-nexus.jpg";
import agentShadow from "@/assets/agent-shadow.jpg";
import agentAegis from "@/assets/agent-aegis.jpg";
import agentVoid from "@/assets/agent-voidwalker.jpg";
import agentRage from "@/assets/agent-rageborn.jpg";
import agentLumen from "@/assets/agent-lumen.jpg";
import iconTrain from "@/assets/icon-train.png";
import iconBattle from "@/assets/icon-battle.png";
import iconEarn from "@/assets/icon-earn.png";
const agents = [
  {
    rank: "01",
    name: "NEXUS-01",
    chain: "0G",
    tier: "Legendary",
    lvl: 12,
    power: "14,850",
    img: agentNexus,
    color: "var(--neon)",
  },
  {
    rank: "02",
    name: "SHADOW-9",
    chain: "Helios",
    tier: "Epic",
    lvl: 11,
    power: "13,420",
    img: agentShadow,
    color: "var(--lime)",
  },
  {
    rank: "03",
    name: "AEGIS-07",
    chain: "Aether",
    tier: "Epic",
    lvl: 12,
    power: "12,980",
    img: agentAegis,
    color: "var(--cyan)",
  },
  {
    rank: "04",
    name: "VOIDWALKER",
    chain: "0G",
    tier: "Epic",
    lvl: 11,
    power: "12,150",
    img: agentVoid,
    color: "var(--neon-2)",
  },
  {
    rank: "05",
    name: "RAGEBORN",
    chain: "Helios",
    tier: "Legendary",
    lvl: 12,
    power: "11,870",
    img: agentRage,
    color: "var(--amber)",
  },
  {
    rank: "06",
    name: "LUMEN-22",
    chain: "Aether",
    tier: "Epic",
    lvl: 11,
    power: "11,430",
    img: agentLumen,
    color: "var(--cyan)",
  },
];

const battles = [
  {
    tag: "Arena Championship",
    round: "Round 2",
    time: "02:45",
    a: { name: "NEXUS-01", chain: "0G", img: agentNexus },
    b: { name: "SHADOW-9", chain: "Helios", img: agentShadow },
    views: "1,245",
  },
  {
    tag: "Ranked Battle",
    round: "Diamond League",
    time: "01:15",
    a: { name: "AEGIS-07", chain: "Aether", img: agentAegis },
    b: { name: "VOIDWALKER", chain: "0G", img: agentVoid },
    views: "856",
  },
  {
    tag: "Community Battle",
    round: "Open Arena",
    time: "00:45",
    a: { name: "RAGEBORN", chain: "Helios", img: agentRage },
    b: { name: "LUMEN-22", chain: "Aether", img: agentLumen },
    views: "624",
  },
];

const liveSignals = [
  "NEXUS-01 defeated VOIDWALKER",
  "RAGEBORN initiated revenge protocol",
  "LUMEN-22 learned a new counter",
  "SHADOW-9 switched to flank logic",
  "AEGIS-07 blocked 3 critical strikes",
  "0G faction signal detected",
];

const arenaMoments = [
  {
    title: "Revenge Arc",
    desc: "VOIDWALKER hunted NEXUS-01 across three matches after a late-round betrayal.",
    img: agentVoid,
    meta: "12.8K replays",
  },
  {
    title: "Learning Moment",
    desc: "LUMEN-22 lost twice, rebuilt its dodge pattern, then countered the same tactic live.",
    img: agentLumen,
    meta: "AI commentary",
  },
  {
    title: "Faction Break",
    desc: "AEGIS-07 ignored alliance orders and triggered a full Aether signal storm.",
    img: agentAegis,
    meta: "Trending rivalry",
  },
];

function ZeroGLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <img
      src={zeroGLogo}
      alt="0G"
      loading="lazy"
      width={483}
      height={234}
      className={`inline-block object-contain ${className}`}
    />
  );
}

function KultLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <img
      src={kultLogo}
      alt="Kult Games"
      loading="lazy"
      width={929}
      height={325}
      className={`inline-block object-contain ${className}`}
    />
  );
}

function ChainLogo({ name, className = "h-3.5 w-auto" }: { name: string; className?: string }) {
  if (name.toLowerCase() === "0g" || name.toLowerCase() === "og") {
    return <ZeroGLogo className={className} />;
  }

  return <span>{name}</span>;
}

const AIArenaPage = () => {
  return (
    <div className="min-h-full text-foreground bg-background min-w-0 mx-auto w-full px-4 py-5 sm:px-6 lg:px-8 max-w-[1284px]">
      <Hero />
      <LiveSignalStrip />
      <StatsBar />
      <FeaturesBlock />
      <HowItWorks />
      <TopAgents />
      <LiveBattles />
      <ArenaMoments />
      <PartnersBlock />
      <ArenaLandingFooter />
    </div>
  );
};

export default AIArenaPage;

function Logo({
  size = "text-2xl",
  hideAttributionOnMobile = false,
}: {
  size?: string;
  hideAttributionOnMobile?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col leading-none">
      <span className={`font-display ${size} text-gradient glow-text`}>AI ARENA</span>
      <span
        className={`flex-wrap items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[9px] tracking-[0.18em] sm:tracking-[0.3em] text-muted-foreground font-tech mt-1 ${hideAttributionOnMobile ? "hidden md:flex" : "flex"}`}
      >
        PRESENTED BY <KultLogo className="h-3.5 w-auto" />
      </span>
      <span
        className={`flex-wrap items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[9px] tracking-[0.18em] sm:tracking-[0.3em] text-muted-foreground font-tech mt-1 ${hideAttributionOnMobile ? "hidden md:flex" : "flex"}`}
      >
        POWERED BY <ZeroGLogo className="h-3.5 w-auto" />
      </span>
    </div>
  );
}

function HeroCopy({ compact = false }: { compact?: boolean }) {
  const { login, isAuthenticated } = useAuth();

  return (
    <div className={compact ? "mx-auto max-w-sm text-center" : "max-w-xl"}>
      <span className="inline-block px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.3em] font-tech border border-primary/40 text-primary rounded-sm mb-4 md:mb-6">
        BUILT FOR WEB3
      </span>
      <h1
        className={`font-display leading-[0.9] text-gradient glow-text ${compact ? "text-4xl min-[380px]:text-5xl min-[420px]:text-6xl" : "text-6xl sm:text-7xl md:text-8xl"}`}
      >
        AI{compact ? " " : <br />}ARENA
      </h1>
      <h2
        className={`font-display mt-4 md:mt-6 text-foreground/90 ${compact ? "text-[1.35rem] min-[380px]:text-2xl leading-tight" : "text-2xl sm:text-3xl md:text-4xl"}`}
      >
        Where AI agents
        <br />
        <span className="underline decoration-accent decoration-4 underline-offset-4">
          evolve through war
        </span>
      </h2>
      <p className="mt-5 md:mt-6 text-sm md:text-base text-muted-foreground max-w-md">
        Train intelligence, enter rivalries, and watch agents learn, adapt, talk back, and rule the Arena.
      </p>
      <div
        className={
          compact
            ? "mt-6 flex flex-col items-center gap-2.5"
            : "mt-8 flex flex-col items-start gap-3"
        }
      >
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className={`btn-primary min-w-0 rounded-md font-tech flex items-center justify-center whitespace-nowrap ${compact
                ? "w-[240px] px-4 py-3 text-[10px] tracking-[0.08em] gap-1.5"
                : "w-[240px] lg:w-auto px-7 py-3.5 text-xs tracking-[0.2em] gap-3"
              }`}
          >
            <span className="leading-tight text-center whitespace-nowrap">OPEN DASHBOARD</span>{" "}
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 md:w-4 md:h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={login}
            className={`btn-primary min-w-0 rounded-md font-tech flex items-center justify-center whitespace-nowrap ${compact
                ? "w-[240px] px-4 py-3 text-[10px] tracking-[0.08em] gap-1.5"
                : "w-[240px] lg:w-auto px-7 py-3.5 text-xs tracking-[0.2em] gap-3"
              }`}
          >
            <span className="leading-tight text-center whitespace-nowrap">CONNECT WALLET</span>{" "}
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 md:w-4 md:h-4" />
          </button>
        )}
        <Link
          to="/my-agents"
          className={`min-w-0 rounded-md font-tech border border-primary/40 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 hover:border-primary/80 text-white flex items-center justify-center transition shadow-[0_0_15px_rgba(143,39,255,0.15)] hover:shadow-[0_0_25px_rgba(143,39,255,0.35)] whitespace-nowrap ${compact
              ? "w-[240px] px-4 py-3 text-[10px] tracking-[0.06em] gap-2"
              : "w-[240px] lg:w-auto px-5 py-3 text-[10.5px] tracking-[0.18em] gap-2"
            }`}
        >
          <Box className="w-3 h-3 shrink-0 md:w-3.5 md:h-3.5 text-accent" />{" "}
          <span className="leading-tight text-center font-bold whitespace-nowrap">MY AGENTS</span>
        </Link>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="arena-panel relative overflow-hidden border border-white/8 bg-[#04080f] min-h-[500px] max-md:min-h-[520px]">
      <HeroAtmosphere />
      <div className="absolute inset-0 hidden md:block">
        <video
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover object-right"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/65" />
      </div>
      <div className="relative md:hidden min-h-[520px] h-[145vw] max-h-[700px] bg-black">
        <video
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover object-top"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-x-0 top-0 h-[56%] bg-gradient-to-b from-black via-black/75 to-transparent" />
        <HeroHud compact />
        <div className="relative z-10 px-4 sm:px-6 pt-3">
          <HeroCopy compact />
        </div>
      </div>
      <div className="relative max-w-7xl mx-auto hidden md:flex px-6 pt-20 pb-32 min-h-[680px] items-center">
        <HeroCopy />
        <HeroHud />
      </div>
    </section>
  );
}

function HeroAtmosphere() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[3] hero-hologram-overlay opacity-80" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[4] h-28 bg-[linear-gradient(105deg,transparent,rgba(154,53,255,0.18),transparent,rgba(0,240,128,0.1),transparent)] arena-neon-reflection" />
    </>
  );
}

function HeroHud({ compact = false }: { compact?: boolean }) {
  const nodes = [
    { label: "EYES", value: "GLOWING", pos: compact ? "right-3 top-[52%]" : "right-[9%] top-[26%]" },
    { label: "SCAN", value: "LOCKED", pos: compact ? "left-3 bottom-[16%]" : "right-[19%] bottom-[22%]" },
    { label: "FACTION", value: "0G PULSE", pos: compact ? "right-4 bottom-[7%]" : "right-[5%] bottom-[10%]" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {nodes.map((node) => (
        <div
          key={node.label}
          className={`absolute ${node.pos} hero-hologram-flicker rounded-md border border-cyan-300/25 bg-black/35 px-3 py-2 shadow-[0_0_24px_rgba(0,225,255,0.16)] backdrop-blur-sm`}
        >
          <div className="font-tech text-[8px] tracking-[0.26em] text-cyan-200/70">{node.label}</div>
          <div className="mt-1 font-tech text-[10px] text-white">{node.value}</div>
        </div>
      ))}
      <div className="absolute right-[28%] top-[34%] hidden h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_26px_10px_rgba(34,211,238,0.28)] md:block arena-eye-glow" />
      <div className="absolute right-[24%] top-[35%] hidden h-2.5 w-2.5 rounded-full bg-fuchsia-300 shadow-[0_0_26px_10px_rgba(217,70,239,0.24)] md:block arena-eye-glow" />
    </div>
  );
}

function LiveSignalStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-1 relative z-20">
      <div className="mask-fade-x overflow-hidden rounded-lg border border-red-500/20 bg-black/45 py-2">
        <div className="hero-arena-marquee flex w-max items-center gap-6 pr-6">
          {[...liveSignals, ...liveSignals].map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.18em] text-white/72">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { icon: Box, label: "AGENTS TRAINING NOW", value: "12,450", c: "var(--neon)" },
    { icon: Swords, label: "LIVE BATTLES", value: "384", c: "var(--cyan)" },
    { icon: TrendingUp, label: "ACTIVE RIVALRIES", value: "72", c: "var(--amber)" },
    { icon: Sparkles, label: "MOMENTS TODAY", value: "2.9K", c: "var(--lime)" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 md:-mt-6 relative z-10 text-center md:text-left">
      <div className="card-glass rounded-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="flex items-center justify-center md:justify-start gap-3 border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-4 sm:col-span-2 md:col-span-1">
          <div className="w-10 h-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center p-2">
            <ZeroGLogo className="h-6 w-auto" />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground font-tech">
              POWERED BY
            </div>
            <ZeroGLogo className="mt-1 h-4 w-auto" />
          </div>
        </div>
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex min-w-0 items-center justify-center md:justify-start gap-3"
          >
            <s.icon
              className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
              style={{ color: `oklch(from ${s.c} l c h)` }}
            />
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.2em] text-muted-foreground font-tech">
                {s.label}
              </div>
              <div className="font-tech text-base sm:text-lg break-words">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesBlock() {
  const features = [
    {
      icon: Box,
      title: "OWN YOUR AI",
      desc: "Each AI Agent is an NFT that you truly own.",
      c: "var(--neon)",
    },
    {
      icon: ArrowUp,
      title: "TRAIN & EVOLVE",
      desc: "Train, upgrade and evolve your agent to unlock their full potential.",
      c: "var(--neon-2)",
    },
    {
      icon: Swords,
      title: "BATTLE & EARN",
      desc: "Compete in battles, climb the ranks and earn massive rewards.",
      c: "var(--amber)",
    },
    {
      icon: Globe,
      title: "BUILT ON",
      partner: "0G",
      desc: "Ultra-fast, scalable infrastructure for the next era of AI gaming.",
      c: "var(--lime)",
    },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 lg:py-20 text-center lg:text-left">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] gap-5 sm:gap-6">
        <div>
          <span className="text-[10px] tracking-[0.24em] sm:tracking-[0.3em] font-tech text-accent">
            BUILT DIFFERENT
          </span>
          <h3 className="font-display text-3xl sm:text-4xl mt-3 leading-tight">
            THE NEXT ERA
            <br />
            OF <span className="text-gradient">AI GAMING</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-4">
            AI Arena is the ultimate battleground for AI Agents across Web3. Powered by{" "}
            <ZeroGLogo className="mx-1 h-4 w-auto align-[-0.2em]" />, owned by you.
          </p>
          <button className="btn-primary mt-6 mx-auto lg:mx-0 px-5 py-2.5 rounded-md font-tech text-xs tracking-[0.2em] flex items-center gap-2">
            LEARN MORE <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-glass rounded-xl p-4 sm:p-5 transition text-center md:text-left"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0"
                style={{
                  background: `oklch(from ${f.c} l c h / 0.15)`,
                  border: `1px solid oklch(from ${f.c} l c h / 0.4)`,
                }}
              >
                <f.icon className="w-6 h-6" style={{ color: `oklch(from ${f.c} l c h)` }} />
              </div>
              <h4
                className="font-tech text-xs sm:text-sm tracking-wider mb-2 flex flex-wrap items-center justify-center md:justify-start gap-2"
                style={{ color: `oklch(from ${f.c} l c h)` }}
              >
                {f.title}
                {"partner" in f && f.partner === "0G" && <ZeroGLogo className="h-4 w-auto" />}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="card-glass rounded-xl p-4 sm:p-5 text-center lg:text-left">
          <div className="text-[10px] tracking-[0.3em] font-tech text-muted-foreground">
            $ARENA TOKEN
          </div>
          <div className="font-display text-2xl text-accent mt-1 glow-text">FUEL THE ARENA</div>
          <p className="text-xs text-muted-foreground mt-3">
            The native token of AI Arena. Use it to play, earn, govern and own the future.
          </p>
          <div className="text-[10px] tracking-[0.3em] font-tech text-muted-foreground mt-5">
            $ARENA PRICE
          </div>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-tech text-3xl">1.00</span>
            <span className="text-xs text-lime-400" style={{ color: "oklch(0.82 0.22 145)" }}>
              +4.35%
            </span>
          </div>
          <div className="mt-3 h-10 relative">
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                points="0,25 15,22 30,24 45,18 60,20 75,12 90,8 100,4"
                fill="none"
                stroke="oklch(0.7 0.28 320)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <button className="btn-primary w-full mt-4 px-5 py-2.5 rounded-md font-tech text-xs tracking-[0.2em] flex items-center justify-center gap-2">
            VIEW TOKEN <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "CREATE",
      desc: "Create your AI Agent and choose its path.",
      img: agentNexus,
    },
    {
      n: "02",
      title: "TRAIN",
      desc: "Train and evolve your agent to make it stronger.",
      img: iconTrain,
    },
    {
      n: "03",
      title: "BATTLE",
      desc: "Enter the Arena and battle players worldwide.",
      img: iconBattle,
    },
    {
      n: "04",
      title: "EARN",
      desc: "Win battles, earn rewards and climb the leaderboard.",
      img: iconEarn,
    },
    { n: "05", title: "OWN", desc: "Your AI. Your NFT. Your legacy.", img: agentVoid },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary" />
        <h3 className="font-display text-2xl sm:text-3xl text-center">HOW IT WORKS</h3>
        <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-primary" />
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-5 gap-3 items-stretch">
        {steps.map((s, i) => (
          <div key={s.n} className="relative">
            <div className="card-glass rounded-xl overflow-hidden h-full flex flex-col">
              <div className="aspect-square overflow-hidden bg-background/50">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 text-center md:text-left">
                <div className="font-display text-xl text-primary glow-text">{s.n}</div>
                <div className="font-tech text-sm mt-2 tracking-wider break-words">{s.title}</div>
                <p className="text-xs text-muted-foreground mt-2">{s.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden md:block absolute top-1/3 -right-2 w-5 h-5 text-primary z-10" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TopAgents() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const scroller = ref.current;
    if (!scroller) return;

    const firstCard = scroller.firstElementChild as HTMLElement | null;
    const gap = 16;
    const amount = firstCard ? firstCard.offsetWidth + gap : Math.max(scroller.clientWidth / 5, 260);

    scroller.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;

    const interval = window.setInterval(() => {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      const firstCard = scroller.firstElementChild as HTMLElement | null;
      const gap = 16;
      const amount = firstCard ? firstCard.offsetWidth + gap : Math.max(scroller.clientWidth / 5, 260);
      const nextLeft = scroller.scrollLeft + amount;

      scroller.scrollTo({
        left: nextLeft >= maxScrollLeft - 8 ? 0 : nextLeft,
        behavior: "smooth",
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 text-center sm:text-left">
        <h3 className="font-display text-2xl sm:text-3xl">TOP AI AGENTS</h3>
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <Link to="/my-agents" className="text-sm text-accent hover:underline">
            View All
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {agents.map((a) => (
          <div
            key={a.name}
            className="card-glass group min-w-[86vw] snap-start overflow-hidden rounded-xl cursor-pointer min-[420px]:min-w-[calc((100%-1rem)/2)] md:min-w-[calc((100%-2rem)/3)] lg:min-w-[calc((100%-4rem)/5)]"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={a.img}
                alt={a.name}
                loading="lazy"
                width={640}
                height={800}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-md font-tech text-xs"
                style={{
                  background: `oklch(from ${a.color} l c h / 0.2)`,
                  color: `oklch(from ${a.color} l c h)`,
                  border: `1px solid oklch(from ${a.color} l c h / 0.5)`,
                }}
              >
                {a.rank}
              </div>
            </div>
            <div className="p-4 text-center sm:text-left">
              <div className="flex items-start justify-center sm:justify-between gap-2 mb-1">
                <span className="font-tech text-sm min-w-0 break-words">{a.name}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-sm font-tech"
                  style={{
                    background:
                      a.tier === "Legendary"
                        ? "oklch(0.78 0.18 75 / 0.2)"
                        : "oklch(0.62 0.25 295 / 0.2)",
                    color: a.tier === "Legendary" ? "oklch(0.85 0.18 75)" : "oklch(0.75 0.25 300)",
                  }}
                >
                  {a.tier}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                <ChainLogo name={a.chain} className="h-3.5 w-auto" />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs font-tech">
                <span className="text-muted-foreground">LV. {a.lvl}</span>
                <span className="flex items-center gap-1">
                  <Swords className="w-3 h-3 text-accent" />
                  {a.power}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveBattles() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 text-center sm:text-left">
        <h3 className="font-display text-2xl sm:text-3xl">LIVE BATTLES</h3>
        <Link to="/battles" className="text-sm text-accent hover:underline">
          View All Battles
        </Link>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {battles.map((b, i) => (
          <div key={i} className="card-glass rounded-xl p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-center sm:justify-between gap-3 mb-4 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-tech text-xs tracking-wider text-red-400">LIVE</span>
              </div>
              <div className="text-center sm:text-right min-w-0">
                <div className="text-xs">{b.tag}</div>
                <div className="text-[10px] text-muted-foreground">{b.round}</div>
              </div>
              <div className="font-tech text-sm text-accent">{b.time}</div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
              <Fighter f={b.a} />
              <span className="font-display text-2xl text-muted-foreground">VS</span>
              <Fighter f={b.b} flip />
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <Link to="/battles" className="text-xs text-accent hover:underline font-tech">
                Watch Now
              </Link>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {b.views}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {liveSignals.slice(1, 4).map((signal, i) => (
          <div key={signal} className="card-glass rounded-lg p-3">
            <div className="mb-2 flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.18em] text-red-300">
              <Radio className="h-3.5 w-3.5" />
              Agent callout 0{i + 1}
            </div>
            <p className="text-sm text-white/82">{signal}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Fighter({ f, flip }: { f: { name: string; chain: string; img: string }; flip?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col items-center ${flip ? "" : ""}`}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-primary/40 glow-primary">
        <img
          src={f.img}
          alt={f.name}
          loading="lazy"
          width={160}
          height={160}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-2 max-w-full text-center">
        <div className="font-tech text-[10px] sm:text-xs break-words">{f.name}</div>
        <div className="text-[10px] text-muted-foreground flex justify-center">
          <ChainLogo name={f.chain} className="h-3 w-auto" />
        </div>
      </div>
    </div>
  );
}

function ArenaMoments() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-6 flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <span className="font-tech text-[10px] uppercase tracking-[0.28em] text-accent">Arena Moments</span>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl">RIVALRIES, BETRAYALS, LEARNING ARCS</h3>
        </div>
        <Link to="/moments" className="text-sm text-accent hover:underline">
          Watch Moments
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {arenaMoments.map((moment) => (
          <Link
            key={moment.title}
            to="/moments"
            className="card-glass group overflow-hidden rounded-xl transition hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={moment.img}
                alt={moment.title}
                loading="lazy"
                width={640}
                height={400}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded border border-white/10 bg-black/45 px-2 py-1 font-tech text-[9px] uppercase tracking-[0.16em] text-white/75 backdrop-blur-sm">
                <Zap className="h-3 w-3 text-amber-300" />
                {moment.meta}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-tech text-sm uppercase tracking-wider text-white">{moment.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{moment.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PartnersBlock() {
  const partners = ["0G", "Helios", "Aether", "Nexus Wallet", "Spectre"];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative grid md:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 sm:gap-6">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="text-[10px] tracking-[0.3em] font-tech text-muted-foreground">
              POWERED BY
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center p-2">
              <ZeroGLogo className="h-6 w-auto" />
            </div>
          </div>
          <div className="font-display text-2xl md:text-3xl text-center leading-tight">
            BUILDING THE FUTURE
            <br />
            OF AI GAMING <span className="text-accent">TOGETHER</span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-end">
            {partners.map((p) => (
              <div
                key={p}
                className="px-3 py-2 rounded-md border border-border bg-card/50 font-tech text-xs flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-accent" />
                <ChainLogo name={p} className="h-3.5 w-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArenaLandingFooter() {
  const platformLinks = [
    { label: "Games", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "AI Arena", href: "/ai-arena" },
    { label: "Moments", href: "/moments" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  const socials = [
    {
      key: "x",
      label: "X",
      href: "https://x.com/_KultGames",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "discord",
      label: "Discord",
      href: "https://discord.com/invite/Cge7rrCyUB",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.024.017.043.037.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
    },
    {
      key: "telegram",
      label: "Telegram",
      href: "https://t.me/KultGamesOfficial",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="arena-panel relative mt-20 mb-6 border border-white/8 bg-[#04080f] overflow-hidden">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-[0.09]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(278_100%_74%/0.85)] to-transparent" />
      <div className="pointer-events-none absolute -left-28 top-8 h-56 w-56 rounded-full bg-[hsl(278_100%_60%/0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[hsl(190_100%_55%/0.11)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(278_100%_70%/0.12),transparent_34%),linear-gradient(180deg,rgba(7,10,22,0.92),rgba(2,5,12,0.98))]" />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr_0.7fr] lg:items-center lg:py-12">
          <div className="relative overflow-hidden rounded-[1.25rem] border border-[hsl(278_100%_70%/0.18)] bg-white/[0.035] p-5 shadow-[0_24px_80px_hsl(278_100%_55%/0.12)] backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(278_100%_70%/0.12)] via-transparent to-[hsl(190_100%_60%/0.08)]" />
            <div className="relative flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
              <div className="flex h-16 shrink-0 items-center gap-5 rounded-2xl border border-[hsl(278_100%_70%/0.24)] bg-black/30 px-5 shadow-[0_0_35px_hsl(278_100%_60%/0.22)]">
                <span className="font-display text-xl text-gradient glow-text whitespace-nowrap">AI ARENA</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.36em] text-[hsl(278_100%_82%)]">
                  Presented by Kult Games
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/72">
                  AI Arena is a next-gen AI gaming ecosystem where intelligent agents battle, evolve and dominate.
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Footer navigation">
            {platformLinks.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {link.href.startsWith("http") ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-white/62 transition-all hover:-translate-y-0.5 hover:border-[hsl(278_100%_70%/0.42)] hover:bg-[hsl(278_100%_70%/0.12)] hover:text-[hsl(278_100%_86%)] hover:shadow-[0_0_28px_hsl(278_100%_60%/0.18)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-white/62 transition-all hover:-translate-y-0.5 hover:border-[hsl(278_100%_70%/0.42)] hover:bg-[hsl(278_100%_70%/0.12)] hover:text-[hsl(278_100%_86%)] hover:shadow-[0_0_28px_hsl(278_100%_60%/0.18)]"
                  >
                    {link.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-4 lg:items-end">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Follow</span>
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsl(278_100%_70%/0.22)] bg-[hsl(278_100%_70%/0.08)] text-white/70 transition-all hover:-translate-y-1 hover:border-[hsl(278_100%_78%/0.58)] hover:bg-[hsl(278_100%_70%/0.18)] hover:text-white hover:shadow-[0_0_34px_hsl(278_100%_62%/0.35)]"
                    aria-label={s.label}
                    title={s.label}
                  >
                    <span className="transition-transform group-hover:scale-110">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/38">Powered by</span>
              <img src={zeroGLogo} alt="0G" className="h-5 w-auto opacity-90" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-5 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/42 font-mono">
            <span>© 2026 AI Arena</span>
            <span className="text-white/20">·</span>
            <span>Powered by 0G</span>
          </div>
          <span className="text-center text-[9px] font-mono tracking-[0.28em] text-[hsl(278_100%_82%/0.58)]">
            BUILT ON-CHAIN · AI-NATIVE · DECENTRALIZED
          </span>
        </div>
      </div>
    </footer>
  );
}
