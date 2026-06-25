import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Flame,
  Gamepad2,
  Info,
  Layers,
  Package,
  Search,
  Smartphone,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { GameListingCard, GameListingCardSkeleton } from "@/components/games/GameListingCard";
import { gamesApi } from "@/api/gamesApi";
import { useAccess } from "@/contexts/AccessContext";
import { isGameDownloadable } from "@/lib/gameDownload";
import { getGameDescription, getGameImage, getGameKey, getGameName } from "@/lib/gameDisplay";
import type { Game } from "@/types/api";

const GAME_TYPE_FILTERS = ["All", "Action", "Arcade", "Puzzle", "Racing"] as const;

const GAME_TYPE_GAME_KEYS: Record<(typeof GAME_TYPE_FILTERS)[number], string[]> = {
  All: [],
  Action: ["robowars", "warzonewarriors"],
  Arcade: ["zerogpool", "zerodash"],
  Puzzle: ["guesstheai"],
  Racing: ["highwayhustle"],
};

const RECENT_GAMES_KEY = "kult-recent-games";

function gameId(game: Game) {
  return game.identification ?? game.slug ?? game._id ?? "";
}

function formatPlays(plays?: number) {
  if (!plays) return "Arena ready";
  if (plays >= 1_000_000) return `${(plays / 1_000_000).toFixed(1)}M plays`;
  if (plays >= 1_000) return `${Math.round(plays / 1_000)}K plays`;
  return `${plays} plays`;
}

