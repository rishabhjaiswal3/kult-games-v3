import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowUp, ChevronDown, ChevronRight, Star, TrendingUp, Wallet } from "lucide-react";
import { getLeagueAgent } from "@/constants/leagueAgents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";

const MARKETS = [
  {
    id: "wc-final", question: "Will Brazil win the World Cup final?", category: "Sports", short: "BRA cup", closes: "2d", yes: 64, volume: "$48.2K",
    agents: [{ name: "HYBRID", pick: "Yes", confidence: 64, tone: "cyan", reason: "Squad depth peaks at the right time." }, { name: "ASSASSIN", pick: "No", confidence: 71, tone: "purple", reason: "Knockout variance favors the field." }],
  },
  {
    id: "nba-playoffs", question: "Will the Lakers make the playoffs?", category: "Sports", short: "LAL PO", closes: "5d", yes: 58, volume: "$12.7K",
    agents: [{ name: "DEFENDER", pick: "Yes", confidence: 58, tone: "cyan", reason: "Easier closing schedule helps." }, { name: "TACTICIAN", pick: "No", confidence: 62, tone: "purple", reason: "Injuries thin the rotation." }],
  },
  {
    id: "btc-100k", question: "Will BTC close above $100K this month?", category: "Crypto", short: "BTC 100K", closes: "3d", yes: 73, volume: "$92.4K",
    agents: [{ name: "TACTICIAN", pick: "Yes", confidence: 73, tone: "cyan", reason: "ETF inflows keep momentum up." }, { name: "HYBRID", pick: "No", confidence: 55, tone: "purple", reason: "Resistance band still caps price." }],
  },
  {
    id: "eth-ratio", question: "Will the ETH/BTC ratio rise this quarter?", category: "Crypto", short: "ETH/BTC", closes: "11d", yes: 56, volume: "$33.1K",
    agents: [{ name: "BERSERKER", pick: "Yes", confidence: 61, tone: "cyan", reason: "Rotation into alts is starting." }, { name: "SUPPORT", pick: "No", confidence: 64, tone: "purple", reason: "BTC dominance stays sticky." }],
  },
  {
    id: "fusion", question: "Will a fusion net-energy milestone be announced this year?", category: "Science", short: "Fusion", closes: "30d", yes: 41, volume: "$8.9K",
    agents: [{ name: "SUPPORT", pick: "Yes", confidence: 52, tone: "cyan", reason: "Several labs near a breakthrough." }, { name: "DEFENDER", pick: "No", confidence: 74, tone: "purple", reason: "Scaling timelines slip again." }],
  },
  {
    id: "starship", question: "Will Starship reach orbit this year?", category: "Science", short: "Starship", closes: "18d", yes: 69, volume: "$21.5K",
    agents: [{ name: "HYBRID", pick: "Yes", confidence: 69, tone: "cyan", reason: "Test cadence is accelerating." }, { name: "ASSASSIN", pick: "No", confidence: 58, tone: "purple", reason: "Regulatory holds add delay risk." }],
  },
  {
    id: "turnout", question: "Will voter turnout exceed 60% next election?", category: "Politics", short: "Turnout", closes: "21d", yes: 66, volume: "$15.3K",
    agents: [{ name: "DEFENDER", pick: "Yes", confidence: 66, tone: "cyan", reason: "High-salience race drives voters." }, { name: "TACTICIAN", pick: "No", confidence: 57, tone: "purple", reason: "Turnout historically overestimated." }],
  },
  {
    id: "summit", question: "Will the climate summit reach a binding deal?", category: "Politics", short: "Summit", closes: "9d", yes: 44, volume: "$6.2K",
    agents: [{ name: "ASSASSIN", pick: "Yes", confidence: 48, tone: "cyan", reason: "Momentum building among majors." }, { name: "SUPPORT", pick: "No", confidence: 70, tone: "purple", reason: "Veto blocs rarely concede." }],
  },
  {
    id: "rate-cut", question: "Will the Fed cut rates at the next meeting?", category: "Economics", short: "Rate cut", closes: "6d", yes: 62, volume: "$57.8K",
    agents: [{ name: "TACTICIAN", pick: "Yes", confidence: 62, tone: "cyan", reason: "Cooling data opens the door." }, { name: "BERSERKER", pick: "No", confidence: 59, tone: "purple", reason: "Inflation stays above target." }],
  },
  {
    id: "box-office", question: "Will the summer blockbuster top $1B box office?", category: "Pop Culture", short: "Box $1B", closes: "27d", yes: 67, volume: "$14.0K",
    agents: [{ name: "HYBRID", pick: "Yes", confidence: 67, tone: "cyan", reason: "Strong pre-sales and franchise pull." }, { name: "DEFENDER", pick: "No", confidence: 54, tone: "purple", reason: "Crowded slate splits attention." }],
  },
];

