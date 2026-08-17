import { type CSSProperties, type MouseEvent } from "react";
import { ShoppingCart } from "lucide-react";
import { InventoryAssetImage } from "@/components/inventory/InventoryAssetImage";
import { alpha, getInventoryAccent } from "@/components/inventory/inventoryAccent";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/types/api";

type InventoryListingCardProps = {
  item: MarketplaceListing;
  gameName?: string;
  selected?: boolean;
  onSelect?: (item: MarketplaceListing) => void;
  onBuy: (item: MarketplaceListing) => void;
};

export function InventoryListingCard({ item, gameName, selected, onSelect, onBuy }: InventoryListingCardProps) {
  const accent = getInventoryAccent(item.category);
  const gameBadgeLabel = gameName?.trim() || item.gameIdentification;

  const handleCardClick = () => {
    if (onSelect) onSelect(item);
    else onBuy(item);
  };

  const handleBuy = (e: MouseEvent) => {
    e.stopPropagation();
    onBuy(item);
  };

  return (
    <article
      className={cn(
        "inventory-listing-card group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        selected
          ? "-translate-y-0.5 border-transparent"
          : "border-white/8 hover:-translate-y-1 hover:border-transparent",
      )}
      style={
        {
          "--accent": accent.color,
          borderColor: selected ? alpha(accent, 0.7) : undefined,
          boxShadow: selected
            ? `0 0 0 1px ${alpha(accent, 0.35)}, 0 18px 40px rgba(0,0,0,0.5), 0 0 30px ${alpha(accent, 0.22)}`
            : undefined,
        } as CSSProperties
      }
    >
      {/* Rarity accent runs along the top edge so a scanned grid reads by colour first. */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${alpha(accent, 0.14)}, transparent 62%)` }}
        aria-hidden
      />

      <button type="button" onClick={handleCardClick} className="relative block w-full shrink-0 text-left">
        <div className="relative aspect-[5/4] overflow-hidden bg-[#050912]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 45%, ${alpha(accent, 0.16)}, transparent 68%)` }}
            aria-hidden
          />
          <InventoryAssetImage
            src={item.assetUrl}
            alt={item.name}
            className="h-full w-full"
            imgClassName="max-h-[86%] max-w-[86%]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#070c16] to-transparent" />

          <span
            className="absolute left-2.5 top-3 z-[2] rounded-md border px-2 py-1 font-tech text-[9px] font-black uppercase leading-none tracking-[0.12em] backdrop-blur-sm"
            style={{
              borderColor: alpha(accent, 0.45),
              backgroundColor: alpha(accent, 0.14),
              color: accent.color,
            }}
          >
            {item.category || accent.tier}
          </span>
        </div>
      </button>

      <div className="relative z-[2] flex min-h-0 flex-1 flex-col gap-1.5 px-3.5 pb-3.5 pt-3">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent.color }} aria-hidden />
          <span className="truncate">{gameBadgeLabel}</span>
        </span>

        <button
          type="button"
          onClick={handleCardClick}
          className="line-clamp-1 text-left text-sm font-bold leading-tight text-white transition group-hover:text-[color:var(--accent)]"
          title={item.name}
        >
          {item.name}
        </button>

        <p className="line-clamp-2 min-h-[2.1rem] text-[11px] leading-snug text-white/45">
          {item.shortDescription || "On-chain marketplace asset"}
        </p>

        {/* Stacks on the 2-up mobile grid, sits inline once the card is wide enough. */}
        <div className="mt-auto flex flex-col items-stretch gap-2 border-t border-white/8 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/40">Price</span>
            <p className="mt-0.5 font-tech text-lg font-bold leading-none text-[#ffc42e]">
              {item.price}
              <span className="ml-1 text-[11px] font-semibold text-white/50">{item.currency}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleBuy}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3.5 font-tech text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5"
            style={{
              borderColor: alpha(accent, 0.5),
              background: `linear-gradient(135deg, ${alpha(accent, 0.85)}, ${alpha(accent, 0.55)})`,
              boxShadow: `0 0 18px ${alpha(accent, 0.3)}`,
            }}
            aria-label={`Buy ${item.name}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Buy
          </button>
        </div>
      </div>
    </article>
  );
}

export function InventoryListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#04080f]/95">
      <div className="aspect-[5/4] animate-pulse bg-white/[0.035]" />
      <div className="space-y-2 p-3.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/5" />
        <div className="h-2.5 w-full animate-pulse rounded bg-white/5" />
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/8 pt-3">
          <div className="h-6 w-16 animate-pulse rounded bg-white/5" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}
