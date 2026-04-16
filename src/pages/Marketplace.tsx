import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import AIScanLine from "@/components/AIScanLine";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import marketplaceAssets from "@/demo/marketplace-assets.json";

type DemoStoreItem = {
  name: string;
  image_name: string;
  price: string;
  category: string;
  currency: string;
  game_identification?: string;
};

const demoItems = (marketplaceAssets.items as DemoStoreItem[]) ?? [];
const demoImageModules = import.meta.glob("../demo/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP,avif,AVIF}", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const GAME_FILTERS = [
  "warzone_warriors",
  "highway_hustle",
  "guess_the_ai",
  "zero_dash",
  "zero_g_pool",
  "robo_wars",
] as const;

function humanizeGameId(id?: string): string {
  if (!id) return "All Games";
  return id.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveItemImageSrc(imageName: string): string[] {
  const clean = imageName.replace(/^\//, "").trim();
  const entries = Object.entries(demoImageModules);
  const exact = entries.find(([path]) => path.toLowerCase().endsWith(`/${clean.toLowerCase()}`));
  if (exact) return [exact[1]];

  const base = clean.replace(/\.[^.]+$/, "");
  const candidates = [
    clean,
    `${base}.png`,
    `${base}.webp`,
    `${base}.jpg`,
    `${base.replace("-clean", "")}.png`,
    `${base.replace("-clean", "")}.webp`,
    `${base.replace(/^coin-/, "coins-")}.png`,
    `${base.replace(/^coins-/, "coin-")}.png`,
  ].map((s) => s.toLowerCase());
  const variant = entries.find(([path]) => {
    const file = path.split("/").pop()?.toLowerCase() ?? "";
    return candidates.includes(file);
  });
  if (variant) return [variant[1]];

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(base);
  const fuzzy = entries.find(([path]) => {
    const file = path.split("/").pop() ?? "";
    const noExt = file.replace(/\.[^.]+$/, "");
    const n = norm(noExt);
    return n === target || n.includes(target) || target.includes(n);
  });
  if (fuzzy) return [fuzzy[1]];
  return [];
}

const Marketplace = () => {
  const [itemCategory, setItemCategory] = useState("All");
  const [itemGame, setItemGame] = useState<string>(GAME_FILTERS[0]);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<DemoStoreItem | null>(null);

  const itemCategories = useMemo(() => {
    const scoped = demoItems.filter((i) => i.game_identification === itemGame);
    const cats = Array.from(new Set(scoped.map((i) => i.category).filter(Boolean)));
    return ["All", ...cats];
  }, [itemGame]);

  const filteredDemoItems = useMemo(() => {
    return demoItems.filter((i) => {
      const matchCat = itemCategory === "All" || i.category === itemCategory;
      const matchGame = i.game_identification === itemGame;
      const matchSearch = i.name.toLowerCase().includes(itemSearch.toLowerCase());
      return matchCat && matchGame && matchSearch;
    });
  }, [itemCategory, itemGame, itemSearch]);

  const selectedItemImage = selectedItem ? resolveItemImageSrc(selectedItem.image_name)[0] : "";

  return (
    <div className="min-h-screen bg-background relative lg:h-screen lg:overflow-hidden">
      <Navbar />
      <section className="relative pt-24 pb-8 z-10 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:pb-4">
        <AIScanLine />
        <div className="absolute inset-0 pointer-events-none">
          <AutoPlayVideo src="/videos/SC_5.mp4" loop className="h-full w-full object-cover opacity-[0.13]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(195_100%_60%/.15),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(260_100%_60%/.12),transparent_45%)]" />
          <div className="absolute inset-0 bg-background/75" />
        </div>
        {/* <div className="absolute top-32 right-0 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" /> */}

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
                    <select
                      value={itemGame}
                      onChange={(e) => {
                        setItemGame(e.target.value);
                        setItemCategory("All");
                      }}
                      className="h-9 w-full rounded-lg border border-neon-cyan/25 bg-[hsl(220_42%_11%/.75)] px-2.5 text-xs text-foreground outline-none transition-all focus:border-neon-cyan/70"
                    >
                      {GAME_FILTERS.map((gid) => (
                        <option key={gid} value={gid}>
                          {humanizeGameId(gid)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="mb-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Item Type</p>
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
                          {cat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="lg:h-full lg:overflow-hidden">
                <div className="z-20 mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-background/70 px-2 py-1.5 backdrop-blur">
                  <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/12 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.1em] text-neon-cyan">
                    {humanizeGameId(itemGame)}
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

                <div className="scrollbar-market pr-1 lg:h-[calc(100%-2.25rem)] lg:overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {filteredDemoItems.map((item, idx) => {
                      const srcs = resolveItemImageSrc(item.image_name);
                      return (
                        <div
                          key={`${item.name}-${idx}`}
                          className="group rounded-xl border border-white/12 bg-[linear-gradient(160deg,hsl(220_42%_15%/.9),hsl(220_46%_11%/.98))] p-2 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/50 hover:shadow-[0_12px_24px_hsl(195_100%_60%/0.14)]"
                        >
                          <div className="relative mb-1.5 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-background/55">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,hsl(195_100%_60%/.2),transparent_58%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            {srcs[0] ? (
                              <img
                                src={srcs[0]}
                                alt={item.name}
                                className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <p className="px-2 text-center text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                                {item.image_name}
                              </p>
                            )}
                          </div>
                          <p className="truncate text-[11px] font-display font-bold text-foreground">{item.name}</p>
                          <div className="mt-1 flex items-center justify-between gap-1">
                            <span className="truncate rounded-full border border-white/10 bg-background/35 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-[0.08em] text-muted-foreground">
                              {item.category}
                            </span>
                            <span className="text-[11px] font-display font-bold text-neon-cyan">{item.price}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="mt-1.5 w-full rounded-lg border border-neon-cyan/35 bg-neon-cyan/12 py-1 text-[9px] font-display font-semibold tracking-[0.1em] text-neon-cyan transition-all hover:bg-neon-cyan/25 hover:shadow-[0_0_12px_hsl(195_100%_60%/0.2)]"
                          >
                            BUY
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {filteredDemoItems.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-background/25 px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No items found for the current filters. Try another game, type, or search.
                    </p>
                  </div>
                ) : null}
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
                {selectedItemImage ? (
                  <img src={selectedItemImage} alt={selectedItem.name} className="h-full w-full object-contain p-1.5" />
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
