import axios from "axios";
import { getApiClient } from "@/lib/apiClientFactory";

/**
 * $ARENA on 0G Chain — read-only client for the on-chain economy endpoints.
 * Reuses the existing AI Arena gateway axios instance (auth headers, 401
 * refresh, x402 auto-pay already wired in apiClientFactory.ts).
 *
 * All balances/amounts are decimal strings returned by the backend
 * (e.g. "123.45") — no wei math needed on the client, just parseFloat/
 * toLocaleString for display.
 */

const http = () => getApiClient("aiArenaGateway");

export interface ArenaWalletResponse {
  address: string;
  balanceArena: string;
}

export interface ArenaAllowanceResponse {
  allowance: string;
}

export interface ArenaConfigResponse {
  arenaTokenAddress: string;
  treasuryAddress: string;
  escrowAddress: string;
  tournamentAddress: string;
  rewardDistributorAddress: string;
}

export interface OnChainEvent {
  id: string;
  eventName: string;
  txHash: string;
  blockNumber: number;
  args: Record<string, unknown>;
  occurredAt: string;
}

export interface ArenaWalletTransactionsResponse {
  events: OnChainEvent[];
  total: number;
}

export interface ArenaTreasuryResponse {
  balance: string;
  distributed: string;
  remaining: string;
  totalCommissions: string;
  totalRewardsPaid: string;
}

export interface ArenaExplorerEventsResponse {
  events: OnChainEvent[];
  total: number;
}

export interface ArenaTreasurySnapshot {
  balance: string;
  totalDistributed: string;
  totalCommissions: string;
  totalRewardsPaid: string;
  circulatingSupply: string;
  capturedAt: string;
}

export interface ArenaTreasuryHistoryResponse {
  snapshots: ArenaTreasurySnapshot[];
}

function is404(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export const arenaChainApi = {
  /** GET /v1/arena/wallet/:address — player's real on-chain ARENA balance on 0G Chain. */
  getWalletBalance: async (address: string): Promise<ArenaWalletResponse> => {
    const { data } = await http().get<ArenaWalletResponse>(
      `/v1/arena/wallet/${encodeURIComponent(address)}`
    );
    return data;
  },

  /** GET /v1/arena/wallet/:address/allowance/:spender — ARENA approved for a spender contract. */
  getWalletAllowance: async (address: string, spender: string): Promise<ArenaAllowanceResponse> => {
    const { data } = await http().get<ArenaAllowanceResponse>(
      `/v1/arena/wallet/${encodeURIComponent(address)}/allowance/${encodeURIComponent(spender)}`
    );
    return data;
  },

  /**
   * GET /v1/arena/config — contract addresses for the $ARENA economy.
   * May 404 if the backend hasn't shipped this route yet — callers should
   * treat a null return as "config unavailable" and not crash.
   */
  getConfig: async (): Promise<ArenaConfigResponse | null> => {
    try {
      const { data } = await http().get<ArenaConfigResponse>("/v1/arena/config");
      return data;
    } catch (err) {
      if (is404(err)) return null;
      throw err;
    }
  },

  /** GET /v1/arena/transactions/:address?page=&limit= — real wallet activity feed. */
  getWalletTransactions: async (
    address: string,
    page = 1,
    limit = 20
  ): Promise<ArenaWalletTransactionsResponse> => {
    const { data } = await http().get<ArenaWalletTransactionsResponse>(
      `/v1/arena/transactions/${encodeURIComponent(address)}`,
      { params: { page, limit } }
    );
    return {
      events: Array.isArray(data?.events) ? data.events : [],
      total: data?.total ?? 0,
    };
  },

  /** GET /v1/arena/treasury — treasury balance, distributed, remaining, commissions, rewards paid. */
  getTreasury: async (): Promise<ArenaTreasuryResponse> => {
    const { data } = await http().get<ArenaTreasuryResponse>("/v1/arena/treasury");
    return data;
  },

  /** GET /v1/arena/explorer/events?eventName=&page=&limit= — repo-wide on-chain event feed. */
  getExplorerEvents: async (
    params: { eventName?: string; page?: number; limit?: number } = {}
  ): Promise<ArenaExplorerEventsResponse> => {
    const { data } = await http().get<ArenaExplorerEventsResponse>("/v1/arena/explorer/events", {
      params: {
        eventName: params.eventName || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return {
      events: Array.isArray(data?.events) ? data.events : [],
      total: data?.total ?? 0,
    };
  },

  /** GET /v1/arena/explorer/treasury-history?limit= — historical treasury snapshots. */
  getTreasuryHistory: async (limit = 50): Promise<ArenaTreasuryHistoryResponse> => {
    const { data } = await http().get<ArenaTreasuryHistoryResponse>(
      "/v1/arena/explorer/treasury-history",
      { params: { limit } }
    );
    return { snapshots: Array.isArray(data?.snapshots) ? data.snapshots : [] };
  },
};

/** 0G Chain mainnet explorer link helpers. */
export const zeroGExplorer = {
  tx: (txHash: string) => `https://chainscan.0g.ai/tx/${txHash}`,
  address: (address: string) => `https://chainscan.0g.ai/address/${address}`,
};
