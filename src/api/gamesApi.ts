import apiClient from "@/lib/apiClient";
import type { Game, GamesResponse } from "@/types/api";

interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
}

export const gamesApi = {
  getAll: async (page = 1, limit = 20): Promise<GamesResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<GamesResponse>>("/games/all", {
      params: { page, limit },
    });
    return data.data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await apiClient.get<ApiEnvelope<string[] | { categories: string[] }>>("/games/all-categories");
    const inner = data.data;
    return Array.isArray(inner) ? inner : (inner as { categories: string[] }).categories ?? [];
  },

  getById: async (id: string): Promise<Game> => {
    const { data } = await apiClient.get<ApiEnvelope<{ game: Game }>>(`/games/${id}`);
    return data.data.game;
  },
};
