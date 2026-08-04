import type { Moment } from "@/types/api";
import {
  buildMomentShareImageProxyUrl,
  resolveMomentShareImageUrl,
} from "@/lib/momentShareImage";

const APP_ORIGIN =
  typeof window !== "undefined" ? window.location.origin.replace(/\/+$/, "") : "";

function looksLikeLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
  } catch {
    return false;
  }
}

function resolveShareBaseUrl(): string {
  const explicit = (import.meta.env.VITE_SHARE_BASE_URL as string | undefined)?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;

  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "");
  if (apiUrl) return apiUrl.replace(/\/api$/i, "");

  return APP_ORIGIN;
}

/**
 * Path to the backend OG preview route.
 * Default `/api/share` matches DigitalOcean setups where the frontend proxies `/api/*` to the backend.
 */
const SHARE_PREVIEW_PATH = (() => {
  const configured = (import.meta.env.VITE_SHARE_PREVIEW_PATH as string | undefined)?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return "/api/share";
})();

const SHARE_PUBLIC_PREVIEW_PATH = (() => {
  const configured = (import.meta.env.VITE_SHARE_PUBLIC_PREVIEW_PATH as string | undefined)?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return "/share";
})();

export type SharePayload = {
  /** Canonical public moment page. */
  momentUrl: string;
  /** Human-friendly moment page (opens SPA when production-server is deployed). */
  url: string;
  /** Crawlable preview page, always has OG tags + JPEG image on /api/share. */
  previewUrl: string;
  /** Public crawler-facing preview route on the app host, e.g. /share/moments/:id. */
  publicPreviewUrl: string;
  title: string;
  /** Full moment description (not truncated). */
  description: string;
  /** @deprecated Use `description`, kept for Reddit title fallback. */
  teaser: string;
  hashtags: string[];
  /** Direct image URL for Pinterest `media` param. */
  mediaUrl?: string;
  cacheKey: string;
  relatedGames: string[];
};

/** Blank line between share blocks (title, description, link, tags). */
export const SHARE_BLOCK_GAP = "\n\n";

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

function joinShareBlocks(parts: Array<string | undefined>) {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(SHARE_BLOCK_GAP);
}

export function buildMomentShareTags(payload: Pick<SharePayload, "hashtags">): string {
  const tags = new Set<string>();
  for (const tag of payload.hashtags) {
    const normalized = normalizeHashtag(tag);
    if (normalized) tags.add(normalized);
  }
  return [...tags].map((tag) => `#${tag}`).join(" ");
}

export type BuildMomentShareBodyOptions = {
  title?: string;
  description?: string;
  linkUrl?: string;
  includeTags?: boolean;
};

/** Canonical share copy: Title → description → link → tags. Image preview is platform OG. */
export function buildMomentShareBody(
  payload: SharePayload,
  options: BuildMomentShareBodyOptions = {},
): string {
  const title = (options.title ?? payload.title).trim();
  const description = (options.description ?? payload.description ?? payload.teaser).trim();
  const link = (options.linkUrl ?? resolvePlatformShareUrl(payload)).trim();
  const includeTags = options.includeTags ?? true;

  return joinShareBlocks([
    title,
    description,
    link,
    includeTags ? buildMomentShareTags(payload) : undefined,
  ]);
}

const TWITTER_MAX_CHARS = 280;

/** X/Twitter hard limit, trim description first, always keep link + tags when possible. */
export function buildTwitterSharePostText(payload: SharePayload): string {
  const full = buildMomentSharePostText(payload);
  if (full.length <= TWITTER_MAX_CHARS) return full;

  const link = resolvePlatformShareUrl(payload).trim();
  const tags = buildMomentShareTags(payload);
  const title = payload.title.trim();
  const description = (payload.description ?? payload.teaser).trim();

  const suffix = joinShareBlocks([link, tags]);
  const prefix = title ? `${title}${SHARE_BLOCK_GAP}` : "";
  const maxDescription = TWITTER_MAX_CHARS - prefix.length - suffix.length - (description ? SHARE_BLOCK_GAP.length : 0);

  if (maxDescription > 40 && description) {
    const trimmed = truncateText(description, maxDescription);
    return joinShareBlocks([title, trimmed, link, tags]);
  }

  return truncateText(full, TWITTER_MAX_CHARS);
}

export function buildTemplateShareBody(templateText: string, payload: SharePayload): string {
  return joinShareBlocks([
    templateText.trim(),
    resolvePlatformShareUrl(payload),
    buildMomentShareTags(payload),
  ]);
}

export function buildMomentSharePostText(payload: SharePayload, linkUrl?: string): string {
  return buildMomentShareBody(payload, { linkUrl });
}

