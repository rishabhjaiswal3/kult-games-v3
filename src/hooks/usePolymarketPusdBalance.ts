import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { polygonPublicClient } from "@/lib/polygonClient";
import { PUSD_ADDRESS, PUSD_DECIMALS } from "@/lib/polygonUsdc";

/**
 * Read-only pUSD balance for a wallet address on Polygon -- this is the
 * actual tradeable balance on Polymarket's CTF Exchange V2 (see
 * docs.polymarket.com/concepts/pusd), distinct from the wallet's plain
 * USDC.e balance (usePolygonUsdcBalance), which must be wrapped into pUSD
 * before it can be used to place an order.
 */
export function usePolymarketPusdBalance(address: string | null) {
  return useQuery({
    queryKey: ["polygon", "pusd-balance", address],
    queryFn: async () => {
      const raw = await polygonPublicClient.readContract({
        address: PUSD_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      return Number(formatUnits(raw, PUSD_DECIMALS));
    },
    enabled: !!address,
    staleTime: 15_000,
    retry: 1,
  });
}
