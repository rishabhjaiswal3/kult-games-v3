import { defineChain } from "viem";
import { getAllowedChainFromEnv } from "@/lib/chain";

/** Privy `supportedChains` / `defaultChain` — Base mainnet (chainId 8453). */
export function buildAppChain() {
  const cfg = getAllowedChainFromEnv();
  const rpc = cfg.rpcUrls?.[0] ?? "https://mainnet.base.org";
  const explorer = cfg.blockExplorerUrls?.[0];

  return defineChain({
    id: cfg.decimalChainId,
    name: cfg.chainName ?? "Base",
    network: "base",
    nativeCurrency: {
      decimals: cfg.nativeCurrency?.decimals ?? 18,
      name: cfg.nativeCurrency?.name ?? "Ether",
      symbol: cfg.nativeCurrency?.symbol ?? "ETH",
    },
    rpcUrls: {
      default: { http: [rpc] },
    },
    blockExplorers: explorer
      ? {
          default: {
            name: cfg.chainName ?? "Basescan",
            url: explorer,
          },
        }
      : undefined,
    testnet: false,
  });
}

export const appChain = buildAppChain();
