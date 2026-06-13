/**
 * Production static server with social-crawler OG support for /moments/:id.
 *
 * Humans get the SPA. Twitter/Facebook/WhatsApp/Reddit bots get OG HTML built
 * from the moment API (og:image = JPEG CDN URL when available).
 *
 * /api/share/* requests are proxied to the backend which handles JPEG conversion
 * via sharp (including the moment og-image.jpg endpoint and the default-og.jpg endpoint).
 */
import { createServer } from "http";
import { createReadStream, existsSync, readFileSync, statSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { buildMomentOgHtml } from "./momentOgHtml.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "../dist");
const PORT = Number(process.env.PORT || 8080);

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

const MOMENT_PAGE = /^\/moments\/([A-Za-z0-9_-]+)\/?$/;
/** Legacy share URLs — always redirect to the public moment page. */
const LEGACY_SHARE_MOMENT_PAGE = /^\/share\/moments\/([A-Za-z0-9_-]+)\/?$/;

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

function requestOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${proto}://${host}` : "";
}

async function fetchMoment(momentId) {
  const response = await fetch(`${API_ORIGIN}/api/moments/${momentId}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.data ?? payload?.moment ?? null;
}

async function serveCrawlerMomentOg(req, res, momentId) {
  const origin = requestOrigin(req);
  const publicMomentUrl = origin ? `${origin}/moments/${momentId}` : `/moments/${momentId}`;

  try {
    const moment = await fetchMoment(momentId);
    if (!moment) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Moment not found");
      return;
    }

    const html = buildMomentOgHtml(moment, publicMomentUrl);
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    });
    res.end(html);
  } catch (error) {
    console.error("[production-server] crawler OG failed", error);
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Moment preview unavailable");
  }
}

/**
 * Proxy /api/share/* to the backend.
 * The backend owns all share-preview logic including the JPEG image conversion
 * (via sharp) for og-image.jpg and default-og.jpg endpoints.
 */
async function proxyShareApi(req, res) {
  const backendUrl = `${API_ORIGIN}${req.url}`;
  try {
    const upstream = await fetch(backendUrl, { signal: AbortSignal.timeout(15_000) });
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const cacheControl = upstream.headers.get("cache-control") || "no-store";
    if (!upstream.ok) {
      res.writeHead(upstream.status, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Share resource unavailable");
      return;
    }
    const buf = await upstream.arrayBuffer();
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": cacheControl });
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error("[production-server] share proxy failed", err);
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Share resource unavailable");
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
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
  return true;
}

function sendSpaIndex(res) {
  const indexPath = join(DIST, "index.html");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(readFileSync(indexPath));
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

  // Proxy all /api/share/* to the backend (JPEG conversion via sharp lives there).
  if (pathname.startsWith("/api/share/")) {
    void proxyShareApi(req, res);
    return;
  }

  if (legacyShareMatch && !CRAWLER_UA.test(ua)) {
    const origin = requestOrigin(req);
    const target = origin
      ? `${origin}/moments/${legacyShareMatch[1]}`
      : `/moments/${legacyShareMatch[1]}`;
    res.writeHead(301, { Location: target, "Cache-Control": "no-cache" });
    res.end();
    return;
  }

  const momentId = momentMatch?.[1] ?? legacyShareMatch?.[1];
  if (momentId && CRAWLER_UA.test(ua)) {
    void serveCrawlerMomentOg(req, res, momentId);
    return;
  }

  if (trySendStatic(req, res)) return;
  sendSpaIndex(res);
}).listen(PORT, () => {
  console.log(`[production-server] listening on :${PORT} (API ${API_ORIGIN})`);
});
