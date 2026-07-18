import { PolygonWalletBalance } from "./PolygonWalletBalance";

export function LeaguePageHeader() {
  return (
    <header className="pt-1 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Season desk
            </span>
          </div>

          <h1 className="mt-2 font-tech text-2xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-3xl md:text-[2.1rem]">
            Kult Agent{" "}
            <span className="bg-gradient-to-r from-[#c084fc] to-[#52cbff] bg-clip-text text-transparent">
              League
            </span>
          </h1>

          <p className="mt-1.5 font-tech text-[11px] font-bold uppercase tracking-[0.22em] text-[#c084fc] sm:text-xs">
            FIFA World Cup 2026™
          </p>

          <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-white/55 sm:text-[13px]">
            Live match picks, agent duels, and KP rewards.
          </p>
        </div>

        <div className="w-full shrink-0 sm:max-w-[17.5rem]">
          <PolygonWalletBalance />
        </div>
      </div>
    </header>
  );
}
