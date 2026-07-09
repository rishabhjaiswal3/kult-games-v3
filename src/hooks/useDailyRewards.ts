import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dailyRewardsApi, type DailyRewardsState } from "@/api/dailyRewardsApi";

const QUERY_KEY = ["rewards", "daily"];

/** Daily login rewards state + claim action. Backed by the mocked
 *  dailyRewardsApi for now; swapping in the real endpoints there changes
 *  nothing here or in any component. */
export function useDailyRewards() {
  const queryClient = useQueryClient();

  const { data: state, isLoading } = useQuery<DailyRewardsState>({
    queryKey: QUERY_KEY,
    queryFn: dailyRewardsApi.getState,
    staleTime: 30_000,
    // Re-evaluates the unlock window so the CTA flips to claimable at midnight.
    refetchInterval: 60_000,
  });

  const claimMutation = useMutation({
    mutationFn: (day: number) => dailyRewardsApi.claim(day),
    onSuccess: (next) => queryClient.setQueryData(QUERY_KEY, next),
  });

  return {
    state,
    isLoading,
    claim: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
  };
}
