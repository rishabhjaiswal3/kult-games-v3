import { getApiClient } from "@/lib/apiClientFactory";
import type {
  AiWarzoneAgent,
  AiWarzoneCreateAgentRequest,
  AiWarzoneCreateEscrowRequest,
  AiWarzoneEscrowResponse,
  AiWarzoneFundAgentRequest,
  AiWarzoneFundAgentResponse,
  AiWarzoneGetAgentResponse,
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
  createEscrow: async (body: AiWarzoneCreateEscrowRequest): Promise<AiWarzoneEscrowResponse> => {
    const { data } = await http().post<AiWarzoneEscrowResponse>("/arena/escrow", body);
    return data;
  },
};
