import type { WalletListEntry } from "@privy-io/react-auth";

/**
 * A2A marketplace login is wallet-only, restricted to exactly two connectors:
 * Coinbase Wallet and OKX Wallet. No email, no Google, no other wallets.
 *
 * @see https://docs.privy.io/wallets/connectors/setup/configuring-external-connector-wallets
 */
export const PRIVY_NAMED_A2A_WALLETS = [
  "coinbase_wallet",
  "okx_wallet",
] as const satisfies readonly WalletListEntry[];

export type PrivyNamedA2AWalletId = (typeof PRIVY_NAMED_A2A_WALLETS)[number];

export function buildPrivyWalletList(): WalletListEntry[] {
  return [...PRIVY_NAMED_A2A_WALLETS];
}

/** Full list passed to `appearance.walletList` in PrivyProvider. */
export const PRIVY_WALLET_LIST = buildPrivyWalletList();
