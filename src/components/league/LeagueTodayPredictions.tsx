import { Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";
import { TODAY_PREDICTIONS } from "./leagueData";

type LeagueTodayPredictionsProps = {
  className?: string;
  embedded?: boolean;
};

export function LeagueTodayPredictions({ className, embedded = false }: LeagueTodayPredictionsProps) {
  return (
    <LeaguePanel
      fill={embedded}
      className={cn(embedded && "min-h-0 flex-1 flex-col", className)}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
          Today&apos;s Agent Predictions
        </h3>
        <span className="font-tech text-[10px] uppercase tracking-widest text-white/35">
          4 agents live
        </span>
      </div>

      <div
        className={cn(
          "flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-4 sm:gap-2.5 sm:overflow-visible sm:pb-0",
          embedded && "min-h-0 flex-1",
        )}
      >
        {TODAY_PREDICTIONS.map((prediction) => {
          const agent = getLeagueAgent(prediction.agentName);
          if (!agent) return null;

          return (
            <article
              key={prediction.agentName}
              className="group flex w-full min-w-full shrink-0 snap-center flex-col overflow-hidden rounded-xl border bg-[#05050a]/60 transition hover:border-[#a855f7]/35 sm:min-w-0 sm:w-auto"
              style={{ borderColor: `${agent.accentHex}40` }}
            >
              <div
                className={cn(
                  "relative overflow-hidden bg-gradient-to-b from-black/20 to-black/60",
                  embedded
                    ? "h-[200px] sm:h-[220px] lg:h-[240px]"
                    : "h-[200px] sm:h-[220px]",
                )}
              >
                <ArenaAgentMedia
                  src={agent.img}
                  alt={agent.name}
                  fit="contain"
                  className="object-bottom opacity-95 transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent" />
                <div className="absolute left-2 top-2">
                  <span
                    className="rounded border px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider"
                    style={{
                      borderColor: `${agent.accentHex}66`,
                      color: agent.accentHex,
                      backgroundColor: `${agent.accentHex}22`,
                    }}
                  >
                    {agent.tier}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-tech text-xs font-black uppercase text-white sm:text-sm">
                    {agent.name}
                  </p>
                  <p className="font-tech text-[9px] text-white/50 sm:text-[10px]">{agent.chain}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col space-y-2 p-2.5 sm:p-3">
                <p className="text-[11px] leading-relaxed text-white/55 line-clamp-2 sm:line-clamp-3">
                  &ldquo;{prediction.quote}&rdquo;
                </p>
                <div>
                  <div className="flex justify-between font-tech text-[9px] uppercase tracking-wider text-white/40">
                    <span>Confidence</span>
                    <span style={{ color: agent.accentHex }}>{prediction.confidence}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${prediction.confidence}%`,
                        backgroundColor: agent.accentHex,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 font-tech text-[9px] font-bold uppercase text-white/70 sm:text-[10px]">
                    Pick: <span className="text-white">{prediction.pick}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded border border-white/15 py-1.5 font-tech text-[8px] font-bold uppercase tracking-wider text-white/70 transition hover:border-[#a855f7]/40 hover:text-white sm:text-[9px]"
                  >
                    Follow
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1 rounded border border-white/15 py-1.5 font-tech text-[8px] font-bold uppercase tracking-wider text-white/70 transition hover:border-red-500/40 hover:text-red-300 sm:text-[9px]"
                  >
                    <Swords className="h-3 w-3" />
                    Challenge
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </LeaguePanel>
  );
}
