import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dailyRewardsApi,
  mergeLegacyGenesisAgentState,
  type DailyRewardsState,
} from "@/api/dailyRewardsApi";
import { hasArenaAgent, MY_ARENA_AGENTS_QUERY_KEY, useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { useAuth } from "@/contexts/AuthContext";

export const DAILY_REWARDS_QUERY_KEY = ["rewards", "daily"] as const;

/** Daily login rewards — day 1 legacy status comes from the My Agents API when no DB record exists. */
export function useDailyRewards() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const myAgentsQ = useMyArenaAgents();
  const hasGenesisAgent = hasArenaAgent(myAgentsQ.data);

  const rewardsQ = useQuery({
    queryKey: DAILY_REWARDS_QUERY_KEY,
    queryFn: () => dailyRewardsApi.getState(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const state = useMemo<DailyRewardsState | undefined>(() => {
    if (!rewardsQ.data) return undefined;
    return mergeLegacyGenesisAgentState(rewardsQ.data, hasGenesisAgent);
  }, [rewardsQ.data, hasGenesisAgent]);

  const claimMutation = useMutation({
    mutationFn: async (options?: { legacyDay1?: boolean }) => dailyRewardsApi.claim(options),
    onSuccess: (nextState) => {
      queryClient.setQueryData(DAILY_REWARDS_QUERY_KEY, nextState);
    },
  });

  const claim = async (options?: { legacyDay1?: boolean }) => {
    const legacyDay1 =
      options?.legacyDay1 ??
      (hasGenesisAgent && !rewardsQ.data?.hasRecord && (state?.currentDay ?? 1) === 2);
    return claimMutation.mutateAsync({ legacyDay1 });
  };

  return {
    state,
    isLoading: rewardsQ.isLoading || myAgentsQ.isLoading,
    claim,
    isClaiming: claimMutation.isPending,
    refetch: rewardsQ.refetch,
    refetchAgents: myAgentsQ.refetch,
    hasGenesisAgent,
  };
}
