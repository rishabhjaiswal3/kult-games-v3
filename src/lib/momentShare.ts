import type { Moment } from "@/types/api";

const APP_ORIGIN =
  typeof window !== "undefined" ? window.location.origin.replace(/\/+$/, "") : "";

function resolveShareBaseUrl(): string {
  const explicit = (import.meta.env.VITE_SHARE_BASE_URL as string | undefined)?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;

  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "");
  if (apiUrl) return apiUrl.replace(/\/api$/i, "");

  return "";
}

const SHARE_BASE = resolveShareBaseUrl();

export type SharePayload = {
  /** SPA moment page — shown to humans in post copy. */
  url: string;
  /** Backend preview page — crawled by social platforms for og:image. */
  previewUrl: string;
  title: string;
  teaser: string;
  hashtags: string[];
  /** Public CDN asset URL for Pinterest `media` param (not 0G gateway). */
  mediaUrl?: string;
  relatedGames: string[];
};

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeHashtag(value: string) {
  return value
    .trim()
    .replace(/^#/, "")
    .replace(/[^a-zA-Z0-9_]+/g, "")
    .slice(0, 24);
}

/** Public object-storage URL — reliably crawlable; prefer over 0G gateway for share cards. */
export function resolveShareMediaUrl(moment: Moment): string | undefined {
  const meta = moment.assetMetadata as Record<string, unknown> | undefined;
  const thumbnailUrl = typeof meta?.thumbnailUrl === "string" ? meta.thumbnailUrl.trim() : "";
  if (thumbnailUrl) return thumbnailUrl;

  const assetUrl = moment.assetUrl?.trim();
  if (assetUrl) return assetUrl;

  return moment.assetZgUrl?.trim() || undefined;
}

export function buildMomentShareUrl(momentId: string): string {
  return `${APP_ORIGIN}/moments/${momentId}`;
}

export function buildMomentSharePreviewUrl(momentId: string): string {
  if (SHARE_BASE) {
    return `${SHARE_BASE}/share/moments/${momentId}`;
  }
  return buildMomentShareUrl(momentId);
}

export function buildMomentSharePayload(moment: Moment): SharePayload {
  const title = moment.title.trim() || "Check out this Kult moment";
  const description = moment.description?.trim() || moment.aiCaption?.trim() || "";
  const teaser = description ? truncateText(description, 120) : "";
  const url = buildMomentShareUrl(moment.momentId);
  const previewUrl = buildMomentSharePreviewUrl(moment.momentId);
  const hashtags = (moment.tags ?? [])
    .map(normalizeHashtag)
    .filter(Boolean)
    .slice(0, 5);
  const game = moment.relatedGames?.[0] ?? "Kult";

  return {
    url,
    previewUrl,
    title,
    teaser,
    hashtags: ["KultGames", "KultMoments", game.replace(/[\s-]+/g, ""), ...hashtags].filter(Boolean),
    mediaUrl: resolveShareMediaUrl(moment),
    relatedGames: moment.relatedGames ?? [],
  };
}
