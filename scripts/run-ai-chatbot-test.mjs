import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const OUTPUT_FILE = resolve(PROJECT_ROOT, process.env.AI_TEST_OUTPUT ?? "aitesting.txt");
const ASSISTANT_PUBLIC_PATH = "/assistant/v1/chat";

const CORE_QUESTIONS = [
  "What is KULT GAMES?",
  "What can I do on the KULT GAMES platform?",
  "How do I find a game to play?",
  "What games are available on KULT GAMES?",
  "Compare games for me.",
  "Pick a game based on my vibe.",
  "Find my first game.",
  "What's trending on 0G?",
  "Which game is best for a short break?",
  "Which game should I play if I like puzzles?",
  "Which game should I play if I like racing?",
  "Which game should I play if I like action?",
  "Which game is good for beginners?",
  "Which game is better for competitive players?",
  "Which game has the fastest gameplay?",
  "Which game is best for strategy?",
  "Which game is best for reflex training?",
  "Which game should I play if I like arcade games?",
  "Compare Guess the AI and Highway Hustle.",
  "Compare Robo Wars and Warzone Warriors.",
  "Compare ZeroG Pool and ZeroDash.",
  "Compare Highway Hustle and Robo Wars.",
  "Tell me about Guess the AI.",
  "Tell me about Highway Hustle.",
  "Tell me about Robo Wars.",
  "Tell me about Warzone Warriors.",
  "Tell me about ZeroG Pool.",
  "Tell me about ZeroDash.",
  "What is the difference between ZeroG Pool and ZeroDash?",
  "What is the difference between Guess the AI and Robo Wars?",
  "Which game should I play if I want something calm?",
  "Which game should I play if I want something intense?",
  "Which game should I play if I want quick decision-making?",
  "Which game should I play if I want tactical combat?",
  "Which game should I play if I want precision and aim?",
  "Which game should I play if I want movement and dodging?",
  "Which games are arcade games?",
  "Which games are action games?",
  "Which games are puzzle games?",
  "Which games are racing games?",
  "Give me a ranked recommendation of games to try first.",
  "Give me a side-by-side comparison of the game categories.",
  "Give me a short summary of every game.",
  "Give me detailed information about every game.",
  "Recommend a game for someone new to Web3 gaming.",
  "Recommend a game for someone who likes fast matches.",
  "Recommend a game for someone who likes skill-based games.",
  "Recommend a game for someone who likes survival gameplay.",
  "Recommend a game for someone who likes robot battles.",
  "Recommend a game for someone who likes driving games.",
  "Which game has the most tactical vibe?",
  "Which game has the most casual vibe?",
  "Which game has the most competitive vibe?",
  "Which game has the most arcade vibe?",
  "Which game has the most puzzle vibe?",
  "Which game has the most racing vibe?",
  "What should I play if I only have five minutes?",
  "What should I play if I want to improve reaction speed?",
  "What should I play if I want to think carefully?",
  "What should I play if I want direct combat?",
  "What should I play if I want to compete with friends?",
  "What should I play if I want to chase high scores?",
  "How do categories help me choose a game?",
  "How should I choose between arcade and action games?",
  "How should I choose between racing and puzzle games?",
  "How should I choose between ZeroDash and Highway Hustle?",
  "How should I choose between Robo Wars and Warzone Warriors?",
  "How should I choose between Guess the AI and ZeroG Pool?",
  "Can you group the games by play style?",
  "Can you group the games by difficulty?",
  "Can you group the games by session length?",
  "Can you group the games by mood?",
  "Can you suggest a play order for all games?",
  "Can you suggest three games for a beginner?",
  "Can you suggest three games for an expert player?",
  "Can you suggest games for a chill mood?",
  "Can you suggest games for a high-energy mood?",
  "Can you suggest games for a tactical mood?",
  "Can you suggest games for a precision-focused player?",
  "Can you suggest games for someone who likes speed?",
  "Can you suggest games for someone who likes combat?",
  "Can you suggest games for someone who likes deduction?",
  "What are the strengths of Guess the AI?",
  "What are the strengths of Highway Hustle?",
  "What are the strengths of Robo Wars?",
  "What are the strengths of Warzone Warriors?",
  "What are the strengths of ZeroG Pool?",
  "What are the strengths of ZeroDash?",
  "What are the weaknesses or tradeoffs of Guess the AI?",
  "What are the weaknesses or tradeoffs of Highway Hustle?",
  "What are the weaknesses or tradeoffs of Robo Wars?",
  "What are the weaknesses or tradeoffs of Warzone Warriors?",
  "What are the weaknesses or tradeoffs of ZeroG Pool?",
  "What are the weaknesses or tradeoffs of ZeroDash?",
  "Give me a table comparing all games.",
  "Give me a recommendation if I like puzzle and strategy games.",
  "Give me a recommendation if I like action and arcade games.",
  "Give me a recommendation if I like speed and reflexes.",
  "Give me a recommendation if I like aim and precision.",
  "Give me a final top pick and explain why.",
];

