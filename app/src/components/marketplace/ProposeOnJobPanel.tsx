/**
 * Manual proposal — take a job without waiting for the auto-bid tick.
 *
 * Auto-bid covers the autonomous path, but an owner watching a specific job
 * should be able to put an agent forward immediately. This is that button.
 *
 * Eligibility is shown before the attempt rather than after. The server
 * recomputes it and would reject an unqualified agent anyway, but a button
 * that fails on click teaches nothing; one that says "needs combat skill 90,
 * this agent has never been measured" tells the owner exactly what to fix.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { a2aMarketplaceApi, type A2AJob, type Negotiation } from "@/api/a2aMarketplaceApi";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";

type Props = {
  job: A2AJob;
  negotiations: Negotiation[];
};

export function ProposeOnJobPanel({ job, negotiations }: Props) {
  const queryClient = useQueryClient();
  const { data: agentsResult } = useMyArenaAgents();
  const myAgents = useMemo(() => agentsResult?.agents ?? [], [agentsResult]);

  // Agents already in this negotiation, and the one that posted the job.
  const engaged = new Set(negotiations.map((n) => n.providerAgentId));
  const candidates = myAgents.filter(
    (a) => a.id !== job.creatorAgentId && !engaged.has(a.id),
  );

  const [agentId, setAgentId] = useState<string>("");
  const selected = agentId || candidates[0]?.id || "";

  // What does this agent qualify for? Answers before the click.
  const matchQuery = useQuery({
    queryKey: ["a2a", "matching", selected],
    queryFn: () => a2aMarketplaceApi.getMatchingJobs(selected),
    enabled: !!selected,
  });

  const propose = useMutation({
    mutationFn: () => a2aMarketplaceApi.openNegotiation(job.id, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["a2a", "negotiations", job.id] });
      queryClient.invalidateQueries({ queryKey: ["a2a", "job", job.id] });
    },
  });

  if (candidates.length === 0) return null;
  if (job.status !== "POSTED" && job.status !== "NEGOTIATING") return null;

  const eligible = matchQuery.data?.matches.some((m) => m.jobId === job.id) ?? null;
  const rejection = matchQuery.data?.rejected.find((r) => r.jobId === job.id);

  return (
    <section className="rounded-lg border border-white/10 bg-black/30 p-4">
      <h3 className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
        Take this job
      </h3>
      <p className="mt-1 text-[11px] text-white/45">
        Put one of your agents forward as the trainer.
      </p>

      {candidates.length > 1 ? (
        <select
          value={selected}
          onChange={(e) => setAgentId(e.target.value)}
          className="mt-3 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-[#8b5cf6]/50 focus:outline-none"
        >
          {candidates.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-3 font-mono text-[11px] text-white/70">{candidates[0]?.name}</p>
      )}

      {matchQuery.isLoading ? (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking eligibility…
        </p>
      ) : eligible === true ? (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8b5cf6]">
          <CheckCircle2 className="h-3 w-3" />
          This agent meets the requirements.
        </p>
      ) : eligible === false ? (
        <p className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-300">
          <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{rejection?.reason ?? "This agent does not meet the requirements."}</span>
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => propose.mutate()}
        disabled={!selected || propose.isPending || eligible === false}
        className="mt-3 flex items-center gap-1.5 rounded border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6] transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {propose.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Propose as trainer
      </button>

      {propose.error ? (
        <p className="mt-2 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
          {extractError(propose.error)}
        </p>
      ) : null}

      <p className="mt-2 text-[10px] text-white/30">
        Opening a proposal does not commit you to a price. You negotiate next.
      </p>
    </section>
  );
}

function extractError(error: unknown): string {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  return e.response?.data?.error ?? e.message ?? "Could not propose";
}
