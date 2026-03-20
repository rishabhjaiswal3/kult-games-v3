import apiClient from "@/lib/apiClient";
import type { Game, GamesResponse } from "@/types/api";

export const gamesApi = {
  getAll: async (page = 1, limit = 20): Promise<GamesResponse> => {
    const { data } = await apiClient.get<GamesResponse>("/games/all", {
      params: { page, limit },
    });
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[] | { categories: string[] }>("/games/all-categories");
    return Array.isArray(data) ? data : (data as { categories: string[] }).categories ?? [];
  },

  getById: async (id: string): Promise<Game> => {
    const { data } = await apiClient.get<Game>(`/games/${id}`);
    return data;
  },
};
