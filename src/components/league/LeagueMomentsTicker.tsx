import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { getLeagueAgent, type LeagueArenaAgent } from "@/constants/leagueAgents";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi, type LeagueMoment } from "@/api/leagueApi";

/** The API `text` already starts with the agent name; strip it so it isn't shown twice. */
function stripLeadingName(text: string, name: string): string {
  const trimmed = text.trimStart();
  if (trimmed.toLowerCase().startsWith(name.toLowerCase())) {
    return trimmed.slice(name.length).trimStart();
  }
  return trimmed;
}

type MomentWithAgent = LeagueMoment & { agent: LeagueArenaAgent | undefined };

export function LeagueMomentsTicker() {
  const { data, isLoading } = useQuery({
    queryKey: ["league", "moments", 8],
    queryFn: () => leagueApi.getMoments(8),
    staleTime: 30_000,
  });

  const [openMoment, setOpenMoment] = useState<MomentWithAgent | null>(null);

  const moments: MomentWithAgent[] = (data ?? []).map((m) => ({
    ...m,
    agent: getLeagueAgent(m.agentName),
  }));

  return (
    <LeaguePanel fill={false} className="overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.02] px-3 py-2.5">
        <Radio className="h-3.5 w-3.5 text-[#a855f7]" />
        <span className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-[#a855f7]">
          Recent League Moments
        </span>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[68px] w-full rounded-xl" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <p className="px-3 py-4 text-[11px] text-white/40">No moments yet this season.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 py-3 sm:grid-cols-2 sm:auto-rows-fr lg:grid-cols-4">
          {moments.map((moment) => (
            <button
              type="button"
              key={moment.id}
              onClick={() => setOpenMoment(moment)}
              className="group relative overflow-hidden rounded-xl border border-white/12 bg-gradient-to-br from-white/[0.07] via-[#a855f7]/[0.04] to-black/30 px-3 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#a855f7]/50 hover:shadow-[0_12px_34px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.18)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.16),transparent_60%)] opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a855f7]/70 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-start gap-2.5">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#52cbff]/40 ring-offset-2 ring-offset-[#0a0a14]">
                  {moment.agent ? (
                    <ArenaAgentMedia src={moment.agent.img} alt={moment.agent.name} fit="cover" />
                  ) : (
                    <div className="h-full w-full bg-white/10" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-tech text-[11px] font-bold uppercase tracking-wide text-[#7fdcff] [text-shadow:0_0_10px_rgba(82,203,255,0.6)]">
                      {moment.agentName}
                    </span>
                    {moment.kp ? (
                      <span className="ml-auto shrink-0 rounded-full border border-[#00f080]/30 bg-[#00f080]/10 px-1.5 py-px font-tech text-[9px] font-bold text-[#00f080]">
                        +{moment.kp} KP
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 font-body text-[12.5px] font-medium leading-snug text-white/85 [text-shadow:0_0_14px_rgba(203,213,225,0.25)]">
                    {stripLeadingName(moment.text, moment.agentName)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={openMoment !== null} onOpenChange={(open) => !open && setOpenMoment(null)}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border-white/12 bg-[#0a0a14] p-0">
          {openMoment ? (
            <div>
              <div className="relative h-64 w-full overflow-hidden bg-black sm:h-72">
                {openMoment.agent ? (
                  <ArenaAgentMedia src={openMoment.agent.img} alt={openMoment.agent.name} fit="contain" position="top" />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                  <span className="font-tech text-sm font-black uppercase tracking-wide text-[#7fdcff] [text-shadow:0_0_10px_rgba(82,203,255,0.6)]">
                    {openMoment.agentName}
                  </span>
                  {openMoment.kp ? (
                    <span className="ml-auto shrink-0 rounded-full border border-[#00f080]/30 bg-[#00f080]/10 px-2 py-0.5 font-tech text-[10px] font-bold text-[#00f080]">
                      +{openMoment.kp} KP
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="p-4 pt-3">
                <p className="font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-[#a855f7]">
                  League moment
                </p>
                <p className="mt-1.5 font-body text-sm font-medium leading-relaxed text-white/90">
                  {stripLeadingName(openMoment.text, openMoment.agentName)}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </LeaguePanel>
  );
}
