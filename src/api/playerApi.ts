import apiClient, { TOKEN_KEY, WALLET_KEY } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse, Player, UpdateNameRequest } from "@/types/api";

export const playerApi = {
  login: async (walletAddress: string): Promise<LoginResponse> => {
    const body: LoginRequest = { walletAddress };
    const { data } = await apiClient.post<any>("/player/login", body);
    // Support both flat { token, player } and wrapped { data: { token, player } }
    const token: string = data.token ?? data.data?.token ?? "";
    const player = data.player ?? data.data?.player ?? null;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(WALLET_KEY, walletAddress);
    }
    return { token, player } as LoginResponse;
  },

  getProfile: async (): Promise<Player> => {
    const { data } = await apiClient.get<Player>("/player/profile");
    return data;
  },

  updateName: async (name: string): Promise<Player> => {
    const body: UpdateNameRequest = { name };
    const { data } = await apiClient.patch<Player>("/player/name", body);
    return data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WALLET_KEY);
  },
};
