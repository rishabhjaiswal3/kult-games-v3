import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Zap,
  Trophy,
  Swords,
  Target,
  Shield,
  Plus,
  Hexagon,
  Video,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { momentsApi } from "@/api/momentsApi";
import {
  isMomentsCreateQueryOpen,
  KNOWN_MOMENT_GAMES,
  KNOWN_MOMENT_GAME_LABELS,
  MOMENTS_BATTLE_ID_QUERY_PARAM,
  MOMENTS_CREATE_QUERY_PARAM,
  MOMENTS_ARENA_GAME_ID_QUERY_PARAM,
  MOMENTS_HUB_PREVIEW_COUNT,
  MOMENTS_MY_AGENT_ID_QUERY_PARAM,
  MOMENTS_QUERY_KEY_ROOT,
} from "@/constants/moments";
import type { Moment, MomentsFeedResponse } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { requestOpenLoginModal } from "@/lib/loginModalBus";
import { CreateMomentDialog } from "@/components/moments/CreateMomentDialog";
import { MomentFeedCard, MomentFeedCardSkeleton } from "@/components/moments/MomentFeedCard";
import {
  deriveCreator,
  deriveGame,
  deriveMomentCard,
  formatDuration,
  seededAvatar,
  shortWallet,
  type MomentCard,
} from "@/lib/momentCard";

type MainTab = "DISCOVER" | "MY MOMENTS" | "BOOKMARKS" | "RECENTLY WATCHED";
type SubCategory = "TRENDING" | "EPIC PLAYS" | "TOP PLAYS" | "CLUTCH" | "KILLS" | "VICTORIES";

const SUB_CATEGORIES: SubCategory[] = [
  "TRENDING",
  "EPIC PLAYS",
  "TOP PLAYS",
  "CLUTCH",
  "KILLS",
  "VICTORIES",
];

function parseSubCategory(value: string | null): SubCategory | null {
  return SUB_CATEGORIES.includes(value as SubCategory) ? (value as SubCategory) : null;
}

function buildMomentsBrowseHref(filters: {
  category: SubCategory;
  game: string;
  mode: string;
  bestOf: string;
  time: string;
  q: string;
  tab: MainTab;
}) {
  const params = new URLSearchParams();
  params.set("category", filters.category);
  if (filters.game !== "ALL GAMES") params.set("game", filters.game);
  if (filters.mode !== "ALL MODES") params.set("mode", filters.mode);
  if (filters.bestOf !== "BEST OF") params.set("bestOf", filters.bestOf);
  if (filters.time !== "ANY TIME") params.set("time", filters.time);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.tab !== "DISCOVER") params.set("tab", filters.tab);
  const query = params.toString();
  return query ? `/moments/browse?${query}` : "/moments/browse";
}

const PAGE_SIZE = 9;
const NOW_MS = () => Date.now();

function dedupeMoments(moments: Moment[]) {
  const byId = new Map<string, Moment>();
  for (const m of moments) {
    if (!byId.has(m.momentId)) byId.set(m.momentId, m);
  }
  return [...byId.values()];
}

