import { type MouseEvent } from "react";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { InventoryAssetImage } from "@/components/inventory/InventoryAssetImage";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/types/api";

type InventoryListingCardProps = {
  item: MarketplaceListing;
  gameName?: string;
  selected?: boolean;
  onSelect?: (item: MarketplaceListing) => void;
  onBuy: (item: MarketplaceListing) => void;
};

function getCategoryBadgeStyle(category: string) {
  const key = category.toLowerCase();
  if (key.includes("legendary") || key.includes("bundle")) {
    return "border-amber-400/45 bg-amber-950/85 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
  }
  if (key.includes("weapon") || key.includes("skin")) {
    return "border-purple-400/45 bg-purple-950/85 text-[#e8d4ff] shadow-[0_0_12px_rgba(168,85,247,0.18)]";
  }
  if (key.includes("boost") || key.includes("module")) {
    return "border-sky-400/45 bg-sky-950/85 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.18)]";
  }
  return "border-purple-400/40 bg-purple-950/80 text-[#d6acff]";
}

export function InventoryListingCard({ item, gameName, selected, onSelect, onBuy }: InventoryListingCardProps) {
  const badgeClass = getCategoryBadgeStyle(item.category);
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
        "inventory-listing-card group relative flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-300",
        selected
          ? "border-[#9a35ff]/75 shadow-[0_0_28px_rgba(154,53,255,0.28)] ring-1 ring-[#9a35ff]/45"
          : "border-white/8 hover:-translate-y-1 hover:border-[#9a35ff]/45 hover:shadow-[0_16px_36px_rgba(0,0,0,0.45),0_0_22px_rgba(154,53,255,0.14)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(154, 53, 255, 0.1), transparent 58%)",
        }}
        aria-hidden
      />

      <button type="button" onClick={handleCardClick} className="relative block w-full shrink-0 text-left">
        <div className="relative h-[136px] overflow-hidden bg-[#050912] sm:h-[148px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(154,53,255,0.1),transparent_65%)]" aria-hidden />
          <InventoryAssetImage
            src={item.assetUrl}
            alt={item.name}
            compact
            className="h-full w-full"
            imgClassName="max-h-[92%] max-w-[92%]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#04080f] to-transparent" />
        </div>

        <span
          className={cn(
            "absolute left-2 top-2 z-[2] rounded border px-2 py-0.5 font-tech text-[7px] font-black uppercase tracking-[0.14em] backdrop-blur-sm",
            badgeClass,
          )}
        >
          {item.category}
        </span>
        <span className="absolute right-2 top-2 z-[2] max-w-[46%] truncate rounded border border-cyan-300/30 bg-cyan-950/80 px-1.5 py-0.5 font-tech text-[7px] font-black uppercase tracking-wide text-cyan-100 backdrop-blur-sm">
          {gameBadgeLabel}
        </span>
      </button>

      <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-white/6 px-3 pb-3 pt-2.5">
        <button
          type="button"
          onClick={handleCardClick}
          className="line-clamp-1 text-left text-xs font-semibold leading-tight text-white/92 transition group-hover:text-[#d6acff]"
        >
          {item.name}
        </button>

        <p className="line-clamp-1 min-h-[1rem] text-[10px] leading-snug text-white/42">
          {item.shortDescription || "On-chain marketplace asset"}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-white/6 pt-2">
          <div className="min-w-0">
            <span className="font-tech text-[8px] uppercase tracking-[0.16em] text-white/38">Price</span>
            <p className="mt-0.5 font-tech text-[15px] font-bold leading-none text-[#ffc42e]">
              {item.price}
              <span className="ml-1 text-[10px] font-semibold text-white/45">{item.currency}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleBuy}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[#9a35ff]/45 bg-[linear-gradient(135deg,rgba(154,53,255,0.88),rgba(116,48,255,0.78))] px-2.5 font-tech text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_16px_rgba(154,53,255,0.28)] transition hover:-translate-y-0.5 hover:border-[#c084fc]/70 hover:shadow-[0_0_24px_rgba(154,53,255,0.42)] sm:px-3"
            aria-label={`Buy ${item.name}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Buy
            <ArrowUpRight className="hidden h-3 w-3 opacity-70 sm:inline" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function InventoryListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-[#04080f]/95">
      <div className="h-[136px] animate-pulse bg-white/[0.04] sm:h-[148px]" />
      <div className="space-y-2 border-t border-white/6 p-3">
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/5" />
        <div className="h-2.5 w-full animate-pulse rounded bg-white/5" />
        <div className="mt-2 border-t border-white/6 pt-2">
          <div className="h-8 w-full animate-pulse rounded-md bg-white/5" />
        </div>
      </div>
    </div>
  );
}
