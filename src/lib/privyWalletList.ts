/**
 * Privy external wallet list — named wallets only (no wallet_connect bundle).
 * Same pattern as warzonewarrior/src/lib/privyWalletList.ts.
 */
export const PRIVY_WALLET_LIST = [
  "metamask",
  "coinbase_wallet",
  "rainbow",
  "phantom",
  "zerion",
  "okx_wallet",
] as const;

export type PrivyConfiguredWalletId = (typeof PRIVY_WALLET_LIST)[number];
