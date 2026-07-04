import { useState } from "react";
import { Side } from "@polymarket/clob-client";
import { encodeFunctionData, erc1155Abi, erc20Abi, maxUint256 } from "viem";
import { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import { POLYGON_CHAIN } from "@/lib/polygonChain";
import { polygonPublicClient } from "@/lib/polygonClient";
import { POLYGON_USDC_ADDRESS, POLYMARKET_CONTRACTS } from "@/lib/polygonUsdc";
import { getClobClient, hasCachedCreds } from "@/lib/polymarketClob";

/** ERC-1155 Conditional Tokens contract Polymarket positions are held as -- docs/polymarket §5 Phase 4. */
const CONDITIONAL_TOKENS_ADDRESS = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045" as const;

export type PolymarketTradingStatus =
  | "idle"
  | "switching-network"
  | "approving"
  | "deriving-key"
  | "placing-order"
  | "done";

/**
 * Real order execution against Polymarket's own CLOB (docs/polymarket §5
 * Phase 4). The backend is never in this path -- every step here is either
 * a read against Polygon, or a signature/transaction from the user's own
 * wallet. No custody, no server-side signing.
 *
 * "Enable trading" (one-time per wallet): approve USDC to both the standard
 * and neg-risk Exchange contracts, and set the Conditional Tokens contract's
 * operator approval for both -- covers ordinary binary markets and
 * multi-outcome (neg-risk) markets alike. Then derive/cache the wallet's own
 * CLOB API key. placeOrder() runs this automatically and idempotently (each
 * check is skipped if already satisfied), so there's one button, not a
 * separate "enable" step the user has to find first.
 */
export function usePolymarketTrading() {
  const { activeWallet, sendPrivyTransaction } = usePrivyWalletTools();
  const [status, setStatus] = useState<PolymarketTradingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const address = activeWallet?.address ?? null;
  const isReady = Boolean(address ? hasCachedCreds(address) : false);

  async function ensureUsdcAllowance(owner: `0x${string}`, spender: `0x${string}`) {
    const current = await polygonPublicClient.readContract({
      address: POLYGON_USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender],
    });
    if (current > 0n) return;

    const data = encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spender, maxUint256] });
    await sendPrivyTransaction(
      { to: POLYGON_USDC_ADDRESS, value: 0n, data, chainId: POLYGON_CHAIN.decimalChainId },
      { address: owner, uiOptions: { showWalletUIs: true } },
    );
  }

  async function ensureOperatorApproval(owner: `0x${string}`, operator: `0x${string}`) {
    const approved = await polygonPublicClient.readContract({
      address: CONDITIONAL_TOKENS_ADDRESS,
      abi: erc1155Abi,
      functionName: "isApprovedForAll",
      args: [owner, operator],
    });
    if (approved) return;

    const data = encodeFunctionData({ abi: erc1155Abi, functionName: "setApprovalForAll", args: [operator, true] });
    await sendPrivyTransaction(
      { to: CONDITIONAL_TOKENS_ADDRESS, value: 0n, data, chainId: POLYGON_CHAIN.decimalChainId },
      { address: owner, uiOptions: { showWalletUIs: true } },
    );
  }

  /** Idempotent: safe to call before every order, only prompts for whatever isn't already done. */
  async function ensureTradingEnabled(): Promise<void> {
    if (!activeWallet?.address || typeof activeWallet.getEthereumProvider !== "function") {
      throw new Error("Connect your wallet first");
    }
    const owner = activeWallet.address as `0x${string}`;

    setStatus("switching-network");
    const provider = await activeWallet.getEthereumProvider();
    await ensureWalletOnAllowedChain(provider, POLYGON_CHAIN);

    setStatus("approving");
    await ensureUsdcAllowance(owner, POLYMARKET_CONTRACTS.exchange);
    await ensureUsdcAllowance(owner, POLYMARKET_CONTRACTS.negRiskExchange);
    await ensureOperatorApproval(owner, POLYMARKET_CONTRACTS.exchange);
    await ensureOperatorApproval(owner, POLYMARKET_CONTRACTS.negRiskExchange);

    setStatus("deriving-key");
    await getClobClient(owner, provider);
  }

  /**
   * Buy `amountUsd` worth of the given outcome token at market. tokenId is
   * the CLOB token id for the specific outcome (YES or NO) -- not the
   * market's own id.
   */
  async function placeMarketBuy(tokenId: string, amountUsd: number): Promise<{ orderId?: string }> {
    if (!activeWallet?.address || typeof activeWallet.getEthereumProvider !== "function") {
      throw new Error("Connect your wallet first");
    }
    setError(null);
    try {
      await ensureTradingEnabled();

      setStatus("placing-order");
      const provider = await activeWallet.getEthereumProvider();
      const client = await getClobClient(activeWallet.address, provider);
      const result = await client.createAndPostMarketOrder({
        tokenID: tokenId,
        amount: amountUsd,
        side: Side.BUY,
      });

      setStatus("done");
      return result as { orderId?: string };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't place that order — try again.");
      setStatus("idle");
      throw err;
    }
  }

  return {
    status,
    error,
    isReady,
    placeMarketBuy,
  };
}
