/** Matches AI Arena gateway `POST /v1/agents` — see `0g-aiarena/docs/FRONTEND.md`. */
export const AI_ARENA_CLAN_OPTIONS = [
  { value: "ZEROG" as const, label: "ZEROG", hint: "0G native" },
  { value: "BASE" as const, label: "BASE", hint: "Base" },
  { value: "SOLANA" as const, label: "SOLANA", hint: "Solana" },
];

export const AI_ARENA_ARCHETYPE_OPTIONS = [
  "BERSERKER",
  "TACTICIAN",
  "DEFENDER",
  "ASSASSIN",
  "SUPPORT",
  "HYBRID",
] as const;

export type AiArenaClan = (typeof AI_ARENA_CLAN_OPTIONS)[number]["value"];
export type AiArenaArchetype = (typeof AI_ARENA_ARCHETYPE_OPTIONS)[number];
