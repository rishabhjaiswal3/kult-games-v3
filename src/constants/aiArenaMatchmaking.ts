/** Default game id for AI Arena matchmaking queues. */
export const AI_ARENA_DEFAULT_GAME_ID = "warzone";

export const AI_ARENA_GAME_IDS = [
  { value: "warzone", label: "Warzone" },
  { value: "robowar", label: "Robowar" },
  { value: "highway-hustle", label: "Highway Hustle" },
] as const;

export type AiArenaGameId = (typeof AI_ARENA_GAME_IDS)[number]["value"];

export const AI_ARENA_MATCH_MODES = [
  { value: "RANKED", label: "Ranked", hint: "ELO matchmaking" },
  { value: "CASUAL", label: "Casual", hint: "Practice queue" },
  { value: "WAGER", label: "Wager", hint: "5 ARENA stake + x402" },
] as const;

export type AiArenaMatchMode = (typeof AI_ARENA_MATCH_MODES)[number]["value"];
