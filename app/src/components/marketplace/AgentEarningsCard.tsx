/**
 * An agent's earnings, and getting them out.
 *
 * The escrow pays a trainer agent's own wallet, not the wallet its owner logs
 * in with, so money that is genuinely theirs sits in an address they never see
 * in their wallet app. This card shows that balance and moves it.
 *
 * The withdrawal costs the owner nothing and needs no ETH: the agent signs a
 * USDC authorization naming the owner's wallet, and KULT's relayer pays the
 * gas to deliver it. The destination is fixed inside that signature, which is
 * why this screen has no address field to fill in — there is nothing here for
 * anyone to redirect.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, ExternalLink, Loader2, Wallet } from "lucide-react";

import { BASESCAN_ADDRESS, BASESCAN_TX, a2aMarketplaceApi, shortHash } from "@/api/a2aMarketplaceApi";
import { cn } from "@/lib/utils";

type Props = {
  agentId: string;
  className?: string;
};

export function AgentEarningsCard({ agentId, className }: Props) {
  const queryClient = useQueryClient();

  const earnings = useQuery({
    queryKey: ["a2a", "earnings", agentId],
    queryFn: () => a2aMarketplaceApi.getAgentEarnings(agentId),
    enabled: !!agentId,
    retry: false,
  });

  const withdraw = useMutation({
    mutationFn: () => a2aMarketplaceApi.withdrawAgentEarnings(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["a2a", "earnings", agentId] });
    },
  });

  // An agent with no identity yet has no wallet to hold anything.
  if (earnings.isError) return null;

  const data = earnings.data;
  const balance = Number.parseFloat(data?.display ?? "0");

  return (
    <section className={cn("rounded-lg border border-white/10 bg-black/30 p-4", className)}>
      <h3 className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
        <Wallet className="h-3 w-3" />
        Agent earnings
      </h3>

      {earnings.isLoading ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
          <Loader2 className="h-3 w-3 animate-spin" />
          Reading the agent wallet…
        </p>
      ) : data ? (
        <>
          <p className="mt-3 font-tech text-2xl font-black text-white">
            {data.display} <span className="text-sm font-bold text-white/40">USDC</span>
          </p>
          <p className="mt-1 text-[11px] text-white/45">
            Held by this agent's own wallet on Base, paid straight out of escrow when its work was
            accepted.
          </p>

          <dl className="mt-3 space-y-1.5">
            <Row
              label="Agent wallet"
              value={shortHash(data.wallet, 5)}
              href={BASESCAN_ADDRESS(data.wallet)}
            />
            <Row
              label="Withdraws to"
              value={data.ownerWallet ? shortHash(data.ownerWallet, 5) : "No owner wallet on record"}
              href={data.ownerWallet ? BASESCAN_ADDRESS(data.ownerWallet) : undefined}
            />
          </dl>

          <button
            type="button"
            onClick={() => withdraw.mutate()}
            disabled={!data.withdrawable || withdraw.isPending}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6] transition hover:bg-[#8b5cf6]/20 disabled:opacity-40"
          >
            {withdraw.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-3 w-3" />
            )}
            {balance > 0 ? `Withdraw ${data.display} USDC` : "Nothing to withdraw yet"}
          </button>

          <p className="mt-2 text-[10px] text-white/35">
            Goes to the wallet you signed in with. We pay the gas, so the agent needs no ETH.
          </p>
        </>
      ) : null}

      {withdraw.error ? (
        <p className="mt-2 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
          {extractError(withdraw.error)}
        </p>
      ) : null}

      {withdraw.data ? (
        <a
          href={BASESCAN_TX(withdraw.data.txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#8b5cf6] hover:text-[#60a5fa]"
        >
          Sent {withdraw.data.display} USDC — view on BaseScan
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      ) : null}
    </section>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[10px] uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="font-mono text-[11px] text-white">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="hover:text-[#8b5cf6]">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function extractError(error: unknown): string {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  return e.response?.data?.error ?? e.message ?? "Withdrawal failed";
}
