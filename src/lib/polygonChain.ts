import type { AllowedChainConfig } from "@/lib/chain";

/**
 * Polygon mainnet, for use with ensureWalletOnAllowedChain() when actually
 * signing/sending a Polygon transaction (approvals, order signatures).
 * Fixed, not env-configurable -- unlike the app's own chain (chain.ts),
 * Polygon is dictated by Polymarket, not a deployment choice.
 */
export const POLYGON_CHAIN: AllowedChainConfig = {
  caip2: "eip155:137",
  decimalChainId: 137,
  hexChainId: "0x89",
  chainName: "Polygon",
  rpcUrls: ["https://polygon-rpc.com"],
  blockExplorerUrls: ["https://polygonscan.com"],
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
};
