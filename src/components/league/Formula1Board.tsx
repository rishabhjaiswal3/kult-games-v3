import { useEffect, useRef } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Box,
  ChevronRight,
  Crosshair,
  Headphones,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import formula1Video from "@/assets/formula1.mp4";
import kultLogo from "@/assets/Kult Logo.png";
import f1CarHero from "@/assets/f1/f1-car-hero.jpg";
import f1CarTransparent from "@/assets/f1/f1-car-transparent.png";
import assassinCard from "@/assets/f1/agent-cards/assassin.jpg";
import berserkerCard from "@/assets/f1/agent-cards/berserker.jpg";
import defenderCard from "@/assets/f1/agent-cards/defender.jpg";
import hybridCard from "@/assets/f1/agent-cards/hybrid.jpg";
import supportCard from "@/assets/f1/agent-cards/support.jpg";
import tacticianCard from "@/assets/f1/agent-cards/tactician.jpg";
import assassinStill from "@/assets/f1/agent-stills/assassin.jpg";
import berserkerStill from "@/assets/f1/agent-stills/berserker.jpg";
import defenderStill from "@/assets/f1/agent-stills/defender.jpg";
import hybridStill from "@/assets/f1/agent-stills/hybrid.jpg";
import supportStill from "@/assets/f1/agent-stills/support.jpg";
import tacticianStill from "@/assets/f1/agent-stills/tactician.jpg";
import { LEAGUE_ARENA_AGENTS } from "@/constants/leagueAgents";
import { cn } from "@/lib/utils";

const AGENT_STILLS: Record<string, string> = {
  HYBRID: hybridStill,
  DEFENDER: defenderStill,
  TACTICIAN: tacticianStill,
  SUPPORT: supportStill,
  BERSERKER: berserkerStill,
  ASSASSIN: assassinStill,
};

const AGENT_CARDS: Record<string, string> = {
  HYBRID: hybridCard,
  DEFENDER: defenderCard,
  TACTICIAN: tacticianCard,
  ASSASSIN: assassinCard,
  SUPPORT: supportCard,
  BERSERKER: berserkerCard,
};

const BANNER_AGENTS = [
  { name: "HYBRID", role: "Strategist", accent: "#a855f7", Icon: Sparkles },
  { name: "DEFENDER", role: "Guardian", accent: "#3b82f6", Icon: Shield },
  { name: "ASSASSIN", role: "Risk Taker", accent: "#ef4444", Icon: Crosshair },
  { name: "TACTICIAN", role: "Engineer", accent: "#14b8a6", Icon: Headphones },
  { name: "SUPPORT", role: "Analyzer", accent: "#f59e0b", Icon: BarChart3 },
  { name: "BERSERKER", role: "Predictor", accent: "#e5e7eb", Icon: Zap },
] as const;

function AgentAvatar({
  name,
  className,
  size = "md",
  glow,
}: {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  glow?: string;
}) {
  const src = AGENT_STILLS[name] ?? hybridStill;
  const sizeClass = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  return (
    <div
      className={cn("shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/40", sizeClass, className)}
      style={glow ? { boxShadow: `0 0 14px ${glow}66` } : undefined}
    >
      <img src={src} alt={name} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
    </div>
  );
}

function Sparkline({
  points,
  color,
  fill = true,
  className,
}: {
  points: number[];
  color: string;
  fill?: boolean;
  className?: string;
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * 100;
    const y = 100 - ((p - min) / range) * 100;
    return `${x},${y}`;
  });
  const line = coords.join(" ");
  const area = `0,100 ${line} 100,100`;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-10 w-full", className)} aria-hidden>
      {fill ? <polygon points={area} fill={color} opacity="0.22" /> : null}
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Formula1Background() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      /* autoplay may be blocked */
    });
  }, []);

  return (
    <div className="absolute inset-0 size-full overflow-hidden" aria-hidden>
      <video
        ref={videoRef}
        src={formula1Video}
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 size-full max-w-none object-cover object-[center_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/35 to-transparent" />
    </div>
  );
}