function DiscoveryGameCard({
  game,
  label,
  index,
  fillMobileWidth,
  onOpen,
}: {
  game: Game;
  label: string;
  index: number;
  fillMobileWidth: boolean;
  onOpen: () => void;
}) {
  const image = getGameImage(game);
  const name = getGameName(game.name);
  const downloadable = isGameDownloadable(game);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-[#070b15] text-left transition duration-300 hover:-translate-y-1 hover:border-[#9a35ff]/65 hover:shadow-[0_16px_34px_rgba(0,0,0,0.32),0_0_28px_rgba(154,53,255,0.18)] sm:w-[250px] lg:w-[calc((100%-1.5rem)/3)] ${fillMobileWidth ? "w-full" : "w-[230px]"}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#050914]">
        {image ? <img src={image} alt="" className="h-full w-full object-cover object-center brightness-125 saturate-130 contrast-105 transition duration-500 group-hover:scale-105 group-hover:brightness-135 group-hover:saturate-150" loading="lazy" /> : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_52%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-black/55 font-tech text-[10px] font-black text-white backdrop-blur-sm">
          0{index + 1}
        </span>
        <span className="absolute bottom-2 right-3 rounded border border-[#00f080]/25 bg-[#001d16]/75 px-2 py-1 font-tech text-[8px] font-bold uppercase tracking-wider text-[#72f7bb]">
          {downloadable ? "Download" : "Play now"}
        </span>
      </div>
      <div className="relative p-3">
        <p className="font-tech text-[8px] font-bold uppercase tracking-[0.16em] text-[#c78aff]">{label}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <h3 className="truncate font-tech text-sm font-black uppercase text-white">{name}</h3>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-[#d6acff]" />
        </div>
        <p className="mt-1 font-tech text-[9px] uppercase tracking-wider text-white/42">
          {game.rating != null ? `★ ${game.rating} · ` : ""}{formatPlays(game.play_count)}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#c084fc] to-transparent opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

function DiscoverySection({
  title,
  subtitle,
  icon: Icon,
  accent,
  games,
  label,
  onOpen,
}: {
  title: string;
  subtitle: string;
  icon: typeof Flame;
  accent: string;
  games: Game[];
  label: string;
  onOpen: (game: Game) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const hasOverflow = games.length > 3;

  if (!games.length) return null;

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(112deg,rgba(8,13,25,0.96),rgba(5,8,16,0.98))] p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full blur-3xl" style={{ backgroundColor: accent, opacity: 0.1 }} />
      <div className="relative mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.045]" style={{ color: accent }}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-tech text-sm font-black uppercase tracking-wide text-white">{title}</h2>
            <p className="mt-0.5 text-[10px] text-white/46">{subtitle}</p>
          </div>
        </div>
        {hasOverflow ? (
          <div className="flex items-center gap-2">
            <span className="hidden font-tech text-[9px] uppercase tracking-wider text-white/35 sm:block">More to explore</span>
            <button
              type="button"
              aria-label={`Show previous ${title} games`}
              onClick={() => carouselRef.current?.scrollBy({ left: -carouselRef.current.clientWidth, behavior: "smooth" })}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/60 transition hover:border-[#9a35ff]/50 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Show more ${title} games`}
              onClick={() => carouselRef.current?.scrollBy({ left: carouselRef.current.clientWidth, behavior: "smooth" })}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/60 transition hover:border-[#9a35ff]/50 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div ref={carouselRef} className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game, index) => (
          <DiscoveryGameCard
            key={gameId(game)}
            game={game}
            label={label}
            index={index}
            fillMobileWidth={games.length === 1}
            onOpen={() => onOpen(game)}
          />
        ))}
      </div>
    </section>
  );
}

const Games = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<(typeof GAME_TYPE_FILTERS)[number]>("All");
  const [recentGameIds, setRecentGameIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const { canUse } = useAccess();
  const canViewLeague = canUse("league");

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", "all"],
    queryFn: () => gamesApi.getAll(1, 50),
    staleTime: 5 * 60_000,
  });

  const allGames = useMemo(() => gamesData?.games ?? [], [gamesData?.games]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(RECENT_GAMES_KEY) ?? "[]");
      if (Array.isArray(stored)) setRecentGameIds(stored.filter((id): id is string => typeof id === "string"));
    } catch {
      // A malformed saved value should never block the games catalogue.
    }
  }, []);

  const filtered = useMemo(() => {
    return allGames.filter((game) => {
      const name = getGameName(game.name).toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      const key = getGameKey(game);
      const allowedKeys = GAME_TYPE_GAME_KEYS[selectedCategory];
      const matchCat = selectedCategory === "All" || allowedKeys.includes(key);
      return matchSearch && matchCat;
    });
  }, [allGames, search, selectedCategory]);

  const featuredGames = useMemo(() => filtered.slice(0, 2), [filtered]);
  const trendingGames = useMemo(
    () => [...filtered].sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0) || (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4),
    [filtered],
  );
  const popularGames = useMemo(
    () => [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.play_count ?? 0) - (a.play_count ?? 0)).slice(0, 4),
    [filtered],
  );
  const continuePlayingGames = useMemo(() => {
    const byId = new Map(filtered.map((game) => [gameId(game), game]));
    const recent = recentGameIds.map((id) => byId.get(id)).filter((game): game is Game => Boolean(game));
    return recentGameIds.length ? recent.slice(0, 4) : filtered.slice(0, 4);
  }, [filtered, recentGameIds]);

  const instantPlayCount = useMemo(
    () => allGames.filter((g) => !isGameDownloadable(g)).length,
    [allGames],
  );
  const downloadableCount = allGames.length - instantPlayCount;

  const openGame = (game: Game) => {
    const id = gameId(game);
    if (!id) return;
    const nextRecent = [id, ...recentGameIds.filter((recentId) => recentId !== id)].slice(0, 8);
    setRecentGameIds(nextRecent);
    try {
      window.localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(nextRecent));
    } catch {
      // Browsers may block storage in private or embedded contexts.
    }
    navigate(`/game/${id}`);
  };

  return (
    <ArenaPageLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-tech text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
            Play Today. Build Forever.
          </h1>
          <p className="mt-3 max-w-5xl text-base leading-relaxed text-white/60 sm:text-lg">
            Every game on KULT connects to the AI Arena ecosystem — your agents play alongside you, and every match builds reputation.
          </p>
        </div>
        <Link to="/inventory" className="topbar-wallet-cta group h-10 shrink-0 gap-2 px-4 text-[11px] tracking-wider">
          <Package className="h-4 w-4" />
          Inventory
          <ArrowUpRight className="h-3.5 w-3.5 opacity-75 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </Link>
      </div>

      <div className="arena-panel grid grid-cols-2 divide-x divide-white/8 overflow-hidden md:grid-cols-4" data-tour="games-stats">
        {[
          { label: "TOTAL GAMES", value: String(allGames.length), icon: Gamepad2, color: "#0089ff" },
          { label: "VISIBLE", value: String(filtered.length), icon: Layers, color: "#b338ff" },
          { label: "INSTANT PLAY", value: String(instantPlayCount), icon: Zap, color: "#00f080" },
          { label: "DOWNLOADABLE", value: String(downloadableCount), icon: Download, color: "#ffc000" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-white/[0.04]">
              <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="font-tech text-[9px] text-white/48">{stat.label}</div>
              <div className="mt-1 text-2xl font-semibold text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="arena-panel flex flex-wrap items-center justify-between gap-3 border-white/8 bg-[#04080f]/95 p-3" data-tour="games-filters">
        <div className="flex flex-wrap items-center gap-1">
          {GAME_TYPE_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider transition ${
                selectedCategory === cat
                  ? "bg-[#9a35ff] text-white"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat === "All" ? "ALL GAMES" : cat.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="relative max-sm:w-full sm:min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded border border-white/8 bg-[#0a0f1b]/80 pl-9 pr-3 font-tech text-[10px] uppercase tracking-wider text-white placeholder:text-white/30 focus:border-[#9a35ff]/45 focus:outline-none"
          />
        </div>
      </div>

      {!gamesLoading ? (
        <div className="space-y-4">
          <DiscoverySection
            title="Continue playing"
            subtitle={recentGameIds.length ? "Your recent worlds are waiting for you." : "Start a run — your recent games will appear here."}
            icon={Clock3}
            accent="#00e5ff"
            games={continuePlayingGames}
            label={recentGameIds.length ? "Pick up where you left off" : "Ready to launch"}
            onOpen={openGame}
          />
          <DiscoverySection
            title="Trending games"
            subtitle="The arena's hottest runs right now."
            icon={Flame}
            accent="#ff6b3d"
            games={trendingGames}
            label="Trending now"
            onOpen={openGame}
          />
          <DiscoverySection
            title="Most popular"
            subtitle="Top-rated titles built for repeat victories."
            icon={Trophy}
            accent="#ffc000"
            games={popularGames}
            label="Community favorite"
            onOpen={openGame}
          />
        </div>
      ) : null}

      {!gamesLoading && featuredGames.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Featured titles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredGames.map((game) => {
              const name = getGameName(game.name);
              const image = getGameImage(game);
              const downloadable = isGameDownloadable(game);
              return (
                <article
                  key={game._id ?? game.identification}
                  className="arena-panel group relative min-h-[240px] overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-[#9a35ff]/50 hover:shadow-[0_0_46px_rgba(154,53,255,0.2)]"
                >
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-85"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050913]/95 via-[#050913]/75 to-[#050913]/35 transition group-hover:via-[#050913]/58" />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent,transparent_6px,rgba(0,240,255,0.06)_7px)]" />
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#c084fc] to-transparent" />
                  </div>
                  <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between p-6">
                    <div>
                      <span className="inline-flex rounded border border-[#9f2dff]/50 bg-[#5b1499]/35 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#d773ff]">
                        {game.category ?? "Arena Game"}
                      </span>
                      <h3 className="mt-3 font-tech text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                        {name}
                      </h3>
                      <p className="mt-2 line-clamp-2 max-w-md text-xs text-white/65">
                        {getGameDescription(game.description) || "Jump in and compete on the Kult leaderboard."}
                      </p>
                      <div className="mt-4 grid max-w-sm grid-cols-3 gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
                        {[
                          ["AI Win", "74%"],
                          ["Heat", downloadable ? "BUILD" : "LIVE"],
                          ["Rivals", "32"],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded border border-white/8 bg-black/35 px-2 py-1.5">
                            <div className="font-tech text-[8px] uppercase tracking-wider text-white/34">{label}</div>
                            <div className="mt-0.5 font-tech text-[10px] font-bold text-white/80">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openGame(game)}
                        className="flex h-10 w-fit items-center gap-2 rounded border border-[#9b32ff]/70 bg-[#170d26]/75 px-4 font-tech text-[10px] font-bold uppercase tracking-wider text-[#d6acff] transition hover:border-[#9a35ff]"
                      >
                        {downloadable ? "View & Download" : "Enter Game"}
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                      <span className="flex translate-y-1 items-center gap-2 rounded border border-white/8 bg-black/35 px-3 py-2 text-[10px] text-white/58 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Volume2 className="h-3.5 w-3.5 text-[#00f080]" />
                        AI voice line armed
                        <Activity className="h-3.5 w-3.5 text-[#9a35ff]" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-1">
        <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">All games</h2>
        <span className="font-tech text-[10px] text-white/40">{filtered.length} titles</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-tour="games-grid">
        {gamesLoading
          ? Array.from({ length: 8 }).map((_, i) => <GameListingCardSkeleton key={i} />)
          : filtered.map((game) => (
              <GameListingCard
                key={game._id ?? game.identification}
                game={game}
                name={getGameName(game.name)}
                image={getGameImage(game)}
                description={getGameDescription(game.description)}
                downloadable={isGameDownloadable(game)}
                onOpen={() => openGame(game)}
              />
            ))}
      </div>

      {!gamesLoading && filtered.length === 0 ? (
        <div className="arena-panel border-white/8 px-6 py-14 text-center">
          <p className="font-tech text-sm uppercase tracking-wider text-white/55">No games found</p>
          <p className="mt-2 text-xs text-white/40">Try another category or search term.</p>
        </div>
      ) : null}

      <div className="arena-panel flex flex-wrap items-center justify-between gap-3 border-white/8 bg-[#04080f]/95 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">
              Every game connects to the AI Arena ecosystem.
            </h4>
            <p className="text-[9px] font-semibold leading-none text-white/40">
              Train agents, battle rivals, and climb leaderboards across titles.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-2 font-tech text-[9px] font-bold uppercase tracking-wider text-white/50 sm:inline-flex">
            <Smartphone className="h-3.5 w-3.5" />
            Cross-platform
          </span>
          {canViewLeague ? (
            <button
              type="button"
              onClick={() => navigate("/leaderboard")}
              className="flex cursor-pointer items-center gap-1.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-5 py-2.5 font-tech text-[9px] font-bold uppercase tracking-wider text-purple-400 transition hover:border-purple-500/35 hover:bg-purple-950/10"
            >
              <span>View Leaderboard</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </ArenaPageLayout>
  );
};

export default Games;