const GAME_NAMES = ["Guess the AI", "Highway Hustle", "Robo Wars", "Warzone Warriors", "ZeroG Pool", "ZeroDash"];

const PLAYER_PROFILES = [
  "absolute beginners",
  "casual players",
  "competitive players",
  "puzzle fans",
  "racing fans",
  "action fans",
  "arcade fans",
  "strategy players",
  "reflex-focused players",
  "precision-focused players",
  "players with five minutes",
  "players who want longer sessions",
  "mobile players",
  "desktop players",
  "Web3 newcomers",
  "players who dislike complicated onboarding",
  "players who like leaderboards",
  "players who like progression",
  "players who like one-tap decisions",
  "players who like tactical choices",
  "players who want low stress",
  "players who want high intensity",
  "players who want replay value",
  "players who enjoy skill mastery",
  "players who like futuristic themes",
  "players who prefer simple rules",
  "players who enjoy quick retries",
  "players who like PvP energy",
  "players who enjoy solo practice",
  "players who want a first win quickly",
];

const MOODS = [
  "chill",
  "focused",
  "competitive",
  "curious",
  "high-energy",
  "tactical",
  "relaxed",
  "speedy",
  "patient",
  "experimental",
  "social",
  "solo",
  "confident",
  "newbie-friendly",
  "intense",
  "short-break",
  "late-night",
  "weekend",
  "practice",
  "challenge",
];

const FEATURES = [
  "leaderboards",
  "quick sessions",
  "difficulty options",
  "progression",
  "wallet connection",
  "on-chain elements",
  "free-to-play access",
  "mobile support",
  "desktop support",
  "competitive scoring",
  "beginner onboarding",
  "replay value",
  "skill expression",
  "short matches",
  "practice value",
  "visual style",
  "sound feedback",
  "controls",
  "events",
  "game modes",
];

const GAME_SPECIFIC_TOPICS = [
  "main objective",
  "best first mode",
  "learning curve",
  "strongest skill focus",
  "best beginner tip",
  "best advanced tip",
  "session length",
  "replay value",
  "competitive appeal",
  "casual appeal",
  "controls",
  "difficulty",
  "progression",
  "leaderboard value",
  "on-chain angle",
  "ideal player",
  "main tradeoff",
  "fastest way to improve",
  "best reason to try it",
  "when to skip it",
  "mobile suitability",
  "desktop suitability",
  "best mood",
  "core loop",
  "standout feature",
];

const SCENARIOS = [
  "I only have three minutes",
  "I want to warm up before a longer game",
  "I want to test my reaction time",
  "I want to think carefully instead of rushing",
  "I want to play something while commuting",
  "I want to compete on a leaderboard",
  "I want to avoid complicated setup",
  "I want a game that feels different from normal Web2 games",
  "I want to play without knowing much about crypto",
  "I want something I can replay many times",
  "I want something that rewards practice",
  "I want a game for a friend who is new to KULT",
  "I want something with simple controls",
  "I want something that feels skill-based",
  "I want something with action immediately",
  "I want something that is easy to explain",
  "I want something that can become competitive",
  "I want a game to play after work",
  "I want a game that does not need a long tutorial",
  "I want to try the most distinctive game first",
  "I want to try an on-chain game without pressure",
  "I want something that tests aim",
  "I want something that tests timing",
  "I want something that tests pattern recognition",
  "I want something with combat pressure",
  "I want something with racing pressure",
  "I want something with arcade pressure",
  "I want a calm first session",
  "I want a hard first session",
  "I want the most replayable option",
];

