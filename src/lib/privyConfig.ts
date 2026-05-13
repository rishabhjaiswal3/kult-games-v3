import type { PrivyClientConfig } from "@privy-io/react-auth";
import { PRIVY_WALLET_LIST } from "@/lib/privyWalletList";
import { appChain } from "@/lib/zerogChain";

const canUseEmbeddedWallets =
  typeof window === "undefined" || window.isSecureContext;

/** Privy client config — 0G-only chain (warzonewarrior pattern, Somnia → 0G). */
export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    walletChainType: "ethereum-only",
    showWalletLoginFirst: true,
    walletList: [...PRIVY_WALLET_LIST],
  },
  ...(canUseEmbeddedWallets
    ? {
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }
    : {}),
  loginMethods: ["wallet", "email", "google"],
  supportedChains: [appChain],
  defaultChain: appChain,
};
