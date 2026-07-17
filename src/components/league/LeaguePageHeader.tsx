import { Trophy } from "lucide-react";

export function LeaguePageHeader() {
  return (
    <header className="pt-1 pb-8">
      <div>
        {/* <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#a855f7]/45 bg-[#a855f7]/15 sm:h-12 sm:w-12">
          <Trophy className="h-5 w-5 text-[#d8b4fe] sm:h-6 sm:w-6" />
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.35),transparent_65%)]" />
        </div> */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </span> */}
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
      </div>
    </header>
  );
}