function resolveMomentPageBase(): string {
  if (APP_ORIGIN && !looksLikeLocalOrigin(APP_ORIGIN)) return APP_ORIGIN;
  return resolveShareBaseUrl() || APP_ORIGIN;
}

function resolveShareServiceBase(): string {
  return resolveShareBaseUrl() || resolveMomentPageBase();
}

export function buildMomentShareOgImageUrl(momentId: string): string {
  return buildMomentShareImageProxyUrl(momentId, resolveShareServiceBase());
}

/** Public image URL for Pinterest/WhatsApp, always JPEG proxy (any source format). */
export function resolveShareMediaUrl(moment: Moment): string | undefined {
  return resolveMomentShareImageUrl(moment, resolveShareServiceBase());
}

/**
 * URL placed in social posts, must be crawlable on static-site deployments.
 * Set VITE_SHARE_PLATFORM_URL=moment only after production-server serves OG on /moments/:id.
 */
export function resolvePlatformShareUrl(payload: SharePayload): string {
  const mode = (import.meta.env.VITE_SHARE_PLATFORM_URL as string | undefined)?.trim().toLowerCase();
  if (mode === "moment" || mode === "public") return payload.url;
  return payload.previewUrl;
}

export function buildMomentShareUrl(momentId: string): string {
  return `${resolveMomentPageBase()}/moments/${momentId}`;
}

function buildPreviewUrlOnHost(hostBase: string, momentId: string, previewPath: string): string {
  const base = hostBase.replace(/\/+$/, "");
  const path = previewPath.startsWith("/") ? previewPath : `/${previewPath}`;
  return `${base}${path}/moments/${momentId}`;
}

export function buildMomentSharePreviewUrl(momentId: string): string {
  return buildPreviewUrlOnHost(resolveShareServiceBase(), momentId, SHARE_PREVIEW_PATH);
}

export function buildMomentPublicPreviewUrl(momentId: string): string {
  return buildPreviewUrlOnHost(resolveShareServiceBase(), momentId, SHARE_PUBLIC_PREVIEW_PATH);
}

function buildMomentShareCacheKey(moment: Moment): string {
  const meta = moment.assetMetadata as Record<string, unknown> | undefined;
  const ogImageUrl = typeof meta?.ogImageUrl === "string" ? meta.ogImageUrl : "";
  const thumbnailUrl = typeof meta?.thumbnailUrl === "string" ? meta.thumbnailUrl : "";
  const source = [
    moment.updatedAt,
    moment.createdAt,
    moment.assetZgHash,
    moment.assetZgUrl,
    moment.assetUrl,
    ogImageUrl,
    thumbnailUrl,
    moment.title,
  ]
    .filter(Boolean)
    .join("|");

  return source || moment.momentId;
}

export function buildRedditSubmitTitle(payload: Pick<SharePayload, "title" | "teaser">): string {
  return truncateText(payload.title, 300);
}

export function buildRedditSubmitParams(
  payload: Pick<SharePayload, "title" | "description" | "teaser" | "url" | "previewUrl" | "hashtags">,
  titleOverride?: string,
): Record<string, string> {
  const params: Record<string, string> = {
    url: payload.previewUrl ?? payload.url,
    title: titleOverride
      ? truncateText(titleOverride, 300)
      : buildRedditSubmitTitle(payload),
  };
  const body = joinShareBlocks([
    payload.description ?? payload.teaser,
    payload.previewUrl ?? payload.url,
    buildMomentShareTags(payload),
  ]);
  if (body.trim()) {
    params.text = body;
  }
  return params;
}

export function buildMomentSharePayload(moment: Moment): SharePayload {
  const title = moment.title.trim() || "Check out this Kult moment";
  const description = moment.description?.trim() || moment.aiCaption?.trim() || "";
  const momentUrl = buildMomentShareUrl(moment.momentId);
  const previewUrl = buildMomentSharePreviewUrl(moment.momentId);
  const publicPreviewUrl = buildMomentPublicPreviewUrl(moment.momentId);
  const hashtags = (moment.tags ?? [])
    .map(normalizeHashtag)
    .filter(Boolean)
    .slice(0, 5);
  const game = moment.relatedGames?.[0] ?? "Kult";

  return {
    momentUrl,
    url: momentUrl,
    previewUrl,
    publicPreviewUrl,
    title,
    description,
    teaser: description,
    hashtags: ["KultGames", "KultMoments", game.replace(/[\s-]+/g, ""), ...hashtags].filter(Boolean),
    mediaUrl: resolveShareMediaUrl(moment),
    cacheKey: buildMomentShareCacheKey(moment),
    relatedGames: moment.relatedGames ?? [],
  };
}
