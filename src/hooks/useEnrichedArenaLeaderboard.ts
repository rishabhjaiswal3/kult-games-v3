import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { AI_ARENA_LEADERBOARD_LIMIT, AI_ARENA_LEADERBOARD_QUERY_KEY } from "@/hooks/useAiArenaGlobalLeaderboard";

/**
 * The leaderboard backend now returns pre-enriched data (name, clan, archetype,
 * wins, losses, draws) in a single call — no per-agent lookups needed.
 * We keep a lightweight fallback in case older backend versions return bare entries.
 */
function normalizeEntries(entries: AiArenaLeaderboardEntry[]): AiArenaLeaderboardEntry[] {
  return entries.map((e) => ({
    ...e,
    name:      e.name      ?? `Agent ${e.agentId.slice(0, 8)}`,
    eloRating: e.eloRating ?? e.score,
    wins:      e.wins      ?? 0,
    losses:    e.losses    ?? 0,
    draws:     e.draws     ?? 0,
  }));
}

type LeaderboardPeriod = "all_time" | "weekly" | "monthly";

type UseEnrichedArenaLeaderboardOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
  staleTime?: number;
  period?: LeaderboardPeriod;
};

export function useEnrichedArenaLeaderboard(options: boolean | UseEnrichedArenaLeaderboardOptions = true) {
  const normalized: { enabled: boolean; refetchInterval: number | false; staleTime: number; period: LeaderboardPeriod } =
    typeof options === "boolean"
      ? { enabled: options, refetchInterval: false, staleTime: 5 * 60_000, period: "all_time" as LeaderboardPeriod }
      : {
          enabled: options.enabled ?? true,
          refetchInterval: options.refetchInterval ?? false,
          staleTime: options.staleTime ?? 5 * 60_000,
          period: options.period ?? ("all_time" as LeaderboardPeriod),
        };

  return useQuery({
    queryKey: [...AI_ARENA_LEADERBOARD_QUERY_KEY, "enriched", normalized.period],
    queryFn: async () => {
      const data = await aiArenaGatewayApi.getGlobalLeaderboard(AI_ARENA_LEADERBOARD_LIMIT, normalized.period);
      return { entries: normalizeEntries(data.entries ?? []) };
    },
    enabled: normalized.enabled,
    staleTime: normalized.staleTime,
    refetchInterval: normalized.refetchInterval,
    retry: 1,
  });
}

export function leaderboardElo(entry: AiArenaLeaderboardEntry): number {
  return Math.round(entry.eloRating ?? entry.score ?? 0);
}

export function leaderboardName(entry: AiArenaLeaderboardEntry): string {
  return entry.name ?? `Agent ${entry.agentId.slice(0, 8)}`;
}
