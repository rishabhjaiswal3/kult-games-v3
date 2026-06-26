import hybridPortrait from "@/assets/hybrid.mp4";
import defenderPortrait from "@/assets/defender.mp4";
import tacticianPortrait from "@/assets/tactician.mp4";
import supportPortrait from "@/assets/support.mp4";
import berserkerPortrait from "@/assets/berserker.mp4";
import assassinPortrait from "@/assets/assassin.gif";

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

export function getLeagueAgent(name: string): LeagueArenaAgent | undefined {
  return LEAGUE_ARENA_AGENTS.find((a) => a.name === name);
}
