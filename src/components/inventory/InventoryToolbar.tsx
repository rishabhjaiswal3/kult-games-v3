import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
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
  games: Game[];
  gamesLoading: boolean;
  getGameName: (name: Game["name"]) => string;
  onReset: () => void;
};

export function InventoryToolbar({
  itemCategories,
  itemCategory,
  onCategoryChange,
  categoriesLoading,
  itemSearch,
  onSearchChange,
  itemGame,
  onGameChange,
  games,
  gamesLoading,
  getGameName,
  onReset,
}: InventoryToolbarProps) {
  return (
    <div className="inventory-toolbar-panel flex flex-col gap-3 rounded-xl px-3 py-3 backdrop-blur-md sm:px-4 sm:py-3.5">
      <div className="flex items-center justify-between gap-2 border-b border-white/6 pb-2.5">
        <div className="flex items-center gap-2 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#c98bff]" />
          Browse assets
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 font-tech text-[9px] font-bold uppercase tracking-wide text-white/55 transition hover:border-[#9a35ff]/35 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="-mx-1 flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto px-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {categoriesLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="h-8 w-16 shrink-0 animate-pulse rounded-md bg-white/5" />
            ))
          : itemCategories.map((tab) => {
              const isActive = itemCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onCategoryChange(tab)}
                  className={`shrink-0 rounded-md border px-3 py-1.5 font-tech text-[9px] font-bold uppercase tracking-[0.14em] transition-all sm:px-3.5 sm:text-[10px] ${
                    isActive
                      ? "border-[#9a35ff]/55 bg-[linear-gradient(135deg,rgba(154,53,255,0.55),rgba(116,48,255,0.42))] text-white shadow-[0_0_18px_rgba(154,53,255,0.28)]"
                      : "border-transparent bg-white/[0.02] text-white/45 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {tab === "All" ? "All items" : tab}
                </button>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Search items..."
            value={itemSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-md border border-white/10 bg-[#03070d]/80 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-[#9a35ff]/55 focus:ring-1 focus:ring-[#9a35ff]/25"
          />
        </div>

        <div className="relative min-w-0 sm:min-w-[180px]">
          <select
            value={itemGame}
            onChange={(e) => onGameChange(e.target.value)}
            disabled={gamesLoading}
            className="h-9 w-full cursor-pointer appearance-none rounded-md border border-white/10 bg-[#03070d]/80 py-0 pl-3 pr-9 font-tech text-[10px] font-bold uppercase tracking-wide text-white/75 outline-none transition hover:text-white focus:border-[#9a35ff]/55 focus:ring-1 focus:ring-[#9a35ff]/25 disabled:opacity-50"
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
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        </div>
      </div>
    </div>
  );
}
