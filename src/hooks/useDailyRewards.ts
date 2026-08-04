import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dailyRewardsApi,
  mergeLegacyGenesisAgentState,
  type ClaimDailyRewardResponse,
  type DailyRewardsState,
} from "@/api/dailyRewardsApi";
import {
  MS_PER_REWARD_DAY,
  OPTIMISTIC_DAILY_REWARD_DAY,
  TOTAL_REWARD_DAYS,
} from "@/constants/dailyRewards";
import { StorageKeys } from "@/constants/storageKeys";
import { hasArenaAgent, useMyArenaAgents } from "@/hooks/useMyArenaAgents";
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

function readOptimisticClaimDays(): number[] {
  try {
    const raw = localStorage.getItem(StorageKeys.local.dailyRewardOptimisticClaims);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((day) => Number(day))
      .filter((day) => Number.isFinite(day) && day >= 1 && day <= TOTAL_REWARD_DAYS);
  } catch {
    return [];
  }
}

function persistOptimisticClaimDay(day: number): void {
  const claimed = new Set(readOptimisticClaimDays());
  claimed.add(day);
  localStorage.setItem(
    StorageKeys.local.dailyRewardOptimisticClaims,
    JSON.stringify([...claimed].sort((a, b) => a - b)),
  );
}

function applyOptimisticClaims(state: DailyRewardsState): DailyRewardsState {
  const optimistic = readOptimisticClaimDays();
  if (!optimistic.length) return state;

  const claimedDays = [...new Set([...state.claimedDays, ...optimistic])].sort((a, b) => a - b);
  const highestClaimed = claimedDays.length ? Math.max(...claimedDays) : 0;
  const completed = highestClaimed >= TOTAL_REWARD_DAYS;

  if (completed) {
    return {
      ...state,
      claimedDays,
      currentDay: TOTAL_REWARD_DAYS,
      claimableToday: false,
      nextUnlockAt: null,
      completed: true,
      hasRecord: true,
    };
  }

  const currentDay = highestClaimed + 1;
  const newlyOptimistic = optimistic.some((day) => !state.claimedDays.includes(day));
  const claimableToday = newlyOptimistic ? false : state.claimableToday;

  return {
    ...state,
    claimedDays,
    currentDay,
    claimableToday,
    nextUnlockAt:
      newlyOptimistic && !state.nextUnlockAt
        ? new Date(Date.now() + MS_PER_REWARD_DAY).toISOString()
        : state.nextUnlockAt,
    completed: false,
    hasRecord: state.hasRecord || newlyOptimistic,
  };
}

function buildOptimisticClaimResponse(
  state: DailyRewardsState,
  day: number,
): ClaimDailyRewardResponse {
  persistOptimisticClaimDay(day);
  const nextState = applyOptimisticClaims(state);
  return { ...nextState, claimedDay: day };
}

/** Daily login rewards, day 1 legacy status comes from the My Agents API when no DB record exists. */
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
    let base: DailyRewardsState | undefined;

    if (rewardsQ.data) {
      base = mergeLegacyGenesisAgentState(rewardsQ.data, hasGenesisAgent);
    } else if (hasGenesisAgent && (rewardsQ.isLoading || rewardsQ.isError)) {
      base = mergeLegacyGenesisAgentState(
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
    } else if (rewardsQ.isLoading) {
      return undefined;
    }

    if (!base) return undefined;
    return applyOptimisticClaims(base);
  }, [rewardsQ.data, rewardsQ.isLoading, rewardsQ.isError, hasGenesisAgent]);

  const claimMutation = useMutation({
    mutationFn: async (options?: { legacyDay1?: boolean }) => dailyRewardsApi.claim(options),
    onSuccess: (nextState) => {
      queryClient.setQueryData(DAILY_REWARDS_QUERY_KEY, nextState);
    },
  });

  const claim = (options?: { legacyDay1?: boolean }): Promise<ClaimDailyRewardResponse> => {
    const legacyDay1 =
      options?.legacyDay1 ??
      needsLegacyDay1Claim(hasGenesisAgent, rewardsQ.data, state);
    const dayToClaim = state?.currentDay ?? 1;

    // Temporary: Day 6 Highway Hustle, show claimed immediately; skip backend grant call.
    if (!legacyDay1 && dayToClaim === OPTIMISTIC_DAILY_REWARD_DAY && state) {
      const response = buildOptimisticClaimResponse(state, OPTIMISTIC_DAILY_REWARD_DAY);
      queryClient.setQueryData(DAILY_REWARDS_QUERY_KEY, response);
      return Promise.resolve(response);
    }

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
