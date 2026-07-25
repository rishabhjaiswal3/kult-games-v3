import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Gauge, Loader2, Sparkles } from "lucide-react";
import { fetchF1Markets, type PolyMarket } from "@/api/polymarketApi";
import { f1Api, type F1Driver } from "@/api/f1Api";
import { polymarketSignalApi } from "@/api/polymarketSignalApi";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPositionForMarket, useRefreshPolymarketPositions } from "@/hooks/useMyPolymarketPositions";
import { useNumericInput } from "@/hooks/useNumericInput";
import { usePolymarketSignal } from "@/hooks/usePolymarketSignal";
import { usePolymarketTrading } from "@/hooks/usePolymarketTrading";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { PolymarketLogo } from "./PolymarketLogo";

/**
 * Real Formula 1 Polymarket markets. Was one flat grid of identical,
 * fairly busy cards (stake input + buy buttons + agent-signal panel all
 * always visible, no grouping) -- real Polymarket's own F1 props page
 * groups by market (Drivers' Championship, Constructors' Championship,
 * per-Grand-Prix props, ...) with a compact row per outcome: avatar,
 * name, live %, Yes/No. Rebuilt to match that density: grouped sections,
 * one shared stake control per section (not one per card), driver photos
 * matched against our own already-synced F1Driver roster (Polymarket's
 * own market/event icon is just the event banner, not a per-driver
 * photo -- so this pulls from data we already have, not a new source).
 * Real markets only (fetchF1Markets) -- renders nothing fake if
 * Polymarket has no live F1 markets right now.
 */

const SIGNAL_CONFIDENCE_PCT: Record<string, number> = { LOW: 60, MEDIUM: 75, HIGH: 90 };

const TRADING_STATUS_LABEL: Record<string, string> = {
  "switching-network": "Switching to Polygon…",
  "deploying-wallet": "Setting up your Polymarket wallet…",
  wrapping: "Funding trade (check your wallet)…",
  approving: "Approving (check your wallet)…",
  "deriving-key": "Setting up trading…",
  "placing-order": "Placing order…",
};

/** Loose name match ("Carlos Sainz Jr." <-> "Carlos Sainz") -- strip punctuation/suffixes, compare lowercase. */
function normalizeDriverName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(jr\.?|sr\.?|ii|iii)\b/g, "")
    .replace(/[.'-]/g, "")
    .trim();
}

function useDriverPhotoLookup(): (label: string | undefined) => string | undefined {
  const { data: drivers } = useQuery({
    queryKey: ["f1", "drivers"],
    queryFn: () => f1Api.getDrivers(),
    staleTime: 5 * 60_000,
  });

  const byName = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of drivers ?? []) {
      if (d.image) map.set(normalizeDriverName(d.name), d.image);
    }
    return map;
  }, [drivers]);

  return (label) => (label ? byName.get(normalizeDriverName(label)) : undefined);
}

function DriverAvatar({ label, photo }: { label?: string; photo?: string }) {
  const initials = (label ?? "?")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/40">
      {photo ? (
        <img src={photo} alt={label ?? ""} className="h-full w-full object-cover object-top" loading="lazy" />
      ) : (
        <div className="grid h-full w-full place-items-center font-tech text-[10px] font-bold text-white/50">{initials}</div>
      )}
    </div>
  );
}

