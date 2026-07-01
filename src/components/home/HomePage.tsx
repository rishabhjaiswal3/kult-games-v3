import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  BrainCircuit,
  Crown,
  Joystick,
  Medal,
  Radio,
  Sparkles,
  Swords,
  TrendingUp,
  UserRound,
  Video,
} from "lucide-react";
import { gamesApi } from "@/api/gamesApi";
import { momentsApi } from "@/api/momentsApi";
import { useAccess } from "@/contexts/AccessContext";
import { useAuth } from "@/contexts/AuthContext";
import { MomentGameBadge } from "@/components/moments/MomentGameBadge";
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

type HomeShortcutLink = {
  label: string;
  color: string;
  feature: AccessFeature;
  icon: typeof Swords;
  path: string;
};

const homeExperienceCards = [
  // {
  //   accent: "#9a35ff",
  //   cta: "Enter AI Arena",
  //   description: "Battle AI Agents.\nTrain them. Earn reputation.\nClimb the leaderboard.",
  //   eyebrow: "AI showdown",
  //   feature: "ai_arena",
  //   image: aiArenaSquadBanner,
  //   path: "/ai-arena",
  //   title: "AI Arena",
  // },
  // {
  //   accent: "#ffc42e",
  //   cta: "Enter League",
  //   description: "Your AI Agent predicts football matches, competes with other Agents, earns KP, and climbs the League.",
  //   eyebrow: "Season live",
  //   feature: "league",
  //   image: worldCupLeagueTrophy,
  //   path: "/league",
  //   statusLabel: "Live",
  //   title: "World Cup\nAI Agent League",
  // },
] satisfies HomeExperienceCard[];

