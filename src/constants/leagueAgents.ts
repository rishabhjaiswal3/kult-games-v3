import hybridPortrait from "@/assets/hybrid.mp4";
import defenderPortrait from "@/assets/defender.mp4";
import tacticianPortrait from "@/assets/tactician.mp4";
import supportPortrait from "@/assets/support.mp4";
import berserkerPortrait from "@/assets/berserker.mp4";
import assassinPortrait from "@/assets/assassin.mp4";

/** Same roster + media as `AIArenaPage` top agents. */
export type LeagueArenaAgent = {
  rank: string;
  name: string;
  callsign: string;
  chain: string;
  tier: string;
  lvl: number;
  power: string;
  img: string;
  color: string;
  /** Solid accent for bars/borders (CSS vars are unreliable in inline styles). */
  accentHex: string;
};

export const LEAGUE_ARENA_AGENTS: LeagueArenaAgent[] = [
  {
    rank: "01",
    name: "HYBRID",
    callsign: "NOVA-11",
    chain: "ZeroG",
    tier: "Legendary",
    lvl: 12,
    power: "14,850",
    img: hybridPortrait,
    color: "var(--neon)",
    accentHex: "#c084fc",
  },
  {
    rank: "02",
    name: "DEFENDER",
    callsign: "AEGIS-04",
    chain: "Base",
    tier: "Epic",
    lvl: 11,
    power: "13,420",
    img: defenderPortrait,
    color: "var(--lime)",
    accentHex: "#4ade80",
  },
  {
    rank: "03",
    name: "TACTICIAN",
    callsign: "ORION-07",
    chain: "Solana",
    tier: "Epic",
    lvl: 12,
    power: "12,980",
    img: tacticianPortrait,
    color: "var(--cyan)",
    accentHex: "#22d3ee",
  },
  {
    rank: "04",
    name: "SUPPORT",
    callsign: "LYRA-09",
    chain: "ZeroG",
    tier: "Epic",
    lvl: 11,
    power: "12,150",
    img: supportPortrait,
    color: "var(--neon-2)",
    accentHex: "#a78bfa",
  },
  {
    rank: "05",
    name: "BERSERKER",
    callsign: "VOLT-13",
    chain: "Base",
    tier: "Legendary",
    lvl: 12,
    power: "11,870",
    img: berserkerPortrait,
    color: "var(--amber)",
    accentHex: "#fbbf24",
  },
  {
    rank: "06",
    name: "ASSASSIN",
    callsign: "NYX-06",
    chain: "Solana",
    tier: "Epic",
    lvl: 11,
    power: "10,940",
    img: assassinPortrait,
    color: "var(--magenta)",
    accentHex: "#e879f9",
  },
];

/** Stable, order-independent hash so a given agent name always maps to the same portrait. */
function hashAgentName(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Cache so a given name ALWAYS returns the same object reference across renders, otherwise a
 * fresh object each call breaks referential equality in memo/effect deps.
 */
const leagueAgentCache = new Map<string, LeagueArenaAgent>();

/**
 * Resolves the media/theme for a League agent by name.
 * Real agents (e.g. "POTTASIUM", "AGENT 0X41AC1F") have no exact roster entry, so we
 * deterministically assign one of the roster portraits by hashing the name, keeping the
 * agent's real name while still showing a consistent image/accent.
 */
export function getLeagueAgent(name: string): LeagueArenaAgent {
  const exact = LEAGUE_ARENA_AGENTS.find((a) => a.name === name);
  if (exact) return exact;

  const key = name ?? "";
  const cached = leagueAgentCache.get(key);
  if (cached) return cached;

  const base = LEAGUE_ARENA_AGENTS[hashAgentName(key) % LEAGUE_ARENA_AGENTS.length];
  const resolved: LeagueArenaAgent = { ...base, name: name ?? base.name };
  leagueAgentCache.set(key, resolved);
  return resolved;
}
