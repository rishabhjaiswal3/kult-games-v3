import type { WalletListEntry } from "@privy-io/react-auth";

/**
 * A2A marketplace login is wallet-only, restricted to these named connectors:
 * MetaMask, Coinbase Wallet, and OKX Wallet. No email or Google login.
 *
 * @see https://docs.privy.io/wallets/connectors/setup/configuring-external-connector-wallets
 */
export const PRIVY_NAMED_A2A_WALLETS = [
  "metamask",
  "coinbase_wallet",
  "okx_wallet",
] as const satisfies readonly WalletListEntry[];

export type PrivyNamedA2AWalletId = (typeof PRIVY_NAMED_A2A_WALLETS)[number];

export function buildPrivyWalletList(): WalletListEntry[] {
  return [...PRIVY_NAMED_A2A_WALLETS];
}

/** Full list passed to `appearance.walletList` in PrivyProvider. */
export const PRIVY_WALLET_LIST = buildPrivyWalletList();
