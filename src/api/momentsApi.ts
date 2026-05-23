import apiClient from "@/lib/apiClient";
import { isRecord, pickNumber, pickString, unwrapApiData } from "@/api/utils";
import type {
  ApiEnvelope,
  CreateMomentRequest,
  CreateMomentResponse,
  Moment,
  MomentDaEvent,
  MomentDaEventsResponse,
  MomentLikeResponse,
  MomentMutationResponse,
  MomentsFeedResponse,
  MomentZgProofResponse,
  UpdateMomentRequest,
} from "@/types/api";

type ListMomentsParams = {
  page?: number;
  perPage?: number;
  tags?: string[];
  searchQuery?: string;
};

function normalizeMoment(rawValue: unknown): Moment {
  const raw = isRecord(rawValue) ? rawValue : {};

  return {
    momentId: pickString(raw.momentId, raw.moment_id) ?? "",
    playerWalletAddress: pickString(raw.playerWalletAddress, raw.player_wallet_address) ?? "",
    assetUrl: pickString(raw.assetUrl, raw.asset_url),
    assetMetadata: isRecord(raw.assetMetadata) ? raw.assetMetadata : undefined,
    title: pickString(raw.title) ?? "",
    description: pickString(raw.description),
    tags: Array.isArray(raw.tags) ? raw.tags.filter((value): value is string => typeof value === "string") : [],
    relatedGames: Array.isArray(raw.relatedGames)
      ? raw.relatedGames.filter((value): value is string => typeof value === "string")
      : [],
    socialMediaLinks: isRecord(raw.socialMediaLinks) ? raw.socialMediaLinks : undefined,
    numLikes: pickNumber(raw.numLikes, raw.num_likes) ?? 0,
    numComments: pickNumber(raw.numComments, raw.num_comments) ?? 0,
    aiCaption: pickString(raw.aiCaption, raw.ai_caption),
    aiRankScore: pickNumber(raw.aiRankScore, raw.ai_rank_score),
    aiHighlights: Array.isArray(raw.aiHighlights)
      ? raw.aiHighlights.filter((value): value is string => typeof value === "string")
      : [],
    aiStatus: pickString(raw.aiStatus, raw.ai_status),
    aiMomentType: pickString(raw.aiMomentType, raw.ai_moment_type),
    aiSkillScore: pickNumber(raw.aiSkillScore, raw.ai_skill_score),
    aiReactionQuality: pickString(raw.aiReactionQuality, raw.ai_reaction_quality),
    aiRarity: pickString(raw.aiRarity, raw.ai_rarity),
    assetZgHash: pickString(raw.assetZgHash, raw.asset_zg_hash),
    assetZgTxHash: pickString(raw.assetZgTxHash, raw.asset_zg_tx_hash),
    metadataZgHash: pickString(raw.metadataZgHash, raw.metadata_zg_hash),
    metadataZgTxHash: pickString(raw.metadataZgTxHash, raw.metadata_zg_tx_hash),
    zgStatus: pickString(raw.zgStatus, raw.zg_status),
    zgError: pickString(raw.zgError, raw.zg_error),
    zgUploadedAt: pickString(raw.zgUploadedAt, raw.zg_uploaded_at),
    createdAt: pickString(raw.createdAt, raw.created_at),
    updatedAt: pickString(raw.updatedAt, raw.updated_at),
  };
}

function normalizeMomentsFeed(payload: unknown, fallbackPage: number, fallbackPerPage: number): MomentsFeedResponse {
  const raw = isRecord(payload) ? payload : {};
  const moments = Array.isArray(raw.moments) ? raw.moments.map((moment) => normalizeMoment(moment)) : [];
  const total = pickNumber(raw.total, raw.totalCount, raw.total_count) ?? moments.length;
  const perPage = pickNumber(raw.perPage, raw.pageSize, raw.page_size) ?? fallbackPerPage;

  return {
    moments,
    total,
    page: pickNumber(raw.page) ?? fallbackPage,
    perPage,
    totalPages: pickNumber(raw.totalPages) ?? (total === 0 ? 0 : Math.ceil(total / perPage)),
  };
}

