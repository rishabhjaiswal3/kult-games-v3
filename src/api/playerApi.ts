import apiClient, { TOKEN_KEY, WALLET_KEY } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse, Player, UpdateNameRequest } from "@/types/api";

export const playerApi = {
  login: async (walletAddress: string): Promise<LoginResponse> => {
    const body: LoginRequest = { walletAddress };
    const { data } = await apiClient.post<LoginResponse>("/player/login", body);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(WALLET_KEY, walletAddress);
    return data;
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
