/** Default game id used by AI Arena matchmaking examples (`0g-aiarena/docs/INTEGRATION.md`). */
export const AI_ARENA_DEFAULT_GAME_ID = "standard";

export const AI_ARENA_MATCH_MODES = [
  { value: "RANKED", label: "Ranked", hint: "ELO matchmaking" },
  { value: "CASUAL", label: "Casual", hint: "Practice queue" },
  { value: "WAGER", label: "Wager", hint: "5 ARENA stake + x402" },
] as const;

export type AiArenaMatchMode = (typeof AI_ARENA_MATCH_MODES)[number]["value"];
