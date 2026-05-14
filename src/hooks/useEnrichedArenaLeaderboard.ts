import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { AI_ARENA_LEADERBOARD_LIMIT, AI_ARENA_LEADERBOARD_QUERY_KEY } from "@/hooks/useAiArenaGlobalLeaderboard";

async function enrichEntries(entries: AiArenaLeaderboardEntry[]): Promise<AiArenaLeaderboardEntry[]> {
  const top = entries.slice(0, 25);
  const enriched = await Promise.all(
    top.map(async (entry) => {
      if (entry.name) return entry;
      try {
        const agent = await aiArenaGatewayApi.getAgentById(entry.agentId);
        return {
          ...entry,
          name: agent.name,
          clan: agent.clan,
          eloRating: agent.eloRating ?? entry.score,
          wins: agent.wins,
          archetype: agent.archetype,
        };
      } catch {
        return {
          ...entry,
          name: `Agent ${entry.agentId.slice(0, 6)}`,
          eloRating: entry.score,
        };
      }
    })
  );
  return [...enriched, ...entries.slice(25)];
}

export function useEnrichedArenaLeaderboard(enabled = true) {
  return useQuery({
    queryKey: [...AI_ARENA_LEADERBOARD_QUERY_KEY, "enriched"],
    queryFn: async () => {
      const data = await aiArenaGatewayApi.getGlobalLeaderboard(AI_ARENA_LEADERBOARD_LIMIT);
      const entries = await enrichEntries(data.entries ?? []);
      return { entries };
    },
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function leaderboardElo(entry: AiArenaLeaderboardEntry): number {
  return Math.round(entry.eloRating ?? entry.score ?? 0);
}

export function leaderboardName(entry: AiArenaLeaderboardEntry): string {
  return entry.name ?? `Agent ${entry.agentId.slice(0, 8)}`;
}
