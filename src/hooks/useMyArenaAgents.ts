import { useQuery } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { useAuth } from "@/contexts/AuthContext";
import type { MyArenaAgentsResult } from "@/types/aiArenaGateway";

export const MY_ARENA_AGENTS_QUERY_KEY = ["aiArenaGateway", "myAgents"] as const;

/**
 * Loads agents for the signed-in AI Arena user.
 * Gateway may not expose GET /v1/agents/mine (404) — API layer falls back to /v1/auth/me + /v1/agents.
 */
export function useMyArenaAgents(page = 1, pageSize = 50) {
  const { isAuthenticated } = useAuth();
  const { isAiArenaReady } = useAiArenaGatewaySession();

  return useQuery({
    queryKey: [...MY_ARENA_AGENTS_QUERY_KEY, page, pageSize],
    queryFn: () => aiArenaGatewayApi.getMyAgentsFromMine(page, pageSize),
    enabled: isAuthenticated && isAiArenaReady,
    staleTime: 20_000,
    retry: false,
  });
}

export function hasArenaAgent(data: MyArenaAgentsResult | undefined): boolean {
  return !!data?.mineOk && (data.agents?.length ?? 0) > 0;
}
