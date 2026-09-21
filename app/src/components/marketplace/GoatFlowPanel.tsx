/**
 * Pay for a job through GOAT Flow.
 *
 * The other funding path (FundEscrowPanel) has the buyer sign a USDC
 * authorization that our relayer submits. This one routes the same payment
 * through GOAT: the buyer transfers USDC to GOAT, and GOAT's operator calls
 * our receiver on Base, which locks the money in the same escrow against the
 * same signed agreement. Settlement, refunds and the verifier are unchanged.
 *
 * Three wallet steps, in the order GOAT's integration guide requires:
 *
 *   1. sign the callback request on the chain its domain names,
 *   2. submit that signature through our backend,
 *   3. switch to the paying chain and transfer the tokens.
 *
 * The signature is what binds the payment to this job. Without it GOAT would
 * still take the money and the receiver would hold it as refundable credit
 * rather than funding anything, which is why the transfer is offered only once
 * the signature is in.
 */

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, formatUnits } from "viem";
import { base } from "viem/chains";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Wallet } from "lucide-react";

import {
  BASESCAN_TX,
  a2aMarketplaceApi,
  type A2AJob,
  type GoatOrder,
} from "@/api/a2aMarketplaceApi";

/** Off-chain statuses from which a job can still be funded. */
const FUNDABLE_STATUSES = ["POSTED", "NEGOTIATING"];

/**
 * GOAT's smallest order, in USDC base units. Their API rejects anything below
 * it, so a cheap job has to be paid directly.
 */
const GOAT_MINIMUM_BASE_UNITS = 100000;

/** Job statuses that mean the money already reached the escrow. */
const FUNDED_STATUSES = ["ESCROWED", "EXECUTING", "DELIVERED", "SETTLED"];

/**
 * The struct GOAT's receiver hashes, declared here rather than passed through
 * from the response. The wallet must sign these exact fields for the signature
 * to recover on-chain, and declaring them means a swapped struct cannot be
 * signed even if it arrived looking plausible.
 */
