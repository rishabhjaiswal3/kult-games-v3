/**
 * Builds crawler-facing Open Graph HTML for a moment.
 * Used by production-server.mjs when social bots request /moments/:id.
 */

const SITE_NAME = "Kult Moments";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(text, max) {
  const value = String(text ?? "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function isVideoMoment(moment) {
  const fileType = String(moment.assetMetadata?.fileType ?? "").toLowerCase();
  return fileType.startsWith("video/") || moment.assetMetadata?.mediaType === "video";
}

function resolveOgImageUrl(moment) {
  const meta = moment.assetMetadata ?? {};

  const ogImageUrl = typeof meta.ogImageUrl === "string" ? meta.ogImageUrl.trim() : "";
  if (ogImageUrl) return ogImageUrl;

  if (isVideoMoment(moment)) {
    const thumbnailUrl = typeof meta.thumbnailUrl === "string" ? meta.thumbnailUrl.trim() : "";
    if (thumbnailUrl) return thumbnailUrl;
    return undefined;
  }

  const assetUrl = typeof moment.assetUrl === "string" ? moment.assetUrl.trim() : "";
  if (!assetUrl) return undefined;

  // Prefer JPEG/PNG over WebP — X/Facebook/WhatsApp cards are inconsistent with WebP.
  if (!/\.webp($|\?)/i.test(assetUrl)) return assetUrl;
  return assetUrl;
}

function resolveOgImageMimeType(imageUrl) {
  if (!imageUrl) return undefined;
  const path = imageUrl.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".gif")) return "image/gif";
  return undefined;
}

function pickDimensions(moment) {
  const meta = moment.assetMetadata ?? {};
  const width = Number(meta.width);
  const height = Number(meta.height);
  if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  return { width: 1200, height: 630 };
}

export function buildMomentOgHtml(moment, publicMomentUrl) {
  const title = escapeHtml(truncate(moment.title?.trim() || "Kult Moment", 70));
  const description = escapeHtml(
    truncate(
      moment.description?.trim() ||
        moment.aiCaption?.trim() ||
        "A gaming moment shared on Kult — verified on the 0G Network.",
      155,
    ),
  );
  const safeUrl = escapeHtml(publicMomentUrl);
  const ogImageRaw = resolveOgImageUrl(moment);
  const ogImage = ogImageRaw ? escapeHtml(ogImageRaw) : "";
  const ogImageMime = resolveOgImageMimeType(ogImageRaw);
  const { width, height } = pickDimensions(moment);
  const isVideo = isVideoMoment(moment);

  const imageTags = ogImage
    ? `
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:url" content="${ogImage}" />
  <meta property="og:image:secure_url" content="${ogImage}" />${
    ogImageMime ? `\n  <meta property="og:image:type" content="${escapeHtml(ogImageMime)}" />` : ""
  }
  <meta property="og:image:width" content="${width}" />
  <meta property="og:image:height" content="${height}" />
  <meta property="og:image:alt" content="${title}" />`
    : "";

  const twitterTags = `
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />${
    ogImage
      ? `\n  <meta name="twitter:image" content="${ogImage}" />\n  <meta name="twitter:image:alt" content="${title}" />`
      : ""
  }`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${safeUrl}" />
  <link rel="canonical" href="${safeUrl}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="${isVideo ? "video.other" : "article"}" />${imageTags}${twitterTags}
</head>
<body>
  <p><a href="${safeUrl}">${title}</a> on ${SITE_NAME}</p>
</body>
</html>`;
}
