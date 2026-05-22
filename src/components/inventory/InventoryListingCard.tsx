import { useState, type MouseEvent } from "react";
import {
  Bookmark,
  Eye,
  Heart,
  Hexagon,
  Share2,
  ShoppingCart,
} from "lucide-react";
import type { MarketplaceListing } from "@/types/api";

type InventoryListingCardProps = {
  item: MarketplaceListing;
  gameLabel?: string;
  onBuy: (item: MarketplaceListing) => void;
};

function formatCompactCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

function pseudoCount(id: string, salt: number, min: number, max: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function getCategoryBadgeStyle(category: string, gameId: string) {
  const key = category.toLowerCase();
  const game = gameId.toLowerCase();
  if (game.includes("robo"))
    return "bg-sky-950/80 border-sky-500/35 text-sky-400";
  if (key.includes("legendary") || key.includes("bundle"))
    return "bg-amber-950/80 border-amber-500/35 text-amber-400";
  if (key.includes("weapon") || key.includes("skin"))
    return "bg-purple-950/80 border-purple-500/35 text-[#d6acff]";
  return "bg-purple-950/80 border-purple-500/35 text-[#d6acff]";
}

function shortenGameId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export function InventoryListingCard({ item, gameLabel, onBuy }: InventoryListingCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const badgeClass = getCategoryBadgeStyle(item.category, item.gameIdentification);
  const displayGame = gameLabel ?? shortenGameId(item.gameIdentification);
  const views = formatCompactCount(pseudoCount(item.id, 7, 120, 4200));
  const likes = formatCompactCount(pseudoCount(item.id, 13, 1, 48));
  const shares = formatCompactCount(pseudoCount(item.id, 19, 1, 12));
  const priceLabel = `${item.price} ${item.currency}`;

  const handlePurchase = (e: MouseEvent) => {
    e.stopPropagation();
    onBuy(item);
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handlePurchase}
        className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-lg border border-white/8 bg-black/40 text-left"
      >
        {item.assetUrl ? (
          <img
            src={item.assetUrl}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0a0f18] font-tech text-[9px] uppercase tracking-wider text-white/35">
            No preview
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-all duration-300 group-hover:via-black/30" />

        <div
          className={`absolute left-3 top-3 select-none rounded border px-2 py-0.5 font-tech text-[9px] font-black uppercase tracking-wide ${badgeClass}`}
        >
          {item.category}
        </div>

        <div className="absolute right-3 top-3 rounded border border-white/10 bg-[#03070d]/80 px-1.5 py-0.5 font-tech text-[9px] font-black tracking-wide text-white">
          {priceLabel}
        </div>
      </button>

      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={handlePurchase}
            className="w-full cursor-pointer truncate text-left text-sm font-semibold leading-snug text-white/90 transition hover:text-purple-400"
          >
            {item.name}
          </button>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-white/50">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1a1030] text-[8px] font-bold uppercase text-purple-300">
                {displayGame.charAt(0)}
              </span>
              <span className="truncate">by {displayGame}</span>
              <Hexagon className="h-3 w-3 shrink-0 fill-[#9a35ff] text-[#9a35ff]" />
            </div>
            <span className="shrink-0 font-tech text-[9px] font-bold uppercase tracking-wider text-[#00f080]">
              {item.status}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/6 pt-3 text-xs font-semibold text-white/45">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-white/30" />
              <span>{views}</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-white/30" />
              <span>{likes}</span>
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="h-4 w-4 text-white/30" />
              <span>{shares}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePurchase}
              className="text-white/30 transition hover:text-purple-400"
              aria-label={`Purchase ${item.name}`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBookmarked((v) => !v);
              }}
              className="cursor-pointer text-white/30 transition hover:text-purple-400"
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark item"}
            >
              <Bookmark
                className={`h-4 w-4 ${bookmarked ? "fill-purple-500 text-purple-500" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InventoryListingCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-[16/9] animate-pulse rounded-lg border border-white/8 bg-white/5" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="mt-3 flex justify-between border-t border-white/6 pt-3">
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-8 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