const getPairs = (items) => {
  const pairs = [];
  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      pairs.push([items[leftIndex], items[rightIndex]]);
    }
  }
  return pairs;
};

const buildAdditionalQuestions = () => {
  const existing = new Set(CORE_QUESTIONS.map((question) => question.toLowerCase()));
  const questions = [];
  const add = (question) => {
    const normalized = question.toLowerCase();
    if (existing.has(normalized)) return;
    existing.add(normalized);
    questions.push(question);
  };

  for (const game of GAME_NAMES) {
    for (const topic of GAME_SPECIFIC_TOPICS) {
      add(`For ${game}, explain the ${topic}.`);
    }
  }

  for (const game of GAME_NAMES) {
    for (const profile of PLAYER_PROFILES) {
      add(`Is ${game} a good choice for ${profile}?`);
    }
  }

  for (const game of GAME_NAMES) {
    for (const mood of MOODS) {
      add(`Would ${game} fit a ${mood} mood?`);
    }
  }

  for (const [left, right] of getPairs(GAME_NAMES)) {
    add(`Which should I choose between ${left} and ${right}?`);
    add(`Compare ${left} and ${right} for beginners.`);
    add(`Compare ${left} and ${right} for competitive players.`);
    add(`Compare ${left} and ${right} for short sessions.`);
    add(`Compare ${left} and ${right} by skill focus.`);
    add(`Compare ${left} and ${right} by replay value.`);
    add(`Compare ${left} and ${right} by learning curve.`);
    add(`If I can only try one, should I pick ${left} or ${right}?`);
  }

  for (const profile of PLAYER_PROFILES) {
    add(`Which KULT game is best for ${profile}?`);
    add(`Rank the catalog for ${profile}.`);
  }

  for (const mood of MOODS) {
    add(`Pick one KULT game for a ${mood} mood.`);
    add(`Give me two KULT games that match a ${mood} mood.`);
  }

  for (const feature of FEATURES) {
    add(`Which KULT games are strongest for ${feature}?`);
    add(`How important is ${feature} when choosing a KULT game?`);
  }

  for (const scenario of SCENARIOS) {
    add(`${scenario}. Which KULT game should I play?`);
    add(`${scenario}. Give me a ranked recommendation.`);
  }

  add("What is the safest first recommendation if the user gives no preferences?");
  add("What should the assistant say when it does not know a game detail?");
  add("How should the assistant avoid overclaiming about KULT games?");
  add("Give me a concise catalog summary for a first-time visitor.");
  add("Give me a friendly recommendation flow for choosing a game.");
  add("Which games should be described as fast-paced?");
  add("Which games should be described as tactical?");
  add("Which games should be described as precision-based?");
  add("Which games should be described as deduction-based?");
  add("Which games should be described as combat-focused?");
  add("Which games should be described as racing-focused?");
  add("Which games should be described as arcade-focused?");
  add("Which games should be described as beginner-friendly?");
  add("Which games should be described as expert-friendly?");
  add("What should I try after Guess the AI?");
  add("What should I try after Highway Hustle?");
  add("What should I try after Robo Wars?");
  add("What should I try after Warzone Warriors?");
  add("What should I try after ZeroG Pool?");
  add("What should I try after ZeroDash?");
  add("Create a three-step onboarding path for a new KULT player.");
  add("Create a three-game rotation for a competitive KULT player.");
  add("Create a three-game rotation for a casual KULT player.");
  add("Create a three-game rotation for someone who likes speed.");
  add("Create a three-game rotation for someone who likes strategy.");
  add("Create a three-game rotation for someone who likes action.");
  add("What is the best KULT game to recommend before asking follow-up questions?");
  add("What follow-up question should the assistant ask before recommending a game?");
  add("How can I choose a game using only my available time?");
  add("How can I choose a game using only my preferred difficulty?");

  return questions;
};

const QUESTION_TARGET_COUNT = 500;
const QUESTIONS = [...CORE_QUESTIONS, ...buildAdditionalQuestions()].slice(0, QUESTION_TARGET_COUNT);

