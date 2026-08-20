import type { PrivyClientConfig } from "@privy-io/react-auth";
import { buildPrivyWalletList } from "@/lib/privyWalletList";
import { KULT_PRIVY_APPEARANCE } from "@/lib/privyAppearance";
import { buildAppChain } from "@/lib/appChain";

const canUseEmbeddedWallets =
  typeof window === "undefined" || window.isSecureContext;

/**
 * This marketplace is Base-only: escrow, USDC and ERC-8004 identity all live on
 * Base mainnet, so Privy's own SIWE and the wallet's chain both target Base
 * directly — no separate "login chain" + post-login switch is needed here.
 */
export function buildPrivyConfig(): PrivyClientConfig {
  const base = buildAppChain();
  return {
    appearance: {
      ...KULT_PRIVY_APPEARANCE,
      walletChainType: "ethereum-only",
      walletList: buildPrivyWalletList(),
    },
    ...(canUseEmbeddedWallets
      ? {
          embeddedWallets: {
            ethereum: { createOnLogin: "off" as const },
          },
        }
      : {}),
    loginMethods: ["wallet"],
    supportedChains: [base],
    defaultChain: base,
  };
}

export const privyConfig = buildPrivyConfig();
