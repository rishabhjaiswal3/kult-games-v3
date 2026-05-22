import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function Quests() {
  const quests = [
    ["Win 3 battles in any mode", "2 / 3", "+20 $ARENA", 58],
    ["Train your agent 1 time", "1 / 1", "+10 $ARENA ✓", 100],
    ["Earn 50 $ARENA", "30 / 50", "+15 $ARENA ✓", 55],
  ] as const;

  return (
    <section className="arena-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-tech text-xs uppercase">Quests</h3>
        <span className="font-tech text-[10px] text-white/40">RESETS IN 12:45:30</span>
      </div>
      <div className="mt-3 space-y-2">
        {quests.map(([title, count, reward, pct]) => (
          <div key={title} className="rounded-md border border-white/7 bg-white/[0.015] p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span>{title}</span>
              <span className="font-semibold">{count}</span>
              <span className="text-[#00f080]">{reward}</span>
            </div>
            <div className="mt-3 h-1 rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6737ff] to-[#b048ff]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <Link
        to="/leaderboard"
        className="mt-3 flex h-10 w-full items-center justify-center gap-3 rounded-md bg-gradient-to-r from-[#45156e] to-[#7121c8] font-tech text-xs"
      >
        VIEW ALL QUESTS <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
