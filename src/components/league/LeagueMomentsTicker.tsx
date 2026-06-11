import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";
import { LEAGUE_MOMENTS } from "./leagueData";

export function LeagueMomentsTicker() {
  const moments = LEAGUE_MOMENTS.map((m) => ({
    ...m,
    agent: getLeagueAgent(m.agentName),
  }));

  return (
    <LeaguePanel fill={false} className="overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-2.5">
        <span className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-[#a855f7]">
          Recent League Moments
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 py-3 snap-x snap-mandatory scrollbar-none">
        {moments.map((moment) => (
          <div
            key={moment.id}
            className="flex shrink-0 snap-start items-center gap-3 rounded-lg border border-white/8 bg-black/30 px-3 py-2 max-w-[min(100%,320px)]"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10">
              {moment.agent ? (
                <ArenaAgentMedia src={moment.agent.img} alt={moment.agent.name} fit="cover" />
              ) : null}
            </div>
            <p className="min-w-0 font-tech text-[11px] leading-snug text-white/75">
              <span className="font-bold uppercase text-white">{moment.agentName}</span>{" "}
              {moment.text}
              {moment.kp ? (
                <span className="ml-1 font-bold text-[#00f080]">+{moment.kp} KP</span>
              ) : null}
            </p>
          </div>
        ))}
      </div>
    </LeaguePanel>
  );
}
