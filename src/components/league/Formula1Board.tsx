import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Box,
  ChevronRight,
  Crosshair,
  Flag,
  Headphones,
  Loader2,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import formula1Video from "@/assets/formula1.mp4";
import kultLogo from "@/assets/Kult Logo.png";
import f1CarHero from "@/assets/f1/f1-car-hero.jpg";
import f1CarTransparent from "@/assets/f1/f1-car-transparent.png";
import f1LeagueBannerBg from "@/assets/f1/f1-league-banner-bg.jpg";
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
import { f1Api, F1_PREDICTION_MARKETS, type F1Driver, type F1FantasyTeam, type F1GrandPrixWeekend, type F1PredictionMarket, type F1RaceSession } from "@/api/f1Api";
import { F1DriverModal } from "@/components/f1/F1DriverModal";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { useAuth } from "@/contexts/AuthContext";

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

const AGENT_THEME: Record<string, { accent: string; soft: string; border: string; glow: string }> = {
  HYBRID: { accent: "#c084fc", soft: "rgba(168,85,247,0.18)", border: "rgba(168,85,247,0.55)", glow: "rgba(168,85,247,0.35)" },
  DEFENDER: { accent: "#60a5fa", soft: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.55)", glow: "rgba(59,130,246,0.35)" },
  ASSASSIN: { accent: "#f87171", soft: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.55)", glow: "rgba(239,68,68,0.35)" },
  TACTICIAN: { accent: "#2dd4bf", soft: "rgba(20,184,166,0.18)", border: "rgba(20,184,166,0.55)", glow: "rgba(20,184,166,0.35)" },
  SUPPORT: { accent: "#fbbf24", soft: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.55)", glow: "rgba(245,158,11,0.35)" },
  BERSERKER: { accent: "#e5e7eb", soft: "rgba(229,231,235,0.14)", border: "rgba(229,231,235,0.45)", glow: "rgba(229,231,235,0.25)" },
};

function agentTheme(name: string) {
  return AGENT_THEME[name] ?? AGENT_THEME.HYBRID;
}

/** Session tile color themes — practice / quali / race / sprint each get their own look. */
function sessionTileTheme(sessionType: string, status: string, isNext: boolean) {
  if (status === "LIVE" || isNext) {
    return {
      border: "border-violet-400/60",
      bg: "bg-gradient-to-br from-violet-600/35 via-fuchsia-600/20 to-[#12081a]",
      label: "text-violet-100",
      meta: "text-violet-300",
      icon: "bg-violet-400/25 text-violet-200 border-violet-400/40",
    };
  }
  if (/practice/i.test(sessionType)) {
    return {
      border: "border-sky-400/40",
      bg: "bg-gradient-to-br from-sky-500/25 via-cyan-600/10 to-[#0a1218]",
      label: "text-sky-100",
      meta: "text-sky-300/80",
      icon: "bg-sky-400/20 text-sky-200 border-sky-400/35",
    };
  }
  if (/qualifying/i.test(sessionType)) {
    return {
      border: "border-amber-400/45",
      bg: "bg-gradient-to-br from-amber-500/25 via-orange-600/10 to-[#16100a]",
      label: "text-amber-100",
      meta: "text-amber-300/80",
      icon: "bg-amber-400/20 text-amber-200 border-amber-400/35",
    };
  }
  if (/sprint/i.test(sessionType)) {
    return {
      border: "border-rose-400/45",
      bg: "bg-gradient-to-br from-rose-500/25 via-pink-600/10 to-[#160a10]",
      label: "text-rose-100",
      meta: "text-rose-300/80",
      icon: "bg-rose-400/20 text-rose-200 border-rose-400/35",
    };
  }
  // Race / default
  return {
    border: "border-emerald-400/45",
    bg: "bg-gradient-to-br from-emerald-500/25 via-teal-600/10 to-[#0a1412]",
    label: "text-emerald-100",
    meta: "text-emerald-300/80",
    icon: "bg-emerald-400/20 text-emerald-200 border-emerald-400/35",
  };
}

/** Cycled per driver card since real drivers don't carry an "accent color" from the API. */
const DRIVER_ACCENTS = ["#a855f7", "#3b82f6", "#ef4444", "#14b8a6", "#f59e0b", "#22d3ee"];

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

function DriverAvatar({ driver, className, size = "md" }: { driver: F1Driver; className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/40", sizeClass, className)}>
      {driver.image ? (
        <img src={driver.image} alt={driver.name} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
      ) : (
        <div className="h-full w-full bg-white/5" />
      )}
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
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    void video.play().catch(() => {
      /* autoplay may be blocked */
    });
  }, [muted]);

  return (
    <div className="absolute inset-0 size-full overflow-hidden" aria-hidden={!muted}>
      <video
        ref={videoRef}
        src={formula1Video}
        loop
        muted={muted}
        playsInline
        preload="none"
        className="absolute inset-0 size-full max-w-none object-cover object-[center_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/35 to-transparent" />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur transition hover:border-violet-400/50 hover:bg-black/75"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? "Unmute" : "Mute"}
      </button>
    </div>
  );
}