const CALLBACK_TYPES = {
  Eip3009CallbackData: [
    { name: "token", type: "address" },
    { name: "owner", type: "address" },
    { name: "payer", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "orderId", type: "bytes32" },
    { name: "calldataNonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "calldataHash", type: "bytes32" },
  ],
} as const;

const ERC20_TRANSFER_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

type Props = {
  job: A2AJob;
  /** True when the viewer owns the creating agent. */
  isCreator: boolean;
};

export function GoatFlowPanel({ job, isCreator }: Props) {
  const queryClient = useQueryClient();
  const { wallets } = useWallets();

  const [order, setOrder] = useState<GoatOrder | null>(null);
  const [signed, setSigned] = useState(false);
  const [payTxHash, setPayTxHash] = useState<string | null>(null);

  /** Poll once a payment is in flight, until the job is funded. */
  const statusQuery = useQuery({
    queryKey: ["a2a", "goat-order", job.id, order?.orderId],
    queryFn: () => a2aMarketplaceApi.getGoatOrder(job.id, order!.orderId),
    enabled: !!order && !!payTxHash && !FUNDED_STATUSES.includes(job.status),
    refetchInterval: 5000,
    retry: false,
  });

  const settledStatus = statusQuery.data?.jobStatus ?? "";
  const bound = FUNDED_STATUSES.includes(job.status) || FUNDED_STATUSES.includes(settledStatus);

  // The job query owns the funded/not-funded truth everywhere else on the page,
  // so let it know the moment the payment lands. In an effect, not in render:
  // invalidating during render would re-enter this component immediately.
  const jobIsFunded = FUNDED_STATUSES.includes(job.status);
  useEffect(() => {
    if (!jobIsFunded && FUNDED_STATUSES.includes(settledStatus)) {
      queryClient.invalidateQueries({ queryKey: ["a2a", "job", job.id] });
    }
  }, [queryClient, job.id, jobIsFunded, settledStatus]);

  function walletFor(address: string) {
    const wallet = wallets.find((w) => w.address.toLowerCase() === address.toLowerCase()) ?? wallets[0];
    if (!wallet) throw new Error("No wallet connected");
    return wallet;
  }

  const openOrder = useMutation({
    mutationFn: () => a2aMarketplaceApi.createGoatOrder(job.id),
    onSuccess: (created) => {
      setOrder(created);
      setSigned(false);
      setPayTxHash(null);
    },
  });

  const sign = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error("No order");
      const request = order.calldataSignRequest;
      const message = request.message;

      const wallet = walletFor(message.payer);
      // Signed against the chain the receiver lives on, which is the chain the
      // domain names, not necessarily the chain being paid from.
      await wallet.switchChain(request.domain.chainId);

      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        transport: custom(await wallet.getEthereumProvider()),
      });

      const signature = await walletClient.signTypedData({
        account: wallet.address as `0x${string}`,
        domain: {
          name: request.domain.name,
          version: request.domain.version,
          chainId: request.domain.chainId,
          verifyingContract: request.domain.verifyingContract as `0x${string}`,
        },
        types: CALLBACK_TYPES,
        primaryType: "Eip3009CallbackData",
        message: {
          token: message.token as `0x${string}`,
          owner: message.owner as `0x${string}`,
          payer: message.payer as `0x${string}`,
          amount: BigInt(message.amount),
          orderId: message.orderId as `0x${string}`,
          calldataNonce: BigInt(message.calldataNonce),
          deadline: BigInt(message.deadline),
          calldataHash: message.calldataHash as `0x${string}`,
        },
      });

      await a2aMarketplaceApi.submitGoatSignature(job.id, order.orderId, signature);
    },
    onSuccess: () => setSigned(true),
  });

  const pay = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error("No order");

      const wallet = walletFor(order.calldataSignRequest.message.payer);
      await wallet.switchChain(order.payChainId);

      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: base,
        transport: custom(await wallet.getEthereumProvider()),
      });

      // Every GOAT flow settles as a plain ERC-20 transfer to the address the
      // order names. Their operator watches for it, then calls our receiver.
      return walletClient.writeContract({
        address: order.tokenContract as `0x${string}`,
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [order.payToAddress as `0x${string}`, BigInt(order.amountWei)],
      });
    },
    onSuccess: (hash) => setPayTxHash(hash),
  });

  if (!isCreator) return null;
  if (!FUNDABLE_STATUSES.includes(job.status) && !payTxHash && !bound) return null;

  const amount = order ? formatUnits(BigInt(order.amountWei), 6) : job.agreedPrice?.display;
  const belowMinimum = !order && Number(job.agreedPrice?.baseUnits ?? 0) < GOAT_MINIMUM_BASE_UNITS;
  const held = statusQuery.data?.heldCreditBaseUnits;
  const unboundCredit = !!held && held !== "0" && !bound;
  const wrongPayChain = !!order && order.payChainId !== base.id;
  const failed = openOrder.error ?? sign.error ?? pay.error;

  if (bound) {
    return (
      <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
        <h3 className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
          <CheckCircle2 className="h-3 w-3" />
          Paid with GOAT Flow
        </h3>
        <p className="mt-1 text-[11px] text-white/60">
          GOAT settled the payment and the USDC is locked in the escrow for this job.
        </p>
        {payTxHash ? <TxLink hash={payTxHash} label="Your payment" /> : null}
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-black/30 p-4">
      <h3 className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-[#f59e0b]">
        <Wallet className="h-3 w-3" />
        Pay with GOAT Flow
      </h3>
      <p className="mt-1 text-[11px] text-white/50">
        Your wallet pays GOAT; GOAT locks the USDC in the same escrow. Settlement, refund
        and verification are identical to paying directly.
      </p>

      {belowMinimum ? (
        <Warning>
          GOAT Flow needs at least 0.10 USDC per payment, and this job is {job.agreedPrice?.display} USDC.
          Use Fund escrow above, or agree a higher price.
        </Warning>
      ) : !order ? (
        <>
          <button
            type="button"
            onClick={() => openOrder.mutate()}
            disabled={openOrder.isPending}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-[#f59e0b] transition hover:bg-[#f59e0b]/20 disabled:opacity-40"
          >
            {openOrder.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wallet className="h-3 w-3" />}
            Pay {amount ?? ""} USDC with GOAT Flow
          </button>
          <p className="mt-2 text-[10px] text-white/35">
            You pay the gas for this transfer, so this wallet needs a little ETH.
          </p>
        </>
      ) : (
        <>
          <dl className="mt-3 space-y-1.5">
            <Row label="Amount" value={`${amount} USDC`} />
            <Row label="Pay to" value={short(order.payToAddress)} />
            <Row label="Chain" value={order.payChainId === base.id ? "Base" : String(order.payChainId)} />
            <Row label="Order" value={short(order.orderId)} />
          </dl>

          {wrongPayChain ? (
            <Warning>
              This order is for chain {order.payChainId}, and this screen only pays from Base.
            </Warning>
          ) : !signed ? (
            <Step
              n={1}
              label="Authorize this job"
              detail="Signs the exact payment GOAT will settle. No money moves yet."
              busy={sign.isPending}
              onClick={() => sign.mutate()}
            />
          ) : !payTxHash ? (
            <Step
              n={2}
              label={`Send ${amount} USDC`}
              detail="Transfers the USDC to GOAT. Their operator then locks it in the escrow."
              busy={pay.isPending}
              onClick={() => pay.mutate()}
            />
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/50">
              <Loader2 className="h-3 w-3 animate-spin" />
              Waiting for GOAT to settle
              {statusQuery.data ? ` — order ${statusQuery.data.order.status.toLowerCase()}` : ""}
            </p>
          )}

          {payTxHash ? <TxLink hash={payTxHash} label="Your payment" /> : null}

          {unboundCredit ? (
            <Warning>
              GOAT confirmed the payment but it has not reached this job yet. It is held as
              credit in our receiver, and only you can withdraw it.
            </Warning>
          ) : null}
        </>
      )}

      {failed ? (
        <p className="mt-2 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] text-rose-300">
          {extractError(failed)}
        </p>
      ) : null}
    </section>
  );
}

function Step({ n, label, detail, busy, onClick }: {
  n: number;
  label: string;
  detail: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-[#f59e0b] transition hover:bg-[#f59e0b]/20 disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Step {n} of 2 · {label}
      </button>
      <p className="mt-2 text-[10px] text-white/35">{detail}</p>
    </>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-300">
      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function TxLink({ hash, label }: { hash: string; label: string }) {
  return (
    <a
      href={BASESCAN_TX(hash)}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#f59e0b] hover:text-[#f59e0b]"
    >
      {label} on BaseScan
      <ExternalLink className="h-2.5 w-2.5" />
    </a>
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

function short(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function extractError(error: unknown): string {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  const message = e.response?.data?.error ?? e.message ?? "GOAT Flow payment failed";
  if (/user rejected|denied|User denied/i.test(message)) return "Cancelled in your wallet.";
  return message;
}
