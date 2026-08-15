import warzoneTrashTalkImageUrl from "@/assets/trash-talk.webp";
import robowarTrashTalkImageUrl from "@/assets/trash-talk-robowar.webp";
import highwayTrashTalkImageUrl from "@/assets/trash-talk-highway-hustle.webp";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaGameId } from "@/constants/aiArenaMatchmaking";
import {
  MOMENTS_ARENA_GAME_ID_QUERY_PARAM,
  MOMENTS_BATTLE_ID_QUERY_PARAM,
  MOMENTS_CREATE_QUERY_PARAM,
  MOMENTS_MY_AGENT_ID_QUERY_PARAM,
} from "@/constants/moments";
import type { AiArenaAgent, AiArenaBattle } from "@/types/aiArenaGateway";

export type BattleOutcome = "WIN" | "LOSS";

export type BattleTrashTalkDraft = {
  title: string;
  description: string;
  relatedGameSlugs: string[];
  tags: string[];
  imageFile: File;
  previewUrl: string;
  outcome: BattleOutcome;
  /** Battle still in progress, commentary will be filled when the match ends. */
  pendingCommentary?: boolean;
};

type ArenaTrashTalkGameConfig = {
  arenaGameId: AiArenaGameId;
  title: string;
  relatedGameSlug: string;
  imageUrl: string;
  imageFileName: string;
  gameName: string;
  endReason: string;
  clashNoun: string;
};

const ARENA_TRASH_TALK_GAMES: Record<AiArenaGameId, ArenaTrashTalkGameConfig> = {
  warzone: {
    arenaGameId: "warzone",
    title: "WarzoneWarriors Trash Talk",
    relatedGameSlug: "warzonewarriors",
    imageUrl: warzoneTrashTalkImageUrl,
    imageFileName: "trash-talk-warzone.webp",
    gameName: "Warzone Warriors",
    endReason: "death",
    clashNoun: "Warzone clash",
  },
  robowar: {
    arenaGameId: "robowar",
    title: "Robowars Trash Talk",
    relatedGameSlug: "robowars",
    imageUrl: robowarTrashTalkImageUrl,
    imageFileName: "trash-talk-robowar.webp",
    gameName: "Robowar",
    endReason: "robowar-battle-end",
    clashNoun: "Robowar duel",
  },
  "highway-hustle": {
    arenaGameId: "highway-hustle",
    title: "Highway Hustle Trash Talk",
    relatedGameSlug: "highwayhustle",
    imageUrl: highwayTrashTalkImageUrl,
    imageFileName: "trash-talk-highway-hustle.webp",
    gameName: "Highway Hustle",
    endReason: "highway-hustle-crash",
    clashNoun: "Highway Hustle race",
  },
};

export function normalizeArenaGameId(value: string | null | undefined): AiArenaGameId {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "robowar" || normalized === "robowars") return "robowar";
  if (normalized === "highway-hustle" || normalized === "highwayhustle" || normalized.includes("highway")) {
    return "highway-hustle";
  }
  return "warzone";
}

export function resolveArenaTrashTalkGameConfig(input: {
  arenaGameId?: string | null;
  battle?: Pick<AiArenaBattle, "gameId"> | null;
}): ArenaTrashTalkGameConfig {
  const fromInput = input.arenaGameId?.trim();
  const fromBattle = input.battle?.gameId?.trim();
  return ARENA_TRASH_TALK_GAMES[normalizeArenaGameId(fromInput || fromBattle)];
}

export function buildTrashTalkMomentPath(
  battleId: string,
  myAgentId: string,
  arenaGameId?: string | null,
): string {
  const params = new URLSearchParams({
    [MOMENTS_CREATE_QUERY_PARAM]: "true",
    [MOMENTS_BATTLE_ID_QUERY_PARAM]: battleId,
    [MOMENTS_MY_AGENT_ID_QUERY_PARAM]: myAgentId,
  });
  if (arenaGameId?.trim()) {
    params.set(MOMENTS_ARENA_GAME_ID_QUERY_PARAM, normalizeArenaGameId(arenaGameId));
  }
  return `/moments?${params.toString()}`;
}

