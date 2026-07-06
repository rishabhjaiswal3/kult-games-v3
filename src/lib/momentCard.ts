import type { Moment } from "@/types/api";
import momentWarzone from "@/assets/moment-warzone.png";
import momentRobowars from "@/assets/moment-robowars.png";
import momentFeatured from "@/assets/moment-featured.png";

export type MomentSubCategory = "TRENDING" | "EPIC PLAYS" | "TOP PLAYS" | "CLUTCH" | "KILLS" | "VICTORIES";

export type MomentCard = {
  id: string;
  title: string;
  game: string;
  mode: string;
  duration: string;
  durationSeconds: number | null;
  creator: string;
  creatorAvatar: string;
  clanName: string;
  clanIconType: string;
  views: string;
  viewCount: number;
  likes: string;
  likeCount: number;
  isBookmarked: boolean;
  categories: Set<MomentSubCategory>;
  thumbnail: string;
  description: string;
  contentType: "image" | "video";
  mediaUrl: string | undefined;
  raw: Moment;
};

const CREATOR_AVATARS = [momentWarzone, momentRobowars, momentFeatured, momentWarzone, momentRobowars, momentFeatured];

function metadataRecord(moment: Moment): Record<string, unknown> | null {
  return moment.assetMetadata && typeof moment.assetMetadata === "object" ? moment.assetMetadata : null;
}

function metadataString(moment: Moment, keys: string[]): string | undefined {
  const metadata = metadataRecord(moment);
  if (!metadata) return undefined;
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function metadataNumber(moment: Moment, keys: string[]): number | undefined {
  const metadata = metadataRecord(moment);
  if (!metadata) return undefined;
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

export function shortWallet(value?: string) {
  if (!value) return "UNKNOWN";
  if (value.length <= 12) return value.toUpperCase();
  return `${value.slice(0, 6)}…${value.slice(-4)}`.toUpperCase();
}

export function seededAvatar(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_003;
  return CREATOR_AVATARS[Math.abs(hash) % CREATOR_AVATARS.length]!;
}

export function compactMetric(value: number | null | undefined) {
  if (!value || value <= 0) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 10_000 ? 0 : 1,
  })
    .format(value)
    .replace(/\s+/g, "")
    .toUpperCase();
}

function parseDurationValue(value: string | number | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  if (/^\d+$/.test(value.trim())) {
    const s = Number(value.trim());
    return Number.isFinite(s) && s > 0 ? s : null;
  }
  if (value.includes(":")) {
    const parts = value.split(":").map(Number);
    if (parts.some((p) => !Number.isFinite(p))) return null;
    return parts.reduce((t, p) => t * 60 + p, 0);
  }
  return null;
}

export function formatDuration(value: string | number | undefined) {
  if (typeof value === "string" && value.includes(":")) return value;
  const total = parseDurationValue(value);
  if (!total) return "—";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function matchKnownGameLabel(value: string) {
  const n = value.toLowerCase();
  if (n.includes("robo")) return "ROBOWARS";
  if (n.includes("highway")) return "HIGHWAY HUSTLE";
  if (n.includes("warzone")) return "WARZONE WARRIORS";
  return null;
}

export function deriveGame(moment: Moment) {
  const candidates = [
    metadataString(moment, ["game", "gameName", "gameTitle"]),
    ...moment.relatedGames,
    ...moment.tags,
    moment.aiMomentType,
    moment.title,
  ].filter((v): v is string => Boolean(v));

  for (const c of candidates) {
    const matched = matchKnownGameLabel(c);
    if (matched) return matched;
  }

  const fallback = moment.relatedGames[0]?.replace(/[_-]/g, " ").trim();
  return fallback ? fallback.toUpperCase() : "ARENA HIGHLIGHTS";
}

function deriveMode(moment: Moment) {
  const hay = [
    metadataString(moment, ["mode", "matchMode", "playlist"]),
    ...moment.tags,
    ...moment.relatedGames,
    moment.title,
    moment.description,
  ]
    .filter((v): v is string => Boolean(v))
    .join(" ")
    .toLowerCase();

  if (hay.includes("trash talk") || hay.includes("trashtalk")) return "TRASH TALK";
  if (hay.includes("robowars") || hay.includes("ai arena") || hay.includes("aiarena") || hay.includes("guesstheai") || hay.includes("guess the ai")) return "AI ARENA";
  if (hay.includes("league")) return "LEAGUE";
  if (hay.includes("autonomous")) return "AUTONOMOUS";
  if (hay.includes("5v5") || hay.includes("squad")) return "5V5 SHOWDOWN";
  if (hay.includes("1v1") || hay.includes("duel") || hay.includes("arena")) return "1V1 ARENA";
  return "ALL MODES";
}

function deriveClan(moment: Moment) {
  const hay = [
    metadataString(moment, ["clan", "chain", "network", "creatorClan"]),
    ...moment.tags,
    ...moment.relatedGames,
    moment.aiRarity,
  ]
    .filter((v): v is string => Boolean(v))
    .join(" ")
    .toLowerCase();

  if (hay.includes("solana")) return { clanName: "Solana", clanIconType: "solana" };
  if (hay.includes("base")) return { clanName: "Base", clanIconType: "base" };
  if (hay.includes("0g") || hay.includes("zerog")) return { clanName: "0G", clanIconType: "arena" };
  if (hay.includes("kult")) return { clanName: "Kult", clanIconType: "arena" };
  if (hay.includes("shadow")) return { clanName: "Shadow", clanIconType: "shadow" };
  if (hay.includes("rebel") || hay.includes("berserker")) return { clanName: "Rebel", clanIconType: "rebel" };
  return { clanName: "Arena", clanIconType: "mecha" };
}

function deriveCategories(moment: Moment): Set<MomentSubCategory> {
  const memberships = new Set<MomentSubCategory>(["TRENDING", "EPIC PLAYS"]);
  const hay = [moment.aiMomentType, moment.aiCaption, moment.title, moment.description, ...moment.tags, ...moment.aiHighlights]
    .filter((v): v is string => Boolean(v))
    .join(" ")
    .toLowerCase();

  if (/(kill|eliminat|frag|headshot|multi[- ]?kill)/.test(hay)) memberships.add("KILLS");
  if (/(clutch|1v|last stand|comeback|surviv)/.test(hay)) memberships.add("CLUTCH");
  if (/(victory|win|champion|dominance|capture|defeat)/.test(hay)) memberships.add("VICTORIES");

  const engagement = (moment.numLikes ?? 0) + (moment.numComments ?? 0);
  if ((moment.aiRankScore ?? 0) >= 85 || engagement >= 3 || /(top play|highlight|mvp|perfect)/.test(hay)) {
    memberships.add("TOP PLAYS");
  }
  return memberships;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|avi|mkv|ogv|m3u8)(?:\?.*)?$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp)(?:\?.*)?$/i;

