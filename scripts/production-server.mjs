/**
 * Production static server with social-crawler OG support for /moments/:id.
 *
 * Humans  → SPA index.html
 * Crawlers (Twitter, Facebook, WhatsApp, Reddit, Pinterest, TikTok) →
 *   proxied to the backend's /api/share/moments/:id which returns per-moment
 *   OG HTML with a JPEG image proxy. The backend owns all image conversion
 *   (via sharp), so we never duplicate that logic here.
 *
 * /api/share/* (including /api/share/moments/:id/og-image.jpg) →
 *   proxied to the backend. Social bots fetch the og:image URL immediately
 *   after crawling the OG HTML; those requests must reach the backend's
 *   JPEG proxy, which converts WebP/AVIF/other formats and returns image/jpeg.
 */
import { createServer } from "http";
import { createReadStream, existsSync, readFileSync, statSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { createGzip, createBrotliCompress, constants as zlibConstants } from "zlib";
import { pipeline } from "stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "../dist");
const PORT = Number(process.env.PORT || 8080);

/**
 * Backend origin — no trailing slash, /api suffix stripped.
 * Used for proxying API calls and share-preview requests.
 */
const API_ORIGIN = (
  process.env.VITE_API_URL ||
  process.env.API_URL ||
  "https://kult-browser-rust-l2lwg.ondigitalocean.app"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const CRAWLER_UA =
  /twitterbot|facebookexternalhit|facebot|discordbot|slackbot|telegrambot|whatsapp|linkedinbot|googlebot|bingbot|applebot|pinterest|redditbot|vkshare|bot\/|spider\/|crawler\//i;

const MOMENT_ID_PATTERN = "[A-Za-z0-9_-]{21}";
const MOMENT_PAGE = new RegExp(`^/moments/(${MOMENT_ID_PATTERN})/?$`);
/** Legacy share URLs — redirect humans to the public moment page. */
const LEGACY_SHARE_MOMENT_PAGE = new RegExp(`^/share/moments/(${MOMENT_ID_PATTERN})/?$`);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
};

// Text-ish formats compress well (70-80% smaller); images/video/fonts are
// already compressed and gzip/brotli would just waste CPU for ~0 gain.
const COMPRESSIBLE_EXT = new Set([".html", ".js", ".css", ".json", ".svg", ".txt"]);

/**
 * Vite hashes filenames under /assets/ (e.g. index-B8tud8Y.js), so those can be
 * cached forever — a new deploy always produces a new filename. Everything else
 * (favicon, /videos/*, /Warzone/*, /ranks/*, etc.) keeps a stable filename across
 * deploys, so it only gets a short cache window to avoid serving stale content
 * after those files are updated.
 */
function cacheControlFor(filePath) {
  if (filePath.startsWith(join(DIST, "assets") + "/")) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=86400";
}

function pickEncoding(req) {
  const acceptEncoding = String(req.headers["accept-encoding"] || "");
  if (/\bbr\b/.test(acceptEncoding)) return "br";
  if (/\bgzip\b/.test(acceptEncoding)) return "gzip";
  return null;
}

function requestOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${proto}://${host}` : "";
}

/**
 * Proxy a request to the backend.
 *
 * @param {import("http").IncomingMessage} req   - original request (headers forwarded)
 * @param {import("http").ServerResponse}  res   - response to write into
 * @param {string}                         [path] - override path; defaults to req.url
 */
async function proxyToBackend(req, res, path) {
  const url = path ?? req.url;
  const backendUrl = `${API_ORIGIN}${url}`;

  // Forward origin-related headers so the backend can build correct absolute URLs
  // (e.g. og:image proxy URL uses the public app hostname, not an internal address).
  const forwardHeaders = {};
  const fwdHost = req.headers["x-forwarded-host"] || req.headers.host;
  const fwdProto = req.headers["x-forwarded-proto"] || "https";
  if (fwdHost) forwardHeaders["x-forwarded-host"] = String(fwdHost).split(",")[0].trim();
  if (fwdProto) forwardHeaders["x-forwarded-proto"] = String(fwdProto).split(",")[0].trim();
  if (req.headers["user-agent"]) forwardHeaders["user-agent"] = req.headers["user-agent"];

  try {
    const upstream = await fetch(backendUrl, {
      signal: AbortSignal.timeout(15_000),
      headers: forwardHeaders,
    });

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const cacheControl = upstream.headers.get("cache-control") || "no-store";
    const buf = await upstream.arrayBuffer();

    res.writeHead(upstream.ok ? 200 : upstream.status, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
    });
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error("[production-server] backend proxy failed", { url: backendUrl, err: String(err) });
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Backend unavailable");
  }
}

function trySendStatic(req, res) {
  const urlPath = req.url?.split("?")[0] || "/";
  const rel = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = join(DIST, rel);

  if (!filePath.startsWith(DIST) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return false;
  }

  const ext = extname(filePath);
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": cacheControlFor(filePath),
  };

  const encoding = COMPRESSIBLE_EXT.has(ext) ? pickEncoding(req) : null;
  if (!encoding) {
    res.writeHead(200, headers);
    createReadStream(filePath).pipe(res);
    return true;
  }

  headers["Content-Encoding"] = encoding;
  headers.Vary = "Accept-Encoding";
  res.writeHead(200, headers);
  const compressor =
    encoding === "br"
      ? createBrotliCompress({
          params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 },
        })
      : createGzip();
  pipeline(createReadStream(filePath), compressor, res, (err) => {
    if (err) console.error("[production-server] compression stream failed", { filePath, err: String(err) });
  });
  return true;
}

