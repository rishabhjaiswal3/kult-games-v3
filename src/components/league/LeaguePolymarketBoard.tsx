import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
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
  Flame,
  LineChart,
  Newspaper,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  fetchEventComments,
  fetchFootballEvents,
  fetchFootballMarkets,
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
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { FlagCircle, type CountryCode } from "./FlagHex";
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

const AGENT_RIVALRIES = [
  {
    id: "wc-final",
    question: "Will Argentina win the 2026 World Cup?",
    left: { name: "HYBRID", pick: "Yes", confidence: 64, tone: "cyan" },
    right: { name: "ASSASSIN", pick: "No", confidence: 71, tone: "purple" },
  },
  {
    id: "ucl-final",
    question: "Will Real Madrid win the Champions League?",
    left: { name: "TACTICIAN", pick: "Yes", confidence: 73, tone: "cyan" },
    right: { name: "HYBRID", pick: "No", confidence: 55, tone: "purple" },
  },
  {
    id: "ballon",
    question: "Will Haaland win the 2026 Ballon d'Or?",
    left: { name: "DEFENDER", pick: "Yes", confidence: 62, tone: "cyan" },
    right: { name: "BERSERKER", pick: "No", confidence: 59, tone: "purple" },
  },
];

const TOP_AGENTS = [
  { rank: 1, name: "HYBRID", accuracy: 74, roi: "+38%", streak: 6, calls: 142 },
  { rank: 2, name: "TACTICIAN", accuracy: 71, roi: "+29%", streak: 4, calls: 128 },
  { rank: 3, name: "DEFENDER", accuracy: 68, roi: "+22%", streak: 3, calls: 119 },
  { rank: 4, name: "ASSASSIN", accuracy: 66, roi: "+18%", streak: 5, calls: 134 },
  { rank: 5, name: "SUPPORT", accuracy: 63, roi: "+12%", streak: 2, calls: 97 },
  { rank: 6, name: "BERSERKER", accuracy: 61, roi: "+9%", streak: 2, calls: 110 },
];

const TODAY_AGENT_PREDICTIONS = [
  { name: "HYBRID", market: "Argentina win the 2026 World Cup", category: "World Cup", pick: "YES", confidence: 64, price: 64 },
  { name: "TACTICIAN", market: "Real Madrid win the Champions League", category: "Champions League", pick: "YES", confidence: 73, price: 73 },
  { name: "DEFENDER", market: "Barcelona win La Liga this season", category: "La Liga", pick: "YES", confidence: 66, price: 66 },
  { name: "ASSASSIN", market: "Messi scores at the World Cup", category: "World Cup", pick: "YES", confidence: 78, price: 78 },
  { name: "SUPPORT", market: "Mbappé wins the Golden Boot", category: "World Cup", pick: "NO", confidence: 59, price: 41 },
  { name: "BERSERKER", market: "Haaland wins the 2026 Ballon d'Or", category: "Ballon d'Or", pick: "YES", confidence: 62, price: 62 },
];

const OPEN_POSITIONS = [
  { marketId: "ucl-final", label: "Real Madrid win the Champions League", category: "Champions League", side: "YES" as const, entry: 64, shares: 120 },
  { marketId: "messi-goal", label: "Messi scores at the World Cup", category: "World Cup", side: "YES" as const, entry: 70, shares: 80 },
  { marketId: "wc-final", label: "Argentina win the 2026 World Cup", category: "World Cup", side: "NO" as const, entry: 33, shares: 150 },
];

const RESOLVED_MARKETS = [
  { id: "r1", question: "Did Real Madrid win the Club World Cup?", category: "Champions League", outcome: "YES" as const, settled: "3d ago", agent: "TACTICIAN", agentPick: "YES", correct: true },
  { id: "r2", question: "Did Man City keep a clean sheet vs Arsenal?", category: "Premier League", outcome: "YES" as const, settled: "6d ago", agent: "BERSERKER", agentPick: "YES", correct: true },
  { id: "r3", question: "Did Brazil win the Copa América final?", category: "World Cup", outcome: "NO" as const, settled: "8d ago", agent: "ASSASSIN", agentPick: "YES", correct: false },
  { id: "r4", question: "Did Mbappé score in El Clásico?", category: "La Liga", outcome: "YES" as const, settled: "12d ago", agent: "HYBRID", agentPick: "YES", correct: true },
];


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

