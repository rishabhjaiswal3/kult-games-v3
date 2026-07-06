// Direct, key-less Polymarket integration (public CORS-enabled endpoints).
// Gamma = market metadata + current prices, CLOB = price history for charts.
// Everything here is football-only (filtered client-side) and degrades to the
// caller's simulated data if the network/shape is unavailable.

const GAMMA_BASE = "https://gamma-api.polymarket.com";
const CLOB_BASE = "https://clob.polymarket.com";
const DATA_API_BASE = "https://data-api.polymarket.com";

export type PolyMarket = {
  id: string;
  question: string;
  category: string;
  short: string;
  /** YES price in cents, 0–100. */
  yes: number;
  /** Formatted volume, e.g. "$1.2M". */
  volume: string;
  /** CLOB token id for the YES outcome (used for price history and buying YES). */
  tokenId: string;
  /** CLOB token id for the NO outcome (used for buying NO) -- undefined if the market has no distinct NO leg. */
  noTokenId?: string;
  /** Creation time (epoch ms) used to sort newest-first; 0 when the API omits it. */
  createdAt: number;
};

// ── Football filtering ──────────────────────────────────────────────────────
const FOOTBALL_TERMS = [
  "world cup",
  "champions league",
  "uefa",
  "premier league",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "ballon d'or",
  "ballon dor",
  "golden boot",
  "fifa",
  "soccer",
  "europa league",
  "copa",
  "el clasico",
  "messi",
  "mbappe",
  "mbappé",
  "haaland",
  "ronaldo",
  "real madrid",
  "barcelona",
  "manchester",
  "arsenal",
  "liverpool",
  "chelsea",
  "bayern",
  "psg",
  "juventus",
];

// Keep American football / other sports out.
const EXCLUDE_TERMS = ["nfl", "super bowl", "touchdown", "quarterback", "nba", "mlb", "nhl", "cricket", "tennis"];

function isFootball(haystack: string): boolean {
  const text = haystack.toLowerCase();
  if (EXCLUDE_TERMS.some((term) => text.includes(term))) return false;
  return FOOTBALL_TERMS.some((term) => text.includes(term));
}

function deriveCategory(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("world cup") || q.includes("fifa")) return "World Cup";
  if (q.includes("champions league") || q.includes("uefa")) return "Champions League";
  if (q.includes("premier league") || q.includes(" epl")) return "Premier League";
  if (q.includes("la liga")) return "La Liga";
  if (q.includes("ballon")) return "Ballon d'Or";
  if (/\b(transfer|sign|signing|stay|join|leave|move to)\b/.test(q)) return "Transfers";
  return "World Cup";
}

function shorten(question: string, groupItemTitle?: string): string {
  if (groupItemTitle && groupItemTitle.trim()) return groupItemTitle.trim().slice(0, 18);
  const cleaned = question.replace(/^will\s+/i, "").replace(/\?$/, "").trim();
  const words = cleaned.split(/\s+/).slice(0, 3).join(" ");
  return words.slice(0, 18);
}

function formatVolume(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

// ── Defensive parsing helpers ───────────────────────────────────────────────
function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : 0;
}

/** Parse a Polymarket timestamp to epoch ms. Handles ISO strings and numeric
 *  epochs (seconds or ms). Returns 0 when absent/unparseable so such rows sink
 *  to the bottom of a newest-first sort rather than jumping to the top. */
function parseTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value; // seconds → ms
  }
  if (typeof value === "string" && value) {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}

type RawMarket = Record<string, unknown>;

function normalizeMarket(raw: RawMarket): PolyMarket | null {
  const question = typeof raw.question === "string" ? raw.question : "";
  if (!question) return null;

  const outcomes = parseStringArray(raw.outcomes);
  const prices = parseStringArray(raw.outcomePrices);
  const tokenIds = parseStringArray(raw.clobTokenIds);
  if (outcomes.length < 2 || prices.length < 2 || tokenIds.length < 2) return null;

  let yesIdx = outcomes.findIndex((o) => o.toLowerCase() === "yes");
  if (yesIdx < 0) yesIdx = 0;
  const noIdx = outcomes.findIndex((o) => o.toLowerCase() === "no");

  const yes = Math.round(Math.min(1, Math.max(0, toNumber(prices[yesIdx]))) * 100);
  const tokenId = tokenIds[yesIdx];
  if (!tokenId) return null;
  const noTokenId = noIdx >= 0 ? tokenIds[noIdx] : undefined;

  const volumeNum = toNumber(raw.volumeNum ?? raw.volume);
  // Prefer explicit creation time; fall back to startDate. Robust to string or numeric epochs.
  const createdAt = parseTimestamp(raw.createdAt) || parseTimestamp(raw.startDate);

  return {
    id: typeof raw.id === "string" ? raw.id : String(raw.id ?? question),
    question,
    category: deriveCategory(question),
    short: shorten(question, typeof raw.groupItemTitle === "string" ? raw.groupItemTitle : undefined),
    yes,
    volume: formatVolume(volumeNum),
    tokenId,
    createdAt,
    ...(noTokenId && { noTokenId }),
  };
}

