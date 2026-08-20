import type { AllowedChainConfig } from "@/lib/chain";
import { getAllowedChainFromEnv } from "@/lib/chain";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

/**
 * Switch (or add) the wallet to the app chain before SIWE / transactions.
 * Mirrors warzonewarrior LoginModal wallet flow.
 */
export async function ensureWalletOnAllowedChain(
  provider: Eip1193Provider,
  chain: AllowedChainConfig
): Promise<void> {
  const targetHex = chain.hexChainId;
  const current = await provider.request({ method: "eth_chainId" });
  if (typeof current === "string" && current.toLowerCase() === targetHex.toLowerCase()) {
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }],
    });
    return;
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code !== 4902) throw err;
  }

  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: targetHex,
        chainName: chain.chainName ?? "Base",
        nativeCurrency: {
          name: chain.nativeCurrency?.name ?? "Ether",
          symbol: chain.nativeCurrency?.symbol ?? "ETH",
          decimals: chain.nativeCurrency?.decimals ?? 18,
        },
        rpcUrls: chain.rpcUrls ?? ["https://mainnet.base.org"],
        blockExplorerUrls: chain.blockExplorerUrls ?? ["https://basescan.org"],
      },
    ],
  });
}

/** Same as warzonewarrior LoginModal, switch via injected provider (most reliable). */
export async function switchAppChainViaInjectedProvider(
  chain = getAllowedChainFromEnv()
): Promise<void> {
  if (typeof window === "undefined") return;
  const provider = (window as Window & { ethereum?: Eip1193Provider }).ethereum;
  if (!provider?.request) return;
  await ensureWalletOnAllowedChain(provider, chain);
}
