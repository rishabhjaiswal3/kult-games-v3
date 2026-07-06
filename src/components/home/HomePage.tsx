import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  BrainCircuit,
  Joystick,
  Radio,
  Sparkles,
  Swords,
  Trophy,
  Video,
  Wallet,
} from "lucide-react";
import { gamesApi } from "@/api/gamesApi";
import { momentsApi } from "@/api/momentsApi";
import { playerApi } from "@/api/playerApi";
import { useAccess } from "@/contexts/AccessContext";
import { useAuth } from "@/contexts/AuthContext";
import { MomentGameBadge } from "@/components/moments/MomentGameBadge";
import { ResponsiveBackgroundVideo } from "@/components/ResponsiveBackgroundVideo";
import type { AccessFeature } from "@/lib/accessControl";
import { getGameDescription, getGameImage, getGameName } from "@/lib/gameDisplay";
import heroVideo from "@/assets/homebkg.mp4";
import mobileHeroVideo from "@/assets/mobile_home_video.mp4";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import agentNexus from "@/assets/hybrid.mp4";
import agentShadow from "@/assets/defender.mp4";
import agentAegis from "@/assets/tactician.mp4";
import agentVoid from "@/assets/support.mp4";
import agentRage from "@/assets/berserker.mp4";
import agentLumen from "@/assets/assassin.gif";
import aiArenaSquadBanner from "@/assets/home/ai-arena-squad-banner.png";
import worldCupLeagueTrophy from "@/assets/home/world-cup-league-trophy.png";
import homeLeagueBkg from "@/assets/home-league-bkg.png";
const trailerVideo = new URL("../../assets/Trailer.mp4", import.meta.url).href;

type HomeExperienceCard = {
  accent: string;
  cta: string;
  description: string;
  eyebrow: string;
  feature: AccessFeature;
  image: string;
  path: string;
  statusLabel?: string;
  title: string;
};


const homeExperienceCards = [
  {
    accent: "#9a35ff",
    cta: "Enter AI Arena",
    description: "Battle intelligent AI Agents,\n train new tactics, and climb\n the global leaderboard with\n every victory.",
    eyebrow: "AI showdown",
    feature: "ai_arena",
    image: aiArenaSquadBanner,
    path: "/ai-arena",
    title: "Enter\nAI Arena",
  },
  {
    accent: "#ffc42e",
    cta: "Enter League",
    description: "Your AI Agent predicts football matches, competes with other Agents, earns KP, and climbs the League.",
    eyebrow: "Season live",
    feature: "league",
    image: worldCupLeagueTrophy,
    path: "/league",
    title: "World Cup\nAI Agent League",
  },
] satisfies HomeExperienceCard[];


