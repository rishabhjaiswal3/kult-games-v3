import { useState } from "react";
import { Side } from "@polymarket/clob-client-v2";
import { createWalletClient, custom, encodeFunctionData, erc1155Abi, erc20Abi, maxUint256, parseUnits } from "viem";
import { polygon } from "viem/chains";
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
import { clearCachedCreds, getBuilderCode, getClobClient, hasCachedCreds } from "@/lib/polymarketClob";
import {
  deriveDepositWalletAddress,
  ensureDepositWalletDeployed,
  signAndSubmitDepositWalletBatch,
  type DepositWalletCall,
} from "@/lib/polymarketDepositWallet";

/** ERC-1155 Conditional Tokens contract Polymarket positions are held as -- docs/polymarket §5 Phase 4. */
const CONDITIONAL_TOKENS_ADDRESS = POLYMARKET_CONTRACTS.conditionalTokens;

export type PolymarketTradingStatus =
  | "idle"
  | "switching-network"
  | "deploying-wallet"
  | "wrapping"
  | "approving"
  | "deriving-key"
  | "placing-order"
  | "done";

/**
 * Real order execution against Polymarket's own CLOB (docs/polymarket §5
 * Phase 4, later migrated to CTF Exchange V2 + pUSD, then to the deposit
 * wallet flow -- see polymarketDepositWallet.ts). The backend is never in
 * the fund-custody path here -- every step is either a read against Polygon,
 * or a signature/transaction from the user's own wallet. No custody, no
 * server-side signing of anything that moves money.
 *
 * "Enable trading" (idempotent, runs before every order):
 *   1. Derive + deploy (if needed) the player's Polymarket deposit wallet --
 *      Polymarket's CLOB rejects orders made directly by a plain EOA now.
 *   2. Wrap enough USDC.e into pUSD, straight into the deposit wallet (CTF
 *      Exchange V2 settles in pUSD, not USDC.e -- docs.polymarket.com/concepts/pusd).
 *   3. Have the deposit wallet approve the CTF Exchange V2 / Neg Risk CTF
 *      Exchange V2 contracts to spend its own pUSD, and grant them
 *      Conditional Tokens operator approval -- one signed batch, since only
 *      the deposit wallet itself can approve spending its own balance.
 *   4. Derive/cache the wallet's own CLOB API key (against the EOA, not the
 *      deposit wallet -- confirmed via docs.polymarket.com/trading/deposit-wallets).
 * Each step is skipped if already satisfied, so there's one "Buy" button,
 * not a separate "enable" step the user has to find first.
 */