type BaseMarket = { id: string; question: string; category: string; short: string; yes: number; volume: string; tokenId?: string };

type LiveMarket = BaseMarket & { dir: "up" | "down" | "flat"; delta: number; session: number };

/** Static football set used until live Polymarket data arrives (or if it fails). */
const FALLBACK_MARKETS: BaseMarket[] = MARKETS.map((market) => ({
  id: market.id,
  question: market.question,
  category: market.category,
  short: market.short,
  yes: market.yes,
  volume: market.volume,
}));

type MarketTrade = { id: number; addr: string; side: "YES" | "NO"; price: number; size: number; label: string };

function makeTrade(id: number, markets: BaseMarket[]): MarketTrade {
  const market = markets[Math.floor(Math.random() * markets.length)] ?? FALLBACK_MARKETS[0];
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

type PriceEntry = { yes: number; dir: "up" | "down" | "flat"; delta: number; session: number };

function seedPrices(markets: BaseMarket[]): Record<string, PriceEntry> {
  return Object.fromEntries(markets.map((market) => [market.id, { yes: market.yes, dir: "flat", delta: 0, session: 0 }]));
}

function seedHistory(markets: BaseMarket[]): Record<string, number[]> {
  return Object.fromEntries(
    markets.map((market) => [
      market.id,
      Array.from({ length: 36 }, (_, i) => Math.min(94, Math.max(6, market.yes + Math.round(Math.sin(i / 3) * 4)))),
    ]),
  );
}

/** Live Polymarket football data (real prices + real chart history, key-less &
 *  CORS-direct) with a simulated micro-movement layer for liveness. Falls back
 *  to the static football set if the public API is unavailable. */
function useLiveMarketData() {
  const [markets, setMarkets] = useState<BaseMarket[]>(FALLBACK_MARKETS);
  const [source, setSource] = useState<"live" | "sim">("sim");
  const [prices, setPrices] = useState<Record<string, PriceEntry>>(() => seedPrices(FALLBACK_MARKETS));
  const [history, setHistory] = useState<Record<string, number[]>>(() => seedHistory(FALLBACK_MARKETS));
  const [trades, setTrades] = useState<MarketTrade[]>(() => Array.from({ length: 7 }, (_, index) => makeTrade(index, FALLBACK_MARKETS)));
  const marketsRef = useRef<BaseMarket[]>(FALLBACK_MARKETS);
  const firstLoad = useRef(true);
  const seq = useRef(1000);

  // Pull real football markets from Polymarket (public, key-less, CORS-enabled).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const real: PolyMarket[] = await fetchFootballMarkets(12);
      if (cancelled || real.length === 0) return;
      marketsRef.current = real;
      setMarkets(real);
      setSource("live");
      if (firstLoad.current) {
        setPrices(seedPrices(real));
        setHistory(seedHistory(real));
        setTrades(Array.from({ length: 7 }, (_, index) => makeTrade(index, real)));
        firstLoad.current = false;
      } else {
        // Re-anchor live prices to the freshest real values, keep session drift.
        setPrices((prev) => {
          const next = { ...prev };
          for (const market of real) {
            const entry = prev[market.id];
            next[market.id] = entry ? { ...entry, yes: market.yes } : { yes: market.yes, dir: "flat", delta: 0, session: 0 };
          }
          return next;
        });
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

  // Simulated micro-movement + streaming trades for a live feel between fetches.
  useEffect(() => {
    const interval = setInterval(() => {
      const list = marketsRef.current;
      setPrices((prev) => {
        const next = { ...prev };
        for (const market of list) {
          const prevEntry = prev[market.id];
          const current = prevEntry?.yes ?? market.yes;
          const session = prevEntry?.session ?? 0;
          if (Math.random() < 0.55) {
            const delta = Math.random() < 0.5 ? -1 : 1;
            const yes = Math.min(94, Math.max(6, current + delta));
            const moved = yes - current;
            next[market.id] = { yes, dir: moved > 0 ? "up" : moved < 0 ? "down" : "flat", delta: moved, session: session + moved };
          } else {
            next[market.id] = { yes: current, dir: "flat", delta: 0, session };
          }
        }
        setHistory((prevHistory) => {
          const nextHistory: Record<string, number[]> = { ...prevHistory };
          for (const market of list) {
            const series = prevHistory[market.id] ?? [market.yes];
            nextHistory[market.id] = [...series, next[market.id]?.yes ?? market.yes].slice(-36);
          }
          return nextHistory;
        });
        return next;
      });
      setTrades((prev) => {
        const count = Math.random() < 0.4 ? 2 : 1;
        const fresh = Array.from({ length: count }, () => {
          seq.current += 1;
          return makeTrade(seq.current, marketsRef.current);
        });
        return [...fresh, ...prev].slice(0, 14);
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return { markets, prices, trades, history, source };
}

export function LeaguePolymarketBoard() {
  const [selectedMarketId, setSelectedMarketId] = useState<string>(MARKETS[0].id);
  const category: (typeof MARKET_CATEGORIES)[number] = "All";
  const [view, setView] = useState<BoardView>("market");
  const { markets, prices, trades, history, source } = useLiveMarketData();

  const liveMarkets: LiveMarket[] = markets.map((market) => {
    const live = prices[market.id];
    return { ...market, yes: live?.yes ?? market.yes, dir: live?.dir ?? "flat", delta: live?.delta ?? 0, session: live?.session ?? 0 };
  });

  const selectedMarket = liveMarkets.find((market) => market.id === selectedMarketId) ?? liveMarkets[0];
  const visibleMatches = category === "All" ? MATCHES : MATCHES.filter((match) => match.category === category);

  return (
    <div className="min-w-0 space-y-3">
      <PolymarketComplianceNotice source={source} />
      <BoardViewTabs view={view} onChange={setView} marketCount={MATCHES.length} newsCount={MATCH_NEWS.length} />

      {view === "pulse" ? (
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
      <TrendingMovers markets={marketsForCategory(liveMarkets, category)} onSelect={setSelectedMarketId} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3">
        {visibleMatches.map((match) => <MatchCard key={match.id} match={match} />)}
        {visibleMatches.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center font-tech text-[11px] uppercase tracking-wider text-white/40 sm:col-span-2 lg:col-span-3">No matches in this category yet</div>
        ) : null}
      </div>
      </div>
      )}

    </div>
  );
}

type BoardView = "market" | "pulse" | "analysis";

function WorldCupOddsHero() {
  const events = useFootballEvents();
  const worldCupEvent =
    events.find((event) => /world cup/i.test(event.title) && event.outcomesDetail.length >= 4) ??
    events.find((event) => event.outcomesDetail.length >= 4);

  const outcomes = (worldCupEvent?.outcomesDetail.length ? worldCupEvent.outcomesDetail : STATIC_FEATURED.outcomes)
    .slice(0, 7)
    .map((outcome, index) => ({
      label: outcome.label,
      yes: outcome.yes,
      icon: "icon" in outcome ? outcome.icon : undefined,
      code: "code" in outcome ? outcome.code : NAME_TO_CODE[outcome.label.toLowerCase()],
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

function PolymarketComplianceNotice({ source }: { source: "live" | "sim" }) {
  return (
    <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-100">
          KULT is a signal layer only. Markets, prices, trading, execution, custody, and settlement are provided by Polymarket. KULT never custodies funds or executes trades. No cash value.
        </p>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider ${source === "live" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-amber-400/40 bg-amber-400/10 text-amber-300"}`}>
          {source === "live" ? "Live Polymarket data" : "Fallback preview data"}
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

function shortMatchDate(value: string) {
  const date = value.split(",").pop()?.trim() ?? value;
  const [month, day] = date.split(/\s+/);
  return day && month ? `${day} ${month.slice(0, 3)}` : date;
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

function MatchCard({ match }: { match: Match }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,200,83,0.08),transparent_55%),#0b0d12] p-3.5 transition hover:border-[#2E5CFF]/45">
      <div className="relative mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold text-white">{match.kickoff}</span>
          <span className="shrink-0 font-mono text-[10px] text-white/40">{match.vol} Vol</span>
          <span className="hidden min-w-0 truncate font-mono text-[9px] uppercase tracking-wider text-white/30 sm:inline">· {match.league}</span>
        </div>
        <MatchdayBadge label={shortMatchDate(match.day)} tone="green" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <FlagCircle code={match.home.code} className="h-9 w-9 rounded-lg" />
          <div><p className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/40">Prediction question</p><p className="mt-0.5 font-tech text-sm font-bold text-white">Will {match.home.name} win?</p></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="flex items-center justify-between rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-400/20" title="Opens this market on Polymarket. KULT does not execute or custody."><span>YES signal</span><span>{match.home.price}¢</span></button>
          <button type="button" className="flex items-center justify-between rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-400/20" title="Opens this market on Polymarket. KULT does not execute or custody."><span>NO signal</span><span>{100 - match.home.price}¢</span></button>
        </div>
      </div>

      {/* Agent predictions on the card */}
      <div className="relative mt-3 border-t border-white/10 pt-2.5">
        <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/35"># agent predictions</p>
        <div className="grid grid-cols-2 gap-2">
          {match.agents.map((prediction) => <MarketCardAgentPrediction key={prediction.name} prediction={prediction} />)}
        </div>
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
        <div><p className="font-tech text-[9px] uppercase tracking-[0.2em] text-cyan-300">Market intel</p><p className="mt-1 font-tech text-sm font-bold text-white">Recent trades</p></div>
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

function TopAgentsBoard({ sidebar = false }: { sidebar?: boolean }) {
  return (
    <LeaguePanel fill={false} className={`border-[#2E5CFF]/25 ${sidebar ? "p-4" : "lg:col-span-6"}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Top agents</h3>
          <p className="mt-0.5 text-[11px] text-white/45">This week · ranked by prediction accuracy &amp; ROI</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><TrendingUp className="h-3.5 w-3.5" /> Live standings</span>
      </div>
      <div className="max-h-[238px] overflow-y-auto pr-1 [scrollbar-color:rgba(46,92,255,0.55)_transparent] [scrollbar-width:thin]">
      <div className={`grid grid-cols-2 gap-2 ${sidebar ? "" : "sm:grid-cols-3"}`}>
        {TOP_AGENTS.map((row) => {
          const agent = getLeagueAgent(row.name);
          return (
            <article key={row.name} className="overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(46,92,255,0.12),transparent_55%),#070911] p-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-tech text-[9px] font-black ${row.rank === 1 ? "bg-amber-500/20 text-amber-400" : "bg-white/8 text-white/50"}`}>{row.rank}</span>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
                <p className="min-w-0 truncate font-tech text-[10px] font-bold uppercase text-white">{row.name}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div><p className="font-tech text-[8px] uppercase tracking-wider text-white/35">Accuracy</p><p className="font-tech text-sm font-black text-cyan-300">{row.accuracy}%</p></div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-tech text-[10px] font-bold text-emerald-300">{row.roi}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-[#2E5CFF]" style={{ width: `${row.accuracy}%` }} /></div>
              <p className="mt-2 font-tech text-[8px] uppercase tracking-wider text-white/35">{row.calls} calls · {row.streak}W streak</p>
            </article>
          );
        })}
      </div>
      </div>
    </LeaguePanel>
  );
}

function TodayAgentPredictions() {
  return (
    <LeaguePanel fill={false} className="border-cyan-400/20 lg:col-span-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Today&apos;s agent predictions</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Each agent&apos;s headline call across today&apos;s markets</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><Activity className="h-3.5 w-3.5" /> {TODAY_AGENT_PREDICTIONS.length} live</span>
      </div>
      <div className="max-h-[238px] overflow-y-auto pr-1 [scrollbar-color:rgba(34,211,238,0.55)_transparent] [scrollbar-width:thin]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TODAY_AGENT_PREDICTIONS.map((prediction) => {
          const agent = getLeagueAgent(prediction.name);
          const isYes = prediction.pick === "YES";
          return (
            <article key={prediction.name} className="flex items-center gap-3 overflow-hidden rounded-xl border bg-[#05050a]/60 p-2.5" style={{ borderColor: agent ? `${agent.accentHex}40` : "rgba(255,255,255,0.1)" }}>
              <div className="h-12 w-11 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-tech text-[10px] font-black uppercase text-white">{prediction.name}</p>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase ${isYes ? "bg-cyan-400/15 text-cyan-300" : "bg-fuchsia-400/15 text-fuchsia-300"}`}>{prediction.pick} {prediction.price}¢</span>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-white/55">{prediction.market}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${prediction.confidence}%`, backgroundColor: agent?.accentHex ?? "#22d3ee" }} /></div>
                  <span className="shrink-0 font-tech text-[9px] font-bold" style={{ color: agent?.accentHex ?? "#22d3ee" }}>{prediction.confidence}%</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      </div>
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
                <div className="min-w-0"><p className="font-tech text-[9px] uppercase tracking-wider text-white/50">⚽ {market.category}</p><p className="mt-1 line-clamp-2 font-tech text-[11px] font-bold leading-snug text-white">{market.question}</p></div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-tech text-[11px] font-bold ${priceToneClass(sessionDir)}`}>
                  <PriceArrow dir={sessionDir} /> {market.session >= 0 ? "+" : ""}{market.session}¢
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

function OpenPositions({ markets, onSelect }: { markets: LiveMarket[]; onSelect: (id: string) => void }) {
  const rows = OPEN_POSITIONS.map((position) => {
    const market = markets.find((m) => m.id === position.marketId);
    const liveYes = market?.yes ?? position.entry;
    const current = position.side === "YES" ? liveYes : 100 - liveYes;
    const pnl = ((current - position.entry) * position.shares) / 100;
    return { ...position, current, pnl };
  });
  const totalPnl = rows.reduce((sum, row) => sum + row.pnl, 0);

  return (
    <LeaguePanel fill={false} className="border-amber-400/20 lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Your positions</h3>
          <p className="mt-0.5 text-[11px] text-white/45">{rows.length} open · live mark-to-market</p>
        </div>
        <span className={`font-tech text-[11px] font-bold ${totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)} P&amp;L</span>
      </div>
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
              <tr key={row.marketId} onClick={() => onSelect(row.marketId)} className="cursor-pointer border-t border-white/8 transition hover:bg-white/[0.03]">
                <td className="py-2 pr-3"><p className="font-tech text-[11px] font-bold text-white">{row.label}</p><p className="font-tech text-[8px] uppercase tracking-wider text-white/35">{row.category}</p></td>
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
    </LeaguePanel>
  );
}

function ResolvedMarkets() {
  return (
    <LeaguePanel fill={false} className="border-white/10 lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Resolved markets</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Settled questions and how the agents called them</p>
        </div>
        <span className="font-tech text-[9px] uppercase tracking-wider text-white/35">{RESOLVED_MARKETS.length} settled</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {RESOLVED_MARKETS.map((market) => {
          const agent = getLeagueAgent(market.agent);
          return (
            <article key={market.id} className="flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-[#070911] p-3 opacity-90">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-tech text-[11px] font-bold text-white">{market.question}</p>
                <p className="mt-0.5 font-tech text-[8px] uppercase tracking-wider text-white/35">{market.category} · settled {market.settled}</p>
                <p className="mt-1 font-tech text-[9px] text-white/45">{market.agent} called <span className={market.correct ? "text-emerald-300" : "text-rose-300"}>{market.agentPick}</span></p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full border px-2 py-0.5 font-tech text-[9px] font-bold uppercase ${market.outcome === "YES" ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300"}`}>{market.outcome}</span>
                <span className={`font-tech text-[9px] font-bold ${market.correct ? "text-emerald-300" : "text-rose-300"}`}>{market.correct ? "✓ Hit" : "✗ Miss"}</span>
              </div>
            </article>
          );
        })}
      </div>
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

function MarketCardAgentPrediction({ prediction }: { prediction: (typeof MARKETS)[number]["agents"][number] }) {
  const agent = getLeagueAgent(prediction.name);
  const binaryPick = "outcome" in prediction ? prediction.outcome === "HOME" ? "YES" : "NO" : prediction.pick.toUpperCase() === "YES" ? "YES" : "NO";
  const isPositive = binaryPick === "YES";

  return (
    <div className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 ${isPositive ? "border-cyan-400/15 bg-cyan-400/[0.04]" : "border-fuchsia-400/15 bg-fuchsia-400/[0.04]"}`}>
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
      <div className="min-w-0"><p className="truncate font-tech text-[9px] font-bold uppercase text-white">{prediction.name}</p><p className={`mt-0.5 truncate font-tech text-[9px] font-bold ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>{binaryPick}</p><p className="mt-0.5 text-[10px] font-semibold text-white/65">{prediction.confidence}% confidence</p><p className="mt-1 line-clamp-2 text-[10px] font-medium leading-snug text-white/58">{prediction.reason}</p></div>
    </div>
  );
}

function AgentRivalryQuestion({ rivalry }: { rivalry: (typeof AGENT_RIVALRIES)[number] }) {
  const left = getLeagueAgent(rivalry.left.name);
  const right = getLeagueAgent(rivalry.right.name);

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(46,92,255,0.13),transparent_50%),#070911] p-3 sm:p-4">
      <p className="min-h-10 font-tech text-[11px] font-bold leading-snug text-white">{rivalry.question}</p>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <AgentMarketPrediction agent={left} prediction={rivalry.left} side="left" />
        <span className="font-tech text-[9px] tracking-[0.16em] text-white/30">VS</span>
        <AgentMarketPrediction agent={right} prediction={rivalry.right} side="right" />
      </div>
    </article>
  );
}

function AgentMarketPrediction({
  agent,
  prediction,
  side,
}: {
  agent: ReturnType<typeof getLeagueAgent>;
  prediction: (typeof AGENT_RIVALRIES)[number]["left"];
  side: "left" | "right";
}) {
  const isPositive = prediction.tone === "cyan";

  return (
    <div className={`min-w-0 ${side === "right" ? "text-right" : "text-left"}`}>
      <div className={`flex items-center gap-2 ${side === "right" ? "justify-end" : "justify-start"}`}>
        {side === "right" ? null : <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>}
        <div className="min-w-0"><p className="truncate font-tech text-[9px] font-bold uppercase text-white">{prediction.name}</p><p className={`mt-0.5 truncate font-tech text-[9px] font-bold ${isPositive ? "text-cyan-300" : "text-fuchsia-300"}`}>{prediction.pick}</p><p className="mt-1 text-[9px] text-white/45">{prediction.confidence}% confidence</p></div>
        {side === "right" ? <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div> : null}
      </div>
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

const STATIC_FEATURED = {
  id: "static-wc-winner",
  title: "World Cup Winner",
  category: "World Cup",
  volume: "$3B",
  endsLabel: "Jul 20, 2026",
  outcomes: [
    { label: "France", yes: 19, code: "FRA" as CountryCode },
    { label: "Argentina", yes: 15, code: "ARG" as CountryCode },
    { label: "Spain", yes: 14, code: "ESP" as CountryCode },
    { label: "England", yes: 11, code: "ENG" as CountryCode },
  ],
  comments: [
    { id: "c1", author: "nikitakud77", body: "you think portugal will win this world cup? Spain is actually pretty strong with Lamine Yamal" },
    { id: "c2", author: "casda858", body: "Cristiano Ronaldo's last World Cup as Portugal champions; hoping Portugal will win." },
  ] as PolyComment[],
};

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

  // Resolve display data: real event when available, else the static fallback.
  const usingStatic = !event;
  const title = event?.title ?? STATIC_FEATURED.title;
  const volume = event?.volume ?? STATIC_FEATURED.volume;
  const endsLabel = event?.endsLabel ?? STATIC_FEATURED.endsLabel;
  const headerIcon = event?.icon;

  const outcomes: FeaturedOutcome[] = usingStatic
    ? STATIC_FEATURED.outcomes.map((o, i) => ({
        key: o.label,
        label: o.label,
        yes: o.yes,
        color: OUTCOME_COLORS[i % OUTCOME_COLORS.length],
        code: o.code,
        history: synthSeries(o.yes),
      }))
    : event!.outcomesDetail.slice(0, 5).map((o, i) => ({
        key: o.tokenId ?? o.label,
        label: o.label,
        yes: o.yes,
        color: OUTCOME_COLORS[i % OUTCOME_COLORS.length],
        icon: o.icon,
        code: NAME_TO_CODE[o.label.toLowerCase()],
        history: (o.tokenId && histories[o.tokenId]) || synthSeries(o.yes),
      }));

  const displayComments = comments.length > 0 ? comments : usingStatic ? STATIC_FEATURED.comments : [];
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
  const tabs: { id: BoardView; label: string; desc: string; Icon: typeof Activity; meta: string }[] = [
    { id: "market", label: "Live Market", desc: "Markets, odds & live prices", Icon: BarChart3, meta: "Live" },
    { id: "pulse", label: "Match Pulse", desc: "Upcoming matches & football news", Icon: Radio, meta: `${marketCount} fixtures` },
    { id: "analysis", label: "Analysis", desc: "Agent reads, news & trending movers", Icon: Brain, meta: `${newsCount} signals` },
  ];

  return (
    <div className="relative flex items-stretch gap-1 overflow-hidden rounded-xl border border-white/10 bg-[#070911]/80 p-1 backdrop-blur">
      {tabs.map(({ id, label, desc, Icon, meta }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            title={desc}
            onClick={() => onChange(id)}
            className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg px-2.5 py-2.5 transition ${active ? "bg-[linear-gradient(120deg,rgba(46,92,255,0.22),rgba(0,200,83,0.08))] text-white shadow-[inset_0_0_0_1px_rgba(46,92,255,0.45)]" : "text-white/55 hover:bg-white/[0.04] hover:text-white"}`}
          >
            <Icon className={`h-4 w-4 shrink-0 transition ${active ? "text-[#9ab1ff]" : "text-white/45 group-hover:text-white/80"}`} />
            <span className="truncate font-tech text-[12px] font-bold tracking-tight sm:text-[13px]">{label}</span>
            <span className={`hidden shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider sm:inline-flex ${active ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.06] text-white/40"}`}>
              {active ? <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" /> : null}{meta}
            </span>
            {active ? <span className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#2E5CFF] to-transparent" /> : null}
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
            <span className="rounded-sm border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-tech text-[8px] uppercase tracking-wider text-white/45">{market.category}</span>
          </div>
          <p className="mt-2 max-w-md font-tech text-sm font-bold leading-snug text-white sm:text-base">{market.question}</p>
        </div>
        <div className="text-right">
          <p className="font-tech text-3xl font-black leading-none text-white sm:text-4xl">{market.yes}<span className="text-lg text-white/40">%</span></p>
          <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-tech text-[10px] font-bold ${priceToneClass(sessionDir)}`}>
            <PriceArrow dir={sessionDir} /> {market.session >= 0 ? "+" : ""}{market.session}¢ session
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
          {group.standings.map((row) => {
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
        <div className="space-y-2">
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
        <div className="space-y-2">
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
        <AgentWinRateCard />
      </div>

      <div className="space-y-3 lg:col-span-7">
        <AgentNewsReactions />
        <TopAgentsBoard sidebar={false} />
        <RecentTradesFeed trades={trades} />
        <ResolvedMarkets />
      </div>
      <div className="lg:col-span-5">
        <NewsFeed title="News driving the board" subtitle="What's moving prices right now" />
      </div>

      <OpenPositions markets={markets} onSelect={onSelect} />
    </div>
  );
}

function AgentWinRateCard() {
  const total = RESOLVED_MARKETS.length;
  const wins = RESOLVED_MARKETS.filter((m) => m.correct).length;
  const losses = total - wins;
  const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const RADIUS = 30;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - rate / 100);

  return (
    <LeaguePanel fill={false} className="overflow-hidden border-cyan-400/20 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.14),transparent_45%),#070911] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div><p className="font-tech text-[9px] uppercase tracking-[0.2em] text-cyan-300">Agent accuracy</p><p className="mt-0.5 font-tech text-sm font-bold text-white">Win rate</p></div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-emerald-300"><TrendingUp className="h-3.5 w-3.5" /> +5% wk</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative grid h-[60px] w-[60px] shrink-0 place-items-center">
          <svg className="h-[60px] w-[60px] -rotate-90" viewBox="0 0 72 72" aria-label={`${rate}% win rate`}>
            <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="7" />
            <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="url(#pm-win-rate)" strokeWidth="7" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset} />
            <defs>
              <linearGradient id="pm-win-rate" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#22d3ee" />
                <stop offset="1" stopColor="#2E5CFF" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute font-tech text-base font-black text-white">{rate}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-white/50">{wins} hits · {losses} {losses === 1 ? "miss" : "misses"} settled</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {RESOLVED_MARKETS.map((m) => (
              <span key={m.id} className={`flex h-4 w-4 items-center justify-center rounded font-tech text-[8px] font-black ${m.correct ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>{m.correct ? "W" : "L"}</span>
            ))}
          </div>
        </div>
      </div>
    </LeaguePanel>
  );
}

function AgentNewsReactions() {
  return (
    <LeaguePanel fill={false} className="border-[#2E5CFF]/25 bg-[radial-gradient(circle_at_0%_0%,rgba(46,92,255,0.1),transparent_45%),#070911] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#9ab1ff]" />
          <div><h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white">Agent reactions to news</h3><p className="mt-0.5 text-[10px] text-white/45">How each agent re-reads the market as facts land</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><Flame className="h-3.5 w-3.5" /> {MATCH_NEWS.length} live reads</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MATCH_NEWS.map((item) => {
          const agent = getLeagueAgent(item.agent);
          const up = item.impact === "up";
          return (
            <article key={item.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="h-11 w-10 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-tech text-[10px] font-black uppercase text-white">{item.agent}</p>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-tech text-[8px] font-bold ${up ? "bg-emerald-400/15 text-emerald-300" : item.impact === "down" ? "bg-rose-400/15 text-rose-300" : "bg-cyan-400/15 text-cyan-300"}`}>
                    {up ? <ArrowUp className="h-2.5 w-2.5" /> : item.impact === "down" ? <ArrowDown className="h-2.5 w-2.5" /> : null} {item.move}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/55">{item.title}</p>
                <p className="mt-1 truncate font-mono text-[9px] text-white/35">re: {item.market}</p>
              </div>
            </article>
          );
        })}
      </div>
    </LeaguePanel>
  );
}
