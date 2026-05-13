import axios from "axios";
import { getApiClient } from "@/lib/apiClientFactory";
import type {
  AiArenaAgent,
  AiArenaAgentEvolutionResponse,
  AiArenaAgentRankResponse,
  AiArenaBattleResponse,
  AiArenaCreateAgentRequest,
  AiArenaCreateAgentResponse,
  AiArenaFinancialDepositRequest,
  AiArenaFinancialWithdrawalRequest,
  AiArenaJoinMatchmakingRequest,
  AiArenaJoinMatchmakingResponse,
  AiArenaLeaveMatchmakingResponse,
  AiArenaDirectChallengeRequest,
  AiArenaDirectChallengeResponse,
  AiArenaGlobalLeaderboardResponse,
  AiArenaAgentWalletResponse,
  AiArenaListAgentsResponse,
  AiArenaMatchmakingStatusResponse,
  MyArenaAgentsResult,
  AiArenaProfileResponse,
} from "@/types/aiArenaGateway";

const http = () => getApiClient("aiArenaGateway");

const AGENTS_LIST_PAGE_SIZE = 100;
/** Safety cap when scanning public GET /v1/agents to build "mine" by userId. */
const AGENTS_LIST_MAX_PAGES = 250;

function parseAiArenaProfilePayload(data: unknown): AiArenaProfileResponse {
  if (data == null || typeof data !== "object") {
    throw new Error("Invalid profile response");
  }
  const d = data as Record<string, unknown>;
  const userObj =
    d.user != null && typeof d.user === "object" ? (d.user as Record<string, unknown>) : null;

  let userId = "";
  let walletAddress = "";
  let custodialSolanaAddress: string | null | undefined;
  let username: string | null | undefined;
  let email: string | null | undefined;
  let avatarUrl: string | null | undefined;
  let isActive: boolean | undefined;
  let createdAt: string | undefined;

  if (userObj) {
    userId = String(userObj.id ?? "");
    walletAddress = String(userObj.walletAddress ?? "");
    custodialSolanaAddress =
      userObj.custodialSolanaAddress == null ? undefined : String(userObj.custodialSolanaAddress);
    username = userObj.username as string | null | undefined;
    email = userObj.email as string | null | undefined;
    avatarUrl = userObj.avatarUrl as string | null | undefined;
    isActive = typeof userObj.isActive === "boolean" ? userObj.isActive : undefined;
    createdAt = userObj.createdAt != null ? String(userObj.createdAt) : undefined;
  } else {
    userId = String(d.userId ?? "");
    walletAddress = String(d.walletAddress ?? "");
    custodialSolanaAddress =
      d.custodialSolanaAddress == null ? undefined : String(d.custodialSolanaAddress);
  }

  let agents: AiArenaAgent[] | undefined;
  const topAgents = d.agents;
  const nestedAgents = userObj?.agents;
  if (Array.isArray(topAgents) && topAgents.length) {
    agents = topAgents as AiArenaAgent[];
  } else if (Array.isArray(nestedAgents) && nestedAgents.length) {
    agents = nestedAgents as AiArenaAgent[];
  }

  if (!userId || !walletAddress) {
    throw new Error("Profile response missing user identity");
  }

  return {
    userId,
    walletAddress,
    custodialSolanaAddress,
    username,
    email,
    avatarUrl,
    isActive,
    createdAt,
    agents,
  };
}

async function collectAgentsForUserId(userId: string): Promise<AiArenaAgent[]> {
  const client = http();
  const mine: AiArenaAgent[] = [];
  let page = 1;

  while (page <= AGENTS_LIST_MAX_PAGES) {
    const { data } = await client.get<AiArenaListAgentsResponse>("/v1/agents", {
      params: { page, pageSize: AGENTS_LIST_PAGE_SIZE },
    });
    const batch = data.agents ?? [];
    for (const a of batch) {
      if (a.userId === userId) mine.push(a);
    }
    if (batch.length < AGENTS_LIST_PAGE_SIZE) break;
    const total = data.total;
    if (typeof total === "number" && page >= Math.ceil(total / AGENTS_LIST_PAGE_SIZE)) break;
    page += 1;
  }

  return mine;
}