export function usePolymarketTrading() {
  const { activeWallet, sendPrivyTransaction } = usePrivyWalletTools();
  const [status, setStatus] = useState<PolymarketTradingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const address = activeWallet?.address ?? null;
  const isReady = Boolean(address ? hasCachedCreds(address) : false);

  const WRAP_ABI = [{ type: "function", name: "wrap", stateMutability: "nonpayable", inputs: [{ name: "_asset", type: "address" }, { name: "_to", type: "address" }, { name: "_amount", type: "uint256" }], outputs: [] }] as const;

  /**
   * Wraps just enough USDC.e -> pUSD to cover `amountUsd`, straight into the
   * deposit wallet, if it's short. Two possible sources for the shortfall,
   * checked in order:
   *   1. The owner EOA's own USDC.e (original path -- owner signs a plain
   *      approve+wrap transaction).
   *   2. The deposit wallet's OWN unwrapped USDC.e balance. This covers a
   *      real failure mode: a user who sends USDC.e directly to their
   *      deposit-wallet address (a valid-looking Polygon address, easy to
   *      mistake for "the" deposit target) instead of going through the
   *      bridge modal -- that USDC.e sits there unwrapped forever, because
   *      nothing previously ever checked the deposit wallet's own USDC.e.
   *      Wrapping it requires the deposit wallet itself to call wrap() (it
   *      holds the USDC.e), so this is a signed relayer batch, same
   *      mechanism as ensureDepositWalletApprovals.
   */
  async function ensurePusdWrapped(owner: `0x${string}`, depositWallet: `0x${string}`, amountUsd: number, provider: Eip1193LikeProvider) {
    const requiredRaw = parseUnits(amountUsd.toFixed(PUSD_DECIMALS), PUSD_DECIMALS);

    const currentPusd = await polygonPublicClient.readContract({
      address: PUSD_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [depositWallet],
    });
    if (currentPusd >= requiredRaw) return;

    const shortfall = requiredRaw - currentPusd;

    const [ownerUsdc, depositWalletUsdc] = await Promise.all([
      polygonPublicClient.readContract({ address: POLYGON_USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [owner] }),
      polygonPublicClient.readContract({ address: POLYGON_USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [depositWallet] }),
    ]);

    if (ownerUsdc >= shortfall) {
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

      const wrapData = encodeFunctionData({ abi: WRAP_ABI, functionName: "wrap", args: [POLYGON_USDC_ADDRESS, depositWallet, shortfall] });
      await sendPrivyTransaction(
        { to: COLLATERAL_ONRAMP_ADDRESS, value: 0n, data: wrapData, chainId: POLYGON_CHAIN.decimalChainId },
        { address: owner, uiOptions: { showWalletUIs: true } },
      );
      return;
    }

    if (depositWalletUsdc >= shortfall) {
      setStatus("wrapping");

      const depositWalletAllowance = await polygonPublicClient.readContract({
        address: POLYGON_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [depositWallet, COLLATERAL_ONRAMP_ADDRESS],
      });

      const calls: DepositWalletCall[] = [];
      if (depositWalletAllowance < shortfall) {
        calls.push({ target: POLYGON_USDC_ADDRESS, value: "0", data: encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [COLLATERAL_ONRAMP_ADDRESS, maxUint256] }) });
      }
      calls.push({ target: COLLATERAL_ONRAMP_ADDRESS, value: "0", data: encodeFunctionData({ abi: WRAP_ABI, functionName: "wrap", args: [POLYGON_USDC_ADDRESS, depositWallet, shortfall] }) });

      const walletClient = createWalletClient({ account: owner, chain: polygon, transport: custom(provider) });
      await signAndSubmitDepositWalletBatch(walletClient, owner, depositWallet, calls);
      return;
    }

    throw new Error(
      `Not enough USDC to fund this trade. Your wallet (${owner}) has $${(Number(ownerUsdc) / 10 ** POLYGON_USDC_DECIMALS).toFixed(2)} ` +
        `and your deposit wallet (${depositWallet}) has $${(Number(depositWalletUsdc) / 10 ** POLYGON_USDC_DECIMALS).toFixed(2)} USDC.e -- ` +
        `need $${amountUsd} more. Fund via "Fund wallet" above so it arrives as pUSD automatically.`,
    );
  }

  /**
   * The deposit wallet holds the pUSD, so only it can approve the exchanges
   * to spend it -- that means these approvals can't be plain EOA
   * transactions anymore. Collects whichever of the 4 approvals aren't
   * already satisfied and submits them as ONE signed relayer batch (one
   * signature, gasless -- Polymarket sponsors the relayed call).
   */
  async function ensureDepositWalletApprovals(owner: `0x${string}`, depositWallet: `0x${string}`, provider: Eip1193LikeProvider) {
    const [pusdAllowanceExchange, pusdAllowanceNegRisk, ctApprovedExchange, ctApprovedNegRisk] = await Promise.all([
      polygonPublicClient.readContract({ address: PUSD_ADDRESS, abi: erc20Abi, functionName: "allowance", args: [depositWallet, POLYMARKET_CONTRACTS.exchangeV2] }),
      polygonPublicClient.readContract({ address: PUSD_ADDRESS, abi: erc20Abi, functionName: "allowance", args: [depositWallet, POLYMARKET_CONTRACTS.negRiskExchangeV2] }),
      polygonPublicClient.readContract({ address: CONDITIONAL_TOKENS_ADDRESS, abi: erc1155Abi, functionName: "isApprovedForAll", args: [depositWallet, POLYMARKET_CONTRACTS.exchangeV2] }),
      polygonPublicClient.readContract({ address: CONDITIONAL_TOKENS_ADDRESS, abi: erc1155Abi, functionName: "isApprovedForAll", args: [depositWallet, POLYMARKET_CONTRACTS.negRiskExchangeV2] }),
    ]);

    const calls: DepositWalletCall[] = [];
    if (pusdAllowanceExchange === 0n) {
      calls.push({ target: PUSD_ADDRESS, value: "0", data: encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [POLYMARKET_CONTRACTS.exchangeV2, maxUint256] }) });
    }
    if (pusdAllowanceNegRisk === 0n) {
      calls.push({ target: PUSD_ADDRESS, value: "0", data: encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [POLYMARKET_CONTRACTS.negRiskExchangeV2, maxUint256] }) });
    }
    if (!ctApprovedExchange) {
      calls.push({ target: CONDITIONAL_TOKENS_ADDRESS, value: "0", data: encodeFunctionData({ abi: erc1155Abi, functionName: "setApprovalForAll", args: [POLYMARKET_CONTRACTS.exchangeV2, true] }) });
    }
    if (!ctApprovedNegRisk) {
      calls.push({ target: CONDITIONAL_TOKENS_ADDRESS, value: "0", data: encodeFunctionData({ abi: erc1155Abi, functionName: "setApprovalForAll", args: [POLYMARKET_CONTRACTS.negRiskExchangeV2, true] }) });
    }
    if (calls.length === 0) return;

    setStatus("approving");
    const walletClient = createWalletClient({ account: owner, chain: polygon, transport: custom(provider) });
    await signAndSubmitDepositWalletBatch(walletClient, owner, depositWallet, calls);
  }

  /** Idempotent: safe to call before every order, only prompts for whatever isn't already done. Returns the deposit wallet address to trade through. */
  async function ensureTradingEnabled(amountUsd: number): Promise<`0x${string}`> {
    if (!activeWallet?.address || typeof activeWallet.getEthereumProvider !== "function") {
      throw new Error("Connect your wallet first");
    }
    const owner = activeWallet.address as `0x${string}`;

    setStatus("switching-network");
    const provider = await activeWallet.getEthereumProvider();
    await ensureWalletOnAllowedChain(provider, POLYGON_CHAIN);

    setStatus("deploying-wallet");
    const depositWallet = await deriveDepositWalletAddress(polygonPublicClient, owner);
    await ensureDepositWalletDeployed(owner, depositWallet);

    await ensurePusdWrapped(owner, depositWallet, amountUsd, provider);
    await ensureDepositWalletApprovals(owner, depositWallet, provider);

    setStatus("deriving-key");
    await getClobClient(owner, provider, depositWallet);

    return depositWallet;
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
      const depositWallet = await ensureTradingEnabled(amountUsd);

      setStatus("placing-order");
      const provider = await activeWallet.getEthereumProvider();
      const builderCode = getBuilderCode();
      const owner = activeWallet.address;

      async function submitOrder() {
        const client = await getClobClient(owner, provider, depositWallet);
        return client.createAndPostMarketOrder({
          tokenID: tokenId,
          amount: amountUsd,
          side: Side.BUY,
          ...(builderCode ? { builderCode } : {}),
        });
      }

      let result;
      try {
        result = await submitOrder();
      } catch (orderErr) {
        // A cached CLOB API key can go stale (derived before a deposit-wallet
        // re-derivation, or invalidated server-side) and gets rejected on
        // /order even though wrapping/approvals upstream all succeeded --
        // that shows up here as a cross-origin "Network Error" (the browser
        // can't read a 403 response's body from a different origin), not a
        // clear auth error. Drop the cached key and retry once with a
        // freshly derived one before giving up.
        clearCachedCreds(owner);
        try {
          result = await submitOrder();
        } catch {
          throw orderErr; // surface the original failure, not the retry's
        }
      }

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

type Eip1193LikeProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
