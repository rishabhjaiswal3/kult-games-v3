import { useState } from "react";
import { createWalletClient, custom, erc20Abi, maxUint256, parseUnits } from "viem";
import { usePrivyWalletTools } from "@/hooks/usePrivyWalletTools";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import { getAllowedChainFromEnv } from "@/lib/chain";
import { zerogPublicClient } from "@/lib/zerogClient";
import { arenaChainApi } from "@/api/arenaChainApi";

export type ArenaStakingStatus = "idle" | "switching-network" | "checking-allowance" | "approving" | "done";

/** Deadline generous enough that the relayer never races a slow signature/network hop, but short enough a stale signature can't be replayed much later. */
const PERMIT_DEADLINE_SECONDS = 15 * 60;

/**
 * Staking into ArenaEscrow/ArenaTournament requires the player to authorize
 * that contract to spend their ARENA once. Players never hold native 0G, so
 * this can't be a normal on-chain approve() tx -- instead the player signs a
 * free off-chain EIP-2612 permit message, and the backend relayer submits
 * `token.permit()` on their behalf, paying the gas itself. Every other
 * on-chain action (create/join/start/settle) was already relayer-submitted.
 * See docs/arena_token_migration_knowledge.md §3.
 */
export function useArenaStaking() {
  const { activeWallet } = usePrivyWalletTools();
  const [status, setStatus] = useState<ArenaStakingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Idempotent: only prompts a wallet signature if the current allowance to
   * `spenderAddress` (ArenaEscrow or ArenaTournament) is below `amountArena`.
   * Safe to call before every stake. Costs the player zero gas.
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
      const tokenAddress = config.arenaTokenAddress as `0x${string}`;

      setStatus("switching-network");
      const chain = getAllowedChainFromEnv();
      const provider = await activeWallet.getEthereumProvider();
      await ensureWalletOnAllowedChain(provider, chain);

      setStatus("checking-allowance");
      const required = parseUnits(amountArena.toFixed(18), 18);
      const current = await zerogPublicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [owner, spenderAddress],
      });
      if (current >= required) {
        setStatus("done");
        return;
      }

      setStatus("approving");
      const [domain, nonce] = await Promise.all([
        arenaChainApi.getPermitDomain(),
        arenaChainApi.getPermitNonce(owner),
      ]);
      const deadline = Math.floor(Date.now() / 1000) + PERMIT_DEADLINE_SECONDS;

      const walletClient = createWalletClient({ account: owner, chain, transport: custom(provider) });
      const signature = await walletClient.signTypedData({
        account: owner,
        domain: {
          name: domain.name,
          version: domain.version,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract as `0x${string}`,
        },
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        message: { owner, spender: spenderAddress, value: maxUint256, nonce: BigInt(nonce), deadline: BigInt(deadline) },
      });

      const r = `0x${signature.slice(2, 66)}`;
      const s = `0x${signature.slice(66, 130)}`;
      const v = parseInt(signature.slice(130, 132), 16);

      await arenaChainApi.submitPermit({
        owner,
        spender: spenderAddress,
        value: maxUint256.toString(),
        deadline,
        v,
        r,
        s,
      });

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
