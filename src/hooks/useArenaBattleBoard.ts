import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { leaderboardElo, useEnrichedArenaLeaderboard } from "@/hooks/useEnrichedArenaLeaderboard";
import type { AiArenaAgent, AiArenaLeaderboardEntry, AiArenaMatchmakingStatusBody } from "@/types/aiArenaGateway";

/** Open-lobby status is fetched per agent — keep this interval conservative. */
const DEFAULT_OPEN_LOBBY_REFRESH_MS = 30_000;
const DEFAULT_LEADERBOARD_REFRESH_MS = 30_000;

export type ArenaOpenLobbyItem = {
  kind: "open-lobby";
  id: string;
  agent: AiArenaAgent;
  status: AiArenaMatchmakingStatusBody;
  waitLabel: string;
};

export type ArenaRankedBattleItem = {
  kind: "ranked";
  id: string;
  left: AiArenaLeaderboardEntry;
  right: AiArenaLeaderboardEntry;
  watchLabel?: string;
};

export type ArenaBattleBoardItem = ArenaOpenLobbyItem | ArenaRankedBattleItem;

export function formatArenaWaitTime(ms?: number | null) {
  if (typeof ms !== "number" || ms <= 0) return "just now";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${totalSeconds}s`;
}

function buildRankedBattleItems(entries: AiArenaLeaderboardEntry[], maxPairs: number): ArenaRankedBattleItem[] {
  const items: ArenaRankedBattleItem[] = [];
  for (let i = 0; i < entries.length - 1 && items.length < maxPairs; i += 2) {
    const left = entries[i];
    const right = entries[i + 1];
    if (!left || !right) continue;
    items.push({
      kind: "ranked",
      id: `ranked-${left.agentId}-${right.agentId}`,
      left,
      right,
    });
  }
  return items;
}

export function useArenaOpenLobbies(
  enabled = true,
  refetchIntervalMs = DEFAULT_OPEN_LOBBY_REFRESH_MS,
) {
  return useQuery({
    queryKey: ["aiArenaGateway", "openLobbies"],
    queryFn: async () => {
      const roster = await aiArenaGatewayApi.listAgents(1, 50);
      const withStatus = await Promise.all(
        (roster.agents ?? []).map(async (agent) => {
          try {
            const statusRes = await aiArenaGatewayApi.getMatchmakingStatus(agent.id);
            return { agent, status: statusRes.status };
          } catch {
            return { agent, status: null };
          }
        })
      );
      return withStatus.filter((row): row is { agent: AiArenaAgent; status: AiArenaMatchmakingStatusBody } => Boolean(row.status?.inQueue));
    },
    enabled,
    staleTime: refetchIntervalMs,
    refetchInterval: enabled ? refetchIntervalMs : false,
    retry: 1,
  });
}

type UseArenaBattleBoardOptions = {
  enabled?: boolean;
  /** When false, skips per-agent matchmaking status calls (ranked leaderboard only). */
  includeOpenLobbies?: boolean;
  maxRankedPairs?: number;
  openLobbyRefetchIntervalMs?: number;
  leaderboardRefetchIntervalMs?: number;
};

export function useArenaBattleBoard(options: UseArenaBattleBoardOptions = {}) {
  const {
    enabled = true,
    includeOpenLobbies = true,
    maxRankedPairs = 6,
    openLobbyRefetchIntervalMs = DEFAULT_OPEN_LOBBY_REFRESH_MS,
    leaderboardRefetchIntervalMs = DEFAULT_LEADERBOARD_REFRESH_MS,
  } = options;
  const openLobbiesQ = useArenaOpenLobbies(enabled && includeOpenLobbies, openLobbyRefetchIntervalMs);
  const leaderboardQ = useEnrichedArenaLeaderboard({
    enabled,
    staleTime: leaderboardRefetchIntervalMs,
    refetchInterval: leaderboardRefetchIntervalMs,
  });

  const openLobbyItems = useMemo<ArenaOpenLobbyItem[]>(
    () =>
      (openLobbiesQ.data ?? []).map(({ agent, status }) => ({
        kind: "open-lobby",
        id: `open-lobby-${agent.id}`,
        agent,
        status,
        waitLabel: formatArenaWaitTime(status.waitTimeMs ?? status.estimatedWaitMs),
      })),
    [openLobbiesQ.data]
  );

  const rankedBattleItems = useMemo(
    () => buildRankedBattleItems(leaderboardQ.data?.entries ?? [], maxRankedPairs),
    [leaderboardQ.data?.entries, maxRankedPairs]
  );

  const items = useMemo<ArenaBattleBoardItem[]>(
    () => [...openLobbyItems, ...rankedBattleItems],
    [openLobbyItems, rankedBattleItems]
  );

  return {
    items,
    openLobbyItems,
    rankedBattleItems,
    isLoading: openLobbiesQ.isLoading || leaderboardQ.isLoading,
    isError: openLobbiesQ.isError && leaderboardQ.isError,
    openLobbiesQ,
    leaderboardQ,
  };
}
