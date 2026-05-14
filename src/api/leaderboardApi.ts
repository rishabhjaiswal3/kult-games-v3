import apiClient from "@/lib/apiClient";
import type { LeaderboardEntry, LeaderboardResponse } from "@/types/api";

interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
}

function normalizeLeaderboardEntry(raw: Record<string, unknown>, index: number): LeaderboardEntry {
  const wallet =
    (typeof raw.wallet_address === "string" && raw.wallet_address) ||
    (typeof raw.walletAddress === "string" && raw.walletAddress) ||
    "";

  return {
    rank: Number(raw.rank ?? index + 1),
    wallet_address: wallet,
    name: typeof raw.name === "string" ? raw.name : typeof raw.username === "string" ? raw.username : undefined,
    score: Number(raw.score ?? 0),
    wins: raw.wins != null ? Number(raw.wins) : undefined,
    level: raw.level != null ? String(raw.level) : undefined,
    game: typeof raw.game === "string" ? raw.game : undefined,
  };
}

function normalizeLeaderboardResponse(data: unknown): LeaderboardResponse {
  const raw = (data ?? {}) as Record<string, unknown>;
  const entriesRaw = Array.isArray(raw.entries) ? raw.entries : [];
  const entries = entriesRaw.map((row, i) =>
    normalizeLeaderboardEntry(row as Record<string, unknown>, i)
  );

  return {
    entries,
    total: Number(raw.total ?? raw.totalCount ?? entries.length),
    page: Number(raw.page ?? 1),
    limit: Number(raw.limit ?? raw.pageSize ?? entries.length),
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : undefined,
  };
}

export const leaderboardApi = {
  getGlobal: async (page = 1, limit = 50): Promise<LeaderboardResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>("/leaderboard/global", {
      params: { page, limit },
    });
    return normalizeLeaderboardResponse(data.data);
  },

  getByGame: async (gameId: string, page = 1, limit = 50): Promise<LeaderboardResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(`/leaderboard/game/${gameId}`, {
      params: { page, limit },
    });
    return normalizeLeaderboardResponse(data.data);
  },

  refresh: async (): Promise<void> => {
    await apiClient.post("/leaderboard/refresh");
  },
};