if (QUESTIONS.length !== QUESTION_TARGET_COUNT) {
  throw new Error(`Expected ${QUESTION_TARGET_COUNT} AI test questions, received ${QUESTIONS.length}.`);
}

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const parseDotEnv = (filePath) => {
  if (!existsSync(filePath)) return {};

  const values = {};
  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    values[key] = rawValue.replace(/^["']|["']$/g, "");
  }
  return values;
};

const env = {
  ...parseDotEnv(resolve(PROJECT_ROOT, ".env")),
  ...process.env,
};

const getChatUrl = () => {
  if (env.KULT_AI_CHAT_URL) return env.KULT_AI_CHAT_URL;
  if (env.VITE_KULT_AI_API_URL) return env.VITE_KULT_AI_API_URL;
  if (env.VITE_API_URL) return `${trimTrailingSlash(env.VITE_API_URL)}${ASSISTANT_PUBLIC_PATH}`;
  return "https://kult-browser-rust-l2lwg.ondigitalocean.app/assistant/v1/chat";
};

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const decodeSsePayload = (payload) => payload.replace(/\\n/g, "\n");

const readErrorMessage = async (response) => {
  const fallback = `KULT AI request failed with ${response.status}.`;
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      return payload?.detail || payload?.error || payload?.message || fallback;
    }

    const text = (await response.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
};

const streamChatReply = async ({ chatUrl, question, userId, sessionId }) => {
  const response = await fetch(chatUrl, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      query: question,
      context: {},
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (!response.body) {
    throw new Error("KULT AI returned an empty response stream.");
  }

  const nextSessionId = response.headers.get("x-session-id") ?? sessionId;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let reply = "";
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

      let boundaryIndex = buffer.indexOf("\n\n");
      while (boundaryIndex !== -1) {
        const rawEvent = buffer.slice(0, boundaryIndex);
        buffer = buffer.slice(boundaryIndex + 2);

        const dataLines = rawEvent
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => (line.startsWith("data: ") ? line.slice(6) : line.slice(5)));

        for (const payload of dataLines) {
          if (payload === "[DONE]") {
            return { reply, sessionId: nextSessionId };
          }

          reply += decodeSsePayload(payload);
        }

        boundaryIndex = buffer.indexOf("\n\n");
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }

  return { reply, sessionId: nextSessionId };
};

const main = async () => {
  const chatUrl = getChatUrl();
  const limit = Number.parseInt(env.AI_TEST_LIMIT ?? `${QUESTIONS.length}`, 10);
  const delayMs = Number.parseInt(env.AI_TEST_DELAY_MS ?? "250", 10);
  const onlyQuestionNumber = Number.parseInt(env.AI_TEST_ONLY ?? "", 10);
  const selectedQuestions = Number.isFinite(onlyQuestionNumber)
    ? QUESTIONS.slice(onlyQuestionNumber - 1, onlyQuestionNumber)
    : QUESTIONS.slice(0, Number.isFinite(limit) ? limit : QUESTIONS.length);
  const questionOffset = Number.isFinite(onlyQuestionNumber) ? onlyQuestionNumber - 1 : 0;
  const userId = `ai-testing-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const lines = [
    "KULT AI Chatbot Testing Responses",
    `Generated at: ${startedAt}`,
    `Chat endpoint: ${chatUrl}`,
    `Question count: ${selectedQuestions.length}`,
    "",
  ];

  await mkdir(dirname(OUTPUT_FILE), { recursive: true });

  for (const [index, question] of selectedQuestions.entries()) {
    const questionNumber = questionOffset + index + 1;
    const sessionId = `${userId}-q${questionNumber}`;
    console.log(`[${questionNumber}/${selectedQuestions.length}] ${question}`);

    lines.push("=".repeat(88));
    lines.push(`Q${questionNumber}. ${question}`);
    lines.push("");
    lines.push("Answer:");

    try {
      const { reply } = await streamChatReply({
        chatUrl,
        question,
        userId,
        sessionId,
      });
      lines.push(reply.trim() || "[Empty response]");
    } catch (error) {
      lines.push(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
    }

    lines.push("");
    await writeFile(OUTPUT_FILE, `${lines.join("\n")}\n`, "utf8");
    if (delayMs > 0 && questionNumber < selectedQuestions.length) {
      await sleep(delayMs);
    }
  }

  console.log(`Done. Wrote ${selectedQuestions.length} responses to ${OUTPUT_FILE}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
