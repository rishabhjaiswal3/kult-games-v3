import { useEffect, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogFooter,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePolymarketWithdraw } from "@/hooks/usePolymarketWithdraw";

type PolymarketWithdrawModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current tradeable pUSD balance, if known -- prefills the amount field. */
  availablePusd: number | null;
};

const STATUS_LABEL: Record<string, string> = {
  "switching-network": "Switching to Polygon…",
  withdrawing: "Withdrawing (check your wallet)…",
};

function shortenAddress(address: string) {
  if (address.length < 18) return address;
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

/**
 * Moves tradeable pUSD from the Polymarket deposit wallet back to the
 * user's own wallet -- the withdrawal counterpart to PolymarketDepositModal.
 * Unlike deposits (send-to-address or a plain wrap tx), this requires one
 * wallet signature authorizing the deposit wallet's own transfer() (see
 * usePolymarketWithdraw.ts for why).
 */
export function PolymarketWithdrawModal({ open, onOpenChange, availablePusd }: PolymarketWithdrawModalProps) {
  const { walletAddress } = useAuth();
  const { status, error, withdraw } = usePolymarketWithdraw();
  const [amount, setAmount] = useState<number>(availablePusd ?? 0);
  const [done, setDone] = useState<{ transactionID: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(availablePusd ?? 0);
      setDone(null);
      setCopied(false);
    }
  }, [open, availablePusd]);

  const isBusy = status !== "idle" && status !== "done";

  async function handleWithdraw() {
    if (amount <= 0) return;
    setDone(null);
    try {
      const result = await withdraw(amount);
      setDone(result);
    } catch {
      // error from the hook already surfaces below
    }
  }

  async function copyAddress() {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard may be blocked
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent size="lg" className="max-w-[480px]">
        <ArenaDialogHeader>
          <ArenaDialogTitle className="font-display text-left text-xl">Withdraw from Polymarket</ArenaDialogTitle>
          <ArenaDialogDescription className="text-left text-xs sm:text-sm">
            Move your tradeable <span className="font-semibold text-neon-cyan">pUSD</span> back to your own wallet as{" "}
            <span className="font-semibold text-neon-cyan">USDC.e</span> on Polygon. Requires one wallet signature --
            no gas needed.
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        <ArenaDialogBody className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#05070d]/95 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan">Available</span>
              <span className="font-tech text-sm font-bold text-foreground">
                {availablePusd != null ? `$${availablePusd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              </span>
            </div>

            <div className="mt-3 border-t border-white/8 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan">Transfer to</span>
              {walletAddress ? (
                <div className="mt-1.5 flex min-w-0 items-center gap-2">
                  <span
                    className="min-w-0 flex-1 whitespace-nowrap font-mono text-xs text-foreground sm:text-sm"
                    title={walletAddress}
                  >
                    {shortenAddress(walletAddress)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 gap-1 rounded-lg border-white/10 bg-background/75 px-2 text-[10px]"
                    onClick={() => void copyAddress()}
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              ) : (
                <p className="mt-1.5 font-tech text-[11px] text-white/45">Connect a wallet to withdraw</p>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="font-tech text-[10px] uppercase tracking-wider text-muted-foreground">Amount</span>
              <input
                type="number"
                min={0.01}
                step={0.01}
                max={availablePusd ?? undefined}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                disabled={isBusy}
                className="h-8 flex-1 rounded-md border border-white/15 bg-black/30 px-2 font-tech text-sm font-bold text-foreground outline-none focus:border-neon-cyan/50 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={isBusy || availablePusd == null}
                onClick={() => setAmount(availablePusd ?? 0)}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white/60 hover:text-white disabled:opacity-40"
              >
                Max
              </button>
            </div>
          </div>

          <Button
            type="button"
            disabled={isBusy || amount <= 0 || (availablePusd != null && amount > availablePusd)}
            onClick={() => void handleWithdraw()}
            className="w-full gap-2"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isBusy ? STATUS_LABEL[status] ?? "Withdrawing…" : `Withdraw $${amount.toFixed(2)}`}
          </Button>

          {error ? (
            <p className="text-xs text-rose-400">{error}</p>
          ) : done ? (
            <p className="text-xs text-emerald-400">
              Withdrawal submitted{done.transactionID ? ` · ${done.transactionID.slice(0, 10)}…` : ""}. It should land in your wallet shortly.
            </p>
          ) : null}
        </ArenaDialogBody>

        <ArenaDialogFooter>
          <Button type="button" variant="outline" className="border-white/10 bg-background/50" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </ArenaDialogFooter>
      </ArenaDialogContent>
    </Dialog>
  );
}
