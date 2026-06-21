import { TrendingUp } from "lucide-react";
import { LeaguePanel } from "./LeaguePanel";

const WIN_RATE = 73;
const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DASH_OFFSET = CIRCUMFERENCE * (1 - WIN_RATE / 100);

export function LeagueWinRatePanel() {
  return (
    <LeaguePanel fill={false} className="overflow-hidden border-[#a855f7]/30 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.18),transparent_45%),#070811] p-4">
      <div className="flex items-center gap-3.5">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72" aria-label={`${WIN_RATE}% win rate`}>
            <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="7" />
            <circle
              cx="36"
              cy="36"
              r={RADIUS}
              fill="none"
              stroke="url(#league-win-rate-gradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={DASH_OFFSET}
            />
            <defs>
              <linearGradient id="league-win-rate-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#7c3aed" />
                <stop offset="1" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute font-tech text-lg font-black text-white">{WIN_RATE}%</span>
        </div>
        <div className="min-w-0">
          <p className="font-tech text-base font-black text-white">Win rate</p>
          <p className="mt-0.5 text-sm text-white/50">52 wins · 19 losses</p>
          <p className="mt-2 inline-flex items-center gap-1 font-tech text-xs font-bold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            +4% this week
          </p>
        </div>
      </div>
    </LeaguePanel>
  );
}
