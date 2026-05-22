import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { Metric } from "@/components/dashboard/Metric";
import agentNexus from "@/assets/agent-nexus.jpg";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

type DashboardLiveAgentPanelProps = {
  agent: AiArenaAgent | null;
  isLoading: boolean;
  onCreateAgent: () => void;
};

function winRatePct(agent: AiArenaAgent): number {
  const draws = agent.draws ?? 0;
  const total = agent.wins + agent.losses + draws;
  if (total === 0) return 0;
  return Math.round((agent.wins / total) * 1000) / 10;
}

function winRate(agent: AiArenaAgent): string {
  return `${winRatePct(agent)}%`;
}

export function DashboardLiveAgentPanel({ agent, isLoading, onCreateAgent }: DashboardLiveAgentPanelProps) {
  if (isLoading) {
    return (
      <section className="arena-panel flex min-h-[200px] items-center justify-center border-white/8 bg-[#04080f]/95 p-8">
        <span className="font-tech text-[10px] uppercase tracking-wider text-white/40">Loading agent…</span>
      </section>
    );
  }

  if (!agent) {
    return (
      <section className="arena-panel flex flex-col items-center justify-center gap-4 border-white/8 bg-[#04080f]/95 p-8 text-center">
        <p className="text-sm text-white/55">No AI agent yet. Create one to enter the arena.</p>
        <button
          type="button"
          onClick={onCreateAgent}
          className="btn-primary inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          Create agent
        </button>
      </section>
    );
  }

  return (
    <section className="arena-panel overflow-hidden border-white/8 bg-[#04080f]/95">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative h-[240px] overflow-hidden border-r border-white/6 bg-[#0a0f18] lg:h-auto">
          <img src={agentNexus} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative flex h-full items-center justify-center p-6">
            <ArenaAgentThumbnail agent={agent} size="md" className="h-24 w-24 rounded-xl" />
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="rounded border border-[#8b29ff]/50 bg-[#5b1499]/35 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#d773ff]">
                {agent.archetype}
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">{agent.name}</h2>
              <p className="mt-1 text-sm text-white/55">
                {agent.clan} · {agent.evolutionStage}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 font-tech text-[9px] font-bold uppercase ${
                agent.status?.toLowerCase() === "inactive"
                  ? "border-amber-500/35 bg-amber-950/50 text-amber-400"
                  : "border-emerald-500/35 bg-emerald-950/50 text-[#00f080]"
              }`}
            >
              {agent.status || "Active"}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-tech text-sm text-white">ELO {agent.eloRating.toLocaleString()}</span>
            <div className="h-1.5 min-w-0 flex-1 rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7430ff] to-[#b12eff]"
                style={{ width: `${winRatePct(agent)}%` }}
              />
            </div>
            <span className="text-xs text-white/50">Win rate {winRate(agent)}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-0 rounded-md border border-white/8 bg-white/[0.02] sm:grid-cols-4">
            <Metric label="Battles" value={String(agent.wins + agent.losses + (agent.draws ?? 0))} />
            <Metric label="Wins" value={String(agent.wins)} />
            <Metric label="Losses" value={String(agent.losses)} />
            <Metric label="ELO" value={agent.eloRating.toLocaleString()} icon />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              to="/my-agents"
              className="btn-primary flex h-10 items-center justify-center gap-2 rounded-md font-tech text-[10px] font-bold uppercase tracking-wider"
            >
              Manage agents <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/training"
              className="flex h-10 items-center justify-center rounded-md border border-white/13 bg-[#0a0f1b]/60 font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 transition hover:border-purple-500/35"
            >
              Train agent
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
