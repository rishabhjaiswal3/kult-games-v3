import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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

/** Infinite scroll roster — pages append as user scrolls. */
export function useArenaAgentsListInfinite(pageSize = 12) {
  return useInfiniteQuery({
    queryKey: [...ARENA_AGENTS_LIST_QUERY_KEY, "infinite", pageSize],
    queryFn: ({ pageParam }) => aiArenaGatewayApi.listAgents(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const batch = lastPage.agents.length;
      if (batch === 0) return undefined;
      if (batch < pageSize) return undefined;
      const loaded = allPages.reduce((acc, p) => acc + p.agents.length, 0);
      const total = lastPage.total;
      if (typeof total === "number" && total > 0 && loaded >= total) return undefined;
      return lastPageParam + 1;
    },
    staleTime: 30_000,
    retry: 1,
  });
}
