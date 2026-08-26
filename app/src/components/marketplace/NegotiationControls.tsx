/**
 * Negotiation controls — the interactive half of the transcript.
 *
 * The transcript was read-only, so a price could only be agreed through the
 * API. This adds the actual moves, and its job is to make the rules that
 * already exist server-side visible, rather than letting the user discover
 * them through rejected requests:
 *
 *   - Turns alternate. An agent cannot bid against itself, so the controls are
 *     hidden entirely when it is the other side's turn.
 *   - Prices sit inside the job's budget range. The submit button stays
 *     disabled outside it, because the contract rejects those at funding.
 *   - ACCEPT takes the price on the table, not a price of your own. It renders
 *     as a button showing that exact figure, never an editable field.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, Loader2, PenLine, Send, X } from "lucide-react";

import {
  a2aMarketplaceApi,
  formatUsdc,
  type A2AJob,
  type Negotiation,
} from "@/api/a2aMarketplaceApi";

type Props = {
  job: A2AJob;
  negotiation: Negotiation;
  /** Which side the viewer may act as. Null when they own neither agent. */
  side: "CREATOR" | "PROVIDER" | null;
};

export function NegotiationControls({ job, negotiation, side }: Props) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["a2a", "negotiations", job.id] });
    queryClient.invalidateQueries({ queryKey: ["a2a", "job", job.id] });
  };

  const offer = useMutation({
    mutationFn: (kind: "PROPOSE" | "COUNTER" | "ACCEPT" | "DECLINE") =>
      a2aMarketplaceApi.sendOffer(negotiation.id, {
        role: side as "CREATOR" | "PROVIDER",
        kind,
        ...(kind === "DECLINE"
          ? {}
          : {
              priceBaseUnits:
                kind === "ACCEPT"
                  ? (lastOfferedBaseUnits(negotiation) as string)
                  : toBaseUnits(price),
            }),
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: () => {
      setPrice("");
      setNote("");
      refresh();
    },
  });

  const sign = useMutation({
    mutationFn: () => a2aMarketplaceApi.signAgreement(negotiation.id),
    onSuccess: refresh,
  });

  // Not a party to this negotiation: read-only rather than dead buttons.
  if (!side) return null;

  const busy = offer.isPending || sign.isPending;
  const error = offer.error ?? sign.error;

  // ── Agreed: the only remaining action is signing ──────────────────────────
  if (negotiation.state === "AGREED") {
    const alreadySigned = !!negotiation.agreementHash;
    // The expiry is inside the EIP-712 signature and enforced on-chain, so an
    // expired agreement cannot be extended — both agents must sign again. The
    // price and transcript are unchanged, so re-signing is not a renegotiation.
    const expired =
      alreadySigned &&
      !!negotiation.agreementExpiry &&
      negotiation.agreementExpiry * 1000 < Date.now();
    return (
      <div className="mt-3 border-t border-white/10 pt-3">
        {expired ? (
          <>
            <p className="mb-2 flex items-start gap-1.5 text-[11px] text-amber-300">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                The signed agreement expired before it was funded. Sign again to refresh it — the
                agreed price and transcript do not change.
              </span>
            </p>
            {side === "CREATOR" ? (
              <button
                type="button"
                onClick={() => sign.mutate()}
                disabled={busy}
                className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-40"
              >
                {sign.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <PenLine className="h-3 w-3" />
                )}
                Re-sign at {negotiation.agreedPrice?.display} USDC
              </button>
            ) : (
              <p className="text-[11px] text-white/45">Waiting for the client to re-sign.</p>
            )}
          </>
        ) : alreadySigned ? (
          <p className="flex items-center gap-1.5 text-[11px] text-[#8b5cf6]">
            <Check className="h-3 w-3" />
            Signed by both agents. Ready to fund escrow.
          </p>
        ) : side === "CREATOR" ? (
          <>
            <button
              type="button"
              onClick={() => sign.mutate()}
              disabled={busy}
              className="flex items-center gap-1.5 rounded border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6] transition hover:bg-[#8b5cf6]/20 disabled:opacity-40"
            >
              {sign.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <PenLine className="h-3 w-3" />
              )}
              Sign agreement at {negotiation.agreedPrice?.display} USDC
            </button>
            <p className="mt-1.5 text-[10px] text-white/35">
              Both agents sign the same terms. The escrow verifies these signatures on-chain before
              any USDC moves.
            </p>
          </>
        ) : (
          <p className="text-[11px] text-white/45">Waiting for the client to sign.</p>
        )}
        {error ? <ErrorLine error={error} /> : null}
      </div>
    );
  }

  if (negotiation.state !== "OPEN") return null;

  // ── Not your turn ─────────────────────────────────────────────────────────
  if (negotiation.turn !== side) {
    return (
      <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/40">
        Waiting for {negotiation.turn === "CREATOR" ? "the client" : "the trainer"} to respond.
      </p>
    );
  }

  const opening = negotiation.messages.length === 0;
  const onTable = lastOfferedBaseUnits(negotiation);

  return (
    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-white/40">
            {opening ? "Your opening offer" : "Your counter"}
          </label>
          <div className="mt-1 flex items-center gap-2 rounded border border-white/10 bg-black/40 px-3 py-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={job.budget.min}
              inputMode="decimal"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
            <span className="font-tech text-[10px] font-bold text-white/40">USDC</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => offer.mutate(opening ? "PROPOSE" : "COUNTER")}
          disabled={busy || !isWithinBudget(price, job)}
          className="flex items-center gap-1.5 rounded border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6] transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {offer.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          {opening ? "Offer" : "Counter"}
        </button>
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)"
        className="w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-white placeholder:text-white/25 focus:outline-none"
      />

      <p className="text-[10px] text-white/30">
        Must be between {job.budget.min} and {job.budget.max} USDC. The contract rejects anything
        outside this range.
      </p>

      {/* ACCEPT is a fixed-price button, never an input: accepting a different
          number would be a counter wearing the wrong label, and the server
          rejects it. */}
      {onTable ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => offer.mutate("ACCEPT")}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6] transition hover:bg-[#8b5cf6]/20 disabled:opacity-40"
          >
            <Check className="h-3 w-3" />
            Accept {formatUsdc(onTable)} USDC
          </button>
          <button
            type="button"
            onClick={() => offer.mutate("DECLINE")}
            disabled={busy}
            className="flex items-center gap-1.5 rounded border border-white/15 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-rose-500/40 hover:text-rose-300 disabled:opacity-40"
          >
            <X className="h-3 w-3" />
            Decline
          </button>
        </div>
      ) : null}

      {error ? <ErrorLine error={error} /> : null}
    </div>
  );
}

function ErrorLine({ error }: { error: unknown }) {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  return (
    <p className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
      {e.response?.data?.error ?? e.message ?? "Something went wrong"}
    </p>
  );
}

/** The price the other side last put on the table, if any. */
function lastOfferedBaseUnits(negotiation: Negotiation): string | null {
  for (let i = negotiation.messages.length - 1; i >= 0; i -= 1) {
    const message = negotiation.messages[i];
    if (message.kind !== "DECLINE" && message.price) return message.price.baseUnits;
  }
  return null;
}

function isWithinBudget(amount: string, job: A2AJob): boolean {
  if (!/^\d+(\.\d{1,6})?$/.test(amount.trim())) return false;
  const units = BigInt(toBaseUnits(amount));
  return units >= BigInt(job.budget.minBaseUnits) && units <= BigInt(job.budget.maxBaseUnits);
}

/** String maths: 0.29 * 1e6 is 289999.99 in float. */
function toBaseUnits(amount: string): string {
  const [whole, fraction = ""] = amount.trim().split(".");
  return String(BigInt((whole || "0") + fraction.padEnd(6, "0").slice(0, 6)));
}
