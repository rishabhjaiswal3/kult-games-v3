import { useState } from "react";
import { encodeFunctionData, erc20Abi, maxUint256, parseUnits } from "viem";
import { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import { getAllowedChainFromEnv } from "@/lib/chain";
import { zerogPublicClient } from "@/lib/zerogClient";
import { arenaChainApi } from "@/api/arenaChainApi";

export type ArenaStakingStatus = "idle" | "switching-network" | "checking-allowance" | "approving" | "done";

/**
 * Staking into ArenaEscrow/ArenaTournament requires the player's own wallet
 * to approve() the ARENA token for that contract once -- the one operation
 * in the whole $ARENA economy that can't be sponsored by the backend
 * relayer, since only the token owner can approve their own allowance.
 * Everything else (create/join/start/settle) is submitted and gas-paid by
 * arena-chain-service. See docs/arena_token_migration_knowledge.md §3.
 */
export function useArenaStaking() {
  const { activeWallet, sendPrivyTransaction } = usePrivyWalletTools();
  const [status, setStatus] = useState<ArenaStakingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Idempotent: only prompts a wallet signature if the current allowance to
   * `spenderAddress` (ArenaEscrow or ArenaTournament) is below `amountArena`.
   * Safe to call before every stake.
   */
  async function ensureStakeApproved(spenderAddress: `0x${string}`, amountArena: number): Promise<void> {
    if (!activeWallet?.address || typeof activeWallet.getEthereumProvider !== "function") {
      throw new Error("Connect your wallet first");
    }
    setError(null);
    const owner = activeWallet.address as `0x${string}`;

    try {
      const config = await arenaChainApi.getConfig();
      if (!config) throw new Error("The $ARENA economy isn't configured yet -- try again shortly.");

      setStatus("switching-network");
      const provider = await activeWallet.getEthereumProvider();
      await ensureWalletOnAllowedChain(provider, getAllowedChainFromEnv());

      setStatus("checking-allowance");
      const required = parseUnits(amountArena.toFixed(18), 18);
      const current = await zerogPublicClient.readContract({
        address: config.arenaTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [owner, spenderAddress],
      });
      if (current >= required) {
        setStatus("done");
        return;
      }

      setStatus("approving");
      const data = encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spenderAddress, maxUint256] });
      await sendPrivyTransaction(
        { to: config.arenaTokenAddress as `0x${string}`, value: 0n, data, chainId: getAllowedChainFromEnv().decimalChainId },
        { address: owner, uiOptions: { showWalletUIs: true } },
      );

      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't approve $ARENA for staking -- try again.");
      setStatus("idle");
      throw err;
    }
  }

  /** Fetches the escrow contract address, for callers that need it before staking. */
  async function getEscrowAddress(): Promise<`0x${string}` | null> {
    const config = await arenaChainApi.getConfig();
    return (config?.escrowAddress as `0x${string}` | undefined) ?? null;
  }

  return { status, error, ensureStakeApproved, getEscrowAddress };
}
