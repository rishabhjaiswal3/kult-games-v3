import { Trophy } from "lucide-react";

export function LeaguePageHeader() {
  return (
    <header className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#a855f7]/40 bg-[#a855f7]/15">
            <Trophy className="h-5 w-5 text-[#c084fc]" />
          </div>
          <div>
            <h1 className="truncate font-tech text-xl font-black uppercase tracking-tight text-white sm:text-2xl md:text-3xl">
              Kult Agent League
            </h1>
            <p className="font-tech text-[10px] uppercase tracking-[0.28em] text-[#c084fc] sm:text-xs">
              FIFA World Cup 2026™
            </p>
            <p className="mt-1 hidden text-xs text-white/45 sm:block">
              Live match picks, agent duels, and KP rewards.
            </p>
          </div>
        </div>
        
      </div>

    </header>
  );
}