function isWithinTimeWindow(createdAt: string | undefined, selectedTime: string) {
  if (selectedTime === "ANY TIME") return true;
  if (!createdAt) return false;
  const ts = new Date(createdAt).getTime();
  if (!Number.isFinite(ts)) return false;
  const now = NOW_MS();
  if (selectedTime === "LAST 24 HOURS") return now - ts <= 24 * 60 * 60 * 1000;
  if (selectedTime === "THIS WEEK") return now - ts <= 7 * 24 * 60 * 60 * 1000;
  if (selectedTime === "THIS MONTH") return now - ts <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

function sortMomentCards(cards: MomentCard[], selectedBestOf: string, creatorCounts: Map<string, number>) {
  return [...cards].sort((a, b) => {
    if (selectedBestOf === "MOST VIEWS") return b.viewCount - a.viewCount || b.likeCount - a.likeCount;
    if (selectedBestOf === "MOST LIKES") return b.likeCount - a.likeCount || b.viewCount - a.viewCount;
    if (selectedBestOf === "TOP CREATORS") return (creatorCounts.get(b.creator) ?? 0) - (creatorCounts.get(a.creator) ?? 0) || b.likeCount - a.likeCount;
    return (b.raw.aiRankScore ?? 0) - (a.raw.aiRankScore ?? 0) || b.likeCount - a.likeCount || b.viewCount - a.viewCount;
  });
}

function averageDurationLabel(cards: MomentCard[]) {
  const durations = cards.map((c) => c.durationSeconds).filter((v): v is number => typeof v === "number" && v > 0);
  if (durations.length === 0) return "—";
  return formatDuration(Math.round(durations.reduce((t, v) => t + v, 0) / durations.length));
}

function feedHasMore(lastPage: MomentsFeedResponse, allPages: MomentsFeedResponse[]) {
  const loaded = allPages.reduce((t, p) => t + p.moments.length, 0);
  if (lastPage.total > 0 && loaded >= lastPage.total) return false;
  if (lastPage.totalPages > 0 && lastPage.page >= lastPage.totalPages) return false;
  return lastPage.moments.length >= lastPage.perPage;
}

function CreatorRankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1
      ? "border-amber-400/60 bg-amber-400/15 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.35)]"
      : rank === 2
        ? "border-slate-300/50 bg-slate-300/10 text-slate-200"
        : rank === 3
          ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
          : "border-white/10 bg-white/5 text-white/45";
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border font-tech text-[10px] font-black ${styles}`}>
      {rank}
    </span>
  );
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
type FilterMenuPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

function computeFilterMenuPosition(button: HTMLButtonElement, optionCount: number): FilterMenuPosition {
  const rect = button.getBoundingClientRect();
  const viewportPadding = 8;
  const width = Math.min(Math.max(rect.width, 176), window.innerWidth - viewportPadding * 2);
  let left = rect.left;
  left = Math.min(left, window.innerWidth - width - viewportPadding);
  left = Math.max(viewportPadding, left);

  const estimatedMenuHeight = Math.min(optionCount * 34 + 8, 320);
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
  const spaceAbove = rect.top - viewportPadding;
  const openAbove = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
  const maxHeight = Math.max(120, Math.min(320, openAbove ? spaceAbove : spaceBelow));

  if (openAbove) {
    return {
      bottom: window.innerHeight - rect.top + 4,
      left,
      width,
      maxHeight,
    };
  }

  return {
    top: rect.bottom + 4,
    left,
    width,
    maxHeight,
  };
}

function FilterDropdown({ options, value, onSelect, activeDropdown, name, onToggle }: {
  options: string[]; value: string;
  onSelect: (v: string) => void;
  activeDropdown: string | null; name: string; onToggle: (n: string) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isOpen = activeDropdown === name;
  const [menuPosition, setMenuPosition] = useState<FilterMenuPosition | null>(null);

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    setMenuPosition(computeFilterMenuPosition(button, options.length));
  }, [options.length]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }
    updateMenuPosition();
  }, [isOpen, updateMenuPosition, value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const menu = useMemo(() => {
    if (!isOpen || !menuPosition || typeof document === "undefined") return null;

    return createPortal(
      <>
        <div className="fixed inset-0 z-[120]" onClick={() => onToggle(name)} aria-hidden />
        <div
          className="fixed z-[130] overflow-y-auto rounded border border-white/10 bg-[#080d19] p-1 shadow-xl"
          style={{
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            left: menuPosition.left,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onSelect(opt); onToggle(name); }}
              className={`w-full rounded px-2.5 py-1.5 text-left font-tech text-[10px] font-bold uppercase transition hover:bg-white/5 hover:text-white ${value === opt ? "bg-white/[0.02] text-purple-400" : "text-white/60"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </>,
      document.body,
    );
  }, [isOpen, menuPosition, name, onSelect, onToggle, options, value]);

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onToggle(name)}
        className="flex h-[34px] min-w-[8.5rem] cursor-pointer items-center justify-between gap-1.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-2.5 py-1.5 font-tech text-[9px] font-bold uppercase text-white [text-shadow:0_0_10px_rgba(255,255,255,0.35)] transition hover:border-white/20 hover:text-white sm:min-w-0 sm:max-w-[10.5rem] sm:px-3 sm:text-[10px]"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/70" />
      </button>
      {menu}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AllMomentsPage() {
  const location = useLocation();
  const isBrowseAll = location.pathname === "/moments/browse";

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (location.pathname !== "/moments/browse") return "DISCOVER";
    const tab = searchParams.get("tab");
    if (tab === "MY MOMENTS" || tab === "BOOKMARKS" || tab === "RECENTLY WATCHED") return tab;
    return "DISCOVER";
  });
  const [activeCategory, setActiveCategory] = useState<SubCategory>(() => {
    if (location.pathname !== "/moments/browse") return "TRENDING";
    return parseSubCategory(searchParams.get("category")) ?? "TRENDING";
  });
  const [selectedGame, setSelectedGame] = useState(() =>
    location.pathname === "/moments/browse" ? searchParams.get("game") ?? "ALL GAMES" : "ALL GAMES",
  );
  const [selectedMode, setSelectedMode] = useState(() =>
    location.pathname === "/moments/browse" ? searchParams.get("mode") ?? "ALL MODES" : "ALL MODES",
  );
  const [selectedBestOf, setSelectedBestOf] = useState(() =>
    location.pathname === "/moments/browse" ? searchParams.get("bestOf") ?? "BEST OF" : "BEST OF",
  );
  const [selectedTime, setSelectedTime] = useState(() =>
    location.pathname === "/moments/browse" ? searchParams.get("time") ?? "ANY TIME" : "ANY TIME",
  );
  const [searchQuery, setSearchQuery] = useState(() =>
    location.pathname === "/moments/browse" ? searchParams.get("q") ?? "" : "",
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const navigate = useNavigate();
  const [createSearchParams, setSearchParams] = useSearchParams();
  const battleIdParam = createSearchParams.get(MOMENTS_BATTLE_ID_QUERY_PARAM);
  const myAgentIdParam = createSearchParams.get(MOMENTS_MY_AGENT_ID_QUERY_PARAM);
  const arenaGameIdParam = createSearchParams.get(MOMENTS_ARENA_GAME_ID_QUERY_PARAM);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const myMomentsQuery = useQuery({
    queryKey: [MOMENTS_QUERY_KEY_ROOT, "mine"],
    queryFn: () => momentsApi.getMine(1, 50),
    enabled: isAuthenticated && activeTab === "MY MOMENTS",
    staleTime: 30_000,
  });

  const bookmarksQuery = useQuery({
    queryKey: [MOMENTS_QUERY_KEY_ROOT, "bookmarks"],
    queryFn: () => momentsApi.getBookmarks(1, 100),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const recentlyWatchedQuery = useQuery({
    queryKey: [MOMENTS_QUERY_KEY_ROOT, "recentlyWatched"],
    queryFn: () => momentsApi.getRecentlyWatched(1, 20),
    enabled: isAuthenticated && activeTab === "RECENTLY WATCHED",
    staleTime: 10_000,
  });

  const bookmarkedIds = useMemo(
    () => new Set((bookmarksQuery.data?.moments ?? []).map((m) => m.momentId)),
    [bookmarksQuery.data],
  );
  const deferredSearch = useDebounce(searchQuery.trim(), 400);

  const syncCreateQueryParam = useCallback(
    (open: boolean) => {
      const next = new URLSearchParams(createSearchParams);
      if (open) next.set(MOMENTS_CREATE_QUERY_PARAM, "true");
      else {
        next.delete(MOMENTS_CREATE_QUERY_PARAM);
        next.delete(MOMENTS_BATTLE_ID_QUERY_PARAM);
        next.delete(MOMENTS_MY_AGENT_ID_QUERY_PARAM);
        next.delete(MOMENTS_ARENA_GAME_ID_QUERY_PARAM);
      }
      const nextSearch = next.toString();
      const currentSearch = createSearchParams.toString();
      if (nextSearch !== currentSearch) {
        setSearchParams(next, { replace: true });
      }
    },
    [createSearchParams, setSearchParams],
  );

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      if (open && !isAuthenticated) {
        syncCreateQueryParam(true);
        requestOpenLoginModal();
        return;
      }
      setIsCreateOpen(open);
      syncCreateQueryParam(open);
    },
    [isAuthenticated, syncCreateQueryParam],
  );

  useEffect(() => {
    const shouldOpen =
      isMomentsCreateQueryOpen(createSearchParams.get(MOMENTS_CREATE_QUERY_PARAM)) ||
      Boolean(createSearchParams.get(MOMENTS_BATTLE_ID_QUERY_PARAM)?.trim());
    if (!shouldOpen) {
      setIsCreateOpen(false);
      return;
    }
    if (!isAuthenticated) {
      requestOpenLoginModal();
      return;
    }
    setIsCreateOpen(true);
  }, [createSearchParams, isAuthenticated]);

  useEffect(() => {
    if (!isBrowseAll) return;
    const params = new URLSearchParams();
    params.set("category", activeCategory);
    if (selectedGame !== "ALL GAMES") params.set("game", selectedGame);
    if (selectedMode !== "ALL MODES") params.set("mode", selectedMode);
    if (selectedBestOf !== "BEST OF") params.set("bestOf", selectedBestOf);
    if (selectedTime !== "ANY TIME") params.set("time", selectedTime);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeTab !== "DISCOVER") params.set("tab", activeTab);
    const createFlag = createSearchParams.get(MOMENTS_CREATE_QUERY_PARAM);
    if (createFlag) params.set(MOMENTS_CREATE_QUERY_PARAM, createFlag);
    const battleId = createSearchParams.get(MOMENTS_BATTLE_ID_QUERY_PARAM);
    if (battleId) params.set(MOMENTS_BATTLE_ID_QUERY_PARAM, battleId);
    const myAgentId = createSearchParams.get(MOMENTS_MY_AGENT_ID_QUERY_PARAM);
    if (myAgentId) params.set(MOMENTS_MY_AGENT_ID_QUERY_PARAM, myAgentId);
    const arenaGameId = createSearchParams.get(MOMENTS_ARENA_GAME_ID_QUERY_PARAM);
    if (arenaGameId) params.set(MOMENTS_ARENA_GAME_ID_QUERY_PARAM, arenaGameId);
    const nextSearch = params.toString();
    if (nextSearch !== createSearchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [
    activeCategory,
    activeTab,
    createSearchParams,
    isBrowseAll,
    searchQuery,
    selectedBestOf,
    selectedGame,
    selectedMode,
    selectedTime,
    setSearchParams,
  ]);

  const apiGame = selectedGame !== "ALL GAMES"
    ? KNOWN_MOMENT_GAMES.find((g) => g.label === selectedGame)?.slug
    : undefined;

  const apiMode = selectedMode === "AI ARENA" ? "ai_arena"
    : selectedMode === "TRASH TALK" ? "trash_talk"
    : selectedMode === "LEAGUE" ? "league"
    : undefined;

  const apiDate = selectedTime === "LAST 24 HOURS" ? "last_24h"
    : selectedTime === "THIS WEEK" ? "this_week"
    : selectedTime === "THIS MONTH" ? "this_month"
    : undefined;

  const apiSort = selectedBestOf === "MOST LIKES" ? "most_liked"
    : selectedBestOf === "TOP CREATORS" ? "top_creator"
    : "newest";

  const discoverQuery = useInfiniteQuery({
    queryKey: [MOMENTS_QUERY_KEY_ROOT, "discover", deferredSearch, apiGame, apiMode, apiDate, apiSort],
    queryFn: ({ pageParam }) => momentsApi.list({
      page: pageParam,
      perPage: PAGE_SIZE,
      searchQuery: deferredSearch || undefined,
      game: apiGame,
      mode: apiMode,
      date: apiDate,
      sort: apiSort,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => feedHasMore(lastPage, allPages) ? lastPageParam + 1 : undefined,
    staleTime: 30_000,
    retry: 1,
  });

  const discoverMoments = useMemo(() => discoverQuery.data?.pages.flatMap((p) => p.moments) ?? [], [discoverQuery.data]);
  const allKnownMoments = useMemo(() => dedupeMoments(discoverMoments), [discoverMoments]);

  const creatorMomentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of allKnownMoments) {
      const c = deriveCreator(m);
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return counts;
  }, [allKnownMoments]);

  const discoverCards = useMemo(() => discoverMoments.map((m) => deriveMomentCard(m, bookmarkedIds)), [discoverMoments, bookmarkedIds]);

  const trendingGames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of allKnownMoments) {
      const game = deriveGame(m);
      counts.set(game, (counts.get(game) ?? 0) + 1);
    }
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = entries[0]?.[1] ?? 1;
    return entries.map(([game, count]) => ({
      game,
      count,
      pct: Math.max(10, Math.round((count / max) * 100)),
    }));
  }, [allKnownMoments]);

  const sourceCards = useMemo(() => {
    if (activeTab === "MY MOMENTS") {
      return (myMomentsQuery.data?.moments ?? []).map((m) => deriveMomentCard(m, bookmarkedIds));
    }
    if (activeTab === "BOOKMARKS") {
      return (bookmarksQuery.data?.moments ?? []).map((m) => deriveMomentCard(m, bookmarkedIds));
    }
    if (activeTab === "RECENTLY WATCHED") {
      return (recentlyWatchedQuery.data?.moments ?? []).map((m) => deriveMomentCard(m, bookmarkedIds));
    }
    return discoverCards;
  }, [activeTab, bookmarkedIds, bookmarksQuery.data, discoverCards, myMomentsQuery.data, recentlyWatchedQuery.data]);

  const filteredMoments = useMemo(() => {
    const cards = sourceCards.filter((card) => {
      if (!card.categories.has(activeCategory)) return false;
      if (selectedGame !== "ALL GAMES" && card.game !== selectedGame) return false;
      if (selectedMode !== "ALL MODES" && card.mode !== selectedMode) return false;
      if (!isWithinTimeWindow(card.raw.createdAt, selectedTime)) return false;
      if (deferredSearch) {
        const hay = [card.title, card.creator, card.game, card.description, card.raw.playerWalletAddress].join(" ").toLowerCase();
        if (!hay.includes(deferredSearch.toLowerCase())) return false;
      }
      return true;
    });
    return sortMomentCards(cards, selectedBestOf, creatorMomentCounts);
  }, [activeCategory, creatorMomentCounts, deferredSearch, selectedBestOf, selectedGame, selectedMode, selectedTime, sourceCards]);

  const displayMoments = useMemo(
    () => (isBrowseAll ? filteredMoments : filteredMoments.slice(0, MOMENTS_HUB_PREVIEW_COUNT)),
    [filteredMoments, isBrowseAll],
  );

  const browseHref = useMemo(
    () =>
      buildMomentsBrowseHref({
        category: activeCategory,
        game: selectedGame,
        mode: selectedMode,
        bestOf: selectedBestOf,
        time: selectedTime,
        q: searchQuery,
        tab: activeTab,
      }),
    [activeCategory, activeTab, searchQuery, selectedBestOf, selectedGame, selectedMode, selectedTime],
  );

  const showViewMore =
    !isBrowseAll && activeTab === "DISCOVER" && !discoverQuery.isLoading && filteredMoments.length > 0;

  const topCreatorsQuery = useQuery({
    queryKey: [MOMENTS_QUERY_KEY_ROOT, "top-creators"],
    queryFn: () => momentsApi.getTopCreators(10),
    staleTime: 5 * 60_000,
  });

  const canLoadMore = isBrowseAll && activeTab === "DISCOVER" && Boolean(discoverQuery.hasNextPage);
  const isLoadingMore = isBrowseAll && activeTab === "DISCOVER" && discoverQuery.isFetchingNextPage;

  const handleLoadMoreRef = useRef(() => {});
  handleLoadMoreRef.current = () => { if (canLoadMore) void discoverQuery.fetchNextPage(); };

  const feedScrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRefCallback = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;
    const scrollRoot = feedScrollRef.current;
    const useNestedRoot =
      scrollRoot &&
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1280px)").matches;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) handleLoadMoreRef.current(); },
      { root: useNestedRoot ? scrollRoot : null, rootMargin: "240px" },
    );
    io.observe(node);
    observerRef.current = io;
  }, []);

  useEffect(() => () => { observerRef.current?.disconnect(); }, []);

  useEffect(() => {
    feedScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  const bookmarkMutation = useMutation({
    mutationFn: (momentId: string) => momentsApi.toggleBookmark(momentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MOMENTS_QUERY_KEY_ROOT, "bookmarks"] });
    },
    onError: () => {},
  });

  const handleBookmarkToggle = useCallback((id: string) => {
    if (!isAuthenticated) { requestOpenLoginModal(); return; }
    bookmarkMutation.mutate(id);
  }, [isAuthenticated, bookmarkMutation]);

  const openMoment = useCallback((card: MomentCard | null) => {
    if (!card) return;
    navigate(`/moments/${card.id}`);
  }, [navigate]);

  const toggleDropdown = (name: string) => setActiveDropdown((cur) => cur === name ? null : name);

  const applyTrendingGameFilter = useCallback((game: string) => {
    setActiveTab("DISCOVER");
    setActiveCategory("TRENDING");
    setSelectedGame(game);
    setActiveDropdown(null);
    feedScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const emptyState = useMemo(() => {
    if (activeTab === "MY MOMENTS" && !isAuthenticated) return { title: "Connect your wallet to view your moments", action: "Your personal clips will appear here once you sign in." };
    if (discoverQuery.isError) return { title: "Could not load moments right now", action: "Please try again in a moment." };
    if (activeTab === "BOOKMARKS") return { title: "No bookmarked moments yet", action: "Save a few clips and they will show up here." };
    if (activeTab === "RECENTLY WATCHED") return { title: "No recently watched moments yet", action: "Open a few clips and they will appear here." };
    if (activeTab === "MY MOMENTS") return { title: "No moments found for your wallet yet", action: "Record and register a moment to see it here." };
    return { title: "No moments found matching filters", action: "Try adjusting your filters or search terms." };
  }, [activeTab, discoverQuery.isError, isAuthenticated]);

  return (
    <div className={isBrowseAll ? "min-h-full text-white" : "moments-page-root text-white"} style={{ backgroundColor: "#03070d" }}>
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_78%_12%,rgba(139,37,255,0.15),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(33,144,255,0.1),transparent_32%)]" />

      <section className={isBrowseAll ? "w-full px-3 py-4 sm:px-6 sm:py-5 lg:px-8" : "moments-page-shell py-4 sm:py-5"}>
        {isBrowseAll ? (
          <Link
            to="/moments"
            className="mb-4 inline-flex items-center gap-2 font-tech text-[10px] font-bold uppercase tracking-wider text-white/55 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Moments
          </Link>
        ) : null}

        <div className={isBrowseAll ? "relative z-40 space-y-4" : "moments-sticky-header relative z-40 shrink-0 space-y-4 px-3 sm:px-6 lg:px-8"}>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-tech text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
                  Moments
                </h1>
                <p className="mt-1.5 max-w-xl text-sm text-white/55">
                  Every game win, agent battle, and league call — captured as a moment. Share the best to X, drive plays, earn KP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCreateOpenChange(true)}
                data-tour="moments-create"
                className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#9a35ff] px-4 font-tech text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(154,53,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#8525eb] hover:shadow-[0_0_24px_rgba(154,53,255,0.55)] sm:w-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Moment</span>
              </button>
            </div>

            <div className="-mx-1 flex items-center gap-4 overflow-x-auto border-b border-white/8 px-1 font-tech text-xs font-bold tracking-wide scrollbar-none select-none sm:gap-6" data-tour="moments-tabs">
              {(["DISCOVER", "MY MOMENTS", "BOOKMARKS", "RECENTLY WATCHED"] as MainTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative shrink-0 cursor-pointer pb-2.5 uppercase tracking-[0.12em] transition-all hover:text-white ${activeTab === tab ? "text-[#bdeeff] [text-shadow:0_0_16px_rgba(82,203,255,0.95)]" : "text-[#a3e2ff] [text-shadow:0_0_10px_rgba(82,203,255,0.55)]"}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#9a35ff] to-[#c98bff] shadow-[0_0_8px_rgba(154,53,255,0.6)]" />}
                </button>
              ))}
            </div>

            <div className="relative z-40 flex min-w-0 flex-col gap-2 sm:gap-3 xl:flex-row xl:items-center" data-tour="moments-filters">
              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
                <FilterDropdown options={["ALL GAMES", ...KNOWN_MOMENT_GAME_LABELS]} value={selectedGame} onSelect={setSelectedGame} activeDropdown={activeDropdown} name="game" onToggle={toggleDropdown} />
                <FilterDropdown options={["ALL MODES", "AI ARENA", "TRASH TALK", "LEAGUE"]} value={selectedMode} onSelect={setSelectedMode} activeDropdown={activeDropdown} name="mode" onToggle={toggleDropdown} />
                <FilterDropdown options={["BEST OF", "MOST VIEWS", "MOST LIKES", "TOP CREATORS"]} value={selectedBestOf} onSelect={setSelectedBestOf} activeDropdown={activeDropdown} name="bestOf" onToggle={toggleDropdown} />
                <FilterDropdown options={["ANY TIME", "LAST 24 HOURS", "THIS WEEK", "THIS MONTH"]} value={selectedTime} onSelect={setSelectedTime} activeDropdown={activeDropdown} name="time" onToggle={toggleDropdown} />
              </div>
              <div className="flex w-full min-w-0 items-center gap-2 xl:max-w-[26rem] xl:flex-1">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/55" />
                  <input
                    type="text"
                    placeholder="Search moments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-[34px] w-full min-w-0 rounded border border-white/8 bg-[#0a0f1b]/60 py-1.5 pl-9 pr-3 text-xs text-white placeholder-white/55 transition focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded border border-white/8 bg-[#0a0f1b]/60 p-2 text-white/60 transition hover:border-white/15 hover:text-white"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Subcategory filters — hidden for now
            <div className="relative z-10 grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-3 2xl:grid-cols-6">
              {[
                { label: "TRENDING", Icon: Flame, desc: "Most popular" },
                { label: "EPIC PLAYS", Icon: Zap, desc: "Insane plays" },
                { label: "TOP PLAYS", Icon: Trophy, desc: "Community voted" },
                { label: "CLUTCH", Icon: Swords, desc: "1vX & Comebacks" },
                { label: "KILLS", Icon: Target, desc: "Multi kills" },
                { label: "VICTORIES", Icon: Shield, desc: "Epic wins" },
              ].map(({ label, Icon, desc }) => {
                const isActive = activeCategory === label;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveCategory(label as SubCategory)}
                    className={`arena-panel flex min-w-0 cursor-pointer flex-col items-start border-white/8 bg-[#04080f]/90 p-2 text-left transition sm:p-2.5 ${
                      isActive ? "border-purple-500/40 bg-gradient-to-br from-purple-950/40 to-purple-900/10 shadow-[0_0_12px_rgba(154,53,255,0.1)]" : "hover:border-white/15 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-1">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#b95cff]" : "text-white/45"}`} />
                      <span className="truncate font-tech text-[9px] font-bold leading-tight tracking-wide sm:text-[10px]">{label}</span>
                    </div>
                    <span className="mt-1 line-clamp-2 text-[7px] font-semibold uppercase leading-snug text-white/45 sm:text-[8px]">{desc}</span>
                  </button>
                );
              })}
            </div>
            */}

        </div>

        <div className={isBrowseAll ? "space-y-4" : "moments-page-scroll"}>
          <div className={isBrowseAll ? "" : "moments-page-inner px-3 sm:px-6 lg:px-8"}>
          <div className={isBrowseAll ? "space-y-4" : "moments-page-grid grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]"}>
            <div className={isBrowseAll ? "space-y-4" : "moments-main-column min-w-0 space-y-4"}>

            <div className="flex items-center justify-between gap-3 pt-1">
              <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">MOMENTS</h2>
              {showViewMore ? (
                <Link
                  to={browseHref}
                  className="inline-flex shrink-0 items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-[#d6acff] transition hover:text-white"
                >
                  View More
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>

            <div className="space-y-4">

            {(discoverQuery.isLoading
              || (activeTab === "MY MOMENTS" && myMomentsQuery.isLoading)
              || (activeTab === "BOOKMARKS" && bookmarksQuery.isLoading)
              || (activeTab === "RECENTLY WATCHED" && recentlyWatchedQuery.isLoading)
            ) ? (
              <div className={`grid items-stretch gap-4 sm:grid-cols-2 ${isBrowseAll ? "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`} data-tour="moments-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MomentFeedCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredMoments.length === 0 ? (
              <div className="arena-panel border-white/8 bg-[#04080f]/80 p-12 text-center">
                <Video className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 text-sm font-semibold text-white/60">{emptyState.title}</p>
                <p className="mt-2 text-xs text-white/40">{emptyState.action}</p>
                <button
                  onClick={() => { setSelectedGame("ALL GAMES"); setSelectedMode("ALL MODES"); setSelectedBestOf("BEST OF"); setSelectedTime("ANY TIME"); setSearchQuery(""); }}
                  className="mt-4 rounded border border-purple-500/25 px-4 py-2 font-tech text-[10px] font-bold uppercase text-purple-400 transition hover:bg-purple-500/10"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
              <div className={`grid items-stretch gap-4 sm:grid-cols-2 ${isBrowseAll ? "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`}>
                {displayMoments.slice(0, isBrowseAll ? undefined : 6).map((item) => (
                  <MomentFeedCard key={item.id} item={item} onOpen={openMoment} onBookmarkToggle={handleBookmarkToggle} />
                ))}
              </div>

              {!isBrowseAll && displayMoments.length > 6 ? (
                <div className="grid gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                  {displayMoments.slice(6).map((item) => (
                    <MomentFeedCard key={item.id} item={item} onOpen={openMoment} onBookmarkToggle={handleBookmarkToggle} />
                  ))}
                </div>
              ) : null}
              </>
            )}

            {isBrowseAll && activeTab === "DISCOVER" ? (
              <div className="relative z-10 flex flex-col items-center gap-3 pt-4">
                <div ref={canLoadMore ? sentinelRefCallback : null} aria-hidden className="h-px w-full" />
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400/90">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /><span>LOADING MORE MOMENTS</span>
                  </div>
                ) : !canLoadMore && filteredMoments.length > 0 ? (
                  <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white/40">NO MORE MOMENTS</span>
                ) : null}
              </div>
            ) : null}
            </div>
          </div>

          {!isBrowseAll ? (
          <aside className="moments-sidebar-column space-y-3 rounded-xl border border-purple-500/15 bg-[radial-gradient(circle_at_50%_0%,rgba(154,53,255,0.09),transparent_34%)] p-2 shadow-[0_0_30px_rgba(154,53,255,0.06)]">

            {/* <section className="arena-panel relative overflow-hidden border-white/8 bg-[#04080f]/95 p-3 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-md border border-purple-400/20 bg-purple-500/10 text-purple-300">
                <Zap className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h3 className="mt-3 font-tech text-[13px] font-semibold uppercase tracking-wider text-white/90">Earn KP for sharing</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                Share any moment to X. When real people click through and play, you earn <span className="font-semibold text-[#d6acff]">5 KP per verified play.</span>
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("MY MOMENTS")}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded bg-[#9a35ff] px-3 font-tech text-[9px] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(154,53,255,0.3)] transition hover:bg-[#8525eb] hover:shadow-[0_0_20px_rgba(154,53,255,0.5)]"
              >
                View Attention Rewards <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
              </button>
            </section> */}

            {/* Trending games */}
            <div className="arena-panel relative space-y-3 overflow-hidden border-white/8 bg-[#04080f]/95 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 font-tech text-xs font-semibold uppercase tracking-wider text-white/86">
                  <TrendingUp className="h-3.5 w-3.5 text-[#c98bff]" />
                  TRENDING GAMES
                </h3>
              </div>
              <div className="space-y-3">
                {discoverQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse space-y-1.5 py-0.5">
                        <div className="h-3 w-2/3 rounded bg-white/10" />
                        <div className="h-1 w-full rounded-full bg-white/5" />
                      </div>
                    ))}
                  </div>
                ) : trendingGames.length === 0 ? (
                  <div className="rounded border border-white/8 bg-white/[0.02] px-3 py-4 text-center text-[11px] text-white/45">
                    Trending games appear once moments start rolling in.
                  </div>
                ) : (
                  trendingGames.map((entry, index) => (
                    <button
                      key={entry.game}
                      type="button"
                      onClick={() => applyTrendingGameFilter(entry.game)}
                      className={`group flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition hover:bg-white/5 ${
                        selectedGame === entry.game ? "bg-white/[0.06] ring-1 ring-purple-500/35" : ""
                      }`}
                    >
                      <span className="w-3 shrink-0 text-center font-tech text-[10px] font-black text-white/45">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-white/90 transition group-hover:text-purple-300">{entry.game}</span>
                          <span className="shrink-0 font-tech text-[10px] text-white">
                            {entry.count} {entry.count === 1 ? "Moment" : "Moments"}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#9a35ff] to-[#52cbff] transition-all"
                            style={{ width: `${entry.pct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Top creators */}
            <div className="arena-panel relative space-y-3 overflow-hidden border-white/8 bg-[#04080f]/95 p-4">
              <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">TOP CREATORS</h3>
              <div className="space-y-2 text-xs font-semibold">
                {topCreatorsQuery.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex animate-pulse items-center gap-3 py-0.5">
                        <div className="h-3 w-3 rounded bg-white/10" />
                        <div className="h-7 w-7 rounded-full bg-white/10" />
                        <div className="h-3 flex-1 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : (topCreatorsQuery.data ?? []).length === 0 ? (
                  <div className="rounded border border-white/8 bg-white/[0.02] px-3 py-4 text-center text-white/45">
                    Creator stats appear as soon as moments are registered.
                  </div>
                ) : (topCreatorsQuery.data ?? []).map((creator, index) => (
                  <div key={creator.walletAddress} className="flex items-center justify-between py-0.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <CreatorRankBadge rank={index + 1} />
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                        <img src={seededAvatar(creator.walletAddress)} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex min-w-0 items-center gap-1 text-white/90">
                        <span className="truncate">{shortWallet(creator.walletAddress)}</span>
                        <Hexagon className="h-3 w-3 shrink-0 fill-[#9a35ff] text-[#9a35ff]" />
                      </div>
                    </div>
                    <span className="ml-3 shrink-0 font-tech text-[10px] text-white/55">
                      {creator.momentCount} {creator.momentCount === 1 ? "moment" : "moments"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          ) : null}
          </div>
          </div>
        </div>
      </section>

      <CreateMomentDialog
        open={isCreateOpen}
        onOpenChange={handleCreateOpenChange}
        battleId={battleIdParam}
        myAgentId={myAgentIdParam}
        arenaGameId={arenaGameIdParam}
        onCreated={() => void queryClient.invalidateQueries({ queryKey: [MOMENTS_QUERY_KEY_ROOT] })}
      />
    </div>
  );
}

export default AllMomentsPage;
