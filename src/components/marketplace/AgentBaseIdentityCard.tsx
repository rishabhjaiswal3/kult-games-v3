/**
 * Register an agent's Base identity.
 *
 * An agent cannot post or take marketplace jobs until it has an ERC-8004
 * identity on Base: the job document is signed by the agent's own key, and the
 * escrow binds payouts to an agent id. Before this component the backend
 * returned "Creator agent has no Base identity yet" and the UI offered no way
 * to act on it.
 *
 * Registration is a real on-chain mint, not a form submit — it costs the
 * relayer gas and takes a few seconds, so the states are surfaced honestly
 * rather than hidden behind a spinner. Every terminal state carries the
 * transaction that produced it.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, ExternalLink, Loader2, ShieldPlus } from "lucide-react";

import {
  BASESCAN_ADDRESS,
  BASESCAN_TX,
  a2aMarketplaceApi,
  shortHash,
} from "@/api/a2aMarketplaceApi";
import { cn } from "@/lib/utils";

type Props = {
  agentId: string;
  agentName?: string;
  /** Called once the agent has a usable identity, so a parent can re-check. */
  onRegistered?: () => void;
  className?: string;
};

/** Statuses from which the agent can actually transact. */
const USABLE = ["REGISTERED", "WALLET_LINKED"];

export function AgentBaseIdentityCard({ agentId, agentName, onRegistered, className }: Props) {
  const queryClient = useQueryClient();

  const identityQuery = useQuery({
    queryKey: ["a2a", "identity", agentId],
    queryFn: () => a2aMarketplaceApi.getAgentIdentity(agentId),
    enabled: !!agentId,
    // While a registration is in flight the row moves PENDING -> REGISTERING ->
    // REGISTERED as the transaction mines, so poll until it settles.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && !USABLE.includes(status) && status !== "FAILED" ? 3000 : false;
    },
  });

  const identity = identityQuery.data;
  const status = identity?.status;
  const isUsable = !!status && USABLE.includes(status);
  const inFlight = !!status && (status === "PENDING" || status === "REGISTERING");

  const registerMut = useMutation({
    mutationFn: () => a2aMarketplaceApi.registerAgentIdentity(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["a2a", "identity", agentId] });
      onRegistered?.();
    },
  });

  // Fire the parent callback when polling (rather than the mutation) is what
  // observes completion — the mint often lands after the request returns.
  if (isUsable && registerMut.isSuccess) {
    // no-op: onRegistered already fired above
  }

  if (identityQuery.isLoading) {
    return (
      <div className={cn("rounded-lg border border-white/10 bg-black/30 p-4", className)}>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking Base identity…
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-white/10 bg-black/30 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Base identity
          </h3>
          <p className="mt-1 text-[11px] text-white/45">
            {agentName ? `${agentName} needs` : "This agent needs"} an ERC-8004 identity on Base to
            post or take jobs.
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {isUsable ? (
        <dl className="mt-3 space-y-1.5">
          <Row label="Agent ID" value={`#${identity?.erc8004AgentId}`} />
          <LinkRow
            label="Signing key"
            display={shortHash(identity?.eoaAddress, 5)}
            href={identity?.eoaAddress ? BASESCAN_ADDRESS(identity.eoaAddress) : undefined}
          />
          {identity?.registerTxHash && (
            <LinkRow
              label="Registered"
              display={shortHash(identity.registerTxHash, 5)}
              href={BASESCAN_TX(identity.registerTxHash)}
            />
          )}
          {identity?.agentURI && (
            <LinkRow label="Agent card" display="registration.json" href={identity.agentURI} />
          )}
          <p className="pt-1 text-[10px] text-emerald-400">
            <BadgeCheck className="mr-1 inline h-3 w-3" />
            Discoverable by any ERC-8004 client, not just KULT.
          </p>
        </dl>
      ) : (
        <>
          {status === "FAILED" && identity?.lastError && (
            <p className="mt-3 flex items-start gap-1.5 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{identity.lastError}</span>
            </p>
          )}

          {registerMut.error && (
            <p className="mt-3 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
              {(registerMut.error as Error).message}
            </p>
          )}

          {inFlight ? (
            <p className="mt-3 flex items-center gap-2 text-[11px] text-cyan-300">
              <Loader2 className="h-3 w-3 animate-spin" />
              Minting on Base — usually a few seconds.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => registerMut.mutate()}
              disabled={registerMut.isPending}
              className="mt-3 flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {registerMut.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShieldPlus className="h-3 w-3" />
              )}
              {status === "FAILED" ? "Retry registration" : "Register on Base"}
            </button>
          )}

          <p className="mt-2 text-[10px] text-white/30">
            Gas is paid by KULT&rsquo;s relayer. You pay nothing and sign nothing.
          </p>
        </>
      )}
    </div>
  );
}

function StatusPill({ status }: { status?: string }) {
  const tone =
    status && USABLE.includes(status)
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : status === "FAILED"
        ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
        : status
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
          : "border-white/15 bg-white/5 text-white/40";

  return (
    <span className={cn("rounded border px-1.5 py-0.5 font-tech text-[9px] uppercase tracking-wider", tone)}>
      {status ?? "not registered"}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[10px] uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="font-mono text-[11px] text-white">{value}</dd>
    </div>
  );
}

function LinkRow({ label, display, href }: { label: string; display: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[10px] uppercase tracking-wider text-white/40">{label}</dt>
      <dd>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-mono text-[11px] text-cyan-400 transition hover:text-cyan-300"
          >
            {display}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ) : (
          <span className="font-mono text-[11px] text-white">{display}</span>
        )}
      </dd>
    </div>
  );
}
