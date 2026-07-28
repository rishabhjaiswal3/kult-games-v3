import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronRight, Gauge, Loader2, Search, Sparkles, X } from "lucide-react";
import { fetchF1Markets, type PolyMarket } from "@/api/polymarketApi";
import { f1Api, type F1Driver } from "@/api/f1Api";
import { polymarketSignalApi } from "@/api/polymarketSignalApi";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPositionForMarket, useRefreshPolymarketPositions } from "@/hooks/useMyPolymarketPositions";
import { useNumericInput } from "@/hooks/useNumericInput";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { usePolymarketSignal } from "@/hooks/usePolymarketSignal";
import { usePolymarketTrading } from "@/hooks/usePolymarketTrading";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import hybridAgentPortrait from "@/assets/f1/agent-cards/hybrid.jpg";
import defenderAgentPortrait from "@/assets/f1/agent-cards/defender.jpg";
import tacticianAgentPortrait from "@/assets/f1/agent-cards/tactician.jpg";
import supportAgentPortrait from "@/assets/f1/agent-cards/support.jpg";
import berserkerAgentPortrait from "@/assets/f1/agent-cards/berserker.jpg";
import assassinAgentPortrait from "@/assets/f1/agent-cards/assassin.jpg";

const AGENT_PORTRAITS: Record<string, string> = {
  HYBRID: hybridAgentPortrait,
  DEFENDER: defenderAgentPortrait,
  TACTICIAN: tacticianAgentPortrait,
  SUPPORT: supportAgentPortrait,
  BERSERKER: berserkerAgentPortrait,
  ASSASSIN: assassinAgentPortrait,
};

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
  agentName,
  agentPortrait,
  variant,
  onExpand,
  expanded,
}: {
  market: PolyMarket;
  photo?: string;
  stakeUsd: number;
  agentName?: string;
  agentPortrait?: string;
  variant: "grouped" | "single";
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
    <div className={`overflow-hidden transition ${variant === "grouped" ? "border-b border-white/[0.06] last:border-b-0" : ""} ${expanded ? "bg-violet-500/[0.07]" : "hover:bg-white/[0.02]"}`}>
      <div className={`grid items-center gap-2 px-3 ${variant === "grouped" ? "grid-cols-[auto_minmax(0,1fr)_auto_auto] py-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_58px_58px_auto]" : "grid-cols-[1fr_1fr_auto] py-3"} sm:px-4`}>
        {variant === "grouped" ? <DriverAvatar label={label} photo={photo} /> : null}

        {variant === "grouped" ? <div className="min-w-0 flex-1">
          <p className={`truncate font-medium text-white/90 ${variant === "single" ? "text-sm" : "text-[13px]"}`} title={market.question}>{label}</p>
          {myPosition ? (
            <p className={`truncate font-tech text-[9px] font-bold uppercase tracking-wider ${myPosition.side === "YES" ? "text-emerald-300" : "text-rose-300"}`}>
              Holding {myPosition.shares.toFixed(2)} {myPosition.side} · {myPosition.pnl >= 0 ? "+" : ""}${myPosition.pnl.toFixed(2)}
            </p>
          ) : variant === "single" ? (
            <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wide text-white/35">{market.volume} volume</p>
          ) : null}
        </div> : null}

        {variant === "grouped" ? <div className="text-right">
          <span className="font-tech text-base font-black tabular-nums text-white">{market.yes}%</span>
          <p className={`font-mono text-[7px] ${variant === "grouped" ? "hidden" : ""} ${market.dayChange > 0 ? "text-emerald-400" : market.dayChange < 0 ? "text-rose-400" : "text-white/25"}`}>
            {market.dayChange > 0 ? "+" : ""}{market.dayChange}¢ today
          </p>
        </div> : null}

        <button
          type="button"
          onClick={onExpand}
          title={agentName ? `Ask ${agentName} for a market perspective` : "Ask your AI agent for a market perspective"}
          aria-label={`Ask my AI agent about ${label}`}
          className={`group flex h-8 items-center justify-center gap-1 rounded-lg border px-1.5 font-tech text-[8px] font-bold uppercase transition sm:order-last ${
            expanded
              ? "border-violet-400/60 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/20 text-violet-100 shadow-[0_0_14px_rgba(168,85,247,0.35)]"
              : "border-violet-400/25 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/[0.06] text-violet-200/80 hover:border-violet-400/50 hover:from-violet-500/20 hover:to-fuchsia-500/15 hover:text-violet-100 hover:shadow-[0_0_14px_rgba(168,85,247,0.25)]"
          }`}
        >
          {agentPortrait ? (
            <img src={agentPortrait} alt="" className="h-5 w-5 rounded-full border border-violet-300/25 object-cover object-top" />
          ) : (
            <Sparkles className={`h-4 w-4 transition group-hover:scale-110 ${expanded ? "text-fuchsia-300" : "text-violet-300 group-hover:text-fuchsia-300"}`} />
          )}
          <span className={variant === "grouped" ? "hidden" : ""}>Ask</span>
        </button>

        <div className={variant === "grouped" ? "col-span-4 grid grid-cols-2 gap-1.5 sm:col-span-1 sm:contents" : "contents"}>
          <button
            type="button"
            disabled={isTrading || !isRealMarket}
            onClick={() => void handleBuy("YES")}
            className={`rounded-lg border border-emerald-400/10 bg-emerald-400/[0.12] px-2 font-tech text-[9px] font-bold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50 ${variant === "single" ? "py-2.5" : "py-1.5"}`}
          >
            Yes {variant === "single" ? <span className="ml-1 tabular-nums text-emerald-100">{market.yes}¢</span> : null}
          </button>
          <button
            type="button"
            disabled={isTrading || !isRealMarket || !market.noTokenId}
            onClick={() => void handleBuy("NO")}
            title={!market.noTokenId ? "No-side token unavailable" : undefined}
            className={`rounded-lg border border-rose-400/10 bg-rose-400/[0.12] px-2 font-tech text-[9px] font-bold text-rose-300 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50 ${variant === "single" ? "py-2.5" : "py-1.5"}`}
          >
            No {variant === "single" ? <span className="ml-1 tabular-nums text-rose-100">{100 - market.yes}¢</span> : null}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-violet-400/15 px-3 py-3">
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
              {loading ? "Reading market…" : "Ask agent for perspective"}
            </button>
          )}
          {signalError ? <p className="mt-1.5 text-center text-[9px] text-rose-400">{signalError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function F1MarketSection({
  title,
  markets,
  photoFor,
  stakeUsd,
  agentName,
  agentPortrait,
  expandedId,
  onExpand,
}: {
  title: string;
  markets: PolyMarket[];
  photoFor: (label: string | undefined) => string | undefined;
  stakeUsd: number;
  agentName?: string;
  agentPortrait?: string;
  expandedId: string | null;
  onExpand: (id: string) => void;
}) {
  const totalVolume = leadEventVolume(markets);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const lead = markets[0];
  const isGrouped = markets.length > 1;
  const visibleMarkets = markets.slice(0, isGrouped ? 2 : 1);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition hover:border-violet-400/30">
      <div className={`relative flex items-start gap-3 px-4 ${isGrouped ? "pb-2 pt-4" : "py-4"}`}>
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
            {lead.eventImage ? <img src={lead.eventImage} alt="" className="h-full w-full object-cover" /> : <Gauge className="m-2 h-5 w-5 text-violet-300" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold leading-snug text-white/90 ${isGrouped ? "truncate text-base" : "line-clamp-2 text-[15px]"}`}>{title}</h3>
          </div>
          {!isGrouped ? (
            <div className="relative grid h-[70px] w-[86px] shrink-0 place-items-center">
              <div
                className="absolute inset-x-1 top-0 h-[44px] rounded-t-full"
                style={{ background: `conic-gradient(from 270deg at 50% 100%, #34d399 0deg ${lead.yes * 1.8}deg, #2a2d38 ${lead.yes * 1.8}deg 180deg, transparent 180deg)` }}
              />
              <div className="absolute inset-x-[9px] top-[8px] h-[38px] rounded-t-full bg-[#0b0d12]" />
              <span className="relative mt-1 font-tech text-xl font-bold text-white">{lead.yes}%</span>
              <span className="absolute bottom-0 text-[10px] font-semibold text-white/40">chance</span>
            </div>
          ) : null}
      </div>
      <div className="flex-1 overflow-hidden">
        {visibleMarkets.map((market) => (
          <F1MarketRow
            key={market.id}
            market={market}
            photo={photoFor(market.outcomeLabel)}
            stakeUsd={stakeUsd}
            agentName={agentName}
            agentPortrait={agentPortrait}
            variant={isGrouped ? "grouped" : "single"}
            expanded={expandedId === market.id}
            onExpand={() => onExpand(market.id)}
          />
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
        <span className="text-sm font-medium text-white/45">{formatCompactUsd(totalVolume)} Vol.</span>
        {isGrouped && markets.length > 2 ? (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1 font-tech text-[9px] font-bold uppercase tracking-[0.1em] text-white/35 transition hover:text-white/70"
        >
          View all {markets.length}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        ) : null}
      </div>
      <F1OutcomesDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={title}
        markets={markets}
        photoFor={photoFor}
        stakeUsd={stakeUsd}
        agentName={agentName}
        agentPortrait={agentPortrait}
        expandedId={expandedId}
        onExpand={onExpand}
      />
    </section>
  );
}

function F1OutcomesDrawer({
  open,
  onOpenChange,
  title,
  markets,
  photoFor,
  stakeUsd,
  agentName,
  agentPortrait,
  expandedId,
  onExpand,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  markets: PolyMarket[];
  photoFor: (label: string | undefined) => string | undefined;
  stakeUsd: number;
  agentName?: string;
  agentPortrait?: string;
  expandedId: string | null;
  onExpand: (id: string) => void;
}) {
  const lead = markets[0];
  const [drawerQuery, setDrawerQuery] = useState("");
  const filteredMarkets = markets.filter((market) =>
    `${market.outcomeLabel ?? ""} ${market.question}`.toLowerCase().includes(drawerQuery.trim().toLowerCase()),
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[240] bg-black/70 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-[241] flex w-full flex-col border-l border-violet-400/20 bg-[#0b0d12] shadow-[-28px_0_80px_rgba(0,0,0,0.5)] outline-none duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:w-[520px] lg:w-[620px]">
          <div className="relative shrink-0 border-b border-violet-400/15 bg-[#0b0d12] px-4 pb-4 pt-5 sm:px-5">
            <div className="flex items-start gap-3 pr-10">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/30">
                {lead.eventImage ? <img src={lead.eventImage} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <DialogPrimitive.Title className="text-base font-semibold leading-snug text-white sm:text-lg">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-xs text-white/40">
                  {markets.length} outcomes · {formatCompactUsd(leadEventVolume(markets))} Vol.
                </DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-200 transition hover:bg-violet-500/20 hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">Close outcomes</span>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))] [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
            <div className="sticky top-0 z-10 border-b border-violet-400/10 bg-[#0b0d12] p-3 sm:p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  value={drawerQuery}
                  onChange={(event) => setDrawerQuery(event.target.value)}
                  placeholder="Search outcomes"
                  autoFocus
                  className="h-10 w-full rounded-lg border border-violet-400/20 bg-black/25 pl-10 pr-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-violet-400/50"
                />
              </label>
            </div>
            <div className="grid grid-cols-[40px_minmax(0,1fr)_52px_58px_58px_40px] items-center gap-2 border-b border-violet-400/10 bg-black/20 px-4 py-2 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-white/25">
              <span />
              <span>Outcome</span>
              <span className="text-right">Chance</span>
              <span className="text-center">Yes</span>
              <span className="text-center">No</span>
              <span />
            </div>
            {filteredMarkets.length ? (
              filteredMarkets.map((market) => (
                <F1MarketRow
                  key={market.id}
                  market={market}
                  photo={photoFor(market.outcomeLabel)}
                  stakeUsd={stakeUsd}
                  agentName={agentName}
                  agentPortrait={agentPortrait}
                  variant="grouped"
                  expanded={expandedId === market.id}
                  onExpand={() => onExpand(market.id)}
                />
              ))
            ) : (
              <p className="px-4 py-10 text-center text-xs text-white/35">No outcomes match “{drawerQuery}”.</p>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function formatCompactUsd(value: number): string {
  if (value >= 10_000_000) return `$${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 10_000) return `$${Math.round(value / 1_000)}K`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `$${Math.round(value)}`;
}

function leadEventVolume(markets: PolyMarket[]): number {
  return markets[0]?.eventVolume || markets.reduce((sum, market) => sum + market.volumeNum, 0);
}

export function F1PolymarketBoard() {
  const { data: markets, isLoading } = useQuery({
    queryKey: ["polymarket", "f1", "markets"],
    queryFn: () => fetchF1Markets(100),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const photoFor = useDriverPhotoLookup();
  const { data: myAgents } = useMyArenaAgents();
  const myAgent = myAgents?.agents?.[0];
  const myAgentPortrait = myAgent
    ? AGENT_PORTRAITS[myAgent.archetype?.toUpperCase()] ?? hybridAgentPortrait
    : undefined;
  const stake = useNumericInput(10, { min: 0.1, integer: false });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byEvent = new Map<string, PolyMarket[]>();
    for (const m of markets ?? []) {
      const key = m.eventId ?? m.eventTitle ?? m.category;
      const list = byEvent.get(key) ?? [];
      list.push(m);
      byEvent.set(key, list);
    }
    return [...byEvent.entries()]
      .map(([, list]) => [list[0].eventTitle ?? list[0].category, list.sort((a, b) => b.yes - a.yes)] as const)
      .sort((a, b) => {
        // A one-question event is a focused prop, not an incomplete group.
        // Promote those cards so they never look like a stray leftover at the bottom.
        const singletonOrder = Number(b[1].length === 1) - Number(a[1].length === 1);
        if (singletonOrder !== 0) return singletonOrder;
        return b[1].reduce((s, m) => s + m.volumeNum, 0) - a[1].reduce((s, m) => s + m.volumeNum, 0);
      });
  }, [markets]);

  const featuredGroups = grouped.filter(([, list]) => list.length === 1);
  const outcomeGroups = grouped.filter(([, list]) => list.length > 1);
  const eventVolume = grouped.reduce((sum, [, list]) => sum + leadEventVolume(list), 0);
  const eventLiquidity = grouped.reduce((sum, [, list]) => sum + (list[0]?.eventLiquidity ?? 0), 0);

  return (
    <div className="min-w-0 space-y-4 pb-8 sm:pb-0">
      <div className="relative overflow-hidden rounded-2xl border border-violet-400/25 bg-[radial-gradient(circle_at_0%_0%,rgba(139,92,246,0.12),transparent_55%),#080910] p-4 sm:p-5">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15">
              <Gauge className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-tech text-lg font-bold text-white">Formula 1 Markets</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-300">Live</span>
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-white/40">Active markets from Polymarket</p>
            </div>
          </div>

          <div className="hidden h-10 w-px shrink-0 bg-white/10 sm:block" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-1 sm:items-center sm:justify-center sm:gap-8">
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-wider text-white/35">Events</dt>
              <dd className="mt-1 font-tech text-sm font-bold tabular-nums text-white">{grouped.length}</dd>
            </div>
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-wider text-white/35">Outcomes</dt>
              <dd className="mt-1 font-tech text-sm font-bold tabular-nums text-white">{markets?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-wider text-white/35">Volume</dt>
              <dd className="mt-1 font-tech text-sm font-bold tabular-nums text-white">{formatCompactUsd(eventVolume)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-wider text-white/35">Liquidity</dt>
              <dd className="mt-1 font-tech text-sm font-bold tabular-nums text-white">{formatCompactUsd(eventLiquidity)}</dd>
            </div>
          </dl>

          <div className="hidden h-10 w-px shrink-0 bg-white/10 sm:block" />

          <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 transition hover:border-violet-400/60 hover:bg-violet-500/15 focus-within:border-violet-400/70 focus-within:bg-violet-500/20">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-violet-200">Trade</span>
            <span className="h-4 w-px bg-violet-400/25" />
            <span className="text-sm text-white/50">$</span>
            <input
              {...stake.inputProps}
              aria-label="Trade amount in USDC"
              className="w-14 bg-transparent font-tech text-sm font-bold text-white outline-none"
            />
            <span className="font-tech text-[9px] font-bold uppercase text-white/40">USDC</span>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="space-y-4">
          {grouped.length ? (
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...outcomeGroups, ...featuredGroups].map(([title, list]) => (
                <div key={title} id={`f1-event-${list[0].eventId ?? title.replace(/\W+/g, "-")}`} className="scroll-mt-4">
                  <F1MarketSection
                    title={title}
                    markets={list}
                    photoFor={photoFor}
                    stakeUsd={stake.resolved}
                    agentName={myAgent?.name}
                    agentPortrait={myAgentPortrait}
                    expandedId={expandedId}
                    onExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
