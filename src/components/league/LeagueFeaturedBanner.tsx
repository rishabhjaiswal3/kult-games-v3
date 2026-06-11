import { Activity, ChevronRight } from "lucide-react";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { FlagHex } from "./FlagHex";
import { LeagueStadiumBackground } from "./LeagueStadiumBackground";
import { FEATURED_MATCH } from "./leagueData";
import { FIFA_BRAND } from "./leagueFifaStyles";

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-red-500/50 bg-red-500/20 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.35)]">
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
  const userPick = match.userAgentPick;
  const userAgent = getLeagueAgent(userPick.agentName);

  return (
    <section
      className="relative overflow-hidden rounded-xl border border-[#a855f7]/40 shadow-[0_0_56px_rgba(168,85,247,0.15)]"
    >
      <LeagueStadiumBackground />

      <div className="relative flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-black/35 px-3 py-2 backdrop-blur-md">
            <p className="font-tech text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:text-xs">
              Today&apos;s Featured Match
            </p>
            {match.isLive ? <LiveBadge /> : null}
          </div>
          <div className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-right backdrop-blur-md">
            <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
              FIFA World Cup 2026™
            </p>
            <p className="font-tech text-[9px] uppercase tracking-widest text-white/55">
              {match.stage} · Matchday {match.matchday}
            </p>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col items-center px-4 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center justify-center gap-4 sm:gap-10 md:gap-14">
            <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
              <span className="font-tech text-[8px] uppercase tracking-[0.3em] text-white/70 drop-shadow-md">
                Home
              </span>
              <div className="rounded-xl border border-white/25 bg-black/25 p-1.5 shadow-lg backdrop-blur-sm">
                <FlagHex code={match.home.code} size="xl" />
              </div>
              <p className="font-tech text-sm font-black uppercase tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-base">
                {match.home.label}
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-black/40 px-5 py-3 backdrop-blur-md sm:px-7 sm:py-4">
              {match.isLive ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className="font-mono text-4xl font-black tabular-nums sm:text-5xl md:text-6xl"
                      style={{
                        color: FIFA_BRAND.scoreGold,
                        textShadow: "0 2px 16px rgba(0,0,0,0.9), 0 0 24px rgba(251,191,36,0.4)",
                      }}
                    >
                      {match.homeScore}
                    </span>
                    <span className="font-tech text-2xl font-black text-white/50 sm:text-3xl">-</span>
                    <span
                      className="font-mono text-4xl font-black tabular-nums sm:text-5xl md:text-6xl"
                      style={{
                        color: FIFA_BRAND.scoreGold,
                        textShadow: "0 2px 16px rgba(0,0,0,0.9), 0 0 24px rgba(251,191,36,0.4)",
                      }}
                    >
                      {match.awayScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1">
                    <Activity className="h-3 w-3 text-red-300" />
                    <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-red-200">
                      Live {match.liveMinute}&apos;
                    </span>
                  </div>
                </>
              ) : (
                <span className="font-tech text-3xl font-black uppercase text-white/40 sm:text-4xl">VS</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
              <span className="font-tech text-[8px] uppercase tracking-[0.3em] text-white/70 drop-shadow-md">
                Away
              </span>
              <div className="rounded-xl border border-white/25 bg-black/25 p-1.5 shadow-lg backdrop-blur-sm">
                <FlagHex code={match.away.code} size="xl" />
              </div>
              <p className="font-tech text-sm font-black uppercase tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-base">
                {match.away.label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              document.getElementById("league-fight-arena")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/25 bg-black/45 px-4 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:border-[#a855f7]/50 hover:bg-[#a855f7]/30 sm:text-xs"
          >
            View Live Stats
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Agent pick */}
        <div className="mx-3 mb-3 rounded-lg border border-white/20 bg-black/55 p-2.5 backdrop-blur-lg sm:mx-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#a855f7]/50 bg-black/50 sm:h-16 sm:w-16">
                {userAgent ? (
                  <ArenaAgentMedia src={userAgent.img} alt={userAgent.name} fit="cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="font-tech text-[9px] uppercase tracking-[0.2em] text-[#c084fc]">
                  Your Agent&apos;s Pick
                </p>
                <p className="font-tech text-sm font-black uppercase text-white sm:text-base">
                  {userPick.agentName}
                </p>
                <p className="mt-0.5 text-[11px] text-white/65">
                  Predicted:{" "}
                  <span className="font-tech font-bold text-white">{userPick.predictedScore}</span>
                  <span className="text-white/40"> · </span>
                  <span className="text-emerald-400">{userPick.predictedWinner}</span>
                </p>
              </div>
            </div>

            <div className="w-full sm:w-52">
              <div className="flex justify-between font-tech text-[9px] uppercase tracking-wider text-white/55">
                <span>Confidence</span>
                <span className="font-bold text-[#c084fc]">{userPick.confidence}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc]"
                  style={{ width: `${userPick.confidence}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("league-prediction-questions")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="mt-2 w-full rounded-md border border-[#a855f7]/50 bg-[#a855f7]/25 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-[#a855f7]/40 sm:text-[10px]"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
