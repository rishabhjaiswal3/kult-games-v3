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

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Moves tradeable pUSD from the Polymarket deposit wallet to any address --
 * matches how real Polymarket's own withdrawal flow works (paste a
 * destination address, funds go there), not just back to the connected
 * wallet. Defaults the field to the user's own wallet since that's the
 * common case, but it's editable. Requires one wallet signature authorizing
 * the deposit wallet's own transfer() (see usePolymarketWithdraw.ts for why).
 */
export function PolymarketWithdrawModal({ open, onOpenChange, availablePusd }: PolymarketWithdrawModalProps) {
  const { walletAddress } = useAuth();
  const { status, error, withdraw } = usePolymarketWithdraw();
  const [amount, setAmount] = useState<number>(availablePusd ?? 0);
  const [toAddress, setToAddress] = useState<string>(walletAddress ?? "");
  const [done, setDone] = useState<{ transactionID: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(availablePusd ?? 0);
      setToAddress(walletAddress ?? "");
      setDone(null);
      setCopied(false);
    }
  }, [open, availablePusd, walletAddress]);

  const isBusy = status !== "idle" && status !== "done";
  const addressValid = ADDRESS_RE.test(toAddress);

  async function handleWithdraw() {
    if (amount <= 0 || !addressValid) return;
    setDone(null);
    try {
      const result = await withdraw(amount, toAddress);
      setDone(result);
    } catch {
      // error from the hook already surfaces below
    }
  }

  async function copyToAddress() {
    if (!addressValid) return;
    try {
      await navigator.clipboard.writeText(toAddress);
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
            Move your tradeable <span className="font-semibold text-neon-cyan">pUSD</span> to any Polygon address --
            defaults to your own wallet below, but you can paste a different one. Requires one wallet signature, no
            gas needed.
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

          <div className="rounded-xl border border-white/10 bg-[#05070d]/95 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan">Send To</span>
              {walletAddress ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setToAddress(walletAddress)}
                  className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/50 hover:text-white disabled:opacity-40"
                >
                  Use my wallet
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="0x…"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value.trim())}
                disabled={isBusy}
                className="h-8 min-w-0 flex-1 rounded-md border border-white/15 bg-black/30 px-2 font-mono text-xs text-foreground outline-none focus:border-neon-cyan/50 disabled:opacity-50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!addressValid}
                className="h-8 shrink-0 gap-1 rounded-lg border-white/10 bg-background/75 px-2 text-[10px]"
                onClick={() => void copyToAddress()}
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            {addressValid ? (
              <p className="mt-1 font-mono text-[10px] text-white/40" title={toAddress}>
                {shortenAddress(toAddress)}
              </p>
            ) : toAddress ? (
              <p className="mt-1.5 text-[10px] text-rose-400">Not a valid Polygon address.</p>
            ) : null}
            <p className="mt-1.5 text-[10px] text-amber-200/80">
              Double-check this address -- pUSD sent to the wrong address can't be recovered.
            </p>
          </div>

          <Button
            type="button"
            disabled={isBusy || amount <= 0 || !addressValid || (availablePusd != null && amount > availablePusd)}
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
