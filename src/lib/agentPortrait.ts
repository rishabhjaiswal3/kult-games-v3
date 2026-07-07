import type { AiArenaAgent } from "@/types/aiArenaGateway";
import tacticianPortrait from "@/assets/tactician.mp4";
import assassinPortrait from "@/assets/assassin.mp4";
import berserkerPortrait from "@/assets/berserker.mp4";
import defenderPortrait from "@/assets/defender.mp4";
import hybridPortrait from "@/assets/hybrid.mp4";
import supportPortrait from "@/assets/support.mp4";

export function clanTypeFromAgent(agent: AiArenaAgent): "zerog" | "solana" | "base" | "okx" {
  const clan = agent.clan?.toUpperCase();
  if (clan === "SOLANA") return "solana";
  if (clan === "BASE") return "base";
  if (clan === "OKX") return "okx";
  return "zerog";
}

/**
 * Resolve the portrait media (mp4/gif) shown for an agent, mirroring the My
 * Agents card so the same picture appears everywhere. `index` only nudges the
 * clan-based fallback ordering when the archetype is unknown.
 */
export function resolveAgentImage(agent: AiArenaAgent, index = 0): string {
  const archetype = agent.archetype?.toUpperCase();
  if (archetype?.includes("ASSASSIN")) return assassinPortrait;
  if (archetype?.includes("TACTICIAN")) return tacticianPortrait;
  if (archetype?.includes("DEFENDER")) return defenderPortrait;
  if (archetype?.includes("BERSERKER")) return berserkerPortrait;
  if (archetype?.includes("SUPPORT")) return supportPortrait;
  if (archetype?.includes("HYBRID")) return hybridPortrait;

  const byClan = clanTypeFromAgent(agent);
  if (byClan === "solana") return index % 2 === 0 ? tacticianPortrait : supportPortrait;
  if (byClan === "base") return index % 2 === 0 ? defenderPortrait : berserkerPortrait;
  return index % 2 === 0 ? assassinPortrait : hybridPortrait;
}
