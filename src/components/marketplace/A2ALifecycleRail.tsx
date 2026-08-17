/**
 * The lifecycle rail — the visual spine of the marketplace.
 *
 *   POST → DISCOVER → NEGOTIATE → ESCROW → TRAIN → DELIVER → SETTLE
 *
 * Each completed stage carries the Base transaction that made it real, with a
 * BaseScan link. That is the whole point: the economic story is legible at a
 * glance, and every claim on screen is checkable against the chain by someone
 * who does not trust us.
 *
 * Stages with no transaction (DISCOVER, NEGOTIATE) are off-chain by design —
 * they show their evidence instead (match count, transcript hash), rather than
 * a fake link.
 */

import { CheckCircle2, Circle, ExternalLink, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BASESCAN_TX,
  LIFECYCLE_STAGES,
  shortHash,
  stageIndexForStatus,
  type A2AJobStatus,
  type LifecycleStage,
} from "@/api/a2aMarketplaceApi";

export type StageEvidence = {
  /** Base transaction hash, when this stage produced one. */
  txHash?: string | null;
  /** Off-chain evidence: a hash, a count, a measured value. */
  detail?: string | null;
};

type Props = {
  status: A2AJobStatus;
  evidence?: Partial<Record<LifecycleStage, StageEvidence>>;
  className?: string;
};

const FAILED_STATES: A2AJobStatus[] = ["REFUNDED", "CANCELLED", "FAILED", "DISPUTED"];

const STAGE_CAPTIONS: Record<LifecycleStage, string> = {
  POST: "Job registered on Base",
  DISCOVER: "Qualified agents matched",
  NEGOTIATE: "Price agreed and signed",
  ESCROW: "USDC locked on Base",
  TRAIN: "Provider performing the work",
  DELIVER: "Result hash committed",
  SETTLE: "Escrow released",
};

export function A2ALifecycleRail({ status, evidence = {}, className }: Props) {
  const current = stageIndexForStatus(status);
  const failed = FAILED_STATES.includes(status);
  const inFlight = ["POSTING", "EXECUTING"].includes(status);

  return (
    <div className={cn("rounded-lg border border-white/10 bg-black/30 p-4", className)}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
          Economic lifecycle
        </h3>
        <span
          className={cn(
            "font-tech text-[10px] uppercase tracking-wider",
            failed ? "text-rose-400" : status === "SETTLED" ? "text-emerald-400" : "text-purple-300",
          )}
        >
          {status}
        </span>
      </div>

      <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-1">
        {LIFECYCLE_STAGES.map((stage, index) => {
          const done = index < current || (index === current && status === "SETTLED");
          const active = index === current && status !== "SETTLED";
          const stageFailed = failed && index === current;
          const stageEvidence = evidence[stage];

          return (
            <li key={stage} className="flex flex-1 flex-row items-start gap-2 sm:flex-col sm:items-stretch">
              {/* Connector + marker */}
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-1">
                <StageIcon done={done} active={active} failed={stageFailed} inFlight={active && inFlight} />
                {index < LIFECYCLE_STAGES.length - 1 && (
                  <span
                    className={cn(
                      "hidden h-px flex-1 sm:block",
                      done ? "bg-emerald-500/50" : "bg-white/10",
                    )}
                  />
                )}
              </div>

              <div className="pb-4 sm:pb-0 sm:pt-2">
                <p
                  className={cn(
                    "font-tech text-[10px] font-bold uppercase tracking-wider",
                    stageFailed
                      ? "text-rose-400"
                      : done
                        ? "text-emerald-300"
                        : active
                          ? "text-cyan-300"
                          : "text-white/40",
                  )}
                >
                  {stage}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-white/40">
                  {STAGE_CAPTIONS[stage]}
                </p>

                {stageEvidence?.txHash ? (
                  <a
                    href={BASESCAN_TX(stageEvidence.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-cyan-400 transition hover:text-cyan-300"
                  >
                    {shortHash(stageEvidence.txHash, 4)}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ) : stageEvidence?.detail ? (
                  <p className="mt-1 font-mono text-[10px] text-white/50">{stageEvidence.detail}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {failed && (
        <p className="mt-3 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
          {status === "REFUNDED"
            ? "Escrow returned to the creator. The provider was not paid."
            : status === "DISPUTED"
              ? "Escalated to an arbiter. Funds remain locked until resolved."
              : status === "CANCELLED"
                ? "Withdrawn before funding. No money moved."
                : "Could not be registered on Base."}
        </p>
      )}
    </div>
  );
}

function StageIcon({
  done,
  active,
  failed,
  inFlight,
}: {
  done: boolean;
  active: boolean;
  failed: boolean;
  inFlight: boolean;
}) {
  const base = "h-4 w-4 shrink-0";

  if (failed) return <XCircle className={cn(base, "text-rose-400")} />;
  if (inFlight) return <Loader2 className={cn(base, "animate-spin text-cyan-400")} />;
  if (done) return <CheckCircle2 className={cn(base, "text-emerald-400")} />;
  if (active) return <Circle className={cn(base, "animate-pulse text-cyan-400")} />;
  return <Circle className={cn(base, "text-white/20")} />;
}
