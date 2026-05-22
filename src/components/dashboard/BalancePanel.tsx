import { ChevronRight, Hexagon } from "lucide-react";
import dashboardCrest from "@/assets/dashboard-crest.png";

export function BalancePanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      <section className="arena-panel relative min-h-[84px] overflow-hidden p-4">
        <div className="font-tech text-[10px] uppercase text-white/45">$Arena Balance</div>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-2xl font-semibold">1,250.50</span>
          <Hexagon className="h-9 w-9 text-[#f4b400]" />
        </div>
        <img
          src={dashboardCrest}
          alt=""
          className="absolute right-4 top-0 h-[132px] w-[138px] object-contain opacity-95"
        />
      </section>
      <section className="arena-panel flex items-center justify-between p-4">
        <div>
          <div className="font-tech text-[10px] uppercase text-white/45">Rank</div>
          <div className="mt-2 text-xl font-semibold">#1,248</div>
          <div className="mt-1 text-xs text-white/45">TOP 11%</div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/60" />
      </section>
    </div>
  );
}