const SESSION_STRIP = [
  { id: "fp1", label: "Practice 1", status: "done" as const },
  { id: "fp2", label: "Practice 2", status: "done" as const },
  { id: "fp3", label: "Practice 3", status: "done" as const },
  { id: "qual", label: "Qualifying", status: "done" as const },
  { id: "race", label: "Race", status: "live" as const },
];

function LeagueEventBanner() {
  return (
    <section className="relative overflow-hidden lg:col-span-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(139,92,246,0.16),transparent_55%)]" />
        <div className="absolute -right-10 top-1/3 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* 35% left / 65% right */}
      <div className="relative z-10 grid grid-cols-1 items-end gap-5 py-2 lg:grid-cols-[7fr_13fr] lg:gap-6">
        {/* Left 35% — copy from event promo; no figures/prices/players */}
        <div className="relative z-20 flex min-w-0 flex-col justify-end gap-4 pb-1 lg:pr-3">
          <img
            src={kultLogo}
            alt="Kult"
            className="h-11 w-auto object-contain object-left sm:h-12"
          />

          <div>
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live event
              </span>
              <span className="font-tech text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
                F1 League
              </span>
            </div>
            <h2 className="font-tech text-4xl font-black uppercase leading-[0.88] tracking-tight text-white sm:text-5xl">
              Belgium
            </h2>
            <p className="mt-1.5 font-tech text-2xl font-black uppercase italic tracking-wide text-violet-400 sm:text-3xl">
              Grand Prix 2026
            </p>
            <p className="mt-2 font-tech text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
              Circuit de Spa-Francorchamps
            </p>
            <p className="mt-3 whitespace-nowrap text-[11px] leading-snug text-white/55 sm:text-[12px]">
              Elite AI agents compete on the world&apos;s most challenging circuit.
            </p>
            <p className="mt-1 text-[12px] leading-snug text-white/55 sm:text-[13px]">
              Build your team. Make your picks. Beat the AI. Win rewards.
            </p>
          </div>

          <button
            type="button"
            className="group inline-flex w-full max-w-sm items-center justify-between gap-4 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-3.5 text-left shadow-[0_8px_28px_rgba(109,40,217,0.35)] transition hover:border-violet-300/50 hover:brightness-110 sm:w-auto"
          >
            <span>
              <span className="block font-tech text-[12px] font-bold uppercase tracking-wider text-white">
                Pick your AI team
              </span>
              <span className="mt-0.5 block font-tech text-[9px] font-medium uppercase tracking-[0.16em] text-white/75">
                Compete. Predict. Win.
              </span>
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 transition group-hover:bg-white/25">
              <ChevronRight className="h-4 w-4 text-white" />
            </span>
          </button>
        </div>

        {/* Right 65% — car image + agents row below */}
        <div className="relative flex min-w-0 flex-col gap-3">
          <div className="relative flex min-h-[140px] items-end justify-center sm:min-h-[180px] lg:min-h-[200px]">
            <div className="pointer-events-none absolute bottom-2 h-16 w-[70%] rounded-full bg-violet-500/25 blur-3xl" />
            <img
              src={f1CarTransparent}
              alt=""
              className="relative z-10 w-full max-w-none select-none drop-shadow-[0_16px_40px_rgba(124,58,237,0.35)]"
            />
          </div>

          <div className="relative z-20 grid w-full grid-cols-6 gap-1.5 sm:gap-2">
            {BANNER_AGENTS.map((agent) => {
              const Icon = agent.Icon;
              return (
                <div
                  key={agent.name}
                  className="group relative min-w-0 overflow-hidden rounded-xl border bg-black/30 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition hover:-translate-y-1"
                  style={{ borderColor: `${agent.accent}66` }}
                  title={`${agent.name} · ${agent.role}`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[2/3]">
                    <img
                      src={AGENT_CARDS[agent.name] ?? AGENT_STILLS[agent.name]}
                      alt={agent.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-md bg-black/55 sm:h-6 sm:w-6">
                      <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: agent.accent }} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 px-1 pb-1.5 sm:px-1.5 sm:pb-2">
                      <p className="truncate font-tech text-[8px] font-black uppercase leading-tight text-white sm:text-[10px]">
                        {agent.name}
                      </p>
                      <p className="mt-0.5 hidden truncate font-mono text-[8px] uppercase tracking-wider text-white/55 sm:block">
                        {agent.role}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const TOP_AGENTS = [
  {
    name: "HYBRID",
    tag: "Most Selected",
    accent: "#a855f7",
    confidence: 92,
    confidenceDelta: 6,
    value: "$28.4M",
    selectedBy: 42,
    spark: [42, 48, 45, 58, 62, 70, 68, 78, 85, 92],
  },
  {
    name: "DEFENDER",
    tag: "Best Strategist",
    accent: "#3b82f6",
    confidence: 88,
    confidenceDelta: 4,
    value: "$24.1M",
    selectedBy: 38,
    spark: [55, 52, 60, 58, 64, 70, 72, 80, 84, 88],
  },
  {
    name: "ASSASSIN",
    tag: "Highest Risk",
    accent: "#ef4444",
    confidence: 71,
    confidenceDelta: -2,
    value: "$19.8M",
    selectedBy: 27,
    spark: [30, 48, 35, 62, 40, 70, 45, 68, 55, 71],
  },
  {
    name: "TACTICIAN",
    tag: "Most Consistent",
    accent: "#14b8a6",
    confidence: 90,
    confidenceDelta: 3,
    value: "$22.6M",
    selectedBy: 34,
    spark: [70, 72, 74, 76, 78, 80, 82, 85, 88, 90],
  },
] as const;

const INSIGHTS = [
  {
    label: "Highest valuation gain",
    name: "Hybrid",
    agent: "HYBRID",
    metric: "+12.4%",
    sub: "+$3.1M",
    color: "#a855f7",
    spark: [20, 35, 28, 50, 42, 68, 55, 80, 72, 90],
  },
  {
    label: "Best value for money",
    name: "Defender",
    agent: "DEFENDER",
    metric: "2.68",
    sub: "Points per $M",
    color: "#3b82f6",
    spark: [40, 45, 50, 55, 58, 62, 68, 72, 78, 85],
  },
  {
    label: "Most consistent",
    name: "Tactician",
    agent: "TACTICIAN",
    metric: "92%",
    sub: "Consistency Score",
    color: "#14b8a6",
    spark: [78, 80, 82, 81, 84, 86, 88, 90, 91, 92],
  },
  {
    label: "Biggest risk taker",
    name: "Assassin",
    agent: "ASSASSIN",
    metric: "High",
    sub: "Risk Level",
    color: "#ef4444",
    spark: [30, 70, 25, 80, 35, 90, 20, 85, 40, 75],
  },
] as const;

const LEADERBOARD = [
  { rank: 1, name: "HYBRID", callsign: "NOVA-11", cost: "$28.4M", selection: "42%", points: "363", trend: 12.4 },
  { rank: 2, name: "DEFENDER", callsign: "AEGIS-04", cost: "$24.1M", selection: "38%", points: "343", trend: 8.1 },
  { rank: 3, name: "TACTICIAN", callsign: "ORION-07", cost: "$22.6M", selection: "34%", points: "335", trend: 5.2 },
  { rank: 4, name: "SUPPORT", callsign: "LYRA-09", cost: "$18.2M", selection: "29%", points: "308", trend: -1.2 },
  { rank: 5, name: "BERSERKER", callsign: "VOLT-13", cost: "$20.5M", selection: "31%", points: "305", trend: 3.6 },
  { rank: 6, name: "ASSASSIN", callsign: "NYX-06", cost: "$19.8M", selection: "27%", points: "291", trend: -2.4 },
] as const;

const FEED = [
  { ago: "1m ago", agent: "HYBRID", text: "Hybrid AI increased confidence on McLaren to 72%", delta: 8 },
  { ago: "2m ago", agent: "DEFENDER", text: "Defender flagged soft tyre deg on sector 2", delta: null },
  { ago: "3m ago", agent: "ASSASSIN", text: "Overtake alert: Assassin predicts Norris move on lap 28", delta: 5 },
  { ago: "5m ago", agent: "TACTICIAN", text: "Tactician locked undercut window for Ferrari", delta: null },
  { ago: "7m ago", agent: "SUPPORT", text: "Support raised safety car probability to 41%", delta: -3 },
  { ago: "9m ago", agent: "BERSERKER", text: "Berserker flipped Verstappen win odds to 38%", delta: 4 },
] as const;

const TRENDING = [
  { name: "HYBRID", pct: 42, delta: 12 },
  { name: "DEFENDER", pct: 38, delta: 8 },
  { name: "TACTICIAN", pct: 34, delta: -3 },
  { name: "ASSASSIN", pct: 27, delta: 5 },
] as const;

const COMBOS = [
  { agents: ["HYBRID", "DEFENDER", "TACTICIAN"] as const, pct: 68 },
  { agents: ["ASSASSIN", "HYBRID", "SUPPORT"] as const, pct: 54 },
  { agents: ["DEFENDER", "TACTICIAN", "BERSERKER"] as const, pct: 47 },
  { agents: ["HYBRID", "ASSASSIN", "TACTICIAN"] as const, pct: 41 },
] as const;

const PREDICTIONS = [
  { label: "Race winner", value: "Verstappen", conf: "38%" },
  { label: "Constructor", value: "McLaren", conf: "42%" },
  { label: "Fastest lap", value: "Norris", conf: "29%" },
  { label: "Safety car", value: "Yes", conf: "62%" },
] as const;

const QUESTIONS = [
  { id: "q1", category: "Race winner", question: "Will Max Verstappen win the next Grand Prix?", yes: 38, volume: "$842K", agentName: "HYBRID", signal: "YES" as const, confidence: 82 },
  { id: "q2", category: "Podium", question: "Will both McLarens finish on the podium?", yes: 46, volume: "$512K", agentName: "TACTICIAN", signal: "YES" as const, confidence: 76 },
  { id: "q3", category: "Safety car", question: "Will there be a safety car in the race?", yes: 62, volume: "$391K", agentName: "DEFENDER", signal: "YES" as const, confidence: 88 },
  { id: "q4", category: "Fastest lap", question: "Will Norris set the fastest lap?", yes: 29, volume: "$268K", agentName: "ASSASSIN", signal: "NO" as const, confidence: 64 },
  { id: "q5", category: "Points", question: "Will both Ferraris finish in the points?", yes: 71, volume: "$447K", agentName: "SUPPORT", signal: "YES" as const, confidence: 79 },
  { id: "q6", category: "Weather", question: "Will the race start on slicks?", yes: 78, volume: "$203K", agentName: "BERSERKER", signal: "YES" as const, confidence: 91 },
];

function RaceQuestionCard({ question }: { question: (typeof QUESTIONS)[number] }) {
  const noCents = 100 - question.yes;

  return (
    <article className="overflow-hidden rounded-xl border border-white/12 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_55%),#0b0d12] p-3.5 transition hover:border-violet-400/35">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white/80">
          {question.category}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-white/40">{question.volume} Vol</span>
      </div>

      <p className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/40">Prediction question</p>
      <p className="mt-0.5 min-h-9 font-tech text-sm font-bold text-white">{question.question}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex items-center justify-between rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-400/15"
        >
          <span>Buy Yes</span>
          <span>{question.yes}¢</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-between rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-white/75 transition hover:bg-white/[0.07]"
        >
          <span>Buy No</span>
          <span>{noCents}¢</span>
        </button>
      </div>

      <div className="mt-3 border-t border-white/10 pt-2.5">
        <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/35"># agent signal</p>
        <div
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5",
            question.signal === "YES" ? "border-violet-400/25 bg-violet-400/[0.06]" : "border-fuchsia-400/20 bg-fuchsia-400/[0.05]",
          )}
        >
          <AgentAvatar name={question.agentName} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-tech text-[9px] font-bold uppercase text-white">{question.agentName}</p>
            <p
              className={cn(
                "mt-0.5 truncate font-tech text-[9px] font-bold",
                question.signal === "YES" ? "text-violet-300" : "text-fuchsia-300",
              )}
            >
              {question.signal} · {question.confidence}%
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function QuestionsSection() {
  return (
    <section className="lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Race prediction questions</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Polymarket-style reads — lock in before lights out</p>
        </div>
        <span className="inline-flex items-center gap-2 font-tech text-[9px] uppercase tracking-widest text-violet-300/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
          {QUESTIONS.length} live
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUESTIONS.map((question) => (
          <RaceQuestionCard key={question.id} question={question} />
        ))}
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#080910]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">Race weekend · Round 8</p>
          <h2 className="mt-0.5 font-tech text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
            Monaco Grand Prix
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {[
              ["01", "Days"],
              ["23", "Hrs"],
              ["36", "Mins"],
              ["12", "Secs"],
            ].map(([v, l]) => (
              <div key={l} className="min-w-[3.25rem] rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-center">
                <p className="font-tech text-sm font-black text-white">{v}</p>
                <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">{l}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="rounded-full bg-violet-600 px-4 py-2.5 font-tech text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-violet-500"
          >
            Pick your AI team →
          </button>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden sm:aspect-auto sm:h-[320px] md:h-[360px]">
        <Formula1Background />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-tech text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Featured race</p>
            <p className="font-tech text-sm font-black uppercase text-white">Monte Carlo · 78 laps</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/20 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-red-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            Live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 border-t border-white/8 p-2 sm:grid-cols-5 sm:gap-2 sm:p-3">
        {SESSION_STRIP.map((session) => (
          <div
            key={session.id}
            className={cn(
              "rounded-lg border px-2.5 py-2 text-center",
              session.status === "live"
                ? "border-violet-400/50 bg-violet-500/15"
                : "border-white/8 bg-white/[0.03]",
            )}
          >
            <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-white/80">{session.label}</p>
            {session.status === "live" ? (
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-violet-300">Live</p>
            ) : (
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-white/35">Done</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TopAgentsSection() {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Top AI agents this week</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Updated 2 min ago</p>
        </div>
        <button type="button" className="font-tech text-[11px] font-bold uppercase tracking-wider text-violet-300 hover:text-violet-200">
          View all agents →
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TOP_AGENTS.map((agent) => (
          <article
            key={agent.name}
            className="relative min-h-[280px] overflow-hidden rounded-2xl border bg-[#0a0b12] p-3.5"
            style={{ borderColor: `${agent.accent}55` }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(circle at 85% 40%, ${agent.accent}33, transparent 55%)` }}
            />
            <div className="relative z-10 flex items-start justify-between gap-2">
              <div>
                <h4 className="font-tech text-sm font-black uppercase text-white">{agent.name}</h4>
                <p className="mt-0.5 font-tech text-[10px] font-bold uppercase tracking-wider" style={{ color: agent.accent }}>
                  {agent.tag}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-red-400/35 bg-red-500/15 px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-red-200">
                <span className="h-1 w-1 rounded-full bg-red-400" />
                Live
              </span>
            </div>

            <div className="relative z-10 mt-4 max-w-[52%] space-y-3">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">Confidence</p>
                <p className="font-tech text-xl font-black text-white">
                  {agent.confidence}%
                  <span className={cn("ml-1.5 text-xs font-bold", agent.confidenceDelta >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {agent.confidenceDelta >= 0 ? "↑" : "↓"} {Math.abs(agent.confidenceDelta)}%
                  </span>
                </p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">Value</p>
                <p className="font-tech text-lg font-black text-white">{agent.value}</p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">Selected by</p>
                <p className="font-tech text-lg font-black text-white">
                  {agent.selectedBy}%
                  <span className="ml-1 text-[10px] font-medium text-white/40">of players</span>
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-0 right-0 h-[78%] w-[58%]">
              <img
                src={AGENT_CARDS[agent.name] ?? AGENT_STILLS[agent.name]}
                alt=""
                className="h-full w-full object-cover object-[center_15%]"
                style={{ maskImage: "linear-gradient(to left, black 55%, transparent)", WebkitMaskImage: "linear-gradient(to left, black 55%, transparent)" }}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 px-1 pb-1">
              <Sparkline points={[...agent.spark]} color={agent.accent} fill={false} className="h-8 opacity-90" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InsightsSection() {
  return (
    <section>
      <div className="mb-3">
        <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">AI intelligence insights</h3>
        <p className="mt-0.5 text-[11px] text-white/45">How agents are performing across key metrics</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {INSIGHTS.map((item) => (
          <article key={item.label} className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0b12]">
            <div className="flex items-start gap-3 p-3 pb-2">
              <AgentAvatar name={item.agent} size="lg" glow={item.color} />
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">{item.label}</p>
                <p className="font-tech text-sm font-black text-white">{item.name}</p>
                <p className="mt-0.5 font-tech text-lg font-black" style={{ color: item.color }}>
                  {item.metric}
                </p>
                <p className="text-[10px] text-white/45">{item.sub}</p>
              </div>
            </div>
            <Sparkline points={[...item.spark]} color={item.color} className="h-12" />
          </article>
        ))}
      </div>
    </section>
  );
}

function LeaderboardSection() {
  const left = LEADERBOARD.slice(0, 3);
  const right = LEADERBOARD.slice(3);

  const Row = ({ row }: { row: (typeof LEADERBOARD)[number] }) => (
    <li className="grid grid-cols-[2rem_minmax(0,1.4fr)_4.5rem_4rem_3.5rem_4.5rem] items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2.5 sm:grid-cols-[2.25rem_minmax(0,1.5fr)_1fr_4.5rem_4.5rem_4rem_5rem]">
      <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-black/40 font-tech text-xs font-black text-white/60">
        {row.rank}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <AgentAvatar name={row.name} />
        <div className="min-w-0">
          <p className="truncate font-tech text-[12px] font-bold uppercase text-white">{row.name}</p>
          <p className="truncate font-mono text-[10px] text-white/40 sm:hidden">{row.callsign}</p>
        </div>
      </div>
      <p className="hidden truncate font-mono text-[11px] text-white/50 sm:block">{row.callsign}</p>
      <p className="text-right font-tech text-[11px] font-bold text-white/80">{row.cost}</p>
      <p className="hidden text-right font-tech text-[11px] font-bold text-white/70 sm:block">{row.selection}</p>
      <p className="text-right font-tech text-sm font-black text-cyan-300">{row.points}</p>
      <p
        className={cn(
          "hidden items-center justify-end gap-0.5 font-tech text-[11px] font-bold sm:inline-flex",
          row.trend >= 0 ? "text-emerald-400" : "text-rose-400",
        )}
      >
        {row.trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {Math.abs(row.trend)}%
      </p>
    </li>
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#080910] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Season 2026 leaderboard</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Agent cards · selection · live form</p>
        </div>
      </div>
      <div className="mb-2 hidden grid-cols-[2.25rem_minmax(0,1.5fr)_1fr_4.5rem_4.5rem_4rem_5rem] gap-2 px-2.5 font-mono text-[9px] uppercase tracking-wider text-white/35 sm:grid">
        <span>Rank</span>
        <span>Agent</span>
        <span>Callsign</span>
        <span className="text-right">Cost</span>
        <span className="text-right">Selection %</span>
        <span className="text-right">Points</span>
        <span className="text-right">Trend</span>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ul className="space-y-2">
          {left.map((row) => (
            <Row key={row.rank} row={row} />
          ))}
        </ul>
        <ul className="space-y-2 border-white/8 lg:border-l lg:pl-3">
          {right.map((row) => (
            <Row key={row.rank} row={row} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function DashboardSidebar() {
  return (
    <aside className="flex min-w-0 flex-col gap-3">
      <div className="rounded-2xl border border-white/10 bg-[#080910] p-3">
        <p className="mb-2.5 font-tech text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">Your dashboard</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">Your rank</p>
            <div className="mt-1 flex items-end justify-between">
              <div>
                <p className="font-tech text-2xl font-black text-white">#247</p>
                <p className="font-mono text-[10px] text-white/40">of 12,842</p>
              </div>
              <span className="inline-flex items-center gap-0.5 font-tech text-xs font-bold text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" /> 18
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">Kult points</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="font-tech text-2xl font-black text-white">12,340</p>
              <span className="inline-flex items-center gap-0.5 font-tech text-xs font-bold text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" /> 560
              </span>
            </div>
            <Sparkline points={[40, 48, 45, 55, 60, 58, 70, 75, 82, 90]} color="#a855f7" className="mt-2 h-8" />
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="relative flex min-h-[88px] items-end justify-between gap-2 p-3">
              <div className="relative z-10">
                <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">Your team</p>
                <p className="mt-1 font-tech text-lg font-black text-white">Hybrid X</p>
                <div className="mt-1 h-1 w-10 rounded-full bg-violet-500" />
              </div>
              <img src={f1CarHero} alt="" className="absolute bottom-0 right-0 h-full w-[55%] object-cover object-left opacity-90" />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
              <span className="font-mono text-[10px] text-white/45">Team value</span>
              <span className="font-tech text-sm font-black text-white">$112.5M</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#080910] p-3">
        <p className="mb-2 font-tech text-[11px] font-bold uppercase tracking-[0.16em] text-white">Kult AI prediction</p>
        <div className="grid grid-cols-2 gap-2">
          {PREDICTIONS.map((p) => (
            <div key={p.label} className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2">
              <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">{p.label}</p>
              <p className="mt-0.5 truncate font-tech text-[12px] font-bold text-white">{p.value}</p>
              <p className="font-tech text-[10px] font-bold text-violet-300">{p.conf}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#080910] p-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 font-tech text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Live race feed
          </p>
          <span className="font-mono text-[10px] text-white/45">Lap 26 / 78</span>
        </div>
        <ul className="max-h-[280px] space-y-0 overflow-y-auto pr-0.5 scrollbar-market">
          {FEED.map((item) => (
            <li key={`${item.ago}-${item.text}`} className="flex items-start gap-2.5 border-b border-white/6 py-2.5 last:border-0">
              <span className="w-12 shrink-0 pt-1 font-mono text-[9px] text-white/35">{item.ago}</span>
              <AgentAvatar name={item.agent} size="sm" />
              <p className="min-w-0 flex-1 text-[11px] leading-snug text-white/75">{item.text}</p>
              {item.delta != null ? (
                <span className={cn("shrink-0 pt-0.5 font-tech text-[10px] font-bold", item.delta >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {item.delta >= 0 ? "↑" : "↓"} {Math.abs(item.delta)}%
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#080910] p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="font-tech text-[11px] font-bold uppercase tracking-[0.14em] text-white">Trending picks</p>
            <p className="text-[10px] text-white/40">What other players are selecting</p>
          </div>
          <button type="button" className="shrink-0 font-tech text-[10px] font-bold uppercase tracking-wider text-violet-300">
            View all →
          </button>
        </div>
        <ul className="space-y-3">
          {TRENDING.map((row, i) => (
            <li key={row.name}>
              <div className="mb-1 flex items-center gap-2">
                <span className="w-3 font-mono text-[10px] text-white/35">{i + 1}</span>
                <AgentAvatar name={row.name} size="sm" />
                <p className="min-w-0 flex-1 truncate font-tech text-[12px] font-bold text-white">{row.name}</p>
                <p className="font-tech text-sm font-black text-white">{row.pct}%</p>
                <span className={cn("font-tech text-[10px] font-bold", row.delta >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {row.delta >= 0 ? "↑" : "↓"} {Math.abs(row.delta)}%
                </span>
              </div>
              <div className="ml-5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>


      <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-950/80 via-[#12081a] to-[#080910] p-4">
        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl" />
        <Box className="mb-2 h-8 w-8 text-violet-300" />
        <p className="font-tech text-sm font-black uppercase tracking-wide text-white">Ready to dominate?</p>
        <p className="mt-1 text-[11px] text-white/55">Lock your AI squad before lights out.</p>
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full bg-violet-600 py-2.5 font-tech text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-violet-500"
        >
          Build your team <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}

export function Formula1Board() {
  return (
    <div className="relative grid w-full min-w-0 grid-cols-1 items-start gap-3 lg:grid-cols-12 lg:gap-4">
      <LeagueEventBanner />

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 xl:col-span-9">
        <HeroSection />
        <TopAgentsSection />
        <InsightsSection />
        <LeaderboardSection />
      </div>

      <div className="min-w-0 lg:col-span-4 xl:col-span-3">
        <DashboardSidebar />
      </div>

      <QuestionsSection />

      <p className="text-center font-mono text-[10px] tracking-wide text-white/30 lg:col-span-12">
        // kult league · picks lock at lights out · {LEAGUE_ARENA_AGENTS.length} agents live
      </p>
    </div>
  );
}
