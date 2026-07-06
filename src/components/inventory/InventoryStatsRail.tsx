import { FileBox, Layers, Package, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

type InventoryStatsRailProps = {
  listingsCount: number;
  categoriesCount: number;
  gamesCount: number;
  activeGameLabel: string;
  isLoading?: boolean;
  className?: string;
};

export function InventoryStatsRail({
  listingsCount,
  categoriesCount,
  gamesCount,
  activeGameLabel,
  isLoading = false,
  className,
}: InventoryStatsRailProps) {
  const stats = [
    { label: "Assets", value: isLoading ? "…" : String(listingsCount), icon: Package, color: "#9a35ff", glow: "rgba(154,53,255,0.28)" },
    { label: "Categories", value: isLoading ? "…" : String(categoriesCount), icon: Tags, color: "#ffc42e", glow: "rgba(255,196,46,0.24)" },
    { label: "Games", value: isLoading ? "…" : String(gamesCount), icon: FileBox, color: "#00f080", glow: "rgba(0,240,128,0.22)" },
    { label: "Active filter", value: isLoading ? "Loading…" : activeGameLabel, icon: Layers, color: "#11a7ff", glow: "rgba(17,167,255,0.22)" },
  ] as const;

  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 gap-2 sm:gap-3 lg:min-w-[min(100%,420px)] lg:max-w-[460px] lg:flex-1",
        className,
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="inventory-stat-tile flex min-h-[72px] min-w-0 items-center gap-2.5 rounded-xl border border-white/8 px-3 py-2.5 sm:min-h-[76px] sm:px-3.5"
          style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 24px ${stat.glow}` }}
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10"
            style={{
              background: `linear-gradient(145deg, ${stat.color}22, rgba(255,255,255,0.03))`,
              boxShadow: `0 0 18px ${stat.glow}`,
            }}
          >
            <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-tech text-[8px] uppercase tracking-[0.18em] text-white/42">{stat.label}</div>
            <div
              className="mt-0.5 line-clamp-2 font-tech text-sm font-bold leading-tight text-white sm:text-[15px]"
              title={stat.value}
            >
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
