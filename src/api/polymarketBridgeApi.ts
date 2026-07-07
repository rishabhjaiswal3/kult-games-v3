import { getBuilderCode } from "@/lib/polymarketClob";

/**
 * Polymarket's Bridge API (docs.polymarket.com/trading/bridge/deposit) --
 * lets a user fund their Polymarket wallet from any supported chain/token
 * (including native USDC on Polygon itself, not just true cross-chain
 * deposits), auto-converting to pUSD server-side. This is the flow
 * Polymarket's own site uses so most of their users never have to think
 * about USDC vs USDC.e -- we call the same public API directly (CORS is
 * wide open, verified: Access-Control-Allow-Origin: *).
 *
 * Distinct from the on-chain approve()+wrap() flow in usePolymarketTrading.ts
 * (which only accepts USDC.e already sitting in the wallet, pulled via a
 * signed transaction). This flow instead hands the user a deposit address to
 * send funds TO from wherever they already are -- no wallet signature
 * involved on our side at all.
 */

const BRIDGE_HOST = "https://bridge.polymarket.com";

export type BridgeAddressType = "evm" | "svm" | "btc" | "tvm";

export interface BridgeDepositAddresses {
  evm: string;
  svm: string;
  tron: string;
  btc: string;
}

export interface BridgeSupportedToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}

export interface BridgeSupportedAsset {
  chainId: string;
  chainName: string;
  token: BridgeSupportedToken;
  minCheckoutUsd: number;
}

export interface BridgeDepositStatus {
  status: string;
  [key: string]: unknown;
}

async function bridgeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const builderCode = getBuilderCode();
  const res = await fetch(`${BRIDGE_HOST}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(builderCode ? { "X-Builder-Code": builderCode } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error((body && typeof body === "object" && "error" in body ? String((body as { error: unknown }).error) : null) ?? `Bridge API error (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const polymarketBridgeApi = {
  /**
   * Get (or lazily create) this wallet's unique deposit addresses, one per
   * supported chain type. Same addresses every time for a given wallet.
   */
  getDepositAddresses: async (walletAddress: string): Promise<BridgeDepositAddresses> => {
    const { address } = await bridgeFetch<{ address: BridgeDepositAddresses }>("/deposit", {
      method: "POST",
      body: JSON.stringify({ address: walletAddress }),
    });
    return address;
  },

  /** All chains/tokens the bridge currently accepts, with minimum deposit amounts. */
  getSupportedAssets: async (): Promise<BridgeSupportedAsset[]> => {
    const { supportedAssets } = await bridgeFetch<{ supportedAssets: BridgeSupportedAsset[] }>("/supported-assets");
    return supportedAssets ?? [];
  },

  /** Poll the status of deposits sent to one of this wallet's bridge addresses. */
  getStatus: async (depositAddress: string): Promise<BridgeDepositStatus> => {
    return bridgeFetch<BridgeDepositStatus>(`/status/${encodeURIComponent(depositAddress)}`);
  },
};
