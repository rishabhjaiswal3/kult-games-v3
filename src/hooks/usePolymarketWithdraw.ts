import { useState } from "react";
import { createWalletClient, custom, encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { polygon } from "viem/chains";
import { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import { POLYGON_CHAIN } from "@/lib/polygonChain";
import { polygonPublicClient } from "@/lib/polygonClient";
import { PUSD_ADDRESS, PUSD_DECIMALS } from "@/lib/polygonUsdc";
import { deriveDepositWalletAddress, signAndSubmitDepositWalletBatch, type DepositWalletCall } from "@/lib/polymarketDepositWallet";

export type PolymarketWithdrawStatus = "idle" | "switching-network" | "withdrawing" | "done";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Withdraws tradeable pUSD from the deposit wallet to a destination address
 * of the caller's choosing -- matches real Polymarket's own withdrawal flow
 * (paste any address, funds go there), not just back to the connected
 * wallet. Unlike depositing (a plain "send to this address" flow, or a
 * plain user-signed wrap transaction), the deposit wallet is a
 * smart-contract wallet -- only IT can move its own pUSD, so this has to be
 * a signed EIP-712 batch authorizing the deposit wallet to transfer() its
 * own pUSD to `toAddress`, submitted through the same relayer proxy already
 * used for trading approvals (POST /v1/polymarket/relayer/submit --
 * payload-agnostic, fund safety comes from the payload's own signature, not
 * from anything checked there).
 */
export function usePolymarketWithdraw() {
  const { activeWallet } = usePrivyWalletTools();
  const [status, setStatus] = useState<PolymarketWithdrawStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function withdraw(amountUsd: number, toAddress: string): Promise<{ transactionID: string; state: string }> {
    if (!activeWallet?.address || typeof activeWallet.getEthereumProvider !== "function") {
      throw new Error("Connect your wallet first");
    }
    if (!ADDRESS_RE.test(toAddress)) {
      throw new Error("Enter a valid Polygon address (0x… , 42 characters).");
    }
    setError(null);
    try {
      const owner = activeWallet.address as `0x${string}`;
      const destination = toAddress as `0x${string}`;

      setStatus("switching-network");
      const provider = await activeWallet.getEthereumProvider();
      await ensureWalletOnAllowedChain(provider, POLYGON_CHAIN);

      const depositWallet = await deriveDepositWalletAddress(polygonPublicClient, owner);

      const amountRaw = parseUnits(amountUsd.toFixed(PUSD_DECIMALS), PUSD_DECIMALS);
      const currentPusd = await polygonPublicClient.readContract({
        address: PUSD_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [depositWallet],
      });
      if (currentPusd < amountRaw) {
        throw new Error(
          `Not enough tradeable pUSD to withdraw $${amountUsd} -- you have $${(Number(currentPusd) / 10 ** PUSD_DECIMALS).toFixed(2)}.`,
        );
      }

      setStatus("withdrawing");
      const calls: DepositWalletCall[] = [
        {
          target: PUSD_ADDRESS,
          value: "0",
          data: encodeFunctionData({ abi: erc20Abi, functionName: "transfer", args: [destination, amountRaw] }),
        },
      ];

      const walletClient = createWalletClient({ account: owner, chain: polygon, transport: custom(provider) });
      const result = await signAndSubmitDepositWalletBatch(walletClient, owner, depositWallet, calls);

      setStatus("done");
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't withdraw — try again.");
      setStatus("idle");
      throw err;
    }
  }

  return { status, error, withdraw };
}
