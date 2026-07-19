import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserPositions, type PolyPosition } from "@/api/polymarketApi";
import { useAuth } from "@/contexts/AuthContext";
import { useDepositWalletAddress } from "@/hooks/useDepositWalletAddress";

/**
 * Real Polymarket positions for the connected wallet. Queries the DEPOSIT
 * wallet (usePolymarketTrading.ts), not the raw connected EOA -- orders
 * settle there, so that's the only address real positions ever show up
 * under. Same query key everywhere it's used (OpenPositions, individual
 * market cards) so this is one shared network call per page, not one per
 * card.
 */
export function useMyPolymarketPositions() {
  const { isAuthenticated, walletAddress } = useAuth();
  const { data: depositWalletAddress } = useDepositWalletAddress(walletAddress);

  return useQuery({
    queryKey: ["polymarket", "positions", depositWalletAddress],
    queryFn: () => fetchUserPositions(depositWalletAddress!),
    enabled: isAuthenticated && !!depositWalletAddress,
    staleTime: 30_000,
  });
}

/** This wallet's existing position in one specific market, if any (matched by conditionId, not Gamma's own `id`). */
export function useMyPositionForMarket(conditionId: string | undefined): PolyPosition | null {
  const { data: positions } = useMyPolymarketPositions();
  if (!conditionId || !positions) return null;
  return positions.find((p) => p.marketId === conditionId) ?? null;
}

/** Call after a successful order so the position badge/list updates without a full page reload. */
export function useRefreshPolymarketPositions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["polymarket", "positions"] });
}
