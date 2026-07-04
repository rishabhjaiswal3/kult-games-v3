/**
 * Privy external wallet list.
 *
 * @see https://docs.privy.io/recipes/react/wallet-list-configurations
 * @see https://docs.privy.io/wallets/connectors/setup/configuring-external-connector-wallets
 *
 * Wallets appear in the exact order you specify. Put the wallets you want pinned
 * at the top in `PRIVY_FEATURED_WALLETS`, then enable `wallet_connect` to append
 * the full WalletConnect registry (100+ searchable wallets below the featured set).
 */
export const PRIVY_FEATURED_WALLETS = [
  "coinbase_wallet",
  "okx_wallet",
  "bitget_wallet",
  "metamask",
  "phantom",
  "zerion",
] as const;

export type PrivyFeaturedWalletId = (typeof PRIVY_FEATURED_WALLETS)[number];

/** Append all WalletConnect-registry wallets after the featured list. */
export const PRIVY_INCLUDE_WALLET_CONNECT = true;

export function buildPrivyWalletList(): Array<PrivyFeaturedWalletId | "wallet_connect"> {
  if (PRIVY_INCLUDE_WALLET_CONNECT) {
    return [...PRIVY_FEATURED_WALLETS, "wallet_connect"];
  }
  return [...PRIVY_FEATURED_WALLETS];
}

/** Full list passed to `appearance.walletList` in PrivyProvider. */
export const PRIVY_WALLET_LIST = buildPrivyWalletList();

export type PrivyConfiguredWalletId = PrivyFeaturedWalletId | "wallet_connect";
