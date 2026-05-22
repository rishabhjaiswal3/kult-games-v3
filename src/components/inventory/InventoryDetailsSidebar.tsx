import { Info, Sparkles } from "lucide-react";
import { InventorySelectedItemPanel } from "@/components/inventory/InventorySelectedItemPanel";
import type { MarketplaceListing } from "@/types/api";
import type { MarketplacePaymentToken } from "@/lib/marketplacePayment";

type CategorySegment = {
  name: string;
  count: number;
  pct: number;
  dash: number;
  offset: number;
  color: string;
};

type InventoryDetailsSidebarProps = {
  previewItem: MarketplaceListing | null;
  listingsCount: number;
  categoryBreakdown: { name: string; pct: number }[];
  donutSegments: CategorySegment[];
  activeGameLabel: string;
  itemCategory: string;
  itemSearch: string;
  selectedPaymentToken: MarketplacePaymentToken;
  onPaymentTokenChange: (token: MarketplacePaymentToken) => void;
  onClosePreview: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
  canPurchase: boolean;
};

const LEGEND_COLORS = ["#9a35ff", "#3b82f6", "#f59e0b", "#10b981", "#0ea5e9", "#64748b"];

export function InventoryDetailsSidebar({
  previewItem,
  listingsCount,
  categoryBreakdown,
  donutSegments,
  activeGameLabel,
  itemCategory,
  itemSearch,
  selectedPaymentToken,
  onPaymentTokenChange,
  onClosePreview,
  onPurchase,
  isPurchasing,
  canPurchase,
}: InventoryDetailsSidebarProps) {
  return (
    <div className="arena-panel flex flex-col overflow-hidden border-white/8 bg-[#04080f]/95 lg:max-h-[calc(100dvh-3.5rem)]">
      <div className="shrink-0 border-b border-white/8 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 shrink-0 text-[#c78aff]" />
          <div className="min-w-0">
            <h2 className="font-tech text-[9px] font-semibold uppercase tracking-wider text-white">Checkout</h2>
            <p className="truncate text-[8px] text-white/42">
              {previewItem ? previewItem.name : "Select an item"}
            </p>
          </div>
        </div>
      </div>

      <div className="inventory-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {previewItem ? (
          <div className="p-2">
            <InventorySelectedItemPanel
              item={previewItem}
              selectedPaymentToken={selectedPaymentToken}
              onPaymentTokenChange={onPaymentTokenChange}
              onClose={onClosePreview}
              onPurchase={onPurchase}
              isPurchasing={isPurchasing}
              canPurchase={canPurchase}
            />
          </div>
        ) : (
          <div className="space-y-0 text-[10px]">
            <section className="border-b border-white/6 p-3">
              <h3 className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/45">Overview</h3>
              <div className="mt-2 flex justify-center">
                <svg className="h-[88px] w-[88px]" viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.name}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${seg.dash} 238.76`}
                      strokeDashoffset={seg.offset}
                      transform="rotate(-90 50 50)"
                    />
                  ))}
                  <text x="50" y="47" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
                    {listingsCount}
                  </text>
                </svg>
              </div>
              {categoryBreakdown.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {categoryBreakdown.slice(0, 4).map((seg, i) => (
                    <li key={seg.name} className="flex justify-between gap-2 text-[9px]">
                      <span className="flex min-w-0 items-center gap-1.5 text-white/50">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: LEGEND_COLORS[i % LEGEND_COLORS.length] }}
                        />
                        <span className="truncate capitalize">{seg.name}</span>
                      </span>
                      <span className="font-tech text-white/85">{seg.pct}%</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section className="border-b border-white/6 p-3">
              <h3 className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/45">Filters</h3>
              <dl className="mt-2 space-y-1.5 text-[9px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-white/40">Game</dt>
                  <dd className="truncate font-tech font-semibold text-white">{activeGameLabel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/40">Category</dt>
                  <dd className="font-tech capitalize text-white">
                    {itemCategory === "All" ? "All" : itemCategory}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="flex gap-2 p-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c78aff]/80" />
              <p className="text-[9px] leading-relaxed text-white/40">
                Click a card to preview and purchase on-chain.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
