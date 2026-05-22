import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight, Radio } from "lucide-react";

export function AutonomousPanel() {
  return (
    <section className="arena-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-tech text-xs uppercase">Autonomous Status</h3>
        <span className="font-tech text-[10px] text-[#00f080]">
          ACTIVE <Radio className="ml-1 inline h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-white/66">
        Your agent is operating autonomously.
        <br />
        Earning, training, and competing while you&apos;re away.
      </p>
      <div className="mt-4 grid grid-cols-2 border-t border-white/8 pt-4 text-xs">
        <div className="border-r border-white/8 pr-4">
          <div className="text-white/50">Current Strategy</div>
          <div className="mt-1 flex items-center justify-between font-semibold">
            Balanced Growth <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        <div className="pl-4">
          <div className="text-white/50">Risk Level</div>
          <div className="mt-1 flex items-center justify-between font-semibold">
            Medium <span className="text-[#f4b400]">▮▮▮▮▯</span>
          </div>
        </div>
      </div>
      <Link
        to="/ai-arena"
        className="mt-4 flex h-10 w-full items-center justify-center gap-3 rounded-md border border-[#8b29ff]/60 bg-[#46136f]/70 font-tech text-xs"
      >
        MANAGE AUTONOMOUS <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
