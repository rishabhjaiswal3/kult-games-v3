import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Brain,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  LineChart,
  Newspaper,
  Radio,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  fetchEventComments,
  fetchFootballEvents,
  fetchResolvedFootballMarkets,
  fetchWorldCupMarkets,
  fetchPriceHistory,
  type PolyComment,
  type PolyEvent,
  type PolyMarket,
} from "@/api/polymarketApi";
import {
  fetchAllMatches,
  fetchWorldCupGroups,
  type GroupStanding,
  type UpcomingMatch,
  type WorldCupGroup,
} from "@/api/worldCupApi";
import { fetchFootballNews, type NewsItem } from "@/api/footballNewsApi";
import { leagueApi } from "@/api/leagueApi";
import { polymarketSignalApi } from "@/api/polymarketSignalApi";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPolymarketPositions, useMyPositionForMarket, useRefreshPolymarketPositions } from "@/hooks/useMyPolymarketPositions";
import { usePolymarketSignal } from "@/hooks/usePolymarketSignal";
import { usePolymarketTrading } from "@/hooks/usePolymarketTrading";
import { useNumericInput } from "@/hooks/useNumericInput";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { FlagCircle, TeamFlagCircle, type CountryCode } from "./FlagHex";
import { LeaguePanel } from "./LeaguePanel";
import { PolymarketLogo } from "./PolymarketLogo";

const MARKETS = [
  {
    id: "wc-final", question: "Will Argentina win the 2026 World Cup?", category: "World Cup", short: "ARG cup", closes: "2d", yes: 64, volume: "$248.2K",
    agents: [{ name: "HYBRID", pick: "Yes", confidence: 64, tone: "cyan", reason: "Messi-led core peaks at the right time." }, { name: "ASSASSIN", pick: "No", confidence: 71, tone: "purple", reason: "Knockout variance favors the field." }],
  },
  {
    id: "brazil-sf", question: "Will Brazil reach the World Cup semi-final?", category: "World Cup", short: "BRA SF", closes: "5d", yes: 58, volume: "$112.7K",
    agents: [{ name: "DEFENDER", pick: "Yes", confidence: 58, tone: "cyan", reason: "Friendly bracket draw on their side." }, { name: "TACTICIAN", pick: "No", confidence: 62, tone: "purple", reason: "Defensive gaps cost them late." }],
  },
  {
    id: "ucl-final", question: "Will Real Madrid win the Champions League?", category: "Champions League", short: "RMA UCL", closes: "13d", yes: 73, volume: "$192.4K",
    agents: [{ name: "TACTICIAN", pick: "Yes", confidence: 73, tone: "cyan", reason: "European pedigree in knockout ties." }, { name: "HYBRID", pick: "No", confidence: 55, tone: "purple", reason: "Premier League sides have the depth." }],
  },
  {
    id: "ucl-city", question: "Will Manchester City reach the UCL final?", category: "Champions League", short: "MCI UCL", closes: "11d", yes: 56, volume: "$133.1K",
    agents: [{ name: "BERSERKER", pick: "Yes", confidence: 61, tone: "cyan", reason: "Best xG profile in the competition." }, { name: "SUPPORT", pick: "No", confidence: 64, tone: "purple", reason: "Tough quarter-final draw." }],
  },
  {
    id: "golden-boot", question: "Will Mbappé win the World Cup Golden Boot?", category: "World Cup", short: "Mbappé GB", closes: "30d", yes: 41, volume: "$88.9K",
    agents: [{ name: "SUPPORT", pick: "Yes", confidence: 52, tone: "cyan", reason: "Penalty duties boost his tally." }, { name: "DEFENDER", pick: "No", confidence: 74, tone: "purple", reason: "France's deep squad spreads goals." }],
  },
  {
    id: "epl-title", question: "Will Manchester City win the Premier League?", category: "Premier League", short: "MCI EPL", closes: "18d", yes: 69, volume: "$121.5K",
    agents: [{ name: "HYBRID", pick: "Yes", confidence: 69, tone: "cyan", reason: "Run-in fixtures are kind." }, { name: "ASSASSIN", pick: "No", confidence: 58, tone: "purple", reason: "Arsenal's form is relentless." }],
  },
  {
    id: "laliga", question: "Will Barcelona win La Liga this season?", category: "La Liga", short: "BAR LL", closes: "21d", yes: 66, volume: "$95.3K",
    agents: [{ name: "DEFENDER", pick: "Yes", confidence: 66, tone: "cyan", reason: "Goal difference edge holds up." }, { name: "TACTICIAN", pick: "No", confidence: 57, tone: "purple", reason: "Madrid have games in hand." }],
  },
  {
    id: "messi-goal", question: "Will Messi score at the 2026 World Cup?", category: "World Cup", short: "Messi ⚽", closes: "9d", yes: 78, volume: "$76.2K",
    agents: [{ name: "ASSASSIN", pick: "Yes", confidence: 78, tone: "cyan", reason: "Set-piece and penalty threat remains." }, { name: "SUPPORT", pick: "No", confidence: 40, tone: "purple", reason: "Minutes may be managed in groups." }],
  },
  {
    id: "ballon", question: "Will Haaland win the 2026 Ballon d'Or?", category: "Ballon d'Or", short: "Haaland BdO", closes: "26d", yes: 62, volume: "$157.8K",
    agents: [{ name: "TACTICIAN", pick: "Yes", confidence: 62, tone: "cyan", reason: "Goal volume is unmatched." }, { name: "BERSERKER", pick: "No", confidence: 59, tone: "purple", reason: "Voters reward deep tournament runs." }],
  },
  {
    id: "transfer", question: "Will Mbappé stay at Real Madrid past 2026?", category: "Transfers", short: "Mbappé stay", closes: "27d", yes: 67, volume: "$114.0K",
    agents: [{ name: "HYBRID", pick: "Yes", confidence: 67, tone: "cyan", reason: "Settled and central to the project." }, { name: "DEFENDER", pick: "No", confidence: 54, tone: "purple", reason: "Saudi interest keeps circling." }],
  },
];

const MARKET_CATEGORIES = ["All", "World Cup", "Champions League", "Premier League", "La Liga", "Transfers", "Ballon d'Or"] as const;

type NewsImpact = "up" | "down" | "flat";

const MATCH_NEWS: {
  id: string;
  tag: string;
  time: string;
  title: string;
  body: string;
  market: string;
  move: string;
  impact: NewsImpact;
  agent: string;
}[] = [
  { id: "n1", tag: "TEAM NEWS", time: "8m ago", title: "Messi passed fit to start vs Austria", body: "Argentina confirm their captain trained fully and starts in Group C. Attack stays at full strength.", market: "Argentina win the 2026 World Cup", move: "+3¢", impact: "up", agent: "HYBRID" },
  { id: "n2", tag: "INJURY", time: "21m ago", title: "Haaland limps off in City training", body: "Late knock raises doubt over the striker's sharpness ahead of the UCL run-in. Ballon d'Or odds drift.", market: "Haaland wins the 2026 Ballon d'Or", move: "-4¢", impact: "down", agent: "BERSERKER" },
  { id: "n3", tag: "LINEUP", time: "37m ago", title: "France rotate heavily against Iraq", body: "Deschamps rests five starters but the class gap keeps France strong favourites to win the group.", market: "France win vs Iraq", move: "+1¢", impact: "up", agent: "TACTICIAN" },
  { id: "n4", tag: "FORM", time: "1h ago", title: "Spain unbeaten in 9, press relentless", body: "Spain's midfield control makes the Brazil clash a coin-flip. Agents split on the outcome.", market: "Brazil reach the World Cup semi-final", move: "-2¢", impact: "down", agent: "ASSASSIN" },
  { id: "n5", tag: "TRANSFER", time: "2h ago", title: "Saudi clubs renew Mbappé interest", body: "Reports of a record offer resurface, but sources say Madrid see him as central to the project.", market: "Mbappé stays at Real Madrid past 2026", move: "+2¢", impact: "up", agent: "HYBRID" },
  { id: "n6", tag: "TACTICS", time: "3h ago", title: "Arsenal's run-in piles pressure on City", body: "Title race tightens as Arsenal win again. The market nudges toward a tighter Premier League finish.", market: "Man City win the Premier League", move: "-1¢", impact: "down", agent: "ASSASSIN" },
];

type MatchOutcome = "HOME" | "DRAW" | "AWAY";

type MatchAgent = { name: string; outcome: MatchOutcome; pick: string; confidence: number; tone: "cyan" | "purple"; reason: string };

type Match = {
  id: string;
  category: (typeof MARKET_CATEGORIES)[number];
  league: string;
  day: string;
  kickoff: string;
  vol: string;
  home: { code: CountryCode; name: string; record: string; price: number };
  draw: { price: number };
  away: { code: CountryCode; name: string; record: string; price: number };
  spread: { line: string; home: number; away: number };
  total: { line: string; over: number; under: number };
  agents: [MatchAgent, MatchAgent];
};

const MATCHES: Match[] = [
  {
    id: "arg-aut", category: "World Cup", league: "World Cup · Group C", day: "Mon, June 22", kickoff: "10:30 PM", vol: "$7.77M",
    home: { code: "ARG", name: "Argentina", record: "1-0-0", price: 64 },
    draw: { price: 24 },
    away: { code: "AUT", name: "Austria", record: "1-0-0", price: 12 },
    spread: { line: "1.5", home: 40, away: 61 },
    total: { line: "2.5", over: 50, under: 51 },
    agents: [
      { name: "HYBRID", outcome: "HOME", pick: "Argentina", confidence: 64, tone: "cyan", reason: "Messi-led core controls tempo and finishes." },
      { name: "ASSASSIN", outcome: "DRAW", pick: "Draw", confidence: 28, tone: "purple", reason: "Austria sit deep and frustrate early." },
    ],
  },
  {
    id: "fra-irq", category: "World Cup", league: "World Cup · Group D", day: "Tue, June 23", kickoff: "2:30 AM", vol: "$3.51M",
    home: { code: "FRA", name: "France", record: "1-0-0", price: 88 },
    draw: { price: 9 },
    away: { code: "IRQ", name: "Iraq", record: "0-0-1", price: 3 },
    spread: { line: "2.5", home: 56, away: 45 },
    total: { line: "3.5", over: 53, under: 48 },
    agents: [
      { name: "TACTICIAN", outcome: "HOME", pick: "France", confidence: 88, tone: "cyan", reason: "Class gap is huge across every line." },
      { name: "SUPPORT", outcome: "HOME", pick: "France", confidence: 81, tone: "purple", reason: "France rotate but still cruise." },
    ],
  },
  {
    id: "bra-esp", category: "World Cup", league: "World Cup · Group A", day: "Tue, June 23", kickoff: "9:00 PM", vol: "$9.42M",
    home: { code: "BRA", name: "Brazil", record: "1-0-0", price: 45 },
    draw: { price: 27 },
    away: { code: "ESP", name: "Spain", record: "1-0-0", price: 28 },
    spread: { line: "0.5", home: 52, away: 49 },
    total: { line: "2.5", over: 58, under: 43 },
    agents: [
      { name: "ASSASSIN", outcome: "AWAY", pick: "Spain", confidence: 28, tone: "cyan", reason: "Spain's midfield press wins the duel." },
      { name: "DEFENDER", outcome: "DRAW", pick: "Draw", confidence: 27, tone: "purple", reason: "Two cautious heavyweights cancel out." },
    ],
  },
  {
    id: "eng-ger", category: "World Cup", league: "World Cup · Group B", day: "Wed, June 24", kickoff: "11:00 PM", vol: "$6.18M",
    home: { code: "ENG", name: "England", record: "0-1-0", price: 41 },
    draw: { price: 29 },
    away: { code: "GER", name: "Germany", record: "1-0-0", price: 30 },
    spread: { line: "0.5", home: 47, away: 54 },
    total: { line: "2.5", over: 46, under: 55 },
    agents: [
      { name: "DEFENDER", outcome: "DRAW", pick: "Draw", confidence: 29, tone: "cyan", reason: "Tight rivalry tends to a stalemate." },
      { name: "BERSERKER", outcome: "AWAY", pick: "Germany", confidence: 30, tone: "purple", reason: "Germany's form edge shows late." },
    ],
  },
];

