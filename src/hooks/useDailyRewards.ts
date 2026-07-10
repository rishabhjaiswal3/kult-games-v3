import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildDailyRewardsState, type DailyRewardsState } from "@/api/dailyRewardsApi";
import { hasArenaAgent, MY_ARENA_AGENTS_QUERY_KEY, useMyArenaAgents } from "@/hooks/useMyArenaAgents";

/** Daily login rewards — day 1 status comes from the My Agents API, not localStorage. */
export function useDailyRewards() {
  const queryClient = useQueryClient();
  const myAgentsQ = useMyArenaAgents();
  const hasAgent = hasArenaAgent(myAgentsQ.data);

  const state = useMemo<DailyRewardsState>(() => buildDailyRewardsState(hasAgent), [hasAgent]);

  const claimMutation = useMutation({
    mutationFn: async (_day: number) => {
      await queryClient.invalidateQueries({ queryKey: MY_ARENA_AGENTS_QUERY_KEY });
      const result = await myAgentsQ.refetch();
      return buildDailyRewardsState(hasArenaAgent(result.data));
    },
  });

  return {
    state,
    isLoading: myAgentsQ.isLoading,
    claim: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
    refetchAgents: myAgentsQ.refetch,
  };
}
