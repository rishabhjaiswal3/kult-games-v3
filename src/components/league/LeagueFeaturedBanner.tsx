import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { FlagCircle } from "./FlagHex";
import { LeagueStadiumBackground } from "./LeagueStadiumBackground";
import { FEATURED_MATCH } from "./leagueData";

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-red-500/50 bg-red-500/20 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-red-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
      </span>
      Live
    </span>
  );
}

export function LeagueFeaturedBanner() {
  const match = FEATURED_MATCH;
  const [consensus, setConsensus] = useState({ home: 43, draw: 15, away: 42 });
  const consensusAgents = ["TACTICIAN", "ASSASSIN", "BERSERKER", "HYBRID"]
    .map(getLeagueAgent)
    .filter((agent): agent is NonNullable<typeof agent> => Boolean(agent));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setConsensus((current) => {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const home = Math.min(49, Math.max(38, current.home + direction));
        const draw = Math.min(18, Math.max(11, current.draw - direction));
        return { home, draw, away: 100 - home - draw };
      });
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[#a855f7]/40 shadow-[0_0_56px_rgba(168,85,247,0.15)]">
      {/* Video — full width on all breakpoints */}
      <div className="relative aspect-video w-full min-w-0 max-w-full overflow-hidden sm:aspect-auto sm:h-[340px] md:h-[400px]">
        <LeagueStadiumBackground clean />
      </div>

      {/* Content below video — never overlaid */}
      <div className="w-full min-w-0 border-t border-white/10 bg-[#05050a] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-tech text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:text-xs">
              Today&apos;s Featured Prediction
            </p>
            {match.isLive ? <LiveBadge /> : null}
          </div>
          <div className="sm:text-right">
            <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
              FIFA World Cup 2026™
            </p>
            <p className="font-tech text-[9px] uppercase tracking-widest text-white/55">
              {match.stage} · Matchday {match.matchday}
            </p>
          </div>
        </div>

        <div className="mt-2.5 rounded-lg border border-white/12 bg-[#080914]/95 p-3 sm:p-3.5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-center">
              <FlagCircle code={match.home.code} className="mx-auto h-11 w-11 border-blue-400/35 sm:h-[3.25rem] sm:w-[3.25rem]" />
              <p className="mt-1 font-tech text-xs font-black uppercase text-white">Brazil</p>
            </div>
            <div className="min-w-[88px] text-center sm:min-w-[130px]">
              <p className="font-tech text-[8px] uppercase tracking-[0.26em] text-[#aaa9dc] sm:text-[10px]">{match.stage} · MD {match.matchday}</p>
              <p className="my-0.5 font-display text-3xl font-black text-[#a78bfa]">VS</p>
              <p className="font-tech text-[9px] uppercase tracking-[0.16em] text-emerald-400 sm:text-[10px]">Live · {match.liveMinute}&apos;</p>
            </div>
            <div className="text-center">
              <FlagCircle code={match.away.code} className="mx-auto h-11 w-11 border-cyan-400/35 sm:h-[3.25rem] sm:w-[3.25rem]" />
              <p className="mt-1 font-tech text-xs font-black uppercase text-white">Argentina</p>
            </div>
          </div>

          <div className="mt-2.5">
            <p className="mb-1.5 text-center font-tech text-[9px] uppercase tracking-[0.28em] text-[#aaa9dc] sm:text-[10px]">Live Agent Consensus</p>
            <div className="flex h-10 overflow-hidden rounded-xl border border-white/15 bg-white/5 font-tech font-black text-white sm:h-11">
              <div className="flex items-center justify-center bg-gradient-to-r from-[#244ac4] to-[#2d65dd] transition-all duration-1000" style={{ width: `${consensus.home}%` }}>{consensus.home}%</div>
              <div className="flex items-center justify-center bg-[#3b3a60] transition-all duration-1000" style={{ width: `${consensus.draw}%` }}>{consensus.draw}%</div>
              <div className="flex items-center justify-center bg-gradient-to-r from-[#139bc1] to-[#117b99] transition-all duration-1000" style={{ width: `${consensus.away}%` }}>{consensus.away}%</div>
            </div>
            <div className="mt-1.5 grid grid-cols-3 font-tech text-[9px] uppercase tracking-wider text-white/75 sm:text-[10px]">
              <span>Brazil win <span className="text-blue-300">↑</span></span>
              <span className="text-center">Draw</span>
              <span className="text-right">Argentina win <span className="text-cyan-300">↓</span></span>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {consensusAgents.map((agent, index) => (
              <div key={agent.name} className="relative flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-[#101022] p-1.5" style={{ borderTopColor: agent.accentHex }}>
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border" style={{ borderColor: agent.accentHex }}>
                  <ArenaAgentMedia src={agent.img} alt={agent.name} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-tech text-xs font-black uppercase text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">{agent.name}</p>
                  <p className="font-tech text-[9px] font-bold uppercase tracking-wider" style={{ color: agent.accentHex }}>{index % 2 ? "Argentina" : "Brazil"} · {78 - index * 4}%</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => document.getElementById("league-fight-arena")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex min-h-[32px] flex-1 items-center justify-center gap-1.5 rounded-md border border-white/25 bg-white/5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:border-[#a855f7]/50 hover:bg-[#a855f7]/25 sm:text-[10px]">Live Stats <ChevronRight className="h-3 w-3 shrink-0" /></button>
            <button type="button" onClick={() => document.getElementById("league-prediction-questions")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="min-h-[32px] flex-1 rounded-md border border-[#a855f7]/50 bg-[#a855f7]/25 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-[#a855f7]/40 sm:text-[10px]">Make Your Pick</button>
          </div>
        </div>
      </div>
    </section>
  );
}
