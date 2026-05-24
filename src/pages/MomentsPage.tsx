import { useDeferredValue, useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { momentsApi } from "@/api/momentsApi";
import type { Moment as ApiMoment } from "@/types/api";
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Clock,
  Eye,
  Flame,
  Heart,
  Hexagon,
  Play,
  Search,
  Share2,
  Shield,
  SlidersHorizontal,
  Bookmark,
  Swords,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Video,
  Zap,
} from "lucide-react";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import agentNexus from "@/assets/agent-nexus.jpg";
import agentShadow from "@/assets/agent-shadow.jpg";
import agentAegis from "@/assets/agent-aegis.jpg";
import agentVoid from "@/assets/agent-voidwalker.jpg";
import agentRage from "@/assets/agent-rageborn.jpg";
import agentLumen from "@/assets/agent-lumen.jpg";
import momentWarzone from "@/assets/moment-warzone.png";
import momentRobowars from "@/assets/moment-robowars.png";
import momentFeatured from "@/assets/moment-featured.png";

type MainTab = "DISCOVER" | "MY MOMENTS" | "BOOKMARKS" | "RECENTLY WATCHED";
type SubCategory = "TRENDING" | "EPIC PLAYS" | "TOP PLAYS" | "CLUTCH" | "KILLS" | "VICTORIES";
type ClanIconType = "solana" | "base" | "zerog" | "kult" | "rebel" | "shadow" | "mecha";

type DisplayMoment = {
  id: string;
  title: string;
  game: string;
  mode: string;
  duration: string;
  durationSeconds: number | null;
  creator: string;
  creatorAvatar: string;
  clanName: string;
  clanIconType: ClanIconType;
  views: string;
  likes: string;
  isBookmarked: boolean;
  category: SubCategory;
  thumbnail: string;
  assetUrl?: string;
  createdAt?: string;
  likeCount: number;
  viewCount: number | null;
  source: ApiMoment;
};

type CreatorSummary = {
  rank: number;
  name: string;
  avatar: string;
  metric: number;
  metricLabel: string;
};

const PAGE_SIZE = 12;
const BOOKMARKED_MOMENTS_KEY = "kult_moments_bookmarked";
const RECENT_MOMENTS_KEY = "kult_moments_recent";
const CATEGORY_PILLS: Array<{ label: SubCategory; icon: typeof Flame; desc: string }> = [
  { label: "TRENDING", icon: Flame, desc: "Most popular" },
  { label: "EPIC PLAYS", icon: Zap, desc: "Insane plays" },
  { label: "TOP PLAYS", icon: Trophy, desc: "Community voted" },
  { label: "CLUTCH", icon: Swords, desc: "1vX & Comebacks" },
  { label: "KILLS", icon: Target, desc: "Multi kills" },
  { label: "VICTORIES", icon: Shield, desc: "Epic wins" },
];
const CLAN_FALLBACKS: Array<{ name: string; type: ClanIconType; avatar: string }> = [
  { name: "ZeroG Clan", type: "zerog", avatar: agentNexus },
  { name: "Base Clan", type: "base", avatar: agentAegis },
  { name: "Solana Clan", type: "solana", avatar: agentShadow },
  { name: "Kult Unit", type: "kult", avatar: agentLumen },
  { name: "Rebel Unit", type: "rebel", avatar: agentRage },
  { name: "Shadow Legion", type: "shadow", avatar: agentVoid },
  { name: "Mecha Force", type: "mecha", avatar: agentLumen },
];

function SolanaIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M64.6 237.9c-2.4-2.4-5.7-3.8-9.1-3.8H3.8c-3.1 0-4.6 3.8-2.4 6l63 63c2.4 2.4 5.7 3.8 9.1 3.8h51.7c3.1 0 4.6-3.8 2.4-6l-63-63z" fill="currentColor" />
      <path d="M332.4 73.1c2.4 2.4 5.7 3.8 9.1 3.8h51.7c3.1 0 4.6-3.8 2.4-6l-63-63c-2.4-2.4-5.7-3.8-9.1-3.8H331.8c-3.1 0-4.6 3.8-2.4 6l63 63z" fill="currentColor" />
      <path d="M271.6 155.5c2.4 2.4 5.7 3.8 9.1 3.8h51.7c3.1 0 4.6-3.8 2.4-6l-63-63c-2.4-2.4-5.7-3.8-9.1-3.8H210.8c-3.1 0-4.6 3.8-2.4 6l63 63z" fill="currentColor" />
    </svg>
  );
}

function BaseIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ZeroGClanIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={zeroGLogo} alt="0G Logo" className={`${className} object-contain`} />;
}

function KultClanIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={kultLogo} alt="Kult Logo" className={`${className} object-contain`} />;
}

function ClanIcon({ type, className = "h-3.5 w-3.5" }: { type: ClanIconType; className?: string }) {
  if (type === "solana") return <SolanaIcon className={`${className} text-teal-400`} />;
  if (type === "base") return <BaseIcon className={`${className} text-blue-500`} />;
  if (type === "zerog") return <ZeroGClanIcon className={className} />;
  if (type === "kult") return <KultClanIcon className={className} />;
  if (type === "rebel") {
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[9px] font-bold text-amber-400">
        R
      </span>
    );
  }
  if (type === "shadow") {
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[9px] font-bold text-red-500">
        S
      </span>
    );
  }
  return (
    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-gray-500/20 text-[9px] font-bold text-gray-400">
      M
    </span>
  );
}

function hashSeed(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function readStoredIds(key: string) {
  if (typeof localStorage === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key: string, values: string[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* ignore storage failures */
  }
}

function shortenWallet(wallet: string) {
  if (!wallet) return "Unknown";
  return wallet.length <= 12 ? wallet : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function compactNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function normalizeForMatch(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function momentMeta(moment: ApiMoment) {
  return (moment.assetMetadata ?? {}) as Record<string, unknown>;
}

function metaString(meta: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function metaNumber(meta: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function parseDurationSeconds(value: string) {
  const parts = value.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function formatDuration(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds)) return "--:--";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function dedupeMoments(moments: ApiMoment[]) {
  const seen = new Set<string>();
  const deduped: ApiMoment[] = [];
  for (const moment of moments) {
    if (!moment.momentId || seen.has(moment.momentId)) continue;
    seen.add(moment.momentId);
    deduped.push(moment);
  }
  return deduped;
}

function dedupeDisplayMoments(moments: DisplayMoment[]) {
  const seen = new Set<string>();
  const deduped: DisplayMoment[] = [];
  for (const moment of moments) {
    if (!moment.id || seen.has(moment.id)) continue;
    seen.add(moment.id);
    deduped.push(moment);
  }
  return deduped;
}

function detectCreator(moment: ApiMoment) {
  const meta = momentMeta(moment);
  return (
    metaString(meta, ["creatorName", "playerName", "authorName", "uploaderName", "walletAlias", "username"]) ??
    shortenWallet(moment.playerWalletAddress)
  );
}

function detectGame(moment: ApiMoment) {
  const meta = momentMeta(moment);
  const game =
    moment.relatedGames[0] ??
    metaString(meta, ["game", "gameName", "titleGame", "gameTitle"]) ??
    "KULT ARENA";
  return game.toUpperCase();
}

function detectMode(moment: ApiMoment) {
  const meta = momentMeta(moment);
  return (
    metaString(meta, ["mode", "gameMode", "matchMode", "queueMode"]) ??
    moment.tags.find((tag) => /1v1|5v5|autonomous/i.test(tag)) ??
    "ALL MODES"
  ).toUpperCase();
}

function detectCategory(moment: ApiMoment): SubCategory {
  const haystack = [
    moment.aiMomentType,
    ...moment.tags,
    moment.title,
    moment.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("clutch") || haystack.includes("comeback")) return "CLUTCH";
  if (haystack.includes("kill") || haystack.includes("elimination") || haystack.includes("frag")) return "KILLS";
  if (haystack.includes("victory") || haystack.includes("winner") || haystack.includes("domination") || haystack.includes("win")) {
    return "VICTORIES";
  }
  if (haystack.includes("strategy") || haystack.includes("top play") || haystack.includes("tactic")) return "TOP PLAYS";
  if (haystack.includes("epic") || haystack.includes("highlight") || haystack.includes("speedrun") || haystack.includes("duel")) {
    return "EPIC PLAYS";
  }
  return "TRENDING";
}

function detectDuration(moment: ApiMoment) {
  const meta = momentMeta(moment);
  const seconds =
    metaNumber(meta, ["durationSeconds", "durationSec", "lengthSeconds", "seconds", "clipLengthSeconds"]) ??
    (() => {
      const ms = metaNumber(meta, ["durationMs", "durationMilliseconds"]);
      return ms != null ? Math.round(ms / 1000) : null;
    })();

  if (seconds != null) {
    return { label: formatDuration(seconds), seconds };
  }

  const label = metaString(meta, ["duration", "durationLabel", "clipDuration"]);
  if (!label) return { label: "--:--", seconds: null };

  const parsed = parseDurationSeconds(label);
  return { label, seconds: parsed };
}

function detectViewCount(moment: ApiMoment) {
  const meta = momentMeta(moment);
  return metaNumber(meta, ["views", "viewCount", "numViews", "playCount", "plays"]);
}

function detectClan(moment: ApiMoment) {
  const meta = momentMeta(moment);
  const clan = metaString(meta, ["clan", "clanName", "faction", "team"])?.toLowerCase() ?? "";

  if (clan.includes("solana")) return { name: "Solana Clan", type: "solana" as ClanIconType, avatar: agentShadow };
  if (clan.includes("base")) return { name: "Base Clan", type: "base" as ClanIconType, avatar: agentAegis };
  if (clan.includes("zero") || clan.includes("0g") || clan.includes("zerog")) {
    return { name: "ZeroG Clan", type: "zerog" as ClanIconType, avatar: agentNexus };
  }
  if (clan.includes("rebel")) return { name: "Rebel Unit", type: "rebel" as ClanIconType, avatar: agentRage };
  if (clan.includes("shadow")) return { name: "Shadow Legion", type: "shadow" as ClanIconType, avatar: agentVoid };
  if (clan.includes("mecha")) return { name: "Mecha Force", type: "mecha" as ClanIconType, avatar: agentLumen };
  if (clan.includes("kult")) return { name: "Kult Unit", type: "kult" as ClanIconType, avatar: agentLumen };

  return CLAN_FALLBACKS[hashSeed(moment.playerWalletAddress || moment.title) % CLAN_FALLBACKS.length]!;
}

function detectThumbnail(moment: ApiMoment, game: string, category: SubCategory) {
  const meta = momentMeta(moment);
  const thumbnail = metaString(meta, ["thumbnailUrl", "thumbnail", "posterUrl", "poster", "previewImageUrl", "coverImageUrl"]);
  if (thumbnail) return thumbnail;

  const assetUrl = moment.assetUrl?.trim();
  const fileType = metaString(meta, ["fileType", "mimeType", "assetType"]) ?? "";
  if (assetUrl && (fileType.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(assetUrl))) {
    return assetUrl;
  }

  if (game.includes("ROBOWARS")) return momentRobowars;
  if (game.includes("WARZONE")) return momentWarzone;
  if (category === "TOP PLAYS" || category === "EPIC PLAYS") return momentRobowars;
  return momentWarzone;
}

function engagementScore(moment: DisplayMoment) {
  return (moment.viewCount ?? 0) + moment.likeCount * 8 + (moment.source.aiRankScore ?? 0) * 10 + (moment.source.numComments ?? 0) * 3;
}

function toDisplayMoment(moment: ApiMoment, bookmarkedIds: Set<string>): DisplayMoment {
  const category = detectCategory(moment);
  const game = detectGame(moment);
  const clan = detectClan(moment);
  const duration = detectDuration(moment);
  const viewCount = detectViewCount(moment);

  return {
    id: moment.momentId,
    title: moment.title || "Untitled Moment",
    game,
    mode: detectMode(moment),
    duration: duration.label,
    durationSeconds: duration.seconds,
    creator: detectCreator(moment),
    creatorAvatar: clan.avatar,
    clanName: clan.name,
    clanIconType: clan.type,
    views: compactNumber(viewCount),
    likes: compactNumber(moment.numLikes),
    isBookmarked: bookmarkedIds.has(moment.momentId),
    category,
    thumbnail: detectThumbnail(moment, game, category),
    assetUrl: moment.assetUrl,
    createdAt: moment.createdAt,
    likeCount: moment.numLikes,
    viewCount,
    source: moment,
  };
}

function matchesTimeframe(createdAt: string | undefined, selectedTime: string) {
  if (selectedTime === "ANY TIME") return true;
  if (!createdAt) return false;

  const createdMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdMs)) return false;

  const now = Date.now();
  const delta = now - createdMs;
  if (selectedTime === "LAST 24 HOURS") return delta <= 24 * 60 * 60 * 1000;
  if (selectedTime === "THIS WEEK") return delta <= 7 * 24 * 60 * 60 * 1000;
  if (selectedTime === "THIS MONTH") return delta <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

function sortMoments(moments: DisplayMoment[], selectedBestOf: string) {
  const sorted = [...moments];

  if (selectedBestOf === "MOST VIEWS") {
    sorted.sort((left, right) => (right.viewCount ?? -1) - (left.viewCount ?? -1) || right.likeCount - left.likeCount);
    return sorted;
  }

  if (selectedBestOf === "MOST LIKES") {
    sorted.sort((left, right) => right.likeCount - left.likeCount || engagementScore(right) - engagementScore(left));
    return sorted;
  }

  if (selectedBestOf === "TOP CREATORS") {
    sorted.sort((left, right) => right.likeCount + (right.viewCount ?? 0) - (left.likeCount + (left.viewCount ?? 0)));
    return sorted;
  }

  sorted.sort((left, right) => engagementScore(right) - engagementScore(left));
  return sorted;
}

function averageDurationLabel(moments: DisplayMoment[]) {
  const durations = moments.map((moment) => moment.durationSeconds).filter((value): value is number => value != null && value > 0);
  if (durations.length === 0) return "--:--";
  const total = durations.reduce((sum, value) => sum + value, 0);
  return formatDuration(Math.round(total / durations.length));
}

function recentMomentList(moments: DisplayMoment[], recentIds: string[]) {
  const byId = new Map(moments.map((moment) => [moment.id, moment]));
  return recentIds.map((id) => byId.get(id)).filter((value): value is DisplayMoment => Boolean(value));
}

export function MomentsPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("DISCOVER");
  const [activeCategory, setActiveCategory] = useState<SubCategory>("TRENDING");
  const [selectedGame, setSelectedGame] = useState("ALL GAMES");
  const [selectedMode, setSelectedMode] = useState("ALL MODES");
  const [selectedBestOf, setSelectedBestOf] = useState("BEST OF");
  const [selectedTime, setSelectedTime] = useState("ANY TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [bookmarkedMomentIds, setBookmarkedMomentIds] = useState<string[]>(() => readStoredIds(BOOKMARKED_MOMENTS_KEY));
  const [recentMomentIds, setRecentMomentIds] = useState<string[]>(() => readStoredIds(RECENT_MOMENTS_KEY));
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  useEffect(() => {
    writeStoredIds(BOOKMARKED_MOMENTS_KEY, bookmarkedMomentIds);
  }, [bookmarkedMomentIds]);

  useEffect(() => {
    writeStoredIds(RECENT_MOMENTS_KEY, recentMomentIds);
  }, [recentMomentIds]);

  const discoverQ = useInfiniteQuery({
    queryKey: ["moments", "discover"],
    queryFn: ({ pageParam }) => momentsApi.list({ page: pageParam, perPage: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    staleTime: 30_000,
    retry: 1,
  });

  const mineQ = useInfiniteQuery({
    queryKey: ["moments", "mine"],
    queryFn: ({ pageParam }) => momentsApi.getMine(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: 1,
  });

  const bookmarkedIds = new Set(bookmarkedMomentIds);
  const discoverMoments = dedupeMoments((discoverQ.data?.pages ?? []).flatMap((page) => page.moments)).map((moment) =>
    toDisplayMoment(moment, bookmarkedIds)
  );
  const myMoments = dedupeMoments((mineQ.data?.pages ?? []).flatMap((page) => page.moments)).map((moment) =>
    toDisplayMoment(moment, bookmarkedIds)
  );
  const allKnownMoments = dedupeDisplayMoments([...discoverMoments, ...myMoments]);

  const activeFeed = (() => {
    if (activeTab === "MY MOMENTS") return myMoments;
    if (activeTab === "BOOKMARKS") return allKnownMoments.filter((moment) => moment.isBookmarked);
    if (activeTab === "RECENTLY WATCHED") return recentMomentList(allKnownMoments, recentMomentIds);
    return discoverMoments;
  })();

  const filteredMoments = sortMoments(
    activeFeed.filter((moment) => {
      if (activeCategory !== "TRENDING" && moment.category !== activeCategory) return false;
      if (deferredSearchQuery) {
        const haystack = `${moment.title} ${moment.creator} ${moment.game}`.toLowerCase();
        if (!haystack.includes(deferredSearchQuery)) return false;
      }
      if (selectedGame !== "ALL GAMES") {
        const requested = normalizeForMatch(selectedGame);
        const current = normalizeForMatch(moment.game);
        if (!current.includes(requested) && !requested.includes(current)) return false;
      }
      if (selectedMode !== "ALL MODES" && normalizeForMatch(moment.mode) !== normalizeForMatch(selectedMode)) return false;
      if (!matchesTimeframe(moment.createdAt, selectedTime)) return false;
      return true;
    }),
    selectedBestOf
  );

  const featuredMoment = [...discoverMoments].sort((left, right) => engagementScore(right) - engagementScore(left))[0] ?? null;
  const activeQuery = activeTab === "MY MOMENTS" ? mineQ : discoverQ;
  const totalMoments = discoverQ.data?.pages[0]?.total ?? discoverMoments.length;
  const momentsThisWeek = discoverMoments.filter((moment) => matchesTimeframe(moment.createdAt, "THIS WEEK")).length;
  const previousWeek = discoverMoments.filter((moment) => {
    if (!moment.createdAt) return false;
    const createdMs = new Date(moment.createdAt).getTime();
    if (!Number.isFinite(createdMs)) return false;
    const age = Date.now() - createdMs;
    return age > 7 * 24 * 60 * 60 * 1000 && age <= 14 * 24 * 60 * 60 * 1000;
  }).length;
  const weeklyDelta = previousWeek > 0 ? Math.round(((momentsThisWeek - previousWeek) / previousWeek) * 100) : null;
  const totalViews = discoverMoments.reduce((sum, moment) => sum + (moment.viewCount ?? 0), 0);
  const hasViews = discoverMoments.some((moment) => moment.viewCount != null);
  const totalLikes = discoverMoments.reduce((sum, moment) => sum + moment.likeCount, 0);
  const topCreators = (() => {
    const byCreator = new Map<string, CreatorSummary & { likeTotal: number; viewTotal: number }>();
    for (const moment of discoverMoments) {
      const current = byCreator.get(moment.creator);
      if (current) {
        current.likeTotal += moment.likeCount;
        current.viewTotal += moment.viewCount ?? 0;
        current.metric = current.viewTotal > 0 ? current.viewTotal : current.likeTotal;
        current.metricLabel = compactNumber(current.metric);
      } else {
        byCreator.set(moment.creator, {
          rank: 0,
          name: moment.creator,
          avatar: moment.creatorAvatar,
          likeTotal: moment.likeCount,
          viewTotal: moment.viewCount ?? 0,
          metric: moment.viewCount ?? moment.likeCount,
          metricLabel: compactNumber(moment.viewCount ?? moment.likeCount),
        });
      }
    }

    return [...byCreator.values()]
      .sort((left, right) => right.metric - left.metric)
      .slice(0, 5)
      .map((creator, index) => ({
        rank: index + 1,
        name: creator.name,
        avatar: creator.avatar,
        metric: creator.metric,
        metricLabel: creator.metricLabel,
      }));
  })();

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleDropdownSelect = (dropdown: string, value: string) => {
    if (dropdown === "game") setSelectedGame(value);
    if (dropdown === "mode") setSelectedMode(value);
    if (dropdown === "bestOf") setSelectedBestOf(value);
    if (dropdown === "time") setSelectedTime(value);
    setActiveDropdown(null);
  };

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedMomentIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [id, ...current]
    );
  };

  const markRecentlyViewed = (id: string) => {
    setRecentMomentIds((current) => [id, ...current.filter((value) => value !== id)].slice(0, 30));
  };

  const openMoment = (moment: DisplayMoment) => {
    markRecentlyViewed(moment.id);
    if (moment.assetUrl) {
      window.open(moment.assetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const resetFilters = () => {
    setSelectedGame("ALL GAMES");
    setSelectedMode("ALL MODES");
    setSelectedBestOf("BEST OF");
    setSelectedTime("ANY TIME");
    setSearchQuery("");
    setActiveCategory("TRENDING");
  };

  const emptyMessage = (() => {
    if (activeTab === "MY MOMENTS" && !isAuthenticated) {
      return "Connect your wallet to load your moments from the backend.";
    }
    if (activeTab === "BOOKMARKS") {
      return "Bookmark moments from the live feed to keep them here.";
    }
    if (activeTab === "RECENTLY WATCHED") {
      return "Open a few moments and your recent history will appear here.";
    }
    if (activeQuery.isError) {
      return "We could not load moments from the backend right now.";
    }
    if (activeQuery.isLoading) {
      return "Loading moments from the backend…";
    }
    return "No moments found matching filters";
  })();

  return (
    <div className="min-h-full bg-transparent text-foreground">
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_78%_12%,rgba(139,37,255,0.15),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(33,144,255,0.1),transparent_32%)]" />

      <section className="mx-auto max-w-[1284px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_376px]">
          <div className="min-w-0 space-y-4">
            <div>
              <h1 className="font-tech text-3xl font-bold tracking-tight text-white">MOMENTS</h1>
              <p className="mt-1 text-[11px] font-medium text-white/55">
                Epic plays, insane clutches, and legendary victories. Replay and share your best battles.
              </p>
            </div>

            <div className="flex items-center gap-6 border-b border-white/8 text-xs font-bold tracking-wide select-none">
              {(["DISCOVER", "MY MOMENTS", "BOOKMARKS", "RECENTLY WATCHED"] as MainTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative cursor-pointer pb-2.5 uppercase transition-all hover:text-white ${
                    activeTab === tab ? "text-white" : "text-white/45"
                  }`}
                >
                  <span>{tab}</span>
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a35ff]" />}
                </button>
              ))}
            </div>

            <div className="relative z-30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("game")}
                    className="flex h-[34px] cursor-pointer items-center justify-between gap-2.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-1.5 font-tech text-[10px] font-bold uppercase text-white/70 transition hover:border-white/15 hover:text-white"
                  >
                    <span>{selectedGame}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                  </button>
                  {activeDropdown === "game" && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("game")} />
                      <div className="absolute left-0 z-50 mt-1 w-48 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl">
                        {["ALL GAMES", "WARZONE WARRIORS", "ROBOWARS", "KULT ARENA"].map((game) => (
                          <button
                            key={game}
                            onClick={() => handleDropdownSelect("game", game)}
                            className={`w-full rounded px-2.5 py-1.5 text-left font-tech text-[10px] font-bold uppercase transition hover:bg-white/5 hover:text-white ${
                              selectedGame === game ? "bg-white/[0.02] text-purple-400" : "text-white/60"
                            }`}
                          >
                            {game}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("mode")}
                    className="flex h-[34px] cursor-pointer items-center justify-between gap-2.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-1.5 font-tech text-[10px] font-bold uppercase text-white/70 transition hover:border-white/15 hover:text-white"
                  >
                    <span>{selectedMode}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                  </button>
                  {activeDropdown === "mode" && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("mode")} />
                      <div className="absolute left-0 z-50 mt-1 w-44 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl">
                        {["ALL MODES", "1V1 ARENA", "5V5 SHOWDOWN", "AUTONOMOUS"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handleDropdownSelect("mode", mode)}
                            className={`w-full rounded px-2.5 py-1.5 text-left font-tech text-[10px] font-bold uppercase transition hover:bg-white/5 hover:text-white ${
                              selectedMode === mode ? "bg-white/[0.02] text-purple-400" : "text-white/60"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("bestOf")}
                    className="flex h-[34px] cursor-pointer items-center justify-between gap-2.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-1.5 font-tech text-[10px] font-bold uppercase text-white/70 transition hover:border-white/15 hover:text-white"
                  >
                    <span>{selectedBestOf}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                  </button>
                  {activeDropdown === "bestOf" && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("bestOf")} />
                      <div className="absolute left-0 z-50 mt-1 w-44 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl">
                        {["BEST OF", "MOST VIEWS", "MOST LIKES", "TOP CREATORS"].map((bestOf) => (
                          <button
                            key={bestOf}
                            onClick={() => handleDropdownSelect("bestOf", bestOf)}
                            className={`w-full rounded px-2.5 py-1.5 text-left font-tech text-[10px] font-bold uppercase transition hover:bg-white/5 hover:text-white ${
                              selectedBestOf === bestOf ? "bg-white/[0.02] text-purple-400" : "text-white/60"
                            }`}
                          >
                            {bestOf}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("time")}
                    className="flex h-[34px] cursor-pointer items-center justify-between gap-2.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-1.5 font-tech text-[10px] font-bold uppercase text-white/70 transition hover:border-white/15 hover:text-white"
                  >
                    <span>{selectedTime}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                  </button>
                  {activeDropdown === "time" && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => toggleDropdown("time")} />
                      <div className="absolute left-0 z-50 mt-1 w-44 rounded border border-white/10 bg-[#080d19] p-1 shadow-xl">
                        {["ANY TIME", "LAST 24 HOURS", "THIS WEEK", "THIS MONTH"].map((time) => (
                          <button
                            key={time}
                            onClick={() => handleDropdownSelect("time", time)}
                            className={`w-full rounded px-2.5 py-1.5 text-left font-tech text-[10px] font-bold uppercase transition hover:bg-white/5 hover:text-white ${
                              selectedTime === time ? "bg-white/[0.02] text-purple-400" : "text-white/60"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 max-sm:w-full">
                <div className="relative max-sm:flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search moments..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-[34px] w-[200px] rounded border border-white/8 bg-[#0a0f1b]/60 py-1.5 pl-9 pr-3 text-xs text-white/86 placeholder-white/30 transition focus:border-purple-500/50 focus:outline-none max-sm:w-full"
                  />
                </div>
                <button className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded border border-white/8 bg-[#0a0f1b]/60 p-2 text-white/60 transition hover:border-white/15 hover:text-white">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2 pt-1 sm:flex sm:flex-wrap">
              {CATEGORY_PILLS.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.label;
                return (
                  <button
                    key={category.label}
                    onClick={() => setActiveCategory(category.label)}
                    className={`arena-panel flex min-w-[100px] flex-1 cursor-pointer flex-col items-start border-white/8 bg-[#04080f]/90 p-3 text-left transition ${
                      isActive
                        ? "border-purple-500/40 bg-gradient-to-br from-purple-950/40 to-purple-900/10 shadow-[0_0_12px_rgba(154,53,255,0.1)]"
                        : "hover:border-white/15 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#b95cff]" : "text-white/45"}`} />
                      <span className="font-tech text-[10px] font-bold tracking-wider">{category.label}</span>
                    </div>
                    <span className="mt-1 text-[8px] font-semibold uppercase leading-none text-white/45">
                      {category.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3">
              <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">
                {activeCategory} MOMENTS
              </h2>
              <button onClick={resetFilters} className="font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 transition hover:text-purple-300">
                View All &rarr;
              </button>
            </div>

            {filteredMoments.length === 0 ? (
              <div className="arena-panel border-white/8 bg-[#04080f]/80 p-12 text-center">
                <Video className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 text-sm font-semibold text-white/60">{emptyMessage}</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded border border-purple-500/25 px-4 py-2 font-tech text-[10px] font-bold uppercase text-purple-400 transition hover:bg-purple-500/10"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMoments.map((item) => (
                  <div key={item.id} className="flex flex-col">
                    <div
                      className="group relative aspect-[16/9] cursor-pointer overflow-hidden rounded border border-white/8 bg-black/40"
                      onClick={() => openMoment(item)}
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-all duration-300 group-hover:via-black/30" />

                      <div
                        className={`absolute left-3 top-3 select-none rounded border px-2 py-0.5 font-tech text-[9px] font-black uppercase tracking-wide ${
                          item.game === "ROBOWARS"
                            ? "border-sky-500/35 bg-sky-950/80 text-sky-400"
                            : "border-purple-500/35 bg-purple-950/80 text-[#d6acff]"
                        }`}
                      >
                        {item.game}
                      </div>

                      <div className="absolute right-3 top-3 rounded border border-white/10 bg-[#03070d]/80 px-1.5 py-0.5 font-tech text-[9px] font-black tracking-wide text-white">
                        {item.duration}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-purple-400 group-hover:bg-[#9a35ff] group-hover:shadow-[0_0_15px_rgba(154,53,255,0.45)]">
                          <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-1 flex-col justify-between">
                      <div>
                        <button
                          type="button"
                          onClick={() => openMoment(item)}
                          className="truncate text-left text-sm font-semibold leading-snug text-white/90 transition hover:text-purple-400"
                        >
                          {item.title}
                        </button>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                            <span>by {item.creator}</span>
                            <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                            <ClanIcon type={item.clanIconType} className="h-3.5 w-3.5 shrink-0" />
                            <span className="max-w-[90px] truncate">{item.clanName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-white/6 pt-3 text-xs font-semibold text-white/45">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-white/30" />
                            <span>{item.views}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-white/30" />
                            <span>{item.likes}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handleBookmarkToggle(item.id)}
                          className="cursor-pointer text-white/30 transition hover:text-purple-400"
                        >
                          <Bookmark className={`h-4 w-4 ${item.isBookmarked ? "fill-purple-500 text-purple-500" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="relative z-10 flex justify-center pt-4">
              <button
                onClick={() => {
                  if (activeQuery.hasNextPage) {
                    void activeQuery.fetchNextPage();
                  }
                }}
                disabled={!activeQuery.hasNextPage || activeQuery.isFetchingNextPage}
                className="flex cursor-pointer items-center gap-2 rounded border border-white/8 bg-[#0a0f1b]/60 px-6 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400/90 transition hover:border-purple-500/30 hover:bg-purple-950/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrendingUp className={`h-3.5 w-3.5 ${activeQuery.isFetchingNextPage ? "animate-spin" : "animate-bounce"}`} />
                <span>
                  {activeQuery.isFetchingNextPage
                    ? "LOADING MORE"
                    : activeQuery.hasNextPage
                      ? "LOAD MORE MOMENTS"
                      : "ALL MOMENTS LOADED"}
                </span>
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="arena-panel relative space-y-4 overflow-hidden border-white/8 bg-[#04080f]/95 p-5">
              <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">FEATURED MOMENT</h3>

              <div
                className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded border border-white/8 bg-black/40"
                onClick={() => {
                  if (featuredMoment) openMoment(featuredMoment);
                }}
              >
                <img
                  src={featuredMoment?.thumbnail ?? momentFeatured}
                  alt={featuredMoment?.title ?? "Featured Moment"}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute left-3 top-3 select-none rounded border border-sky-500/35 bg-sky-950/80 px-2 py-0.5 font-tech text-[8px] font-black uppercase tracking-wide text-sky-400">
                  {featuredMoment?.game ?? "FEATURED"}
                </div>

                <div className="absolute right-3 top-3 rounded border border-white/10 bg-[#03070d]/80 px-1.5 py-0.5 font-tech text-[8px] font-black tracking-wide text-white">
                  {featuredMoment?.duration ?? "--:--"}
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-purple-400 group-hover:bg-[#9a35ff] group-hover:shadow-[0_0_15px_rgba(154,53,255,0.5)]">
                    <Play className="ml-0.5 h-5.5 w-5.5 fill-white text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (featuredMoment) openMoment(featuredMoment);
                    }}
                    className="text-left text-sm font-bold text-white transition hover:text-purple-400"
                  >
                    {featuredMoment?.title ?? "Loading featured moment…"}
                  </button>
                  <div className="flex items-center gap-1 text-[10px] text-white/50">
                    <span>by {featuredMoment?.creator ?? "Kult"}</span>
                    <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                  </div>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-white/55">
                  {featuredMoment?.source.description?.trim() ||
                    featuredMoment?.source.aiCaption?.trim() ||
                    "Moments from the backend automatically fill this spotlight card."}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/6 pt-3 text-[10px] font-semibold text-white/45">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-white/30" />
                  <span>{featuredMoment?.views ?? "--"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-white/30" />
                  <span>{featuredMoment?.likes ?? "--"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-white/30" />
                  <span>{compactNumber(featuredMoment?.source.numComments ?? null)}</span>
                </span>
              </div>

              <button
                onClick={() => {
                  if (featuredMoment) openMoment(featuredMoment);
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-[#9a35ff] py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8525eb] hover:shadow-[0_0_20px_rgba(154,53,255,0.5)] shadow-[0_0_15px_rgba(154,53,255,0.3)]"
              >
                <span>WATCH NOW</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="arena-panel relative space-y-4 overflow-hidden border-white/8 bg-[#04080f]/95 p-5">
              <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">MOMENTS STATS</h3>

              <div className="divide-y divide-white/6 text-[11px] font-medium">
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5 text-white/55">
                    <Video className="h-4 w-4 text-white/30" />
                    <span>Total Moments</span>
                  </div>
                  <span className="font-tech font-bold text-white">{compactNumber(totalMoments)}</span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5 text-white/55">
                    <Calendar className="h-4 w-4 text-white/30" />
                    <span>This Week</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-tech font-bold text-white">{compactNumber(momentsThisWeek)}</span>
                    <span className="ml-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-1 py-0.5 text-[8px] font-bold text-emerald-400 select-none">
                      {weeklyDelta == null ? "LIVE" : `${weeklyDelta >= 0 ? "+" : ""}${weeklyDelta}%`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5 text-white/55">
                    <Eye className="h-4 w-4 text-white/30" />
                    <span>Total Views</span>
                  </div>
                  <span className="font-tech font-bold text-white">{hasViews ? compactNumber(totalViews) : "--"}</span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5 text-white/55">
                    <ThumbsUp className="h-4 w-4 text-white/30" />
                    <span>Total Likes</span>
                  </div>
                  <span className="font-tech font-bold text-white">{compactNumber(totalLikes)}</span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5 text-white/55">
                    <Clock className="h-4 w-4 text-white/30" />
                    <span>Avg. Watch Time</span>
                  </div>
                  <span className="font-tech font-bold text-white">{averageDurationLabel(discoverMoments)}</span>
                </div>
              </div>
            </div>

            <div className="arena-panel relative space-y-4 overflow-hidden border-white/8 bg-[#04080f]/95 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">TOP CREATORS</h3>
                <button className="font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 transition hover:text-purple-300">
                  View All
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                {topCreators.length > 0 ? (
                  topCreators.map((creator) => (
                    <div key={creator.name} className="flex items-center justify-between py-0.5 transition hover:bg-white/[0.01]">
                      <div className="flex items-center gap-3">
                        <span className="w-3 text-center font-tech text-[10px] font-black text-white/45">{creator.rank}</span>
                        <div className="h-7 w-7 overflow-hidden rounded-full border border-white/10 bg-white/5">
                          <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1 text-white/90">
                          <span>{creator.name}</span>
                          <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-white/55">
                        <Eye className="h-3.5 w-3.5 text-white/30" />
                        <span>{creator.metricLabel}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-white/50">Top creators will populate once the feed loads.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default MomentsPage;
