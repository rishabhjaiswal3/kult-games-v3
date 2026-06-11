import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Car, Check, Gift, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { equipVehicle, getGarageState } from "@/api/highwayHustleApi";
import { InventoryAssetImage } from "@/components/inventory/InventoryAssetImage";
import { carIndexFromId } from "@/constants/highwayHustleCars";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type HighwayHustleGarageProps = {
  className?: string;
  compact?: boolean;
  title?: string;
};

export function HighwayHustleGarage({
  className,
  compact = false,
  title = "Your garage",
}: HighwayHustleGarageProps) {
  const { walletAddress, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const garageQuery = useQuery({
    queryKey: ["highway-hustle", "garage", walletAddress],
    queryFn: () => getGarageState(walletAddress!),
    enabled: isAuthenticated && !!walletAddress,
    staleTime: 30_000,
  });

  const equipMutation = useMutation({
    mutationFn: async (carId: string) => {
      const index = carIndexFromId(carId);
      if (index === undefined) throw new Error("This vehicle cannot be equipped yet.");
      await equipVehicle(walletAddress!, index);
      return carId;
    },
    onSuccess: (carId) => {
      void queryClient.invalidateQueries({ queryKey: ["highway-hustle", "garage", walletAddress] });
      toast.success(`${carId.toUpperCase()} equipped — ready for your next run.`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to equip vehicle");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className={cn("arena-panel border-white/8 bg-[#04080f]/95 p-4 sm:p-5", className)}>
        <GarageHeader title={title} />
        <p className="mt-3 text-sm text-white/55">Sign in with your wallet to view purchased vehicles and rewards.</p>
      </div>
    );
  }

  if (garageQuery.isLoading) {
    return (
      <div className={cn("arena-panel border-white/8 bg-[#04080f]/95 p-4 sm:p-5", className)}>
        <GarageHeader title={title} />
        <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
          Loading your garage…
        </div>
      </div>
    );
  }

  if (garageQuery.isError) {
    return (
      <div className={cn("arena-panel border-white/8 bg-[#04080f]/95 p-4 sm:p-5", className)}>
        <GarageHeader title={title} />
        <p className="mt-3 text-sm text-red-300/80">
          Could not load garage
          {garageQuery.error instanceof Error ? `: ${garageQuery.error.message}` : "."}
        </p>
      </div>
    );
  }

  const cars = garageQuery.data?.cars ?? [];
  const rewardCount = garageQuery.data?.rewardIds.length ?? 0;

  return (
    <div className={cn("arena-panel border-white/8 bg-[#04080f]/95 p-4 sm:p-5", className)}>
      <GarageHeader
        title={title}
        subtitle={
          cars.length > 0
            ? `${cars.length} vehicle${cars.length === 1 ? "" : "s"}${rewardCount ? ` · ${rewardCount} reward${rewardCount === 1 ? "" : "s"}` : ""}`
            : "No vehicles yet"
        }
      />

      {cars.length === 0 ? (
        <p className="mt-3 text-sm text-white/55">
          You start with the free Coupe and Pickup. Purchase more in Inventory or earn rewards from sister games.
        </p>
      ) : (
        <div
          className={cn(
            "mt-4 grid gap-3",
            compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {cars.map((car) => {
            const isEquipping = equipMutation.isPending && equipMutation.variables === car.id;

            return (
              <button
                key={car.id}
                type="button"
                disabled={car.isEquipped || equipMutation.isPending}
                onClick={() => equipMutation.mutate(car.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border p-3 text-left transition",
                  car.isEquipped
                    ? "border-emerald-500/45 bg-emerald-950/20 shadow-[0_0_24px_rgba(0,240,128,0.08)]"
                    : "border-white/10 bg-[#0a0f1b]/70 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(154,53,255,0.12)]",
                  equipMutation.isPending && !isEquipping && "opacity-60",
                )}
              >
                <div className="relative mb-3 h-24 overflow-hidden rounded-lg bg-black/30">
                  <InventoryAssetImage
                    src={car.imageUrl}
                    alt={car.name}
                    compact
                    className="h-full w-full"
                  />
                  {car.isReward ? (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border border-amber-500/35 bg-amber-950/70 px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-amber-300">
                      <Gift className="h-3 w-3" />
                      Reward
                    </span>
                  ) : null}
                  {car.isEquipped ? (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded border border-emerald-500/35 bg-emerald-950/70 px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                      <Check className="h-3 w-3" />
                      Equipped
                    </span>
                  ) : null}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-tech text-sm font-bold uppercase tracking-wide text-white">
                      {car.name}
                    </p>
                    <p className="mt-0.5 font-tech text-[9px] uppercase tracking-wider text-white/40">
                      {car.isEquipped ? "Active in game" : "Tap to equip"}
                    </p>
                  </div>
                  {isEquipping ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-purple-400" />
                  ) : (
                    <Sparkles
                      className={cn(
                        "h-4 w-4 shrink-0 transition",
                        car.isEquipped ? "text-emerald-400" : "text-white/25 group-hover:text-purple-300",
                      )}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-4 font-tech text-[9px] uppercase tracking-[0.2em] text-white/35">
        Equipped vehicle syncs to Highway Hustle when you launch a mission.
      </p>
    </div>
  );
}

function GarageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-500/25 bg-cyan-500/10">
        <Car className="h-5 w-5 text-cyan-300" />
      </div>
      <div>
        <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">{title}</h3>
        {subtitle ? <p className="text-[10px] text-white/45">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export default HighwayHustleGarage;
