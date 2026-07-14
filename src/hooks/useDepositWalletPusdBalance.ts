import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { polygonPublicClient } from "@/lib/polygonClient";
import { PUSD_ADDRESS, PUSD_DECIMALS } from "@/lib/polygonUsdc";
import { deriveDepositWalletAddress } from "@/lib/polymarketDepositWallet";

/**
 * pUSD balance of the player's Polymarket deposit wallet -- since the
 * deposit-wallet migration (see polymarketDepositWallet.ts), this is the
 * REAL tradeable balance, not the owner EOA's own pUSD (which usePolymarketTrading
 * no longer wraps funds into at all -- see usePolymarketPusdBalance's older
 * EOA-balance version, still used for the plain-USDC.e display).
 */
export function useDepositWalletPusdBalance(ownerAddress: string | null) {
  return useQuery({
    queryKey: ["polygon", "deposit-wallet-pusd-balance", ownerAddress],
    queryFn: async () => {
      const depositWallet = await deriveDepositWalletAddress(polygonPublicClient, ownerAddress as `0x${string}`);
      const raw = await polygonPublicClient.readContract({
        address: PUSD_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [depositWallet],
      });
      return Number(formatUnits(raw, PUSD_DECIMALS));
    },
    enabled: !!ownerAddress,
    staleTime: 15_000,
    retry: 1,
  });
}
