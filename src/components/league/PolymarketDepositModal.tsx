import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2, RefreshCw } from "lucide-react";
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
import {
  polymarketBridgeApi,
  addressTypeForChainId,
  type BridgeAddressType,
} from "@/api/polymarketBridgeApi";

type PolymarketDepositModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | null;
};

const CHAIN_TABS: { key: BridgeAddressType; label: string; hint: string }[] = [
  { key: "evm", label: "EVM", hint: "Ethereum, Polygon, Arbitrum, Base, Optimism & other EVM chains" },
  { key: "svm", label: "Solana", hint: "Solana mainnet" },
  { key: "btc", label: "Bitcoin", hint: "Bitcoin mainnet" },
  { key: "tvm", label: "Tron", hint: "Tron mainnet" },
];

function shortAddr(addr: string) {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-8)}`;
}

/**
 * Fund a Polymarket wallet via Polymarket's own Bridge API instead of
 * requiring the user to already hold USDC.e on Polygon. Solves the "I have
 * native USDC / USDC on another chain, not USDC.e" problem this app hit
 * repeatedly -- same bridge Polymarket's own site uses, called directly
 * (public API, CORS open). See docs.polymarket.com/trading/bridge/deposit.
 *
 * This is a "send funds to this address" flow, not a signed transaction --
 * there is nothing for the connected wallet to sign here.
 */
export function PolymarketDepositModal({ open, onOpenChange, walletAddress }: PolymarketDepositModalProps) {
  const [activeTab, setActiveTab] = useState<BridgeAddressType>("evm");
  const [copied, setCopied] = useState<string | null>(null);

  const { data: addresses, isLoading: addressesLoading, error: addressesError } = useQuery({
    queryKey: ["polymarket", "bridge", "deposit-addresses", walletAddress],
    queryFn: () => polymarketBridgeApi.getDepositAddresses(walletAddress!),
    enabled: open && !!walletAddress,
    staleTime: Infinity, // same address every time for a given wallet
    retry: 1,
  });

  const { data: supportedAssets } = useQuery({
    queryKey: ["polymarket", "bridge", "supported-assets"],
    queryFn: () => polymarketBridgeApi.getSupportedAssets(),
    enabled: open,
    staleTime: 10 * 60_000,
    retry: 1,
  });

  /**
   * Minimum USDC deposit for the active tab, per-chain -- these genuinely
   * differ (Polygon USDC is $2, most Ethereum assets are $5). Prefers the
   * USDC-symbol entry for each chain since that's what most people will
   * actually send; falls back to the cheapest asset on that chain if no
   * USDC variant is listed there.
   */
  const minimumsForActiveTab = (supportedAssets ?? [])
    .filter((a) => addressTypeForChainId(a.chainId) === activeTab)
    .reduce<Map<string, { min: number; isUsdc: boolean }>>((byChain, asset) => {
      const isUsdc = asset.token.symbol.toUpperCase().includes("USDC");
      const current = byChain.get(asset.chainName);
      if (!current || (isUsdc && !current.isUsdc) || (isUsdc === current.isUsdc && asset.minCheckoutUsd < current.min)) {
        byChain.set(asset.chainName, { min: asset.minCheckoutUsd, isUsdc });
      }
      return byChain;
    }, new Map());

  const activeAddress: string | null = addresses
    ? activeTab === "tvm"
      ? addresses.tron
      : (addresses[activeTab as "evm" | "svm" | "btc"] ?? null)
    : null;

  const {
    data: status,
    refetch: refetchStatus,
    isFetching: statusFetching,
  } = useQuery({
    queryKey: ["polymarket", "bridge", "status", activeAddress],
    queryFn: () => polymarketBridgeApi.getStatus(activeAddress!),
    enabled: false, // manual "check status" only -- avoid hammering the bridge on a timer
  });

  useEffect(() => {
    if (!open) setCopied(null);
  }, [open]);

  async function copyAddress(addr: string) {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(addr);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable -- non-fatal, address is still shown on screen
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent size="lg" className="max-w-[640px]">
        <ArenaDialogHeader>
          <ArenaDialogTitle className="font-display text-left text-xl">Fund Your Polymarket Wallet</ArenaDialogTitle>
          <ArenaDialogDescription className="text-left text-xs sm:text-sm">
            Send{" "}
            <span className="font-semibold text-neon-cyan">USDC</span>{" "}
            (or another supported asset) from any chain below -- Polymarket auto-converts it to{" "}
            <span className="font-semibold text-neon-cyan">pUSD</span> in your wallet. Works even if you only hold
            native <span className="font-semibold text-neon-cyan">USDC</span>, not{" "}
            <span className="font-semibold text-amber-300">USDC.e</span>.
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        <ArenaDialogBody className="space-y-4">
          {!walletAddress ? (
            <p className="text-sm text-muted-foreground">Connect your wallet first.</p>
          ) : addressesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Getting your deposit addresses…
            </div>
          ) : addressesError ? (
            <p className="text-sm text-rose-400">Couldn't reach Polymarket's bridge right now -- try again shortly.</p>
          ) : addresses ? (
            <>
              <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-[#02070d]/90 p-1">
                {CHAIN_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                      activeTab === tab.key
                        ? "border border-neon-cyan/35 bg-neon-cyan/15 text-neon-cyan"
                        : "border border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeAddress ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {CHAIN_TABS.find((t) => t.key === activeTab)?.hint}
                  </p>

                  {minimumsForActiveTab.size > 0 ? (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-rose-300">
                        ⚠ Minimum deposit -- sending less will not be processed
                      </div>
                      <ul className="mt-1.5 space-y-0.5 text-xs text-rose-100/90">
                        {[...minimumsForActiveTab.entries()].map(([chainName, { min }]) => (
                          <li key={chainName}>
                            {chainName}: <span className="font-bold">${min.toLocaleString()}</span> minimum
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-white/10 bg-[#05070d]/95 p-3.5">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan">
                      Send To This Address
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">{activeAddress}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 rounded-lg border-white/10 bg-background/75 px-2 text-[10px]"
                        onClick={() => void copyAddress(activeAddress)}
                      >
                        <Copy className="h-3 w-3" />
                        {copied === activeAddress ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-100/90">
                    Only send supported assets to this address -- sending an unsupported token can result in
                    permanent loss. Deposits typically take a few minutes to arrive as pUSD in your wallet.
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#02070d]/90 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Deposit Status
                      </div>
                      <div className="mt-1 text-sm text-foreground">
                        {statusFetching ? "Checking…" : status?.status ? String(status.status) : "Not checked yet"}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 rounded-lg border-white/10 bg-background/75 px-3 text-[10px]"
                      disabled={statusFetching}
                      onClick={() => void refetchStatus()}
                    >
                      {statusFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Check status
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
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