function normalizeMomentDaEvents(payload: unknown): MomentDaEventsResponse {
  const raw = isRecord(payload) ? payload : {};
  const events = Array.isArray(raw.events)
    ? raw.events.map((event) => {
        const value = isRecord(event) ? event : {};
        const normalized: MomentDaEvent = {
          momentId: pickString(value.momentId, value.moment_id) ?? "",
          eventType: pickString(value.eventType, value.event_type) ?? "",
          payload: value.payload,
          createdAt: pickString(value.createdAt, value.created_at),
        };
        return normalized;
      })
    : [];

  return { events };
}

function normalizeMomentZgProof(payload: unknown): MomentZgProofResponse {
  const raw = isRecord(payload) ? payload : {};

  return {
    assetZgHash: pickString(raw.assetZgHash, raw.asset_zg_hash),
    assetZgTxHash: pickString(raw.assetZgTxHash, raw.asset_zg_tx_hash),
    metadataZgHash: pickString(raw.metadataZgHash, raw.metadata_zg_hash),
    metadataZgTxHash: pickString(raw.metadataZgTxHash, raw.metadata_zg_tx_hash),
    zgStatus: pickString(raw.zgStatus, raw.zg_status),
    zgError: pickString(raw.zgError, raw.zg_error),
    zgUploadedAt: pickString(raw.zgUploadedAt, raw.zg_uploaded_at),
    gatewayUrl: pickString(raw.gatewayUrl, raw.gateway_url) ?? null,
    explorerUrl: pickString(raw.explorerUrl, raw.explorer_url) ?? null,
  };
}

export const momentsApi = {
  list: async (params: ListMomentsParams = {}): Promise<MomentsFeedResponse> => {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const { data } = await apiClient.get<ApiEnvelope<unknown>>("/moments", {
      params: {
        page,
        per_page: perPage,
        tags: params.tags?.join(","),
        "search-query": params.searchQuery,
      },
    });

    return normalizeMomentsFeed(unwrapApiData(data), page, perPage);
  },

  getMine: async (page = 1, perPage = 20): Promise<MomentsFeedResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>("/moments/my", {
      params: { page, per_page: perPage },
    });

    return normalizeMomentsFeed(unwrapApiData(data), page, perPage);
  },

  getById: async (momentId: string): Promise<Moment> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(`/moments/${momentId}`);
    return normalizeMoment(unwrapApiData(data));
  },

  getZgProof: async (momentId: string): Promise<MomentZgProofResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(`/moments/${momentId}/zg-proof`);
    return normalizeMomentZgProof(unwrapApiData(data));
  },

  getDaEvents: async (momentId: string): Promise<MomentDaEventsResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(`/moments/${momentId}/da-events`);
    return normalizeMomentDaEvents(unwrapApiData(data));
  },

  create: async (payload: CreateMomentRequest): Promise<CreateMomentResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<CreateMomentResponse>>("/moments/register", payload);
    return unwrapApiData(data);
  },

  update: async (momentId: string, payload: UpdateMomentRequest): Promise<Moment> => {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(`/moments/${momentId}`, payload);
    return normalizeMoment(unwrapApiData(data));
  },

  remove: async (momentId: string): Promise<MomentMutationResponse> => {
    const { data } = await apiClient.delete<ApiEnvelope<MomentMutationResponse>>(`/moments/${momentId}`);
    return unwrapApiData(data);
  },

  retryZgMigration: async (momentId: string): Promise<MomentMutationResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<MomentMutationResponse>>(`/moments/${momentId}/zg/retry`);
    return unwrapApiData(data);
  },

  like: async (momentId: string): Promise<MomentLikeResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<MomentLikeResponse>>(`/moments/${momentId}/like`);
    return unwrapApiData(data);
  },
};
