import type { AiArenaArchetype } from "@/constants/aiArenaAgent";
import agentsPoster from "@/assets/ai_agents_4k_poster.png";
import assassinPhantom from "@/assets/assassin_phantom.png";
import berserkerRagnar from "@/assets/berserker_ragnar.png";
import defenderTitan from "@/assets/defender_titan.png";
import hybridGlitch from "@/assets/hybrid_glitch.png";
import supportLumina from "@/assets/support_lumina.png";
import tacticianSynapse from "@/assets/tactician_synapse.png";

export { agentsPoster };

export type ArenaAgentArchetypeCard = {
  archetype: AiArenaArchetype;
  codename: string;
  tagline: string;
  role: string;
  image: string;
  accent: string;
  glow: string;
  border: string;
};

export const ARENA_AGENT_ARCHETYPE_CARDS: ArenaAgentArchetypeCard[] = [
  {
    archetype: "BERSERKER",
    codename: "Ragnar",
    tagline: "Overwhelm with relentless pressure.",
    role: "Aggression · Momentum · Finishers",
    image: berserkerRagnar,
    accent: "text-orange-400",
    glow: "from-orange-500/35 via-red-600/20 to-transparent",
    border: "group-hover:border-orange-400/50",
  },
  {
    archetype: "TACTICIAN",
    codename: "Synapse",
    tagline: "Reads the board three moves ahead.",
    role: "Control · Tempo · Counter-play",
    image: tacticianSynapse,
    accent: "text-neon-cyan",
    glow: "from-cyan-400/35 via-blue-500/20 to-transparent",
    border: "group-hover:border-neon-cyan/50",
  },
  {
    archetype: "DEFENDER",
    codename: "Titan",
    tagline: "Absorbs chaos and turns it into wins.",
    role: "Fortify · Sustain · Zone control",
    image: defenderTitan,
    accent: "text-emerald-400",
    glow: "from-emerald-400/35 via-teal-500/20 to-transparent",
    border: "group-hover:border-emerald-400/50",
  },
  {
    archetype: "ASSASSIN",
    codename: "Phantom",
    tagline: "Strikes where the meta is weakest.",
    role: "Burst · Flanks · Punish mistakes",
    image: assassinPhantom,
    accent: "text-violet-400",
    glow: "from-violet-500/35 via-purple-600/20 to-transparent",
    border: "group-hover:border-violet-400/50",
  },
  {
    archetype: "SUPPORT",
    codename: "Lumina",
    tagline: "Elevates allies and outlasts the clock.",
    role: "Buffs · Recovery · Team tempo",
    image: supportLumina,
    accent: "text-amber-300",
    glow: "from-amber-300/35 via-yellow-500/15 to-transparent",
    border: "group-hover:border-amber-300/50",
  },
  {
    archetype: "HYBRID",
    codename: "Glitch",
    tagline: "Unpredictable — never the same fight twice.",
    role: "Adapt · Pivot · Meta-break",
    image: hybridGlitch,
    accent: "text-neon-magenta",
    glow: "from-fuchsia-500/35 via-cyan-400/20 to-transparent",
    border: "group-hover:border-fuchsia-400/50",
  },
];

const ARCHETYPE_PORTRAIT_BY_TYPE = Object.fromEntries(
  ARENA_AGENT_ARCHETYPE_CARDS.map((card) => [card.archetype, card.image])
) as Record<string, string>;

const PORTRAIT_POOL = ARENA_AGENT_ARCHETYPE_CARDS.map((card) => card.image);

function portraitIndexFromAgentId(agentId: string): number {
  let hash = 0;
  for (let i = 0; i < agentId.length; i += 1) {
    hash = (hash * 31 + agentId.charCodeAt(i)) >>> 0;
  }
  return hash % PORTRAIT_POOL.length;
}

/** Archetype portrait when known; otherwise a stable pick from the six roster characters. */
export function getArenaAgentPortrait(agent: { id: string; archetype?: string | null }): string {
  const normalized = agent.archetype?.trim().toUpperCase();
  if (normalized && ARCHETYPE_PORTRAIT_BY_TYPE[normalized]) {
    return ARCHETYPE_PORTRAIT_BY_TYPE[normalized];
  }
  return PORTRAIT_POOL[portraitIndexFromAgentId(agent.id)] ?? PORTRAIT_POOL[0];
}

export function getArchetypeCardByType(archetype: AiArenaArchetype): ArenaAgentArchetypeCard | undefined {
  return ARENA_AGENT_ARCHETYPE_CARDS.find((card) => card.archetype === archetype);
}

/** Stable robot portrait + codename for wallet-based global leaderboard rows. */
export function getLeaderboardPlayerVisual(wallet: string) {
  const seed = wallet?.trim() || "player";
  const card = ARENA_AGENT_ARCHETYPE_CARDS[portraitIndexFromAgentId(seed)] ?? ARENA_AGENT_ARCHETYPE_CARDS[0];
  return {
    portrait: card.image,
    archetype: card.archetype,
    codename: card.codename,
    role: card.role,
  };
}