function isVideoMediaUrl(url: string | undefined) {
  return Boolean(url && VIDEO_EXT.test(url));
}

function gamePlaceholderThumbnail(game: string) {
  if (game === "ROBOWARS") return momentRobowars;
  if (game === "HIGHWAY HUSTLE") return momentFeatured;
  return momentWarzone;
}

function deriveContentType(moment: Moment): "image" | "video" {
  const ft = metadataString(moment, ["fileType", "mimeType", "contentType", "type"]);
  if (ft) {
    const n = ft.toLowerCase();
    if (n.startsWith("video/")) return "video";
    if (n.startsWith("image/")) return "image";
  }
  const url = moment.assetZgUrl ?? moment.assetUrl ?? "";
  if (VIDEO_EXT.test(url)) return "video";
  if (IMAGE_EXT.test(url)) return "image";
  return "image";
}

function deriveThumbnail(moment: Moment, game: string) {
  const explicit = metadataString(moment, ["thumbnailUrl", "thumbnail", "posterUrl", "poster", "coverImage", "imageUrl", "previewImage"]);
  if (explicit && !isVideoMediaUrl(explicit)) return explicit;
  if (moment.assetZgUrl && !isVideoMediaUrl(moment.assetZgUrl)) return moment.assetZgUrl;
  if (moment.assetUrl && IMAGE_EXT.test(moment.assetUrl)) return moment.assetUrl;
  return gamePlaceholderThumbnail(game);
}

function deriveViewCount(moment: Moment) {
  return metadataNumber(moment, ["views", "viewCount", "view_count", "impressions", "playCount"]) ?? 0;
}

export function deriveCreator(moment: Moment) {
  return (metadataString(moment, ["creator", "creatorName", "playerName", "agentName"]) ?? shortWallet(moment.playerWalletAddress)).toUpperCase();
}

function deriveMomentDescription(moment: Moment) {
  return (
    moment.description?.trim() ??
    moment.aiCaption?.trim() ??
    (moment.aiHighlights.length > 0 ? moment.aiHighlights.join(" • ") : undefined) ??
    "Fresh arena footage pulled from the live Kult moments feed."
  );
}

export function deriveMomentCard(moment: Moment, bookmarkedIds: Set<string>): MomentCard {
  const game = deriveGame(moment);
  const creator = deriveCreator(moment);
  const clan = deriveClan(moment);
  const durationSource =
    metadataString(moment, ["duration", "clipDuration", "videoDuration"]) ??
    metadataNumber(moment, ["durationSeconds", "clipDurationSeconds", "lengthSeconds"]);
  const durationSeconds = parseDurationValue(durationSource);
  const viewCount = deriveViewCount(moment);

  return {
    id: moment.momentId,
    title: (moment.title || moment.aiCaption || "Untitled Moment").trim(),
    game,
    mode: deriveMode(moment),
    duration: formatDuration(durationSource),
    durationSeconds,
    creator,
    creatorAvatar: seededAvatar(moment.momentId || creator),
    clanName: clan.clanName,
    clanIconType: clan.clanIconType,
    views: compactMetric(viewCount),
    viewCount,
    likes: compactMetric(moment.numLikes),
    likeCount: moment.numLikes,
    isBookmarked: bookmarkedIds.has(moment.momentId),
    categories: deriveCategories(moment),
    thumbnail: deriveThumbnail(moment, game),
    description: deriveMomentDescription(moment),
    contentType: deriveContentType(moment),
    mediaUrl: moment.assetZgUrl ?? moment.assetUrl,
    raw: moment,
  };
}