export const aiArenaGatewayApi = {
  /** GET /v1/leaderboards/global?limit= */
  getGlobalLeaderboard: async (limit = 20): Promise<AiArenaGlobalLeaderboardResponse> => {
    const { data } = await http().get<AiArenaGlobalLeaderboardResponse>("/v1/leaderboards/global", {
      params: { limit },
    });
    return data;
  },

  /** GET /v1/battles/:battleId */
  getBattle: async (battleId: string): Promise<AiArenaBattleResponse> => {
    const { data } = await http().get<AiArenaBattleResponse>(`/v1/battles/${encodeURIComponent(battleId)}`);
    return data;
  },

  /**
   * GET /v1/auth/me (AI Arena JWT). OSS gateway returns `{ user: { id, walletAddress, … } }`.
   * Falls back to GET /v1/users/me when /auth/me is missing (404).
   */
  getAuthMe: async (): Promise<AiArenaProfileResponse> => {
    const client = http();
    try {
      const { data } = await client.get<unknown>("/v1/auth/me");
      return parseAiArenaProfilePayload(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        const { data } = await client.get<unknown>("/v1/users/me");
        return parseAiArenaProfilePayload(data);
      }
      throw err;
    }
  },

  /** GET /v1/users/me (AI Arena JWT) — same normalized profile as getAuthMe on OSS. */
  getUsersMe: async (): Promise<AiArenaProfileResponse> => {
    const { data } = await http().get<unknown>("/v1/users/me");
    return parseAiArenaProfilePayload(data);
  },

  /**
   * Agents owned by the authenticated user — GET /v1/agents/mine only.
   * On failure returns an empty list with `mineOk: false` (no fallback).
   */
  getMyAgentsFromMine: async (page = 1, pageSize = 20): Promise<MyArenaAgentsResult> => {
    try {
      const { data } = await http().get<AiArenaListAgentsResponse>("/v1/agents/mine", {
        params: { page, pageSize },
      });
      return {
        agents: data.agents ?? [],
        mineOk: true,
      };
    } catch {
      return { agents: [], mineOk: false };
    }
  },

  /**
   * Agents owned by the authenticated user.
   * Prefers `GET /v1/agents/mine` (JWT-scoped). Falls back to profile embed or public list scan.
   */
  getMyAgents: async (page = 1, pageSize = 20): Promise<AiArenaListAgentsResponse> => {
    try {
      const { data } = await http().get<AiArenaListAgentsResponse>("/v1/agents/mine", {
        params: { page, pageSize },
      });
      return {
        agents: data.agents ?? [],
        page: data.page ?? page,
        pageSize: data.pageSize ?? pageSize,
        total: data.total ?? data.agents?.length ?? 0,
      };
    } catch (err) {
      if (!axios.isAxiosError(err) || err.response?.status !== 404) {
        throw err;
      }
    }

    const profile = await aiArenaGatewayApi.getAuthMe();
    let full: AiArenaAgent[];

    if (profile.agents?.length) {
      full = profile.agents;
    } else {
      full = await collectAgentsForUserId(profile.userId);
    }

    const start = (page - 1) * pageSize;
    return {
      agents: full.slice(start, start + pageSize),
      page,
      pageSize,
      total: full.length,
    };
  },

  /** GET /v1/agents/:agentId (gateway; may require JWT depending on deployment) */
  getAgentById: async (agentId: string): Promise<AiArenaAgent> => {
    const { data } = await http().get<{ agent: AiArenaAgent } | AiArenaAgent>(
      `/v1/agents/${encodeURIComponent(agentId)}`
    );
    if (data && typeof data === "object" && "agent" in data && data.agent) {
      return data.agent;
    }
    return data as AiArenaAgent;
  },

  /** GET /v1/agents/:agentId/evolution */
  getAgentEvolution: async (agentId: string): Promise<AiArenaAgentEvolutionResponse> => {
    const { data } = await http().get<AiArenaAgentEvolutionResponse>(
      `/v1/agents/${encodeURIComponent(agentId)}/evolution`
    );
    return data;
  },

  /** GET /v1/leaderboards/global/rank/:agentId */
  getLeaderboardRankForAgent: async (agentId: string): Promise<AiArenaAgentRankResponse> => {
    const { data } = await http().get<AiArenaAgentRankResponse>(
      `/v1/leaderboards/global/rank/${encodeURIComponent(agentId)}`
    );
    return data;
  },

  /** POST /v1/agents (requires AI Arena JWT) */
  createAgent: async (body: AiArenaCreateAgentRequest) => {
    const { data } = await http().post<AiArenaCreateAgentResponse>("/v1/agents", body);
    return data.agent;
  },

  /** POST /v1/wallets/deposits (requires AI Arena JWT) */
  depositToAgentWallet: async (body: AiArenaFinancialDepositRequest) => {
    const { data } = await http().post("/v1/wallets/deposits", body);
    return data;
  },

  /** GET /v1/wallets/:agentId (requires AI Arena JWT) */
  getAgentWalletBalance: async (agentId: string): Promise<AiArenaAgentWalletResponse> => {
    const { data } = await http().get<AiArenaAgentWalletResponse>(
      `/v1/wallets/${encodeURIComponent(agentId)}`
    );
    return data;
  },

  /** POST /v1/wallets/withdrawals (requires AI Arena JWT) */
  requestWithdrawal: async (body: AiArenaFinancialWithdrawalRequest) => {
    const { data } = await http().post("/v1/wallets/withdrawals", body);
    return data;
  },

  /** GET /v1/matchmaking/status/:agentId */
  getMatchmakingStatus: async (agentId: string): Promise<AiArenaMatchmakingStatusResponse> => {
    const { data } = await http().get<AiArenaMatchmakingStatusResponse>(
      `/v1/matchmaking/status/${encodeURIComponent(agentId)}`
    );
    return data;
  },

  /** POST /v1/matchmaking — join queue (x402 headers when mode is WAGER). */
  joinMatchmakingQueue: async (body: AiArenaJoinMatchmakingRequest): Promise<AiArenaJoinMatchmakingResponse> => {
    const headers: Record<string, string> = {};
    if (body.paymentTxHash) {
      headers["X-Payment-Tx-Hash"] = body.paymentTxHash;
      headers["X-Payment-Agent-Id"] = body.agentId;
    }
    const { paymentTxHash: _omit, ...payload } = body;
    const { data } = await http().post<AiArenaJoinMatchmakingResponse>("/v1/matchmaking", payload, { headers });
    return data;
  },

  /** DELETE /v1/matchmaking/:agentId — leave queue. */
  leaveMatchmakingQueue: async (agentId: string): Promise<AiArenaLeaveMatchmakingResponse> => {
    const { data } = await http().delete<AiArenaLeaveMatchmakingResponse>(
      `/v1/matchmaking/${encodeURIComponent(agentId)}`
    );
    return data;
  },

  /** POST /v1/matchmaking/match/direct — skip queue and create a battle. */
  directMatchmakingChallenge: async (
    body: AiArenaDirectChallengeRequest
  ): Promise<AiArenaDirectChallengeResponse> => {
    const { data } = await http().post<AiArenaDirectChallengeResponse>("/v1/matchmaking/match/direct", body);
    return data;
  },
};