const TRADER_ADDRESSES = ["0x7a2f…c41", "0x3b9d…e07", "0xf12a…9b4", "0x55c8…1de", "0x9e34…a6f", "0x0b71…d22", "0xc4a0…77e", "0x6df2…334", "0xab19…502", "0x2e8c…f90"];

type BaseMarket = { id: string; conditionId?: string; question: string; category: string; short: string; yes: number; volume: string; tokenId?: string; noTokenId?: string; eventTitle?: string; gameTime?: number; dayChange?: number };

type LiveMarket = BaseMarket & { dir: "up" | "down" | "flat"; delta: number; session: number };

type MarketSource = "live" | "loading" | "offline";

type MarketTrade = { id: number; addr: string; side: "YES" | "NO"; price: number; size: number; label: string };

function makeTrade(id: number, markets: BaseMarket[]): MarketTrade | null {
  if (markets.length === 0) return null;
  const market = markets[Math.floor(Math.random() * markets.length)];
  const side: "YES" | "NO" = Math.random() < market.yes / 100 ? "YES" : "NO";
  return {
    id,
    addr: TRADER_ADDRESSES[Math.floor(Math.random() * TRADER_ADDRESSES.length)],
    side,
    price: side === "YES" ? market.yes : 100 - market.yes,
    size: (Math.floor(Math.random() * 48) + 5) * 10,
    label: market.short,
  };
}

function seedHistory(markets: BaseMarket[]): Record<string, number[]> {
  return Object.fromEntries(
    markets.map((market) => [
      market.id,
      Array.from({ length: 36 }, (_, i) => Math.min(94, Math.max(6, market.yes + Math.round(Math.sin(i / 3) * 4)))),
    ]),
  );
}

/** Live Polymarket football data — real prices, real 24h change and real chart
 *  history (key-less & CORS-direct). Prices are never simulated: they re-anchor
 *  from Gamma on every poll. Shows empty/offline when the public API returns
 *  nothing — never swaps in hardcoded demo markets. */
