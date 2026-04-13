import { getApiClient } from "@/lib/apiClientFactory";
import type {
  AiWarzoneAgent,
  AiWarzoneArenaCreateRequest,
  AiWarzoneArenaJoinRequest,
  AiWarzoneArenaMatch,
  AiWarzoneArenaMatchDetail,
  AiWarzoneArenaMatchesResponse,
  AiWarzoneBehaviorStatus,
  AiWarzoneCreateAgentRequest,
  AiWarzoneCreateEscrowRequest,
  AiWarzoneEscrowResponse,
  AiWarzoneFundAgentRequest,
  AiWarzoneFundAgentResponse,
  AiWarzoneGetAgentResponse,
  AiWarzoneZeroGBackendWallet,
  AiWarzoneZeroGStatus,
} from "@/types/aiWarzone";

const http = () => getApiClient("aiWarzone");

export const aiWarzoneApi = {
  http,

  /**
   * GET /agent?walletAddress=
   * Resolves for both 200 (found) and 404 (not found) without throwing.
   */
  getAgentByWallet: async (walletAddress: string): Promise<AiWarzoneGetAgentResponse> => {
    const res = await http().get<AiWarzoneGetAgentResponse>("/agent", {
      params: { walletAddress },
      validateStatus: (status) => status === 200 || status === 404,
    });
    return res.data;
  },

  createAgent: async (body: AiWarzoneCreateAgentRequest): Promise<AiWarzoneAgent> => {
    const { data } = await http().post<AiWarzoneAgent>("/agent/create", body);
    return data;
  },
  fundAgent: async (body: AiWarzoneFundAgentRequest): Promise<AiWarzoneFundAgentResponse> => {
    const { data } = await http().post<AiWarzoneFundAgentResponse>("/agent/fund", body);
    return data;
  },
  /** POST /arena/create — create open arena match */
  createArenaMatch: async (body: AiWarzoneArenaCreateRequest): Promise<AiWarzoneArenaMatch> => {
    const { data } = await http().post<AiWarzoneArenaMatch>("/arena/create", body);
    return data;
  },

  /** POST /arena/join — join existing arena match */
  joinArenaMatch: async (body: AiWarzoneArenaJoinRequest): Promise<AiWarzoneArenaMatch> => {
    const { data } = await http().post<AiWarzoneArenaMatch>("/arena/join", body);
    return data;
  },

  /** GET /arena/matches — list available/active matches for matchmaking explorer */
  getArenaMatches: async (): Promise<AiWarzoneArenaMatchesResponse> => {
    const { data } = await http().get<AiWarzoneArenaMatchesResponse>("/arena/matches");
    return data;
  },

  /** GET /arena/match?matchId= — single match detail */
  getArenaMatch: async (matchId: string): Promise<AiWarzoneArenaMatchDetail> => {
    const { data } = await http().get<AiWarzoneArenaMatchDetail>("/arena/match", {
      params: { matchId },
    });
    return data;
  },

  /** GET /behavior/status/:wallet — samples, model status, 0G explorer link */
  getBehaviorStatus: async (walletAddress: string): Promise<AiWarzoneBehaviorStatus> => {
    const { data } = await http().get<AiWarzoneBehaviorStatus>(
      `/behavior/status/${encodeURIComponent(walletAddress)}`
    );
    return data;
  },

  /** GET /0g/status/:wallet — on-chain storage + download URLs */
  getZeroGStatus: async (walletAddress: string): Promise<AiWarzoneZeroGStatus> => {
    const { data } = await http().get<AiWarzoneZeroGStatus>(
      `/0g/status/${encodeURIComponent(walletAddress)}`
    );
    return data;
  },

  /** GET /0g/wallet — backend funding wallet (same service; used for ops dashboard card) */
  getZeroGBackendWallet: async (): Promise<AiWarzoneZeroGBackendWallet> => {
    const { data } = await http().get<AiWarzoneZeroGBackendWallet>("/0g/wallet");
    return data;
  },
};
