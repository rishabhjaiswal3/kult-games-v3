import { useEffect, useState } from "react";
import { ChevronRight, Timer } from "lucide-react";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { FlagHex } from "./FlagHex";
import { LeaguePanel } from "./LeaguePanel";
import { FEATURED_MATCH } from "./leagueData";

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function AgentFlank({
  agentName,
  flip,
}: {
  agentName: string;
  flip?: boolean;
}) {
  const agent = getLeagueAgent(agentName);
  if (!agent) return null;

  return (
    <div className="relative w-[28%] min-w-[72px] max-w-[130px] shrink-0 overflow-hidden bg-black/40 sm:max-w-none sm:w-[26%] md:w-[28%]">
      <ArenaAgentMedia
        src={agent.img}
        alt={agent.name}
        fit="contain"
        className={flip ? "-scale-x-100" : undefined}
      />
      <div
        className={`pointer-events-none absolute inset-0 ${
          flip
            ? "bg-gradient-to-l from-[#05050a]/90 via-[#05050a]/20 to-transparent"
            : "bg-gradient-to-r from-[#05050a]/90 via-[#05050a]/20 to-transparent"
        }`}
      />
    </div>
  );
}

export function LeagueFeaturedBanner() {
  const [secondsLeft, setSecondsLeft] = useState(FEATURED_MATCH.countdownSeconds);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const countdownLabel = formatCountdown(secondsLeft);

  return (
    <>
      <LeaguePanel
        fill={false}
        className="relative shrink-0 overflow-hidden border-[#a855f7]/30 p-0"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_45%),radial-gradient(circle_at_80%_100%,rgba(34,197,94,0.1),transparent_40%)]" />

        <div className="relative flex min-h-[220px] flex-row items-stretch sm:min-h-[260px]">
          <AgentFlank agentName={FEATURED_MATCH.homeAgent} />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4 text-center sm:px-5 sm:py-5">
            <p className="font-tech text-[10px] font-bold uppercase tracking-[0.25em] text-[#a855f7]">
              Featured Match
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <div className="flex flex-col items-center gap-1.5">
                <FlagHex code={FEATURED_MATCH.home.code} size="md" />
                <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white/80 sm:text-xs">
                  {FEATURED_MATCH.home.label}
                </span>
              </div>
              <span className="font-tech text-xl font-black uppercase text-white/25 sm:text-2xl">VS</span>
              <div className="flex flex-col items-center gap-1.5">
                <FlagHex code={FEATURED_MATCH.away.code} size="md" />
                <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white/80 sm:text-xs">
                  {FEATURED_MATCH.away.label}
                </span>
              </div>
            </div>

            <p className="mt-2 font-tech text-base font-black uppercase tracking-wide text-white sm:text-lg">
              {FEATURED_MATCH.home.label} vs {FEATURED_MATCH.away.label}
            </p>

            <div className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 sm:px-4">
              <Timer className="h-3.5 w-3.5 shrink-0 text-[#a855f7]" />
              <span className="font-tech text-[9px] uppercase tracking-widest text-white/45 sm:text-[10px]">
                Starts in
              </span>
              <span className="font-mono text-sm font-bold tabular-nums text-white">
                {countdownLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                document.getElementById("league-fight-arena")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="mt-3 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg border border-[#a855f7]/50 bg-[#a855f7]/20 px-4 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#a855f7]/35 sm:w-auto sm:text-[11px]"
            >
              View Match Details
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <AgentFlank agentName={FEATURED_MATCH.awayAgent} flip />
        </div>
      </LeaguePanel>
    </>
  );
}