const homeShortcutLinks = [
  { label: "AI Arena", path: "/ai-arena", icon: Swords, color: "#d06aff", feature: "ai_arena" },
  { label: "League", path: "/league", icon: Medal, color: "#8aa8ff", feature: "league" },
  { label: "Leaderboard", path: "/leaderboard", icon: Crown, color: "#ffc42e", feature: "league" },
  { label: "Dashboard", path: "/dashboard", icon: UserRound, color: "#93b4ff", feature: "ai_arena" },
] satisfies HomeShortcutLink[];

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
  const visibleShortcutLinks = homeShortcutLinks.filter((link) => canUse(link.feature));

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

  return (
    <div className="home-page space-y-6 pb-10">
      <section data-tour="home-hero" className="arena-panel relative min-h-[430px] overflow-hidden border-white/8 bg-[#04080f] sm:min-h-[520px] lg:min-h-[560px] xl:min-h-[660px] 2xl:min-h-[780px]">
        <video
          src={mobileHeroVideo}
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover sm:hidden"
        />
        <video
          src={heroVideo}
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 hidden h-full w-full object-cover object-[88%_center] sm:block sm:object-[72%_center] scale-100 opacity-100 saturate-125 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050913]/95 via-[#050913]/38 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050913]/25 to-transparent" />
        <div className="relative z-10 flex min-h-[490px] flex-col justify-end gap-8 p-5 pb-8 pt-12 sm:min-h-[520px] sm:justify-start sm:p-8 sm:pt-16 lg:min-h-[560px] xl:min-h-[660px] 2xl:min-h-[780px]">
          <div className="absolute left-5 right-5 top-5 flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-[9px] font-tech uppercase tracking-[0.16em] text-white/50 sm:static sm:gap-3 sm:text-[11px] sm:tracking-[0.2em]">
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
            <div className="flex flex-nowrap gap-1.5 sm:flex-wrap sm:gap-3">
              {canViewGames ? (
                <button
                  type="button"
                  onClick={handleExploreGames}
                  className="btn-primary inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wide sm:min-h-0 sm:flex-none sm:gap-2 sm:px-6 sm:py-2.5 sm:text-xs sm:tracking-wider"
                >
                  Explore games
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                </button>
              ) : null}
              {isAuthenticated && !canViewAiArena ? null : (
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-md border border-purple-300/60 bg-gradient-to-r from-purple-500/30 to-fuchsia-500/25 px-2 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wide text-white shadow-[0_0_18px_rgba(154,53,255,0.28)] transition hover:border-purple-200/90 hover:from-purple-500/45 hover:to-fuchsia-500/40 hover:text-white hover:shadow-[0_0_32px_rgba(154,53,255,0.55)] sm:min-h-0 sm:flex-none sm:gap-2 sm:px-6 sm:py-2.5 sm:text-xs sm:tracking-wider"
                >
                  {isAuthenticated ? "Enter AI Arena" : "Connect wallet"}
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="arena-panel relative overflow-hidden border-white/8 bg-[#03070d]/95 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_50%,rgba(0,137,255,0.14),transparent_35%),radial-gradient(circle_at_10%_20%,rgba(154,53,255,0.14),transparent_32%)]" />
        <div className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)] md:items-center">
          <div>
            <div className="font-tech text-[10px] font-bold uppercase tracking-[0.26em] text-[#bd6cff]">Your KULT ID</div>
            <h2 className="mt-2 max-w-xl font-tech text-lg font-semibold leading-snug text-white sm:text-xl">
              One identity for your entire game world
            </h2>
            <ul className="mt-1.5 grid max-w-xl grid-cols-2 gap-x-3 gap-y-1 text-sm leading-relaxed text-white/58 sm:flex sm:flex-wrap sm:items-center">
              {["Infinite Games", "Intelligent Agents", "Capture moments", "Predict the future"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#bd6cff]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {canViewAiArena ? (
            <Link to="/dashboard" className="group flex items-center gap-3 rounded-lg border border-cyan-300/20 bg-[#06101d]/80 px-3 py-2.5 transition hover:border-[#49c8ff]/60 hover:bg-[#082039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49c8ff]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#49c8ff]/45 bg-[#0b2742] font-tech text-sm font-bold text-[#66d5ff]">K</div>
              <div className="min-w-0">
                <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-[#bd6cff]">Identity card</div>
                <div className="mt-1 font-tech text-lg font-semibold leading-snug text-[#66d5ff] group-hover:text-[#66d5ff] sm:text-xl sm:text-white">One profile across Kult</div>
                <div className="mt-0.5 text-xs text-white/52">Wallet, agents, progress, and reputation</div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="arena-panel overflow-hidden border-white/8 bg-[#03070d]/95 px-5 py-3.5 sm:px-6 sm:py-4">
        <div className="font-tech text-[10px] font-bold uppercase tracking-[0.28em] text-[#bd6cff]">Ecosystem loop</div>
        <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="shrink-0 font-tech text-lg font-black uppercase leading-[1.25] text-white sm:text-xl">
              Everything you do keeps building
          </h2>
          <div className="grid grid-cols-3 gap-2 pb-1 font-tech text-[11px] font-bold uppercase tracking-[0.07em] text-white/80 sm:text-xs md:flex md:flex-wrap md:items-center md:justify-start xl:flex-nowrap xl:justify-end">
            {["Play", "Create", "Compete", "Build", "Persist"].map((step, index) => (
              <div key={step} className="flex items-center gap-2 md:shrink-0">
                <span className="flex-1 rounded-md border border-[#b766ff]/35 bg-[#7c3aed]/[0.07] px-2.5 py-1.5 text-center text-[#f1e6ff] shadow-[inset_0_0_20px_rgba(196,126,255,0.08),0_0_14px_rgba(154,53,255,0.12)] [text-shadow:0_0_10px_rgba(222,184,255,0.7)] md:flex-none md:text-left">{step}</span>
                <ArrowRight
                  className={`h-3 w-3 shrink-0 text-[#a747ff] ${index === 4 ? "invisible md:hidden" : index === 2 ? "invisible md:visible" : ""}`}
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

      {visibleExperienceCards.length > 0 || visibleShortcutLinks.length > 0 ? (
        <HomeFeaturedExperiencesSection cards={visibleExperienceCards} shortcuts={visibleShortcutLinks} />
      ) : null}
      
      {canViewAiArena ? (
        <div className="arena-panel flex flex-wrap items-center justify-between gap-4 border-white/8 bg-[#04080f]/95 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="whitespace-nowrap font-tech text-lg font-black uppercase leading-tight text-white sm:text-2xl">Ready for the arena ?</h3>
              <p className="text-sm leading-relaxed text-white/75">Train agents, earn rewards, and compete globally.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/ai-arena")}
            className="footer-arena-cta footer-arena-cta--compact group mx-auto sm:mx-0"
            style={{ width: "220px", minHeight: "42px", gap: "8px", borderRadius: "10px", fontSize: "13px" }}
          >
            <span className="footer-arena-cta__shine" aria-hidden />
            <span className="footer-arena-cta__scan" aria-hidden />
            <span className="footer-arena-cta__label">ENTER AI ARENA</span>
            <ArrowUpRight className="footer-arena-cta__icon" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function HomeFeaturedExperiencesSection({
  cards,
  shortcuts,
}: {
  cards: HomeExperienceCard[];
  shortcuts: HomeShortcutLink[];
}) {
  const shortcutGridClass =
    shortcuts.length === 1
      ? "sm:grid-cols-1"
      : shortcuts.length === 2
        ? "sm:grid-cols-2"
        : shortcuts.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <section className="arena-panel relative overflow-hidden border-white/8 bg-[#02050c]/95 p-3.5 sm:p-4 lg:p-5">
      {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(17,167,255,0.12),transparent_24%),radial-gradient(circle_at_100%_0%,rgba(255,196,0,0.12),transparent_24%)]" /> */}
       
       {shortcuts.length > 0 ? (
          <div className="mb-10">
            {/* <SectionRibbon label="Jump in" /> */}
            <div className={`mt-3 grid grid-cols-1 gap-2.5 ${shortcutGridClass}`}>
              {shortcuts.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group relative flex items-center justify-between overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,14,25,0.92),rgba(4,8,15,0.92))] px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--shortcut-color)] hover:shadow-[0_0_30px_var(--shortcut-glow)] sm:px-5 sm:py-4"
                  style={
                    {
                      "--shortcut-color": link.color,
                      "--shortcut-glow": `${link.color}2e`,
                    } as CSSProperties
                  }
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,var(--shortcut-glow),transparent_46%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div
                      className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.04] transition duration-300 group-hover:bg-[var(--shortcut-glow)] group-hover:shadow-[0_0_24px_var(--shortcut-glow)]"
                      style={{ color: link.color }}
                    >
                      <link.icon className="h-5 w-5" />
                    </div>
                    <span className="relative z-10 min-w-0 font-tech text-sm font-black uppercase tracking-[0.08em] text-white transition duration-300 group-hover:text-[var(--shortcut-color)] sm:text-[1.05rem]">
                      {link.label}
                    </span>
                  </div>
                  <ArrowUpRight className="relative z-10 h-4 w-4 shrink-0 text-white/28 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--shortcut-color)]" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}

      <div className="relative">
        {cards.length > 0 ? (
          <>
            {/* <SectionRibbon label="Featured experiences" accent="#bd6cff" /> */}
            <div className={`mt-3 grid gap-3 ${cards.length > 1 ? "xl:grid-cols-2" : ""}`}>
              {cards.map((card) => {
                const titleLines = card.title.split("\n");
                const isGoldTheme = card.accent === "#ffc42e";
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
                      className="absolute inset-0 h-full w-full object-cover object-[68%_center] transition duration-700 group-hover:scale-105 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#060914]/96 via-[#060914]/88 via-45% to-[#060914]/24" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_52%,var(--feature-glow),transparent_34%)] opacity-80" />
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
                    <div className="relative z-10 flex h-full flex-col justify-between gap-4 p-4 sm:gap-6 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className="rounded-full border px-2 py-1 font-tech text-[8px] font-bold uppercase tracking-[0.18em] sm:px-2.5 sm:text-[9px] sm:tracking-[0.22em]"
                          style={eyebrowStyle}
                        >
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
                        <h2 className="font-tech text-[1.45rem] font-black uppercase leading-[0.95] tracking-tight text-white sm:text-[2.15rem] sm:leading-[0.98]">
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
                        <p className="mt-2 whitespace-pre-line text-[12px] leading-[1.4] text-white/72 sm:mt-3 sm:text-[15px] sm:leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      <span
                        className="inline-flex w-fit items-center gap-1.5 rounded-md border px-4 py-1.5 font-tech text-[11px] font-bold uppercase tracking-[0.14em] text-white transition duration-300 group-hover:-translate-y-0.5 group-hover:brightness-110 sm:gap-2 sm:px-5 sm:py-2 sm:text-xs sm:tracking-wider"
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
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["384", "Live battles"],
              ["12.4K", "Agents awake"],
              ["72", "Rivalries"],
              ["9", "Tournaments"],
            ].map(([value, label]) => (
              <div key={label} className="min-w-0 rounded-md border border-white/8 bg-white/[0.035] p-3">
                <div className="font-tech text-xl font-bold text-white">{value}</div>
                <div className="mt-1 break-words font-tech text-[8px] uppercase tracking-normal text-white/42 sm:text-[7px] md:text-[8px] lg:text-[9px] lg:tracking-wider">{label}</div>
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
        <div className="mt-0.5 text-[10px] text-white/45">{sub}</div>
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
            <div className="flex items-center justify-between font-tech text-[10px] uppercase tracking-[0.18em] text-white/50">
              <span>Live fixture</span>
              <span className="inline-flex items-center gap-1.5 rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-red-300">
                <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" /></span>
                Now playing
              </span>
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <FixtureAgentPortrait src={agentNexus} color="#b66dff" name="HYBRID" sub="Neural Syndicate" />
              <div className="relative flex h-14 w-12 items-center justify-center">
                <span className="absolute h-12 w-12 rounded-full blur-xl" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.7), transparent 70%)" }} />
                <span className="relative font-display text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">VS</span>
              </div>
              <FixtureAgentPortrait src={agentAegis} color="#52cbff" name="TACTICIAN" sub="Protocol Zero" />
            </div>

            <div className="mt-3 grid grid-cols-3 divide-x divide-white/8 rounded-lg border border-white/8 bg-white/[0.025] py-1.5 text-center">
              <div>
                <div className="font-tech text-[9px] uppercase tracking-wider text-white/40">Round</div>
                <div className="mt-1 font-tech text-xs font-bold text-white">03 / 05</div>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < 3 ? "bg-[#26e63b] shadow-[0_0_6px_rgba(38,230,59,0.8)]" : "bg-white/20"}`} />
                  ))}
                </div>
              </div>
              <div><div className="font-tech text-[9px] uppercase tracking-wider text-white/40">Time</div><div className="mt-1 font-tech text-base font-black tabular-nums text-[#26e63b]">{timerMinutes}:{timerSeconds}</div></div>
              <div><div className="font-tech text-[9px] uppercase tracking-wider text-white/40">Damage</div><div className="mt-1 font-tech text-base font-black tabular-nums text-white">{liveFixture.damage.toLocaleString()}</div></div>
            </div>

            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-[0.16em] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span>Live agent consensus</span>
              </div>
              <div className="relative flex h-3 overflow-hidden rounded-full bg-white/8">
                <div className="bg-gradient-to-r from-[#a747ff] to-[#8051ed] transition-[width] duration-1000" style={{ width: `${liveFixture.hybridWin}%` }} />
                <div className="bg-gradient-to-r from-[#1c8fba] to-[#52cbff] transition-[width] duration-1000" style={{ width: `${tacticianWin}%` }} />
                <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="animate-league-sheen h-full w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent" /></div>
                <div className="absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-[left] duration-1000" style={{ left: `${liveFixture.hybridWin}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between font-tech text-[9px] uppercase tracking-wider text-white/48"><span className="text-[#b66dff]">Hybrid win {liveFixture.hybridWin}%</span><span className="text-[#52cbff]">Tactician win {tacticianWin}%</span></div>
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
                      <span className="flex-1 font-tech text-xs font-bold uppercase text-white/85">{agent}</span>
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
                    <span className="flex-1 font-tech text-[10px] font-bold uppercase text-white/85">{agent}</span>
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
                className="group w-full min-w-full snap-start overflow-hidden rounded-lg border border-white/8 bg-[#04080f]/95 transition hover:-translate-y-0.5 hover:border-[#9a35ff]/35 md:min-w-0"
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
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-transparent to-transparent" />
                  <div className="absolute left-3 top-3">
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
