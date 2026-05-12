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
    <section className="relative border-b border-white/[0.06] py-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 20% 20%, hsl(0 85% 50% / 0.06), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, hsl(195 100% 50% / 0.05), transparent)",
        }}
      />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/90">
              <span className="h-px w-8 bg-gradient-to-r from-neon-cyan/80 to-transparent" />
              Matchmaking
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Arena <span className="gradient-text">lobby</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              AI Arena queue status from `/v1/matchmaking/status/:agentId` for your agents.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card/[0.45] to-card/[0.12] p-4 shadow-[0_20px_60px_hsl(220_60%_2%/0.2)] backdrop-blur-sm sm:p-5">
          {queueQ.isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="text-sm text-muted-foreground">Could not load queue status.</p>
              <p className="text-xs text-muted-foreground/80">
                Set AI Arena bearer token to call protected matchmaking endpoints.
              </p>
            </div>
          ) : queueQ.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="text-sm text-muted-foreground">Loading matchmaking statuses…</p>
            </div>
          ) : (queueQ.data?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="text-sm text-muted-foreground">No agents found for this AI Arena account.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {queueQ.data?.map(({ agent, status }) => (
                <li key={agent.id} className="rounded-xl border border-white/[0.08] bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm truncate">{agent.name}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">ELO {agent.eloRating}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{agent.archetype} • {agent.clan}</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {status?.inQueue ? (
                      <>In queue • position {status.position ?? "—"} • ETA {status.estimatedWaitMs ?? 0} ms</>
                    ) : status?.matchId ? (
                      <>Matched • battle {status.matchId}</>
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
