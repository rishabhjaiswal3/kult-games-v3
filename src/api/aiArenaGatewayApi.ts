import { getApiClient } from "@/lib/apiClientFactory";
import type {
  AiArenaAuthMeResponse,
  AiArenaBattleResponse,
  AiArenaCreateAgentRequest,
  AiArenaCreateAgentResponse,
  AiArenaFinancialDepositRequest,
  AiArenaFinancialWithdrawalRequest,
  AiArenaGlobalLeaderboardResponse,
  AiArenaAgentWalletResponse,
  AiArenaListAgentsResponse,
  AiArenaMatchmakingStatusResponse,
} from "@/types/aiArenaGateway";

const http = () => getApiClient("aiArenaGateway");

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

  /** GET /v1/auth/me (requires AI Arena JWT) */
  getAuthMe: async (): Promise<AiArenaAuthMeResponse> => {
    const { data } = await http().get<AiArenaAuthMeResponse>("/v1/auth/me");
    return data;
  },

  /** GET /v1/agents?page=&pageSize= (requires AI Arena JWT) */
  getMyAgents: async (page = 1, pageSize = 20): Promise<AiArenaListAgentsResponse> => {
    const { data } = await http().get<AiArenaListAgentsResponse>("/v1/agents", {
      params: { page, pageSize },
    });
    return data;
  },

  /** POST /v1/agents (requires AI Arena JWT) */
  createAgent: async (body: AiArenaCreateAgentRequest) => {
    const { data } = await http().post<AiArenaCreateAgentResponse>("/v1/agents", body);
    return data.agent;
  },

  /** POST /v1/financial/deposits (requires AI Arena JWT) */
  depositToAgentWallet: async (body: AiArenaFinancialDepositRequest) => {
    const { data } = await http().post("/v1/financial/deposits", body);
    return data;
  },

  /** GET /v1/financial/wallets/:agentId (requires AI Arena JWT) */
  getAgentWalletBalance: async (agentId: string): Promise<AiArenaAgentWalletResponse> => {
    const { data } = await http().get<AiArenaAgentWalletResponse>(
      `/v1/financial/wallets/${encodeURIComponent(agentId)}`
    );
    return data;
  },

  /** POST /v1/financial/withdrawals (requires AI Arena JWT) */
  requestWithdrawal: async (body: AiArenaFinancialWithdrawalRequest) => {
    const { data } = await http().post("/v1/financial/withdrawals", body);
    return data;
  },

  /** GET /v1/matchmaking/status/:agentId (requires AI Arena JWT) */
  getMatchmakingStatus: async (agentId: string): Promise<AiArenaMatchmakingStatusResponse> => {
    const { data } = await http().get<AiArenaMatchmakingStatusResponse>(
      `/v1/matchmaking/status/${encodeURIComponent(agentId)}`
    );
    return data;
  },
};
