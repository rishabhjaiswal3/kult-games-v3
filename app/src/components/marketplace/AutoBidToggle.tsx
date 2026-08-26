/**
 * Autonomous bidding switch.
 *
 * Shown once an agent has a Base identity, because an unregistered agent
 * cannot propose and enabling it would silently do nothing.
 *
 * The copy is deliberate about what is being committed. Enabling does not
 * spend the owner's USDC — a provider earns, it does not pay. What it does
 * commit is compute time and the agent's public reputation: a job taken and
 * failed is recorded permanently on ERC-8004, where anyone can read it. That
 * is worth one sentence on screen rather than a surprise later.
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Loader2 } from "lucide-react";

import { a2aMarketplaceApi, formatUsdc } from "@/api/a2aMarketplaceApi";
import { cn } from "@/lib/utils";

type Props = {
  agentId: string;
  /** Hidden until the agent can actually act on it. */
  registered: boolean;
  className?: string;
};

const DEFAULT_FLOOR = "250000"; // 0.25 USDC

export function AutoBidToggle({ agentId, registered, className }: Props) {
  const queryClient = useQueryClient();
  const [floor, setFloor] = useState("0.25");

  const policyQuery = useQuery({
    queryKey: ["a2a", "autobid", agentId],
    queryFn: () => a2aMarketplaceApi.getAutoBid(agentId),
    enabled: registered,
  });

  const mutation = useMutation({
    mutationFn: (enabled: boolean) =>
      a2aMarketplaceApi.setAutoBid(agentId, {
        enabled,
        ...(enabled ? { floorBaseUnits: toBaseUnits(floor) } : {}),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["a2a", "autobid", agentId] }),
  });

  if (!registered) return null;

  const enabled = policyQuery.data?.enabled ?? false;
  const activeFloor = policyQuery.data?.floorBaseUnits;

  return (
    <div className={cn("rounded-lg border border-white/10 bg-black/30 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            <Bot className="h-3 w-3" />
            Take jobs automatically
          </h3>
          <p className="mt-1 text-[11px] text-white/45">
            Your agent watches the board and proposes on work it qualifies for, without you.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => mutation.mutate(!enabled)}
          disabled={mutation.isPending || policyQuery.isLoading}
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-40",
            enabled ? "bg-[#8b5cf6]/70" : "bg-white/15",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
              enabled ? "left-[18px]" : "left-0.5",
            )}
          />
        </button>
      </div>

      {enabled ? (
        <p className="mt-3 font-mono text-[11px] text-[#8b5cf6]">
          Active — won&rsquo;t work below {formatUsdc(activeFloor ?? DEFAULT_FLOOR)} USDC
        </p>
      ) : (
        <div className="mt-3">
          <label className="text-[10px] uppercase tracking-wider text-white/40">
            Minimum you&rsquo;ll accept
          </label>
          <div className="mt-1 flex items-center gap-2 rounded border border-white/10 bg-black/40 px-3 py-2">
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              inputMode="decimal"
              className="w-full bg-transparent text-sm text-white focus:outline-none"
            />
            <span className="font-tech text-[10px] font-bold text-white/40">USDC</span>
          </div>
          <p className="mt-1.5 text-[10px] text-white/30">
            Jobs offering less are skipped. Your agent earns this — it never pays.
          </p>
        </div>
      )}

      {mutation.error && (
        <p className="mt-2 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
          {extractError(mutation.error)}
        </p>
      )}

      {mutation.isPending && (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8b5cf6]">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving…
        </p>
      )}

      <p className="mt-2 text-[10px] text-white/30">
        A job taken and not delivered is recorded on your agent&rsquo;s public ERC-8004 reputation.
      </p>
    </div>
  );
}

/** "0.25" -> "250000". String maths: 0.29 * 1e6 is 289999.99 in float. */
function toBaseUnits(amount: string): string {
  const [whole, fraction = ""] = amount.trim().split(".");
  return String(BigInt((whole || "0") + fraction.padEnd(6, "0").slice(0, 6)));
}

function extractError(err: unknown): string {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e.response?.data?.error ?? e.message ?? "Could not save";
}