export class BattleTrashTalkError extends Error {
  constructor(
    message: string,
    readonly code: "battle_incomplete" | "not_participant" | "no_commentary" | "fetch_failed",
  ) {
    super(message);
    this.name = "BattleTrashTalkError";
  }
}

function battleDurationSeconds(battle: AiArenaBattle): number {
  if (battle.startedAt && battle.endedAt) {
    const ms = new Date(battle.endedAt).getTime() - new Date(battle.startedAt).getTime();
    if (Number.isFinite(ms) && ms > 0) return Math.max(1, Math.round(ms / 1000));
  }
  return 60;
}

async function loadTrashTalkImageFile(config: ArenaTrashTalkGameConfig): Promise<{ file: File; previewUrl: string }> {
  const response = await fetch(config.imageUrl);
  if (!response.ok) throw new BattleTrashTalkError("Could not load trash talk artwork.", "fetch_failed");

  const blob = await response.blob();
  const file = new File([blob], config.imageFileName, { type: blob.type || "image/png" });
  return { file, previewUrl: URL.createObjectURL(file) };
}

async function findStoredCommentary(
  agentId: string,
  battleId: string,
  outcome: BattleOutcome,
): Promise<string | null> {
  const { memories } = await aiArenaGatewayApi.getAgentMemories(agentId, 1, 100);
  const outcomeMemory = memories.find(
    (memory) =>
      memory.metadata?.battleId === battleId &&
      String(memory.metadata?.outcome ?? "").toUpperCase() === outcome,
  );
  if (outcomeMemory?.content?.trim()) return outcomeMemory.content.trim();

  const battleMemory = memories.find((memory) => memory.metadata?.battleId === battleId);
  return battleMemory?.content?.trim() || null;
}

function pickCommentaryFromResponse(
  response: { commentary?: string; winnerCommentary?: string; loserCommentary?: string },
  outcome: BattleOutcome,
): string | null {
  if (outcome === "WIN") {
    return response.winnerCommentary?.trim() || response.commentary?.trim() || null;
  }
  return response.loserCommentary?.trim() || response.commentary?.trim() || null;
}

async function generateCommentaryForOutcome(
  battleId: string,
  battle: AiArenaBattle,
  winnerId: string,
  loserId: string,
  outcome: BattleOutcome,
  config: ArenaTrashTalkGameConfig,
): Promise<string | null> {
  const [winner, loser] = await Promise.all([
    aiArenaGatewayApi.getAgentById(winnerId),
    aiArenaGatewayApi.getAgentById(loserId),
  ]);

  const response = await aiArenaGatewayApi.generateBattleCommentary({
    battleId,
    winnerName: winner.name,
    winnerArchetype: winner.archetype,
    winnerClan: winner.clan,
    winnerElo: winner.eloRating,
    winnerHpPercent: 100,
    loserName: loser.name,
    loserArchetype: loser.archetype,
    loserClan: loser.clan,
    loserElo: loser.eloRating,
    loserHpPercent: 0,
    durationSeconds: battleDurationSeconds(battle),
    endReason: config.endReason,
    gameName: config.gameName,
    perspective: outcome === "WIN" ? "WINNER" : "LOSER",
  });

  return pickCommentaryFromResponse(response, outcome);
}

function fallbackCommentary(
  outcome: BattleOutcome,
  participant: AiArenaAgent,
  opponent: AiArenaAgent,
  durationSeconds: number,
  config: ArenaTrashTalkGameConfig,
): string {
  if (outcome === "WIN") {
    return `${participant.name} dominated ${opponent.name} in a ${durationSeconds}s ${config.clashNoun}, victory secured.`;
  }
  return `${participant.name} fell to ${opponent.name} after a ${durationSeconds}s ${config.clashNoun}, the trash talk writes itself.`;
}