function formatKultPoints(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

const homeArenaSignals = [
  "HYBRID defeated SUPPORT",
  "Revenge initiated by BERSERKER",
  "ASSASSIN learned new dodge logic",
  "Faction war active in 0G Arena",
];

const homeArenaAgents = [
  { name: "HYBRID", img: agentNexus, stat: "14,850 power" },
  { name: "DEFENDER", img: agentShadow, stat: "flank logic" },
  { name: "TACTICIAN", img: agentAegis, stat: "shield online" },
  { name: "SUPPORT", img: agentVoid, stat: "revenge live" },
  { name: "BERSERKER", img: agentRage, stat: "berserk mode" },
  { name: "ASSASSIN", img: agentLumen, stat: "new tactic" },
];

const homeHeroActionBase =
  "min-w-0 rounded-md font-tech font-black uppercase grid grid-cols-[auto_1fr_auto] items-center text-center transition whitespace-nowrap border shadow-[0_0_18px_rgba(0,210,255,0.16)] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(0,210,255,0.32),0_12px_26px_rgba(0,0,0,0.32)] w-full h-9 px-[10px] text-[9px] tracking-[0.13em] gap-2 sm:h-10 sm:text-[10px]";

const homeHeroActionStyles = {
  games:
    "border-purple-300/50 bg-[linear-gradient(135deg,rgba(122,34,232,0.88),rgba(154,53,255,0.72),rgba(4,8,15,0.92))] text-white hover:border-purple-200/80 hover:bg-[linear-gradient(135deg,rgba(154,53,255,0.95),rgba(168,85,247,0.78),rgba(4,8,15,0.94))]",
  arena:
    "border-cyan-200/55 bg-[linear-gradient(135deg,rgba(14,165,233,0.5),rgba(154,53,255,0.45),rgba(4,8,15,0.92))] text-white ring-1 ring-cyan-200/10 hover:border-cyan-100/80 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.6),rgba(168,85,247,0.52),rgba(4,8,15,0.94))]",
  league:
    "border-amber-200/40 bg-[linear-gradient(135deg,rgba(251,191,36,0.4),rgba(154,53,255,0.34),rgba(4,8,15,0.92))] text-amber-50 hover:border-amber-100/70 hover:bg-[linear-gradient(135deg,rgba(251,191,36,0.5),rgba(154,53,255,0.42),rgba(4,8,15,0.94))] hover:text-white",
} as const;

function homeHeroCtaGridClass(count: number) {
  const desktopColumn = "lg:grid-cols-1 lg:w-[208px] lg:max-w-[208px]";
  if (count <= 1) return `grid w-full max-w-[760px] grid-cols-1 gap-2 ${desktopColumn}`;
  if (count === 2) {
    return `grid w-full max-w-[760px] grid-cols-1 gap-2 min-[480px]:grid-cols-2 ${desktopColumn}`;
  }
  return `grid w-full max-w-[760px] grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3 ${desktopColumn}`;
}

function homeHeroCtaItemClass(count: number, index: number) {
  if (count === 3 && index === 2) {
    return "min-[480px]:col-span-2 md:col-span-1 lg:col-span-1";
  }
  return "";
}

export function HomePage() {
  const navigate = useNavigate();
  const { canUse } = useAccess();
  const { login, isAuthenticated } = useAuth();
  const featuredScrollerRef = useRef<HTMLDivElement | null>(null);
  const canViewAiArena = canUse("ai_arena");
  const canViewGames = canUse("games");
  const canViewLeague = canUse("league");
  const canViewMoments = canUse("moments");

  const { data: gamesData, isLoading } = useQuery({
    queryKey: ["games", "all", "home"],
    queryFn: () => gamesApi.getAll(1, 8),
    enabled: canViewGames,
    staleTime: 5 * 60_000,
  });

  const { data: profile } = useQuery({
    queryKey: ["player", "full-profile"],
    queryFn: () => playerApi.getFullProfile(),
    enabled: isAuthenticated && canViewAiArena,
    staleTime: 60_000,
  });

  const featuredGames = gamesData?.games?.slice(0, 6) ?? [];
  const baseStatTiles = [
    { label: "Live games", value: String(gamesData?.games?.length ?? "—"), icon: Joystick, color: "#11a7ff", path: "/games", feature: "games" },
    { label: "AI Arena", value: "Live", icon: BrainCircuit, color: "#a855ff", path: "/ai-arena", feature: "ai_arena" },
    { label: "Dashboard", value: "Open", icon: Box, color: "#ffc42e", path: "/dashboard", feature: "ai_arena" },
    { label: "Battles", value: "24/7", icon: Swords, color: "#00f080", path: "/battles", feature: "ai_arena" },
  ].filter((stat) => canUse(stat.feature as AccessFeature));
  const momentsTile = { label: "Moments", value: "Watch", icon: Video, color: "#ff5ca8", path: "/moments", feature: "moments" as AccessFeature };
  const visibleStatTiles =
    baseStatTiles.length === 3 && canViewMoments ? [...baseStatTiles, momentsTile] : baseStatTiles;
  const visibleExperienceCards = homeExperienceCards.filter((card) => canUse(card.feature));

  useEffect(() => {
    const scroller = featuredScrollerRef.current;
    if (!scroller || featuredGames.length <= 1) return;

    const interval = window.setInterval(() => {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      const nextLeft = scroller.scrollLeft + scroller.clientWidth * 0.9;

      scroller.scrollTo({
        left: nextLeft >= maxScrollLeft - 8 ? 0 : nextLeft,
        behavior: "smooth",
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [featuredGames.length]);

  const handleExploreGames = () => {
    if (!canViewGames) return;
    if (isAuthenticated) {
      navigate("/games");
      return;
    }
    navigate("/?login=1");
  };

  const handlePrimaryCta = () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    navigate("/ai-arena");
  };

  const handleEnterLeague = () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    navigate("/league");
  };

  const heroCtaActions = [
    canViewGames
      ? {
          key: "games",
          label: "Explore Games",
          icon: <Joystick className="h-4 w-4 shrink-0 text-purple-200" aria-hidden />,
          onClick: handleExploreGames,
          variant: "games" as const,
        }
      : null,
    isAuthenticated && !canViewAiArena
      ? null
      : {
          key: "arena",
          label: isAuthenticated ? "Enter AI Arena" : "Connect Wallet",
          icon: isAuthenticated ? (
            <Swords className="h-4 w-4 shrink-0 text-cyan-100" aria-hidden />
          ) : (
            <Wallet className="h-4 w-4 shrink-0 text-cyan-100" aria-hidden />
          ),
          onClick: handlePrimaryCta,
          variant: "arena" as const,
        },
    isAuthenticated && canViewLeague
      ? {
          key: "league",
          label: "Enter League",
          icon: <Trophy className="h-4 w-4 shrink-0 text-amber-200" aria-hidden />,
          onClick: handleEnterLeague,
          variant: "league" as const,
        }
      : null,
  ].filter(Boolean);

  const heroCtaCount = heroCtaActions.length;

  return (
    <div className="home-page space-y-6 pb-10">
      <section data-tour="home-hero" className="arena-panel relative min-h-[430px] overflow-hidden border-white/8 bg-[#04080f] sm:min-h-[520px] lg:min-h-[560px] xl:min-h-[660px] 2xl:min-h-[780px]">
        <ResponsiveBackgroundVideo
          mobileSrc={mobileHeroVideo}
          desktopSrc={heroVideo}
          mobileClassName="absolute inset-0 h-full w-full object-cover sm:hidden"
          desktopClassName="absolute inset-0 hidden h-full w-full object-cover object-[88%_center] sm:block sm:object-[72%_center] scale-100 opacity-100 saturate-125 contrast-110"
        />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#050913]/95 via-[#050913]/38 to-transparent sm:block" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050913]/25 to-transparent" />
        <div className="relative z-10 flex min-h-[490px] flex-col justify-end gap-8 p-5 pb-8 pt-12 sm:min-h-[520px] sm:justify-start sm:p-8 sm:pt-16 lg:min-h-[560px] xl:min-h-[660px] 2xl:min-h-[780px]">
          <div className="absolute left-5 right-5 top-5 flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-[9px] font-tech font-bold uppercase tracking-[0.16em] text-[#FFFFFF] [text-shadow:0_0_12px_rgba(255,255,255,0.55),0_1px_3px_rgba(0,0,0,0.45)] sm:static sm:gap-3 sm:text-[11px] sm:tracking-[0.2em]">
            <span className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              Presented by <img src={kultLogo} alt="Kult" className="h-3.5 w-auto object-contain sm:h-4" />
            </span>
            <span className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              Powered by <img src={zeroGLogo} alt="0G" className="h-3.5 w-auto object-contain sm:h-4" />
            </span>
          </div>
          <div className="max-w-2xl space-y-2.5 sm:space-y-4">
            <h1 className="max-w-2xl font-tech text-[1.56rem] font-black uppercase leading-[1.05] tracking-tight text-white min-[390px]:text-[1.66rem] sm:text-5xl lg:text-6xl xl:text-5xl">
              The Operating
              <br />
              Layer for{" "}
              <br className="xl:hidden" />
              <span className="text-gradient-arena tracking-wide xl:hidden">Intelligent Gaming</span>
              <span className="hidden xl:inline text-gradient-arena tracking-wide">
                Intelligent
                <br />
                Gaming
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-snug text-white/75 sm:leading-relaxed">
              One browser for games, agents, rivalries,
              <br />
              and live battles that never stop.
            </p>
            <div className={homeHeroCtaGridClass(heroCtaCount)}>
              {heroCtaActions.map((action, index) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={action.onClick}
                  className={`${homeHeroActionBase} ${homeHeroActionStyles[action.variant]} ${homeHeroCtaItemClass(heroCtaCount, index)}`}
                >
                  {action.icon}
                  <span className="min-w-0 px-1 leading-tight">{action.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="arena-panel relative overflow-hidden border-white/8 bg-[#03070d]/95 px-4 py-4 sm:px-6 sm:py-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(0,137,255,0.16),transparent_40%),radial-gradient(circle_at_6%_16%,rgba(154,53,255,0.16),transparent_38%)]" />
        <div className="relative flex flex-col gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bd6cff]/30 bg-[#bd6cff]/[0.08] px-3 py-1 font-tech text-[10px] font-bold uppercase tracking-[0.26em] text-[#c98bff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#bd6cff] shadow-[0_0_8px_rgba(189,108,255,0.9)]" />
              Your KULT ID
            </div>
            <h2 className="mt-2.5 font-tech text-2xl font-black uppercase leading-[1.02] text-white sm:text-3xl lg:text-[2rem]">
              One Identity
              <br />
              <span className="text-gradient-arena">Every Battle Every Prediction</span>
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-snug text-white/60 sm:text-[15px]">
              One identity. Every world you play in — Arena, League, and beyond.
              <br />
              Your AI agents, reputation, and progress evolve with every match
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] lg:items-stretch lg:gap-6">
            <div className="grid content-start gap-1.5 lg:content-between">
              {[
                {
                  emoji: "⚔️",
                  title: "Own Intelligent AI Agents",
                  desc: "Every agent has its own identity, memory, and personality that grows with it.",
                  accent: "154,53,255",
                },
                {
                  emoji: "🏆",
                  title: "Build Your Reputation",
                  desc: "Earn KULT Points (KP) as your agents battle, predict, and complete challenges.",
                  accent: "255,196,46",
                },
                {
                  emoji: "⚽",
                  title: "Compete Across Experiences",
                  desc: "From AI Arena battles to the World Cup AI Agent League — one identity, everywhere you play.",
                  accent: "0,240,128",
                },
                {
                  emoji: "📈",
                  title: "Progress Never Resets",
                  desc: "Every victory, prediction, and achievement permanently strengthens your KULT ID.",
                  accent: "0,137,255",
                },
              ].map(({ emoji, title, desc, accent }) => (
                <div key={title} className="group/kid relative">
                  <div className="relative cursor-default overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3.5 transition duration-300 group-hover/kid:-translate-y-0.5 group-hover/kid:border-white/20">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/45 via-black/15 to-transparent" />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/kid:opacity-100"
                      style={{ background: `radial-gradient(circle at 22% 0%, rgba(${accent},0.16), transparent 60%)` }}
                    />
                    <div className="relative flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base leading-none"
                        style={{
                          background: `linear-gradient(135deg, rgba(${accent},0.22), rgba(${accent},0.05))`,
                          boxShadow: `0 0 16px rgba(${accent},0.28)`,
                        }}
                      >
                        {emoji}
                      </span>
                      <div className="min-w-0 font-tech text-[13px] font-bold leading-tight text-white">{title}</div>
                    </div>
                  </div>

                  {/* Description popover — hidden until hover */}
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 w-64 max-w-[85vw] -translate-x-1/2 translate-y-1.5 scale-95 opacity-0 transition-all duration-200 ease-out group-hover/kid:translate-y-0 group-hover/kid:scale-100 group-hover/kid:opacity-100"
                  >
                    <div
                      className="relative rounded-2xl p-px"
                      style={{
                        background: `linear-gradient(135deg, rgba(${accent},0.75), rgba(${accent},0.12) 55%, rgba(255,255,255,0.08))`,
                        boxShadow: `0 18px 48px rgba(0,0,0,0.72), 0 0 26px rgba(${accent},0.24)`,
                      }}
                    >
                      <div
                        className="relative overflow-hidden rounded-[15px] bg-[#0a0e1c] px-4 py-3.5"
                        style={{ backgroundImage: `radial-gradient(circle at 16% 0%, rgba(${accent},0.20), transparent 62%)` }}
                      >
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0 h-px"
                          style={{ background: `linear-gradient(90deg, transparent, rgba(${accent},0.95), transparent)` }}
                        />
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-sm leading-none">{emoji}</span>
                          <span
                            className="font-tech text-[9px] font-bold uppercase tracking-[0.22em]"
                            style={{ color: `rgba(${accent},1)` }}
                          >
                            {title}
                          </span>
                        </div>
                        <p className="text-[12.5px] leading-relaxed text-white/85">{desc}</p>
                      </div>
                    </div>
                    <span
                      className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] bg-[#0a0e1c]"
                      style={{
                        borderRight: `1px solid rgba(${accent},0.55)`,
                        borderBottom: `1px solid rgba(${accent},0.55)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {canViewAiArena ? (
              <Link
                to="/dashboard"
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#06101d]/80 p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-[#49c8ff]/60 hover:bg-[#082039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49c8ff]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(73,200,255,0.18),transparent_55%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#49c8ff]/80 to-transparent" />
                <div className="relative">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#49c8ff]/45 bg-gradient-to-br from-[#0e3355] to-[#0b2742] font-tech text-sm font-black text-[#66d5ff] shadow-[0_0_16px_rgba(73,200,255,0.3)]">
                      K
                    </div>
                    <div className="font-tech text-[10px] font-bold uppercase tracking-[0.24em] text-[#bd6cff]">Identity Card</div>
                  </div>
                  <div className="mt-2 font-tech text-base font-black leading-tight text-white sm:text-lg">
                    One profile across <span className="text-gradient-arena">KULT</span>
                  </div>
                  <p className="mt-1 text-xs leading-snug text-white/58">
                    Wallet, agents, progress, reputation — all in one place.
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between gap-1.5 rounded-lg border border-[#49c8ff]/20 bg-[#49c8ff]/[0.05] px-2.5 py-2">
                      <span className="font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">Rank</span>
                      <span className="font-tech text-sm font-black text-[#66d5ff]">
                        {profile?.kultPointsRank != null ? `#${profile.kultPointsRank}` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 rounded-lg border border-[#bd6cff]/20 bg-[#bd6cff]/[0.05] px-2.5 py-2">
                      <span className="font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">Level</span>
                      <span className="font-tech text-sm font-black text-[#c98bff]">
                        {profile?.level ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative mt-2">
                  <div className="flex items-center justify-between rounded-lg border border-[#00f080]/25 bg-[#00f080]/[0.06] px-2.5 py-1.5">
                    <span className="font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">KP earned</span>
                    <span className="font-tech text-base font-black text-[#00f080] [text-shadow:0_0_12px_rgba(0,240,128,0.45)]">{profile ? `${formatKultPoints(profile.kultPoints)} KP` : "— KP"}</span>
                  </div>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 font-tech text-[11px] font-bold uppercase tracking-wider text-[#66d5ff] transition group-hover:gap-2.5">
                    Open your ID
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="arena-panel overflow-hidden border-white/8 bg-[#03070d]/95 px-5 py-3.5 sm:px-6 sm:py-4">
        <div className="font-tech text-[10px] font-bold uppercase tracking-[0.28em] text-[#bd6cff]">Ecosystem loop</div>
        <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="shrink-0 font-tech text-lg font-black uppercase leading-[1.25] text-white sm:text-xl">
              Everything you do keeps building
          </h2>
          <div className="grid grid-cols-3 gap-2 pb-1 font-tech text-[11px] font-bold uppercase tracking-[0.08em] sm:text-xs md:flex md:flex-wrap md:items-center md:justify-start xl:flex-nowrap xl:justify-end">
            {[
              { label: "Play", accent: "154,53,255" },
              { label: "Create", accent: "0,137,255" },
              { label: "Compete", accent: "82,203,255" },
              { label: "Build", accent: "255,196,46" },
              { label: "Persist", accent: "0,240,128" },
            ].map(({ label, accent }, index) => (
              <div key={label} className="flex items-center gap-1.5 md:shrink-0">
                <span
                  className="flex-1 rounded-full border px-3.5 py-1.5 text-center text-white transition duration-300 hover:-translate-y-0.5 md:flex-none"
                  style={{
                    borderColor: `rgba(${accent},0.55)`,
                    background: `linear-gradient(135deg, rgba(${accent},0.22), rgba(${accent},0.04))`,
                    boxShadow: `0 0 16px rgba(${accent},0.28), inset 0 1px 0 rgba(255,255,255,0.08)`,
                    textShadow: `0 0 10px rgba(${accent},0.6)`,
                  }}
                >
                  {label}
                </span>
                <ArrowRight
                  className={`h-3.5 w-3.5 shrink-0 ${index === 4 ? "invisible md:hidden" : index === 2 ? "invisible md:visible" : ""}`}
                  style={{ color: `rgba(${accent},0.85)` }}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {visibleStatTiles.length > 0 ? (
        <div
          className={`arena-panel home-stats-panel grid overflow-hidden ${
            visibleStatTiles.length === 3
              ? "grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:divide-x sm:divide-white/8"
              : "grid-cols-[repeat(auto-fit,minmax(160px,1fr))] divide-x divide-white/8"
          }`}
          data-tour="home-quick-links"
        >
          {visibleStatTiles.map((stat, index) => (
            <Link
              key={stat.label}
              to={stat.path}
              className={`home-stat-tile relative z-10 flex items-center gap-4 px-5 py-3.5 sm:px-6 sm:py-4 ${
                visibleStatTiles.length === 3
                  ? index === 1
                    ? "border-l border-white/8 sm:border-l-0"
                    : index === 2
                      ? "col-span-2 border-t border-white/8 sm:col-span-1 sm:border-t-0"
                      : ""
                  : ""
              }`}
              style={{ "--stat-color": stat.color } as CSSProperties}
            >
              <div
                className="home-stat-icon grid h-11 w-11 place-items-center rounded-lg"
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-tech text-xs font-semibold text-white/72 sm:text-sm">{stat.label}</div>
                <div className="mt-0.5 text-xl font-semibold text-white sm:text-2xl">{stat.value}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      <section className="arena-panel group relative overflow-hidden border-white/8 bg-[#03070d]/95">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(154,53,255,0.24),transparent_36%),radial-gradient(circle_at_82%_12%,rgba(0,137,255,0.16),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#c084fc]/70 to-transparent" />
        <div className="relative grid gap-5 p-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:p-5">
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.42),0_0_44px_rgba(154,53,255,0.18)]">
            <video
              src={trailerVideo}
              autoPlay
              controls
              muted
              preload="metadata"
              playsInline
              className="aspect-video h-full w-full bg-black object-cover"
            />
            <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
          </div>
          <div className="flex flex-col justify-center gap-4 px-1 py-1 lg:px-2">
            <div className="space-y-3">
              <span className="inline-flex w-fit rounded border border-[#9f2dff]/50 bg-[#5b1499]/35 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#d773ff]">
                Official trailer
              </span>
              <h2 className="font-tech text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
                Watch the next wave of KULT games
              </h2>
              <p className="text-sm leading-relaxed text-white/58">
                A quick look at the arena, battles, agents, and the high-energy worlds coming together inside KULT.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Arena", "#9a35ff"],
                ["Agents", "#00f080"],
                ["Battles", "#ffc000"],
              ].map(([label, color]) => (
                <div key={label} className="rounded-md border border-white/8 bg-white/[0.035] p-3">
                  <div className="mb-2 h-1 w-7 rounded-full" style={{ backgroundColor: color }} />
                  <div className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/72">{label}</div>
                </div>
              ))}
            </div>
            {canViewGames ? (
              <button
                type="button"
                onClick={() => navigate("/games")}
                className="inline-flex w-fit items-center gap-2 rounded-md border border-[#9b32ff]/60 bg-[#230b35]/75 px-5 py-2 font-tech text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#c084fc] hover:bg-[#35104f]"
              >
                Browse games
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {canViewAiArena ? <HomeAIArenaSection /> : null}
      {canViewLeague ? <HomeLiveLeaguesSection /> : null}
      {canViewMoments ? <HomeMomentsSection /> : null}

      {canViewGames ? (
        <section className="arena-panel space-y-3 border-white/8 bg-[#03070d]/95 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-tech text-2xl font-black uppercase leading-tight tracking-wider text-white sm:text-3xl">Featured games</h2>
            <Link
              to="/games"
              className="font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300"
            >
              View all →
            </Link>
          </div>
          <div
            ref={featuredScrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible pb-3 scrollbar-none"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                      className="arena-panel aspect-[16/10] min-w-[82vw] animate-pulse snap-start border-white/8 bg-white/5 sm:min-w-[360px] lg:min-w-[calc((100%-3.75rem)/4)]"
                  />
                ))
              : featuredGames.map((game) => {
                  const id = game.identification ?? game.slug ?? game._id;
                  const image = getGameImage(game);
                  return (
                    <Link
                      key={game._id ?? id}
                      to={`/game/${id}`}
                      className="group flex min-w-[82vw] snap-start flex-col overflow-hidden rounded-lg border border-[#5d6d8c]/45 bg-[#04080f]/95 shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#a855f7]/70 hover:shadow-[0_12px_34px_rgba(133,49,235,0.26)] sm:min-w-[360px] lg:min-w-[calc((100%-3.75rem)/4)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0f18]">
                        {image ? (
                          <img
                            src={image}
                            alt={getGameName(game.name)}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-top brightness-125 saturate-130 contrast-105 transition duration-500 group-hover:scale-105 group-hover:brightness-135 group-hover:saturate-150"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(164,105,255,0.18),transparent_48%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#04080f]/58 via-[#04080f]/5 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent opacity-70" />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs font-semibold text-white/90 group-hover:text-[#c78aff]">
                          {getGameName(game.name)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-white/65">
                          {getGameDescription(game.description) || game.category}
                        </p>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </section>
      ) : null}

      {visibleExperienceCards.length > 0 ? (
        <HomeFeaturedExperiencesSection cards={visibleExperienceCards} />
      ) : null}
    </div>
  );
}

function HomeFeaturedExperiencesSection({
  cards,
}: {
  cards: HomeExperienceCard[];
}) {
  return (
    <section className="arena-panel relative overflow-hidden border-white/8 bg-[#02050c]/95 p-3.5 sm:p-4 lg:p-5">
      {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(17,167,255,0.12),transparent_24%),radial-gradient(circle_at_100%_0%,rgba(255,196,0,0.12),transparent_24%)]" /> */}
       
       <div className="mb-4">
          <h3 className="font-tech text-2xl font-black uppercase leading-tight tracking-wider text-white sm:text-3xl">Ready for the arena ?</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/85">Train agents, earn rewards, and compete globally.</p>
        </div>

      <div className="relative">
        {cards.length > 0 ? (
          <>
            {/* <SectionRibbon label="Featured experiences" accent="#bd6cff" /> */}
            <div className={`mt-3 grid gap-3 ${cards.length > 1 ? "xl:grid-cols-2" : ""}`}>
              {cards.map((card) => {
                const titleLines = card.title.split("\n");
                const isGoldTheme = card.accent === "#ffc42e";
                const isLiveCard = card.eyebrow.toLowerCase().includes("live");
                const eyebrowStyle = {
                  backgroundColor: `${card.accent}18`,
                  borderColor: `${card.accent}52`,
                  boxShadow: `0 0 18px ${card.accent}1f`,
                  color: card.accent,
                } as CSSProperties;
                const buttonStyle = {
                  background: isGoldTheme
                    ? "linear-gradient(135deg, rgba(190,120,16,0.95), rgba(255,196,46,0.95))"
                    : "linear-gradient(135deg, #7a22e8, #9a35ff)",
                  borderColor: isGoldTheme ? "rgba(255,211,106,0.72)" : "rgba(216,180,254,0.72)",
                  boxShadow: isGoldTheme
                    ? "0 4px 20px rgba(255,196,46,0.3)"
                    : "0 4px 20px rgba(139,37,255,0.45)",
                } as CSSProperties;

                return (
                  <Link
                    key={card.path}
                    to={card.path}
                    className="group relative min-h-[250px] overflow-hidden rounded-[24px] border border-white/10 bg-[#050712] transition duration-300 hover:-translate-y-1 hover:border-[var(--feature-accent)] hover:shadow-[0_0_38px_var(--feature-glow),0_18px_48px_rgba(0,0,0,0.42)] sm:min-h-[320px]"
                    style={
                      {
                        "--feature-accent": card.accent,
                        "--feature-glow": `${card.accent}38`,
                      } as CSSProperties
                    }
                  >
                    <img
                      src={card.image}
                      alt={card.title.replaceAll("\n", " ")}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-[68%_center] transition duration-700 group-hover:scale-105 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#060914]/96 via-[#060914]/88 via-45% to-[#060914]/24" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_52%,var(--feature-glow),transparent_34%)] opacity-80" />
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
                    <div className="relative z-10 flex h-full flex-col justify-start gap-4 p-4 sm:gap-6 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-tech text-[8px] font-bold uppercase tracking-[0.18em] sm:px-2.5 sm:text-[9px] sm:tracking-[0.22em] ${isLiveCard ? "season-live-badge" : ""}`}
                          style={isLiveCard ? { ...eyebrowStyle, ["--live-glow" as string]: `${card.accent}47` } : eyebrowStyle}
                        >
                          {isLiveCard ? (
                            <span
                              className="season-live-dot h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: card.accent, boxShadow: `0 0 8px ${card.accent}` }}
                            />
                          ) : null}
                          {card.eyebrow}
                        </span>
                        {card.statusLabel ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/45 bg-emerald-400/12 px-2 py-1 font-tech text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-300 sm:gap-1.5 sm:px-2.5 sm:text-[9px] sm:tracking-[0.18em]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
                            {card.statusLabel}
                          </span>
                        ) : null}
                      </div>
                      <div className="max-w-[14rem] sm:max-w-[18rem]">
                        <h2 className="font-tech text-[1.45rem] font-black uppercase leading-[0.95] tracking-tight text-white sm:text-[2.15rem] sm:leading-[0.98] xl:flex xl:min-h-[6.3rem] xl:flex-col xl:justify-end">
                          {titleLines.map((line, index) => {
                            const isAccentLine = titleLines.length === 1 || index === titleLines.length - 1;

                            return (
                              <span
                                key={line}
                                className="block"
                                style={
                                  isAccentLine
                                    ? {
                                        backgroundClip: "text",
                                        backgroundImage: `linear-gradient(120deg, #ffffff 0%, ${card.accent} 88%)`,
                                        color: "transparent",
                                        WebkitBackgroundClip: "text",
                                      }
                                    : undefined
                                }
                              >
                                {line}
                              </span>
                            );
                          })}
                        </h2>
                        <p className="mt-3.5 whitespace-pre-line text-[12px] leading-[1.4] text-white/72 sm:mt-5 sm:text-[15px] sm:leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      <span
                        className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-md border px-4 py-1.5 font-tech text-[11px] font-bold uppercase tracking-[0.14em] text-white transition duration-300 group-hover:-translate-y-0.5 group-hover:brightness-110 sm:gap-2 sm:px-5 sm:py-2 sm:text-xs sm:tracking-wider"
                        style={buttonStyle}
                      >
                        {card.cta}
                        <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function SectionRibbon({ label, accent = "#cf7cff" }: { label: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
      />
      <span
        className="font-tech text-[10px] font-bold uppercase tracking-[0.24em]"
        style={{ color: accent }}
      >
        {label}
      </span>
      <span
        className="h-px flex-1 bg-gradient-to-r to-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, ${accent}55, transparent)` }}
      />
    </div>
  );
}

function HomeAIArenaSection() {
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const activeAgent = homeArenaAgents[activeAgentIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveAgentIndex((index) => (index + 1) % homeArenaAgents.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="arena-panel relative overflow-hidden border-white/8 bg-[#03070d]/95 p-4 sm:p-5 lg:p-6">
      <div className="pointer-events-none absolute inset-0 arena-rain opacity-35" />
      <div className="pointer-events-none absolute inset-0 hero-hologram-overlay opacity-50" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
        <div className="flex flex-col justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.22em] text-[#9a35ff]">
              <Sparkles className="h-4 w-4" />
              AI Arena
            </div>
            <h2 className="font-tech text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
              Train <span className="text-gradient-arena tracking-wide">intelligence</span> Rule the arena
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/58">
              Create agents that remember fights, learn tactics, trigger rivalries, and battle while the whole ecosystem watches.
            </p>
          </div>

          <div className="grid max-w-[16rem] grid-cols-1 gap-2.5 md:max-w-[15rem] xl:max-w-none xl:grid-cols-2">
            {[
              { emoji: "🧠", label: "Adaptive Intelligence", accent: "154,53,255" },
              { emoji: "⚔️", label: "Living Rivalries", accent: "0,137,255" },
              { emoji: "🏆", label: "Legendary Rankings", accent: "255,196,46" },
              { emoji: "🌍", label: "Persistent Evolution", accent: "0,240,128" },
            ].map(({ emoji, label, accent }) => (
              <div
                key={label}
                className="group/pillar relative flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 transition duration-300 hover:-translate-y-0.5"
                style={{ boxShadow: `inset 0 0 0 1px rgba(${accent},0.06)` }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/55 via-black/25 to-transparent" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/pillar:opacity-100"
                  style={{ background: `radial-gradient(circle at 30% 0%, rgba(${accent},0.18), transparent 65%)` }}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, rgba(${accent},0.9), transparent)` }}
                />
                <span
                  className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base leading-none"
                  style={{
                    background: `linear-gradient(135deg, rgba(${accent},0.22), rgba(${accent},0.05))`,
                    boxShadow: `0 0 16px rgba(${accent},0.28)`,
                  }}
                >
                  {emoji}
                </span>
                <div className="relative min-w-0 whitespace-nowrap font-tech text-[11.5px] font-bold uppercase leading-tight tracking-[0.08em] text-[#dcf4ff] [text-shadow:0_1px_2px_rgba(0,0,0,0.75),0_0_12px_rgba(82,203,255,0.6)]">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/ai-arena"
            className="btn-primary inline-flex w-fit items-center gap-2 rounded-md px-5 py-2 font-tech text-xs font-bold uppercase tracking-wider"
          >
            Enter AI Arena
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
          <Link
            to="/ai-arena"
            className="group relative min-h-[360px] overflow-hidden rounded-lg border border-white/8 bg-black/40 sm:min-h-[420px] md:min-h-full"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(154,53,255,0.24),transparent_44%)]" />
            {activeAgent.img.endsWith(".mp4") ? (
              <video
                key={activeAgent.name}
                src={activeAgent.img}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              />
            ) : (
              <img
                key={activeAgent.name}
                src={activeAgent.img}
                alt={activeAgent.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/12 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="font-tech text-lg font-bold uppercase text-white">{activeAgent.name}</div>
              <div className="mt-1 text-sm text-white/60">{activeAgent.stat}</div>
              <div className="mt-3 flex gap-1.5">
                {homeArenaAgents.map((agent, index) => (
                  <span
                    key={agent.name}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeAgentIndex ? "w-7 bg-[#9a35ff]" : "w-1.5 bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Link>

          <div className="rounded-lg border border-white/8 bg-black/35 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/60">Live system feed</span>
              <span className="flex items-center gap-1 rounded border border-red-500/30 bg-red-500/12 px-2 py-0.5 font-tech text-[9px] text-red-300">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
                Live
              </span>
            </div>
            <div className="space-y-2">
              {homeArenaSignals.map((signal, i) => (
                <div key={signal} className="flex items-center gap-3 rounded border border-white/6 bg-white/[0.025] px-3 py-2">
                  <Radio className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span className="min-w-0 flex-1 truncate text-xs text-white/72">{signal}</span>
                  <span className="text-[10px] text-white/34">{i + 1}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FixtureAgentPortrait({ src, color, name, sub }: { src: string; color: string; name: string; sub: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div
        className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 sm:h-16 sm:w-16"
        style={{ borderColor: color, boxShadow: `0 0 22px ${color}66` }}
      >
        <video src={src} autoPlay loop muted playsInline preload="none" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 55%, ${color}33)` }} />
      </div>
      <div className="text-center">
        <div className="font-tech text-sm font-black uppercase tracking-wide" style={{ color }}>{name}</div>
        <div className="mt-0.5 text-[10px] text-white/75">{sub}</div>
      </div>
    </div>
  );
}

function HomeLiveLeaguesSection() {
  const [liveFixture, setLiveFixture] = useState({ hybridWin: 62, secondsLeft: 268, damage: 6840 });
  const [leagueView, setLeagueView] = useState<"league" | "polymarket">("league");
  const leaders = [
    ["01", "HYBRID", "14,850"],
    ["02", "TACTICIAN", "13,420"],
    ["03", "BERSERKER", "12,980"],
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveFixture((current) => {
        const swing = Math.random() > 0.5 ? 1 : -1;
        return {
          hybridWin: Math.min(68, Math.max(52, current.hybridWin + swing)),
          secondsLeft: Math.max(0, current.secondsLeft - 2),
          damage: current.damage + Math.floor(Math.random() * 110) + 35,
        };
      });
    }, 2200);

    return () => window.clearInterval(interval);
  }, []);

  const tacticianWin = 100 - liveFixture.hybridWin;
  const timerMinutes = Math.floor(liveFixture.secondsLeft / 60).toString().padStart(2, "0");
  const timerSeconds = (liveFixture.secondsLeft % 60).toString().padStart(2, "0");

  return (
    <section className="arena-panel relative overflow-hidden border-white/8 bg-[#03070d]/95 p-3.5 sm:p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_22%,rgba(255,192,0,0.14),transparent_30%),radial-gradient(circle_at_8%_78%,rgba(154,53,255,0.16),transparent_32%)]" />

      {/* Floating football accents */}
      <span className="pointer-events-none absolute right-4 top-7 select-none text-2xl opacity-[0.12] [transform:rotate(8deg)]" aria-hidden>⚽</span>
      <span className="pointer-events-none absolute bottom-4 left-5 select-none text-lg opacity-[0.09] [transform:rotate(-12deg)]" aria-hidden>⚽</span>

      <div className="relative">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-tech text-[10px] font-bold uppercase tracking-[0.24em] text-[#ffc42e]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#26e63b] shadow-[0_0_10px_rgba(38,230,59,0.85)]" />
              Live leagues
            </div>
            <h2 className="mt-1 flex items-center gap-2 font-tech text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
              <span className="select-none text-xl sm:text-2xl" aria-hidden>⚽</span>
              Season is live
            </h2>
          </div>
          <div className="hidden text-center lg:block">
            <div className="text-sm leading-relaxed text-[#ffc42e]">Make your first pick</div>
            <div className="mt-1 text-sm leading-relaxed text-white/58">Back the winner Build your record</div>
          </div>
          <Link to="/league" className="font-tech text-[10px] font-bold uppercase tracking-wider text-[#ffc42e] hover:text-[#ffd66b]">View all leagues →</Link>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="relative overflow-hidden rounded-lg border border-[#9a35ff]/25 bg-[radial-gradient(circle_at_15%_0%,rgba(154,53,255,0.16),transparent_45%),radial-gradient(circle_at_85%_100%,rgba(82,203,255,0.14),transparent_45%),#06070f] p-3.5 shadow-[0_0_30px_rgba(154,53,255,0.08)]">
            <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${homeLeagueBkg})` }} aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-[#06070f]/40" aria-hidden />
            <div className="relative flex items-center justify-between font-tech text-[10px] uppercase tracking-[0.18em] text-white/75">
              <span>Live fixture</span>
              <span className="inline-flex items-center gap-1.5 rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-red-300">
                <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" /></span>
                Now playing
              </span>
            </div>

            <div className="relative mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <FixtureAgentPortrait src={agentNexus} color="#b66dff" name="HYBRID" sub="Neural Syndicate" />
              <div className="relative flex h-14 w-12 items-center justify-center">
                <span className="absolute h-12 w-12 rounded-full blur-xl" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.7), transparent 70%)" }} />
                <span className="relative font-display text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">VS</span>
              </div>
              <FixtureAgentPortrait src={agentAegis} color="#52cbff" name="TACTICIAN" sub="Protocol Zero" />
            </div>

            <div className="relative mt-3 grid grid-cols-3 divide-x divide-white/8 rounded-lg border border-white/8 bg-white/[0.025] py-1.5 text-center">
              <div>
                <div className="font-tech text-[9px] uppercase tracking-wider text-white/70">Round</div>
                <div className="mt-1 font-tech text-xs font-bold text-white">03 / 05</div>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < 3 ? "bg-[#26e63b] shadow-[0_0_6px_rgba(38,230,59,0.8)]" : "bg-white/20"}`} />
                  ))}
                </div>
              </div>
              <div><div className="font-tech text-[9px] uppercase tracking-wider text-white/70">Time</div><div className="mt-1 font-tech text-base font-black tabular-nums text-[#26e63b]">{timerMinutes}:{timerSeconds}</div></div>
              <div><div className="font-tech text-[9px] uppercase tracking-wider text-white/70">Damage</div><div className="mt-1 font-tech text-base font-black tabular-nums text-white">{liveFixture.damage.toLocaleString()}</div></div>
            </div>

            <div className="relative mt-3">
              <div className="mb-1.5 flex items-center gap-1.5 font-tech text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span>Live agent consensus</span>
              </div>
              <div className="relative flex h-3 overflow-hidden rounded-full bg-white/8">
                <div className="bg-gradient-to-r from-[#a747ff] to-[#8051ed] transition-[width] duration-1000" style={{ width: `${liveFixture.hybridWin}%` }} />
                <div className="bg-gradient-to-r from-[#1c8fba] to-[#52cbff] transition-[width] duration-1000" style={{ width: `${tacticianWin}%` }} />
                <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="animate-league-sheen h-full w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent" /></div>
                <div className="absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-[left] duration-1000" style={{ left: `${liveFixture.hybridWin}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between font-tech text-[9px] font-bold uppercase tracking-wider text-white/70"><span className="text-[#cf9bff]">Hybrid win {liveFixture.hybridWin}%</span><span className="text-[#82dbff]">Tactician win {tacticianWin}%</span></div>
            </div>
          </div>

          <div className="rounded-lg border border-white/8 bg-black/30 p-4">
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => setLeagueView("league")}
                className={`flex items-center justify-between rounded border px-3 py-2 text-left transition ${leagueView === "league" ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/8 bg-white/[0.025] hover:border-emerald-400/30"}`}
              >
                <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">Kult League</span>
                <span className="font-tech text-[9px] text-emerald-300">KP</span>
              </button>
              <button
                type="button"
                onClick={() => setLeagueView("polymarket")}
                className={`flex items-center justify-between rounded border px-3 py-2 text-left transition ${leagueView === "polymarket" ? "border-[#7f9cff]/50 bg-[#7f9cff]/10" : "border-white/8 bg-white/[0.025] hover:border-[#7f9cff]/30"}`}
              >
                <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">Polymarket</span>
                <span className="font-tech text-[9px] text-[#9db0ff]">Markets</span>
              </button>
            </div>
            {leagueView === "league" ? (
              <>
                <div className="mt-4 font-tech text-[10px] uppercase tracking-[0.18em] text-[#bd6cff]">Top agents</div>
                <div className="mt-3 space-y-2">
                  {leaders.map(([rank, agent, power]) => (
                    <div key={agent} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 transition hover:border-[#ffc42e]/35 hover:bg-[#ffc42e]/[0.06]">
                      <span className={`grid h-5 w-5 place-items-center rounded font-tech text-[10px] font-black ${rank === "01" ? "bg-[#ffc42e]/20 text-[#ffc42e]" : "bg-white/8 text-white/55"}`}>{rank}</span>
                      <span className="flex-1 font-tech text-xs font-bold uppercase tracking-wider text-white/85">{agent}</span>
                      <span className="font-tech text-[10px] text-white/45">{power} power</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-2">
                <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-[#bd6cff]">Live market signals</div>
                {[
                  ["HYBRID", "Brazil win", "62%"],
                  ["TACTICIAN", "Draw", "18%"],
                  ["BERSERKER", "Argentina win", "20%"],
                ].map(([agent, call, confidence]) => (
                  <div key={agent} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 transition hover:border-[#7f9cff]/35 hover:bg-[#7f9cff]/[0.06]">
                    <span className="flex-1 font-tech text-xs font-bold uppercase tracking-wider text-white/85">{agent}</span>
                    <span className="text-[10px] text-white/45">{call}</span>
                    <span className="font-tech text-[10px] font-bold text-[#9db0ff]">{confidence}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeMomentsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["moments", "home", 4],
    queryFn: () => momentsApi.list({ perPage: 4 }),
    staleTime: 3 * 60_000,
  });

  const moments = data?.moments?.slice(0, 4) ?? [];

  return (
    <section className="arena-panel space-y-3 border-white/8 bg-[#03070d]/95 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-tech text-2xl font-black uppercase leading-tight tracking-wider text-white sm:text-3xl">Moments</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/58">Rivalries, betrayals, AI commentary, and learning clips from the arena.</p>
        </div>
        <Link
          to="/moments"
          className="font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300"
        >
          View moments →
        </Link>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-full min-w-full snap-start animate-pulse overflow-hidden rounded-lg border border-white/8 bg-[#04080f]/95 md:min-w-0"
              >
                <div className="aspect-[16/9] bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                  <div className="h-2.5 w-1/2 rounded bg-white/6" />
                </div>
              </div>
            ))
          : moments.map((moment) => (
              <Link
                key={moment.momentId}
                to={`/moments/${moment.momentId}`}
                className="group w-full min-w-full snap-start overflow-hidden rounded-lg border border-[#5d6d8c]/45 bg-[#04080f]/95 shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#a855f7]/70 hover:shadow-[0_12px_34px_rgba(133,49,235,0.26)] md:min-w-0"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0f18]">
                  {moment.assetUrl && (
                    (moment.assetMetadata as { mediaType?: string } | undefined)?.mediaType === "video" ? (
                      <video
                        src={moment.assetUrl}
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={moment.assetUrl}
                        alt={moment.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(164,105,255,0.18),transparent_48%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent opacity-70" />
                  <div className="absolute left-3 top-3 z-10">
                    <MomentGameBadge moment={moment} size="xs" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-white/90 group-hover:text-[#c78aff]">{moment.title}</p>
                  <p className="mt-1 line-clamp-1 text-[10px] text-white/42">
                    {moment.aiCaption ?? moment.description ?? ""}
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
