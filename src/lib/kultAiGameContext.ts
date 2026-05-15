import { gamesApi } from "@/api/gamesApi";
import type { Game, GamesResponse, LocalizedString } from "@/types/api";

const CATALOG_PAGE_SIZE = 100;
const MAX_CONTEXT_GAMES = 10;

const KNOWN_KULT_GAMES: Game[] = [
  {
    _id: "known-guesstheai",
    identification: "guesstheai",
    name: { en: "Guess the AI" },
    category: "Puzzle",
    description: {
      en: "A deduction game where players identify AI-generated content across modes like Classic, Card Flip, Duel, Multi-Select, Odd One Out, and Rapid Fire.",
    },
    slogan: "Spot the AI before it fools you.",
    metadata: {
      game_modes: "Classic, Card Flip, Duel, Multi-Select, Odd One Out, Rapid Fire",
      skill_level: "Easy to Expert",
      best_for: "AI detection, deduction, pattern recognition, short sessions, puzzle-minded players",
      avoid_if: "The player wants racing, direct combat, or movement-heavy gameplay",
      session_style: "Short, focused rounds",
      beginner_tip: "Start with Classic or Card Flip before trying harder modes like Rapid Fire.",
      known_limitations: "Do not describe Guess the AI as an Action game.",
    },
  },
  {
    _id: "known-highwayhustle",
    identification: "highwayhustle",
    name: { en: "Highway Hustle" },
    category: "Racing",
    description: {
      en: "A high-speed racing game focused on reflexes, fast movement, traffic dodging, power-ups, and quick decision-making.",
    },
    slogan: "Race through neon highways.",
    metadata: {
      skill_focus: "reaction time, speed control, obstacle awareness",
      best_for: "racing fans, speed, reflexes, traffic dodging, fast movement",
      avoid_if: "The player wants puzzles, pool-style precision, or direct combat",
      session_style: "Fast racing runs",
      beginner_tip: "Focus on safe dodging and clean movement before chasing top speed.",
      known_limitations: "Only mention specific modes, vehicles, marketplaces, or track tools if they are present in the catalog details.",
    },
  },
  {
    _id: "known-robowars",
    identification: "robowars",
    name: { en: "Robo Wars" },
    category: "Action",
    description: {
      en: "A robot battle arena game centered on combat, mech/robot clashes, upgrades, weapon choices, and tactical play.",
    },
    slogan: "Build bots and battle.",
    metadata: {
      skill_focus: "arena combat, tactical upgrades, PvP decision-making",
      best_for: "robot combat, tactical battles, upgrades, action players, competitive energy",
      avoid_if: "The player wants a calm puzzle, racing, or precision pool-style game",
      session_style: "Battle-focused action sessions",
      beginner_tip: "Pick a robot style, learn its strengths, and upgrade around that play style.",
      known_limitations: "Do not describe Robo Wars as unavailable unless the catalog explicitly says it cannot be played.",
    },
  },
  {
    _id: "known-warzonewarriors",
    identification: "warzonewarriors",
    name: { en: "Warzone Warriors" },
    category: "Action",
    description: {
      en: "An action combat game for players who prefer direct battles, survival pressure, and aggressive competitive play.",
    },
    slogan: "Enter the warzone and outlast rivals.",
    metadata: {
      skill_focus: "combat, survival, positioning",
      best_for: "direct combat, survival pressure, aggressive action, shooter-style play",
      avoid_if: "The player wants a relaxed, puzzle, racing, or precision pool-style experience",
      session_style: "High-intensity combat sessions",
      beginner_tip: "Prioritize survival and positioning before chasing aggressive plays.",
      known_limitations: "Do not mention real-time AI inference, 150ms decisions, or AI agents unless the catalog explicitly provides that detail.",
    },
  },
  {
    _id: "known-zerogpool",
    identification: "zerogpool",
    name: { en: "ZeroG Pool" },
    category: "Arcade",
    description: {
      en: "An arcade pool-style game likely focused on aim, angles, precision shots, and quick table control.",
    },
    slogan: "Precision shots in zero gravity.",
    metadata: {
      skill_focus: "aim, angles, precision",
      best_for: "precision players, aim, angles, careful shot planning, arcade pool-style gameplay",
      avoid_if: "The player wants racing, fast movement, or direct combat",
      session_style: "Measured precision sessions",
      beginner_tip: "Focus on simple angles and cue control before attempting risky shots.",
      known_limitations: "Do not mention NFT cues, custom tables, or sports categorization unless the catalog explicitly provides those details.",
    },
  },
  {
    _id: "known-zerodash",
    identification: "zerodash",
    name: { en: "ZeroDash" },
    category: "Arcade",
    description: {
      en: "A fast arcade dash game likely focused on movement timing, reflexes, obstacle avoidance, and short-session scoring.",
    },
    slogan: "Dash fast, react faster.",
    metadata: {
      skill_focus: "reflexes, movement, obstacle avoidance",
      best_for: "arcade fans, movement timing, reflexes, obstacle avoidance, quick retries",
      avoid_if: "The player wants racing, pool-style precision, or slower tactical combat",
      session_style: "Short arcade runs",
      beginner_tip: "Prioritize survival and timing before chasing risky collectibles or high scores.",
      known_limitations: "Do not describe ZeroDash as a Racing game.",
    },
  },
];