function buildTrashTalkTags(outcome: BattleOutcome, config: ArenaTrashTalkGameConfig): string[] {
  const base = ["trashtalk", config.relatedGameSlug];
  return outcome === "WIN" ? [...base, "aivictory"] : [...base, "aidefeat"];
}

function resolveParticipantAgentId(
  battle: AiArenaBattle,
  myAgents: AiArenaAgent[],
  myAgentId?: string | null,
): string | null {
  const battleAgentIds = battle.agentIds ?? [];
  if (myAgentId && battleAgentIds.includes(myAgentId)) return myAgentId;

  const ownedIds = new Set(myAgents.map((agent) => agent.id));
  return battleAgentIds.find((id) => ownedIds.has(id)) ?? null;
}

function buildPendingDraft(config: ArenaTrashTalkGameConfig, file: File, previewUrl: string): BattleTrashTalkDraft {
  return {
    title: config.title,
    description: "",
    relatedGameSlugs: [config.relatedGameSlug],
    tags: buildTrashTalkTags("WIN", config),
    imageFile: file,
    previewUrl,
    outcome: "WIN",
    pendingCommentary: true,
  };
}

export async function resolveBattleTrashTalkDraft(input: {
  battleId: string;
  myAgentId?: string | null;
  arenaGameId?: string | null;
}): Promise<BattleTrashTalkDraft> {
  const battleId = input.battleId.trim();
  if (!battleId) {
    throw new BattleTrashTalkError("Missing battle id.", "fetch_failed");
  }

  let battle: AiArenaBattle;
  try {
    battle = (await aiArenaGatewayApi.getBattle(battleId)).battle;
  } catch {
    throw new BattleTrashTalkError("Could not load this battle.", "fetch_failed");
  }

  const config = resolveArenaTrashTalkGameConfig({
    arenaGameId: input.arenaGameId,
    battle,
  });

  const winnerId = battle.result?.winnerId?.trim();
  const loserId = battle.result?.loserId?.trim();
  if (!winnerId || !loserId || battle.status !== "COMPLETED") {
    const { file, previewUrl } = await loadTrashTalkImageFile(config);
    return buildPendingDraft(config, file, previewUrl);
  }

  let myAgents: AiArenaAgent[] = [];
  try {
    myAgents = (await aiArenaGatewayApi.getMyAgentsFromMine(1, 50)).agents ?? [];
  } catch {
    myAgents = [];
  }

  const participantAgentId = resolveParticipantAgentId(battle, myAgents, input.myAgentId);
  if (!participantAgentId) {
    throw new BattleTrashTalkError("You do not have an agent in this battle.", "not_participant");
  }

  const outcome: BattleOutcome = participantAgentId === winnerId ? "WIN" : "LOSS";
  const opponentId = outcome === "WIN" ? loserId : winnerId;

  let commentary =
    (await findStoredCommentary(participantAgentId, battleId, outcome)) ??
    (await generateCommentaryForOutcome(battleId, battle, winnerId, loserId, outcome, config).catch(() => null));

  if (!commentary) {
    try {
      const [participant, opponent] = await Promise.all([
        aiArenaGatewayApi.getAgentById(participantAgentId),
        aiArenaGatewayApi.getAgentById(opponentId),
      ]);
      commentary = fallbackCommentary(outcome, participant, opponent, battleDurationSeconds(battle), config);
    } catch {
      throw new BattleTrashTalkError("No commentary is available for this battle yet.", "no_commentary");
    }
  }

  const { file, previewUrl } = await loadTrashTalkImageFile(config);

  return {
    title: config.title,
    description: commentary,
    relatedGameSlugs: [config.relatedGameSlug],
    tags: buildTrashTalkTags(outcome, config),
    imageFile: file,
    previewUrl,
    outcome,
  };
}
