import { ShoppingCart } from "lucide-react";
import type { MarketplaceListing } from "@/types/api";

type MarketplaceListingCardProps = {
  item: MarketplaceListing;
  onBuy: (item: MarketplaceListing) => void;
  gameLabel?: string;
};

const CATEGORY_ACCENTS: Record<string, string> = {
  skin: "from-neon-purple/20 to-transparent border-neon-purple/30",
  weapon: "from-neon-cyan/20 to-transparent border-neon-cyan/30",
  boost: "from-neon-green/20 to-transparent border-neon-green/30",
  bundle: "from-amber-400/20 to-transparent border-amber-400/30",
};

function getCategoryAccent(category: string): string {
  const key = category.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ACCENTS)) {
    if (key.includes(k)) return v;
  }
  return "from-neon-cyan/15 to-transparent border-white/15";
}

export function MarketplaceListingCard({ item, onBuy, gameLabel }: MarketplaceListingCardProps) {
  const accent = getCategoryAccent(item.category);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-background/25 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/40 hover:shadow-[0_16px_40px_hsl(195_100%_60%/0.12)] sm:p-3.5">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accent.split(" ").slice(0, 2).join(" ")} opacity-60`}
      />

      <div className="relative mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-background/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(195_100%_60%/.18),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {item.assetUrl ? (
          <img
            src={item.assetUrl}
            alt={item.name}
            className="relative z-[1] h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <p className="px-3 text-center text-[10px] font-display tracking-[0.12em] text-muted-foreground">
            NO PREVIEW
          </p>
        )}
        <span
          className={`absolute left-2 top-2 z-[2] rounded-full border bg-background/70 px-2 py-0.5 text-[8px] font-display font-semibold tracking-[0.1em] backdrop-blur-sm ${accent.split(" ").pop()}`}
        >
          {item.category.toUpperCase()}
        </span>
        {gameLabel ? (
          <span className="absolute right-2 top-2 z-[2] max-w-[45%] truncate rounded-full border border-white/15 bg-background/75 px-2 py-0.5 text-[8px] font-display font-semibold tracking-[0.06em] text-muted-foreground backdrop-blur-sm">
            {gameLabel}
          </span>
        ) : null}
      </div>

      <div className="relative space-y-2">
        <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-bold leading-tight text-foreground">
          {item.name}
        </h3>
        {item.shortDescription ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {item.shortDescription}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-display text-lg font-black tabular-nums text-neon-cyan">
            {item.price}
            <span className="ml-1 text-[10px] font-semibold text-muted-foreground">{item.currency}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => onBuy(item)}
          className="btn-eye flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-display font-bold tracking-[0.12em]"
        >
          <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
          PURCHASE
        </button>
      </div>
    </article>
  );
}

export function MarketplaceListingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/25 p-3.5">
      <div className="mb-3 aspect-[4/3] animate-pulse rounded-xl bg-white/5" />
      <div className="mb-2 h-4 w-[85%] animate-pulse rounded bg-white/5" />
      <div className="mb-3 h-3 w-full animate-pulse rounded bg-white/5" />
      <div className="h-9 w-full animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}