/** Creator Studio's own index.html, present only when its build is bundled under dist/create. */
const STUDIO_INDEX = join(DIST, "create", "index.html");
const HAS_BUNDLED_STUDIO = existsSync(STUDIO_INDEX);

/**
 * A request that should receive this app's index.html: a browser navigating to one of its
 * client-side routes. Anything with a file extension is an asset, and `Accept: text/html`
 * distinguishes a document load from a fetch/script/style request.
 *
 * `/create/*` belongs to Creator Studio, which is built with base `/create/`. Serving this
 * app's index.html there renders a blank studio, so those requests are handled separately.
 */
function isSpaNavigation(req, pathname) {
  if (isStudioPath(pathname)) return false;
  if (extname(pathname)) return false;
  return String(req.headers.accept || "").includes("text/html");
}

function isStudioPath(pathname) {
  return pathname === "/create" || pathname.startsWith("/create/");
}

function sendSpaIndex(req, res) {
  sendHtml(req, res, readFileSync(join(DIST, "index.html")));
}

function sendHtml(req, res, html) {
  const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" };

  const encoding = pickEncoding(req);
  if (!encoding) {
    res.writeHead(200, headers);
    res.end(html);
    return;
  }

  headers["Content-Encoding"] = encoding;
  headers.Vary = "Accept-Encoding";
  res.writeHead(200, headers);
  const compressor =
    encoding === "br"
      ? createBrotliCompress({ params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } })
      : createGzip();
  compressor.end(html);
  compressor.pipe(res);
}

createServer((req, res) => {
  if (!req.url || req.method !== "GET") {
    res.writeHead(405);
    res.end();
    return;
  }

  const pathname = req.url.split("?")[0];
  const momentMatch = pathname.match(MOMENT_PAGE);
  const legacyShareMatch = pathname.match(LEGACY_SHARE_MOMENT_PAGE);
  const ua = req.headers["user-agent"] || "";

  // ── /api/share/* ─────────────────────────────────────────────────────────────
  // All share API calls go to the backend — this includes:
  //   /api/share/moments/:id          → per-moment OG HTML
  //   /api/share/moments/:id/og-image.jpg → JPEG proxy (social bots fetch this)
  //   /api/share/default-og.jpg       → JPEG-converted app branding image
  if (pathname.startsWith("/api/share/")) {
    void proxyToBackend(req, res);
    return;
  }

  // Legacy OG image paths (older share HTML may still reference these).
  if (/^\/api\/moments\/[^/]+\/share-image\.jpg$/.test(pathname)) {
    const momentId = pathname.split("/")[3];
    void proxyToBackend(req, res, `/api/share/moments/${momentId}/og-image.jpg`);
    return;
  }

  // ── Legacy /share/moments/:id (kult-moment share links) ─────────────────────
  // Always proxy to backend OG HTML — humans get JS redirect to /moments/:id;
  // crawlers receive og:image + twitter:card meta tags.
  if (legacyShareMatch) {
    void proxyToBackend(req, res, `/api/share/moments/${legacyShareMatch[1]}`);
    return;
  }

  // ── /moments/:id for social crawlers ─────────────────────────────────────────
  // Proxy to the backend's authoritative share preview endpoint.
  // The backend:
  //   • queries the moment from the DB
  //   • builds per-moment OG HTML (title, description, og:image)
  //   • og:image always uses the /api/share/moments/:id/og-image.jpg JPEG proxy
  //     (guarantees image/jpeg Content-Type regardless of the original file format)
  //   • includes a JS redirect so human browsers immediately go to the SPA
  const momentId = momentMatch?.[1] ?? legacyShareMatch?.[1];
  if (momentId && CRAWLER_UA.test(ua)) {
    void proxyToBackend(req, res, `/api/share/moments/${momentId}`);
    return;
  }

  // ── Static assets ─────────────────────────────────────────────────────────────
  if (trySendStatic(req, res)) return;

  // ── Creator Studio (/create/*) ───────────────────────────────────────────────
  // Only reachable when the studio build is bundled into this image; otherwise the
  // platform is expected to route /create/ to the studio's own deployment.
  if (isStudioPath(pathname)) {
    if (HAS_BUNDLED_STUDIO && !extname(pathname)) {
      sendHtml(req, res, readFileSync(STUDIO_INDEX));
      return;
    }
    console.warn("[production-server] 404 for Creator Studio path — is /create/ routed to the studio deployment?", {
      pathname,
      bundledStudio: HAS_BUNDLED_STUDIO,
    });
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    res.end("Not found");
    return;
  }

  // ── Never fall back to index.html for non-navigation requests ────────────────
  // Returning HTML for a missing .js/.css yields "Unexpected token '<'" and a blank
  // page instead of a 404, which hides the real problem (usually a build whose base
  // path doesn't match the path it's served from).
  if (!isSpaNavigation(req, pathname)) {
    console.warn("[production-server] 404 (not a navigation request)", {
      pathname,
      accept: req.headers.accept,
    });
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    res.end("Not found");
    return;
  }

  // ── SPA fallback ──────────────────────────────────────────────────────────────
  sendSpaIndex(req, res);
}).listen(PORT, () => {
  console.log(`[production-server] listening on :${PORT} (API ${API_ORIGIN})`);
});