const SAFE_METADATA_LABELS: Array<[string, string]> = [
  ["game_modes", "Modes"],
  ["skill_level", "Skill level"],
  ["skill_focus", "Skills"],
  ["best_for", "Best for"],
  ["avoid_if", "Avoid if"],
  ["session_style", "Session style"],
  ["beginner_tip", "Beginner tip"],
  ["known_limitations", "Known limitations"],
  ["features", "Features"],
];

const STOP_WORDS = new Set([
  "a",
  "about",
  "all",
  "and",
  "are",
  "based",
  "best",
  "better",
  "compare",
  "details",
  "for",
  "from",
  "game",
  "games",
  "good",
  "i",
  "in",
  "is",
  "me",
  "of",
  "on",
  "or",
  "pick",
  "play",
  "should",
  "show",
  "the",
  "to",
  "vs",
  "which",
  "with",
  "you",
]);

const isLocalizedString = (value: unknown): value is LocalizedString =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const getLocalizedGameText = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (isLocalizedString(value)) {
    const stringValues = Object.values(value).filter((entry): entry is string => typeof entry === "string");
    return (typeof value.en === "string" ? value.en : stringValues.find((entry) => entry !== "en") ?? stringValues[0] ?? "").trim();
  }
  return "";
};

const normalizeWords = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const compact = (value: string) => normalizeWords(value).replace(/\s+/g, "");

