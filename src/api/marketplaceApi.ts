import apiClient from "@/lib/apiClient";
import type {
  MarketplaceCreateOrderRequest,
  MarketplaceListingsResponse,
  MarketplaceOrder,
} from "@/types/api";

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
  createOrder: async (payload: MarketplaceCreateOrderRequest): Promise<MarketplaceOrder> => {
    const { data } = await apiClient.post<ApiEnvelope<MarketplaceOrder>>("/marketplace/orders", {
      listingId: payload.listingId,
      quantity: payload.quantity ?? 1,
      txHash: payload.txHash,
    });
    return data.data;
  },
};
