import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/api/utils";
import type { ApiEnvelope } from "@/types/api";

export type TitleType = "GOLDEN_FOUNDER" | "VIP_GROWTH_MEMBER";

export interface PlayerTitle {
  type: TitleType;
  grantedAt: string;
}

export interface PlayerTitlesResponse {
  walletAddress: string;
  hasTitles: boolean;
  titles: PlayerTitle[];
}

export const playerTitlesApi = {
  getTitles: async (walletAddress: string): Promise<PlayerTitlesResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<PlayerTitlesResponse>>(
      `/player-titles/${encodeURIComponent(walletAddress)}`,
    );
    return unwrapApiData(data);
  },
};
