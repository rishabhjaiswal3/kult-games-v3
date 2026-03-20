import apiClient from "@/lib/apiClient";
import type { LeaderboardResponse } from "@/types/api";

interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
}

export const leaderboardApi = {
  getGlobal: async (page = 1, limit = 50): Promise<LeaderboardResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<LeaderboardResponse>>("/leaderboard/global", {
      params: { page, limit },
    });
    return data.data;
  },

  getByGame: async (gameId: string, page = 1, limit = 50): Promise<LeaderboardResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<LeaderboardResponse>>(`/leaderboard/game/${gameId}`, {
      params: { page, limit },
    });
    return data.data;
  },

  refresh: async (): Promise<void> => {
    await apiClient.post("/leaderboard/refresh");
  },
};
