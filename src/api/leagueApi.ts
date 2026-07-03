import axios from "axios";
import { getApiClient } from "@/lib/apiClientFactory";

/**
 * Client for `/v1/league/*` on the AI Arena gateway (services/league-service
 * in the 0g-AIArena repo). Types mirror that service's DTOs exactly
 * (services/league-service/src/types/dto.types.ts) — kept in sync manually
 * since the two repos don't share a types package.
 */
const http = () => getApiClient("aiArenaGateway");

async function getOrNull<T>(path: string, params?: Record<string, unknown>): Promise<T | null> {
  try {
    const { data } = await http().get<T>(path, { params });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export type LeagueTribe = "NEXUS_01" | "SHADOW_9" | "ATHENA" | "VOIDWALKER";
export type LeagueStage = "GROUP" | "ROUND_OF_32" | "ROUND_OF_16" | "QUARTER_FINAL" | "SEMI_FINAL" | "THIRD_PLACE" | "FINAL";
export type LeagueMatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
export type PredictionOutcome = "HOME" | "AWAY" | "DRAW";
export type ConvictionLevel = "LOW" | "MEDIUM" | "HIGH";
export type LeagueBattleStatus = "PENDING" | "ACCEPTED" | "LOCKED" | "SETTLED" | "VOID" | "DECLINED";

export interface MeSummary {
  kpBalance: number;
  kpWeekly: number;
  kpWeeklyTarget: number;
  globalRank: number | null;
  dayStreak: number;
  factionId: LeagueTribe | null;
}

export interface UserAgentPick {
  agentId: string;
  agentName: string;
  conviction: ConvictionLevel;
  scoreHome: number;
  scoreAway: number;
  predictedWinner: PredictionOutcome;
}

export interface ConsensusDTO {
  homePct: number;
  awayPct: number;
  drawPct: number;
}

export interface MatchSummary {
  id: string;
  home: string;
  away: string;
  stage: LeagueStage;
  matchday: number | null;
  venue: string | null;
  kickoffAt: string;
  status: LeagueMatchStatus;
  isLive: boolean;
  homeScore: number | null;
  awayScore: number | null;
  liveMinute: number | null;
  predictionPool: number;
  totalAgentBets: number;
  consensus: ConsensusDTO;
  userAgentPick: UserAgentPick | null;
}

export interface MatchListItem {
  id: string;
  home: string;
  away: string;
  stage: LeagueStage;
  matchday: number | null;
  venue: string | null;
  kickoffAt: string;
  status: LeagueMatchStatus;
}

export interface LeaguePredictionQuestionAgent {
  agentName: string;
  pick: string;
  stake: number;
  confidence: number;
}

export interface LeaguePredictionQuestion {
  id: string;
  category: string;
  question: string;
  agentA: LeaguePredictionQuestionAgent;
  agentB: LeaguePredictionQuestionAgent;
}

export interface AgentBet {
  agentId: string;
  agentName: string;
  winner: PredictionOutcome;
  scoreHome: number;
  scoreAway: number;
  conviction: ConvictionLevel;
  reasoning: string | null;
}

export interface MatchDetail extends MatchSummary {
  questions: LeaguePredictionQuestion[];
  agentBets: AgentBet[];
}

export interface TodayPrediction {
  agentName: string;
  quote: string;
  confidence: number;
  pick: string;
}

export interface RecentPick {
  id: string;
  home: string;
  away: string;
  pick: string;
  confidence: number;
  result: string;
  outcome: "WIN" | "LOSS" | "DRAW";
  kpEarned: number;
}

export interface Rivalry {
  leftAgentId: string;
  leftAgentName: string;
  rightAgentId: string;
  rightAgentName: string;
  leftWins: number;
  rightWins: number;
  reputationReward: number;
  kpReward: number;
  narrative: string | null;
}

export interface LineupRow {
  agentId: string;
  agentName: string;
  tribe: LeagueTribe;
  reputation: number;
  record: string;
  balanceArena: number;
}

export interface OpenBattle {
  id: string;
  matchId: string;
  challengerAgentId: string;
  challengerAgentName: string;
  opponentAgentId: string;
  opponentAgentName: string;
  title: string;
  stakeArena: number;
  status: LeagueBattleStatus;
}

export interface ReputationLeaderboardRow {
  rank: number;
  agentId: string;
  agentName: string;
  reputation: number;
  record: string;
  streak: number;
}

export interface KpLeaderboardRow {
  rank: number;
  userId: string;
  kpWeekly: number;
  kpBalance: number;
}

export interface LeagueMoment {
  id: string;
  agentName: string;
  agentImg: string;
  text: string;
  kp?: number;
}

export const leagueApi = {
  /** GET /v1/league/me/summary — auth required. Powers the KP week-progress sidebar. */
  getMeSummary: async (): Promise<MeSummary> => {
    const { data } = await http().get<MeSummary>("/v1/league/me/summary");
    return data;
  },

  /** GET /v1/league/matches/featured — public. Returns null if no featured match is live/scheduled yet. */
  getFeaturedMatch: async (): Promise<MatchSummary | null> => getOrNull<MatchSummary>("/v1/league/matches/featured"),

  /** GET /v1/league/matches/:matchId — public, includes derived prediction questions + agent bets. */
  getMatchDetail: async (matchId: string): Promise<MatchDetail> => {
    const { data } = await http().get<MatchDetail>(`/v1/league/matches/${encodeURIComponent(matchId)}`);
    return data;
  },

  /**
   * POST /v1/league/predictions/:matchId/:agentId/generate — auth required, must own agentId.
   * Triggers the agent's AI to generate (or return its existing) prediction for this match.
   * Rate-limited server-side to 5/min per user.
   */
  generatePrediction: async (matchId: string, agentId: string): Promise<void> => {
    await http().post(`/v1/league/predictions/${encodeURIComponent(matchId)}/${encodeURIComponent(agentId)}/generate`);
  },

  /** GET /v1/league/matches?status=&stage=&page=&limit= — public. */
  listMatches: async (params: {
    status?: LeagueMatchStatus;
    stage?: LeagueStage;
    page?: number;
    limit?: number;
  } = {}): Promise<{ matches: MatchListItem[]; total: number }> => {
    const { data } = await http().get<{ matches: MatchListItem[]; total: number }>("/v1/league/matches", { params });
    return { matches: data.matches ?? [], total: data.total ?? 0 };
  },

  /** GET /v1/league/predictions/today?limit= — public. */
  getTodayPredictions: async (limit = 10): Promise<TodayPrediction[]> => {
    const { data } = await http().get<TodayPrediction[]>("/v1/league/predictions/today", { params: { limit } });
    return data ?? [];
  },

  /** GET /v1/league/me/predictions?limit= — auth required. Settled predictions only. */
  getMyRecentPicks: async (limit = 10): Promise<RecentPick[]> => {
    const { data } = await http().get<RecentPick[]>("/v1/league/me/predictions", { params: { limit } });
    return data ?? [];
  },

  /** GET /v1/league/rivalries/featured — optional auth (prefers the caller's own rivalry). Returns null if none exists yet. */
  getFeaturedRivalry: async (): Promise<Rivalry | null> => getOrNull<Rivalry>("/v1/league/rivalries/featured"),

  /** GET /v1/league/me/agents — auth required. The caller's League-enrolled agents (a.k.a. "Your Lineup"). */
  getMyLineup: async (): Promise<LineupRow[]> => {
    const { data } = await http().get<LineupRow[]>("/v1/league/me/agents");
    return data ?? [];
  },

  /** GET /v1/league/battles/open?limit= — public. Pending agent-vs-agent prediction battles. */
  getOpenBattles: async (limit = 10): Promise<OpenBattle[]> => {
    const { data } = await http().get<OpenBattle[]>("/v1/league/battles/open", { params: { limit } });
    return data ?? [];
  },

  /** GET /v1/league/leaderboard?scope=global — public. Reputation-ranked, no tribe filter. */
  getGlobalLeaderboard: async (limit = 50): Promise<ReputationLeaderboardRow[]> => {
    const { data } = await http().get<ReputationLeaderboardRow[]>("/v1/league/leaderboard", {
      params: { scope: "global", limit },
    });
    return data ?? [];
  },

  /** GET /v1/league/leaderboard?scope=faction&tribe= — public. */
  getFactionLeaderboard: async (tribe: LeagueTribe, limit = 50): Promise<ReputationLeaderboardRow[]> => {
    const { data } = await http().get<ReputationLeaderboardRow[]>("/v1/league/leaderboard", {
      params: { scope: "faction", tribe, limit },
    });
    return data ?? [];
  },

  /** GET /v1/league/leaderboard?scope=weekly — public. KP-ranked. */
  getWeeklyKpLeaderboard: async (limit = 50): Promise<KpLeaderboardRow[]> => {
    const { data } = await http().get<KpLeaderboardRow[]>("/v1/league/leaderboard", {
      params: { scope: "weekly", limit },
    });
    return data ?? [];
  },

  /** GET /v1/league/moments?limit=&agentId= — public. */
  getMoments: async (limit = 10, agentId?: string): Promise<LeagueMoment[]> => {
    const { data } = await http().get<LeagueMoment[]>("/v1/league/moments", { params: { limit, agentId } });
    return data ?? [];
  },
};
