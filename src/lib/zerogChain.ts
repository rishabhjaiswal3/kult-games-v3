import { defineChain } from "viem";
import { getAllowedChainFromEnv } from "@/lib/chain";

/** Privy `supportedChains` / `defaultChain` — 0G mainnet (chainId 16661). */
export function buildAppChain() {
  const cfg = getAllowedChainFromEnv();
  const rpc = cfg.rpcUrls?.[0] ?? "https://evmrpc.0g.ai";
  const explorer = cfg.blockExplorerUrls?.[0];

  return defineChain({
    id: cfg.decimalChainId,
    name: cfg.chainName ?? "0G Mainnet",
    nativeCurrency: {
      decimals: cfg.nativeCurrency?.decimals ?? 18,
      name: cfg.nativeCurrency?.name ?? "0G",
      symbol: cfg.nativeCurrency?.symbol ?? "0G",
    },
    rpcUrls: {
      default: { http: [rpc] },
    },
    blockExplorers: explorer
      ? {
          default: {
            name: cfg.chainName ?? "0G Explorer",
            url: explorer,
          },
        }
      : undefined,
    testnet: false,
  });
}

export const appChain = buildAppChain();

/** @deprecated Use appChain — kept for readability in 0G-specific copy. */
export const zeroGChain = appChain;
