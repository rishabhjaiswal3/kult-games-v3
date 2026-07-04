import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { polygonPublicClient } from "@/lib/polygonClient";
import { POLYGON_USDC_ADDRESS, POLYGON_USDC_DECIMALS } from "@/lib/polygonUsdc";

/**
 * Read-only USDC balance for a wallet address on Polygon (docs/polymarket
 * Phase 3) -- funding is entirely on the user, this only surfaces what's
 * already there. A plain public-RPC read, not a wallet action: no chain
 * switch, no signature, no popup needed regardless of the wallet's
 * currently-active chain.
 */
export function usePolygonUsdcBalance(address: string | null) {
  return useQuery({
    queryKey: ["polygon", "usdc-balance", address],
    queryFn: async () => {
      const raw = await polygonPublicClient.readContract({
        address: POLYGON_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      return Number(formatUnits(raw, POLYGON_USDC_DECIMALS));
    },
    enabled: !!address,
    staleTime: 30_000,
    retry: 1,
  });
}
