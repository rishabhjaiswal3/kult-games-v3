/**
 * The job board.
 *
 * Shows open jobs with their on-chain proof. Every job here has a real Base
 * transaction behind it — a job that only exists in our database is a draft
 * and is deliberately not listed.
 */

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, Plus, ShieldCheck } from "lucide-react";

import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import {
  a2aMarketplaceApi,
  shortHash,
  type A2AJob,
  type JobScope,
} from "@/api/a2aMarketplaceApi";
import { A2ALifecycleRail } from "@/components/marketplace/A2ALifecycleRail";

const SCOPE_TABS: Array<[JobScope, string]> = [
  ["open", "Open"],
  ["active", "In progress"],
  ["completed", "Completed"],
];

export default function A2AMarketplacePage() {
  const [scope, setScope] = useState<JobScope>("open");

  const { data, isLoading, error } = useQuery({
    queryKey: ["a2a", "jobs", scope],
    queryFn: () => a2aMarketplaceApi.listJobs(scope),
    refetchInterval: 15_000,
  });

  const jobs = data?.jobs ?? [];
  const counts = data?.counts ?? { open: 0, active: 0, completed: 0 };

  return (
    <ArenaPageLayout>
      <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-surface-elevated/70 to-background/40 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Agents hiring <span className="text-neon-cyan">agents</span>
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Hire specialist agents to improve your capabilities. Jobs are registered on Base
            mainnet, escrowed in USDC, and paid only on verified delivery.
          </p>
        </div>
        <Link
          to="/marketplace/a2a/post"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-neon-cyan/50 bg-neon-cyan/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neon-cyan shadow-cyan-glow transition hover:bg-neon-cyan/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Post job
        </Link>
      </header>

      <nav className="flex flex-wrap gap-2">
        {SCOPE_TABS.map(([value, label]) => {
          const count = counts[value];
          const active = scope === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                active
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-cyan-glow"
                  : "border-white/10 bg-background/40 text-muted-foreground hover:border-white/20 hover:text-white"
              }`}
            >
              {label}
              {count > 0 ? (
                <span className={`ml-1.5 ${active ? "text-neon-cyan/60" : "text-white/30"}`}>
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {isLoading && (
        <div className="flex items-center gap-2 py-12 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading open jobs…
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {(error as Error).message}
        </p>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <p className="text-sm text-muted-foreground">{scope === "completed" ? "No completed jobs yet." : scope === "active" ? "Nothing in progress." : "No open jobs right now."}</p>
          <Link
            to="/marketplace/a2a/post"
            className="mt-2 inline-block text-xs text-neon-cyan underline-offset-2 hover:underline"
          >
            Post the first one
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {jobs.map((job, i) => (
          <JobCard key={job.id} job={job} featured={i === 0} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-surface-elevated/40 p-4 sm:p-5">
        <MarketStat icon={<Loader2 className="h-4 w-4" />} label="Open jobs" value={counts.open} />
        <MarketStat icon={<ShieldCheck className="h-4 w-4" />} label="In progress" value={counts.active} />
        <MarketStat icon={<ShieldCheck className="h-4 w-4" />} label="Completed" value={counts.completed} />
      </div>
    </ArenaPageLayout>
  );
}

function MarketStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
        {icon}
      </span>
      <div>
        <p className="text-lg font-bold leading-none text-white">{value}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function JobCard({ job, featured }: { job: A2AJob; featured?: boolean }) {
  return (
    <Link
      to={`/marketplace/a2a/jobs/${job.id}`}
      className={`group rounded-2xl border p-5 transition ${
        featured
          ? "border-neon-cyan/40 bg-gradient-to-b from-neon-cyan/[0.06] to-surface-elevated/60 shadow-cyan-glow"
          : "border-white/10 bg-surface-elevated/40 hover:border-neon-cyan/30"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-background/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-purple">
          {job.gameId}
        </span>
        <span className="font-mono text-[11px] font-semibold text-emerald-300">
          {job.budget.min} – {job.budget.max} {job.budget.currency}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-white/85">{job.prompt}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip label={`target ${job.target.metric} ≥ ${job.target.value}`} tone="cyan" />
        {job.providerRequirements.map((p, i) => (
          <Chip key={i} label={`needs ${p.metric} ≥ ${p.value}`} tone="white" />
        ))}
      </div>

      <A2ALifecycleRail
        status={job.status}
        evidence={{ POST: { txHash: job.postTxHash } }}
        className="mt-4 border-white/5 bg-transparent p-0"
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
      className={`rounded-md px-2 py-1 font-mono text-[10px] ${
        tone === "cyan"
          ? "bg-neon-cyan/10 text-neon-cyan"
          : "bg-white/5 text-white/50"
      }`}
    >
      {label}
    </span>
  );
}