/** mm:ss-style live countdown to `target`. Re-renders every second while mounted. */
function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;
  const diffMs = target.getTime() - now;
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Short label for a session type, matching the API's raw strings ("1st Practice", "2nd Qualifying", "Race", ...). */
function sessionShortLabel(sessionType: string): string {
  if (/practice/i.test(sessionType)) return sessionType.replace(/(\d)\w{2} /, "P$1 ").replace("Practice", "").trim() || sessionType;
  if (/qualifying/i.test(sessionType)) return "Qualifying";
  if (/sprint/i.test(sessionType)) return "Sprint";
  return sessionType;
}

function LeagueEventBanner({ weekend, onPickClick }: { weekend: F1GrandPrixWeekend | null; onPickClick: () => void }) {
  const raceDate = weekend ? new Date(weekend.race.startsAt) : null;
  const grandPrixName = weekend?.race.grandPrixName?.replace(/\s*Grand Prix\s*/i, "") ?? "Belgium";
  const circuitName = weekend?.race.circuitName ?? "Circuit de Spa-Francorchamps";
  const season = weekend?.race.season ?? new Date().getFullYear();

  return (
    <section className="relative overflow-hidden lg:col-span-12">
      {/* ── Mobile / tablet: stacked visual hero ── */}
      <div className="lg:hidden">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.1]">
          {/* Hero visual */}
          <div className="relative h-[200px] overflow-hidden sm:h-[240px] md:h-[280px]">
            <img
              src={f1LeagueBannerBg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[70%_center] brightness-110"
            />
            <img
              src={f1CarTransparent}
              alt=""
              className="absolute bottom-[-8%] left-1/2 z-10 w-[108%] max-w-none -translate-x-1/2 select-none drop-shadow-[0_12px_32px_rgba(154,53,255,0.55)] sm:w-[95%] md:w-[85%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/35 to-transparent" />
            <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-300 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
              <span className="font-tech text-[9px] font-black uppercase tracking-[0.16em] text-white/70">
                F1 League
              </span>
            </div>
          </div>

          {/* Copy + CTA */}
          <div className="relative space-y-3 bg-[#05050a] px-4 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6">
            <img
              src={kultLogo}
              alt="Kult"
              className="mx-auto h-9 w-auto object-contain sm:h-10"
            />

            <div className="text-center">
              <p className="font-tech text-[10px] font-bold uppercase tracking-[0.22em] text-[#c084fc]">
                Round · Spa
              </p>
              <h2 className="mt-1 font-tech text-[2.35rem] font-black uppercase leading-[0.88] tracking-tight text-white sm:text-5xl">
                Belgium
              </h2>
              <p className="mt-1.5 font-tech text-xl font-black uppercase italic tracking-wide text-[#d8b4fe] sm:text-2xl">
                Grand Prix <span className="not-italic text-white">2026</span>
              </p>
              <p className="mt-2 font-tech text-[10px] font-bold uppercase tracking-[0.14em] text-white/50 sm:text-[11px]">
                Circuit de Spa-Francorchamps
              </p>
              <p className="mx-auto mt-2.5 max-w-sm text-[12px] leading-snug text-white/55 sm:text-[13px]">
                Elite AI agents. Your picks. Beat the field.
              </p>
            </div>

            <button
              type="button"
              className="btn-eye group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg px-4 py-3.5 text-left"
            >
              <span className="relative z-[1]">
                <span className="block font-tech text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                  Pick your AI team
                </span>
                <span className="mt-0.5 block font-tech text-[9px] font-medium uppercase tracking-[0.16em] text-white/80">
                  Compete · Predict · Win
                </span>
              </span>
              <span className="relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/20 bg-white/10">
                <ChevronRight className="h-4 w-4 text-white" />
              </span>
            </button>

            {/* Agents — horizontal scroll */}
            <div>
              <p className="mb-2 font-tech text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                AI agents
              </p>
              <div className="grid grid-cols-3 gap-2">
                {BANNER_AGENTS.map((agent) => (
                  <BannerAgentCard key={agent.name} agent={agent} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop: 50/50 at 1024–1200, then 35/65 ── */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(154,53,255,0.14),transparent_55%)]" />
        <div className="absolute -right-10 top-1/3 h-56 w-56 rounded-full bg-[#9a35ff]/10 blur-3xl" />
      </div>

      <div className="relative z-10 hidden items-end gap-5 py-2 lg:grid lg:grid-cols-2 min-[1200px]:grid-cols-[7fr_13fr] min-[1200px]:gap-6">
        <div className="relative z-20 flex min-w-0 flex-col justify-end gap-4 pb-1 pr-2 min-[1200px]:pr-3">
          <img
            src={kultLogo}
            alt="Kult"
            className="h-12 w-auto object-contain object-left"
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
              {grandPrixName}
            </h2>
            <p className="mt-1.5 font-tech text-2xl font-black uppercase italic tracking-wide text-violet-400 sm:text-3xl">
              Grand Prix {season}
            </p>
            <p className="mt-2 font-tech text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
              {circuitName}
            </p>
            <p className="mt-3 max-w-md text-[13px] leading-snug text-white/55">
              Elite AI agents. Your picks. Beat the field on Spa —
              build a team, lock predictions, win rewards.
            </p>
          </div>

          <button
            type="button"
            onClick={onPickClick}
            className="btn-eye group relative inline-flex w-full max-w-sm items-center justify-between gap-4 overflow-hidden rounded-lg px-6 py-4 text-left"
          >
            <span className="relative z-[1]">
              <span className="block font-tech text-[15px] font-bold uppercase tracking-[0.14em] text-white">
                Pick your AI team
              </span>
              <span className="mt-1 block font-tech text-[11px] font-medium uppercase tracking-[0.18em] text-white/85">
                Compete. Predict. Win.
              </span>
            </span>
            <span className="relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/20 bg-white/10 transition group-hover:bg-white/20">
              <ChevronRight className="h-5 w-5 text-white" />
            </span>
          </button>
        </div>

        <div className="relative flex min-w-0 flex-col gap-3">
          <div className="relative flex min-h-[180px] items-end justify-center min-[1200px]:min-h-[200px]">
            <div className="pointer-events-none absolute bottom-2 h-16 w-[70%] rounded-full bg-[#9a35ff]/25 blur-3xl" />
            <img
              src={f1CarTransparent}
              alt=""
              className="relative z-10 w-full max-w-none select-none drop-shadow-[0_16px_40px_rgba(154,53,255,0.35)]"
            />
          </div>

          <div className="relative z-20 ml-auto grid w-[min(100%,260px)] grid-cols-3 gap-1.5 min-[1200px]:ml-0 min-[1200px]:w-full min-[1200px]:max-w-none min-[1200px]:grid-cols-6 min-[1200px]:gap-2">
            {BANNER_AGENTS.map((agent) => (
              <BannerAgentCard key={agent.name} agent={agent} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BannerAgentCard({
  agent,
  className,
  compact = false,
}: {
  agent: (typeof BANNER_AGENTS)[number];
  className?: string;
  compact?: boolean;
}) {
  const Icon = agent.Icon;
  return (
    <div
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-lg border bg-black/30 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 min-[1200px]:rounded-xl",
        className,
      )}
      style={{ borderColor: `${agent.accent}66` }}
      title={`${agent.name} · ${agent.role}`}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          compact
            ? "aspect-[3/4] min-[1200px]:aspect-[2/3]"
            : "aspect-[3/4] sm:aspect-[2/3] lg:aspect-[2/3]",
        )}
      >
        <img
          src={AGENT_CARDS[agent.name] ?? AGENT_STILLS[agent.name]}
          alt={agent.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div
          className={cn(
            "absolute grid place-items-center rounded-md bg-black/55",
            compact ? "right-0.5 top-0.5 h-4 w-4 min-[1200px]:right-1 min-[1200px]:top-1 min-[1200px]:h-5 min-[1200px]:w-5" : "right-1 top-1 h-5 w-5",
          )}
        >
          <Icon
            className={cn(compact ? "h-2 w-2 min-[1200px]:h-2.5 min-[1200px]:w-2.5" : "h-2.5 w-2.5")}
            style={{ color: agent.accent }}
          />
        </div>
        <div className={cn("absolute inset-x-0 bottom-0", compact ? "px-0.5 pb-1 min-[1200px]:px-1.5 min-[1200px]:pb-2" : "px-1 pb-1.5 sm:px-1.5 sm:pb-2")}>
          <p
            className={cn(
              "truncate font-tech font-black uppercase leading-tight text-white",
              compact ? "text-[7px] min-[1200px]:text-[10px]" : "text-[8px] sm:text-[10px]",
            )}
          >
            {agent.name}
          </p>
          <p
            className={cn(
              "mt-0.5 truncate font-mono uppercase tracking-wider text-white/55",
              compact ? "text-[6px] min-[1200px]:text-[8px]" : "text-[7px] sm:text-[8px]",
            )}
          >
            {agent.role}
          </p>
        </div>
      </div>
    </div>
  );
}

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

const FEED = [
  { ago: "1m", agent: "HYBRID", text: "McLaren conf ↑72%", delta: 8 },
  { ago: "2m", agent: "DEFENDER", text: "Soft deg · S2", delta: null },
  { ago: "3m", agent: "ASSASSIN", text: "Norris overtake · L28", delta: 5 },
  { ago: "5m", agent: "TACTICIAN", text: "Ferrari undercut window", delta: null },
  { ago: "7m", agent: "SUPPORT", text: "SC prob ↑41%", delta: -3 },
  { ago: "9m", agent: "BERSERKER", text: "VER win odds →38%", delta: 4 },
] as const;

const TRENDING = [
  { name: "HYBRID", pct: 42, delta: 12 },
  { name: "DEFENDER", pct: 38, delta: 8 },
  { name: "TACTICIAN", pct: 34, delta: -3 },
  { name: "ASSASSIN", pct: 27, delta: 5 },
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

/**
 * NOTE: INSIGHTS/FEED/TRENDING/PREDICTIONS/QUESTIONS above are still
 * placeholder content -- they describe a fantasy "pick an AI agent
 * archetype" mini-game (confidence %, $ value, selected-by %, live feed
 * chatter) that has no backing data source anywhere in this codebase, unlike
 * the real F1 driver data below. Left as-is rather than inventing fake
 * numbers to fill them; swap in real content here once that game mechanic
 * has a real backend (or drop these sections).
 */

function RaceQuestionCard({ question }: { question: (typeof QUESTIONS)[number] }) {
  const noCents = 100 - question.yes;
  const theme = agentTheme(question.agentName);

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
          className="flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5"
          style={{
            borderColor: theme.border,
            background: `linear-gradient(135deg, ${theme.soft}, rgba(0,0,0,0.35))`,
            boxShadow: `inset 0 0 0 1px ${theme.glow}, 0 0 18px ${theme.glow}`,
          }}
        >
          <AgentAvatar name={question.agentName} size="sm" glow={theme.accent} />
          <div className="min-w-0">
            <p className="truncate font-tech text-[9px] font-bold uppercase" style={{ color: theme.accent }}>
              {question.agentName}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate font-tech text-[9px] font-bold",
                question.signal === "YES" ? "text-emerald-300" : "text-rose-300",
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

function HeroSection({ weekend, isLoading, onPickClick }: { weekend: F1GrandPrixWeekend | null; isLoading: boolean; onPickClick: () => void }) {
  const nextSession = useMemo(() => {
    if (!weekend) return null;
    const now = Date.now();
    return (
      weekend.sessions.find((s) => s.status !== "COMPLETED" && s.status !== "CANCELLED" && new Date(s.startsAt).getTime() > now) ??
      weekend.sessions.find((s) => s.status === "LIVE") ??
      null
    );
  }, [weekend]);

  const countdown = useCountdown(nextSession ? new Date(nextSession.startsAt) : null);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#080910]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
            {isLoading ? "Loading race weekend…" : "Race weekend"}
          </p>
          <h2 className="mt-0.5 font-tech text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
            {weekend?.race.grandPrixName ?? "F1 League"}
          </h2>
          {nextSession ? (
            <p className="mt-0.5 font-mono text-[11px] text-white/45">
              Next: {sessionShortLabel(nextSession.sessionType)} ·{" "}
              {new Date(nextSession.startsAt).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {countdown && !countdown.isPast ? (
            <div className="flex gap-2">
              {[
                [String(countdown.days), "Days"],
                [pad2(countdown.hours), "Hrs"],
                [pad2(countdown.minutes), "Mins"],
                [pad2(countdown.seconds), "Secs"],
              ].map(([v, l]) => (
                <div key={l} className="min-w-[3.25rem] rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-center">
                  <p className="font-tech text-sm font-black text-white">{v}</p>
                  <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">{l}</p>
                </div>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={onPickClick}
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
            <p className="font-tech text-sm font-black uppercase text-white">
              {weekend?.race.circuitName ?? "TBD"} {weekend?.race.laps ? `· ${weekend.race.laps} laps` : ""}
            </p>
          </div>
          {nextSession?.status === "LIVE" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/20 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-red-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Live
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/8 p-2.5 sm:grid-cols-5 sm:gap-2.5 sm:p-3">
        {(weekend?.sessions ?? []).map((session) => {
          const isNext = session.id === nextSession?.id;
          const tile = sessionTileTheme(session.sessionType, session.status, isNext);
          return (
            <div
              key={session.id}
              className={cn(
                "relative overflow-hidden rounded-xl border px-2.5 py-2.5 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                tile.border,
                tile.bg,
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
              <div
                className={cn(
                  "relative mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-lg border",
                  tile.icon,
                )}
              >
                <Flag className="h-3.5 w-3.5" />
              </div>
              <p className={cn("relative truncate font-tech text-[10px] font-black uppercase tracking-wider", tile.label)}>
                {sessionShortLabel(session.sessionType)}
              </p>
              {session.status === "LIVE" ? (
                <p className={cn("relative mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wider", tile.meta)}>Live</p>
              ) : session.status === "COMPLETED" ? (
                <p className="relative mt-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">Done</p>
              ) : (
                <p className={cn("relative mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wider", tile.meta)}>
                  {new Date(session.startsAt).toLocaleDateString(undefined, { weekday: "short" })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Real "Make Your Pick" flow -- three separate markets (Winner/Podium/
 * Fastest Lap), one pick per market per race, backed by F1Prediction
 * (raceId, agentId, market) unique constraint. The Hero/Banner "Pick your
 * AI team" buttons were previously decorative (no real pick UI existed
 * anywhere on this board) -- this is what they now scroll to.
 */
function MakeYourPickSection({ raceId, onOpenDriver }: { raceId: string | undefined; onOpenDriver: (id: string) => void }) {
  const { isAuthenticated, login } = useAuth();
  const { data: myAgents } = useMyArenaAgents();
  const agent = myAgents?.agents?.[0];
  const queryClient = useQueryClient();
  const [activeMarket, setActiveMarket] = useState<F1PredictionMarket>("WINNER");

  const { data: picks } = useQuery({
    queryKey: ["f1", "picks", raceId, agent?.id],
    queryFn: () => f1Api.getPicks(raceId!, agent!.id),
    enabled: !!raceId && !!agent?.id,
  });

  const predictMutation = useMutation({
    mutationFn: (market: F1PredictionMarket) => f1Api.predictPick(raceId!, agent!.id, market),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f1", "picks", raceId, agent?.id] });
    },
  });

  const pickForMarket = (market: F1PredictionMarket) => picks?.find((p) => p.market === market);
  const activePick = pickForMarket(activeMarket);
  const activeQuestion = F1_PREDICTION_MARKETS.find((m) => m.key === activeMarket)?.question;

  return (
    <section className="rounded-2xl border border-violet-400/25 bg-[radial-gradient(circle_at_0%_0%,rgba(139,92,246,0.1),transparent_55%),#080910] p-3.5 sm:p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Make your pick</h3>
          <p className="mt-0.5 text-[11px] text-white/45">
            Pick a market below and let your AI name the driver, grounded in real current-season standings.
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {F1_PREDICTION_MARKETS.map((m) => {
          const done = !!pickForMarket(m.key);
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveMarket(m.key)}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider transition",
                activeMarket === m.key
                  ? "border-violet-400/50 bg-violet-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:border-violet-400/30",
              )}
            >
              {m.label} {done ? "✓" : ""}
            </button>
          );
        })}
      </div>

      {!isAuthenticated ? (
        <button
          type="button"
          onClick={login}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left font-tech text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-violet-400/40 hover:text-white"
        >
          Connect your wallet to make a pick
        </button>
      ) : !agent ? (
        <p className="font-mono text-xs text-white/40">Mint an agent first to make a pick.</p>
      ) : !raceId ? (
        <p className="font-mono text-xs text-white/40">Race not synced yet.</p>
      ) : activePick ? (
        <div>
          <p className="font-mono text-xs text-white/70">
            <span className="font-bold text-emerald-300">{agent.name}</span>&apos;s AI predicted{" "}
            <span className="font-bold text-white">{activePick.predictedDriver?.name ?? "a driver"}</span> for {F1_PREDICTION_MARKETS.find((m) => m.key === activeMarket)?.label}.
          </p>
          {activePick.reasoning ? <p className="mt-1.5 font-mono text-[11px] italic leading-relaxed text-white/50">&ldquo;{activePick.reasoning}&rdquo;</p> : null}
          {activePick.predictedDriverId ? (
            <button
              type="button"
              onClick={() => onOpenDriver(activePick.predictedDriverId)}
              className="mt-2 font-tech text-[10px] font-bold uppercase tracking-wider text-violet-300 hover:text-violet-200"
            >
              View driver &rarr;
            </button>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{activeQuestion}</p>
          <button
            type="button"
            disabled={predictMutation.isPending}
            onClick={() => predictMutation.mutate(activeMarket)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/10 px-3 py-2.5 font-tech text-[11px] font-black uppercase tracking-wider text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
          >
            {predictMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {predictMutation.isPending ? "AI is deciding…" : "Let AI predict"}
          </button>
          {predictMutation.isError ? <p className="mt-2 text-xs text-rose-400">AI prediction failed — try again.</p> : null}
        </div>
      )}
    </section>
  );
}

/**
 * AI-drafted fantasy team: one driver + their real current constructor,
 * accumulating real points from F1FantasyScore as races complete (backend:
 * services/league-service f1-fantasy.service.ts). No simulated/invented
 * scoring -- totalPoints only ever moves via POST /fantasy/races/:id/score
 * against real per-driver race classification.
 */
function FantasyTeamSection({ season, onOpenDriver }: { season: number | undefined; onOpenDriver: (id: string) => void }) {
  const { isAuthenticated, login } = useAuth();
  const { data: myAgents } = useMyArenaAgents();
  const agent = myAgents?.agents?.[0];
  const queryClient = useQueryClient();

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["f1", "fantasy-team", agent?.id, season],
    queryFn: () => f1Api.getFantasyTeam(agent!.id, season),
    enabled: !!agent?.id,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["f1", "fantasy-leaderboard", season],
    queryFn: () => f1Api.getFantasyLeaderboard(season),
    staleTime: 30_000,
  });

  const draftMutation = useMutation({
    mutationFn: () => f1Api.draftFantasyTeam(agent!.id, season),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f1", "fantasy-team", agent?.id, season] });
      queryClient.invalidateQueries({ queryKey: ["f1", "fantasy-leaderboard", season] });
    },
  });

  return (
    <section className="rounded-2xl border border-amber-400/25 bg-[radial-gradient(circle_at_100%_0%,rgba(251,191,36,0.08),transparent_55%),#080910] p-3.5 sm:p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Fantasy team</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Your AI drafts one driver + their real constructor -- points accumulate as races complete.</p>
        </div>
        <Trophy className="h-4 w-4 shrink-0 text-amber-300" />
      </div>

      {!isAuthenticated ? (
        <button
          type="button"
          onClick={login}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left font-tech text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-amber-400/40 hover:text-white"
        >
          Connect your wallet to draft a fantasy team
        </button>
      ) : !agent ? (
        <p className="font-mono text-xs text-white/40">Mint an agent first to draft a fantasy team.</p>
      ) : teamLoading ? (
        <div className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
      ) : team ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-500/[0.04] p-3">
          <div className="flex items-center gap-3">
            <DriverAvatar driver={team.driver} />
            <div>
              <p className="font-tech text-sm font-black text-white">{team.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-white/50">
                <button type="button" onClick={() => onOpenDriver(team.driverId)} className="font-bold text-amber-300 hover:underline">
                  {team.driver.name}
                </button>{" "}
                &middot; {team.constructor.name}
              </p>
              {team.reasoning ? <p className="mt-1 max-w-md font-mono text-[10px] italic text-white/40">&ldquo;{team.reasoning}&rdquo;</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-tech text-xl font-black text-amber-300">{team.totalPoints}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">pts</p>
            </div>
            <button
              type="button"
              disabled={draftMutation.isPending}
              onClick={() => draftMutation.mutate()}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white/60 transition hover:border-amber-400/40 hover:text-white disabled:opacity-40"
            >
              {draftMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Re-draft"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={draftMutation.isPending}
          onClick={() => draftMutation.mutate()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2.5 font-tech text-[11px] font-black uppercase tracking-wider text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-50"
        >
          {draftMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {draftMutation.isPending ? "AI is drafting…" : "AI drafts my team"}
        </button>
      )}
      {draftMutation.isError ? <p className="mt-2 text-xs text-rose-400">Draft failed — try again.</p> : null}

      {leaderboard && leaderboard.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            <Users className="h-3 w-3" /> Leaderboard
          </p>
          <div className="space-y-1">
            {leaderboard.slice(0, 8).map((t, i) => (
              <div
                key={t.id}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5",
                  t.agentId === agent?.id ? "bg-amber-500/10" : "bg-white/[0.02]",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-4 shrink-0 font-mono text-[10px] text-white/40">{i + 1}</span>
                  <span className="truncate font-tech text-[11px] font-bold text-white">{t.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-white/40">{t.driver.abbr ?? t.driver.name}</span>
                </div>
                <span className="shrink-0 font-tech text-[11px] font-black text-amber-300">{t.totalPoints} pts</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TopDriversSection({ drivers, isLoading, onSelectDriver }: { drivers: F1Driver[]; isLoading: boolean; onSelectDriver: (id: string) => void }) {
  const top = useMemo(
    () => [...drivers].sort((a, b) => (a.standing?.position ?? 999) - (b.standing?.position ?? 999)).slice(0, 4),
    [drivers],
  );

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Top drivers this season</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Live standings — tap a driver for an AI prediction</p>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <p className="font-mono text-xs text-white/40">Drivers not synced yet — trigger POST /v1/f1/sync.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((driver, i) => {
            const accent = DRIVER_ACCENTS[i % DRIVER_ACCENTS.length];
            return (
              <button
                type="button"
                key={driver.id}
                onClick={() => onSelectDriver(driver.id)}
                className="relative min-h-[300px] overflow-hidden rounded-2xl border bg-[#0a0b12] p-3.5 text-left transition hover:-translate-y-0.5"
                style={{ borderColor: `${accent}55` }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{ background: `radial-gradient(circle at 80% 55%, ${accent}40, transparent 58%)` }}
                />
                <div className="relative z-10 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-tech text-sm font-black uppercase text-white">{driver.abbr ?? driver.name}</h4>
                    <p className="mt-0.5 font-tech text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                      {driver.currentTeam?.name ?? "Unattached"}
                    </p>
                  </div>
                  {driver.standing ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white/80">
                      P{driver.standing.position}
                    </span>
                  ) : null}
                </div>

                <div className="relative z-10 mt-4 max-w-[48%] space-y-3">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">Season points</p>
                    <p className="font-tech text-xl font-black text-white">{driver.standing?.points ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">Wins this season</p>
                    <p className="font-tech text-lg font-black text-white">{driver.standing?.wins ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">Career podiums</p>
                    <p className="font-tech text-lg font-black text-white">{driver.podiums ?? "—"}</p>
                  </div>
                </div>

                {driver.image ? (
                  <div
                    className="pointer-events-none absolute bottom-10 right-3 h-32 w-24 overflow-hidden rounded-xl border sm:h-36 sm:w-28"
                    style={{ borderColor: `${accent}66` }}
                  >
                    <img
                      src={driver.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-[center_15%]"
                    />
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#0a0b12] via-[#0a0b12]/80 to-transparent px-3 pb-2.5 pt-6 flex items-center justify-end ">
                  <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/70">Tap for AI prediction →</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InsightsSection({
  columnsClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}: {
  columnsClassName?: string;
}) {
  return (
    <section className="w-full">
      <div className="mb-3">
        <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">AI intelligence insights</h3>
        <p className="mt-0.5 text-[11px] text-white/45">How agents are performing across key metrics</p>
      </div>
      <div className={cn("grid w-full gap-3", columnsClassName)}>
        {INSIGHTS.map((item) => (
          <article key={item.label} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a0b12]">
            <div className="flex items-center gap-3 p-3 pb-2">
              <AgentAvatar name={item.agent} size="lg" glow={item.color} className="h-16 w-16 border-2" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[8px] uppercase tracking-wider text-white/40">{item.label}</p>
                <p className="truncate font-tech text-base font-black text-white">{item.name}</p>
                <p className="mt-0.5 font-tech text-xl font-black" style={{ color: item.color }}>
                  {item.metric}
                </p>
                <p className="truncate text-[10px] text-white/45">{item.sub}</p>
              </div>
            </div>
            <Sparkline points={[...item.spark]} color={item.color} className="h-12" />
          </article>
        ))}
      </div>
    </section>
  );
}

function DriverLeaderboardSection({ drivers, isLoading, onSelectDriver }: { drivers: F1Driver[]; isLoading: boolean; onSelectDriver: (id: string) => void }) {
  const ranked = useMemo(
    () => [...drivers].filter((d) => d.standing).sort((a, b) => (a.standing!.position - b.standing!.position)),
    [drivers],
  );

  const Row = ({ driver }: { driver: F1Driver }) => (
    <li>
      <button
        type="button"
        onClick={() => onSelectDriver(driver.id)}
        className="grid w-full grid-cols-[2rem_minmax(0,1.4fr)_4.5rem_3.5rem] items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2.5 text-left transition hover:border-violet-400/30 sm:grid-cols-[2.25rem_minmax(0,1.5fr)_minmax(0,1fr)_4.5rem_3.5rem]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-black/40 font-tech text-xs font-black text-white/60">
          {driver.standing?.position}
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <DriverAvatar driver={driver} />
          <div className="min-w-0">
            <p className="truncate font-tech text-[12px] font-bold uppercase text-white">{driver.name}</p>
            <p className="truncate font-mono text-[10px] text-white/40 sm:hidden">{driver.currentTeam?.name ?? "—"}</p>
          </div>
        </div>
        <p className="hidden truncate font-mono text-[11px] text-white/50 sm:block">{driver.currentTeam?.name ?? "—"}</p>
        <p className="text-right font-tech text-sm font-black text-cyan-300">{driver.standing?.points ?? "—"}</p>
        <p className="hidden text-right font-tech text-[11px] font-bold text-white">{driver.standing?.wins ?? 0}W</p>
      </button>
    </li>
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#080910] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">
            Season {ranked[0]?.standing?.season ?? new Date().getFullYear()} standings
          </h3>
          <p className="mt-0.5 text-[11px] text-white/45">Real driver standings · tap for an AI prediction</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid h-[360px] grid-cols-1 gap-2 overflow-hidden md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border border-white/8 bg-white/[0.03]" />
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <p className="font-mono text-xs text-white/40">Standings not synced yet — trigger POST /v1/f1/sync.</p>
      ) : (
        <div className="h-[360px] overflow-y-auto pr-1 scrollbar-market sm:h-[400px]">
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-x-3 lg:grid-cols-3">
            {ranked.map((driver) => (
              <Row key={driver.id} driver={driver} />
            ))}
          </ul>
        </div>
      )}
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
        </div>
        <ul className="max-h-[235px] space-y-0 overflow-y-auto pr-2 scrollbar-f1-feed">
          {FEED.map((item) => {
            const theme = agentTheme(item.agent);
            return (
              <li key={`${item.ago}-${item.text}`} className="flex items-center gap-2 border-b border-white/6 py-2 last:border-0">
                <span className="w-7 shrink-0 font-mono text-[9px] text-white/35">{item.ago}</span>
                <AgentAvatar name={item.agent} size="sm" glow={theme.accent} />
                <p className="min-w-0 flex-1 truncate text-[11px] font-medium leading-snug text-white/80">{item.text}</p>
                {item.delta != null ? (
                  <span className={cn("shrink-0 font-tech text-[10px] font-bold", item.delta >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {item.delta >= 0 ? "↑" : "↓"}{Math.abs(item.delta)}%
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#080910] p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="font-tech text-[11px] font-bold uppercase tracking-[0.14em] text-white">Trending picks</p>
            <p className="text-[10px] text-white/40">What other players are selecting</p>
          </div>
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


      {/* <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-950/80 via-[#12081a] to-[#080910] p-4">
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
      </div> */}
    </aside>
  );
}

export function Formula1Board() {
  const [openDriverId, setOpenDriverId] = useState<string | null>(null);
  const pickSectionRef = useRef<HTMLDivElement>(null);
  const scrollToPick = () => pickSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const { data: weekend, isLoading: weekendLoading } = useQuery({
    queryKey: ["f1", "grand-prix", "belgium"],
    queryFn: () => f1Api.getBelgianGrandPrix(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ["f1", "drivers"],
    queryFn: () => f1Api.getDrivers(),
    staleTime: 60_000,
  });

  return (
    <div className="relative grid w-full min-w-0 grid-cols-1 items-start gap-3 lg:grid-cols-12 lg:gap-4">
      <LeagueEventBanner weekend={weekend ?? null} onPickClick={scrollToPick} />

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 xl:col-span-9">
        <HeroSection weekend={weekend ?? null} isLoading={weekendLoading} onPickClick={scrollToPick} />
        <div ref={pickSectionRef}>
          <MakeYourPickSection raceId={weekend?.race.id} onOpenDriver={setOpenDriverId} />
        </div>
        <FantasyTeamSection season={weekend?.race.season} onOpenDriver={setOpenDriverId} />
        {/* < lg only: stacked in column */}
        <div className="lg:hidden">
          <TopDriversSection drivers={drivers ?? []} isLoading={driversLoading} onSelectDriver={setOpenDriverId} />
        </div>
        <div className="lg:hidden">
          <InsightsSection columnsClassName="grid-cols-1 sm:grid-cols-2" />
        </div>
      </div>

      <div className="min-w-0 lg:col-span-4 xl:col-span-3">
        <DashboardSidebar />
      </div>

      {/* Desktop: full-width rows */}
      <div className="hidden min-w-0 w-full lg:col-span-12 lg:block">
        <TopDriversSection drivers={drivers ?? []} isLoading={driversLoading} onSelectDriver={setOpenDriverId} />
      </div>
      <div className="hidden min-w-0 w-full lg:col-span-12 lg:block">
        <InsightsSection columnsClassName="grid-cols-2 xl:grid-cols-4" />
      </div>

      <div className="min-w-0 lg:col-span-12">
        <DriverLeaderboardSection drivers={drivers ?? []} isLoading={driversLoading} onSelectDriver={setOpenDriverId} />
      </div>

      <p className="text-center font-mono text-[10px] tracking-wide text-white/30 lg:col-span-12">
        // kult league · picks lock at lights out · {LEAGUE_ARENA_AGENTS.length} agents live
      </p>

      <F1DriverModal driverId={openDriverId} onOpenChange={(open) => !open && setOpenDriverId(null)} />
    </div>
  );
}