const MARKET_CATEGORIES = ["All", "Sports", "Crypto", "Science", "Politics", "Economics", "Pop Culture"] as const;

const AGENT_RIVALRIES = [
  {
    id: "wc-final",
    question: "Will Brazil win the World Cup final?",
    left: { name: "HYBRID", pick: "Yes", confidence: 64, tone: "cyan" },
    right: { name: "ASSASSIN", pick: "No", confidence: 71, tone: "purple" },
  },
  {
    id: "btc-100k",
    question: "Will BTC close above $100K this month?",
    left: { name: "TACTICIAN", pick: "Yes", confidence: 73, tone: "cyan" },
    right: { name: "HYBRID", pick: "No", confidence: 55, tone: "purple" },
  },
  {
    id: "rate-cut",
    question: "Will the Fed cut rates at the next meeting?",
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
  { name: "HYBRID", market: "BTC > $100K this month", category: "Crypto", pick: "YES", confidence: 73, price: 73 },
  { name: "TACTICIAN", market: "Fed cuts rates next meeting", category: "Economics", pick: "YES", confidence: 62, price: 62 },
  { name: "DEFENDER", market: "Voter turnout exceeds 60%", category: "Politics", pick: "YES", confidence: 66, price: 66 },
  { name: "ASSASSIN", market: "Brazil wins the World Cup", category: "Sports", pick: "NO", confidence: 71, price: 36 },
  { name: "SUPPORT", market: "Climate summit binding deal", category: "Politics", pick: "NO", confidence: 70, price: 56 },
  { name: "BERSERKER", market: "ETH/BTC ratio rises this quarter", category: "Crypto", pick: "YES", confidence: 61, price: 56 },
];

const OPEN_POSITIONS = [
  { marketId: "btc-100k", label: "BTC > $100K this month", category: "Crypto", side: "YES" as const, entry: 64, shares: 120 },
  { marketId: "rate-cut", label: "Fed cuts rates next meeting", category: "Economics", side: "YES" as const, entry: 55, shares: 80 },
  { marketId: "wc-final", label: "Brazil wins the World Cup", category: "Sports", side: "NO" as const, entry: 33, shares: 150 },
];

const RESOLVED_MARKETS = [
  { id: "r1", question: "Did BTC close above $90K last month?", category: "Crypto", outcome: "YES" as const, settled: "3d ago", agent: "TACTICIAN", agentPick: "YES", correct: true },
  { id: "r2", question: "Did the Fed hold rates at the last meeting?", category: "Economics", outcome: "YES" as const, settled: "6d ago", agent: "BERSERKER", agentPick: "YES", correct: true },
  { id: "r3", question: "Did Argentina win the Copa final?", category: "Sports", outcome: "NO" as const, settled: "8d ago", agent: "ASSASSIN", agentPick: "YES", correct: false },
  { id: "r4", question: "Did Starship complete its last test flight?", category: "Science", outcome: "YES" as const, settled: "12d ago", agent: "HYBRID", agentPick: "YES", correct: true },
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
  const [watching, setWatching] = useState(false);
  const { prices, trades } = useLiveMarketData();

  const liveMarkets: LiveMarket[] = MARKETS.map((market) => {
    const live = prices[market.id];
    return { ...market, yes: live?.yes ?? market.yes, dir: live?.dir ?? "flat", delta: live?.delta ?? 0, session: live?.session ?? 0 };
  });

  const selectedMarket = liveMarkets.find((market) => market.id === selectedMarketId) ?? liveMarkets[0];
  const visibleMarkets = category === "All" ? liveMarkets : liveMarkets.filter((market) => market.category === category);
  const selectedPrice = side === "YES" ? selectedMarket.yes : 100 - selectedMarket.yes;
  const leadingSignal = selectedMarket.agents[0];
  const contrarianSignal = selectedMarket.agents[1];
  const leadingAgent = getLeagueAgent(leadingSignal.name);
  const contrarianAgent = getLeagueAgent(contrarianSignal.name);

  const categoryCount = (value: (typeof MARKET_CATEGORIES)[number]) =>
    value === "All" ? MARKETS.length : MARKETS.filter((market) => market.category === value).length;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12">
      <section className="overflow-hidden rounded-xl border border-[#a855f7]/35 bg-[radial-gradient(circle_at_10%_0%,rgba(168,85,247,0.2),transparent_36%),linear-gradient(120deg,#100922,#060812)] p-4 sm:p-5 lg:col-span-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              <span className="font-tech text-[9px] uppercase tracking-[0.22em] text-cyan-300">Polymarket · live ticks</span>
            </div>
            <h2 className="mt-2 font-tech text-xl font-black uppercase tracking-tight text-white sm:text-2xl">Prediction markets</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">Explore market odds alongside your agents&apos; predictions across sports, crypto, science and more. No wallet, token approval, order, or settlement is active.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[220px]">
            {(["USDC", "USDT"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setToken(value)}
                className={`rounded-lg border px-3 py-2.5 font-tech text-xs font-bold transition ${token === value ? "border-[#a855f7]/50 bg-[#a855f7]/15 text-[#e9d5ff]" : "border-white/10 bg-black/20 text-white/45 hover:text-white"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <MarketMetric label="Volume" value="$310.1K" detail={`Across ${MARKETS.length} live markets`} />
          <MarketMetric label="Agent consensus" value={`${leadingSignal.confidence}% ${side === "YES" ? "YES" : "lean"}`} detail={`${leadingSignal.name} leads the call`} tone="cyan" />
          <MarketMetric label="Traders" value="1,284" detail={`+${trades.length} positions streaming`} tone="cyan" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-[#a855f7]/40 bg-[#a855f7]/12 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-[#e9d5ff] transition hover:bg-[#a855f7]/20"
              >
                <span className="text-white/40">Category</span>
                {category}
                <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[9px] text-cyan-300">{categoryCount(category)}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[15rem]">
              <DropdownMenuLabel className="font-tech text-[9px] uppercase tracking-[0.2em] text-white/40">Filter markets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MARKET_CATEGORIES.map((value) => (
                <DropdownMenuItem
                  key={value}
                  onSelect={() => setCategory(value)}
                  className={`font-tech text-xs ${category === value ? "bg-[#a855f7]/15 text-[#e9d5ff]" : "text-white/70"}`}
                >
                  <span>{value}</span>
                  <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-cyan-300">{categoryCount(value)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="font-tech text-[9px] uppercase tracking-wider text-white/35">
            Showing {visibleMarkets.length} of {MARKETS.length} markets
          </span>
        </div>
      </section>

      <SelectedMarketPulse market={selectedMarket} watching={watching} onToggleWatch={() => setWatching((value) => !value)} />

      <TopAgentsBoard />
      <TodayAgentPredictions />
      <TrendingMovers markets={liveMarkets} onSelect={setSelectedMarketId} />

      <LeaguePanel fill={false} className="border-[#a855f7]/25 lg:col-span-12">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Agent rivalry markets</h3><p className="mt-0.5 text-[11px] text-white/45">Opposing agents make their calls on every prediction question</p></div><span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><TrendingUp className="h-3.5 w-3.5" /> Consensus moving</span></div>
        <div className="grid gap-3 lg:grid-cols-3">
          {AGENT_RIVALRIES.map((rivalry) => <AgentRivalryQuestion key={rivalry.id} rivalry={rivalry} />)}
        </div>
      </LeaguePanel>

      <div className="min-w-0 space-y-3 lg:col-span-8">
        {visibleMarkets.map((market) => (
          <button
            key={market.id}
            type="button"
            onClick={() => setSelectedMarketId(market.id)}
            className={`w-full rounded-xl border p-4 text-left transition sm:p-5 ${selectedMarketId === market.id ? "border-cyan-400/55 bg-cyan-400/[0.08] shadow-[0_0_28px_rgba(34,211,238,0.1)]" : "border-white/10 bg-white/[0.025] hover:border-[#a855f7]/40 hover:bg-white/[0.05]"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-tech text-sm font-bold text-white sm:text-base">{market.question}</p><p className="mt-1 font-tech text-[9px] uppercase tracking-wider text-white/40">{market.category} · closes in {market.closes} · {market.volume} volume</p></div>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-tech text-[10px] font-bold transition-colors ${priceToneClass(market.dir)}`}>
                <PriceArrow dir={market.dir} /> YES {market.yes}¢
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-white/8 bg-black/20 p-2.5">
              <p className="mb-2 font-tech text-[8px] uppercase tracking-[0.18em] text-white/35">Agent predictions</p>
              <div className="grid grid-cols-2 gap-2">
                {market.agents.map((prediction) => <MarketCardAgentPrediction key={prediction.name} prediction={prediction} />)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-center font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-200">Yes {market.yes}¢</span>
              <span className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-2 text-center font-tech text-[10px] font-bold uppercase tracking-wider text-fuchsia-200">No {100 - market.yes}¢</span>
            </div>
          </button>
        ))}
        {visibleMarkets.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center font-tech text-[11px] uppercase tracking-wider text-white/40">No markets in this category yet</div>
        ) : null}
      </div>

      <div className="flex h-fit flex-col gap-3 lg:col-span-4 lg:sticky lg:top-4">
      <LeaguePanel fill={false} className="border-[#a855f7]/30 bg-[#0b0815] p-4 sm:p-5">
        <p className="font-tech text-[9px] uppercase tracking-[0.2em] text-cyan-300">Position</p>
        <p className="mt-2 font-tech text-sm font-bold text-white">{selectedMarket.question}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["YES", "NO"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setSide(value)} className={`rounded-lg border px-3 py-2.5 font-tech text-xs font-bold ${side === value ? value === "YES" ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-200" : "border-fuchsia-400/50 bg-fuchsia-400/15 text-fuchsia-200" : "border-white/10 bg-black/20 text-white/45"}`}>{value}</button>
          ))}
        </div>
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-black/25 p-3 text-[11px] text-white/50">
          <div className="flex items-center justify-between"><span>Payment token</span><span className="font-tech font-bold text-white">{token}</span></div>
          <div className="flex items-center justify-between"><span>Price</span><span className={`inline-flex items-center gap-1 font-tech font-bold ${priceToneClass(selectedMarket.dir)}`}><PriceArrow dir={selectedMarket.dir} /> {side} {selectedPrice}¢</span></div>
          <div className="flex items-center justify-between"><span>Available balance</span><span className="font-tech font-bold text-white">1,250.00 {token}</span></div>
        </div>
        <div className="mt-4 rounded-xl border border-[#a855f7]/25 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.16),transparent_55%),rgba(5,7,14,0.55)] p-3">
          <div className="flex items-center justify-between gap-2"><span className="font-tech text-[9px] uppercase tracking-[0.18em] text-[#c084fc]">Agent edge</span><span className="font-tech text-[9px] text-cyan-300">{leadingSignal.confidence}% consensus</span></div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <AgentEdgeSignal agent={leadingAgent} signal={leadingSignal} positive />
            <span className="font-tech text-[9px] tracking-[0.15em] text-white/30">VS</span>
            <AgentEdgeSignal agent={contrarianAgent} signal={contrarianSignal} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-[#a855f7] transition-[width] duration-500" style={{ width: `${leadingSignal.confidence}%` }} /></div>
          <p className="mt-2 text-[10px] leading-relaxed text-white/45">Leading call: <span className="font-tech font-bold text-cyan-300">{leadingSignal.pick}</span></p>
        </div>
        <button type="button" disabled className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#a855f7]/35 bg-[#a855f7]/10 px-3 py-3 font-tech text-[10px] font-bold uppercase tracking-wider text-[#e9d5ff]/55">Preview only <ChevronRight className="h-3.5 w-3.5" /></button>
      </LeaguePanel>
      <RecentTradesFeed trades={trades} />
      <LeaguePanel fill={false} className="border-amber-400/20 bg-[radial-gradient(circle_at_0%_100%,rgba(251,191,36,0.11),transparent_52%),#0a0b12] p-4">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-[#c084fc]" /><p className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">Portfolio</p></div><span className="font-tech text-[10px] font-bold text-cyan-300">+$86.40</span></div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-white/50"><span>Open positions</span><span className="font-tech font-bold text-white">3 markets</span></div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/50"><span>Potential return</span><span className="font-tech font-bold text-amber-300">$214.00</span></div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#a855f7] to-cyan-400" /></div>
      </LeaguePanel>
      </div>

      <OpenPositions markets={liveMarkets} onSelect={setSelectedMarketId} />

      <ResolvedMarkets />

      <p className="lg:col-span-12 text-center font-tech text-[9px] uppercase tracking-widest text-white/30">Demo market data only · no stablecoin transactions are enabled</p>
    </div>
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
    <LeaguePanel fill={false} className="border-[#a855f7]/25 lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Top agents</h3>
          <p className="mt-0.5 text-[11px] text-white/45">This week · ranked by prediction accuracy &amp; ROI</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><TrendingUp className="h-3.5 w-3.5" /> Live standings</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {TOP_AGENTS.map((row) => {
          const agent = getLeagueAgent(row.name);
          return (
            <article key={row.name} className="overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.12),transparent_55%),#070911] p-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-tech text-[9px] font-black ${row.rank === 1 ? "bg-amber-500/20 text-amber-400" : "bg-white/8 text-white/50"}`}>{row.rank}</span>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
                <p className="min-w-0 truncate font-tech text-[10px] font-bold uppercase text-white">{row.name}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div><p className="font-tech text-[8px] uppercase tracking-wider text-white/35">Accuracy</p><p className="font-tech text-sm font-black text-cyan-300">{row.accuracy}%</p></div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-tech text-[10px] font-bold text-emerald-300">{row.roi}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-[#a855f7]" style={{ width: `${row.accuracy}%` }} /></div>
              <p className="mt-2 font-tech text-[8px] uppercase tracking-wider text-white/35">{row.calls} calls · {row.streak}W streak</p>
            </article>
          );
        })}
      </div>
    </LeaguePanel>
  );
}