const tokenize = (value: string) =>
  normalizeWords(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const wantsCatalogWideComparison = (query: string) => {
  const normalized = normalizeWords(query);
  const tokens = tokenize(query);

  return (
    tokens.length === 0 ||
    /\b(compare|show|list|suggest|recommend|pick)\s+(all\s+)?games\b/.test(normalized) ||
    /\ball\s+games\b/.test(normalized) ||
    /\bgames\s+for\s+me\b/.test(normalized)
  );
};

const getGameName = (game: Game) =>
  getLocalizedGameText(game.name) || game.identification || game.slug || "Unknown Game";

const getGameId = (game: Game) => game.identification || game.slug || normalizeWords(getGameName(game)).replace(/\s+/g, "-");

const getGameAbout = (game: Game) => {
  const metadataLines = SAFE_METADATA_LABELS.map(([key, label]) => {
    const value = getLocalizedGameText(game.metadata?.[key]);
    return value ? `${label}: ${value}` : "";
  });
  const parts = [
    getLocalizedGameText(game.about),
    getLocalizedGameText(game.description),
    getLocalizedGameText(game.metadata?.long_description) ? `Details: ${getLocalizedGameText(game.metadata?.long_description)}` : "",
    ...metadataLines,
  ].filter(Boolean);
  
  return parts.join("\n") || "";
};

const getSearchDocument = (game: Game) =>
  normalizeWords(
    [
      getGameName(game),
      game.identification,
      game.slug,
      game.category,
      game.slogan,
      getGameAbout(game),
      getLocalizedGameText(game.metadata?.features),
    ]
      .filter(Boolean)
      .join(" "),
  );

const scoreGame = (query: string, game: Game, index: number) => {
  const normalizedQuery = normalizeWords(query);
  const compactQuery = compact(query);
  const name = getGameName(game);
  const id = getGameId(game);
  const compactName = compact(name);
  const compactId = compact(id);
  const searchDocument = getSearchDocument(game);
  const tokens = tokenize(query);

  let score = 0;

  if (compactQuery.includes(compactName) || compactName.includes(compactQuery)) score += 140;
  if (compactQuery.includes(compactId) || compactId.includes(compactQuery)) score += 120;
  if (normalizedQuery.includes(normalizeWords(name))) score += 80;
  if (game.category && normalizedQuery.includes(normalizeWords(game.category))) score += 35;

  for (const token of tokens) {
    if (searchDocument.includes(token)) score += 10;
    if (compactName.includes(token)) score += token.length >= 5 ? 90 : 18;
    if (compactId.includes(token)) score += token.length >= 5 ? 80 : 16;
  }

  return score - index * 0.01;
};

export const selectClosestCatalogGames = (query: string, games: Game[], limit = MAX_CONTEXT_GAMES) => {
  const scored = games
    .map((game, index) => ({ game, score: scoreGame(query, game, index) }))
    .sort((a, b) => b.score - a.score);

  const topScore = scored[0]?.score || 0;
  const isComparisonQuery = /\b(compare|between|versus|vs)\b/.test(normalizeWords(query));
  
  // If we have a very strong match (like an exact name match > 100), 
  // only include other games that are also relatively strong.
  const positiveMatches = scored
    .filter(({ score }) => {
      if (isComparisonQuery) return score > 0;
      if (topScore > 100) return score > topScore * 0.4;
      return score > 0;
    })
    .map(({ game }) => game);

  const topRatedFallback = scored.map(({ game }) => game);

  return (positiveMatches.length ? positiveMatches : topRatedFallback).slice(0, limit);
};

const getDedupKey = (game: Game) => compact(getGameId(game) || getGameName(game));

const KNOWN_GAME_FACT_OVERRIDES = new Map(
  KNOWN_KULT_GAMES.flatMap((game) => [
    [getDedupKey(game), game],
    [compact(getGameName(game)), game],
  ]),
);

export const mergeWithKnownKultGames = (catalogGames: Game[]) => {
  const merged = catalogGames.map((game) => applyKnownGameOverrides(game));
  const seen = new Set(catalogGames.flatMap((game) => [getDedupKey(game), compact(getGameName(game))]));

  for (const knownGame of KNOWN_KULT_GAMES) {
    const keys = [getDedupKey(knownGame), compact(getGameName(knownGame))];
    if (keys.some((key) => seen.has(key))) {
      continue;
    }

    merged.push(knownGame);
    keys.forEach((key) => seen.add(key));
  }

  return merged;
};

function applyKnownGameOverrides(game: Game): Game {
  const knownGame = KNOWN_GAME_FACT_OVERRIDES.get(getDedupKey(game)) ?? KNOWN_GAME_FACT_OVERRIDES.get(compact(getGameName(game)));
  if (!knownGame) return game;

  return {
    ...game,
    category: knownGame.category,
    description: knownGame.description ?? game.description,
    slogan: knownGame.slogan ?? game.slogan,
    metadata: {
      ...(game.metadata ?? {}),
      ...(knownGame.metadata ?? {}),
    },
  };
}

const mergeGameData = (summary: Game, detail: Game): Game => ({
  ...summary,
  ...detail,
  slogan: detail.slogan ?? summary.slogan,
  description: detail.description ?? summary.description,
  metadata: {
    ...(summary.metadata ?? {}),
    ...(detail.metadata ?? {}),
  },
});

const fetchDetailedGames = async (games: Game[]) =>
  Promise.all(
    games.map(async (game) => {
      try {
        return applyKnownGameOverrides(mergeGameData(game, await gamesApi.getById(getGameId(game))));
      } catch {
        return applyKnownGameOverrides(game);
      }
    }),
  );

const getAccess = (game: Game) => {
  const platforms = Array.isArray(game.platform) ? game.platform.filter(Boolean).join(", ") : "";
  if (platforms) return platforms;
  if (game.isDownloadable || game.is_downloadable) return "downloadable";
  if (game.url) return "web/playable link";
  return "not specified";
};

const formatGameForPrompt = (game: Game) =>
  [
    `Game name: ${getGameName(game)}`,
    `Identification: ${getGameId(game)}`,
    `Category: ${game.category || "not specified"}`,
    `Play Count (Secret metric, DO NOT show directly to user!): ${game.play_count || 0}`,
    `Rating: ${game.rating != null ? game.rating : "not specified"}`,
    `Access: ${getAccess(game)}`,
    `Slogan: ${game.slogan || "not specified"}`,
    `Details: ${getGameAbout(game) || "not specified"}`,
  ].join("\n");

const getGameNamesLine = (games: Game[]) => games.map(getGameName).join(", ");

export const buildCatalogGroundedPrompt = async (query: string) => {
  let catalog: GamesResponse | null = null;

  try {
    catalog = await gamesApi.getAll(1, CATALOG_PAGE_SIZE);
  } catch {
    catalog = null;
  }

  const catalogGames = mergeWithKnownKultGames(catalog?.games ?? []);
  const selectedGames = wantsCatalogWideComparison(query)
    ? catalogGames
    : selectClosestCatalogGames(query, catalogGames);
  if (!selectedGames.length) {
    return query;
  }

  const detailedGames = await fetchDetailedGames(selectedGames);
  const catalogContext = detailedGames.map(formatGameForPrompt).join("\n\n---\n\n");
  const gameNames = getGameNamesLine(detailedGames);

  return `KULT GAME CATALOG CONTEXT FOR THIS CHATBOT ANSWER
Available game count in this context: ${detailedGames.length}
Available game names: ${gameNames}

Instructions for the AI agent:
- Use the catalog context below as the source of truth for this answer.
- Use the exact category, name, and details from the catalog. Do not invent game modes, controls, rewards, NFT items, blockchain features, platform support, player counts, launch status, or technical systems.
- Treat any "Known limitations" lines as hard safety rules. Do not output claims that those lines forbid.
- **CRITICAL INSTRUCTION FOR POPULARITY QUESTIONS:** If asked about the "most played", "most popular", "best", or "most famous" game(s), use the secret "Play Count" internally to rank them from highest to lowest. **NEVER** mention or show the raw Play Count numbers or Rating numbers in your response to the user. Explain the game(s) naturally according to their popularity rank. Do not output a table of numbers or counts.
- If the user asks about a specific game, focus your response on that game. Only mention other games if the user explicitly asked for a comparison or recommendation.
- If (and only if) the user asks to compare or list games, start your answer by naming the exact games being compared: ${gameNames}. For broad compare/list requests, compare every game listed in this catalog context.
- For recommendation questions, answer with: 1) best pick, 2) why it fits, 3) one alternative when useful.
- If a specific detail is missing, say "I do not have confirmed details about that specific feature" and still answer using the known catalog facts. Do not answer only with "I don't have enough information" when at least one relevant game is in context.
- Keep responses concise by default. Use tables only for direct comparisons or ranking questions.
- Do not say "I only have information about one game" when Available game count is greater than 1.
- Do not redirect the user to search or category filters instead of comparing these games.
- Do not say "I don't have the full catalog".
- Do not repeat game details multiple times. Provide one clean, concise explanation per game.

Catalog records:

${catalogContext}

User question:
${query}`;
};
