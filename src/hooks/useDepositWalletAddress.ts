import { useQuery } from "@tanstack/react-query";
import { polygonPublicClient } from "@/lib/polygonClient";
import { deriveDepositWalletAddress } from "@/lib/polymarketDepositWallet";

/**
 * Derives the player's Polymarket deposit wallet address from their EOA.
 * Used to point bridge deposits (PolymarketDepositModal) and balance
 * readouts at the wallet that actually trades now, instead of the EOA --
 * a bridge deposit registered against the EOA lands as pUSD in the EOA
 * itself, not the deposit wallet, which is useless for trading (see
 * usePolymarketTrading.ts).
 */
export function useDepositWalletAddress(ownerAddress: string | null) {
  return useQuery({
    queryKey: ["polymarket", "deposit-wallet-address", ownerAddress],
    queryFn: () => deriveDepositWalletAddress(polygonPublicClient, ownerAddress as `0x${string}`),
    enabled: !!ownerAddress,
    staleTime: Infinity, // deterministic per owner, never changes
    retry: 1,
  });
}
