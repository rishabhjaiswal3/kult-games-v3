import { useRef, useState } from "react";
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
  Twitter,
  Send,
  Youtube,
  Instagram,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroTrio from "@/assets/hero-trio.png";
import heroMobile from "@/assets/hero-mobile.png";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import agentNexus from "@/assets/agent-nexus.jpg";
import agentShadow from "@/assets/agent-shadow.jpg";
import agentAegis from "@/assets/agent-aegis.jpg";
import agentVoid from "@/assets/agent-voidwalker.jpg";
import agentRage from "@/assets/agent-rageborn.jpg";
import agentLumen from "@/assets/agent-lumen.jpg";
import iconTrain from "@/assets/icon-train.jpg";
import iconBattle from "@/assets/icon-battle.jpg";
import iconEarn from "@/assets/icon-earn.jpg";
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
    <div className="min-h-full text-foreground overflow-x-hidden bg-background">
      <Hero />
      <StatsBar />
      <FeaturesBlock />
      <HowItWorks />
      <TopAgents />
      <LiveBattles />
      <PartnersBlock />
      <Subscribe />
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
  const { login } = useAuth();

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
        battle for{" "}
        <span className="underline decoration-accent decoration-4 underline-offset-4">
          supremacy
        </span>
      </h2>
      <p className="mt-5 md:mt-6 text-sm md:text-base text-muted-foreground max-w-md">
        Collect, train, and battle unique AI Agents.
        <br />
        Own your journey. Rule the Arena.
      </p>
      <div
        className={
          compact
            ? "mt-6 flex flex-col items-center gap-2.5"
            : "mt-8 flex flex-col items-start gap-3"
        }
      >
        <button
          type="button"
          onClick={login}
          className={`btn-primary min-w-0 rounded-md font-tech flex items-center justify-center whitespace-nowrap ${
            compact
              ? "w-[240px] px-4 py-3 text-[10px] tracking-[0.08em] gap-1.5"
              : "w-[240px] lg:w-auto px-7 py-3.5 text-xs tracking-[0.2em] gap-3"
          }`}
        >
          <span className="leading-tight text-center whitespace-nowrap">CONNECT WALLET</span>{" "}
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 md:w-4 md:h-4" />
        </button>
        <Link
          to="/my-agents"
          className={`min-w-0 rounded-md font-tech border border-primary/40 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 hover:border-primary/80 text-white flex items-center justify-center transition shadow-[0_0_15px_rgba(143,39,255,0.15)] hover:shadow-[0_0_25px_rgba(143,39,255,0.35)] whitespace-nowrap ${
            compact
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hidden md:block">
        <img
          src={heroTrio}
          alt="AI Arena agents"
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/65" />
      </div>
      <div className="relative md:hidden min-h-[640px] h-[185vw] max-h-[880px] bg-black">
        <img
          src={heroMobile}
          alt="AI Arena agents"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-x-0 top-0 h-[56%] bg-gradient-to-b from-black via-black/75 to-transparent" />
        <div className="relative z-10 px-4 sm:px-6 pt-3">
          <HeroCopy compact />
        </div>
      </div>
      <div className="relative max-w-7xl mx-auto hidden md:flex px-6 pt-20 pb-32 min-h-[680px] items-center">
        <HeroCopy />
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { icon: Box, label: "TOTAL AGENTS", value: "1,248,721", c: "var(--neon)" },
    { icon: Swords, label: "BATTLES TODAY", value: "24,891", c: "var(--cyan)" },
    { icon: TrendingUp, label: "TOTAL PRIZE POOL", value: "$2,451,891", c: "var(--amber)" },
    { icon: Sparkles, label: "ACTIVE USERS", value: "12,450", c: "var(--lime)" },
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
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
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
        className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto scrollbar-none"
      >
        {agents.map((a) => (
          <div key={a.name} className="card-glass rounded-xl overflow-hidden group cursor-pointer">
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

function Subscribe() {
  const [email, setEmail] = useState("");
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center text-center md:text-left">
        <div>
          <div className="text-xs tracking-[0.3em] font-tech text-accent mb-2">STAY UPDATED</div>
          <p className="text-sm text-muted-foreground">
            Get the latest news, updates and exclusive rewards.
          </p>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col min-[420px]:flex-row gap-2 card-glass rounded-md p-1"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
            className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button className="btn-primary px-5 py-2 rounded-md font-tech text-xs tracking-[0.16em] sm:tracking-[0.2em] flex items-center justify-center gap-2">
            SUBSCRIBE <ArrowUpRight className="w-3 h-3" />
          </button>
        </form>
        <div>
          <div className="text-xs tracking-[0.3em] font-tech text-accent mb-3">FOLLOW US</div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {[
              { icon: Twitter, href: "https://x.com" },
              { icon: MessageCircle, href: "https://discord.com" },
              { icon: Send, href: "https://telegram.org" },
              { icon: Youtube, href: "https://youtube.com" },
              { icon: Instagram, href: "https://instagram.com" },
            ].map(({ icon: Ic, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-md card-glass flex items-center justify-center hover:border-primary transition"
              >
                <Ic className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArenaLandingFooter() {
  const platformLinks: Record<string, string> = {
    Games: "/games",
    Inventory: "/inventory",
    "AI Arena": "/ai-arena",
    Moments: "/moments",
    Leaderboard: "/leaderboard",
  };

  const cols = [
    { title: "PLATFORM", items: ["Games", "Inventory", "AI Arena", "Moments", "Leaderboard"] },
    { title: "RESOURCES", items: ["Docs", "Blog", "Help Center", "Brand Kit", "Careers"] },
    {
      title: "COMPANY",
      items: ["About Kult Games", "Partners", "Terms of Service", "Privacy Policy", "Contact"],
    },
  ];
  return (
    <footer className="border-t border-border mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid sm:grid-cols-2 md:grid-cols-5 gap-8 text-center sm:text-left">
        <div className="md:col-span-2 [&>div:first-child]:items-center sm:[&>div:first-child]:items-start">
          <Logo />
          <p className="text-sm text-muted-foreground mt-4 max-w-xs">
            AI Arena is a next-gen AI gaming ecosystem where intelligent agents battle, evolve and
            dominate.
          </p>
          <p className="text-xs text-muted-foreground mt-6">
            © 2026 AI Arena. All rights reserved.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="font-tech text-xs tracking-[0.2em] text-foreground mb-4">{c.title}</div>
            <ul className="space-y-2">
              {c.items.map((i) => {
                const href = platformLinks[i] ?? "#";
                const content =
                  i === "About Kult Games" ? (
                    <>
                      About <KultLogo className="h-4 w-auto" />
                    </>
                  ) : (
                    i
                  );

                return (
                  <li key={i}>
                    {href === "#" ? (
                      <span className="text-sm text-muted-foreground inline-flex items-center justify-center sm:justify-start gap-1.5">
                        {content}
                      </span>
                    ) : (
                      <Link
                        to={href}
                        className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center justify-center sm:justify-start gap-1.5"
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
