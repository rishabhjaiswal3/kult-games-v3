import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leagueApi, type GeneratedPrediction, type UserAgentPick } from "@/api/leagueApi";
import { useAuth } from "@/contexts/AuthContext";

export interface PickResult extends GeneratedPrediction {
  agentName: string;
}

/**
 * Backend truth (from `match.userAgentPick`, present on every match fetch) ->
 * the same shape the UI renders after a fresh click. Used so a pick made
 * before a refresh still displays correctly on load, not just right after
 * clicking "Make Pick" in this same session.
 */
export function toPickResult(pick: UserAgentPick): PickResult {
  return {
    agentId: pick.agentId,
    agentName: pick.agentName,
    winner: pick.predictedWinner,
    scoreHome: pick.scoreHome,
    scoreAway: pick.scoreAway,
    conviction: pick.conviction,
    reasoning: null,
    source: "AI",
  };
}

/**
 * "Make Pick" for a League match — has your first enrolled agent generate its
 * own AI prediction (POST .../generate), per the product decision that agents
 * make the call, not a manual form. No agent picker: uses the first row from
 * /v1/league/me/agents, which is enough for a single-agent user and a
 * reasonable default for multi-agent users until a picker is worth building.
 *
 * Results are kept per-matchId (not just "the last one clicked") so picking
 * on match A and then match B keeps showing A's result too.
 */
export function useMakeLeaguePick() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null);
  const [errorsByMatch, setErrorsByMatch] = useState<Record<string, string>>({});
  const [resultsByMatch, setResultsByMatch] = useState<Record<string, PickResult>>({});

  const { data: lineup } = useQuery({
    queryKey: ["league", "me", "agents"],
    queryFn: () => leagueApi.getMyLineup(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const hasAgent = (lineup?.length ?? 0) > 0;

  async function makePick(matchId: string) {
    if (!isAuthenticated || !lineup || lineup.length === 0) return;

    const agent = lineup[0];
    setLoadingMatchId(matchId);
    setErrorsByMatch((prev) => ({ ...prev, [matchId]: "" }));
    try {
      const prediction = await leagueApi.generatePrediction(matchId, agent.agentId);
      setResultsByMatch((prev) => ({ ...prev, [matchId]: { ...prediction, agentName: agent.agentName } }));
      queryClient.invalidateQueries({ queryKey: ["league", "matches"] });
      queryClient.invalidateQueries({ queryKey: ["league", "predictions", "today"] });
      queryClient.invalidateQueries({ queryKey: ["league", "me", "predictions"] });
    } catch (err) {
      setErrorsByMatch((prev) => ({
        ...prev,
        [matchId]: err instanceof Error ? err.message : "Couldn't generate a pick — try again.",
      }));
    } finally {
      setLoadingMatchId((current) => (current === matchId ? null : current));
    }
  }

  return {
    makePick,
    isLoading: (matchId: string) => loadingMatchId === matchId,
    result: (matchId: string) => resultsByMatch[matchId] ?? null,
    error: (matchId: string) => errorsByMatch[matchId] || null,
    isAuthenticated,
    hasAgent,
  };
}
