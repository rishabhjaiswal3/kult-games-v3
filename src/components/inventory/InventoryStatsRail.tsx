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
    { label: "Assets", value: isLoading ? "—" : String(listingsCount), icon: Package, color: "#c98bff" },
    { label: "Categories", value: isLoading ? "—" : String(categoriesCount), icon: Tags, color: "#ffc42e" },
    { label: "Games", value: isLoading ? "—" : String(gamesCount), icon: FileBox, color: "#00e08a" },
    { label: "Filter", value: isLoading ? "Loading" : activeGameLabel, icon: Layers, color: "#3bb8ff" },
  ] as const;

  return (
    <div
      className={cn(
        "inventory-stat-strip grid grid-cols-2 overflow-hidden rounded-xl border border-white/8 sm:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "flex min-w-0 items-center gap-2.5 px-3.5 py-3",
            // Hairlines instead of four separate glowing tiles: the numbers stay the loudest thing here.
            index % 2 === 1 ? "border-l border-white/8" : "",
            index > 1 ? "border-t border-white/8 sm:border-t-0" : "",
            index === 2 ? "sm:border-l sm:border-white/8" : "",
          )}
        >
          <stat.icon className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
          <div className="min-w-0">
            <div className="font-tech text-[9px] uppercase tracking-[0.18em] text-white/40">{stat.label}</div>
            <div
              className="mt-0.5 truncate font-tech text-[15px] font-bold leading-tight text-white"
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
