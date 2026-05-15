import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";

export const ARENA_AGENTS_LIST_QUERY_KEY = ["aiArenaGateway", "agentsList"] as const;

/** Public paginated roster from GET /v1/agents. */
export function useArenaAgentsList(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: [...ARENA_AGENTS_LIST_QUERY_KEY, page, pageSize],
    queryFn: () => aiArenaGatewayApi.listAgents(page, pageSize),
    staleTime: 30_000,
    retry: 1,
  });
}
