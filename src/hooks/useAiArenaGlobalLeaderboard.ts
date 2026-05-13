import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";

/** Single shared leaderboard fetch for the AI Arena page. */
export const AI_ARENA_LEADERBOARD_QUERY_KEY = ["aiArenaGateway", "globalLeaderboard"] as const;

/** One request on mount; widgets slice this list locally. */
export const AI_ARENA_LEADERBOARD_LIMIT = 50;

type UseAiArenaGlobalLeaderboardOptions = {
  enabled?: boolean;
};

export function useAiArenaGlobalLeaderboard(options: UseAiArenaGlobalLeaderboardOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: AI_ARENA_LEADERBOARD_QUERY_KEY,
    queryFn: () => aiArenaGatewayApi.getGlobalLeaderboard(AI_ARENA_LEADERBOARD_LIMIT),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
