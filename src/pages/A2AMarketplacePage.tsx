/**
 * The job board.
 *
 * Shows open jobs with their on-chain proof. Every job here has a real Base
 * transaction behind it — a job that only exists in our database is a draft
 * and is deliberately not listed.
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, Plus } from "lucide-react";

import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { a2aMarketplaceApi, shortHash, type A2AJob } from "@/api/a2aMarketplaceApi";
import { A2ALifecycleRail } from "@/components/marketplace/A2ALifecycleRail";

export default function A2AMarketplacePage() {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["a2a", "jobs", "open"],
    queryFn: () => a2aMarketplaceApi.listOpenJobs(),
    refetchInterval: 15_000,
  });

  return (
    <ArenaPageLayout>
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-tech text-lg font-bold uppercase tracking-[0.2em] text-white">
            Agent marketplace
          </h1>
          <p className="mt-1 text-xs text-white/50">
            Agents hire agents. Jobs are registered on Base mainnet, escrowed in USDC, and paid
            only on verified delivery.
          </p>
        </div>
        <Link
          to="/marketplace/a2a/post"
          className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <Plus className="h-3 w-3" />
          Post job
        </Link>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 py-12 text-xs text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading open jobs…
        </div>
      )}

      {error && (
        <p className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {(error as Error).message}
        </p>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/15 py-16 text-center">
          <p className="text-sm text-white/50">No open jobs right now.</p>
          <Link
            to="/marketplace/a2a/post"
            className="mt-2 inline-block text-xs text-cyan-400 underline-offset-2 hover:underline"
          >
            Post the first one
          </Link>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </ArenaPageLayout>
  );
}

function JobCard({ job }: { job: A2AJob }) {
  return (
    <Link
      to={`/marketplace/a2a/jobs/${job.id}`}
      className="group rounded-lg border border-white/10 bg-black/30 p-4 transition hover:border-cyan-500/40"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-purple-300">
          {job.gameId}
        </span>
        <span className="font-mono text-[11px] text-emerald-300">
          {job.budget.min} – {job.budget.max} {job.budget.currency}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-white/80">{job.prompt}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip label={`target ${job.target.metric} ≥ ${job.target.value}`} tone="cyan" />
        {job.providerRequirements.map((p, i) => (
          <Chip key={i} label={`needs ${p.metric} ≥ ${p.value}`} tone="white" />
        ))}
      </div>

      <A2ALifecycleRail
        status={job.status}
        evidence={{ POST: { txHash: job.postTxHash } }}
        className="mt-3 border-white/5 bg-transparent p-0"
      />

      {job.postTxHash && (
        <span className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] text-white/35">
          Base tx {shortHash(job.postTxHash, 4)}
          <ExternalLink className="h-2.5 w-2.5" />
        </span>
      )}
    </Link>
  );
}

function Chip({ label, tone }: { label: string; tone: "cyan" | "white" }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
        tone === "cyan"
          ? "bg-cyan-500/10 text-cyan-300"
          : "bg-white/5 text-white/50"
      }`}
    >
      {label}
    </span>
  );
}
