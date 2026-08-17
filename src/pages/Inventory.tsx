import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { keccak256, stringToHex } from "viem";
import { Package, ShieldCheck } from "lucide-react";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import {
  InventoryListingCard,
  InventoryListingCardSkeleton,
} from "@/components/inventory/InventoryListingCard";
import { InventoryStatsRail } from "@/components/inventory/InventoryStatsRail";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import {
  DEFAULT_INVENTORY_SORT,
  sortListings,
  type InventorySort,
} from "@/components/inventory/inventorySort";
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

const ITEMS_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4";

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

function getGameId(game: Game): string {
  return game.identification ?? game.slug ?? "";
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
  const [searchParams] = useSearchParams();
  const [itemCategory, setItemCategory] = useState("All");
  const [itemGame, setItemGame] = useState(() => searchParams.get("game") ?? "");
  const [itemSearch, setItemSearch] = useState("");
  const [sort, setSort] = useState<InventorySort>(DEFAULT_INVENTORY_SORT);
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
  const marketplaceGameIds = useMemo(
    () => games.map(getGameId).filter(Boolean),
    [games],
  );

  const { data: categorySource, isLoading: categoriesLoading } = useQuery({
    queryKey: ["marketplace", "category-source", itemGame || "all", marketplaceGameIds],
    queryFn: async () => {
      if (itemGame || marketplaceGameIds.length === 0) {
        return marketplaceApi.getListings({
          gameIdentification: itemGame || undefined,
          page: 1,
          perPage: LISTINGS_PER_PAGE,
        });
      }

      const responses = await Promise.all(
        marketplaceGameIds.map((gameIdentification) =>
          marketplaceApi.getListings({
            gameIdentification,
            page: 1,
            perPage: LISTINGS_PER_PAGE,
          }),
        ),
      );

      return {
        listings: responses.flatMap((response) => response.listings),
        total: responses.reduce((sum, response) => sum + response.total, 0),
        page: 1,
        perPage: LISTINGS_PER_PAGE * marketplaceGameIds.length,
      };
    },
    enabled: itemGame ? true : !gamesLoading,
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
    queryKey: ["marketplace", "listings", itemGame || "all", itemCategory, marketplaceGameIds],
    queryFn: async () => {
      const category = itemCategory === "All" ? undefined : itemCategory;
      if (itemGame || marketplaceGameIds.length === 0) {
        return marketplaceApi.getListings({
          gameIdentification: itemGame || undefined,
          category,
          page: 1,
          perPage: LISTINGS_PER_PAGE,
        });
      }

      const responses = await Promise.all(
        marketplaceGameIds.map((gameIdentification) =>
          marketplaceApi.getListings({
            gameIdentification,
            category,
            page: 1,
            perPage: LISTINGS_PER_PAGE,
          }),
        ),
      );

      return {
        listings: responses.flatMap((response) => response.listings),
        total: responses.reduce((sum, response) => sum + response.total, 0),
        page: 1,
        perPage: LISTINGS_PER_PAGE * marketplaceGameIds.length,
      };
    },
    enabled: itemGame ? true : !gamesLoading,
    staleTime: 30_000,
  });

  const listings = listingsData?.listings ?? [];
  const inventoryBootstrapping =
    gamesLoading || listingsLoading || (!listingsError && listingsData === undefined);

  const filteredListings = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((i) => {
      const name = i.name.toLowerCase();
      const short = (i.shortDescription ?? "").toLowerCase();
      return name.includes(q) || short.includes(q);
    });
  }, [listings, itemSearch]);

  const displayListings = useMemo(() => sortListings(filteredListings, sort), [filteredListings, sort]);

  const listingsCount = itemSearch.trim() ? filteredListings.length : (listingsData?.total ?? listings.length);
  const categoriesCount = Math.max(0, itemCategories.length - 1);
  const uniqueGames = useMemo(
    () => new Set(listings.map((l) => l.gameIdentification)).size,
    [listings],
  );

  const activeGameLabel = itemGame ? gameLabel(itemGame, games) : "All games";

  const handleBuy = (item: MarketplaceListing) => {
    setSelectedPaymentToken(normalizeMarketplacePaymentToken(item.currency));
    setSelectedItem(item);
  };

  const handleReset = () => {
    setItemGame(MARKETPLACE_ALL_GAMES);
    setItemCategory("All");
    setItemSearch("");
    setSort(DEFAULT_INVENTORY_SORT);
  };

  const handleGameChange = (gameId: string) => {
    setItemGame(gameId);
    setItemCategory("All");
  };

  const itemsGrid = listingsError ? (
    <InventoryEmpty
      title="Assets unavailable"
      message={
        listingsErrorObj instanceof Error
          ? listingsErrorObj.message
          : "The marketplace did not respond. Try again in a moment."
      }
      error
    />
  ) : inventoryBootstrapping ? (
    <div className={ITEMS_GRID_CLASS}>
      {Array.from({ length: 12 }).map((_, i) => (
        <InventoryListingCardSkeleton key={i} />
      ))}
    </div>
  ) : listings.length === 0 ? (
    <InventoryEmpty
      title="Nothing listed yet"
      message={`No assets are on sale ${itemGame ? `for ${activeGameLabel}` : "right now"}${
        itemCategory === "All" ? "" : ` in ${itemCategory}`
      }.`}
      onReset={itemGame || itemCategory !== "All" ? handleReset : undefined}
    />
  ) : filteredListings.length === 0 ? (
    <InventoryEmpty
      title="No matches"
      message={`Nothing matched “${itemSearch.trim()}”. Try a shorter or different keyword.`}
      onReset={handleReset}
    />
  ) : (
    <div className={ITEMS_GRID_CLASS}>
      {displayListings.map((item) => (
        <InventoryListingCard
          key={item.id}
          item={item}
          gameName={gameLabel(item.gameIdentification, games)}
          onBuy={handleBuy}
        />
      ))}
    </div>
  );

  return (
    <ArenaPageLayout contentClassName="max-w-none">
      <div className="inventory-hero-panel px-5 py-5 sm:px-6" data-tour="inventory-summary">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9a35ff]/70 to-transparent" aria-hidden />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9a35ff]/35 bg-[#9a35ff]/10 px-3 py-1 font-tech text-[9px] font-bold uppercase tracking-[0.22em] text-[#d6acff]">
              <Package className="h-3 w-3" />
              Marketplace
            </div>
            <h1 className="mt-2.5 font-tech text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl">
              Inventory
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/55">
              Browse on-chain assets, preview listings, and purchase gear for your agents and games.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-white/40">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00e08a]" />
              Every purchase settles on-chain from your connected wallet
            </p>
          </div>
          <InventoryStatsRail
            className="shrink-0 lg:w-[520px]"
            listingsCount={listingsCount}
            categoriesCount={categoriesCount}
            gamesCount={uniqueGames || games.length}
            activeGameLabel={activeGameLabel}
            isLoading={inventoryBootstrapping}
          />
        </div>
      </div>

      <div className="w-full space-y-4">
        <div data-tour="inventory-filters">
          <InventoryToolbar
            itemCategories={itemCategories}
            itemCategory={itemCategory}
            onCategoryChange={setItemCategory}
            categoriesLoading={categoriesLoading}
            itemSearch={itemSearch}
            onSearchChange={setItemSearch}
            itemGame={itemGame}
            onGameChange={handleGameChange}
            sort={sort}
            onSortChange={setSort}
            games={games}
            gamesLoading={gamesLoading}
            getGameName={getGameName}
            onReset={handleReset}
          />
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-base font-bold text-white">
            {itemCategory === "All" ? "Available items" : itemCategory}
          </h2>
          <p className="text-xs text-white/45">
            {inventoryBootstrapping
              ? "Loading listings…"
              : `${displayListings.length} of ${listingsCount} listing${listingsCount === 1 ? "" : "s"}`}
            {!inventoryBootstrapping && itemSearch.trim() ? ` for “${itemSearch.trim()}”` : ""}
          </p>
        </div>

        <div className="pb-6" data-tour="inventory-grid">{itemsGrid}</div>
      </div>

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
    </ArenaPageLayout>
  );
};

function InventoryEmpty({
  title,
  message,
  error,
  onReset,
}: {
  title: string;
  message: string;
  error?: boolean;
  onReset?: () => void;
}) {
  return (
    <div
      className={`col-span-full flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-10 text-center ${
        error
          ? "border-red-500/30 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.12),transparent_55%),#14080c]"
          : "border-white/12 bg-[radial-gradient(circle_at_50%_0%,rgba(154,53,255,0.08),transparent_55%)] bg-[#04080f]/80"
      }`}
    >
      <div
        className={`grid h-14 w-14 place-items-center rounded-2xl border ${
          error ? "border-red-400/30 bg-red-950/30" : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <Package className={`h-7 w-7 ${error ? "text-red-400/70" : "text-white/25"}`} />
      </div>
      <div>
        <h3 className={`text-base font-bold ${error ? "text-red-200" : "text-white/85"}`}>{title}</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-white/50">{message}</p>
      </div>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-1 inline-flex h-9 items-center rounded-lg border border-[#9a35ff]/40 bg-[#9a35ff]/12 px-4 text-xs font-bold text-[#d6acff] transition hover:border-[#9a35ff]/70 hover:bg-[#9a35ff]/20"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

export default Inventory;
