/**
 * One job, end to end.
 *
 * The lifecycle rail is the spine; below it sit the negotiation transcript,
 * the escrow state, and the settlement receipt. Every economically meaningful
 * value on this page is either linked to a Base transaction or accompanied by
 * the hash that makes it checkable.
 *
 * The independent-verification banner is deliberate: the backend recomputes
 * the requirements hash from the stored bytes on every read, and if that ever
 * disagrees with what is on-chain the user sees it rather than us hiding it.
 */

import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ExternalLink, FileJson, Loader2, ShieldCheck } from "lucide-react";

import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { A2ALifecycleRail } from "@/components/marketplace/A2ALifecycleRail";
import {
  BASESCAN_ADDRESS,
  BASESCAN_TX,
  a2aMarketplaceApi,
  shortHash,
  type Negotiation,
  type NegotiationMessage,
} from "@/api/a2aMarketplaceApi";

export default function A2AJobDetailPage() {
  const { jobId = "" } = useParams();

  const jobQuery = useQuery({
    queryKey: ["a2a", "job", jobId],
    queryFn: () => a2aMarketplaceApi.getJob(jobId),
    enabled: !!jobId,
    refetchInterval: 10_000,
  });

  const negotiationsQuery = useQuery({
    queryKey: ["a2a", "negotiations", jobId],
    queryFn: () => a2aMarketplaceApi.listNegotiations(jobId),
    enabled: !!jobId,
    refetchInterval: 10_000,
  });

  if (jobQuery.isLoading) {
    return (
      <ArenaPageLayout>
        <div className="flex items-center gap-2 py-16 text-xs text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading job…
        </div>
      </ArenaPageLayout>
    );
  }

  if (jobQuery.error || !jobQuery.data) {
    return (
      <ArenaPageLayout>
        <p className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {(jobQuery.error as Error)?.message ?? "Job not found"}
        </p>
      </ArenaPageLayout>
    );
  }

  const { job, verification, onChain } = jobQuery.data;
  const negotiations = negotiationsQuery.data ?? [];
  const agreed = negotiations.find((n) => n.state === "AGREED");

  return (
    <ArenaPageLayout contentClassName="max-w-5xl">
      <header>
        <Link to="/marketplace/a2a" className="text-[10px] text-white/40 hover:text-white/70">
          ← Marketplace
        </Link>
        <h1 className="mt-1 font-tech text-lg font-bold uppercase tracking-[0.2em] text-white">
          {job.gameId} training job
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">{job.prompt}</p>
      </header>

      {/* Integrity banner — surfaced, never hidden. */}
      {!verification.valid && (
        <div className="flex items-start gap-2 rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <div className="text-[11px] text-rose-300">
            <p className="font-bold">Requirements document does not match its on-chain hash.</p>
            <p className="text-rose-300/70">{verification.reason}</p>
          </div>
        </div>
      )}

      <A2ALifecycleRail
        status={job.status}
        evidence={{
          POST: { txHash: job.postTxHash },
          DISCOVER: { detail: `${negotiations.length} agent${negotiations.length === 1 ? "" : "s"} engaged` },
          NEGOTIATE: agreed?.transcriptHash
            ? { detail: `transcript ${shortHash(agreed.transcriptHash, 4)}` }
            : undefined,
        }}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {negotiations.length === 0 ? (
            <section className="rounded-lg border border-dashed border-white/15 py-10 text-center">
              <p className="text-xs text-white/40">
                No agent has proposed yet. Qualified agents discover this job automatically.
              </p>
            </section>
          ) : (
            negotiations.map((n) => <NegotiationRoom key={n.id} negotiation={n} />)
          )}
        </div>

        <aside className="space-y-4">
          <Panel title="Terms">
            <Row label="Target" value={`${job.target.metric} ≥ ${job.target.value}`} />
            <Row label="Budget" value={`${job.budget.min} – ${job.budget.max} USDC`} />
            <Row
              label="Delivery window"
              value={`${Math.round(job.executionWindowSeconds / 3600)}h`}
            />
            {job.providerRequirements.map((p, i) => (
              <Row key={i} label={i === 0 ? "Trainer needs" : ""} value={`${p.metric} ≥ ${p.value}`} />
            ))}
          </Panel>

          <Panel title="Verifiability">
            <HashRow label="Requirements" hash={job.requirementsHash} />
            {job.requirementsRootHash && (
              <HashRow label="0G Storage" hash={job.requirementsRootHash} />
            )}
            <a
              href={a2aMarketplaceApi.requirementsDocumentUrl(job.id)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
            >
              <FileJson className="h-3 w-3" />
              Canonical document
            </a>
            {verification.valid && (
              <p className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Hash reproduces from the stored bytes
              </p>
            )}
          </Panel>

          <Panel title="On Base">
            {job.postTxHash ? (
              <TxRow label="Registered" hash={job.postTxHash} />
            ) : (
              <p className="text-[10px] text-white/35">Not yet on-chain</p>
            )}
            {onChain ? (
              <p className="mt-2 text-[10px] text-white/35">
                Chain status:{" "}
                <span className="font-mono text-white/60">{String((onChain as Record<string, unknown>).status)}</span>
              </p>
            ) : null}
          </Panel>
        </aside>
      </div>
    </ArenaPageLayout>
  );
}

/**
 * The negotiation transcript.
 *
 * Each message shows its signer and signature. That is the point: the price
 * was not set by a form field, it was signed by two agents, and the chain of
 * digests means no message can be edited after the fact without detection.
 */
function NegotiationRoom({ negotiation }: { negotiation: Negotiation }) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
          Negotiation
        </h3>
        <span
          className={`font-tech text-[10px] uppercase ${
            negotiation.state === "AGREED"
              ? "text-emerald-400"
              : negotiation.state === "OPEN"
                ? "text-cyan-300"
                : "text-white/40"
          }`}
        >
          {negotiation.state}
          {negotiation.turn ? ` · ${negotiation.turn} to move` : ""}
        </span>
      </div>

      {!negotiation.verification.valid && (
        <p className="mt-2 rounded border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[10px] text-rose-300">
          Transcript failed chain verification — messages may have been altered.
        </p>
      )}

      <ol className="mt-3 space-y-2">
        {negotiation.messages.map((m) => (
          <MessageRow key={m.seq} message={m} />
        ))}
      </ol>

      {negotiation.agreedPrice && (
        <div className="mt-3 flex items-center justify-between rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <span className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Agreed
          </span>
          <span className="font-mono text-sm text-emerald-300">
            {negotiation.agreedPrice.display} {negotiation.agreedPrice.currency}
          </span>
        </div>
      )}

      {negotiation.agreementHash && (
        <p className="mt-2 font-mono text-[10px] text-white/35">
          Agreement {shortHash(negotiation.agreementHash, 5)} · signed by both agents
        </p>
      )}
    </section>
  );
}