/** Fetch the top football markets by volume. Returns [] on any failure. */
export async function fetchFootballMarkets(limit = 12): Promise<PolyMarket[]> {
  try {
    // Pull a broad pool ranked by 7-day (1-week) volume — a wider window than 24h
    // so football markets that traded any time this week surface, not just today's
    // hot ones — then sort those newest-first below so brand-new markets lead.
    // active=true&closed=false already excludes resolved/closed markets.
    const url = `${GAMMA_BASE}/markets?active=true&closed=false&limit=500&order=volume1wk&ascending=false`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const list: RawMarket[] = Array.isArray(json)
      ? (json as RawMarket[])
      : Array.isArray((json as { data?: unknown })?.data)
        ? ((json as { data: RawMarket[] }).data)
        : [];

    const football = list
      .filter((raw) => {
        const q = typeof raw.question === "string" ? raw.question : "";
        const slug = typeof raw.slug === "string" ? raw.slug : "";
        return isFootball(`${q} ${slug}`);
      })
      .map(normalizeMarket)
      .filter((m): m is PolyMarket => m !== null);

    // Newest markets first (markets missing a timestamp sink to the bottom).
    football.sort((a, b) => b.createdAt - a.createdAt);

    return football.slice(0, limit);
  } catch {
    return [];
  }
}

// ── Strict FIFA World Cup filter ────────────────────────────────────────────
// A market counts as World Cup ONLY when a World-Cup/FIFA anchor is present in
// its slug, tags, or question. Generic football terms (goals, top scorer,
// golden boot, "reach quarterfinals", player names, kit brands) are deliberately
// NOT include-doors — on their own they also match Champions League, domestic
// leagues and transfer markets, so using them would leak non–World-Cup questions.
const WORLD_CUP_ANCHOR = /world\s*cup|fifa/i;

// Other-sport "World Cups" (cricket/rugby/etc.) must not slip through.
const NON_FOOTBALL_TERMS = ["cricket", "rugby", "t20", "hockey", "nba", "nfl", "mlb", "nhl", "tennis"];

function worldCupHaystack(raw: RawMarket): string {
  const q = typeof raw.question === "string" ? raw.question : "";
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  const tags = Array.isArray(raw.tags)
    ? (raw.tags as Array<Record<string, unknown>>)
        .map((t) => `${String(t.label ?? "")} ${String(t.slug ?? "")}`)
        .join(" ")
    : "";
  return `${q} ${slug} ${tags}`.toLowerCase();
}

function isWorldCup(raw: RawMarket): boolean {
  const hay = worldCupHaystack(raw);
  if (NON_FOOTBALL_TERMS.some((t) => hay.includes(t))) return false;
  return WORLD_CUP_ANCHOR.test(hay);
}

/**
 * Fetch strictly FIFA World Cup markets — active, open (not resolved/closed),
 * newest-first. Ranked from the 7-day (1-week) volume pool, then narrowed to
 * markets carrying a World-Cup/FIFA anchor. Returns [] on any failure.
 */
export async function fetchWorldCupMarkets(limit = 60): Promise<PolyMarket[]> {
  try {
    const url = `${GAMMA_BASE}/markets?active=true&closed=false&limit=500&order=volume1wk&ascending=false`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const list: RawMarket[] = Array.isArray(json)
      ? (json as RawMarket[])
      : Array.isArray((json as { data?: unknown })?.data)
        ? ((json as { data: RawMarket[] }).data)
        : [];

    const worldCup = list
      .filter(isWorldCup)
      .map(normalizeMarket)
      .filter((m): m is PolyMarket => m !== null);

    // Newest markets first (markets missing a timestamp sink to the bottom).
    worldCup.sort((a, b) => b.createdAt - a.createdAt);

    return worldCup.slice(0, limit);
  } catch {
    return [];
  }
}

export type ResolvedMarket = {
  id: string;
  question: string;
  category: string;
  outcome: "YES" | "NO";
  settledLabel: string;
};

