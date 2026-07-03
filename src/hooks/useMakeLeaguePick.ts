import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leagueApi } from "@/api/leagueApi";
import { useAuth } from "@/contexts/AuthContext";

type PickStatus = "idle" | "loading" | "success" | "error";

/**
 * "Make Pick" for a League match — has your first enrolled agent generate its
 * own AI prediction (POST .../generate), per the product decision that agents
 * make the call, not a manual form. No agent picker: uses the first row from
 * /v1/league/me/agents, which is enough for a single-agent user and a
 * reasonable default for multi-agent users until a picker is worth building.
 */
export function useMakeLeaguePick() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PickStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pickedMatchId, setPickedMatchId] = useState<string | null>(null);

  const { data: lineup } = useQuery({
    queryKey: ["league", "me", "agents"],
    queryFn: () => leagueApi.getMyLineup(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const hasAgent = (lineup?.length ?? 0) > 0;

  async function makePick(matchId: string) {
    if (!isAuthenticated || !lineup || lineup.length === 0) return;

    setStatus("loading");
    setError(null);
    setPickedMatchId(matchId);
    try {
      await leagueApi.generatePrediction(matchId, lineup[0].agentId);
      setStatus("success");
      // Refresh everything this pick could have affected.
      queryClient.invalidateQueries({ queryKey: ["league", "matches"] });
      queryClient.invalidateQueries({ queryKey: ["league", "predictions", "today"] });
      queryClient.invalidateQueries({ queryKey: ["league", "me", "predictions"] });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't generate a pick — try again.");
    }
  }

  return { makePick, status, error, pickedMatchId, isAuthenticated, hasAgent };
}