function F1MarketRow({
  market,
  photo,
  stakeUsd,
  onExpand,
  expanded,
}: {
  market: PolyMarket;
  photo?: string;
  stakeUsd: number;
  onExpand: () => void;
  expanded: boolean;
}) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { getSignal, isLoading, result, error, hasAgent, myAgentId } = usePolymarketSignal();
  const { status: tradingStatus, error: tradeError, placeMarketBuy } = usePolymarketTrading();
  const [placedOrder, setPlacedOrder] = useState<{ side: "YES" | "NO"; orderId?: string } | null>(null);
  const myPosition = useMyPositionForMarket(market.conditionId);
  const refreshPositions = useRefreshPolymarketPositions();

  const { data: signals } = useQuery({
    queryKey: ["polymarket", "signals", market.id],
    queryFn: () => polymarketSignalApi.getSignalsForMarket(market.id),
    staleTime: 30_000,
    enabled: expanded,
  });

  const myPersistedSignal = signals?.find((s) => s.agentId === myAgentId) ?? null;
  const signal = result(market.id) ?? myPersistedSignal;
  const loading = isLoading(market.id);
  const signalError = error(market.id);
  const isTrading = tradingStatus !== "idle" && tradingStatus !== "done";
  const isRealMarket = Boolean(market.tokenId);
  const label = market.outcomeLabel ?? market.short;

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
      const orderResult = await placeMarketBuy(tokenId, stakeUsd);
      setPlacedOrder({ side, orderId: orderResult.orderId });
      refreshPositions();
    } catch {
      // tradeError from the hook already surfaces this
    }
  }

  const agent = signal ? getLeagueAgent(signal.agentName) : null;

  return (
    <div className={`rounded-lg border transition ${expanded ? "border-[#2E5CFF]/40 bg-[#2E5CFF]/[0.04]" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <DriverAvatar label={label} photo={photo} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-tech text-[12px] font-bold text-white" title={market.question}>{label}</p>
          {myPosition ? (
            <p className={`truncate font-tech text-[9px] font-bold uppercase tracking-wider ${myPosition.side === "YES" ? "text-emerald-300" : "text-rose-300"}`}>
              Holding {myPosition.shares.toFixed(2)} {myPosition.side} · {myPosition.pnl >= 0 ? "+" : ""}${myPosition.pnl.toFixed(2)}
            </p>
          ) : (
            <p className="truncate font-mono text-[9px] text-white/35">{market.volume} Vol</p>
          )}
        </div>

        <span className="shrink-0 font-tech text-sm font-black tabular-nums text-white">{market.yes}%</span>

        <button
          type="button"
          disabled={isTrading || !isRealMarket}
          onClick={() => void handleBuy("YES")}
          className="shrink-0 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1.5 font-tech text-[10px] font-bold uppercase text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Yes
        </button>
        <button
          type="button"
          disabled={isTrading || !isRealMarket || !market.noTokenId}
          onClick={() => void handleBuy("NO")}
          title={!market.noTokenId ? "No-side token unavailable" : undefined}
          className="shrink-0 rounded-md border border-rose-400/40 bg-rose-400/10 px-2.5 py-1.5 font-tech text-[10px] font-bold uppercase text-rose-300 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          No
        </button>
        <button
          type="button"
          onClick={onExpand}
          title="AI agent read"
          className={`shrink-0 grid h-7 w-7 place-items-center rounded-md border transition ${expanded ? "border-[#2E5CFF]/50 bg-[#2E5CFF]/15 text-[#aebfff]" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white"}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded ? (
        <div className="border-t border-white/10 px-3 py-2.5">
          {!isRealMarket ? (
            <p className="mb-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 font-tech text-[9px] uppercase tracking-wider text-amber-300">
              Preview data — Polymarket is unreachable right now, not a live tradeable market
            </p>
          ) : null}

          {isTrading ? (
            <p className="mb-2 font-tech text-[9px] uppercase tracking-wider text-cyan-300">{TRADING_STATUS_LABEL[tradingStatus]}</p>
          ) : tradeError ? (
            <p className="mb-2 text-[9px] text-rose-400">{tradeError}</p>
          ) : placedOrder ? (
            <p className="mb-2 font-tech text-[9px] uppercase tracking-wider text-emerald-300">
              {placedOrder.side} order placed{placedOrder.orderId ? ` · ${placedOrder.orderId.slice(0, 10)}…` : ""}
            </p>
          ) : null}

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
      ) : null}
    </div>
  );
}

function F1MarketSection({
  category,
  markets,
  photoFor,
  stakeUsd,
  expandedId,
  onExpand,
}: {
  category: string;
  markets: PolyMarket[];
  photoFor: (label: string | undefined) => string | undefined;
  stakeUsd: number;
  expandedId: string | null;
  onExpand: (id: string) => void;
}) {
  const totalVolume = markets.reduce((sum, m) => sum + m.volumeNum, 0);

  return (
    <section className="rounded-xl border border-white/10 bg-[#0a0b12] p-3">
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <h3 className="font-tech text-[11px] font-black uppercase tracking-[0.14em] text-white">{category}</h3>
        <span className="font-mono text-[9px] text-white/40">
          {markets.length} market{markets.length === 1 ? "" : "s"} · $
          {totalVolume >= 1_000_000 ? `${(totalVolume / 1_000_000).toFixed(2)}M` : `${Math.round(totalVolume / 1000)}K`} Vol
        </span>
      </div>
      <div className="space-y-1.5">
        {markets.map((market) => (
          <F1MarketRow
            key={market.id}
            market={market}
            photo={photoFor(market.outcomeLabel)}
            stakeUsd={stakeUsd}
            expanded={expandedId === market.id}
            onExpand={() => onExpand(market.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function F1PolymarketBoard() {
  const { data: markets, isLoading } = useQuery({
    queryKey: ["polymarket", "f1", "markets"],
    queryFn: () => fetchF1Markets(100),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const photoFor = useDriverPhotoLookup();
  const stake = useNumericInput(10, { min: 0.1, integer: false });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, PolyMarket[]>();
    for (const m of markets ?? []) {
      const list = byCategory.get(m.category) ?? [];
      list.push(m);
      byCategory.set(m.category, list);
    }
    return [...byCategory.entries()]
      .map(([category, list]) => [category, list.sort((a, b) => b.yes - a.yes)] as const)
      .sort((a, b) => b[1].reduce((s, m) => s + m.volumeNum, 0) - a[1].reduce((s, m) => s + m.volumeNum, 0));
  }, [markets]);

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2E5CFF]/25 bg-[radial-gradient(circle_at_0%_0%,rgba(46,92,255,0.1),transparent_55%),#080910] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[#7c9bff]" />
          <div>
            <h2 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Formula 1 markets</h2>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-white/45">
              Real Polymarket <PolymarketLogo className="h-3 w-auto text-[#7d97ff]" /> F1 markets — driver championships, race winners, and more.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-tech text-[9px] uppercase tracking-wider text-white/40">Stake</span>
          <input
            {...stake.inputProps}
            className="h-7 w-16 rounded-md border border-white/15 bg-black/30 px-2 font-tech text-xs font-bold text-white outline-none focus:border-[#2E5CFF]/50"
          />
          <span className="font-tech text-[9px] uppercase tracking-wider text-white/40">USDC</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center">
          <Loader2 className="h-5 w-5 text-white/30" />
          <p className="font-mono text-xs text-white/40">No live Formula 1 markets on Polymarket right now — check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {grouped.map(([category, list]) => (
            <F1MarketSection
              key={category}
              category={category}
              markets={list}
              photoFor={photoFor}
              stakeUsd={stake.resolved}
              expandedId={expandedId}
              onExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