function formatRelativeTime(value: unknown): string {
  if (typeof value !== "string" || !value) return "recently";
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return "recently";
  const days = Math.round((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

/** Fetch real settled/closed football markets. Returns [] on any failure. */
export async function fetchResolvedFootballMarkets(limit = 8): Promise<ResolvedMarket[]> {
  try {
    const url = `${GAMMA_BASE}/markets?closed=true&limit=200&order=closedTime&ascending=false`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const list: RawMarket[] = Array.isArray(json)
      ? (json as RawMarket[])
      : Array.isArray((json as { data?: unknown })?.data)
        ? ((json as { data: RawMarket[] }).data)
        : [];

    const resolved = list
      .filter((raw) => {
        const q = typeof raw.question === "string" ? raw.question : "";
        const slug = typeof raw.slug === "string" ? raw.slug : "";
        return isFootball(`${q} ${slug}`);
      })
      .map((raw): ResolvedMarket | null => {
        const question = typeof raw.question === "string" ? raw.question : "";
        if (!question) return null;
        const outcomes = parseStringArray(raw.outcomes);
        const prices = parseStringArray(raw.outcomePrices);
        if (outcomes.length < 2 || prices.length < 2) return null;

        let yesIdx = outcomes.findIndex((o) => o.toLowerCase() === "yes");
        if (yesIdx < 0) yesIdx = 0;
        const outcome: "YES" | "NO" = toNumber(prices[yesIdx]) >= 0.5 ? "YES" : "NO";

        return {
          id: typeof raw.id === "string" ? raw.id : String(raw.id ?? question),
          question,
          category: deriveCategory(question),
          outcome,
          settledLabel: formatRelativeTime(raw.closedTime ?? raw.endDate),
        };
      })
      .filter((m): m is ResolvedMarket => m !== null);

    return resolved.slice(0, limit);
  } catch {
    return [];
  }
}

// ── Events (multi-market groupings, used for the banner carousel) ────────────
export type EventOutcome = {
  label: string;
  /** YES price in cents, 0–100 (i.e. this outcome's probability). */
  yes: number;
  tokenId?: string;
  icon?: string;
};

export type PolyEvent = {
  id: string;
  title: string;
  slug: string;
  category: string;
  icon?: string;
  image?: string;
  volume: string;
  marketCount: number;
  /** Top outcome labels (e.g. team names) by probability. */
  outcomes: string[];
  /** Full per-outcome detail (sorted by probability) for the featured card. */
  outcomesDetail: EventOutcome[];
  /** Formatted close date, e.g. "Jul 20, 2026". */
  endsLabel?: string;
  /** Number of comments on the event (for picking a chatty default). */
  commentCount: number;
};

export type PolyComment = {
  id: string;
  body: string;
  author: string;
  avatar?: string;
};

function formatEndDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return undefined;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(ts);
}

function eventOutcomesDetail(markets: RawMarket[]): EventOutcome[] {
  return markets
    .map((market) => {
      const prices = parseStringArray(market.outcomePrices);
      const outcomes = parseStringArray(market.outcomes);
      const tokenIds = parseStringArray(market.clobTokenIds);
      let yesIdx = outcomes.findIndex((o) => o.toLowerCase() === "yes");
      if (yesIdx < 0) yesIdx = 0;
      const label =
        (typeof market.groupItemTitle === "string" && market.groupItemTitle.trim()) ||
        (typeof market.question === "string" ? market.question : "");
      return {
        label,
        yes: Math.round(Math.min(1, Math.max(0, toNumber(prices[yesIdx]))) * 100),
        tokenId: tokenIds[yesIdx],
        icon:
          (typeof market.icon === "string" && market.icon) ||
          (typeof market.image === "string" ? market.image : undefined),
      };
    })
    .filter((row) => row.label)
    .sort((a, b) => b.yes - a.yes);
}

function normalizeEvent(raw: RawMarket): PolyEvent | null {
  const title = typeof raw.title === "string" ? raw.title : "";
  if (!title) return null;
  const markets = Array.isArray(raw.markets) ? (raw.markets as RawMarket[]) : [];
  const volumeNum = toNumber(raw.volumeNum ?? raw.volume);
  const outcomesDetail = eventOutcomesDetail(markets);

  return {
    id: typeof raw.id === "string" ? raw.id : String(raw.id ?? title),
    title,
    slug: typeof raw.slug === "string" ? raw.slug : "",
    category: deriveCategory(title),
    icon: typeof raw.icon === "string" ? raw.icon : undefined,
    image: typeof raw.image === "string" ? raw.image : undefined,
    volume: formatVolume(volumeNum),
    marketCount: markets.length,
    outcomes: outcomesDetail.slice(0, 4).map((o) => o.label),
    outcomesDetail,
    endsLabel: formatEndDate(raw.endDate),
    commentCount: Math.round(toNumber(raw.commentCount)),
  };
}

/** Fetch recent comments for an event (the live chat feed). Read-only, public. */
export async function fetchEventComments(eventId: string, limit = 8): Promise<PolyComment[]> {
  try {
    const url = `${GAMMA_BASE}/comments?parent_entity_type=Event&parent_entity_id=${encodeURIComponent(eventId)}&limit=${limit}&order=createdAt&ascending=false`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const list: RawMarket[] = Array.isArray(json)
      ? (json as RawMarket[])
      : Array.isArray((json as { data?: unknown })?.data)
        ? ((json as { data: RawMarket[] }).data)
        : [];
    return list
      .map((raw) => {
        const profile = (raw.profile && typeof raw.profile === "object" ? raw.profile : {}) as Record<string, unknown>;
        const author = String(
          profile.pseudonym ?? profile.name ?? profile.displayUsername ?? raw.userAddress ?? "anon",
        );
        const avatarRaw =
          profile.profileImage ?? profile.baseProfileImage ?? profile.image ?? profile.pfp ?? raw.profileImage;
        const avatar = typeof avatarRaw === "string" && avatarRaw ? avatarRaw : undefined;
        const body = typeof raw.body === "string" ? raw.body : "";
        return { id: String(raw.id ?? `${author}-${body.slice(0, 8)}`), body, author, avatar };
      })
      .filter((c) => c.body);
  } catch {
    return [];
  }
}

/** Fetch the top football events by volume. Returns [] on any failure. */
export async function fetchFootballEvents(limit = 10): Promise<PolyEvent[]> {
  try {
    const url = `${GAMMA_BASE}/events?active=true&closed=false&limit=200&order=volume24hr&ascending=false`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const list: RawMarket[] = Array.isArray(json)
      ? (json as RawMarket[])
      : Array.isArray((json as { data?: unknown })?.data)
        ? ((json as { data: RawMarket[] }).data)
        : [];

    return list
      .filter((raw) => {
        const title = typeof raw.title === "string" ? raw.title : "";
        const slug = typeof raw.slug === "string" ? raw.slug : "";
        const tags = Array.isArray(raw.tags)
          ? (raw.tags as Array<Record<string, unknown>>).map((t) => String(t.label ?? t.slug ?? "")).join(" ")
          : "";
        return isFootball(`${title} ${slug} ${tags}`);
      })
      .map(normalizeEvent)
      .filter((e): e is PolyEvent => e !== null)
      .slice(0, limit);
  } catch {
    return [];
  }
}

type RawHistoryPoint = { t?: number; p?: number };

/** Fetch YES price history (cents) for a CLOB token. Returns [] on failure. */
export async function fetchPriceHistory(tokenId: string, points = 36): Promise<number[]> {
  try {
    const url = `${CLOB_BASE}/prices-history?market=${encodeURIComponent(tokenId)}&interval=1w&fidelity=180`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const history: RawHistoryPoint[] = Array.isArray((json as { history?: unknown })?.history)
      ? ((json as { history: RawHistoryPoint[] }).history)
      : [];
    const series = history
      .map((point) => Math.round(Math.min(1, Math.max(0, toNumber(point.p))) * 100))
      .filter((n) => Number.isFinite(n));
    return series.slice(-points);
  } catch {
    return [];
  }
}

export type PolyPosition = {
  marketId: string;
  question: string;
  side: "YES" | "NO";
  /** Average entry price in cents. */
  entry: number;
  /** Current mid price in cents. */
  current: number;
  shares: number;
  /** Unrealized P&L in USD. */
  pnl: number;
};

/**
 * Fetch a wallet's real open Polymarket positions via Polymarket's public
 * Data API (docs/polymarket) -- read-only, key-less, same "any address" civic
 * lookup pattern Polygonscan/Etherscan use. Best-effort field parsing since
 * this specific endpoint's exact response shape could not be verified live
 * from this environment (same network restriction as Gamma/CLOB) -- degrades
 * to [] rather than guessing wrong, matching every other fetcher in this file.
 */
export async function fetchUserPositions(address: string): Promise<PolyPosition[]> {
  try {
    const url = `${DATA_API_BASE}/positions?user=${encodeURIComponent(address)}&sizeThreshold=1`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const list: RawMarket[] = Array.isArray(json) ? (json as RawMarket[]) : [];

    return list
      .map((raw): PolyPosition | null => {
        const question = typeof raw.title === "string" ? raw.title : typeof raw.question === "string" ? raw.question : "";
        const conditionId = typeof raw.conditionId === "string" ? raw.conditionId : typeof raw.market === "string" ? raw.market : "";
        if (!question || !conditionId) return null;

        const outcomeRaw = typeof raw.outcome === "string" ? raw.outcome : "";
        const side: "YES" | "NO" = outcomeRaw.toLowerCase() === "no" ? "NO" : "YES";
        const entry = Math.round(toNumber(raw.avgPrice) * 100);
        const current = Math.round(toNumber(raw.curPrice) * 100);
        const shares = toNumber(raw.size);
        const pnl = toNumber(raw.cashPnl ?? raw.percentPnl);

        return { marketId: conditionId, question, side, entry, current, shares, pnl };
      })
      .filter((p): p is PolyPosition => p !== null);
  } catch {
    return [];
  }
}
