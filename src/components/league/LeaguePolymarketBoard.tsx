import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowUp, BookOpen, ChevronRight, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
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

type LiveMarket = (typeof MARKETS)[number] & { dir: "up" | "down" | "flat"; delta: number; session: number };

type MarketTrade = { id: number; addr: string; side: "YES" | "NO"; price: number; size: number; label: string };

function makeTrade(id: number): MarketTrade {
  const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
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

/** Drives simulated live price movement + a streaming recent-trades feed. */
function useLiveMarketData() {
  const [prices, setPrices] = useState<Record<string, { yes: number; dir: "up" | "down" | "flat"; delta: number; session: number }>>(() =>
    Object.fromEntries(MARKETS.map((market) => [market.id, { yes: market.yes, dir: "flat" as const, delta: 0, session: 0 }])),
  );
  const [trades, setTrades] = useState<MarketTrade[]>(() => Array.from({ length: 7 }, (_, index) => makeTrade(index)));
  const seq = useRef(1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        for (const market of MARKETS) {
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
        return next;
      });
      setTrades((prev) => {
        const count = Math.random() < 0.4 ? 2 : 1;
        const fresh = Array.from({ length: count }, () => {
          seq.current += 1;
          return makeTrade(seq.current);
        });
        return [...fresh, ...prev].slice(0, 14);
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return { prices, trades };
}

export function LeaguePolymarketBoard() {
  const [token, setToken] = useState<"USDC" | "USDT">("USDC");
  const [selectedMarketId, setSelectedMarketId] = useState<string>(MARKETS[0].id);
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [category, setCategory] = useState<(typeof MARKET_CATEGORIES)[number]>("All");
  const [reviewing, setReviewing] = useState(false);
  const { prices, trades } = useLiveMarketData();

  const liveMarkets: LiveMarket[] = MARKETS.map((market) => {
    const live = prices[market.id];
    return { ...market, yes: live?.yes ?? market.yes, dir: live?.dir ?? "flat", delta: live?.delta ?? 0, session: live?.session ?? 0 };
  });

  const selectedMarket = liveMarkets.find((market) => market.id === selectedMarketId) ?? liveMarkets[0];
  const visibleMatches = category === "All" ? MATCHES : MATCHES.filter((match) => match.category === category);
  const selectedPrice = side === "YES" ? selectedMarket.yes : 100 - selectedMarket.yes;
  const leadingSignal = selectedMarket.agents[0];
  const contrarianSignal = selectedMarket.agents[1];
  const leadingAgent = getLeagueAgent(leadingSignal.name);
  const contrarianAgent = getLeagueAgent(contrarianSignal.name);

  const categoryCount = (value: (typeof MARKET_CATEGORIES)[number]) =>
    value === "All" ? MATCHES.length : MATCHES.filter((match) => match.category === value).length;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12">
      <section className="overflow-hidden rounded-xl border border-[#2E5CFF]/35 bg-[radial-gradient(circle_at_10%_0%,rgba(46,92,255,0.2),transparent_36%),linear-gradient(120deg,#100922,#060812)] p-4 sm:p-5 lg:col-span-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <PolymarketLogo className="h-5 w-auto text-[#2E5CFF] sm:h-6" />
              <span className="rounded-sm border border-[#2E5CFF]/40 bg-[#2E5CFF]/10 px-1.5 py-0.5 font-tech text-[8px] uppercase tracking-[0.18em] text-[#7d97ff]">football</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-300">$ polymarket --live · fifa world cup 2026</span>
            </div>
            <h2 className="mt-2 font-mono text-xl font-black uppercase tracking-tight text-white sm:text-2xl">Football prediction markets</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">Trade the World Cup, Champions League and transfer window. The same agents that earn trust in League read every match and recommend a side — you approve every trade; no wallet or settlement is active.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[220px]">
            {(["USDC", "USDT"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setToken(value)}
                className={`rounded-lg border px-3 py-2.5 font-tech text-xs font-bold transition ${token === value ? "border-[#2E5CFF]/50 bg-[#2E5CFF]/15 text-[#d6e0ff]" : "border-white/10 bg-black/20 text-white/45 hover:text-white"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <MarketMetric label="Volume" value="$1.34M" detail={`Across ${MATCHES.length} live matches`} />
          <MarketMetric label="Agent consensus" value={`${leadingSignal.confidence}% ${side === "YES" ? "YES" : "lean"}`} detail={`${leadingSignal.name} leads the call`} tone="cyan" />
          <MarketMetric label="Traders" value="8,412" detail={`+${trades.length} positions streaming`} tone="cyan" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {MARKET_CATEGORIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider transition ${category === value ? "border-[#2E5CFF]/60 bg-[#2E5CFF] text-white shadow-[0_0_18px_rgba(46,92,255,0.4)]" : "border-white/10 bg-black/20 text-white/50 hover:border-[#2E5CFF]/40 hover:text-white"}`}
            >
              {value}
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${category === value ? "bg-black/25 text-white" : "bg-white/[0.06] text-cyan-300"}`}>{categoryCount(value)}</span>
            </button>
          ))}
          <span className="ml-1 font-tech text-[9px] uppercase tracking-wider text-white/35">
            {visibleMatches.length}/{MATCHES.length} matches
          </span>
        </div>
      </section>

      <TopAgentsBoard />
      <TodayAgentPredictions />

      <LeaguePanel fill={false} className="border-[#2E5CFF]/25 lg:col-span-12">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Agent rivalry markets</h3><p className="mt-0.5 text-[11px] text-white/45">Opposing agents make their calls on every prediction question</p></div><span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><TrendingUp className="h-3.5 w-3.5" /> Consensus moving</span></div>
        <div className="grid gap-3 lg:grid-cols-3">
          {AGENT_RIVALRIES.map((rivalry) => <AgentRivalryQuestion key={rivalry.id} rivalry={rivalry} />)}
        </div>
      </LeaguePanel>

      <div className="grid grid-cols-1 items-start gap-3 lg:col-span-12 lg:grid-cols-12">
      <div className="min-w-0 space-y-3 lg:col-span-8">
        {visibleMatches.map((match) => <MatchCard key={match.id} match={match} />)}
        {visibleMatches.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center font-tech text-[11px] uppercase tracking-wider text-white/40">No matches in this category yet</div>
        ) : null}
      </div>

      <div className="flex h-fit flex-col gap-3 lg:col-span-4 lg:sticky lg:top-4">
      <TrendingMovers markets={liveMarkets} onSelect={setSelectedMarketId} />
      <LeaguePanel fill={false} className="border-[#2E5CFF]/30 bg-[#0b0815] p-4 sm:p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7d97ff]">$ position</p>
        <p className="mt-2 font-tech text-sm font-bold text-white">{selectedMarket.question}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["YES", "NO"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setSide(value)} className={`rounded-lg border px-3 py-2.5 font-tech text-xs font-bold ${side === value ? value === "YES" ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300" : "border-rose-400/50 bg-rose-400/15 text-rose-300" : "border-white/10 bg-black/20 text-white/45"}`}>{value}</button>
          ))}
        </div>
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-black/25 p-3 text-[11px] text-white/50">
          <div className="flex items-center justify-between"><span>Payment token</span><span className="font-tech font-bold text-white">{token}</span></div>
          <div className="flex items-center justify-between"><span>Price</span><span className={`inline-flex items-center gap-1 font-tech font-bold ${priceToneClass(selectedMarket.dir)}`}><PriceArrow dir={selectedMarket.dir} /> {side} {selectedPrice}¢</span></div>
          <div className="flex items-center justify-between"><span>Available balance</span><span className="font-tech font-bold text-white">1,250.00 {token}</span></div>
        </div>
        <div className="mt-4 rounded-xl border border-[#2E5CFF]/25 bg-[radial-gradient(circle_at_0%_0%,rgba(46,92,255,0.16),transparent_55%),rgba(5,7,14,0.55)] p-3">
          <div className="flex items-center justify-between gap-2"><span className="font-tech text-[9px] uppercase tracking-[0.18em] text-[#7d97ff]">Agent edge</span><span className="font-tech text-[9px] text-cyan-300">{leadingSignal.confidence}% consensus</span></div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <AgentEdgeSignal agent={leadingAgent} signal={leadingSignal} positive />
            <span className="font-tech text-[9px] tracking-[0.15em] text-white/30">VS</span>
            <AgentEdgeSignal agent={contrarianAgent} signal={contrarianSignal} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-[#2E5CFF] transition-[width] duration-500" style={{ width: `${leadingSignal.confidence}%` }} /></div>
          <p className="mt-2 text-[10px] leading-relaxed text-white/45">Leading call: <span className="font-tech font-bold text-cyan-300">{leadingSignal.pick}</span></p>
        </div>
        <button type="button" onClick={() => setReviewing((value) => !value)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2E5CFF]/35 bg-[#2E5CFF]/10 px-3 py-3 font-tech text-[10px] font-bold uppercase tracking-wider text-[#d6e0ff] transition hover:bg-[#2E5CFF]/20">{reviewing ? "Close recommendation" : "Review agent recommendation"} <ChevronRight className="h-3.5 w-3.5" /></button>
        {reviewing ? <TradeReview agent={leadingSignal.name} market={selectedMarket.question} side={side} price={selectedPrice} token={token} /> : null}
      </LeaguePanel>
      <RecentTradesFeed trades={trades} />
      <LeaguePanel fill={false} className="border-amber-400/20 bg-[radial-gradient(circle_at_0%_100%,rgba(251,191,36,0.11),transparent_52%),#0a0b12] p-4">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-[#7d97ff]" /><p className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">Portfolio</p></div><span className="font-tech text-[10px] font-bold text-cyan-300">+$86.40</span></div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-white/50"><span>Open positions</span><span className="font-tech font-bold text-white">3 markets</span></div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/50"><span>Potential return</span><span className="font-tech font-bold text-amber-300">$214.00</span></div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#2E5CFF] to-cyan-400" /></div>
      </LeaguePanel>
      </div>
      </div>

      <OpenPositions markets={liveMarkets} onSelect={setSelectedMarketId} />

      <p className="lg:col-span-12 text-center font-mono text-[9px] uppercase tracking-widest text-white/30">// polymarket-style demo · football markets · no stablecoin transactions are enabled</p>
    </div>
  );
}

function TradeReview({ agent, market, side, price, token }: { agent: string; market: string; side: "YES" | "NO"; price: number; token: "USDC" | "USDT" }) {
  return (
    <div className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.07] p-3">
      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /><p className="font-tech text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-200">Your approval is required</p></div>
      <p className="mt-2 text-[10px] leading-relaxed text-white/60"><span className="font-tech font-bold text-white">{agent}</span> recommends <span className="font-tech font-bold text-cyan-300">{side} at {price}¢</span> on {market}. If trading is enabled, you will see stake, fees, and final execution details before approving.</p>
      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 font-tech text-[9px] text-white/45"><span>Proposed payment</span><span className="font-bold text-white">{token} · demo only</span></div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-[#2E5CFF]/40 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold text-white">{match.kickoff}</span>
          <span className="font-mono text-[10px] text-white/40">{match.vol} Vol</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-wider text-white/30 sm:inline">· {match.league}</span>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/40"><BookOpen className="h-3.5 w-3.5" /></span>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="flex items-center gap-2.5">
          <FlagCircle code={match.home.code} className="h-10 w-10 rounded-lg" />
          <div><p className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/40">Prediction question</p><p className="mt-0.5 font-tech text-sm font-bold text-white">{match.league}</p></div>
        </div>
        <div className="mt-4 space-y-2.5">
          <BinaryOutcomeRow label={match.home.name} price={match.home.price} />
          <BinaryOutcomeRow label={match.away.name} price={match.away.price} />
        </div>
        <p className="mt-4 font-mono text-[10px] text-white/35">{match.vol} volume</p>
      </div>

      {/* Agent predictions on the card */}
      <div className="mt-4 rounded-lg border border-white/8 bg-black/20 p-2.5">
        <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.18em] text-white/35"># agent predictions</p>
        <div className="grid grid-cols-2 gap-2">
          {match.agents.map((prediction) => <MarketCardAgentPrediction key={prediction.name} prediction={prediction} />)}
        </div>
      </div>
    </article>
  );
}

function BinaryOutcomeRow({ label, price }: { label: string; price: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2">
      <span className="truncate text-sm font-medium text-white/85">{label}</span>
      <span className="font-tech text-lg font-bold text-white/85">{price}%</span>
      <button type="button" className="rounded-md bg-emerald-400/15 px-3 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/25">Yes</button>
      <button type="button" className="rounded-md bg-rose-400/15 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-400/25">No</button>
    </div>
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
      <div className="mt-3 max-h-[228px] space-y-1.5 overflow-hidden">
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

function TopAgentsBoard() {
  return (
    <LeaguePanel fill={false} className="border-[#2E5CFF]/25 lg:col-span-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Top agents</h3>
          <p className="mt-0.5 text-[11px] text-white/45">This week · ranked by prediction accuracy &amp; ROI</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><TrendingUp className="h-3.5 w-3.5" /> Live standings</span>
      </div>
      <div className="max-h-[238px] overflow-y-auto pr-1 [scrollbar-color:rgba(46,92,255,0.55)_transparent] [scrollbar-width:thin]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
    <LeaguePanel fill={false} className="border-cyan-400/20 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white">Trending movers</h3>
          <p className="mt-0.5 text-[10px] text-white/45">Biggest price swings</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><TrendingUp className="h-3.5 w-3.5" /> Live</span>
      </div>
      <div className="max-h-[174px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(34,211,238,0.55)_transparent] [scrollbar-width:thin]">
        {movers.map((market) => {
          const sessionDir = market.session > 0 ? "up" : market.session < 0 ? "down" : "flat";
          return (
            <button key={market.id} type="button" onClick={() => onSelect(market.id)} className="w-full overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.1),transparent_55%),#070911] p-2.5 text-left transition hover:border-cyan-400/40">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><p className="font-tech text-[8px] uppercase tracking-wider text-white/35">{market.category}</p><p className="mt-1 line-clamp-2 font-tech text-[10px] font-bold leading-snug text-white">{market.question}</p></div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-tech text-[10px] font-bold ${priceToneClass(sessionDir)}`}>
                  <PriceArrow dir={sessionDir} /> {market.session >= 0 ? "+" : ""}{market.session}¢
                </span>
              </div>
              <span className="mt-1.5 block font-tech text-sm font-black text-white">YES {market.yes}¢</span>
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
      <div className="min-w-0"><p className="truncate font-tech text-[9px] font-bold uppercase text-white">{prediction.name}</p><p className={`mt-0.5 truncate font-tech text-[9px] font-bold ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>{binaryPick}</p><p className="mt-0.5 text-[8px] text-white/40">{prediction.confidence}% confidence</p><p className="mt-1 line-clamp-2 text-[8px] leading-snug text-white/35">{prediction.reason}</p></div>
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
