import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/api/utils";
import type { ApiEnvelope } from "@/types/api";
import type { AccessFeature, AccessTier } from "@/lib/accessControl";

export type VerifyAccessCodeResponse = {
  tier: AccessTier;
  label: string;
  features: AccessFeature[];
  accessToken: string;
  expiresInDays: number;
};

export const accessCodeApi = {
  verify: async (code: string): Promise<VerifyAccessCodeResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<VerifyAccessCodeResponse>>("/access-code/verify", { code });
    return unwrapApiData(data);
  },
};
