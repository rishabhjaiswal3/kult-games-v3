/**
 * Fund escrow.
 *
 * The creator signs a USDC EIP-3009 authorization; KULT's relayer submits it.
 * That is why this asks for a signature and never a transaction: the creator
 * needs no ETH on Base, only USDC.
 *
 * What the user is agreeing to is stated plainly before they sign, because a
 * wallet popup showing a raw typed-data blob explains nothing. The amount, the
 * destination, and the fact that it is refundable are all on screen first.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { AlertTriangle, ExternalLink, Loader2, Lock } from "lucide-react";

import { BASESCAN_TX, a2aMarketplaceApi, type A2AJob } from "@/api/a2aMarketplaceApi";

/**
 * Off-chain statuses from which funding is still possible.
 *
 * A job moves to NEGOTIATING as soon as a thread opens, while the ON-CHAIN
 * status stays POSTED until fundWithAuthorization runs. Checking only for
 * POSTED made funding unreachable for any job that had been negotiated, which
 * is every job that reaches this point.
 */
const FUNDABLE_STATUSES = ["POSTED", "NEGOTIATING"];

type Props = {
  job: A2AJob;
  /** True when the viewer owns the creating agent. */
  isCreator: boolean;
};

export function FundEscrowPanel({ job, isCreator }: Props) {
  const queryClient = useQueryClient();
  const { wallets } = useWallets();

  const requestQuery = useQuery({
    queryKey: ["a2a", "funding-request", job.id],
    queryFn: () => a2aMarketplaceApi.getFundingRequest(job.id),
    enabled: isCreator && FUNDABLE_STATUSES.includes(job.status),
    // A stale nonce or expiry would be rejected, so do not cache this.
    staleTime: 0,
    retry: false,
  });

  const fund = useMutation({
    mutationFn: async () => {
      const request = requestQuery.data;
      if (!request) throw new Error("No funding request available");

      const wallet = wallets.find(
        (w) => w.address.toLowerCase() === request.typedData.message.from.toLowerCase(),
      ) ?? wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      // USDC lives on Base; signing against another chain produces a valid
      // signature for the wrong domain, which fails inside the token.
      await wallet.switchChain(base.id);
      const provider = await wallet.getEthereumProvider();

      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: base,
        transport: custom(provider),
      });

      const message = request.typedData.message;

      // Declared literally rather than passed through from the server. viem
      // needs it statically to infer the message type, and it means the client
      // physically cannot be talked into signing a different struct than the
      // one USDC expects.
      const signature = await walletClient.signTypedData({
        account: wallet.address as `0x${string}`,
        domain: {
          name: request.typedData.domain.name,
          version: request.typedData.domain.version,
          chainId: request.typedData.domain.chainId,
          verifyingContract: request.typedData.domain.verifyingContract as `0x${string}`,
        },
        types: {
          ReceiveWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        primaryType: "ReceiveWithAuthorization",
        message: {
          from: message.from as `0x${string}`,
          to: message.to as `0x${string}`,
          value: BigInt(message.value),
          validAfter: BigInt(message.validAfter),
          validBefore: BigInt(message.validBefore),
          nonce: message.nonce as `0x${string}`,
        },
      });

      return a2aMarketplaceApi.fundJob(job.id, {
        signature,
        value: message.value,
        validAfter: message.validAfter,
        validBefore: message.validBefore,
        nonce: message.nonce,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["a2a", "job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["a2a", "negotiations", job.id] });
    },
  });

  if (!isCreator) return null;

  // Already funded, or past funding: show the receipt instead of the action.
  if (!FUNDABLE_STATUSES.includes(job.status)) {
    const funded = ["ESCROWED", "EXECUTING", "DELIVERED", "SETTLED"].includes(job.status);
    if (!funded) return null;
    return (
      <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
        <h3 className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
          <Lock className="h-3 w-3" />
          Escrow funded
        </h3>
        <p className="mt-1 text-[11px] text-white/60">
          USDC is locked in the contract until the work is verified.
        </p>
      </section>
    );
  }

  const request = requestQuery.data;
  const blocked = requestQuery.error as { response?: { data?: { error?: string } } } | null;

  return (
    <section className="rounded-lg border border-white/10 bg-black/30 p-4">
      <h3 className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
        <Lock className="h-3 w-3" />
        Fund escrow
      </h3>

      {requestQuery.isLoading ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
          <Loader2 className="h-3 w-3 animate-spin" />
          Preparing…
        </p>
      ) : blocked ? (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-300">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{blocked.response?.data?.error ?? "Not ready to fund yet."}</span>
        </p>
      ) : request ? (
        <>
          <dl className="mt-3 space-y-1.5">
            <Row label="Amount" value={`${request.amount.display} ${request.amount.currency}`} />
            <Row label="From" value={short(request.typedData.message.from)} />
            <Row label="Locked in" value={short(request.typedData.message.to)} />
          </dl>

          <button
            type="button"
            onClick={() => fund.mutate()}
            disabled={fund.isPending}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-40"
          >
            {fund.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
            Lock {request.amount.display} USDC
          </button>

          <p className="mt-2 text-[10px] text-white/35">
            You sign, we pay the gas. You need no ETH — only USDC.
          </p>
          <p className="mt-1 text-[10px] text-white/30">
            Refunded automatically if the work is not delivered or does not hit the target.
          </p>
        </>
      ) : null}

      {fund.error ? (
        <p className="mt-2 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
          {extractError(fund.error)}
        </p>
      ) : null}

      {fund.data?.txHash ? (
        <a
          href={BASESCAN_TX(fund.data.txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-1 font-mono text-[10px] text-cyan-400 hover:text-cyan-300"
        >
          View on BaseScan
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      ) : null}
    </section>
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

function short(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function extractError(error: unknown): string {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  const message = e.response?.data?.error ?? e.message ?? "Funding failed";
  // Wallet rejections are a normal outcome, not a fault worth a stack trace.
  if (/user rejected|denied|User denied/i.test(message)) return "Signature cancelled.";
  return message;
}
