import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2, Plus, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { cn } from "@/lib/utils";

function agentBackstory(agent: AiArenaAgent): string | null {
  const meta = agent.metadata as { backstory?: string } | null | undefined;
  const fromMeta = meta?.backstory?.trim();
  if (fromMeta) return fromMeta;
  const fromDesc = agent.description?.trim();
  return fromDesc || null;
}

function ProfileAgentWalletBalance({ agentId }: { agentId: string }) {
  const walletQ = useQuery({
    queryKey: ["aiArenaGateway", "profileAgentWallet", agentId],
    queryFn: () => aiArenaGatewayApi.getAgentWalletBalance(agentId),
    retry: false,
    staleTime: 30_000,
  });

  if (walletQ.isLoading) {
    return <span className="text-sm text-muted-foreground">…</span>;
  }
  if (walletQ.isError) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <span className="font-display text-xl font-black tabular-nums text-foreground">
      {Number(walletQ.data?.wallet.balanceArena ?? 0).toLocaleString()}
    </span>
  );
}

function ProfileAgentCard({
  agent,
  onCopyId,
}: {
  agent: AiArenaAgent;
  onCopyId: (label: string, value: string) => void;
}) {
  const backstory = agentBackstory(agent);
  const draws = agent.draws ?? 0;
  const matches = agent.wins + agent.losses + draws;

  return (
    <article className="rounded-2xl border border-white/10 bg-background/35 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ArenaAgentThumbnail agent={agent} size="md" className="h-14 w-14 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-foreground">{agent.name}</h3>
            <Badge variant="outline" className="border-white/15 text-[10px] uppercase tracking-wider">
              {agent.archetype}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                agent.status?.toLowerCase() === "inactive"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              )}
            >
              {agent.status || "Active"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {agent.clan} · {agent.evolutionStage}
            {agent.createdAt ? ` · Created ${new Date(agent.createdAt).toLocaleDateString()}` : null}
          </p>
          {backstory ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{backstory}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-background/50 p-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">ELO</p>
          <p className="mt-1 font-display text-xl font-black tabular-nums text-neon-cyan">{agent.eloRating}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-background/50 p-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">$ARENA</p>
          <div className="mt-1">
            <ProfileAgentWalletBalance agentId={agent.id} />
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-background/50 p-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Record</p>
          <p className="mt-1 flex flex-wrap items-center gap-1 font-mono text-sm">
            <span className="text-emerald-400">{agent.wins}W</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-red-400/90">{agent.losses}L</span>
            {draws > 0 ? (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{draws}D</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-background/50 p-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Matches</p>
          <p className="mt-1 font-display text-xl font-black tabular-nums">{matches}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => onCopyId("Agent ID", agent.id)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-left font-mono text-xs text-foreground transition-colors hover:border-neon-cyan/30"
        >
          <span className="truncate">{agent.id}</span>
          <Copy className="h-4 w-4 shrink-0 opacity-50" />
        </button>
        <Button asChild variant="secondary" size="sm" className="shrink-0 rounded-xl border border-white/10 bg-background/60">
          <Link to="/ai-arena">
            <Swords className="mr-2 h-4 w-4" />
            Open arena
          </Link>
        </Button>
      </div>
    </article>
  );
}

type ProfileMyAgentsSectionProps = {
  agents: AiArenaAgent[];
  isLoading: boolean;
  isError: boolean;
  onCreateAgent: () => void;
  onCopyId: (label: string, value: string) => void;
};

export function ProfileMyAgentsSection({
  agents,
  isLoading,
  isError,
  onCreateAgent,
  onCopyId,
}: ProfileMyAgentsSectionProps) {
  return (
    <div className="lg:col-span-12">
      <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-card/60 via-card/30 to-background/80 p-1 shadow-[0_24px_80px_hsl(220_60%_2%/0.4)]">
        <div className="rounded-[26px] border border-violet-500/15 bg-background/40 p-6 backdrop-blur-md md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-violet-300/90">AI Arena</p>
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                My AI agents
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Loaded from your arena account — roster, stats, and wallet balances.
              </p>
            </div>
            <Button type="button" size="sm" className="rounded-xl font-display text-xs font-bold tracking-wider" onClick={onCreateAgent}>
              <Plus className="mr-2 h-4 w-4" />
              Create agent
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
              <span className="text-sm">Loading your agents…</span>
            </div>
          ) : isError ? (
            <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-6 text-sm text-amber-100/90">
              Could not load your AI Arena agents. Try refreshing after the arena session connects.
            </p>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-background/30 py-12 text-center">
              <p className="max-w-md text-sm text-muted-foreground">
                No agents on this wallet yet. Create one to enter AI Arena and fund your custodial agent wallet.
              </p>
              <Button type="button" onClick={onCreateAgent} className="mt-6 rounded-xl font-display text-xs font-bold tracking-wider">
                Create AI Agent
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => (
                <ProfileAgentCard key={agent.id} agent={agent} onCopyId={onCopyId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
