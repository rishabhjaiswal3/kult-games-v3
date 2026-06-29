import { useEffect, useMemo, useState } from "react";
import { encodeFunctionData } from "viem";
import { Hexagon, Loader2, RefreshCcw, ShoppingCart, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { marketplaceApi } from "@/api/marketplaceApi";
import type { MarketplaceListing } from "@/types/api";
import {
  MARKETPLACE_PAYMENT_TOKENS,
  getMarketplaceChainConfig,
  getMarketplaceChainLabel,
  getMarketplacePaymentConfig,
  type MarketplacePaymentToken,
  unifiedMarketplaceAbi,
} from "@/lib/marketplacePayment";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import type { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";

type WalletTools = ReturnType<typeof usePrivyWalletTools>;
type WalletProvider = Awaited<
  ReturnType<NonNullable<NonNullable<WalletTools["activeWallet"]>["getEthereumProvider"]>>
>;

type MarketplacePurchaseDialogProps = {
  selectedItem: MarketplaceListing | null;
  onClose: () => void;
  selectedPaymentToken: MarketplacePaymentToken;
  onPaymentTokenChange: (token: MarketplacePaymentToken) => void;
  paymentConfig: ReturnType<typeof getMarketplacePaymentConfig>;
  canUsePrivy: boolean;
  privyReady: boolean;
  privyAuthenticated: boolean;
  activeWallet: WalletTools["activeWallet"];
  sendPrivyTransaction: WalletTools["sendPrivyTransaction"];
  isPurchasing: boolean;
  onPurchasingChange: (value: boolean) => void;
  buildClientOrderId: (input: string) => `0x${string}`;
  parseWei: (value: string | null | undefined) => bigint;
  getFriendlyPurchaseError: (error: unknown) => string;
};

function categoryBadgeClass(category: string) {
  const key = category.toLowerCase();
  if (key.includes("legendary") || key.includes("bundle"))
    return "bg-amber-950/80 border-amber-500/35 text-amber-400";
  return "bg-purple-950/80 border-purple-500/35 text-[#d6acff]";
}

function parseChainId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  const parsed = normalized.startsWith("0x") ? Number.parseInt(normalized, 16) : Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function readProviderChainId(provider: WalletProvider): Promise<number | null> {
  const chainId = await provider.request({ method: "eth_chainId" });
  return parseChainId(chainId);
}

export function MarketplacePurchaseDialog({
  selectedItem,
  onClose,
  selectedPaymentToken,
  onPaymentTokenChange,
  paymentConfig,
  canUsePrivy,
  privyReady,
  privyAuthenticated,
  activeWallet,
  sendPrivyTransaction,
  isPurchasing,
  onPurchasingChange,
  buildClientOrderId,
  parseWei,
  getFriendlyPurchaseError,
}: MarketplacePurchaseDialogProps) {
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [isCheckingChain, setIsCheckingChain] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const selectedTokenAddress = selectedItem
    ? paymentConfig.tokenAddressBySymbol[selectedPaymentToken]
    : "";
  const selectedItemCalldata = selectedItem?.purchaseCalldata ?? null;
  const purchaseChainId = selectedItem?.purchaseChainId ?? paymentConfig.marketplaceChainId;
  const purchaseChainConfig = useMemo(
    () => getMarketplaceChainConfig(purchaseChainId),
    [purchaseChainId]
  );
  const purchaseChainLabel = useMemo(
    () => getMarketplaceChainLabel(purchaseChainId),
    [purchaseChainId]
  );
  const isWalletConnected = Boolean(activeWallet?.address);
  const needsNetworkPreparation = Boolean(
    selectedItem && isWalletConnected && walletChainId !== purchaseChainId
  );
  const isWalletReadyForPurchase = isWalletConnected && walletChainId === purchaseChainId;
  const canConfirmPurchase = Boolean(
    selectedItem &&
      paymentConfig.marketplaceContractAddress &&
      selectedTokenAddress &&
      canUsePrivy
  );

  useEffect(() => {
    let cancelled = false;

    if (!selectedItem || !activeWallet?.address || typeof activeWallet.getEthereumProvider !== "function") {
      setWalletChainId(null);
      setIsCheckingChain(false);
      return () => {
        cancelled = true;
      };
    }

    setIsCheckingChain(true);
    void (async () => {
      try {
        const provider = await activeWallet.getEthereumProvider();
        const currentChainId = await readProviderChainId(provider);
        if (!cancelled) {
          setWalletChainId(currentChainId);
        }
      } catch {
        if (!cancelled) {
          setWalletChainId(null);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingChain(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedItem?.id, selectedPaymentToken, activeWallet?.address, activeWallet?.getEthereumProvider]);

  const ensurePurchaseNetwork = async () => {
    if (!activeWallet?.address) {
      throw new Error("Connect wallet first");
    }
    if (typeof activeWallet.getEthereumProvider !== "function") {
      throw new Error(`Wallet provider unavailable. Reconnect and switch to ${purchaseChainLabel}.`);
    }

    setIsSwitchingNetwork(true);
    try {
      if (typeof activeWallet.switchChain === "function") {
        try {
          await activeWallet.switchChain(purchaseChainId);
        } catch {
          /* fall through to provider-based switch */
        }
      }

      const provider = await activeWallet.getEthereumProvider();
      await ensureWalletOnAllowedChain(provider, purchaseChainConfig);

      const currentChainId = await readProviderChainId(provider);
      setWalletChainId(currentChainId);

      if (currentChainId !== purchaseChainId) {
        throw new Error(`Wallet is still on the wrong network. Please switch to ${purchaseChainLabel}.`);
      }
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const handleSwitchNetwork = async () => {
    if (!privyReady) {
      return;
    }
    if (!privyAuthenticated || !activeWallet?.address) {
      return;
    }

    try {
      await ensurePurchaseNetwork();
    } catch (error) {
    }
  };

  return (
    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
      {selectedItem ? (
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] max-w-sm gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-md sm:rounded-lg [&>button]:hidden">
          <div className="arena-panel flex max-h-[92dvh] w-full flex-col overflow-hidden border-white/10 bg-[#04080f] shadow-2xl">
            <div className="shrink-0 flex items-center justify-between border-b border-white/8 px-4 py-3">
              <h2 className="font-tech text-sm font-bold uppercase tracking-wider text-white">
                Confirm purchase
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-white/8 p-1.5 text-white/45 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex h-36 shrink-0 items-center justify-center border-b border-white/6 bg-[#0a0f18] sm:h-40">
              {selectedItem.assetUrl ? (
                <img
                  src={selectedItem.assetUrl}
                  alt={selectedItem.name}
                  className="max-h-full max-w-full object-contain p-3"
                />
              ) : (
                <span className="font-tech text-[9px] uppercase text-white/35">No preview</span>
              )}
              <span
                className={`absolute left-3 top-3 rounded border px-2 py-0.5 font-tech text-[9px] font-black uppercase ${categoryBadgeClass(selectedItem.category)}`}
              >
                {selectedItem.category}
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 pr-2 [scrollbar-color:rgba(154,53,255,0.45)_transparent] [scrollbar-width:thin] sm:space-y-4 sm:p-4 sm:pr-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white">{selectedItem.name}</p>
                  <Hexagon className="h-3.5 w-3.5 fill-[#9a35ff] text-[#9a35ff]" />
                </div>
                <p className="mt-1.5 font-tech text-xl font-bold text-[#ffc000] sm:text-2xl">
                  {selectedItem.price}
                  <span className="ml-1 text-sm text-white/45">{selectedItem.currency}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/45">
                  Payment token
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MARKETPLACE_PAYMENT_TOKENS.map((token) => {
                    const hasAddress = Boolean(paymentConfig.tokenAddressBySymbol[token]);
                    return (
                      <button
                        key={token}
                        type="button"
                        onClick={() => onPaymentTokenChange(token)}
                        className={`rounded border px-2.5 py-2 font-tech text-[9px] font-bold uppercase tracking-wider transition ${
                          selectedPaymentToken === token
                            ? "border-[#9a35ff]/60 bg-[#9a35ff]/20 text-[#d6acff]"
                            : "border-white/8 bg-[#0a0f1b]/60 text-white/45 hover:text-white"
                        }`}
                      >
                        {token}
                        {!hasAddress ? " (N/A)" : ""}
                      </button>
                    );
                  })}
                </div>
                {!paymentConfig.marketplaceContractAddress ? (
                  <p className="text-[10px] text-amber-400">Missing marketplace contract in .env</p>
                ) : null}
              </div>

              <div className="rounded-lg border border-white/8 bg-[#0a0f1b]/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/45">
                      Purchase network
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{purchaseChainLabel}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-white/55">
                      {!isWalletConnected
                        ? `Connect your wallet to pay with ${selectedPaymentToken}.`
                        : isCheckingChain
                          ? "Checking your current wallet network..."
                          : isWalletReadyForPurchase
                            ? `Wallet ready on ${purchaseChainLabel}. You can confirm the purchase now.`
                            : `Switch your wallet to ${purchaseChainLabel} before paying with ${selectedPaymentToken}.`}
                    </p>
                    {walletChainId && walletChainId !== purchaseChainId ? (
                      <p className="mt-1 text-[10px] text-amber-300">
                        Current wallet network: {getMarketplaceChainLabel(walletChainId)}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded border px-2 py-1 font-tech text-[9px] font-bold uppercase tracking-wider ${
                      isWalletReadyForPurchase
                        ? "border-emerald-500/35 bg-emerald-950/60 text-emerald-300"
                        : "border-amber-500/35 bg-amber-950/50 text-amber-300"
                    }`}
                  >
                    {isWalletReadyForPurchase ? "Ready" : "Switch needed"}
                  </span>
                </div>

                {isWalletConnected && !isWalletReadyForPurchase ? (
                  <button
                    type="button"
                    onClick={handleSwitchNetwork}
                    disabled={isSwitchingNetwork || isPurchasing}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-[#9a35ff]/35 bg-[#9a35ff]/12 px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-[#e3c7ff] transition hover:bg-[#9a35ff]/18 disabled:opacity-60"
                  >
                    {isSwitchingNetwork ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                    {isSwitchingNetwork ? "Switching network..." : `Switch to ${purchaseChainLabel}`}
                  </button>
                ) : null}
              </div>

              <div className="sticky bottom-0 -mx-3 flex gap-2 border-t border-white/8 bg-[#04080f]/95 px-3 pt-3 backdrop-blur sm:-mx-4 sm:px-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded border border-white/8 bg-[#0a0f1b]/60 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/55 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canConfirmPurchase || isPurchasing || isSwitchingNetwork}
                  className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                  onClick={async () => {
                    if (!selectedItem || !activeWallet?.address) return;
                    if (!canConfirmPurchase) {
                      if (!privyReady) {
                        return;
                      }
                      if (!privyAuthenticated) {
                        return;
                      }
                      return;
                    }
                    try {
                      if (needsNetworkPreparation) {
                        await ensurePurchaseNetwork();
                        return;
                      }

                      onPurchasingChange(true);
                      let txHash: string | undefined;

                      if (selectedItemCalldata || selectedTokenAddress) {
                        await ensurePurchaseNetwork();
                        const txChainId = purchaseChainId;

                        const txTarget =
                          selectedItem.purchaseContractAddress ??
                          (paymentConfig.marketplaceContractAddress as `0x${string}`);
                        const txValue = parseWei(selectedItem.purchaseValueWei);
                        const clientOrderId = buildClientOrderId(
                          `${activeWallet.address.toLowerCase()}:${selectedItem.id}:${Date.now()}`
                        );
                        const purchaseCalldata =
                          selectedItemCalldata ??
                          encodeFunctionData({
                            abi: unifiedMarketplaceAbi,
                            functionName: "purchase",
                            args: [
                              selectedItem.gameIdentification,
                              selectedItem.category,
                              selectedItem.id,
                              selectedTokenAddress as `0x${string}`,
                              clientOrderId,
                            ],
                          });

                        const receipt = await sendPrivyTransaction(
                          {
                            to: txTarget,
                            value: txValue,
                            data: purchaseCalldata,
                            chainId: txChainId,
                          },
                          {
                            address: activeWallet.address,
                            uiOptions: { showWalletUIs: true },
                          }
                        );
                        txHash =
                          typeof receipt === "string"
                            ? receipt
                            : (receipt.transactionHash ?? receipt.hash ?? "");
                        if (!txHash) {
                          throw new Error("No transaction hash returned");
                        }
                      }

                      await marketplaceApi.createOrder({
                        listingId: selectedItem.id,
                        paymentToken: selectedPaymentToken,
                        quantity: 1,
                        txHash,
                      });

                        txHash
                          ? `Purchase completed: ${txHash.slice(0, 10)}...`
                          : "Purchase completed (order created)"
                      );
                      onClose();
                    } catch (error) {
                    } finally {
                      onPurchasingChange(false);
                    }
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isPurchasing
                    ? "Processing..."
                    : isSwitchingNetwork
                      ? "Switching..."
                      : needsNetworkPreparation
                        ? `Switch to ${purchaseChainLabel}`
                        : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