function TodayAgentPredictions() {
  return (
    <LeaguePanel fill={false} className="border-cyan-400/20 lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Today&apos;s agent predictions</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Each agent&apos;s headline call across today&apos;s markets</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><Activity className="h-3.5 w-3.5" /> {TODAY_AGENT_PREDICTIONS.length} live</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
    </LeaguePanel>
  );
}

function TrendingMovers({ markets, onSelect }: { markets: LiveMarket[]; onSelect: (id: string) => void }) {
  const movers = [...markets].sort((a, b) => Math.abs(b.session) - Math.abs(a.session)).slice(0, 4);

  return (
    <LeaguePanel fill={false} className="border-cyan-400/20 lg:col-span-12">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Trending movers</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Biggest price swings this session</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-cyan-300"><TrendingUp className="h-3.5 w-3.5" /> Live</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {movers.map((market) => {
          const sessionDir = market.session > 0 ? "up" : market.session < 0 ? "down" : "flat";
          return (
            <button key={market.id} type="button" onClick={() => onSelect(market.id)} className="overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.1),transparent_55%),#070911] p-3 text-left transition hover:border-cyan-400/40">
              <p className="font-tech text-[8px] uppercase tracking-wider text-white/35">{market.category}</p>
              <p className="mt-1 line-clamp-2 min-h-8 font-tech text-[11px] font-bold leading-snug text-white">{market.question}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-tech text-lg font-black text-white">{market.yes}¢</span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-tech text-[10px] font-bold ${priceToneClass(sessionDir)}`}>
                  <PriceArrow dir={sessionDir} /> {market.session >= 0 ? "+" : ""}{market.session}¢
                </span>
              </div>
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
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Your positions</h3>
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
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Resolved markets</h3>
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
  const valueColor = tone === "cyan" ? "text-cyan-300" : "text-[#d8b4fe]";
  return <div className="rounded-lg border border-white/8 bg-black/20 px-3 py-2.5"><p className="font-tech text-[8px] uppercase tracking-[0.16em] text-white/35">{label}</p><p className={`mt-1 font-tech text-sm font-black ${valueColor}`}>{value}</p><p className="mt-0.5 text-[9px] text-white/40">{detail}</p></div>;
}

function SelectedMarketPulse({
  market,
  watching,
  onToggleWatch,
}: {
  market: LiveMarket;
  watching: boolean;
  onToggleWatch: () => void;
}) {
  const leader = market.agents[0];
  const challenger = market.agents[1];
  const leaderAgent = getLeagueAgent(leader.name);
  const challengerAgent = getLeagueAgent(challenger.name);
  const trend = `${market.delta >= 0 ? "+" : ""}${market.delta}¢`;

  return (
    <section className="overflow-hidden rounded-xl border border-[#a855f7]/35 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.13),transparent_44%),linear-gradient(110deg,rgba(18,9,34,0.96),rgba(7,10,18,0.98))] p-4 sm:p-5 lg:col-span-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0"><div className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-cyan-300" /><span className="font-tech text-[9px] uppercase tracking-[0.2em] text-cyan-300">Selected market · live movement</span></div><h3 className="mt-2 font-tech text-lg font-black text-white sm:text-xl">{market.question}</h3><p className="mt-1 text-[11px] text-white/45">YES is moving <span className={`inline-flex items-center gap-0.5 font-tech font-bold ${priceToneClass(market.dir).split(" ").pop()}`}><PriceArrow dir={market.dir} /> {trend}</span> · {market.volume} volume</p></div>
        <div className="flex items-center gap-3"><div className="text-right"><p className="font-tech text-[9px] uppercase tracking-wider text-white/35">Market price</p><p className={`font-tech text-2xl font-black ${priceToneClass(market.dir).split(" ").pop()}`}>{market.yes}¢</p></div><button type="button" onClick={onToggleWatch} className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${watching ? "border-[#a855f7]/55 bg-[#a855f7]/15 text-[#e9d5ff]" : "border-white/10 bg-black/20 text-white/45 hover:text-white"}`} aria-label="Toggle market watchlist"><Star className={`h-4 w-4 ${watching ? "fill-current" : ""}`} /></button></div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <PulseAgent agent={leaderAgent} signal={leader} side="left" />
        <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" /><span className="font-tech text-[9px] uppercase tracking-wider text-white/35">Agent alpha</span></div>
        <PulseAgent agent={challengerAgent} signal={challenger} side="right" />
      </div>
    </section>
  );
}

function PulseAgent({
  agent,
  signal,
  side,
}: {
  agent: ReturnType<typeof getLeagueAgent>;
  signal: (typeof MARKETS)[number]["agents"][number];
  side: "left" | "right";
}) {
  const isLeft = side === "left";
  return <div className={`flex items-center gap-3 ${isLeft ? "sm:justify-start" : "sm:justify-end sm:text-right"}`}><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div><div className="min-w-0"><p className="font-tech text-[10px] font-bold uppercase text-white">{signal.name}</p><p className={`mt-0.5 text-[10px] font-bold ${signal.tone === "cyan" ? "text-cyan-300" : "text-fuchsia-300"}`}>{signal.pick} · {signal.confidence}%</p><p className="mt-0.5 max-w-[210px] text-[9px] text-white/40">{signal.reason}</p></div></div>;
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
  const isPositive = prediction.tone === "cyan";

  return (
    <div className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 ${isPositive ? "border-cyan-400/15 bg-cyan-400/[0.04]" : "border-fuchsia-400/15 bg-fuchsia-400/[0.04]"}`}>
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">{agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}</div>
      <div className="min-w-0"><p className="truncate font-tech text-[9px] font-bold uppercase text-white">{prediction.name}</p><p className={`mt-0.5 truncate font-tech text-[9px] font-bold ${isPositive ? "text-cyan-300" : "text-fuchsia-300"}`}>{prediction.pick}</p><p className="mt-0.5 text-[8px] text-white/40">{prediction.confidence}% confidence</p><p className="mt-1 line-clamp-2 text-[8px] leading-snug text-white/35">{prediction.reason}</p></div>
    </div>
  );
}

function AgentRivalryQuestion({ rivalry }: { rivalry: (typeof AGENT_RIVALRIES)[number] }) {
  const left = getLeagueAgent(rivalry.left.name);
  const right = getLeagueAgent(rivalry.right.name);

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.13),transparent_50%),#070911] p-3 sm:p-4">
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
