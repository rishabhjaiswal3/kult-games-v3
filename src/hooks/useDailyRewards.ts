import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dailyRewardsApi,
  mergeLegacyGenesisAgentState,
  type DailyRewardsState,
} from "@/api/dailyRewardsApi";
import { hasArenaAgent, MY_ARENA_AGENTS_QUERY_KEY, useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { getStoredAiAgentInfo } from "@/lib/aiAgentStorage";
import { useAuth } from "@/contexts/AuthContext";

export const DAILY_REWARDS_QUERY_KEY = ["rewards", "daily"] as const;

function resolveHasGenesisAgent(agentsData: ReturnType<typeof useMyArenaAgents>["data"]): boolean {
  return hasArenaAgent(agentsData) || !!getStoredAiAgentInfo()?.id;
}

function needsLegacyDay1Claim(
  hasGenesisAgent: boolean,
  apiState: DailyRewardsState | undefined,
  mergedState: DailyRewardsState | undefined,
): boolean {
  if (!hasGenesisAgent || !apiState) return false;
  if (!apiState.hasRecord) return (mergedState?.currentDay ?? 1) === 2;
  return (
    apiState.claimedDays.includes(1) &&
    !apiState.claimedDays.includes(2) &&
    (mergedState?.currentDay ?? 1) === 2 &&
    mergedState?.claimableToday === true &&
    !apiState.claimableToday
  );
}

/** Daily login rewards — day 1 legacy status comes from the My Agents API when no DB record exists. */
export function useDailyRewards() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const myAgentsQ = useMyArenaAgents();
  const hasGenesisAgent = resolveHasGenesisAgent(myAgentsQ.data);

  const rewardsQ = useQuery({
    queryKey: DAILY_REWARDS_QUERY_KEY,
    queryFn: () => dailyRewardsApi.getState(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: 1,
  });

  const state = useMemo<DailyRewardsState | undefined>(() => {
    if (rewardsQ.data) {
      return mergeLegacyGenesisAgentState(rewardsQ.data, hasGenesisAgent);
    }

    // Rewards API still loading or failed — still show legacy day-2 state when agent exists.
    if (hasGenesisAgent && (rewardsQ.isLoading || rewardsQ.isError)) {
      return mergeLegacyGenesisAgentState(
        {
          currentDay: 1,
          claimedDays: [],
          claimableToday: true,
          nextUnlockAt: null,
          completed: false,
          hasRecord: false,
        },
        true,
      );
    }

    if (rewardsQ.isLoading) return undefined;
    return undefined;
  }, [rewardsQ.data, rewardsQ.isLoading, rewardsQ.isError, hasGenesisAgent]);

  const claimMutation = useMutation({
    mutationFn: async (options?: { legacyDay1?: boolean }) => dailyRewardsApi.claim(options),
    onSuccess: (nextState) => {
      queryClient.setQueryData(DAILY_REWARDS_QUERY_KEY, nextState);
    },
  });

  const claim = async (options?: { legacyDay1?: boolean }) => {
    const legacyDay1 =
      options?.legacyDay1 ??
      needsLegacyDay1Claim(hasGenesisAgent, rewardsQ.data, state);
    return claimMutation.mutateAsync({ legacyDay1 });
  };

  return {
    state,
    hasGenesisAgent,
    isLoading: rewardsQ.isLoading && !state,
    isAgentsLoading: myAgentsQ.isLoading,
    claim,
    isClaiming: claimMutation.isPending,
    refetch: rewardsQ.refetch,
    refetchAgents: myAgentsQ.refetch,
    rewardsError: rewardsQ.isError,
  };
}
