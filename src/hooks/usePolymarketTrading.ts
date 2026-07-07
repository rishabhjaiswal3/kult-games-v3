import { useState } from "react";
import { Side } from "@polymarket/clob-client-v2";
import { encodeFunctionData, erc1155Abi, erc20Abi, maxUint256, parseUnits } from "viem";
import { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import { POLYGON_CHAIN } from "@/lib/polygonChain";
import { polygonPublicClient } from "@/lib/polygonClient";
import {
  COLLATERAL_ONRAMP_ADDRESS,
  POLYGON_USDC_ADDRESS,
  POLYGON_USDC_DECIMALS,
  POLYMARKET_CONTRACTS,
  PUSD_ADDRESS,
  PUSD_DECIMALS,
} from "@/lib/polygonUsdc";
import { getBuilderCode, getClobClient, hasCachedCreds } from "@/lib/polymarketClob";

/** ERC-1155 Conditional Tokens contract Polymarket positions are held as -- docs/polymarket §5 Phase 4. */
const CONDITIONAL_TOKENS_ADDRESS = POLYMARKET_CONTRACTS.conditionalTokens;

export type PolymarketTradingStatus =
  | "idle"
  | "switching-network"
  | "wrapping"
  | "approving"
  | "deriving-key"
  | "placing-order"
  | "done";

/**
 * Real order execution against Polymarket's own CLOB (docs/polymarket §5
 * Phase 4, later migrated to CTF Exchange V2 + pUSD). The backend is never
 * in this path -- every step here is either a read against Polygon, or a
 * signature/transaction from the user's own wallet. No custody, no
 * server-side signing.
 *
 * "Enable trading" (idempotent, runs before every order):
 *   1. Wrap enough USDC.e into pUSD to cover the trade (CTF Exchange V2
 *      settles in pUSD, not USDC.e directly -- docs.polymarket.com/concepts/pusd).
 *   2. Approve pUSD to the CTF Exchange V2 / Neg Risk CTF Exchange V2 contracts.
 *   3. Grant Conditional Tokens operator approval to both V2 exchanges.
 *   4. Derive/cache the wallet's own CLOB API key.
 * Each step is skipped if already satisfied, so there's one "Buy" button,
 * not a separate "enable" step the user has to find first.
 */
export function usePolymarketTrading() {
  const { activeWallet, sendPrivyTransaction } = usePrivyWalletTools();
  const [status, setStatus] = useState<PolymarketTradingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const address = activeWallet?.address ?? null;
  const isReady = Boolean(address ? hasCachedCreds(address) : false);

  /** Wraps just enough USDC.e -> pUSD to cover `amountUsd`, if the wallet's pUSD balance is short. */
  async function ensurePusdWrapped(owner: `0x${string}`, amountUsd: number) {
    const requiredRaw = parseUnits(amountUsd.toFixed(PUSD_DECIMALS), PUSD_DECIMALS);

    const currentPusd = await polygonPublicClient.readContract({
      address: PUSD_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
    });
    if (currentPusd >= requiredRaw) return;

    const shortfall = requiredRaw - currentPusd;

    const currentUsdc = await polygonPublicClient.readContract({
      address: POLYGON_USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
    });
    if (currentUsdc < shortfall) {
      throw new Error("Not enough USDC on Polygon to fund this trade.");
    }

    setStatus("wrapping");

    const onrampAllowance = await polygonPublicClient.readContract({
      address: POLYGON_USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, COLLATERAL_ONRAMP_ADDRESS],
    });
    if (onrampAllowance < shortfall) {
      const approveData = encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [COLLATERAL_ONRAMP_ADDRESS, maxUint256] });
      await sendPrivyTransaction(
        { to: POLYGON_USDC_ADDRESS, value: 0n, data: approveData, chainId: POLYGON_CHAIN.decimalChainId },
        { address: owner, uiOptions: { showWalletUIs: true } },
      );
    }

    const wrapData = encodeFunctionData({
      abi: [{ type: "function", name: "wrap", stateMutability: "nonpayable", inputs: [{ name: "_asset", type: "address" }, { name: "_to", type: "address" }, { name: "_amount", type: "uint256" }], outputs: [] }],
      functionName: "wrap",
      args: [POLYGON_USDC_ADDRESS, owner, shortfall],
    });
    await sendPrivyTransaction(
      { to: COLLATERAL_ONRAMP_ADDRESS, value: 0n, data: wrapData, chainId: POLYGON_CHAIN.decimalChainId },
      { address: owner, uiOptions: { showWalletUIs: true } },
    );
  }

  async function ensurePusdAllowance(owner: `0x${string}`, spender: `0x${string}`) {
    const current = await polygonPublicClient.readContract({
      address: PUSD_ADDRESS,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender],
    });
    if (current > 0n) return;

    const data = encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spender, maxUint256] });
    await sendPrivyTransaction(
      { to: PUSD_ADDRESS, value: 0n, data, chainId: POLYGON_CHAIN.decimalChainId },
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
  async function ensureTradingEnabled(amountUsd: number): Promise<void> {
    if (!activeWallet?.address || typeof activeWallet.getEthereumProvider !== "function") {
      throw new Error("Connect your wallet first");
    }
    const owner = activeWallet.address as `0x${string}`;

    setStatus("switching-network");
    const provider = await activeWallet.getEthereumProvider();
    await ensureWalletOnAllowedChain(provider, POLYGON_CHAIN);

    await ensurePusdWrapped(owner, amountUsd);

    setStatus("approving");
    await ensurePusdAllowance(owner, POLYMARKET_CONTRACTS.exchangeV2);
    await ensurePusdAllowance(owner, POLYMARKET_CONTRACTS.negRiskExchangeV2);
    await ensureOperatorApproval(owner, POLYMARKET_CONTRACTS.exchangeV2);
    await ensureOperatorApproval(owner, POLYMARKET_CONTRACTS.negRiskExchangeV2);

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
      await ensureTradingEnabled(amountUsd);

      setStatus("placing-order");
      const provider = await activeWallet.getEthereumProvider();
      const client = await getClobClient(activeWallet.address, provider);

      const builderCode = getBuilderCode();
      const result = await client.createAndPostMarketOrder({
        tokenID: tokenId,
        amount: amountUsd,
        side: Side.BUY,
        ...(builderCode ? { builderCode } : {}),
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
