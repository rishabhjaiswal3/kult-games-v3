import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Gauge, Loader2 } from "lucide-react";
import { fetchF1Markets, type PolyMarket } from "@/api/polymarketApi";
import { polymarketSignalApi } from "@/api/polymarketSignalApi";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { useAuth } from "@/contexts/AuthContext";
import { usePolygonUsdcBalance } from "@/hooks/usePolygonUsdcBalance";
import { useDepositWalletPusdBalance } from "@/hooks/useDepositWalletPusdBalance";
import { useDepositWalletAddress } from "@/hooks/useDepositWalletAddress";
import { usePolymarketSignal } from "@/hooks/usePolymarketSignal";
import { usePolymarketTrading } from "@/hooks/usePolymarketTrading";
import { PolymarketDepositModal } from "./PolymarketDepositModal";
import { PolymarketWithdrawModal } from "./PolymarketWithdrawModal";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { PolymarketLogo } from "./PolymarketLogo";

/**
 * Real Formula 1 Polymarket markets -- same trading/deposit/agent-signal
 * infrastructure as LeaguePolymarketBoard (football), just a leaner grid
 * instead of the full World Cup visual scaffolding (group tables, match
 * carousels, etc. don't have an F1 equivalent to replicate 1:1). Real
 * markets only (fetchF1Markets) -- renders nothing fake if Polymarket has
 * no live F1 markets right now.
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

function F1WalletBalance() {
  const { isAuthenticated, walletAddress, login } = useAuth();
  const { data: usdc, isLoading: usdcLoading } = usePolygonUsdcBalance(walletAddress);
  const { data: pusd, isLoading: pusdLoading } = useDepositWalletPusdBalance(walletAddress);
  const { data: depositWalletAddress } = useDepositWalletAddress(walletAddress);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={login}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left font-tech text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-[#2E5CFF]/40 hover:text-white"
      >
        Connect wallet to see your Polygon USDC balance
      </button>
    );
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white/50">Your Polygon USDC</span>
        <span className="font-tech text-sm font-bold text-white">
          {usdcLoading ? "…" : usdc != null ? `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">Tradeable (pUSD)</span>
        <span className="font-tech text-xs font-semibold text-white/70">
          {pusdLoading ? "…" : pusd != null ? `$${pusd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setDepositOpen(true)}
          className="w-full rounded-lg border border-[#2E5CFF]/40 bg-[#2E5CFF]/10 px-2 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#7c9bff] transition hover:bg-[#2E5CFF]/20"
        >
          Fund wallet
        </button>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white/60 transition hover:border-white/30 hover:text-white"
        >
          Withdraw
        </button>
      </div>
      <PolymarketDepositModal open={depositOpen} onOpenChange={setDepositOpen} walletAddress={depositWalletAddress ?? null} />
      <PolymarketWithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} availablePusd={pusd ?? null} />
    </div>
  );
}

function F1MarketCard({ market }: { market: PolyMarket }) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { getSignal, isLoading, result, error, hasAgent, myAgentId } = usePolymarketSignal();
  const { status: tradingStatus, error: tradeError, placeMarketBuy } = usePolymarketTrading();
  const [stakeUsd, setStakeUsd] = useState(10);
  const [placedOrder, setPlacedOrder] = useState<{ side: "YES" | "NO"; orderId?: string } | null>(null);

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
      const result = await placeMarketBuy(tokenId, stakeUsd);
      setPlacedOrder({ side, orderId: result.orderId });
    } catch {
      // tradeError from the hook already surfaces this
    }
  }

  const agent = signal ? getLeagueAgent(signal.agentName) : null;

  return (
    <article className="relative overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(46,92,255,0.08),transparent_55%),#0b0d12] p-3.5 transition hover:border-[#2E5CFF]/45">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">{market.category}</span>
        <span className="shrink-0 font-mono text-[10px] text-white/40">{market.volume} Vol</span>
      </div>

      <p className="min-h-9 font-tech text-sm font-bold text-white">{market.question}</p>

      {!isRealMarket ? (
        <p className="mt-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 font-tech text-[9px] uppercase tracking-wider text-amber-300">
          Preview data — Polymarket is unreachable right now, not a live tradeable market
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <span className="font-tech text-[9px] uppercase tracking-wider text-white/40">Stake</span>
        <input
          type="number"
          min={1}
          step={1}
          value={stakeUsd}
          onChange={(e) => setStakeUsd(Math.max(1, Number(e.target.value) || 1))}
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

      <div className="mt-3 border-t border-white/10 pt-2.5">
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

export function F1PolymarketBoard() {
  const { data: markets, isLoading } = useQuery({
    queryKey: ["polymarket", "f1", "markets"],
    queryFn: () => fetchF1Markets(30),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2E5CFF]/25 bg-[radial-gradient(circle_at_0%_0%,rgba(46,92,255,0.1),transparent_55%),#080910] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[#7c9bff]" />
          <div>
            <h2 className="font-tech text-sm font-black uppercase tracking-[0.14em] text-white">Formula 1 markets</h2>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-white/45">
              Real Polymarket <PolymarketLogo className="h-3 w-auto text-[#7d97ff]" /> F1 markets — driver championships, race winners, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 items-start gap-2.5 lg:grid-cols-12 lg:gap-3">
        <div className="min-w-0 w-full lg:col-span-9">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
              ))}
            </div>
          ) : !markets || markets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center">
              <Loader2 className="h-5 w-5 text-white/30" />
              <p className="font-mono text-xs text-white/40">No live Formula 1 markets on Polymarket right now — check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {markets.map((market) => (
                <F1MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 w-full lg:col-span-3">
          <F1WalletBalance />
        </div>
      </div>
    </div>
  );
}
