import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";

const ArenaMatchmakingPanel = () => {
  const queueQ = useQuery({
    queryKey: ["aiArenaGateway", "matchmakingStatusCards"],
    queryFn: async () => {
      const agentsRes = await aiArenaGatewayApi.getMyAgents(1, 6);
      const agents = agentsRes.agents ?? [];
      const enriched = await Promise.all(
        agents.map(async (agent) => {
          try {
            const statusRes = await aiArenaGatewayApi.getMatchmakingStatus(agent.id);
            return { agent, status: statusRes.status };
          } catch {
            return { agent, status: null };
          }
        })
      );
      return enriched;
    },
    staleTime: 10_000,
    refetchInterval: 12_000,
    retry: 1,
  });

  return (
    <section
      id="arena-matchmaking"
      className="relative scroll-mt-[calc(4rem+env(safe-area-inset-top,0px)+0.75rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 20% 20%, hsl(0 85% 50% / 0.06), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, hsl(195 100% 50% / 0.05), transparent)",
        }}
      />

      <div className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 neural-grid opacity-[0.05]" aria-hidden />

        <header className="relative z-10 mb-6 flex flex-col gap-3 border-b border-white/[0.08] pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/90">
              <span className="h-px w-8 shrink-0 bg-gradient-to-r from-neon-cyan/80 to-transparent" />
              Matchmaking
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Arena <span className="gradient-text">lobby</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Queue status from <span className="font-mono text-[11px] text-neon-cyan/80">/v1/matchmaking/status/:agentId</span> for your agents.
            </p>
          </div>
        </header>

        <div className="relative z-10 rounded-xl border border-white/[0.08] bg-gradient-to-b from-card/[0.4] to-card/[0.08] p-4 shadow-[0_20px_60px_hsl(220_60%_2%/0.18)] backdrop-blur-sm sm:p-5">
          {queueQ.isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <p className="text-sm text-muted-foreground">Could not load queue status.</p>
              <p className="max-w-md text-xs text-muted-foreground/85">
                Set AI Arena bearer token to call protected matchmaking endpoints.
              </p>
            </div>
          ) : queueQ.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <p className="text-sm text-muted-foreground">Loading matchmaking statuses…</p>
            </div>
          ) : (queueQ.data?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <p className="text-sm text-muted-foreground">No agents found for this AI Arena account.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
              {queueQ.data?.map(({ agent, status }) => (
                <li
                  key={agent.id}
                  className="rounded-xl border border-white/[0.08] bg-background/45 p-4 transition hover:border-neon-cyan/25 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate font-semibold text-sm">{agent.name}</p>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">ELO {agent.eloRating}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{agent.archetype} • {agent.clan}</p>
                  <div className="mt-4 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-muted-foreground">
                    {status?.inQueue ? (
                      <>
                        In queue • position <span className="text-foreground">{status.position ?? "—"}</span> • ETA{" "}
                        <span className="font-mono text-neon-cyan/90">{status.estimatedWaitMs ?? 0}</span> ms
                      </>
                    ) : status?.matchId ? (
                      <>
                        Matched • battle <span className="font-mono text-neon-cyan/90">{status.matchId}</span>
                      </>
                    ) : (
                      <>Not in queue</>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default ArenaMatchmakingPanel;
