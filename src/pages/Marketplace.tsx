import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { keccak256, stringToHex } from "viem";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import LiveEcosystemLayer from "@/components/LiveEcosystemLayer";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { MarketplaceFiltersPanel, MARKETPLACE_ALL_GAMES } from "@/components/marketplace/MarketplaceFiltersPanel";
import {
  MarketplaceListingCard,
  MarketplaceListingCardSkeleton,
} from "@/components/marketplace/MarketplaceListingCard";
import { MarketplacePurchaseDialog } from "@/components/marketplace/MarketplacePurchaseDialog";
import { marketplaceApi } from "@/api/marketplaceApi";
import { gamesApi } from "@/api/gamesApi";
import type { Game, MarketplaceListing } from "@/types/api";
import {
  getMarketplacePaymentConfig,
  normalizeMarketplacePaymentToken,
  type MarketplacePaymentToken,
} from "@/lib/marketplacePayment";
import { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";

function getGameName(name: Game["name"]): string {
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
}

function gameLabel(gameId: string, games: Game[]): string {
  const g = games.find((x) => (x.identification ?? x.slug) === gameId);
  return g ? getGameName(g.name) : gameId;
}

const LISTINGS_PER_PAGE = 100;

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
    normalized.includes("rejected the request") ||
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

function MarketplaceGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-30"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -20%, hsl(195 100% 45% / 0.1), transparent 55%), radial-gradient(ellipse 80% 50% at 0% 60%, hsl(270 80% 45% / 0.08), transparent 45%)",
      }}
    />
  );
}

const Marketplace = () => {
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
    queryKey: ["games", "all", "marketplace"],
    queryFn: () => gamesApi.getAll(1, 50),
    staleTime: 5 * 60_000,
  });

  const games = gamesData?.games ?? [];

  const gamesForSelect = games;

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

  const showEmpty = !listingsLoading && !listingsError && listings.length === 0;
  const showNoSearchMatches =
    !listingsLoading && !listingsError && listings.length > 0 && filteredListings.length === 0;

  const activeGameLabel = itemGame ? gameLabel(itemGame, games) : "All Games";
  const listingsCount = itemSearch.trim() ? filteredListings.length : (listingsData?.total ?? listings.length);
  const categoriesCount = Math.max(0, itemCategories.length - 1);

  const handleBuy = (item: MarketplaceListing) => {
    setSelectedPaymentToken(normalizeMarketplacePaymentToken(item.currency));
    setSelectedItem(item);
  };

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 z-0">
        <AutoPlayVideo
          src="/videos/SC_5.mp4"
          loop
          className="absolute inset-0 h-full w-full object-cover opacity-25 saturate-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background/90" />
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(195 100% 50% / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(195 100% 50% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <MarketplaceGlow />

      <LiveEcosystemLayer compact className="relative z-10 pt-[calc(4rem+env(safe-area-inset-top,0px))]" />

      <main className="relative z-10 mx-auto max-w-[1600px] space-y-6 px-4 pb-12 pt-4 sm:px-6 md:px-8 md:pb-16 lg:space-y-8 lg:pb-20">
        <MarketplaceHero
          gameLabel={activeGameLabel}
          listingsCount={listingsCount}
          categoriesCount={categoriesCount}
          isLoading={listingsLoading}
        />

        <div className="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <MarketplaceFiltersPanel
            itemSearch={itemSearch}
            onSearchChange={setItemSearch}
            itemGame={itemGame}
            onGameChange={(id) => {
              setItemGame(id);
              setItemCategory("All");
            }}
            itemCategory={itemCategory}
            onCategoryChange={setItemCategory}
            itemCategories={itemCategories}
            gamesForSelect={gamesForSelect}
            gamesLoading={gamesLoading}
            categoriesLoading={categoriesLoading}
            onReset={() => {
              setItemGame(MARKETPLACE_ALL_GAMES);
              setItemCategory("All");
              setItemSearch("");
            }}
            getGameName={getGameName}
          />

          <section className="glass-panel min-h-[420px] rounded-2xl p-4 sm:p-5 lg:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-lg font-black tracking-wide text-foreground">
                  AVAILABLE ASSETS
                </h2>
                <p className="text-xs text-muted-foreground">
                  {itemSearch.trim()
                    ? `${filteredListings.length} match${filteredListings.length === 1 ? "" : "es"} for "${itemSearch.trim()}"`
                    : `${listingsCount} listing${listingsCount === 1 ? "" : "s"} · ${itemCategory === "All" ? "all categories" : itemCategory}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-[10px] font-display font-semibold tracking-[0.08em] text-neon-cyan">
                  {activeGameLabel}
                </span>
                {itemCategory !== "All" ? (
                  <span className="rounded-full border border-white/15 bg-background/40 px-3 py-1 text-[10px] font-display font-semibold tracking-[0.08em] text-foreground/90">
                    {itemCategory}
                  </span>
                ) : null}
              </div>
            </div>

            {gamesLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MarketplaceListingCardSkeleton key={i} />
                ))}
              </div>
            ) : listingsError ? (
              <EmptyState
                message={`Could not load marketplace assets${
                  listingsErrorObj instanceof Error ? `: ${listingsErrorObj.message}` : "."
                }`}
                error
              />
            ) : listingsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MarketplaceListingCardSkeleton key={i} />
                ))}
              </div>
            ) : showEmpty ? (
              <EmptyState message="No assets available for this selection." />
            ) : showNoSearchMatches ? (
              <EmptyState message="No items match your search. Try different keywords." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {displayListings.map((item) => (
                  <MarketplaceListingCard
                    key={item.id}
                    item={item}
                    onBuy={handleBuy}
                    gameLabel={!itemGame ? gameLabel(item.gameIdentification, games) : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

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

function EmptyState({ message, error }: { message: string; error?: boolean }) {
  return (
    <div
      className={`flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center ${
        error ? "border-destructive/40 bg-destructive/5" : "border-white/15 bg-background/20"
      }`}
    >
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default Marketplace;
