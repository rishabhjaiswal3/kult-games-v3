import type { PrivyClientConfig } from "@privy-io/react-auth";
import { base, mainnet, polygon } from "viem/chains";
import { buildPrivyWalletList } from "@/lib/privyWalletList";
import { KULT_PRIVY_APPEARANCE } from "@/lib/privyAppearance";
import { buildAppChain } from "@/lib/zerogChain";

const canUseEmbeddedWallets =
  typeof window === "undefined" || window.isSecureContext;

/**
 * Privy wallet SIWE is verified on auth.privy.io, only known chains (e.g. mainnet) pass.
 * 0G (16661) in the SIWE message returns 422 `invalid_data`. Use mainnet for Privy login,
 * then switch the wallet to 0G after auth (see LoginModal). Kult backend SIWE uses 16661 separately.
 *
 * Note: createOnLogin only runs for Privy's built-in modal, whitelabel email/Google flows must
 * call createWallet() after login (see AuthContext).
 */
export function buildPrivyConfig(): PrivyClientConfig {
  const zeroGChain = buildAppChain();
  return {
    appearance: {
      ...KULT_PRIVY_APPEARANCE,
      walletChainType: "ethereum-only",
      walletList: buildPrivyWalletList(),
    },
    ...(canUseEmbeddedWallets
      ? {
          embeddedWallets: {
            ethereum: { createOnLogin: "users-without-wallets" as const },
          },
        }
      : {}),
    loginMethods: ["wallet", "email", "google"],
    // base added for the A2A marketplace on Base mainnet (chainId 8453) -- same
    // wallet address, switched into only when signing a USDC EIP-3009
    // authorization to fund escrow. Without it Privy rejects switchChain with
    // "Unsupported chainId: 8453" and escrow funding cannot be signed.
    // polygon added for Polymarket signal/trading (docs/polymarket) -- same wallet address,
    // switched into only when reading a Polygon balance or signing a Polymarket order, exactly
    // like zeroGChain is switched into post-login (see AuthContext). Does not change
    // login/SIWE/0G Mainnet behavior anywhere else in the app.
    supportedChains: [mainnet, zeroGChain, polygon, base],
    defaultChain: mainnet,
  };
}

export const privyConfig = buildPrivyConfig();
