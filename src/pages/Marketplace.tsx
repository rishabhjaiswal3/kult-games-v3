import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import AIScanLine from "@/components/AIScanLine";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { marketplaceApi } from "@/api/marketplaceApi";
import { gamesApi } from "@/api/gamesApi";
import type { Game, MarketplaceListing } from "@/types/api";

function getGameName(name: Game["name"]): string {
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
}

function gameLabel(gameId: string, games: Game[]): string {
  const g = games.find((x) => (x.identification ?? x.slug) === gameId);
  return g ? getGameName(g.name) : gameId;
}

const LISTINGS_PER_PAGE = 100;

/** Prefer this game in the marketplace filter when the catalog includes it (matches API `identification`). */
const DEFAULT_MARKETPLACE_GAME_ID = "warzonewarriors";

const Marketplace = () => {
  const [itemCategory, setItemCategory] = useState("All");
  const [itemGame, setItemGame] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceListing | null>(null);

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", "all", "marketplace"],
    queryFn: () => gamesApi.getAll(1, 50),
    staleTime: 5 * 60_000,
  });

  const games = gamesData?.games ?? [];

  const gamesForSelect = useMemo(() => {
    const idOf = (g: Game) => (g.identification ?? g.slug ?? "").toLowerCase();
    const preferred = games.find((g) => idOf(g) === DEFAULT_MARKETPLACE_GAME_ID);
    if (!preferred) return games;
    const rest = games.filter((g) => idOf(g) !== DEFAULT_MARKETPLACE_GAME_ID);
    return [preferred, ...rest];
  }, [games]);

  useEffect(() => {
    if (itemGame || games.length === 0) return;
    const idOf = (g: Game) => g.identification ?? g.slug ?? "";
    const preferred = games.find((g) => idOf(g).toLowerCase() === DEFAULT_MARKETPLACE_GAME_ID);
    const id = idOf(preferred ?? games[0]);
    if (id) setItemGame(id);
  }, [games, itemGame]);

  const { data: categorySource, isLoading: categoriesLoading } = useQuery({
    queryKey: ["marketplace", "category-source", itemGame],
    queryFn: () =>
      marketplaceApi.getListings({
        gameIdentification: itemGame,
        page: 1,
        perPage: LISTINGS_PER_PAGE,
      }),
    enabled: Boolean(itemGame),
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
    queryKey: ["marketplace", "listings", itemGame, itemCategory],
    queryFn: () =>
      marketplaceApi.getListings({
        gameIdentification: itemGame,
        category: itemCategory === "All" ? undefined : itemCategory,
        page: 1,
        perPage: LISTINGS_PER_PAGE,
      }),
    enabled: Boolean(itemGame),
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

  const showEmpty =
    Boolean(itemGame) && !listingsLoading && !listingsError && listings.length === 0;
  const showNoSearchMatches =
    Boolean(itemGame) &&
    !listingsLoading &&
    !listingsError &&
    listings.length > 0 &&
    filteredListings.length === 0;

  return (
    <div className="min-h-screen bg-background relative lg:h-screen lg:overflow-hidden">
      <Navbar />
      <section className="relative pt-24 pb-2 z-10 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:pb-2">
        <AIScanLine />
        <div className="absolute inset-0 pointer-events-none">
          <AutoPlayVideo src="/videos/SC_5.mp4" loop className="h-full w-full object-cover opacity-[0.13]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(195_100%_60%/.15),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(260_100%_60%/.12),transparent_45%)]" />
          <div className="absolute inset-0 bg-background/75" />
        </div>
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 relative z-10 lg:h-full">
          <div className="rounded-3xl border border-neon-cyan/25 bg-[linear-gradient(145deg,hsl(220_42%_12%/.9),hsl(220_45%_9%/.96))] p-3 shadow-[0_20px_60px_hsl(220_70%_2%/0.45)] sm:p-4 lg:p-5 lg:h-full">
            <div className="grid items-stretch gap-4 xl:grid-cols-[280px_minmax(0,1fr)] lg:h-full">
              <aside className="rounded-2xl border border-neon-cyan/20 bg-[linear-gradient(155deg,hsl(220_42%_13%/.92),hsl(220_45%_10%/.88))] p-3 lg:h-full lg:min-h-full">
                <div className="mb-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/25 bg-neon-cyan/10 px-2.5 py-1">
                    <Filter className="h-3.5 w-3.5 text-neon-cyan" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-neon-cyan">Smart Filters</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-white/15 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      setItemCategory("All");
                      setItemSearch("");
                    }}
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Search item..."
                    className="h-9 w-full rounded-lg border border-neon-cyan/25 bg-[hsl(220_42%_11%/.75)] px-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-neon-cyan/70 focus:shadow-[0_0_0_3px_hsl(195_100%_60%/0.14)]"
                  />

                  <div>
                    <p className="mb-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Game</p>
                    {gamesLoading ? (
                      <Skeleton className="h-9 w-full rounded-lg" />
                    ) : games.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No games available.</p>
                    ) : (
                      <select
                        value={itemGame}
                        onChange={(e) => {
                          setItemGame(e.target.value);
                          setItemCategory("All");
                        }}
                        className="h-9 w-full rounded-lg border border-neon-cyan/25 bg-[hsl(220_42%_11%/.75)] px-2.5 text-xs text-foreground outline-none transition-all focus:border-neon-cyan/70"
                      >
                        {gamesForSelect.map((g) => {
                          const id = g.identification ?? g.slug ?? "";
                          if (!id) return null;
                          return (
                            <option key={id} value={id}>
                              {getGameName(g.name)}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  <div>
                    <p className="mb-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Item Type</p>
                    {categoriesLoading && itemGame ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 rounded-md" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {itemCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setItemCategory(cat)}
                            className={`rounded-md border px-2 py-1.5 text-[9px] font-display font-semibold tracking-[0.08em] text-left transition-all ${
                              itemCategory === cat
                                ? "border-neon-cyan/60 bg-neon-cyan/20 text-neon-cyan shadow-[0_0_12px_hsl(195_100%_60%/0.18)]"
                                : "border-neon-cyan/20 bg-[hsl(220_42%_11%/.62)] text-muted-foreground hover:border-neon-cyan/40 hover:text-foreground"
                            }`}
                          >
                            {cat === "All" ? "ALL" : cat.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              <div className="lg:h-full lg:overflow-hidden">
                <div className="z-20 mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-background/70 px-2 py-1.5 backdrop-blur">
                  <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/12 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.1em] text-neon-cyan">
                    {itemGame ? gameLabel(itemGame, games) : "—"}
                  </span>
                  <span className="rounded-full border border-white/20 bg-background/45 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.1em] text-foreground/90">
                    {itemCategory === "All" ? "All Types" : itemCategory}
                  </span>
                  {itemSearch ? (
                    <span className="rounded-full border border-white/20 bg-background/45 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.1em] text-foreground/90">
                      Search: {itemSearch}
                    </span>
                  ) : null}
                </div>

                <div className="scrollbar-market pr-1 pb-3 sm:pb-4 lg:pb-5 lg:h-[calc(100%-2.25rem)] lg:overflow-y-auto">
                  {gamesLoading ? (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-card/40 p-2">
                          <Skeleton className="mb-1.5 aspect-square w-full rounded-lg" />
                          <Skeleton className="h-3 w-[85%]" />
                          <Skeleton className="mt-2 h-3 w-[55%]" />
                          <Skeleton className="mt-2 h-7 w-full rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : !itemGame ? (
                    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-background/25 px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">Select a game to browse marketplace assets.</p>
                    </div>
                  ) : listingsError ? (
                    <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-background/25 px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Could not load marketplace assets
                        {listingsErrorObj instanceof Error ? `: ${listingsErrorObj.message}` : "."}
                      </p>
                    </div>
                  ) : listingsLoading && itemGame ? (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-card/40 p-2">
                          <Skeleton className="mb-1.5 aspect-square w-full rounded-lg" />
                          <Skeleton className="h-3 w-[85%]" />
                          <Skeleton className="mt-2 h-3 w-[55%]" />
                          <Skeleton className="mt-2 h-7 w-full rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : showEmpty ? (
                    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-background/25 px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No assets available for this selection.</p>
                    </div>
                  ) : showNoSearchMatches ? (
                    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-background/25 px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No items match your search. Try different keywords.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                      {filteredListings.map((item) => (
                        <div
                          key={item.id}
                          className="group rounded-xl border border-white/12 bg-[linear-gradient(160deg,hsl(220_42%_15%/.9),hsl(220_46%_11%/.98))] p-2 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/50 hover:shadow-[0_12px_24px_hsl(195_100%_60%/0.14)]"
                        >
                          <div className="relative mb-1.5 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-background/55">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,hsl(195_100%_60%/.2),transparent_58%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            {item.assetUrl ? (
                              <img
                                src={item.assetUrl}
                                alt={item.name}
                                className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <p className="px-2 text-center text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground">No preview</p>
                            )}
                          </div>
                          <p className="truncate text-[11px] font-display font-bold text-foreground">{item.name}</p>
                          <div className="mt-1 flex items-center justify-between gap-1">
                            <span className="truncate rounded-full border border-white/10 bg-background/35 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-[0.08em] text-muted-foreground">
                              {item.category}
                            </span>
                            <span className="text-[11px] font-display font-bold text-neon-cyan">
                              {item.price} {item.currency}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="mt-1.5 w-full rounded-lg border border-neon-cyan/35 bg-neon-cyan/12 py-1 text-[9px] font-display font-semibold tracking-[0.1em] text-neon-cyan transition-all hover:bg-neon-cyan/25 hover:shadow-[0_0_12px_hsl(195_100%_60%/0.2)]"
                          >
                            BUY
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md border border-neon-cyan/30 bg-[linear-gradient(160deg,hsl(220_45%_10%/.98),hsl(195_100%_12%/.9))] p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg tracking-wide">Confirm purchase</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedItem ? `Buy ${selectedItem.name} for ${selectedItem.price} ${selectedItem.currency}?` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedItem ? (
            <div className="mt-2 flex items-center gap-4 rounded-xl border border-white/10 bg-background/35 p-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-background/60">
                {selectedItem.assetUrl ? (
                  <img src={selectedItem.assetUrl} alt={selectedItem.name} className="h-full w-full object-contain p-1.5" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[8px] font-mono uppercase tracking-[0.08em] text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-display font-bold text-foreground">{selectedItem.name}</p>
                <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.08em] text-muted-foreground">{selectedItem.category}</p>
                <p className="mt-1 text-sm font-display font-semibold text-neon-cyan">
                  {selectedItem.price} {selectedItem.currency}
                </p>
              </div>
            </div>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg py-2.5 text-xs font-display font-semibold tracking-[0.1em] btn-eye-outline"
              onClick={() => setSelectedItem(null)}
            >
              CANCEL
            </button>
            <button
              type="button"
              className="rounded-lg py-2.5 text-xs font-display font-semibold tracking-[0.1em] btn-eye"
              onClick={() => setSelectedItem(null)}
            >
              CONFIRM
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
