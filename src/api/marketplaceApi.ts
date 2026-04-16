import apiClient from "@/lib/apiClient";
import type { MarketplaceListingsResponse } from "@/types/api";

interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
}

export type GetMarketplaceListingsParams = {
  gameIdentification?: string;
  category?: string;
  page?: number;
  perPage?: number;
};

export const marketplaceApi = {
  getListings: async (params: GetMarketplaceListingsParams = {}): Promise<MarketplaceListingsResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<MarketplaceListingsResponse>>("/marketplace", {
      params: {
        gameIdentification: params.gameIdentification,
        category: params.category,
        page: params.page ?? 1,
        perPage: params.perPage ?? 20,
      },
    });
    return data.data;
  },
};
