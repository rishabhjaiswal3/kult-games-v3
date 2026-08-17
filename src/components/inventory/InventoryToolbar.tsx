import { ArrowDownWideNarrow, ChevronDown, Gamepad2, RotateCcw, Search } from "lucide-react";
import {
  DEFAULT_INVENTORY_SORT,
  INVENTORY_SORTS,
  type InventorySort,
} from "@/components/inventory/inventorySort";
import { MARKETPLACE_ALL_GAMES } from "@/components/marketplace/MarketplaceFiltersPanel";
import type { Game } from "@/types/api";

type InventoryToolbarProps = {
  itemCategories: string[];
  itemCategory: string;
  onCategoryChange: (category: string) => void;
  categoriesLoading: boolean;
  itemSearch: string;
  onSearchChange: (value: string) => void;
  itemGame: string;
  onGameChange: (gameId: string) => void;
  sort: InventorySort;
  onSortChange: (sort: InventorySort) => void;
  games: Game[];
  gamesLoading: boolean;
  getGameName: (name: Game["name"]) => string;
  onReset: () => void;
};

const SELECT_CLASS =
  "h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#03070d]/80 py-0 pl-9 pr-9 text-xs font-semibold text-white/80 outline-none transition hover:text-white focus:border-[#9a35ff]/55 focus:ring-1 focus:ring-[#9a35ff]/25 disabled:opacity-50";

export function InventoryToolbar({
  itemCategories,
  itemCategory,
  onCategoryChange,
  categoriesLoading,
  itemSearch,
  onSearchChange,
  itemGame,
  onGameChange,
  sort,
  onSortChange,
  games,
  gamesLoading,
  getGameName,
  onReset,
}: InventoryToolbarProps) {
  const hasFilters =
    Boolean(itemSearch.trim()) ||
    itemCategory !== "All" ||
    Boolean(itemGame) ||
    sort !== DEFAULT_INVENTORY_SORT;

  return (
    <div className="inventory-toolbar-panel flex flex-col gap-3 rounded-xl p-3 backdrop-blur-md sm:p-3.5">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,190px)_minmax(0,200px)]">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            placeholder="Search items by name or description…"
            value={itemSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-[#03070d]/80 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-[#9a35ff]/55 focus:ring-1 focus:ring-[#9a35ff]/25"
          />
        </div>

        <div className="relative min-w-0">
          <Gamepad2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <select
            value={itemGame}
            onChange={(e) => onGameChange(e.target.value)}
            disabled={gamesLoading}
            aria-label="Filter by game"
            className={SELECT_CLASS}
          >
            <option value={MARKETPLACE_ALL_GAMES}>All games</option>
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
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        </div>

        <div className="relative min-w-0">
          <ArrowDownWideNarrow className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as InventorySort)}
            aria-label="Sort items"
            className={SELECT_CLASS}
          >
            {INVENTORY_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-white/6 pt-3">
        <div className="-mx-1 flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto px-1 scrollbar-none sm:flex-wrap sm:overflow-visible">
          {categoriesLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="h-7 w-20 shrink-0 animate-pulse rounded-full bg-white/5" />
              ))
            : itemCategories.map((tab) => {
                const isActive = itemCategory === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onCategoryChange(tab)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
                      isActive
                        ? "border-[#9a35ff]/55 bg-[linear-gradient(135deg,rgba(154,53,255,0.5),rgba(116,48,255,0.34))] text-white shadow-[0_0_16px_rgba(154,53,255,0.25)]"
                        : "border-white/8 bg-white/[0.02] text-white/50 hover:border-white/16 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {tab === "All" ? "All items" : tab}
                  </button>
                );
              })}
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[11px] font-semibold text-white/55 transition hover:border-[#9a35ff]/35 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
