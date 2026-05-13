import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";

/** Single shared leaderboard fetch for the whole AI Arena page. */
export const AI_ARENA_LEADERBOARD_QUERY_KEY = ["aiArenaGateway", "globalLeaderboard"] as const;

/** One request on mount; widgets slice this list locally. */
export const AI_ARENA_LEADERBOARD_LIMIT = 50;

export function useAiArenaGlobalLeaderboard() {
  return useQuery({
    queryKey: AI_ARENA_LEADERBOARD_QUERY_KEY,
    queryFn: () => aiArenaGatewayApi.getGlobalLeaderboard(AI_ARENA_LEADERBOARD_LIMIT),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
