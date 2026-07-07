import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink, Loader2, ShieldCheck, WalletCards } from "lucide-react";
import { arenaChainApi, zeroGExplorer, type OnChainEvent } from "@/api/arenaChainApi";
import { ArenaTokenAmount } from "@/components/arena/ArenaTokenAmount";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogFooter,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

type ArenaAgentWalletManagerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents?: AiArenaAgent[];
  agentsLoading?: boolean;
  initialAgentId?: string | null;
  onCreateAgent?: () => void;
  onWalletUpdated?: (agentId: string) => void | Promise<void>;
};

function shortHash(value?: string | null) {
  if (!value) return "—";
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}…${value.slice(-8)}`;
}

function formatTxDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatEventName(value?: string | null) {
  return (value ?? "EVENT").replaceAll("_", " ");
}

function eventAmount(event: OnChainEvent): string | null {
  const raw = event.args?.amount;
  if (raw == null) return null;
  const num = typeof raw === "string" ? Number.parseFloat(raw) : Number(raw);
  if (!Number.isFinite(num)) return null;
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function WalletEventRow({ event }: { event: OnChainEvent }) {
  const amount = eventAmount(event);

  return (
    <div className="rounded-xl border border-white/10 bg-[#02070d]/90 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan">
            <WalletCards className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold uppercase text-foreground">
              {formatEventName(event.eventName)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{formatTxDate(event.occurredAt)}</div>
          </div>
        </div>
        {amount ? (
          <div className="text-right">
            <div className="font-mono text-sm font-semibold text-foreground">{amount} ARENA</div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        {event.txHash ? (
          <a
            href={zeroGExplorer.tx(event.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono transition hover:text-neon-cyan"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            Tx {shortHash(event.txHash)}
          </a>
        ) : null}
        {event.blockNumber != null ? <span className="font-mono">Block {event.blockNumber}</span> : null}
      </div>
    </div>
  );
}

export function ArenaAgentWalletManagerModal({
  open,
  onOpenChange,
}: ArenaAgentWalletManagerModalProps) {
  const { walletAddress } = useAuth();

  const walletQ = useQuery({
    queryKey: ["arenaChain", "walletManager", "wallet", walletAddress],
    queryFn: () => arenaChainApi.getWalletBalance(walletAddress!),
    enabled: open && !!walletAddress,
    retry: false,
  });

  const transactionsQ = useQuery({
    queryKey: ["arenaChain", "walletManager", "transactions", walletAddress],
    queryFn: () => arenaChainApi.getWalletTransactions(walletAddress!, 1, 8),
    enabled: open && !!walletAddress,
    retry: false,
  });

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent size="xl" className="max-w-[1180px]">
        <ArenaDialogHeader>
          <ArenaDialogTitle className="font-display text-left text-xl sm:text-2xl">My Wallet</ArenaDialogTitle>
          <ArenaDialogDescription className="text-left text-xs sm:text-sm">
            Your $ARENA balance and on-chain activity on 0G Chain. ARENA lives directly in your own wallet — there is
            no deposit or withdrawal flow here.
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        <ArenaDialogBody className="space-y-4">
          {!walletAddress ? (
            <div className="rounded-2xl border border-dashed border-white/12 bg-[#02070d]/90 px-5 py-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#03070d]/90 text-neon-cyan">
                <WalletCards className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-lg text-foreground">No wallet connected</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Connect your 0G wallet to view your $ARENA balance and on-chain activity.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-2xl border border-white/10 bg-[#03070d]/95 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan">Wallet Overview</p>
                    <p className="mt-1 text-xs text-muted-foreground">Your live on-chain $ARENA balance on 0G Chain.</p>
                  </div>
                  {walletQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                </div>

                {walletQ.isLoading ? (
                  <div className="space-y-3">
                    <div className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/5" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/5" />
                      <div className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/5" />
                    </div>
                  </div>
                ) : walletQ.isError ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90">
                    Wallet details are not available right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/10 bg-[#05070d]/95 p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Live Balance</div>
                          <div className="mt-2">
                            <ArenaTokenAmount amount={Number.parseFloat(walletQ.data?.balanceArena ?? "0")} size="md" />
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          On-chain
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#05070d]/95 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Wallet Address</div>
                        <a
                          href={zeroGExplorer.address(walletAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-neon-cyan/20 bg-neon-cyan/8 px-2 py-0.5 text-[10px] font-mono text-neon-cyan transition hover:bg-neon-cyan/15"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          0G Explorer
                        </a>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">{walletAddress}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 rounded-lg border-white/10 bg-background/75 px-2 text-[10px]"
                          onClick={() => void copyText(walletAddress)}
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#03070d]/95 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-purple">Recent Wallet Activity</p>
                    <p className="mt-1 text-xs text-muted-foreground">On-chain $ARENA events for your wallet on 0G Chain.</p>
                  </div>
                  {transactionsQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                </div>

                {transactionsQ.isLoading ? (
                  <div className="space-y-3">
                    <div className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/5" />
                    <div className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/5" />
                    <div className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/5" />
                  </div>
                ) : transactionsQ.isError ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90">
                    Wallet activity is not available right now.
                  </div>
                ) : transactionsQ.data?.events?.length ? (
                  <div className="space-y-2.5">
                    {transactionsQ.data.events.map((event) => (
                      <WalletEventRow key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#05070d]/95 px-4 py-5 text-sm text-muted-foreground">
                    No on-chain activity has been recorded for this wallet yet.
                  </div>
                )}
              </section>
            </div>
          )}
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
