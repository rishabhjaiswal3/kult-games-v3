import { toast } from "sonner";
import { encodeFunctionData } from "viem";
import { Hexagon, ShoppingCart, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { marketplaceApi } from "@/api/marketplaceApi";
import type { MarketplaceListing } from "@/types/api";
import {
  MARKETPLACE_PAYMENT_TOKENS,
  getMarketplacePaymentConfig,
  type MarketplacePaymentToken,
  unifiedMarketplaceAbi,
} from "@/lib/marketplacePayment";
import type { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";

type WalletTools = ReturnType<typeof usePrivyWalletTools>;

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
  const selectedTokenAddress = selectedItem
    ? paymentConfig.tokenAddressBySymbol[selectedPaymentToken]
    : "";
  const selectedItemCalldata = selectedItem?.purchaseCalldata ?? null;
  const canConfirmPurchase = Boolean(
    selectedItem &&
      paymentConfig.marketplaceContractAddress &&
      selectedTokenAddress &&
      canUsePrivy
  );

  return (
    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
      {selectedItem ? (
        <DialogContent className="max-w-md gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-lg [&>button]:hidden">
          <div className="arena-panel w-full overflow-hidden border-white/10 bg-[#04080f] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
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

            <div className="relative flex aspect-[16/10] items-center justify-center border-b border-white/6 bg-[#0a0f18]">
              {selectedItem.assetUrl ? (
                <img
                  src={selectedItem.assetUrl}
                  alt={selectedItem.name}
                  className="max-h-[80%] max-w-[80%] object-contain p-4"
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

            <div className="space-y-4 p-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white">{selectedItem.name}</p>
                  <Hexagon className="h-3.5 w-3.5 fill-[#9a35ff] text-[#9a35ff]" />
                </div>
                <p className="mt-2 font-tech text-2xl font-bold text-[#ffc000]">
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

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded border border-white/8 bg-[#0a0f1b]/60 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/55 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canConfirmPurchase || isPurchasing}
                  className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                  onClick={async () => {
                    if (!selectedItem || !activeWallet?.address) return;
                    if (!canConfirmPurchase) {
                      if (!privyReady) {
                        toast.error("Wallet system still loading");
                        return;
                      }
                      if (!privyAuthenticated) {
                        toast.error("Connect wallet first");
                        return;
                      }
                      toast.error("Missing contract/token configuration for selected payment token");
                      return;
                    }
                    try {
                      onPurchasingChange(true);
                      let txHash: string | undefined;

                      if (selectedItemCalldata || selectedTokenAddress) {
                        const txChainId =
                          selectedItem.purchaseChainId ?? paymentConfig.marketplaceChainId;
                        if (typeof activeWallet.switchChain === "function") {
                          await activeWallet.switchChain(txChainId);
                        }

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

                      toast.success(
                        txHash
                          ? `Purchase completed: ${txHash.slice(0, 10)}...`
                          : "Purchase completed (order created)"
                      );
                      onClose();
                    } catch (error) {
                      toast.error(getFriendlyPurchaseError(error));
                    } finally {
                      onPurchasingChange(false);
                    }
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isPurchasing ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
