import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leagueApi } from "@/api/leagueApi";
import { polymarketSignalApi, type PolymarketSignal } from "@/api/polymarketSignalApi";
import { useAuth } from "@/contexts/AuthContext";

/**
 * "Get my agent's read" for a Polymarket market, has your first enrolled
 * agent generate its own AI signal (POST .../generate), same product
 * decision as League's "Make Pick": agents make the call, not a manual form.
 * No agent picker, same reasoning as useMakeLeaguePick.ts.
 *
 * Results are kept per-marketId so reading one market and then another keeps
 * showing both.
 */
export function usePolymarketSignal() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [loadingMarketId, setLoadingMarketId] = useState<string | null>(null);
  const [errorsByMarket, setErrorsByMarket] = useState<Record<string, string>>({});
  const [resultsByMarket, setResultsByMarket] = useState<Record<string, PolymarketSignal>>({});

  const { data: lineup } = useQuery({
    queryKey: ["league", "me", "agents"],
    queryFn: () => leagueApi.getMyLineup(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const hasAgent = (lineup?.length ?? 0) > 0;

  async function getSignal(marketId: string, question: string, category?: string) {
    if (!isAuthenticated || !lineup || lineup.length === 0) return;

    const agent = lineup[0];
    setLoadingMarketId(marketId);
    setErrorsByMarket((prev) => ({ ...prev, [marketId]: "" }));
    try {
      const signal = await polymarketSignalApi.generateSignal(marketId, agent.agentId, question, category);
      setResultsByMarket((prev) => ({ ...prev, [marketId]: signal }));
      queryClient.invalidateQueries({ queryKey: ["polymarket", "signals", marketId] });
    } catch (err) {
      setErrorsByMarket((prev) => ({
        ...prev,
        [marketId]: err instanceof Error ? err.message : "Couldn't get a read, try again.",
      }));
    } finally {
      setLoadingMarketId((current) => (current === marketId ? null : current));
    }
  }

  return {
    getSignal,
    isLoading: (marketId: string) => loadingMarketId === marketId,
    result: (marketId: string) => resultsByMarket[marketId] ?? null,
    error: (marketId: string) => errorsByMarket[marketId] || null,
    isAuthenticated,
    hasAgent,
    myAgentId: lineup?.[0]?.agentId ?? null,
  };
}
