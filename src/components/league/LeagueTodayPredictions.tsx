import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getLeagueAgent, type LeagueArenaAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";
import { ClanIcon } from "@/components/arena/ClanIcon";
import { leagueApi, type TodayPrediction } from "@/api/leagueApi";

function chainType(chain: string): string {
  const c = chain.trim().toLowerCase();
  if (c === "solana") return "solana";
  if (c === "base") return "base";
  if (c === "okx") return "okx";
  return "zerog";
}

type LeagueTodayPredictionsProps = {
  className?: string;
};

export function LeagueTodayPredictions({ className }: LeagueTodayPredictionsProps) {
  const [selected, setSelected] = useState<{
    prediction: TodayPrediction;
    agent: LeagueArenaAgent;
  } | null>(null);

  const { data: predictions, isLoading } = useQuery({
    queryKey: ["league", "predictions", "today", 8],
    queryFn: () => leagueApi.getTodayPredictions(8),
    staleTime: 30_000,
  });

  const modal =
    selected && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.agent.name} agent card`}
            onClick={() => setSelected(null)}
          >
            <div
              className="relative flex max-h-[calc(100dvh-40px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-[#050712] shadow-[0_28px_90px_rgba(0,0,0,0.72)]"
              style={{ borderColor: `${selected.agent.accentHex}70` }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                  background: `radial-gradient(circle at 18% 0%, ${selected.agent.accentHex}30, transparent 42%), linear-gradient(135deg, rgba(255,255,255,0.06), transparent 48%)`,
                }}
              />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/45 font-tech text-xs text-white/70 transition hover:border-white/35 hover:text-white"
                aria-label="Close agent card"
              >
                X
              </button>

              <div className="relative z-10 overflow-y-auto">
                <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4 sm:p-4">
                  <div
                    className="h-28 self-start overflow-hidden rounded-xl border bg-black/40 shadow-[0_0_24px_rgba(0,0,0,0.35)] sm:h-36"
                    style={{ borderColor: `${selected.agent.accentHex}45` }}
                  >
                    <ArenaAgentMedia src={selected.agent.img} alt={selected.agent.name} fit="cover" className="h-full w-full object-top" />
                  </div>

                  <div className="min-w-0 pr-7">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full border px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-widest"
                        style={{
                          borderColor: `${selected.agent.accentHex}70`,
                          color: selected.agent.accentHex,
                          background: `${selected.agent.accentHex}18`,
                        }}
                      >
                        Rank {selected.agent.rank}
                      </span>
                      <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 font-tech text-[8px] uppercase tracking-widest text-white/65">
                        LV. {selected.agent.lvl}
                      </span>
                      <span className="flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 font-tech text-[8px] uppercase tracking-widest text-white/65">
                        <ClanIcon type={chainType(selected.agent.chain)} className="h-3 w-3" />
                        {selected.agent.chain}
                      </span>
                    </div>

                    <h4 className="truncate font-tech text-lg font-black uppercase text-white sm:text-xl">
                      {selected.agent.name}
                    </h4>
                    <p className="mt-1 font-tech text-[10px] uppercase tracking-widest text-white/45">
                      {selected.agent.callsign} · {selected.agent.tier}
                    </p>

                    <div className="mt-3 rounded-xl border border-white/10 bg-black/28 p-3">
                      <p className="mb-1.5 font-tech text-[8px] font-bold uppercase tracking-widest text-white/35">Match call</p>
                      <p className="text-xs leading-relaxed text-white/82 sm:text-sm">
                        &ldquo;{selected.prediction.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-tech text-[10px] uppercase tracking-widest text-white/50">Confidence</span>
                    <span className="font-tech text-base font-black" style={{ color: selected.agent.accentHex }}>
                      {selected.prediction.confidence}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full shadow-[0_0_14px_currentColor]"
                      style={{
                        width: `${selected.prediction.confidence}%`,
                        backgroundColor: selected.agent.accentHex,
                        color: selected.agent.accentHex,
                      }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">Pick</p>
                      <p className="mt-1 truncate font-tech text-sm font-black uppercase text-white">{selected.prediction.pick}</p>
                    </div>
                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">Power</p>
                      <p className="mt-1 truncate font-tech text-sm font-black text-white">{selected.agent.power}</p>
                    </div>
                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">Tier</p>
                      <p className="mt-1 truncate font-tech text-sm font-black uppercase" style={{ color: selected.agent.accentHex }}>{selected.agent.tier}</p>
                    </div>
                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">Rank</p>
                      <p className="mt-1 truncate font-tech text-sm font-black text-white">#{selected.agent.rank}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
    <LeaguePanel className={cn("min-w-0 max-w-full overflow-hidden p-2.5 sm:p-3", className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">
          Today&apos;s Agent Predictions
        </h3>
        <span className="font-tech text-[10px] uppercase tracking-widest text-white/35">
          {predictions?.length ?? 0} live
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !predictions || predictions.length === 0 ? (
        <p className="py-3 text-[11px] text-white/40">No predictions locked in for today's matches yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {predictions.map((prediction, idx) => {
            const agent = getLeagueAgent(prediction.agentName);
            if (!agent) return null;

            return (
              <button
                type="button"
                key={`${prediction.agentName}-${idx}`}
                onClick={() => setSelected({ prediction, agent })}
                className="flex overflow-hidden rounded-lg border bg-[#05050a]/60 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.035] hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                style={{ borderColor: `${agent.accentHex}40` }}
              >
                <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden bg-black/40 sm:h-[96px] sm:w-[80px]">
                  <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" className="object-top" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-2">
                  <div>
                    <p className="font-tech text-[10px] font-black uppercase text-white">{agent.name}</p>
                    <p className="text-[10px] leading-snug text-white/50 line-clamp-2">
                      &ldquo;{prediction.quote}&rdquo;
                    </p>
                  </div>
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${prediction.confidence}%`,
                            backgroundColor: agent.accentHex,
                          }}
                        />
                      </div>
                      <span
                        className="shrink-0 font-tech text-[9px] font-bold"
                        style={{ color: agent.accentHex }}
                      >
                        {prediction.confidence}%
                      </span>
                    </div>
                    <p className="mt-1 font-tech text-[9px] font-bold uppercase text-white/75">
                      {prediction.pick}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

    </LeaguePanel>
    {modal}
    </>
  );
}