function MessageRow({ message }: { message: NegotiationMessage }) {
  const isCreator = message.role === "CREATOR";
  return (
    <li
      className={`flex flex-col gap-0.5 rounded border px-3 py-2 ${
        isCreator
          ? "border-purple-500/25 bg-purple-500/5"
          : "border-cyan-500/25 bg-cyan-500/5"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`font-tech text-[10px] font-bold uppercase tracking-wider ${
            isCreator ? "text-purple-300" : "text-cyan-300"
          }`}
        >
          {message.role} · {message.kind}
        </span>
        {message.price && (
          <span className="font-mono text-xs text-white">{message.price.display} USDC</span>
        )}
      </div>

      {message.note && <p className="text-[11px] text-white/60">{message.note}</p>}

      <a
        href={BASESCAN_ADDRESS(message.signerAddress)}
        target="_blank"
        rel="noreferrer"
        className="mt-0.5 flex items-center gap-1 font-mono text-[9px] text-white/30 transition hover:text-white/60"
        title={`Signature ${message.signature}`}
      >
        signed by {shortHash(message.signerAddress, 4)}
        <ExternalLink className="h-2 w-2" />
      </a>
    </li>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/30 p-4">
      <h3 className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
        {title}
      </h3>
      <div className="mt-2 space-y-1.5">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      <span className="font-mono text-[11px] text-white">{value}</span>
    </div>
  );
}

function HashRow({ label, hash }: { label: string; hash: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      <span className="font-mono text-[10px] text-white/70" title={hash}>
        {shortHash(hash, 5)}
      </span>
    </div>
  );
}

function TxRow({ label, hash }: { label: string; hash: string }) {
  return (
    <a
      href={BASESCAN_TX(hash)}
      target="_blank"
      rel="noreferrer"
      className="flex items-baseline justify-between gap-3 transition hover:text-cyan-300"
    >
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-400">
        {shortHash(hash, 4)}
        <ExternalLink className="h-2.5 w-2.5" />
      </span>
    </a>
  );
}
