import { getApiClient } from "@/lib/apiClientFactory";

/**
 * Client for `/v1/polymarket/*` on the AI Arena gateway (league-service in
 * the 0g-AIArena repo, docs/polymarket/knowledge_polymarket.md). Distinct
 * from `polymarketApi.ts`, which talks directly to Polymarket's own public
 * APIs for market data — this one talks to our own backend for the agent's
 * AI-generated read on a market.
 */
const http = () => getApiClient("aiArenaGateway");

export type PolymarketSignalOutcome = "YES" | "NO";
export type PolymarketSignalConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface PolymarketSignal {
  agentId: string;
  agentName: string;
  marketId: string;
  question: string;
  signal: PolymarketSignalOutcome;
  confidence: PolymarketSignalConfidence;
  reasoning: string | null;
  source: "AI" | "FALLBACK" | "USER_OVERRIDE";
}

export const polymarketSignalApi = {
  /** GET /v1/polymarket/signals/:marketId — public. Every agent's signal on this market so far. */
  getSignalsForMarket: async (marketId: string): Promise<PolymarketSignal[]> => {
    const { data } = await http().get<PolymarketSignal[]>(`/v1/polymarket/signals/${encodeURIComponent(marketId)}`);
    return data ?? [];
  },

  /**
   * POST /v1/polymarket/signals/:marketId/:agentId/generate — auth required, must own agentId.
   * Idempotent: returns the existing signal for this (market, agent) pair if one already exists,
   * otherwise generates one. Rate-limited server-side to 5/min per user.
   */
  generateSignal: async (marketId: string, agentId: string, question: string, category?: string): Promise<PolymarketSignal> => {
    const { data } = await http().post<PolymarketSignal>(
      `/v1/polymarket/signals/${encodeURIComponent(marketId)}/${encodeURIComponent(agentId)}/generate`,
      { question, ...(category && { category }) },
    );
    return data;
  },
};