function useLiveMarketData() {
  const [markets, setMarkets] = useState<BaseMarket[]>([]);
  const [source, setSource] = useState<MarketSource>("loading");
  const [history, setHistory] = useState<Record<string, number[]>>({});
  const [trades, setTrades] = useState<MarketTrade[]>([]);
  const marketsRef = useRef<BaseMarket[]>([]);
  const firstLoad = useRef(true);
  const seq = useRef(1000);

  // Pull real football markets from Polymarket (public, key-less, CORS-enabled).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const real: PolyMarket[] = await fetchWorldCupMarkets(200);
      if (cancelled) return;
      if (real.length === 0) {
        // Keep prior live data across a bad poll; only show offline on first empty load.
        if (firstLoad.current || marketsRef.current.length === 0) {
          marketsRef.current = [];
          setMarkets([]);
          setTrades([]);
          setHistory({});
          setSource("offline");
          firstLoad.current = false;
        }
        return;
      }
      marketsRef.current = real;
      setMarkets(real);
      setSource("live");
      if (firstLoad.current) {
        setTrades(
          Array.from({ length: 7 }, (_, index) => makeTrade(index, real)).filter((t): t is MarketTrade => t !== null),
        );
        setHistory(seedHistory(real));
        firstLoad.current = false;
      }
      // Real price history per market powers the live chart.
      real.forEach((market) => {
        if (!market.tokenId) return;
        void fetchPriceHistory(market.tokenId).then((series) => {
          if (cancelled || series.length < 2) return;
          setHistory((prev) => ({ ...prev, [market.id]: series }));
        });
      });
    };
    void load();
    const poll = setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, []);

  // Ambient trade ticker between fetches (slated to be replaced by the real
  // data-api /trades feed). Prices themselves are never touched here.
  useEffect(() => {
    const interval = setInterval(() => {
      if (marketsRef.current.length === 0) return;
      setTrades((prev) => {
        const count = Math.random() < 0.4 ? 2 : 1;
        const fresh = Array.from({ length: count }, () => {
          seq.current += 1;
          return makeTrade(seq.current, marketsRef.current);
        }).filter((t): t is MarketTrade => t !== null);
        return [...fresh, ...prev].slice(0, 14);
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return { markets, trades, history, source };
}

export function LeaguePolymarketBoard() {
  const [selectedMarketId, setSelectedMarketId] = useState<string>("");
  const category: (typeof MARKET_CATEGORIES)[number] = "All";
  const [view, setView] = useState<BoardView>("market");
  const { markets, trades, history, source } = useLiveMarketData();

  // Trending movers → jump to that question's card in the grid below.
  const [highlightedMarketId, setHighlightedMarketId] = useState<string | null>(null);
  const highlightTimer = useRef<number | null>(null);
  useEffect(() => () => { if (highlightTimer.current) window.clearTimeout(highlightTimer.current); }, []);
  const jumpToQuestion = (id: string) => {
    setSelectedMarketId(id);
    setHighlightedMarketId(id);
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightedMarketId(null), 2400);
    document.getElementById(`poly-question-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // dir/delta/session all reflect the REAL 24h price change from Gamma.
  const liveMarkets: LiveMarket[] = markets.map((market) => {
    const change = market.dayChange ?? 0;
    return { ...market, dir: change > 0 ? "up" : change < 0 ? "down" : "flat", delta: change, session: change };
  });

  useEffect(() => {
    if (liveMarkets.length === 0) return;
    if (!liveMarkets.some((market) => market.id === selectedMarketId)) {
      setSelectedMarketId(liveMarkets[0].id);
    }
  }, [liveMarkets, selectedMarketId]);

  return (
    <div className="min-w-0 space-y-3">
      <PolymarketComplianceNotice source={source} />
      <BoardViewTabs view={view} onChange={setView} marketCount={liveMarkets.length} newsCount={MATCH_NEWS.length} />

      {source === "loading" ? (
        <PolymarketBoardSkeleton />
      ) : view === "pulse" ? (
        <MatchPulseView category={category} />
      ) : view === "analysis" ? (
        <AnalysisView markets={liveMarkets} category={category} selectedId={selectedMarketId} onSelect={setSelectedMarketId} history={history} trades={trades} />
      ) : (
      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <FeaturedEventCard category={category} />
      </div>

      <div className="h-full lg:col-span-6">
        <WorldCupOddsHero />
      </div>
      <NextMatchPanel markets={marketsForCategory(liveMarkets, category)} onSelect={jumpToQuestion} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3">
        {liveMarkets.map((market) => <RealMarketCard key={market.id} market={market} highlighted={market.id === highlightedMarketId} />)}
        {liveMarkets.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center font-tech text-[11px] uppercase tracking-wider text-white/40 sm:col-span-2 lg:col-span-3">
            Polymarket unreachable — no live markets to show
          </div>
        ) : null}
      </div>
      </div>
      )}

    </div>
  );
}

function PolymarketMarketCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0d12] p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="skeleton h-5 w-20 rounded-md" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-2.5 w-28 rounded" />
      <div className="skeleton mt-2 h-4 w-full rounded" />
      <div className="skeleton mt-1.5 h-4 w-4/5 rounded" />
      <div className="mt-3 flex items-center gap-2">
        <div className="skeleton h-8 w-16 rounded-md" />
        <div className="skeleton h-8 flex-1 rounded-md" />
        <div className="skeleton h-8 flex-1 rounded-md" />
      </div>
      <div className="skeleton mt-3 h-9 w-full rounded-md" />
    </div>
  );
}

function PolymarketBoardSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12" aria-busy="true" aria-label="Loading Polymarket markets">
      <div className="lg:col-span-12">
        <div className="rounded-xl border border-[#2E5CFF]/30 bg-[#070911] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="skeleton h-12 w-12 shrink-0 rounded-xl" />
              <div className="min-w-0 space-y-2">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="skeleton h-5 w-48 rounded sm:w-64" />
              </div>
            </div>
            <div className="skeleton h-7 w-20 rounded-full" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton h-7 w-7 rounded-md" />
                    <div className="skeleton h-3.5 w-24 rounded" />
                  </div>
                  <div className="skeleton h-5 w-10 rounded" />
                </div>
              ))}
              <div className="skeleton mt-2 h-[132px] w-full rounded-lg" />
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              <div className="skeleton h-[200px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="skeleton h-[260px] rounded-2xl sm:h-[280px] lg:col-span-6 lg:h-[300px]" />
      <div className="skeleton h-[260px] rounded-xl lg:col-span-6" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PolymarketMarketCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

type BoardView = "market" | "pulse" | "analysis";

function WorldCupOddsHero() {
  const events = useFootballEvents();
  const worldCupEvent =
    events.find((event) => /world cup/i.test(event.title) && event.outcomesDetail.length >= 4) ??
    events.find((event) => event.outcomesDetail.length >= 4);

  const outcomes = (worldCupEvent?.outcomesDetail ?? [])
    .slice(0, 7)
    .map((outcome, index) => ({
      label: outcome.label,
      yes: outcome.yes,
      icon: outcome.icon,
      code: NAME_TO_CODE[outcome.label.toLowerCase()],
      color: OUTCOME_COLORS[index % OUTCOME_COLORS.length],
    }));

  // Double the items around the orbit so flags are packed closer together
  const orbitItems = useMemo(() => [...outcomes, ...outcomes], [outcomes]);
  const count = orbitItems.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef(0);
  const [positions, setPositions] = useState<
    { x: number; y: number; scale: number; z: number; rotate: number; opacity: number }[]
  >(() => orbitItems.map(() => ({ x: 0, y: 0, scale: 1, z: 0, rotate: 0, opacity: 1 })));

  useEffect(() => {
    if (count === 0) return;

    const SPEED = 0.004; // radians per frame (~0.23°/frame ≈ one full rotation ~27s at 60fps)
    let prev = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - prev, 50); // cap delta to avoid jumps
      prev = now;
      angleRef.current += SPEED * (dt / 16.667);

      const el = containerRef.current;
      const W = el?.clientWidth ?? 500;
      const H = el?.clientHeight ?? 200;

      // Wide semicircular arc: center sits below the visible area so only the
      // top half of the ellipse (the arc) sweeps left → up → right.
      const rx = W * 0.52;  // nearly full-width spread
      const ry = H * 0.60;  // tall so the arc has a nice curve
      const cx = W * 0.50;  // centered horizontally
      const cy = H * 0.82;  // pushed down — only the top arc is visible

      const next = orbitItems.map((_, i) => {
        const theta = angleRef.current + (i / count) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const x = cx + rx * cosT;
        const y = cy + ry * sinT;

        // depth: -sinT → 1 at top of arc (visible), -1 at bottom (hidden)
        const depth = -sinT;
        // Only show the top semicircle (depth > 0); hide the bottom half completely
        const visible = depth > -0.1;
        const scale = 0.5 + 0.5 * Math.max(0, depth);       // 0.5 → 1.0
        const opacity = visible ? 0.15 + 0.85 * Math.max(0, depth) : 0; // fully hidden at bottom
        const rotate = cosT * -15; // gentle tilt following position on arc

        return { x, y, scale, z: depth * 100, rotate, opacity };
      });

      setPositions(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count, orbitItems.length]);

  if (outcomes.length === 0) {
    return (
      <section
        className="relative h-full min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#171f25,#11181d)] p-5 sm:min-h-[280px] sm:p-7 lg:min-h-[300px]"
        aria-busy="true"
        aria-label="Loading World Cup odds"
      >
        <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center gap-4 sm:top-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-10 rounded-full sm:h-12 sm:w-12" style={{ opacity: 0.35 + i * 0.1 }} />
          ))}
        </div>
        <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-end sm:min-h-[220px] lg:min-h-[240px]">
          <div className="skeleton h-8 w-48 rounded sm:h-10 sm:w-64" />
          <div className="skeleton mt-3 h-3 w-full max-w-sm rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-full min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_18%_18%,rgba(125,151,255,0.14),transparent_36%),linear-gradient(180deg,#171f25,#11181d)] p-5 sm:min-h-[280px] sm:p-7 lg:min-h-[300px]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      {/* 3D orbital carousel — flags orbit along an elliptical arc */}
      <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {orbitItems.map((outcome, i) => {
          const pos = positions[i];
          if (!pos || pos.opacity < 0.08) return null;
          return (
            <OrbitalFlag
              key={`${outcome.label}-${i}`}
              outcome={outcome}
              x={pos.x}
              y={pos.y}
              scale={pos.scale}
              zIndex={Math.round(pos.z)}
              rotate={pos.rotate}
              opacity={pos.opacity}
            />
          );
        })}
      </div>

      <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-end sm:min-h-[220px] lg:min-h-[240px]">
        <h3 className="max-w-[420px] font-tech text-2xl font-black leading-tight text-white sm:text-4xl">
          World Cup<br />Odds &amp; Predictions
        </h3>
        <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/45 sm:text-sm">
          Percentages are pulled from live Polymarket football event.
        </p>
      </div>
    </section>
  );
}

function PolymarketComplianceNotice({ source }: { source: MarketSource }) {
  const badge =
    source === "live"
      ? { className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", label: "Live Polymarket data" }
      : source === "loading"
        ? { className: "border-white/20 bg-white/[0.06] text-white/60", label: "Loading markets…" }
        : { className: "border-amber-400/40 bg-amber-400/10 text-amber-300", label: "Polymarket offline" };

  return (
    <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-100">
          KULT is a signal layer only. Markets, prices, trading, execution, custody, and settlement are provided by Polymarket. KULT never custodies funds or executes trades. No cash value.
        </p>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
}

function OrbitalFlag({
  outcome,
  x,
  y,
  scale,
  zIndex,
  rotate,
  opacity,
}: {
  outcome: {
    label: string;
    yes: number;
    icon?: string;
    code?: CountryCode;
    color: string;
  };
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  rotate: number;
  opacity: number;
}) {
  const flag = flagFor(outcome.label);

  return (
    <div
      className="pointer-events-none absolute left-0 top-0 select-none"
      style={{
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
        zIndex,
        opacity,
        willChange: "transform, opacity",
        transition: "none",
      }}
    >
      <div className="grid h-9 w-12 place-items-center rounded-lg border border-white/12 bg-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.34)] backdrop-blur sm:h-10 sm:w-14">
        {outcome.icon ? (
          <img src={outcome.icon} alt="" className="h-full w-full rounded-lg object-cover" />
        ) : outcome.code ? (
          <FlagCircle code={outcome.code} className="h-full w-full rounded-lg" />
        ) : flag ? (
          <span className="text-xl leading-none sm:text-2xl">{flag}</span>
        ) : (
          <span className="font-tech text-xs font-black uppercase text-white">{outcome.label.slice(0, 3)}</span>
        )}
      </div>
      <div className="mt-4 text-center font-tech text-[11px] font-black text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-xs">{outcome.yes}%</div>
    </div>
  );
}

function MatchdayBadge({ label, tone = "blue" }: { label: string; tone?: "blue" | "green" | "gold" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : tone === "gold"
        ? "border-amber-400/35 bg-amber-400/10 text-amber-300"
        : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider ${toneClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function TradeReview({ agent, market, side, price, token }: { agent: string; market: string; side: "YES" | "NO"; price: number; token: "USDC" | "USDT" }) {
  return (
    <div className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.07] p-3">
      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /><p className="font-tech text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-200">Your approval is required</p></div>
      <p className="mt-2 text-[10px] leading-relaxed text-white/60"><span className="font-tech font-bold text-white">{agent}</span> shares a <span className="font-tech font-bold text-cyan-300">{side} signal at {price}¢</span> on {market}. Execution opens on Polymarket; KULT does not hold funds or execute trades.</p>
      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 font-tech text-[9px] text-white/45"><span>External venue</span><span className="font-bold text-white">Polymarket · {token}</span></div>
    </div>
  );
}

const SIGNAL_CONFIDENCE_PCT: Record<string, number> = { LOW: 60, MEDIUM: 75, HIGH: 90 };

/**
 * Real Polymarket market card — replaces the old MatchCard, which rendered
 * from a fully fabricated MATCHES array (fake teams, fake prices, no real
 * Polymarket id) with no bearing on anything tradeable. This one takes a
 * real LiveMarket (real question, real price, real tokenId) from
 * useLiveMarketData() and wires in the actual agent-signal feature
 * (docs/polymarket §5 Phase 2) instead of a mock "agent predictions" row.
 */
const TRADING_STATUS_LABEL: Record<string, string> = {
  "switching-network": "Switching to Polygon…",
  wrapping: "Funding trade (check your wallet)…",
  approving: "Approving (check your wallet)…",
  "deriving-key": "Setting up trading…",
  "placing-order": "Placing order…",
};

function RealMarketCard({ market, highlighted = false }: { market: LiveMarket; highlighted?: boolean }) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { getSignal, isLoading, result, error, hasAgent, myAgentId } = usePolymarketSignal();
  const { status: tradingStatus, error: tradeError, placeMarketBuy } = usePolymarketTrading();
  const stake = useNumericInput(10, { min: 1, integer: true });
  const [placedOrder, setPlacedOrder] = useState<{ side: "YES" | "NO"; orderId?: string } | null>(null);
  // Real position (survives refresh) -- placedOrder above is just the
  // optimistic "order just went through" flash before this catches up.
  const myPosition = useMyPositionForMarket(market.conditionId);
  const refreshPositions = useRefreshPolymarketPositions();

  const { data: signals } = useQuery({
    queryKey: ["polymarket", "signals", market.id],
    queryFn: () => polymarketSignalApi.getSignalsForMarket(market.id),
    staleTime: 30_000,
  });

  const myPersistedSignal = signals?.find((s) => s.agentId === myAgentId) ?? null;
  const signal = result(market.id) ?? myPersistedSignal;
  const loading = isLoading(market.id);
  const signalError = error(market.id);
  const isTrading = tradingStatus !== "idle" && tradingStatus !== "done";
  // Fallback/preview markets (Gamma unreachable) have no real CLOB tokenId -- there's nothing
  // real to sign a read or an order against, so both actions are disabled, not silently no-op'd.
  const isRealMarket = Boolean(market.tokenId);

  function handleGetSignal() {
    if (!isRealMarket) return;
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!hasAgent) {
      navigate("/my-agents");
      return;
    }
    void getSignal(market.id, market.question, market.category);
  }

  async function handleBuy(side: "YES" | "NO") {
    if (!isRealMarket) return;
    if (!isAuthenticated) {
      login();
      return;
    }
    const tokenId = side === "YES" ? market.tokenId : market.noTokenId;
    if (!tokenId || isTrading) return;
    setPlacedOrder(null);
    try {
      const amount = stake.commit();
      const result = await placeMarketBuy(tokenId, amount);
      setPlacedOrder({ side, orderId: result.orderId });
      refreshPositions();
    } catch {
      // tradeError from the hook already surfaces this
    }
  }

  const agent = signal ? getLeagueAgent(signal.agentName) : null;

  return (
    <article
      id={`poly-question-${market.id}`}
      className={`relative overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_50%_0%,rgba(0,200,83,0.08),transparent_55%),#0b0d12] p-3.5 transition duration-500 hover:border-[#2E5CFF]/45 ${
        highlighted ? "border-cyan-400/70 shadow-[0_0_28px_rgba(34,211,238,0.3)]" : "border-white/10"
      }`}
    >
      <div className="relative mb-2.5 flex items-center justify-between gap-2">
        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">{market.category}</span>
        <span className="shrink-0 font-mono text-[10px] text-white/40">{market.volume} Vol</span>
      </div>

      <div className="relative">
        <p className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/40">{market.eventTitle ?? "Prediction question"}</p>
        <p className="mt-0.5 min-h-9 font-tech text-sm font-bold text-white">{market.question}</p>

        {!isRealMarket ? (
          <p className="mt-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 font-tech text-[9px] uppercase tracking-wider text-amber-300">
            Preview data — Polymarket is unreachable right now, not a live tradeable market
          </p>
        ) : null}

        {myPosition ? (
          <div className={`mt-2 flex items-center justify-between rounded-md border px-2.5 py-1.5 ${myPosition.side === "YES" ? "border-emerald-400/30 bg-emerald-400/10" : "border-rose-400/30 bg-rose-400/10"}`}>
            <span className={`font-tech text-[9px] font-bold uppercase tracking-wider ${myPosition.side === "YES" ? "text-emerald-300" : "text-rose-300"}`}>
              You hold {myPosition.shares.toFixed(2)} {myPosition.side} @ {myPosition.entry}¢
            </span>
            <span className={`font-tech text-[9px] font-bold ${myPosition.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {myPosition.pnl >= 0 ? "+" : ""}${myPosition.pnl.toFixed(2)}
            </span>
          </div>
        ) : null}

        <div className="mt-3 flex items-center gap-2">
          <span className="font-tech text-[9px] uppercase tracking-wider text-white/40">Stake</span>
          <input
            {...stake.inputProps}
            disabled={isTrading || !isRealMarket}
            className="h-7 w-20 rounded-md border border-white/15 bg-black/30 px-2 font-tech text-xs font-bold text-white outline-none focus:border-[#2E5CFF]/50 disabled:opacity-50"
          />
          <span className="font-tech text-[9px] uppercase tracking-wider text-white/40">USDC</span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isTrading || !isRealMarket}
            onClick={() => void handleBuy("YES")}
            className="flex items-center justify-between rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Buy Yes</span><span>{market.yes}¢</span>
          </button>
          <button
            type="button"
            disabled={isTrading || !isRealMarket || !market.noTokenId}
            onClick={() => void handleBuy("NO")}
            title={!market.noTokenId ? "No-side token unavailable for this market" : undefined}
            className="flex items-center justify-between rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Buy No</span><span>{100 - market.yes}¢</span>
          </button>
        </div>

        {isTrading ? (
          <p className="mt-1.5 text-center font-tech text-[9px] uppercase tracking-wider text-cyan-300">{TRADING_STATUS_LABEL[tradingStatus]}</p>
        ) : tradeError ? (
          <p className="mt-1.5 text-center text-[9px] text-rose-400">{tradeError}</p>
        ) : placedOrder ? (
          <p className="mt-1.5 text-center font-tech text-[9px] uppercase tracking-wider text-emerald-300">
            {placedOrder.side} order placed{placedOrder.orderId ? ` · ${placedOrder.orderId.slice(0, 10)}…` : ""}
          </p>
        ) : null}
      </div>

      {/* Real agent signal (docs/polymarket §5 Phase 2) — replaces the old mock "agent predictions" row */}
      <div className="relative mt-3 border-t border-white/10 pt-2.5">
        <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/35"># agent signal</p>
        {signal ? (
          <div className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 ${signal.signal === "YES" ? "border-cyan-400/15 bg-cyan-400/[0.04]" : "border-fuchsia-400/15 bg-fuchsia-400/[0.04]"}`}>
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
            <div className="min-w-0">
              <p className="truncate font-tech text-[9px] font-bold uppercase text-white">{signal.agentName}</p>
              <p className={`mt-0.5 truncate font-tech text-[9px] font-bold ${signal.signal === "YES" ? "text-cyan-300" : "text-fuchsia-300"}`}>{signal.signal} · {SIGNAL_CONFIDENCE_PCT[signal.confidence] ?? 70}%</p>
              {signal.reasoning ? <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-snug text-white/58">{signal.reasoning}</p> : null}
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={loading || !isRealMarket}
            onClick={handleGetSignal}
            title={!isRealMarket ? "Preview data — no real market to read" : undefined}
            className="w-full rounded-md border border-[#2E5CFF]/40 bg-[#2E5CFF]/10 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-[#aebfff] transition hover:bg-[#2E5CFF]/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Reading market…" : "Get my agent's read"}
          </button>
        )}
        {signalError ? <p className="mt-1.5 text-center text-[9px] text-rose-400">{signalError}</p> : null}
      </div>
    </article>
  );
}

function MatchTeamRow({ team }: { team: { code: CountryCode; name: string; record: string } }) {
  return (
    <div className="flex items-center gap-2.5">
      <FlagCircle code={team.code} className="h-7 w-7" />
      <span className="font-bold text-white">{team.name}</span>
      <span className="font-mono text-[10px] text-white/35">{team.record}</span>
    </div>
  );
}

function OddsButton({ label, price, tone, highlight = false }: { label: string; price: number; tone: "home" | "draw" | "away" | "muted"; highlight?: boolean }) {
  const toneClass =
    tone === "home"
      ? highlight ? "border-[#2E5CFF] bg-[#2E5CFF] text-white shadow-[0_0_18px_rgba(46,92,255,0.4)]" : "border-[#2E5CFF]/40 bg-[#2E5CFF]/15 text-[#aebfff] hover:bg-[#2E5CFF]/25"
      : tone === "away"
        ? highlight ? "border-rose-500 bg-rose-600/80 text-white shadow-[0_0_18px_rgba(244,63,94,0.35)]" : "border-rose-500/30 bg-rose-600/15 text-rose-200 hover:bg-rose-600/25"
        : tone === "draw"
          ? highlight ? "border-emerald-400 bg-emerald-500/80 text-white shadow-[0_0_18px_rgba(52,211,153,0.35)]" : "border-white/12 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
          : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]";
  return (
    <button type="button" className={`flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-wide transition ${toneClass}`}>
      <span className="truncate">{label}</span>
      <span className="shrink-0">{price}¢</span>
    </button>
  );
}

function priceToneClass(dir: "up" | "down" | "flat") {
  if (dir === "up") return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
  if (dir === "down") return "border-rose-400/40 bg-rose-400/10 text-rose-300";
  return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";
}

function PriceArrow({ dir }: { dir: "up" | "down" | "flat" }) {
  if (dir === "up") return <ArrowUp className="h-3 w-3" />;
  if (dir === "down") return <ArrowDown className="h-3 w-3" />;
  return null;
}

function RecentTradesFeed({ trades }: { trades: MarketTrade[] }) {
  return (
    <LeaguePanel fill={false} className="overflow-hidden border-cyan-400/20 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.13),transparent_48%),#080c14] p-4">
      <div className="flex items-center justify-between gap-3">
        <div><p className="font-tech text-[9px] uppercase tracking-[0.2em] text-cyan-300">Market intel</p><p className="mt-1 font-tech text-sm font-bold text-white">Simulated market activity</p></div>
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.75)]" />
      </div>
      <div className="mt-3 max-h-[238px] space-y-1.5 overflow-y-auto pr-1 [scrollbar-color:rgba(34,211,238,0.55)_transparent] [scrollbar-width:thin]">
        {trades.map((trade, index) => (
          <div
            key={trade.id}
            className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 font-tech text-[10px] transition ${index === 0 ? "border-cyan-400/30 bg-cyan-400/[0.06]" : "border-white/8 bg-black/20"}`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${trade.side === "YES" ? "bg-cyan-400/15 text-cyan-300" : "bg-fuchsia-400/15 text-fuchsia-300"}`}>{trade.side}</span>
              <span className="truncate text-white/70">{trade.addr}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-white/45">
              <span className="text-white/55">{trade.label}</span>
              <span className="font-bold text-white">{trade.price}¢</span>
              <span className="text-amber-300">${trade.size}</span>
            </div>
          </div>
        ))}
      </div>
    </LeaguePanel>
  );
}

/** "18-2" -> 90 (rounded win %). Same predictionRecord() format League's leaderboard already returns. */
function accuracyFromRecord(record: string): number {
  const [wins, losses] = record.split("-").map((n) => parseInt(n, 10));
  const total = (wins || 0) + (losses || 0);
  return total > 0 ? Math.round(((wins || 0) / total) * 100) : 0;
}

/**
 * Real League reputation leaderboard (docs/polymarket) -- the product's
 * own framing is "agents use the same record to recommend market calls",
 * so this is the correct real data source, not a stand-in: there is no
 * separate Polymarket-specific accuracy stat, by design.
 */
function TopAgentsBoard({ sidebar = false }: { sidebar?: boolean }) {
  const { data: rows, isLoading } = useQuery({
    queryKey: ["league", "leaderboard", "global", 6],
    queryFn: () => leagueApi.getGlobalLeaderboard(6),
    staleTime: 60_000,
  });

  return (
    <LeaguePanel fill={false} className={`border-[#2E5CFF]/25 ${sidebar ? "p-4" : "lg:col-span-6"}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#2E5CFF]/40 bg-gradient-to-br from-[#2E5CFF]/25 to-[#2E5CFF]/5 text-[#8fa6ff] shadow-[0_0_16px_rgba(46,92,255,0.35)]">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <h3 className="bg-gradient-to-r from-white via-[#bcd0ff] to-[#7f9cff] bg-clip-text font-tech text-sm font-black uppercase tracking-[0.16em] text-transparent sm:text-base">
              Top Agents
            </h3>
            <p className="mt-0.5 text-[11px] text-white/50">Ranked by League reputation &amp; prediction record</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.9)] animate-pulse" />
          Live standings
        </span>
      </div>
      <div className="max-h-[238px] overflow-y-auto pr-1 [scrollbar-color:rgba(46,92,255,0.55)_transparent] [scrollbar-width:thin]">
      {isLoading ? (
        <div className={`grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 ${sidebar ? "" : "sm:grid-cols-3"}`}>
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-white/40">No ranked agents yet — check back once League picks start settling.</p>
      ) : (
      <div className={`grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 ${sidebar ? "" : "sm:grid-cols-3"}`}>
        {rows.map((row) => {
          const agent = getLeagueAgent(row.agentName);
          const accuracy = accuracyFromRecord(row.record);
          return (
            <article key={row.agentId} className="overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(46,92,255,0.12),transparent_55%),#070911] p-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-tech text-[9px] font-black ${row.rank === 1 ? "bg-amber-500/20 text-amber-400" : "bg-white/8 text-white/50"}`}>{row.rank}</span>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
                <p className="min-w-0 truncate font-tech text-[10px] font-bold uppercase text-white">{row.agentName}</p>
              </div>
              <div className="mt-3 flex flex-col items-start gap-1.5 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
                <div>
                  <p className="font-tech text-[8px] uppercase tracking-wider text-white/35">Accuracy</p>
                  <p className="font-tech text-sm font-black text-cyan-300">{accuracy}%</p>
                </div>
                <span className="max-w-full truncate rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-tech text-[10px] font-bold text-emerald-300">
                  {row.reputation} rep
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-[#2E5CFF]" style={{ width: `${accuracy}%` }} /></div>
              <p className="mt-2 font-tech text-[8px] uppercase tracking-wider text-white/35">{row.record} record · {row.streak}W streak</p>
            </article>
          );
        })}
      </div>
      )}
      </div>
    </LeaguePanel>
  );
}


function formatKickoffCountdown(kickoff: number, now: number): string {
  const ms = kickoff - now;
  if (ms <= 0) return "now";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.ceil((ms % 3_600_000) / 60_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return hours > 0 ? `${hours}h ${minutes.toString().padStart(2, "0")}m` : `${minutes}m`;
}

/** The current (live) or next (upcoming) match's headline questions with
 *  one-tap YES/NO betting. Falls back to TrendingMovers when no match-day
 *  markets are available (e.g. simulated fallback data). */
function NextMatchPanel({ markets, onSelect }: { markets: LiveMarket[]; onSelect: (id: string) => void }) {
  const { isAuthenticated, login } = useAuth();
  const { status: tradingStatus, error: tradeError, placeMarketBuy } = usePolymarketTrading();
  const stake = useNumericInput(10, { min: 1, integer: true });
  const [placed, setPlaced] = useState<{ id: string; side: "YES" | "NO" } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const withKickoff = markets.filter((m) => (m.gameTime ?? 0) > 0 && m.tokenId);
  const kickoff = withKickoff.length ? Math.min(...withKickoff.map((m) => m.gameTime ?? 0)) : 0;
  // Head-to-head questions lead ("Will France win…?", "Will Morocco win…?",
  // draw), then the rest keep their volume order (Team to Advance, O/U, …).
  const headlinePriority = (q: string): number => {
    if (/^will .+ win on /i.test(q)) return 0;
    if (/end in a draw/i.test(q)) return 1;
    return 2;
  };
  const matchMarkets = withKickoff
    .filter((m) => m.gameTime === kickoff)
    .sort((a, b) => headlinePriority(a.question) - headlinePriority(b.question))
    .slice(0, 4);
  const matchName = matchMarkets[0]?.eventTitle ?? "Next match";
  const [homeTeam, awayTeam] = matchName.split(/\s+vs\.?\s+/i);
  const isLive = kickoff > 0 && now >= kickoff;
  const isTrading = tradingStatus !== "idle" && tradingStatus !== "done";

  // Live score for the featured match (worldCupApi), polled while in play.
  const { data: allMatches } = useQuery({
    queryKey: ["worldcup", "matches", "next-match-score"],
    queryFn: fetchAllMatches,
    enabled: isLive && Boolean(homeTeam && awayTeam),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const liveScore = useMemo(() => {
    if (!isLive || !allMatches || !homeTeam || !awayTeam) return null;
    const norm = (s: string) => s.trim().toLowerCase();
    const h = norm(homeTeam);
    const a = norm(awayTeam);
    const found = allMatches.find((m) => {
      const mh = norm(m.home);
      const ma = norm(m.away);
      return (mh === h && ma === a) || (mh === a && ma === h);
    });
    if (!found || found.homeScore === undefined || found.awayScore === undefined) return null;
    return found;
  }, [isLive, allMatches, homeTeam, awayTeam]);

  async function handleBuy(market: LiveMarket, side: "YES" | "NO") {
    if (!isAuthenticated) {
      login();
      return;
    }
    const tokenId = side === "YES" ? market.tokenId : market.noTokenId;
    if (!tokenId || isTrading) return;
    setPlaced(null);
    try {
      const amount = stake.commit();
      await placeMarketBuy(tokenId, amount);
      setPlaced({ id: market.id, side });
    } catch {
      // tradeError from the hook already surfaces this
    }
  }

  // No real match-day data (e.g. offline fallback set) — keep the old panel.
  if (matchMarkets.length === 0) return <TrendingMovers markets={markets} onSelect={onSelect} />;

  return (
    <LeaguePanel fill={false} className="relative overflow-hidden border-emerald-400/20 p-3 lg:col-span-6">
      <div className="relative mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {homeTeam && awayTeam ? (
            <h3 className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">
              <TeamFlagCircle teamName={homeTeam.trim()} className="h-5 w-5 shrink-0 ring-1 ring-white/20" />
              <span className="truncate">{homeTeam.trim()}</span>
              <span className="text-white/40">vs.</span>
              <TeamFlagCircle teamName={awayTeam.trim()} className="h-5 w-5 shrink-0 ring-1 ring-white/20" />
              <span className="truncate">{awayTeam.trim()}</span>
            </h3>
          ) : (
            <h3 className="truncate font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">{matchName}</h3>
          )}
          <p className="mt-1 text-xs text-white/58">
            {isLive ? (
              <span className="inline-flex flex-wrap items-center gap-1.5 text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="font-tech text-[10px] font-black uppercase tracking-widest">Live</span>
                {liveScore ? (
                  <span className="font-tech text-sm font-black text-white">
                    {liveScore.home} <span className="text-emerald-300">{liveScore.homeScore}</span>
                    <span className="mx-1 text-white/40">–</span>
                    <span className="text-emerald-300">{liveScore.awayScore}</span> {liveScore.away}
                  </span>
                ) : (
                  <span>Match in progress — markets live</span>
                )}
              </span>
            ) : (
              <>Kicks off in <span className="font-bold text-emerald-300">{formatKickoffCountdown(kickoff, now)}</span></>
            )}
          </p>
        </div>
        <MatchdayBadge label={isLive ? "Live now" : "Next match"} />
      </div>

      {/* Stake */}
      <div className="relative mb-2 flex items-center gap-2">
        <span className="font-tech text-[9px] uppercase tracking-wider text-white/40">Stake</span>
        <input
          {...stake.inputProps}
          disabled={isTrading}
          className="h-6 w-16 rounded-md border border-white/15 bg-black/30 px-2 font-tech text-[11px] font-bold text-white outline-none focus:border-emerald-400/50 disabled:opacity-50"
        />
        <span className="font-tech text-[9px] uppercase tracking-wider text-white/40">USDC</span>
      </div>

      <div className="relative max-h-[240px] space-y-1.5 overflow-y-auto pr-1 [scrollbar-color:rgba(52,211,153,0.5)_transparent] [scrollbar-width:thin]">
        {matchMarkets.map((market) => {
          const placedHere = placed?.id === market.id ? placed.side : null;
          return (
            <div key={market.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.07),transparent_55%),#070911] p-2.5">
              {/* Question + chance on the left, Polymarket-style */}
              <button type="button" onClick={() => onSelect(market.id)} className="min-w-0 flex-1 self-start pt-0.5 text-left" title="View full market card">
                <p className="line-clamp-2 font-tech text-[13px] font-bold leading-snug text-white transition hover:text-emerald-200">{market.question}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="font-tech text-2xl font-black leading-none text-white">
                    {market.yes}
                    <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-white/40">% chance</span>
                  </p>
                  {market.session !== 0 ? (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-tech text-[9px] font-bold ${priceToneClass(market.dir)}`}>
                      <PriceArrow dir={market.dir} /> {market.session > 0 ? "+" : ""}{market.session}¢ 24h
                    </span>
                  ) : null}
                </div>
                {/* Probability bar */}
                <div className="mt-1.5 h-1 w-full max-w-[190px] overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-[width] duration-700"
                    style={{ width: `${Math.min(100, Math.max(2, market.yes))}%` }}
                  />
                </div>
                {placedHere ? (
                  <p className="mt-1 font-tech text-[9px] uppercase tracking-wider text-emerald-300">✓ {placedHere} order placed · ${stake.resolved}</p>
                ) : null}
              </button>
              {/* Yes stacked over No on the right */}
              <div className="flex w-28 shrink-0 flex-col gap-1.5">
                <button
                  type="button"
                  disabled={isTrading || !market.tokenId}
                  onClick={() => void handleBuy(market, "YES")}
                  className="flex items-center justify-between rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <span>Yes</span><span>{market.yes}¢</span>
                </button>
                <button
                  type="button"
                  disabled={isTrading || !market.noTokenId}
                  onClick={() => void handleBuy(market, "NO")}
                  title={!market.noTokenId ? "No-side token unavailable for this market" : undefined}
                  className="flex items-center justify-between rounded-md border border-rose-400/40 bg-rose-400/10 px-2.5 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <span>No</span><span>{100 - market.yes}¢</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isTrading ? (
        <p className="relative mt-1.5 text-center font-tech text-[9px] uppercase tracking-wider text-cyan-300">{TRADING_STATUS_LABEL[tradingStatus]}</p>
      ) : tradeError ? (
        <p className="relative mt-1.5 text-center text-[9px] text-rose-400">{tradeError}</p>
      ) : null}
    </LeaguePanel>
  );
}

function TrendingMovers({ markets, onSelect }: { markets: LiveMarket[]; onSelect: (id: string) => void }) {
  const movers = [...markets].sort((a, b) => Math.abs(b.session) - Math.abs(a.session));

  return (
    <LeaguePanel fill={false} className="relative overflow-hidden border-cyan-400/20 p-3 lg:col-span-6">
      <div className="relative mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">Trending movers</h3>
          <p className="mt-1 text-xs text-white/58">Biggest price swings</p>
        </div>
        <MatchdayBadge label="Live market" />
      </div>
      <div className="relative grid max-h-[220px] grid-cols-1 items-start gap-2 overflow-y-auto pr-1 sm:grid-cols-2 [scrollbar-color:rgba(34,211,238,0.55)_transparent] [scrollbar-width:thin]">
        {movers.map((market) => {
          const sessionDir = market.session > 0 ? "up" : market.session < 0 ? "down" : "flat";
          return (
            <button key={market.id} type="button" onClick={() => onSelect(market.id)} className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.1),transparent_55%),#070911] p-3 text-left transition hover:border-cyan-400/40">
              <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><p className="truncate font-tech text-[9px] uppercase tracking-wider text-white/50">⚽ {market.eventTitle ?? market.category}</p><p className="mt-1 line-clamp-2 font-tech text-[11px] font-bold leading-snug text-white">{market.question}</p></div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-tech text-[11px] font-bold ${priceToneClass(sessionDir)}`}>
                  <PriceArrow dir={sessionDir} /> {market.session >= 0 ? "+" : ""}{market.session}¢ 24h
                </span>
              </div>
              <span className="mt-1.5 block font-tech text-base font-black text-white">YES {market.yes}¢</span>
            </button>
          );
        })}
      </div>
    </LeaguePanel>
  );
}

/** Real positions for the connected wallet (docs/polymarket) -- was previously always-fake data labeled "Your positions" regardless of login state. */
function OpenPositions() {
  const { isAuthenticated, login } = useAuth();
  const { data: rows, isLoading } = useMyPolymarketPositions();

  const totalPnl = (rows ?? []).reduce((sum, row) => sum + row.pnl, 0);

  return (
    <LeaguePanel fill={false} className="border-amber-400/20 lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Your positions</h3>
          <p className="mt-0.5 text-[11px] text-white/45">{rows ? `${rows.length} open · live mark-to-market` : "Real Polymarket positions for your connected wallet"}</p>
        </div>
        {rows && rows.length > 0 ? (
          <span className={`font-tech text-[11px] font-bold ${totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)} P&amp;L</span>
        ) : null}
      </div>
      {!isAuthenticated ? (
        <button
          type="button"
          onClick={login}
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-3 text-center font-tech text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-amber-400/40 hover:text-white"
        >
          Connect wallet to see your positions
        </button>
      ) : isLoading ? (
        <div className="skeleton h-20 w-full rounded-lg" />
      ) : !rows || rows.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-white/40">No open Polymarket positions for this wallet yet.</p>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="text-left font-tech text-[8px] uppercase tracking-wider text-white/35">
              <th className="pb-2 font-bold">Market</th>
              <th className="pb-2 font-bold">Side</th>
              <th className="pb-2 text-right font-bold">Entry</th>
              <th className="pb-2 text-right font-bold">Current</th>
              <th className="pb-2 text-right font-bold">Shares</th>
              <th className="pb-2 text-right font-bold">P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.marketId} className="border-t border-white/8">
                <td className="py-2 pr-3"><p className="font-tech text-[11px] font-bold text-white">{row.question}</p></td>
                <td className="py-2 pr-3"><span className={`rounded px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase ${row.side === "YES" ? "bg-cyan-400/15 text-cyan-300" : "bg-fuchsia-400/15 text-fuchsia-300"}`}>{row.side}</span></td>
                <td className="py-2 pr-3 text-right font-tech text-[11px] text-white/70">{row.entry}¢</td>
                <td className="py-2 pr-3 text-right font-tech text-[11px] font-bold text-white">{row.current}¢</td>
                <td className="py-2 pr-3 text-right font-tech text-[11px] text-white/70">{row.shares}</td>
                <td className={`py-2 text-right font-tech text-[11px] font-bold ${row.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{row.pnl >= 0 ? "+" : ""}${row.pnl.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </LeaguePanel>
  );
}

/**
 * Real settled Polymarket football markets (docs/polymarket). Drops the old
 * "agent called it, hit/miss" framing entirely -- there's no real
 * correctness-tracking backend for Polymarket signals yet (unlike League,
 * which settles and grades every prediction), so fabricating a per-market
 * agent verdict here would just be a differently-shaped hardcoded number.
 */
function ResolvedMarkets() {
  const { data: markets, isLoading } = useQuery({
    queryKey: ["polymarket", "resolved-markets"],
    queryFn: () => fetchResolvedFootballMarkets(8),
    staleTime: 5 * 60_000,
  });

  return (
    <LeaguePanel fill={false} className="border-white/10 lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Resolved markets</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Recently settled questions</p>
        </div>
        <span className="font-tech text-[9px] uppercase tracking-wider text-white/35">{markets?.length ?? 0} settled</span>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
        </div>
      ) : !markets || markets.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-white/40">No recently settled football markets found.</p>
      ) : (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {markets.map((market) => (
          <article key={market.id} className="flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-[#070911] p-3 opacity-90">
            <div className="min-w-0 flex-1">
              <p className="truncate font-tech text-[11px] font-bold text-white">{market.question}</p>
              <p className="mt-0.5 font-tech text-[8px] uppercase tracking-wider text-white/35">{market.category} · settled {market.settledLabel}</p>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 font-tech text-[9px] font-bold uppercase ${market.outcome === "YES" ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300"}`}>{market.outcome}</span>
          </article>
        ))}
      </div>
      )}
    </LeaguePanel>
  );
}

function MarketMetric({
  label,
  value,
  detail,
  tone = "purple",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "purple" | "cyan";
}) {
  const valueColor = tone === "cyan" ? "text-cyan-300" : "text-[#aebfff]";
  return <div className="rounded-lg border border-white/8 bg-black/20 px-3 py-2.5"><p className="font-tech text-[8px] uppercase tracking-[0.16em] text-white/35">{label}</p><p className={`mt-1 font-tech text-sm font-black ${valueColor}`}>{value}</p><p className="mt-0.5 text-[9px] text-white/40">{detail}</p></div>;
}

function AgentEdgeSignal({
  agent,
  signal,
  positive = false,
}: {
  agent: ReturnType<typeof getLeagueAgent>;
  signal: (typeof MARKETS)[number]["agents"][number];
  positive?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
      <div className="min-w-0"><p className="truncate font-tech text-[9px] font-bold uppercase text-white">{signal.name}</p><p className={`truncate text-[9px] ${positive ? "text-cyan-300" : "text-fuchsia-300"}`}>{signal.pick}</p></div>
    </div>
  );
}

// ── Football events fetch (powers the featured event card) ──────────────────
function useFootballEvents() {
  const [events, setEvents] = useState<PolyEvent[]>([]);
  useEffect(() => {
    let cancelled = false;
    void fetchFootballEvents(10).then((list) => {
      if (!cancelled) setEvents(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return events;
}

// ── Featured event card (Polymarket-style, one event at a time) ─────────────
const OUTCOME_COLORS = ["#7d97ff", "#22d3ee", "#eab308", "#f97316", "#34d399", "#f472b6"];

const NAME_TO_CODE: Record<string, CountryCode> = {
  brazil: "BRA", argentina: "ARG", france: "FRA", germany: "GER", portugal: "POR",
  spain: "ESP", italy: "ITA", netherlands: "NLD", england: "ENG", austria: "AUT", iraq: "IRQ",
};

/** Country name → flag emoji, covering most national football teams. */
const NAME_TO_FLAG: Record<string, string> = {
  argentina: "🇦🇷", brazil: "🇧🇷", france: "🇫🇷", spain: "🇪🇸", germany: "🇩🇪", portugal: "🇵🇹",
  italy: "🇮🇹", netherlands: "🇳🇱", belgium: "🇧🇪", croatia: "🇭🇷", switzerland: "🇨🇭", austria: "🇦🇹",
  denmark: "🇩🇰", sweden: "🇸🇪", norway: "🇳🇴", poland: "🇵🇱", serbia: "🇷🇸", ukraine: "🇺🇦",
  turkey: "🇹🇷", türkiye: "🇹🇷", greece: "🇬🇷", czechia: "🇨🇿", "czech republic": "🇨🇿", mexico: "🇲🇽",
  "united states": "🇺🇸", usa: "🇺🇸", "united states of america": "🇺🇸", canada: "🇨🇦", "costa rica": "🇨🇷",
  panama: "🇵🇦", jamaica: "🇯🇲", haiti: "🇭🇹", honduras: "🇭🇳", uruguay: "🇺🇾", colombia: "🇨🇴",
  ecuador: "🇪🇨", peru: "🇵🇪", chile: "🇨🇱", paraguay: "🇵🇾", venezuela: "🇻🇪", bolivia: "🇧🇴",
  japan: "🇯🇵", "south korea": "🇰🇷", "korea republic": "🇰🇷", "saudi arabia": "🇸🇦", iran: "🇮🇷",
  iraq: "🇮🇶", qatar: "🇶🇦", australia: "🇦🇺", "new zealand": "🇳🇿", china: "🇨🇳", india: "🇮🇳",
  morocco: "🇲🇦", senegal: "🇸🇳", tunisia: "🇹🇳", algeria: "🇩🇿", egypt: "🇪🇬", ghana: "🇬🇭",
  nigeria: "🇳🇬", cameroon: "🇨🇲", "ivory coast": "🇨🇮", "côte d'ivoire": "🇨🇮", mali: "🇲🇱",
  "south africa": "🇿🇦", england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "bosnia and herzegovina": "🇧🇦", "cape verde": "🇨🇻", "curaçao": "🇨🇼", curacao: "🇨🇼",
  "democratic republic of the congo": "🇨🇩", uzbekistan: "🇺🇿", jordan: "🇯🇴",
};

function flagFor(label: string): string | undefined {
  return NAME_TO_FLAG[label.trim().toLowerCase()];
}

type FeaturedOutcome = { key: string; label: string; yes: number; color: string; icon?: string; code?: CountryCode; history: number[] };

function synthSeries(base: number): number[] {
  return Array.from({ length: 36 }, (_, i) => Math.max(2, Math.round(base + Math.sin(i / 3) * 3 + (i / 35) * 2)));
}

function FeaturedEventCard({ category }: { category: (typeof MARKET_CATEGORIES)[number] }) {
  const events = useFootballEvents();
  const [index, setIndex] = useState(0);
  const [histories, setHistories] = useState<Record<string, number[]>>({});
  const [comments, setComments] = useState<PolyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const pool = useMemo(() => {
    const base = category === "All" ? events : events.filter((e) => e.category === category);
    const list = base.length > 0 ? base : events;
    // Feature the chattiest events first so the live chat is populated by default.
    return [...list].sort((a, b) => b.commentCount - a.commentCount);
  }, [events, category]);

  useEffect(() => setIndex(0), [category, pool.length]);

  const event = pool[index];

  useEffect(() => {
    if (!event) return;
    let cancelled = false;
    setHistories({});
    setComments([]);
    event.outcomesDetail.slice(0, 4).forEach((outcome) => {
      if (!outcome.tokenId) return;
      void fetchPriceHistory(outcome.tokenId).then((series) => {
        if (cancelled || series.length < 2 || !outcome.tokenId) return;
        setHistories((prev) => ({ ...prev, [outcome.tokenId as string]: series }));
      });
    });
    setCommentsLoading(true);
    const loadComments = () =>
      void fetchEventComments(event.id, 8).then((list) => {
        if (cancelled) return;
        setCommentsLoading(false);
        if (list.length > 0) setComments(list);
      });
    loadComments();
    // Keep the chat live by re-polling for new comments.
    const chatPoll = setInterval(loadComments, 15_000);
    return () => {
      cancelled = true;
      clearInterval(chatPoll);
    };
  }, [event]);

  // Live event only — never substitute hardcoded demo outcomes.
  if (!event) {
    return (
      <LeaguePanel fill={false} className="relative overflow-hidden border-[#2E5CFF]/30 bg-[#070911] p-4 sm:p-5" aria-busy={events.length === 0}>
        {events.length === 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="skeleton h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="skeleton h-5 w-48 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton h-7 w-7 rounded-md" />
                    <div className="skeleton h-3.5 w-24 rounded" />
                  </div>
                  <div className="skeleton h-5 w-10 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="font-tech text-[11px] uppercase tracking-wider text-white/40">No featured event in this category</p>
        )}
      </LeaguePanel>
    );
  }

  const title = event.title;
  const volume = event.volume;
  const endsLabel = event.endsLabel;
  const headerIcon = event.icon;

  const outcomes: FeaturedOutcome[] = event.outcomesDetail.slice(0, 5).map((o, i) => ({
    key: o.tokenId ?? o.label,
    label: o.label,
    yes: o.yes,
    color: OUTCOME_COLORS[i % OUTCOME_COLORS.length],
    icon: o.icon,
    code: NAME_TO_CODE[o.label.toLowerCase()],
    history: (o.tokenId && histories[o.tokenId]) || synthSeries(o.yes),
  }));

  const displayComments = comments;
  const chartLines = outcomes.slice(0, 4).map((o) => ({ color: o.color, series: o.history }));
  const canCycle = pool.length > 1;

  return (
    <LeaguePanel fill={false} className="relative overflow-hidden border-[#2E5CFF]/30 bg-[radial-gradient(circle_at_0%_0%,rgba(46,92,255,0.1),transparent_45%),#070911] p-4 sm:p-5">
      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/15 bg-black/40 text-2xl">
            {headerIcon ? <img src={headerIcon} alt="" className="h-full w-full object-cover" /> : "⚽"}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <MatchdayBadge label="FIFA market" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">Sports · Soccer</span>
            </div>
            <h3 className="truncate font-tech text-lg font-black text-white sm:text-xl">{title}</h3>
          </div>
        </div>
        {canCycle ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" aria-label="Previous event" onClick={() => setIndex((i) => (i - 1 + pool.length) % pool.length)} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:bg-black/70"><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-mono text-[9px] text-white/40">{index + 1}/{pool.length}</span>
            <button type="button" aria-label="Next event" onClick={() => setIndex((i) => (i + 1) % pool.length)} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:bg-black/70"><ChevronRight className="h-4 w-4" /></button>
          </div>
        ) : null}
      </div>

      <div className="relative mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        {/* Left: outcomes + comments */}
        <div className="min-w-0">
          <div className="divide-y divide-white/8">
            {outcomes.map((o) => (
              <div key={o.key} className="flex items-center justify-between gap-3 py-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <OutcomeAvatar outcome={o} />
                  <span className="truncate font-tech text-sm font-bold text-white">{o.label}</span>
                </div>
                <span className="shrink-0 font-tech text-lg font-black text-white">{o.yes}%</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-white/8 bg-black/20 p-3">
            <div className="mb-2 flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-cyan-300" /><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-300">Live chat</p></div>
            {displayComments.length > 0 ? (
              <LiveChatTicker comments={displayComments} />
            ) : commentsLoading ? (
              <div className="flex items-center gap-2 text-[11px] text-white/40"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" /> Loading chat…</div>
            ) : (
              <p className="text-[11px] text-white/35">No comments on this market yet.</p>
            )}
          </div>
        </div>

        {/* Right: multi-line chart + legend */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {outcomes.slice(0, 4).map((o) => (
              <span key={o.key} className="inline-flex items-center gap-1.5 font-tech text-[11px] font-bold text-white/80">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: o.color }} />{o.label} <span className="text-white/50">{o.yes}%</span>
              </span>
            ))}
          </div>
          <div className="relative mt-3 overflow-hidden rounded-lg border border-white/8 bg-black/30">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
            <OutcomeLinesChart lines={chartLines} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/8 pt-3">
        <span className="font-mono text-[11px] font-bold text-white/55">{volume} Vol</span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-white/40">
          {endsLabel ? <>Ends {endsLabel} ·</> : null}
          <PolymarketLogo className="h-3 w-auto text-[#7d97ff]" />
        </span>
      </div>
    </LeaguePanel>
  );
}

function LiveChatTicker({ comments }: { comments: PolyComment[] }) {
  // Duplicate the list so the upward scroll loops seamlessly.
  const loop = [...comments, ...comments];
  const durationSec = Math.max(16, comments.length * 5);
  return (
    <div className="relative h-[132px] overflow-hidden">
      <div className="animate-chat-marquee" style={{ animationDuration: `${durationSec}s` }}>
        {loop.map((c, i) => (
          <div key={`${c.id}-${i}`} className="flex gap-2.5 pb-3">
            <div className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#2E5CFF]/25 font-tech text-[9px] font-bold uppercase text-[#aebfff]">{c.avatar ? <img src={c.avatar} alt="" className="h-full w-full object-cover" /> : c.author.charAt(0)}</div>
            <div className="min-w-0">
              <p className="font-tech text-[11px] font-bold text-white/80">{c.author}</p>
              <p className="text-[11px] leading-snug text-white/50">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#070911] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#070911] to-transparent" />
    </div>
  );
}

function OutcomeAvatar({ outcome }: { outcome: FeaturedOutcome }) {
  const flag = flagFor(outcome.label);
  if (flag) return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-black/40 text-base leading-none">{flag}</span>;
  if (outcome.code) return <FlagCircle code={outcome.code} className="h-7 w-7 rounded-md" />;
  if (outcome.icon) return <img src={outcome.icon} alt="" loading="lazy" className="h-7 w-7 shrink-0 rounded-md border border-white/10 object-cover" />;
  return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 font-tech text-[10px] font-bold uppercase text-white/70" style={{ backgroundColor: `${outcome.color}33` }}>{outcome.label.charAt(0)}</span>;
}

function OutcomeLinesChart({ lines }: { lines: { color: string; series: number[] }[] }) {
  const valid = lines.filter((l) => l.series.length >= 2);
  const [hover, setHover] = useState<{ x: number; index: number } | null>(null);
  const W = 720;
  const H = 340;
  const top = 28;
  const bottom = 304;
  const leftPad = 10;
  const rightPad = 46;
  const plotW = W - leftPad - rightPad;

  if (valid.length === 0) {
    return <div className="grid h-[260px] w-full place-items-center sm:h-[300px]"><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" /></div>;
  }

  const all = valid.flatMap((l) => l.series);
  const max = Math.max(...all) + 2;
  const min = Math.max(0, Math.min(...all) - 2);
  const span = Math.max(1, max - min);
  const xAt = (i: number, n: number) => (n <= 1 ? leftPad : leftPad + (i / (n - 1)) * plotW);
  const yAt = (v: number) => bottom - (bottom - top) * ((v - min) / span);
  const longest = valid.reduce((best, line) => (line.series.length > best.series.length ? line : best), valid[0]);
  const hoverIndex = hover?.index ?? longest.series.length - 1;
  const hoverX = hover?.x ?? xAt(longest.series.length - 1, longest.series.length);
  const tickValues = [max - span * 0.25, max - span * 0.5, max - span * 0.75].map(Math.round);
  const stepPath = (series: number[]) => {
    const points = series.map((v, i) => ({ x: xAt(i, series.length), y: yAt(v) }));
    return points
      .map((point, i) => {
        if (i === 0) return `M${point.x.toFixed(1)},${point.y.toFixed(1)}`;
        const prev = points[i - 1];
        return `H${point.x.toFixed(1)} V${point.y.toFixed(1)}`;
      })
      .join(" ");
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (longest.series.length - 1));
    setHover({ x: xAt(index, longest.series.length), index });
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-[260px] w-full cursor-crosshair sm:h-[300px] lg:h-[340px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHover(null)}
    >
      <defs>
        <filter id="outcome-chart-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[0.25, 0.5, 0.75].map((g, i) => (
        <g key={g}>
          <line x1={leftPad} x2={W - rightPad} y1={top + (bottom - top) * g} y2={top + (bottom - top) * g} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="3 7" />
          <text x={W - 34} y={top + (bottom - top) * g + 4} fill="rgba(255,255,255,0.44)" fontSize="13" fontFamily="monospace">
            {tickValues[i]}%
          </text>
        </g>
      ))}

      <text x={leftPad + 70} y={H - 15} fill="rgba(255,255,255,0.22)" fontSize="13" fontFamily="monospace">May 31</text>
      <text x={leftPad + plotW * 0.58} y={H - 15} fill="rgba(255,255,255,0.22)" fontSize="13" fontFamily="monospace">Jun 14</text>

      {valid.map((line, idx) => {
        const n = line.series.length;
        const d = stepPath(line.series);
        const lastX = xAt(n - 1, n);
        const lastY = yAt(line.series[n - 1]);
        const valueAtHover = line.series[Math.min(line.series.length - 1, hoverIndex)] ?? line.series[n - 1];
        const hoverY = yAt(valueAtHover);
        return (
          <g key={idx}>
            <path
              d={d}
              fill="none"
              stroke={line.color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#outcome-chart-glow)"
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: 0,
                animation: `chartLineDraw 900ms ease-out ${idx * 120}ms both`,
              }}
            />
            <circle cx={lastX} cy={lastY} r="5" fill={line.color} opacity="0.18">
              <animate attributeName="r" values="5;18;5" dur="2s" repeatCount="indefinite" begin={`${idx * 0.2}s`} />
              <animate attributeName="opacity" values="0.32;0;0.32" dur="2s" repeatCount="indefinite" begin={`${idx * 0.2}s`} />
            </circle>
            <circle cx={lastX} cy={lastY} r="4.5" fill={line.color} />
            {hover ? <circle cx={hoverX} cy={hoverY} r="3.5" fill={line.color} stroke="#111827" strokeWidth="1.5" /> : null}
          </g>
        );
      })}

      {hover ? (
        <g>
          <line x1={hoverX} x2={hoverX} y1={top} y2={bottom} stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4 6" />
          <rect x={Math.min(W - 158, Math.max(14, hoverX - 72))} y={18} width="144" height={28 + valid.length * 18} rx="10" fill="rgba(5,7,15,0.92)" stroke="rgba(255,255,255,0.14)" />
          {valid.map((line, i) => {
            const value = line.series[Math.min(line.series.length - 1, hoverIndex)] ?? line.series[line.series.length - 1];
            const x = Math.min(W - 146, Math.max(26, hoverX - 60));
            return (
              <g key={line.color} transform={`translate(${x}, ${45 + i * 18})`}>
                <circle cx="0" cy="-4" r="4" fill={line.color} />
                <text x="10" y="0" fill="rgba(255,255,255,0.8)" fontSize="12" fontFamily="monospace">{Math.round(value)}%</text>
              </g>
            );
          })}
        </g>
      ) : null}

      <style>{`
        @keyframes chartLineDraw {
          from { stroke-dashoffset: 1200; opacity: 0.35; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </svg>
  );
}

// ── View switcher (the three attractive buttons) ────────────────────────────
function BoardViewTabs({ view, onChange, marketCount, newsCount }: { view: BoardView; onChange: (v: BoardView) => void; marketCount: number; newsCount: number }) {
  const tabs: { id: BoardView; label: string; Icon: typeof Activity; meta: string; color: string }[] = [
    { id: "market", label: "Live Market", Icon: BarChart3, meta: "Live", color: "#2E5CFF" },
    { id: "pulse", label: "Match Pulse", Icon: Radio, meta: `${marketCount} fixtures`, color: "#22c55e" },
    { id: "analysis", label: "Analysis", Icon: Brain, meta: `${newsCount} signals`, color: "#a855f7" },
  ];
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === view));
  const activeColor = tabs[activeIndex].color;

  return (
    <div className="relative flex items-stretch rounded-xl border border-white/10 bg-[#070911]/80 p-1 backdrop-blur">
      {/* Sliding highlight pill — adopts the active tab's accent color */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 rounded-lg transition-all duration-300 ease-out"
        style={{
          width: "calc((100% - 0.5rem) / 3)",
          transform: `translateX(calc(${activeIndex} * 100%))`,
          background: `linear-gradient(125deg, ${activeColor}40, ${activeColor}12)`,
          boxShadow: `inset 0 0 0 1px ${activeColor}80, 0 4px 16px ${activeColor}38`,
        }}
      />
      {tabs.map(({ id, label, Icon, meta, color }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`group relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg px-2.5 py-2.5 transition ${active ? "text-white" : "text-white/55 hover:text-white"}`}
          >
            <Icon
              className="h-4 w-4 shrink-0 transition text-white/45 group-hover:text-white/80"
              style={active ? { color } : undefined}
            />
            <span className="truncate font-tech text-[12px] font-bold tracking-tight sm:text-[13px]">{label}</span>
            <span
              className={`hidden shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider sm:inline-flex ${active ? "" : "bg-white/[0.06] text-white/40"}`}
              style={active ? { backgroundColor: `${color}26`, color } : undefined}
            >
              {active ? <span className="h-1 w-1 animate-pulse rounded-full" style={{ backgroundColor: color }} /> : null}{meta}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Live price chart (Polymarket-style) ─────────────────────────────────────
function LiveMarketChart({ market, markets, onSelect, history }: { market: LiveMarket; markets: LiveMarket[]; onSelect: (id: string) => void; history: number[] }) {
  const chart = useMemo(() => {
    const series = history.length >= 2 ? history : [market.yes, market.yes];
    const W = 720;
    const H = 200;
    const top = 12;
    const bottom = 188;
    const max = Math.max(...series) + 3;
    const min = Math.min(...series) - 3;
    const span = Math.max(1, max - min);
    const stepX = W / (series.length - 1);
    const px = (i: number) => i * stepX;
    const py = (v: number) => bottom - (bottom - top) * ((v - min) / span);
    const line = series.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
    const area = `${line} L${W.toFixed(1)},${H} L0,${H} Z`;
    return { W, H, line, area, lastX: px(series.length - 1), lastY: py(series[series.length - 1]) };
  }, [history, market.yes]);

  const dir = market.dir;
  const stroke = dir === "down" ? "#fb7185" : dir === "up" ? "#34d399" : "#22d3ee";
  const sessionDir = market.session > 0 ? "up" : market.session < 0 ? "down" : "flat";

  return (
    <LeaguePanel fill={false} className="border-[#2E5CFF]/30 bg-[radial-gradient(circle_at_0%_0%,rgba(46,92,255,0.12),transparent_45%),#070911] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Live price</span>
            <span className="max-w-[180px] truncate rounded-sm border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-tech text-[8px] uppercase tracking-wider text-white/45">{market.eventTitle ?? market.category}</span>
          </div>
          <p className="mt-2 max-w-md font-tech text-sm font-bold leading-snug text-white sm:text-base">{market.question}</p>
        </div>
        <div className="text-right">
          <p className="font-tech text-3xl font-black leading-none text-white sm:text-4xl">{market.yes}<span className="text-lg text-white/40">%</span></p>
          <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-tech text-[10px] font-bold ${priceToneClass(sessionDir)}`}>
            <PriceArrow dir={sessionDir} /> {market.session >= 0 ? "+" : ""}{market.session}¢ 24h
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/8 bg-black/30">
        <svg viewBox={`0 0 ${chart.W} ${chart.H}`} preserveAspectRatio="none" className="h-44 w-full sm:h-52">
          <defs>
            <linearGradient id="lmc-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={chart.W} y1={chart.H * g} y2={chart.H * g} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}
          <path d={chart.area} fill="url(#lmc-area)" />
          <path d={chart.line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={chart.lastX} cy={chart.lastY} r="9" fill={stroke} opacity="0.18">
            <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.28;0;0.28" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={chart.lastX} cy={chart.lastY} r="3.5" fill={stroke} />
        </svg>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {markets.map((m) => {
          const active = m.id === market.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-left font-tech text-[9px] font-bold transition ${active ? "border-[#2E5CFF]/55 bg-[#2E5CFF]/15 text-[#d6e0ff]" : "border-white/10 bg-black/20 text-white/45 hover:text-white"}`}
            >
              <span className="block max-w-[120px] truncate">{m.short}</span>
              <span className={`mt-0.5 inline-flex items-center gap-1 ${priceToneClass(m.dir).split(" ").pop()}`}>{m.yes}¢ <PriceArrow dir={m.dir} /></span>
            </button>
          );
        })}
      </div>
    </LeaguePanel>
  );
}

function marketsForCategory(markets: LiveMarket[], category: (typeof MARKET_CATEGORIES)[number]) {
  if (category === "All") return markets;
  const filtered = markets.filter((market) => market.category === category);
  return filtered.length > 0 ? filtered : markets;
}

// ── Match Pulse view ────────────────────────────────────────────────────────
function stand(team: string, w: number, d: number, l: number, gf: number, ga: number): GroupStanding {
  return { position: 0, team, played: w + d + l, win: w, draw: d, loss: l, gf, ga, gd: gf - ga, points: w * 3 + d };
}

// Rotating result patterns so the 12 sample groups aren't identical.
const GROUP_PATTERNS: [number, number, number, number, number][][] = [
  [[3, 0, 0, 7, 1], [2, 0, 1, 5, 3], [1, 0, 2, 4, 5], [0, 0, 3, 1, 8]],
  [[2, 1, 0, 6, 2], [2, 0, 1, 5, 3], [1, 1, 1, 4, 4], [0, 0, 3, 1, 7]],
  [[2, 1, 0, 5, 1], [2, 0, 1, 4, 2], [1, 0, 2, 3, 4], [0, 1, 2, 2, 7]],
  [[3, 0, 0, 8, 2], [1, 1, 1, 4, 4], [1, 1, 1, 3, 3], [0, 1, 2, 2, 8]],
];

function grp(name: string, teams: [string, string, string, string], idx: number): WorldCupGroup {
  const pattern = GROUP_PATTERNS[idx % GROUP_PATTERNS.length];
  return {
    name,
    standings: teams.map((team, i) => ({ ...stand(team, ...pattern[i]), position: i + 1 })),
  };
}

/** Static fallback (all 12 groups) used until live data arrives, or if it fails. */
const STATIC_GROUPS: WorldCupGroup[] = [
  grp("Group A", ["Mexico", "Croatia", "Ecuador", "Qatar"], 0),
  grp("Group B", ["United States", "Switzerland", "Ghana", "Saudi Arabia"], 1),
  grp("Group C", ["Canada", "Belgium", "Morocco", "Australia"], 2),
  grp("Group D", ["Argentina", "Poland", "Tunisia", "Iran"], 3),
  grp("Group E", ["France", "Denmark", "Senegal", "Peru"], 0),
  grp("Group F", ["Brazil", "Serbia", "Cameroon", "Chile"], 1),
  grp("Group G", ["Spain", "Sweden", "Japan", "Paraguay"], 2),
  grp("Group H", ["Portugal", "Uruguay", "Nigeria", "South Korea"], 3),
  grp("Group I", ["England", "Colombia", "Egypt", "Wales"], 0),
  grp("Group J", ["Germany", "Netherlands", "Algeria", "Scotland"], 1),
  grp("Group K", ["Italy", "Norway", "Ivory Coast", "Austria"], 2),
  grp("Group L", ["Ukraine", "Turkey", "Greece", "Mali"], 3),
];

function useWorldCup() {
  const [groups, setGroups] = useState<WorldCupGroup[]>([]);
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void fetchWorldCupGroups().then((g) => { if (!cancelled && g.length > 0) setGroups(g); });
      void fetchAllMatches().then((m) => { if (!cancelled && m.length > 0) setMatches(m); });
    };
    load();
    // Refresh through the day so standings + fixtures stay current.
    const poll = setInterval(load, 6 * 60 * 60 * 1000);
    return () => { cancelled = true; clearInterval(poll); };
  }, []);
  return { groups, matches };
}

type MatchFilter = "Upcoming" | "Live" | "Finished" | "All";
const MATCH_FILTERS: MatchFilter[] = ["Upcoming", "Live", "Finished", "All"];

function MatchPulseView({ category }: { category: (typeof MARKET_CATEGORIES)[number] }) {
  const { groups, matches } = useWorldCup();
  const [filter, setFilter] = useState<MatchFilter>("Upcoming");
  const displayGroups = groups.length > 0 ? groups : STATIC_GROUPS;
  const staticUpcoming = category === "All" ? MATCHES : MATCHES.filter((match) => match.category === category);
  const hasLive = matches.length > 0;

  const now = Date.now();
  const filteredMatches = useMemo(() => {
    if (filter === "Live") return matches.filter((m) => m.live);
    if (filter === "Finished") return [...matches].filter((m) => m.finished).reverse();
    if (filter === "All") return matches;
    return matches.filter((m) => !m.finished && m.sortTs >= now - 3 * 60 * 60 * 1000);
  }, [matches, filter, now]);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <GroupStandings groups={displayGroups} live={groups.length > 0} />
      </div>

      <div className="min-w-0 space-y-3 lg:col-span-6 lg:flex lg:h-[760px] lg:flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[#7d97ff]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white">Matches</h3>
            <span className="font-mono text-[10px] text-white/40">· {hasLive ? "live · updates daily" : "kickoff times in local"}</span>
          </div>
          {hasLive ? (
            <div className="flex flex-wrap items-center gap-1">
              {MATCH_FILTERS.map((value) => {
                const active = filter === value;
                const count = value === "Live" ? matches.filter((m) => m.live).length : value === "Finished" ? matches.filter((m) => m.finished).length : undefined;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider transition ${active ? "border-[#2E5CFF]/55 bg-[#2E5CFF]/15 text-[#d6e0ff]" : "border-white/10 bg-black/20 text-white/45 hover:text-white"}`}
                  >
                    {value}
                    {count != null && count > 0 ? <span className={`rounded-full px-1 text-[8px] ${active ? "bg-white/15 text-white" : "bg-white/8 text-white/40"}`}>{count}</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="max-h-[55vh] space-y-2.5 overflow-y-auto pr-1 [scrollbar-color:rgba(46,92,255,0.55)_transparent] [scrollbar-width:thin] lg:max-h-none lg:min-h-0 lg:flex-1 lg:space-y-3">
          {hasLive ? (
            filteredMatches.length > 0
              ? filteredMatches.map((match) => <ApiMatchCard key={match.id} match={match} />)
              : <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center font-tech text-[11px] uppercase tracking-wider text-white/40">No {filter.toLowerCase()} matches right now</div>
          ) : (
            <>
              {staticUpcoming.map((match) => <UpcomingPulseCard key={match.id} match={match} />)}
              {staticUpcoming.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center font-tech text-[11px] uppercase tracking-wider text-white/40">No fixtures in this category yet</div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="min-w-0 lg:col-span-6 lg:h-[760px] lg:overflow-y-auto lg:pr-1 lg:[scrollbar-color:rgba(34,211,238,0.55)_transparent] lg:[scrollbar-width:thin]">
        <NewsFeed title="Football news & match facts" subtitle="Factual updates feeding the markets" />
      </div>
    </div>
  );
}

const GROUP_ACCENTS = [
  { grad: "from-[#2E5CFF]/25 via-[#2E5CFF]/10", glow: "rgba(46,92,255,0.35)", text: "text-[#aebfff]" },
  { grad: "from-[#a855f7]/25 via-[#a855f7]/10", glow: "rgba(168,85,247,0.32)", text: "text-[#d8b4fe]" },
  { grad: "from-[#22d3ee]/25 via-[#22d3ee]/10", glow: "rgba(34,211,238,0.32)", text: "text-cyan-200" },
  { grad: "from-[#f59e0b]/25 via-[#f59e0b]/10", glow: "rgba(251,191,36,0.3)", text: "text-amber-200" },
  { grad: "from-[#34d399]/25 via-[#34d399]/10", glow: "rgba(52,211,153,0.3)", text: "text-emerald-200" },
  { grad: "from-[#f472b6]/25 via-[#f472b6]/10", glow: "rgba(244,114,182,0.3)", text: "text-pink-200" },
];

function GroupStandings({ groups, live }: { groups: WorldCupGroup[]; live: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollByCards = (dir: number) => scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <LeaguePanel fill={false} className="border-[#2E5CFF]/25">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Group standings</h3>
          <p className="mt-0.5 text-[11px] text-white/45">FIFA World Cup 2026 · {groups.length} groups · top 2 advance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider ${live ? "text-emerald-300" : "text-white/40"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-white/40"}`} />
            {live ? "Live · updates daily" : "Preview standings"}
          </span>
          <button type="button" aria-label="Previous" onClick={() => scrollByCards(-1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:bg-black/70"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label="Next" onClick={() => scrollByCards(1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:bg-black/70"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div ref={scroller} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((group, i) => <GroupTable key={group.name} group={group} accent={GROUP_ACCENTS[i % GROUP_ACCENTS.length]} />)}
      </div>
    </LeaguePanel>
  );
}

function GroupTable({ group, accent }: { group: WorldCupGroup; accent: (typeof GROUP_ACCENTS)[number] }) {
  return (
    <div className="relative w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/12 bg-[#0a0e1a] sm:w-[300px]" style={{ boxShadow: `0 0 24px ${accent.glow}` }}>
      <div className={`flex items-center justify-between border-b border-white/10 bg-gradient-to-r ${accent.grad} to-transparent px-3 py-2.5`}>
        <p className="font-tech text-xs font-black uppercase tracking-wider text-white">{group.name}</p>
        <span className={`font-tech text-[8px] font-bold uppercase tracking-wider ${accent.text}`}>Top 2 ↑</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-[8px] uppercase tracking-wider text-white/40">
            <th className="px-3 py-1.5 text-left font-bold">#</th>
            <th className="py-1.5 text-left font-bold">Team</th>
            <th className="py-1.5 text-right font-bold">P</th>
            <th className="py-1.5 text-right font-bold">GD</th>
            <th className="px-3 py-1.5 text-right font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {(group.standings ?? []).map((row) => {
            const flag = flagFor(row.team);
            const advancing = row.position <= 2;
            return (
              <tr key={row.team} className={`border-t border-white/8 transition ${advancing ? "bg-emerald-400/[0.08]" : "hover:bg-white/[0.03]"}`}>
                <td className="px-3 py-2">
                  <span className={`grid h-4 w-4 place-items-center rounded font-tech text-[9px] font-black ${advancing ? "bg-emerald-400/20 text-emerald-300" : "text-white/45"}`}>{row.position}</span>
                </td>
                <td className="py-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="text-base leading-none">{flag ?? "⚽"}</span>
                    <span className="truncate font-tech text-[12px] font-bold text-white">{row.team}</span>
                  </span>
                </td>
                <td className="py-2 text-right font-tech text-[11px] text-white/70">{row.played}</td>
                <td className={`py-2 text-right font-tech text-[11px] font-bold ${row.gd > 0 ? "text-emerald-300" : row.gd < 0 ? "text-rose-300" : "text-white/60"}`}>{row.gd >= 0 ? "+" : ""}{row.gd}</td>
                <td className="px-3 py-2 text-right font-tech text-sm font-black text-cyan-300">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ApiMatchCard({ match }: { match: UpcomingMatch }) {
  const homeFlag = flagFor(match.home);
  const awayFlag = flagFor(match.away);
  const hasScore = match.homeScore != null && match.awayScore != null && (match.finished || match.live);
  return (
    <article className={`rounded-xl border bg-[#0b0d12] p-2.5 transition hover:border-[#2E5CFF]/45 sm:p-3.5 ${match.live ? "border-emerald-400/40" : "border-white/10"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[9px] font-bold text-white sm:text-[10px]">
          <Clock className="h-3 w-3 text-[#7d97ff]" />{[match.dateLabel, match.timeLabel].filter(Boolean).join(" · ") || "TBD"}
        </span>
        <div className="flex items-center gap-2">
          {match.live ? <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-emerald-300"><span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />Live</span> : null}
          {match.finished ? <span className="rounded-full border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-white/45">FT</span> : null}
          {match.group ? <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">{match.group}</span> : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/40 text-base sm:h-9 sm:w-9 sm:text-lg">{homeFlag ?? "⚽"}</span>
          <p className="truncate font-tech text-[13px] font-bold text-white sm:text-sm">{match.home}</p>
        </div>
        <span className={`shrink-0 font-tech font-black ${hasScore ? "text-sm text-white sm:text-base" : "font-mono text-[10px] text-white/30"}`}>
          {hasScore ? `${match.homeScore} – ${match.awayScore}` : "VS"}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <p className="truncate font-tech text-[13px] font-bold text-white sm:text-sm">{match.away}</p>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/40 text-base sm:h-9 sm:w-9 sm:text-lg">{awayFlag ?? "⚽"}</span>
        </div>
      </div>
    </article>
  );
}

function UpcomingPulseCard({ match }: { match: Match }) {
  const favourite = match.home.price >= match.away.price ? match.home.name : match.away.name;
  return (
    <article className="rounded-xl border border-white/10 bg-[#0b0d12] p-4 transition hover:border-[#2E5CFF]/45">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold text-white"><Clock className="h-3 w-3 text-[#7d97ff]" /> {match.day} · {match.kickoff}</span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">{match.league}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FlagCircle code={match.home.code} className="h-10 w-10 rounded-lg" />
          <div><p className="font-tech text-sm font-bold text-white">{match.home.name}</p><p className="font-mono text-[9px] text-white/35">{match.home.record}</p></div>
        </div>
        <span className="font-mono text-[10px] font-bold text-white/30">VS</span>
        <div className="flex items-center gap-2.5 text-right">
          <div><p className="font-tech text-sm font-bold text-white">{match.away.name}</p><p className="font-mono text-[9px] text-white/35">{match.away.record}</p></div>
          <FlagCircle code={match.away.code} className="h-10 w-10 rounded-lg" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <OddsButton label={match.home.name} price={match.home.price} tone="home" highlight={favourite === match.home.name} />
        <OddsButton label="Draw" price={match.draw.price} tone="draw" />
        <OddsButton label={match.away.name} price={match.away.price} tone="away" highlight={favourite === match.away.name} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-2.5 font-mono text-[10px] text-white/40">
        <span>{match.vol} volume</span>
        <span className="inline-flex items-center gap-1 text-[#9ab1ff]"><BarChart3 className="h-3 w-3" /> O/U {match.total.line}</span>
      </div>
    </article>
  );
}

function useFootballNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = () => void fetchFootballNews(10).then((list) => { if (!cancelled && list.length > 0) setNews(list); });
    load();
    const poll = setInterval(load, 10 * 60 * 1000); // refresh every 10 min
    return () => { cancelled = true; clearInterval(poll); };
  }, []);
  return news;
}

function NewsFeed({ title, subtitle }: { title: string; subtitle: string }) {
  const news = useFootballNews();
  const live = news.length > 0;
  return (
    <LeaguePanel fill={false} className="border-cyan-400/20 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.1),transparent_45%),#080c14] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-cyan-300" />
          <div><h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white">{title}</h3><p className="mt-0.5 text-[10px] text-white/45">{live ? "Live headlines · auto-refreshes" : subtitle}</p></div>
        </div>
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.75)]" />
      </div>
      {live ? (
        <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(34,211,238,0.5)_transparent] [scrollbar-width:thin] sm:max-h-[770px]">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-white/8 bg-black/25 p-3 transition hover:border-cyan-400/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate rounded bg-white/[0.06] px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-[#9ab1ff]">{item.source}</span>
                <span className="shrink-0 font-mono text-[9px] text-white/35">{item.timeLabel}</span>
              </div>
              <div className="mt-2 flex gap-2.5">
                {item.image ? <img src={item.image} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-md border border-white/10 object-cover" /> : null}
                <div className="min-w-0">
                  <p className="font-tech text-[12px] font-bold leading-snug text-white">{item.title}</p>
                  {item.body ? <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/45">{item.body}</p> : null}
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(34,211,238,0.5)_transparent] [scrollbar-width:thin] sm:max-h-[770px]">
          {MATCH_NEWS.map((item) => (
            <article key={item.id} className="rounded-lg border border-white/8 bg-black/25 p-3 transition hover:border-cyan-400/30">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-[#9ab1ff]">{item.tag}</span>
                <span className="font-mono text-[9px] text-white/35">{item.time}</span>
              </div>
              <p className="mt-2 font-tech text-[12px] font-bold leading-snug text-white">{item.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-white/45">{item.body}</p>
              <div className="mt-2 flex items-center justify-between border-t border-white/8 pt-2">
                <span className="truncate font-mono text-[9px] text-white/40">{item.market}</span>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-tech text-[9px] font-bold ${item.impact === "up" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : item.impact === "down" ? "border-rose-400/40 bg-rose-400/10 text-rose-300" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"}`}>
                  {item.impact === "up" ? <TrendingUp className="h-3 w-3" /> : item.impact === "down" ? <TrendingDown className="h-3 w-3" /> : null} {item.move}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </LeaguePanel>
  );
}

// ── Analysis view ───────────────────────────────────────────────────────────
function AnalysisView({
  markets,
  category,
  selectedId,
  onSelect,
  history,
  trades,
}: {
  markets: LiveMarket[];
  category: (typeof MARKET_CATEGORIES)[number];
  selectedId: string;
  onSelect: (id: string) => void;
  history: Record<string, number[]>;
  trades: MarketTrade[];
}) {
  const viewMarkets = marketsForCategory(markets, category);
  const selectedMarket = markets.find((m) => m.id === selectedId) ?? markets[0];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <LiveMarketChart market={selectedMarket} markets={viewMarkets} onSelect={onSelect} history={history[selectedMarket.id] ?? []} />
      </div>
      <div className="space-y-3 lg:col-span-4">
        <TrendingMovers markets={viewMarkets} onSelect={onSelect} />
      </div>

      <div className="space-y-3 lg:col-span-7">
        <TopAgentsBoard sidebar={false} />
        <RecentTradesFeed trades={trades} />
        <ResolvedMarkets />
      </div>
      <div className="lg:col-span-5">
        <NewsFeed title="News driving the board" subtitle="What's moving prices right now" />
      </div>

      <OpenPositions />
    </div>
  );
}
