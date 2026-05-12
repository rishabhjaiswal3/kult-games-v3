import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";

const WarzoneAgentTracker = () => {
  const myAgentsQ = useQuery({
    queryKey: ["aiArenaGateway", "trackerAgents"],
    queryFn: () => aiArenaGatewayApi.getMyAgents(1, 20),
    staleTime: 30_000,
    refetchInterval: 45_000,
    retry: 1,
  });

  const globalQ = useQuery({
    queryKey: ["aiArenaGateway", "trackerGlobalLeaderboard"],
    queryFn: () => aiArenaGatewayApi.getGlobalLeaderboard(5),
    staleTime: 30_000,
    refetchInterval: 45_000,
  });

  const agents = myAgentsQ.data?.agents ?? [];
  const top = globalQ.data?.entries ?? [];
  const apisOk = myAgentsQ.isSuccess || globalQ.isSuccess;

  return (
    <section id="warzone-agent-tracker" className="relative scroll-mt-24 border-b border-white/[0.06] py-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(195 100% 50% / 0.05), transparent), radial-gradient(ellipse 50% 40% at 90% 30%, hsl(270 80% 65% / 0.04), transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 neural-grid opacity-[0.07]" aria-hidden />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/90">
              <span className="h-px w-8 bg-gradient-to-r from-neon-cyan/80 to-transparent" />
              AI Arena
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Autonomous{" "}
              <span className="gradient-text">agent tracker</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Your agents and top leaderboard view from AI Arena gateway.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                apisOk ? "border-emerald-500/40 text-emerald-400" : "border-border/50 text-muted-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${apisOk ? "bg-emerald-400 shadow-[0_0_8px_hsl(150_80%_50%)]" : "bg-muted-foreground"}`} />
              {apisOk ? "ONLINE" : "IDLE"}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">My agents</p>
            <button
              type="button"
              onClick={() => {
                void myAgentsQ.refetch();
                void globalQ.refetch();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
          {myAgentsQ.isError ? (
            <p className="mt-4 text-sm text-muted-foreground">Could not load your agents. Set AI Arena auth token first.</p>
          ) : agents.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No agents yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {agents.map((agent) => (
                <li key={agent.id} className="rounded-lg border border-white/10 bg-background/40 p-3">
                  <p className="font-semibold text-sm">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.archetype} • {agent.clan} • ELO {agent.eloRating}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Top leaderboard</p>
          <ul className="mt-3 space-y-2">
            {top.map((entry) => (
              <li key={entry.agentId} className="flex items-center justify-between text-sm">
                <span>#{entry.rank} {entry.name}</span>
                <span className="text-muted-foreground">ELO {entry.eloRating}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WarzoneAgentTracker;
