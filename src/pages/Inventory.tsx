import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { keccak256, stringToHex } from "viem";
import {
  ChevronDown,
  Coins,
  FileBox,
  Info,
  Layers,
  Package,
  RotateCcw,
  Search,
} from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import {
  InventoryListingCard,
  InventoryListingCardSkeleton,
} from "@/components/inventory/InventoryListingCard";
import { MarketplacePurchaseDialog } from "@/components/marketplace/MarketplacePurchaseDialog";
import { MARKETPLACE_ALL_GAMES } from "@/components/marketplace/MarketplaceFiltersPanel";
import { marketplaceApi } from "@/api/marketplaceApi";
import { gamesApi } from "@/api/gamesApi";
import type { Game, MarketplaceListing } from "@/types/api";
import {
  getMarketplacePaymentConfig,
  normalizeMarketplacePaymentToken,
  type MarketplacePaymentToken,
} from "@/lib/marketplacePayment";
import { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";

const LISTINGS_PER_PAGE = 100;

function getGameName(name: Game["name"]): string {
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
}

function gameLabel(gameId: string, games: Game[]): string {
  const g = games.find((x) => (x.identification ?? x.slug) === gameId);
  return g ? getGameName(g.name) : gameId;
}

function parseWei(value: string | null | undefined): bigint {
  if (!value) return 0n;
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function buildClientOrderId(input: string): `0x${string}` {
  return keccak256(stringToHex(input));
}

function getFriendlyPurchaseError(error: unknown): string {
  const fallback = "Purchase failed. Please try again.";
  const raw =
    error instanceof Error
      ? `${error.message} ${(error as { cause?: unknown }).cause ?? ""}`
      : String(error ?? "");
  const normalized = raw.toLowerCase();

  if (
    normalized.includes("user rejected") ||
    normalized.includes("user denied") ||
    normalized.includes("rejected")
  ) {
    return "Transaction canceled.";
  }
  if (normalized.includes("insufficient funds")) {
    return "Insufficient balance for this transaction.";
  }
  if (normalized.includes("network") || normalized.includes("chain")) {
    return "Wrong network selected. Please switch network and retry.";
  }
  return fallback;
}

const Inventory = () => {
  const [itemCategory, setItemCategory] = useState("All");
  const [itemGame, setItemGame] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceListing | null>(null);
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<MarketplacePaymentToken>("USDC");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const paymentConfig = useMemo(() => getMarketplacePaymentConfig(), []);
  const { activeWallet, canUsePrivy, privyAuthenticated, privyReady, sendPrivyTransaction } =
    usePrivyWalletTools();

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", "all", "inventory"],
    queryFn: () => gamesApi.getAll(1, 50),
    staleTime: 5 * 60_000,
  });

  const games = gamesData?.games ?? [];

  const { data: categorySource, isLoading: categoriesLoading } = useQuery({
    queryKey: ["marketplace", "category-source", itemGame || "all"],
    queryFn: () =>
      marketplaceApi.getListings({
        gameIdentification: itemGame || undefined,
        page: 1,
        perPage: LISTINGS_PER_PAGE,
      }),
    staleTime: 60_000,
  });

  const itemCategories = useMemo(() => {
    const scoped = categorySource?.listings ?? [];
    const cats = Array.from(new Set(scoped.map((i) => i.category).filter(Boolean)));
    return ["All", ...cats.sort((a, b) => a.localeCompare(b))];
  }, [categorySource]);

  const {
    data: listingsData,
    isLoading: listingsLoading,
    isError: listingsError,
    error: listingsErrorObj,
  } = useQuery({
    queryKey: ["marketplace", "listings", itemGame || "all", itemCategory],
    queryFn: () =>
      marketplaceApi.getListings({
        gameIdentification: itemGame || undefined,
        category: itemCategory === "All" ? undefined : itemCategory,
        page: 1,
        perPage: LISTINGS_PER_PAGE,
      }),
    staleTime: 30_000,
  });

  const listings = listingsData?.listings ?? [];

  const filteredListings = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((i) => {
      const name = i.name.toLowerCase();
      const short = (i.shortDescription ?? "").toLowerCase();
      return name.includes(q) || short.includes(q);
    });
  }, [listings, itemSearch]);

  const displayListings = useMemo(() => [...filteredListings].reverse(), [filteredListings]);

  const listingsCount = itemSearch.trim() ? filteredListings.length : (listingsData?.total ?? listings.length);
  const categoriesCount = Math.max(0, itemCategories.length - 1);
  const uniqueGames = useMemo(
    () => new Set(listings.map((l) => l.gameIdentification)).size,
    [listings],
  );

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of listings) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    const total = listings.length || 1;
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / total) * 100),
      }));
  }, [listings]);

  const donutSegments = useMemo(() => {
    const colors = ["#9a35ff", "#3b82f6", "#f59e0b", "#10b981", "#0ea5e9", "#64748b"];
    const circumference = 238.76;
    let offset = 0;
    return categoryBreakdown.map((seg, i) => {
      const dash = (seg.pct / 100) * circumference;
      const segment = { ...seg, dash, offset: -offset, color: colors[i % colors.length] };
      offset += dash;
      return segment;
    });
  }, [categoryBreakdown]);

  const handleBuy = (item: MarketplaceListing) => {
    setSelectedPaymentToken(normalizeMarketplacePaymentToken(item.currency));
    setSelectedItem(item);
  };

  const activeGameLabel = itemGame ? gameLabel(itemGame, games) : "All Games";

  const itemsPanel = listingsError ? (
    <InventoryEmpty
      message={`Could not load assets${
        listingsErrorObj instanceof Error ? `: ${listingsErrorObj.message}` : "."
      }`}
      error
    />
  ) : listingsLoading ? (
    <div className="grid auto-rows-min grid-cols-1 gap-4 content-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <InventoryListingCardSkeleton key={i} />
      ))}
    </div>
  ) : listings.length === 0 ? (
    <InventoryEmpty message="No assets available for this selection." />
  ) : filteredListings.length === 0 ? (
    <InventoryEmpty message="No items match your search. Try different keywords." />
  ) : (
    <div className="grid auto-rows-min grid-cols-1 content-start gap-4 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {displayListings.map((item) => (
        <InventoryListingCard
          key={item.id}
          item={item}
          onBuy={handleBuy}
          gameLabel={!itemGame ? gameLabel(item.gameIdentification, games) : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <DashboardTopbar />
      <section className="mx-auto flex h-full min-h-0 w-full max-w-[1284px] flex-1 flex-col overflow-hidden px-4 pb-4 pt-3 sm:px-6 lg:px-8">
      <div className="shrink-0 space-y-3">
      <div>
        <h1 className="font-tech text-3xl font-bold uppercase tracking-tight text-white">INVENTORY</h1>
        <p className="mt-1 text-[11px] font-medium text-white/55">
          Browse and purchase on-chain assets for your agents and games.
        </p>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">TOTAL ASSETS</span>
            <span className="font-tech block text-xl font-bold text-white">{listingsCount}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <Package className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">CATEGORIES</span>
            <span className="font-tech block text-xl font-bold text-white">{categoriesCount}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Coins className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">GAMES</span>
            <span className="font-tech block text-xl font-bold text-white">{uniqueGames || games.length}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <FileBox className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">ACTIVE FILTER</span>
            <span className="block truncate font-tech text-sm font-bold text-white">{activeGameLabel}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Layers className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      <div className="arena-panel flex flex-wrap items-center justify-between gap-3 border-white/8 bg-[#04080f]/95 p-3">
        <div className="flex max-w-full flex-wrap items-center gap-1">
          {categoriesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="h-7 w-20 animate-pulse rounded bg-white/5" />
              ))
            : itemCategories.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setItemCategory(tab)}
                  className={`rounded px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider transition ${
                    itemCategory === tab
                      ? "bg-[#9a35ff] text-white"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab === "All" ? "ALL ITEMS" : tab.toUpperCase()}
                </button>
              ))}
        </div>

        <div className="flex max-sm:w-full flex-wrap items-center gap-2">
          <div className="relative max-sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="w-[180px] max-sm:w-full rounded border border-white/8 bg-[#03070d]/60 py-1.5 pl-9 pr-4 text-xs font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/50"
            />
          </div>

          <div className="relative">
            <select
              value={itemGame}
              onChange={(e) => {
                setItemGame(e.target.value);
                setItemCategory("All");
              }}
              disabled={gamesLoading}
              className="cursor-pointer appearance-none rounded border border-white/8 bg-[#03070d]/60 py-1.5 pl-3 pr-8 text-xs font-semibold text-white/70 outline-none hover:text-white disabled:opacity-50"
            >
              <option value={MARKETPLACE_ALL_GAMES}>Game: All</option>
              {games.map((g) => {
                const id = g.identification ?? g.slug ?? "";
                if (!id) return null;
                return (
                  <option key={id} value={id}>
                    {getGameName(g.name)}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
          </div>

          <button
            type="button"
            onClick={() => {
              setItemGame(MARKETPLACE_ALL_GAMES);
              setItemCategory("All");
              setItemSearch("");
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/55 transition hover:border-purple-500/35 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row">
        <div className="arena-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-white/8 bg-[#04080f]/95 lg:min-h-0">
          <div className="shrink-0 border-b border-white/8 px-4 py-2.5">
            <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Available items</h2>
            <p className="mt-0.5 text-[10px] text-white/45">
              {listingsCount} listing{listingsCount === 1 ? "" : "s"}
              {itemSearch.trim() ? ` · matching "${itemSearch.trim()}"` : ""}
            </p>
          </div>
          <div className="arena-scroll h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
            {itemsPanel}
          </div>
        </div>

        <aside className="arena-panel flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-white/8 bg-[#04080f]/95 max-lg:max-h-[40vh] lg:w-[376px] lg:min-h-0 lg:max-h-none">
          <div className="shrink-0 border-b border-white/8 px-4 py-3">
            <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Details</h2>
            <p className="mt-0.5 text-[10px] text-white/45">Overview, filters &amp; tips</p>
          </div>
          <div className="arena-scroll h-0 min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
          <div className="arena-panel space-y-4 border-white/8 bg-[#04080f]/95 p-5">
            <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">
              INVENTORY OVERVIEW
            </h3>
            <div className="relative flex items-center justify-center py-2">
              <svg className="aspect-square w-full max-w-[150px]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="10" />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="10"
                    strokeDasharray={`${seg.dash} 238.76`}
                    strokeDashoffset={seg.offset}
                    transform="rotate(-90 50 50)"
                  />
                ))}
                <text x="50" y="47" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
                  {listingsCount}
                </text>
                <text x="50" y="58" textAnchor="middle" fill="rgba(255, 255, 255, 0.4)" fontSize="6" fontWeight="bold">
                  Total Items
                </text>
              </svg>
            </div>
            {categoryBreakdown.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-white/50">
                {categoryBreakdown.map((seg, i) => {
                  const colors = ["#9a35ff", "#3b82f6", "#f59e0b", "#10b981", "#0ea5e9", "#64748b"];
                  return (
                    <div key={seg.name} className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
                        <span className="truncate capitalize">{seg.name}</span>
                      </div>
                      <span className="font-tech text-white">{seg.pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-[10px] text-white/40">No category data yet.</p>
            )}
          </div>

          <div className="arena-panel space-y-3 border-white/8 bg-[#04080f]/95 p-5">
            <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">FILTERS</h3>
            <div className="space-y-2 text-[10px] font-semibold text-white/55">
              <div className="flex justify-between">
                <span>Game</span>
                <span className="font-tech text-white">{activeGameLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-tech capitalize text-white">
                  {itemCategory === "All" ? "All items" : itemCategory}
                </span>
              </div>
              {itemSearch.trim() ? (
                <div className="flex justify-between">
                  <span>Search</span>
                  <span className="font-tech text-white">&quot;{itemSearch.trim()}&quot;</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="arena-panel flex items-center gap-3 border-white/8 bg-[#04080f]/95 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">
                Connect wallet to purchase assets.
              </h4>
              <p className="text-[9px] font-semibold leading-none text-white/40">
                Items are delivered on-chain after a successful transaction.
              </p>
            </div>
          </div>
          </div>
        </aside>
      </div>
      </section>

      <MarketplacePurchaseDialog
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        selectedPaymentToken={selectedPaymentToken}
        onPaymentTokenChange={setSelectedPaymentToken}
        paymentConfig={paymentConfig}
        canUsePrivy={canUsePrivy}
        privyReady={privyReady}
        privyAuthenticated={privyAuthenticated}
        activeWallet={activeWallet}
        sendPrivyTransaction={sendPrivyTransaction}
        isPurchasing={isPurchasing}
        onPurchasingChange={setIsPurchasing}
        buildClientOrderId={buildClientOrderId}
        parseWei={parseWei}
        getFriendlyPurchaseError={getFriendlyPurchaseError}
      />
    </div>
  );
};

function InventoryEmpty({ message, error }: { message: string; error?: boolean }) {
  return (
    <div
      className={`arena-panel flex min-h-[280px] items-center justify-center border-dashed p-8 text-center ${
        error ? "border-red-500/30 bg-red-950/10" : "border-white/15 bg-[#04080f]/50"
      }`}
    >
      <p className="max-w-md text-sm text-white/55">{message}</p>
    </div>
  );
}

export default Inventory;
