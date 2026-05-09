import { Shield, ExternalLink } from "lucide-react";
import type { ZgDaReceipt } from "@/types/aiWarzone";

interface ZgDaProofPanelProps {
  receipt: ZgDaReceipt;
  /** Optional label shown in the panel header */
  label?: string;
}

function short(value: string, chars = 10): string {
  if (value.length <= chars * 2 + 3) return value;
  return `${value.slice(0, chars)}…${value.slice(-chars)}`;
}

const STATUS_STYLE: Record<string, string> = {
  finalized: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  dispersing: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  pending: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  failed: "text-red-400 border-red-500/30 bg-red-500/10",
};

/**
 * Renders a 0G DA receipt block. Pass any object that includes ZgDaReceipt fields.
 * Shows nothing if none of the DA fields are present.
 */
export default function ZgDaProofPanel({ receipt, label = "0G DA Receipt" }: ZgDaProofPanelProps) {
  const hasAny =
    receipt.daRequestId ||
    receipt.daBatchHeaderHash ||
    receipt.daBatchId != null ||
    receipt.daBlobIndex != null;

  if (!hasAny) return null;

  const status = receipt.daStatus?.toLowerCase() ?? "pending";
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE.pending;

  return (
    <div
      className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-2 mt-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
            {label}
          </span>
        </div>
        {receipt.daStatus && (
          <span className={`text-[9px] font-mono uppercase tracking-wider border rounded-full px-2 py-0.5 ${statusStyle}`}>
            {receipt.daStatus}
          </span>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-1.5 text-[10px] font-mono">
        {receipt.daRequestId && (
          <Row label="Request ID" value={short(receipt.daRequestId, 8)} full={receipt.daRequestId} />
        )}
        {receipt.daBatchHeaderHash && (
          <Row label="Batch Hash" value={short(receipt.daBatchHeaderHash, 8)} full={receipt.daBatchHeaderHash} />
        )}
        {receipt.daBatchId != null && (
          <Row label="Batch ID" value={String(receipt.daBatchId)} />
        )}
        {receipt.daBlobIndex != null && (
          <Row label="Blob Index" value={String(receipt.daBlobIndex)} />
        )}
        {receipt.daConfirmationBlock != null && (
          <Row label="Block" value={String(receipt.daConfirmationBlock)} />
        )}
        {receipt.daFinalizedAt && (
          <Row label="Finalized" value={new Date(receipt.daFinalizedAt).toLocaleString()} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value, full }: { label: string; value: string; full?: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      {full && full.length > value.length ? (
        <button
          onClick={() => navigator.clipboard?.writeText(full)}
          title={`Copy: ${full}`}
          className="text-sky-300/80 hover:text-sky-300 text-right break-all transition-colors cursor-copy"
        >
          {value}
        </button>
      ) : (
        <span className="text-sky-300/80 text-right break-all">{value}</span>
      )}
    </div>
  );
}
