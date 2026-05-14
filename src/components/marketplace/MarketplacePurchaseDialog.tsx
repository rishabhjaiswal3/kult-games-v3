import { toast } from "sonner";
import { encodeFunctionData } from "viem";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogFooter,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
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
      <ArenaDialogContent size="sm">
        <ArenaDialogHeader>
          <ArenaDialogTitle className="font-display text-xl font-black tracking-wide">
            Confirm purchase
          </ArenaDialogTitle>
          <ArenaDialogDescription>
            {selectedItem ? `Secure on-chain checkout for ${selectedItem.name}` : ""}
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        {selectedItem ? (
          <>
            <ArenaDialogBody className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-background/40 p-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-background/60">
                  {selectedItem.assetUrl ? (
                    <img
                      src={selectedItem.assetUrl}
                      alt={selectedItem.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] font-display tracking-[0.08em] text-muted-foreground">
                      NO IMAGE
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold text-foreground">
                    {selectedItem.name}
                  </p>
                  <p className="mt-1 text-[10px] font-display tracking-[0.12em] text-muted-foreground">
                    {selectedItem.category.toUpperCase()}
                  </p>
                  <p className="mt-2 font-display text-xl font-black text-neon-cyan">
                    {selectedItem.price}{" "}
                    <span className="text-sm font-semibold text-muted-foreground">
                      {selectedItem.currency}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <p className="mb-3 font-display text-[10px] tracking-[0.16em] text-muted-foreground">
                  PAYMENT TOKEN
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MARKETPLACE_PAYMENT_TOKENS.map((token) => {
                    const hasAddress = Boolean(paymentConfig.tokenAddressBySymbol[token]);
                    return (
                      <button
                        key={token}
                        type="button"
                        onClick={() => onPaymentTokenChange(token)}
                        className={`rounded-xl border px-3 py-2.5 text-[11px] font-display font-semibold tracking-[0.08em] transition-all ${
                          selectedPaymentToken === token
                            ? "border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan"
                            : "border-white/10 bg-background/40 text-foreground/85 hover:border-neon-cyan/30"
                        }`}
                      >
                        {token}
                        {!hasAddress ? " (N/A)" : ""}
                      </button>
                    );
                  })}
                </div>
                {!paymentConfig.marketplaceContractAddress ? (
                  <p className="mt-3 text-[11px] text-amber-300">
                    Missing contract config: set `VITE_MARKETPLACE_CONTRACT_ADDRESS` in `.env`.
                  </p>
                ) : null}
                {!selectedTokenAddress ? (
                  <p className="mt-1 text-[11px] text-amber-300">
                    Missing token config for {selectedPaymentToken}.
                  </p>
                ) : null}
              </div>
            </ArenaDialogBody>

            <ArenaDialogFooter>
              <button
                type="button"
                className="btn-eye-outline rounded-xl px-4 py-3 text-xs font-display font-semibold tracking-[0.1em]"
                onClick={onClose}
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={!canConfirmPurchase || isPurchasing}
                className="btn-eye rounded-xl px-4 py-3 text-xs font-display font-semibold tracking-[0.1em] disabled:opacity-50"
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
                {isPurchasing ? "PROCESSING..." : "CONFIRM"}
              </button>
            </ArenaDialogFooter>
          </>
        ) : null}
      </ArenaDialogContent>
    </Dialog>
  );
}
