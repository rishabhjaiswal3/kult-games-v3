import apiClient from "@/lib/apiClient";
import type {
  ActivityEventPayload,
  ActivityHeatmapResponse,
  ActivitySummaryResponse,
} from "@/analytics/types";

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const activityApi = {
  /** Batch ingest — never throw to callers; tracker handles failures quietly. */
  async ingest(events: ActivityEventPayload[]): Promise<{ accepted: number; dropped: number } | null> {
    if (!events.length) return { accepted: 0, dropped: 0 };
    try {
      const res = await apiClient.post("/activity/events", { events }, {
        // Avoid interceptors treating analytics failure as session death noise
        timeout: 12_000,
        headers: { "X-Kult-Activity": "1" },
      });
      return unwrapData(res.data);
    } catch {
      return null;
    }
  },

  async getHeatmap(params: {
    path: string;
    from?: string;
    to?: string;
    gridSize?: number;
    types?: string;
  }): Promise<ActivityHeatmapResponse> {
    const res = await apiClient.get("/activity/heatmap", { params });
    return unwrapData(res.data);
  },

  async getSummary(params?: {
    from?: string;
    to?: string;
    pathPrefix?: string;
  }): Promise<ActivitySummaryResponse> {
    const res = await apiClient.get("/activity/summary", { params });
    return unwrapData(res.data);
  },

  async getRecent(params?: {
    limit?: number;
    path?: string;
    type?: string;
  }): Promise<unknown[]> {
    const res = await apiClient.get("/activity/recent", { params });
    return unwrapData(res.data) ?? [];
  },
};
