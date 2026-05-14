import { getStoredAiAgentInfo } from "@/lib/aiAgentStorage";
import type { AiArenaAgent, MyArenaAgentsResult } from "@/types/aiArenaGateway";

function dedupeAgents(agents: AiArenaAgent[]): AiArenaAgent[] {
  const seen = new Set<string>();
  const out: AiArenaAgent[] = [];
  for (const agent of agents) {
    if (!agent?.id || seen.has(agent.id)) continue;
    seen.add(agent.id);
    out.push(agent);
  }
  return out;
}

/** Merge freshly created / cached agents into a mine roster API result. */
export function mergeAgentIntoMineResult(
  result: MyArenaAgentsResult,
  extra?: AiArenaAgent | AiArenaAgent[] | null
): MyArenaAgentsResult {
  const extras = [
    ...(Array.isArray(extra) ? extra : extra ? [extra] : []),
    ...(getStoredAiAgentInfo() ? [getStoredAiAgentInfo()!] : []),
  ];

  const agents = dedupeAgents([...extras, ...result.agents]);
  return {
    ...result,
    agents,
    total: Math.max(result.total ?? 0, agents.length),
    mineOk: result.mineOk || agents.length > 0,
  };
}
