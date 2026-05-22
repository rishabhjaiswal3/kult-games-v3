import { ArrowUpRight, ShoppingCart, X } from "lucide-react";
import { InventoryAssetImage } from "@/components/inventory/InventoryAssetImage";
import {
  MARKETPLACE_PAYMENT_TOKENS,
  type MarketplacePaymentToken,
} from "@/lib/marketplacePayment";
import type { MarketplaceListing } from "@/types/api";

type InventorySelectedItemPanelProps = {
  item: MarketplaceListing;
  selectedPaymentToken: MarketplacePaymentToken;
  onPaymentTokenChange: (token: MarketplacePaymentToken) => void;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
  canPurchase: boolean;
};

function getCategoryBadgeStyle(category: string) {
  const key = category.toLowerCase();
  if (key.includes("legendary") || key.includes("bundle"))
    return "bg-amber-950/90 border-amber-500/40 text-amber-300";
  if (key.includes("weapon") || key.includes("skin"))
    return "bg-purple-950/90 border-purple-500/40 text-[#e0c4ff]";
  return "bg-purple-950/90 border-purple-500/40 text-[#d6acff]";
}

export function InventorySelectedItemPanel({
  item,
  selectedPaymentToken,
  onPaymentTokenChange,
  onClose,
  onPurchase,
  isPurchasing,
  canPurchase,
}: InventorySelectedItemPanelProps) {
  const badgeClass = getCategoryBadgeStyle(item.category);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        <span
          className={`rounded border px-1.5 py-px font-tech text-[7px] font-black uppercase tracking-wider ${badgeClass}`}
        >
          {item.category}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-white/8 bg-[#0a0f1b]/60 p-0.5 text-white/45 transition hover:text-white"
          aria-label="Clear selection"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Image + name, description & price in one row */}
      <div className="flex items-center gap-2 rounded-md border border-white/8 bg-[#070c14]/80 p-1.5">
        <InventoryAssetImage
          src={item.assetUrl}
          alt={item.name}
          compact
          className="h-14 w-14 shrink-0 rounded border border-white/6"
          imgClassName="max-h-[92%] max-w-[92%] p-0.5"
        />

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-[11px] font-bold leading-tight text-white" title={item.name}>
              {item.name}
            </h4>
            {item.shortDescription ? (
              <p className="truncate text-[9px] text-white/45" title={item.shortDescription}>
                {item.shortDescription}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 text-right leading-none">
            <span className="font-tech text-[7px] uppercase tracking-wider text-white/38">Price</span>
            <p className="font-tech text-sm font-bold text-[#ffc000]">
              {item.price}
              <span className="ml-0.5 text-[8px] font-semibold text-white/45">{item.currency}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-0.5 font-tech text-[7px] font-bold uppercase tracking-wider text-white/38">Pay</span>
        {MARKETPLACE_PAYMENT_TOKENS.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => onPaymentTokenChange(token)}
            className={`rounded border px-1.5 py-0.5 font-tech text-[7px] font-bold uppercase tracking-wider transition ${
              selectedPaymentToken === token
                ? "border-[#9a35ff]/60 bg-[#9a35ff]/20 text-[#d6acff]"
                : "border-white/8 bg-[#0a0f1b]/60 text-white/45 hover:text-white"
            }`}
          >
            {token}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!canPurchase || isPurchasing}
        onClick={onPurchase}
        className="btn-primary flex h-8 w-full items-center justify-center gap-1 rounded-md font-tech text-[8px] font-bold uppercase tracking-wider disabled:opacity-50"
      >
        <ShoppingCart className="h-3 w-3" />
        {isPurchasing ? "Processing…" : "Purchase"}
        <ArrowUpRight className="h-3 w-3" />
      </button>
    </div>
  );
}
