import type { WalletListEntry } from "@privy-io/react-auth";

/**
 * Curated external wallets for 0G Mainnet (EVM, chain 16661).
 *
 * Privy behaviour (see ConnectWalletView in @privy-io/react-auth):
 * - Named `WalletListEntry` IDs connect via extension / deep link.
 * - Additional WalletConnect registry slugs appear as individual buttons when listed
 *   here WITHOUT `wallet_connect`, Privy filters WC listings to slugs in this array.
 * - Solana-only wallets (Phantom, Solflare, Backpack, Jupiter, …) are excluded.
 *
 * @see https://docs.privy.io/wallets/connectors/setup/configuring-external-connector-wallets
 * @see https://docs.0g.ai/introduction/how-to-get-0g
 */
/**
 * Privy sorts wallets by `findIndex` in this array (see ConnectWalletView in @privy-io/react-auth).
 * WC registry slugs can differ from connector IDs, Privy auto-appends aliases at the *tail*,
 * which pushes them to the bottom unless we also list the alias early (e.g. bitget → bitkeep).
 */
export const PRIVY_WALLET_SORT_ALIASES: Record<string, readonly string[]> = {
  bitget_wallet: ["bitkeep"],
  binance: ["binance-defi-wallet"],
};

export const PRIVY_NAMED_ZERO_G_WALLETS = [
  "bitget_wallet",
  "okx_wallet",
  "metamask",
  "coinbase_wallet",
  "base_account",
  "zerion",
  "rabby_wallet",
  "bybit_wallet",
  "binance",
  "kraken_wallet",
  "cryptocom",
  "uniswap",
  "safe",
  "universal_profile",
  // Catch-all: Bitget (and any other injected wallet) is sometimes detected via a
  // generic/legacy provider path instead of announcing itself as "bitget_wallet"
  // (EIP-6963 name mismatch, provider-injection race with other extensions, etc.).
  // Privy's connector-name allow-list silently drops an unmatched provider instead
  // of falling back to the named entry, this is why the button flickers in and
  // out. `detected_ethereum_wallets` is a documented Privy sentinel that surfaces
  // any detected EVM extension not already matched by name, so it always renders
  // (named wallets above still keep their configured position/branding).
  "detected_ethereum_wallets",
] as const satisfies readonly WalletListEntry[];

/**
 * WalletConnect registry slugs for famous EVM wallets (0G-connectable via WC / custom RPC).
 * Matched against WC listings when `wallet_connect` is omitted from the list.
 */
export const PRIVY_WALLET_CONNECT_ZERO_G_SLUGS = [
  // User reference list (B) + common 0G-friendly EVM wallets
  "blockchain", // Blockchain.com
  "blockwallet", // BlockWallet
  "blocto", // Blocto
  "blofin", // BloFin Wallet
  "bloom", // Bloom
  "bonuz", // Bonuz Social Smart Wallet
  "brave_wallet", // Brave Wallet
  "bridge", // Bridge Wallet
  "brise", // BRISE Wallet
  "broearn", // Broearn Wallet
  "bron", // Bron
  "burrito_wallet", // Burrito
  "buzzup", // BUZZUP
  "bytebank", // ByteBank
  "caesium", // Caesium
  "cake", // Cake Wallet
  "card", // Card Wallet
  // Other popular multi-chain EVM wallets
  "trust", // Trust Wallet
  "safepal", // SafePal (0G native per 0G docs)
  "exodus", // Exodus
  "coin98", // Coin98
  "1inch", // 1inch Wallet
  "argent", // Argent
  "zengo", // ZenGo
  "alphawallet", // AlphaWallet
  "unstoppable", // Unstoppable Domains
  "ambire", // Ambire Wallet
  "mathwallet", // MathWallet
  "tokenpocket", // TokenPocket
  "imtoken", // imToken
  "mew_wallet", // MyEtherWallet
  "spot", // Spot Wallet
  "omni", // Omni
] as const;

/** Do not append the full WalletConnect registry (100+ wallets). */
export const PRIVY_INCLUDE_WALLET_CONNECT = false;

export type PrivyNamedZeroGWalletId = (typeof PRIVY_NAMED_ZERO_G_WALLETS)[number];
export type PrivyWalletConnectZeroGSlug = (typeof PRIVY_WALLET_CONNECT_ZERO_G_SLUGS)[number];
export type PrivyWalletSortAlias = (typeof PRIVY_WALLET_SORT_ALIASES)[keyof typeof PRIVY_WALLET_SORT_ALIASES][number];
export type PrivyZeroGWalletId = PrivyNamedZeroGWalletId | PrivyWalletConnectZeroGSlug | PrivyWalletSortAlias;

function asPrivyWalletList(ids: readonly string[]): WalletListEntry[] {
  return ids as WalletListEntry[];
}

/** Expand named wallets with WC slug aliases *before* each parent so WC listings sort to the top. */
function withSortAliases(ids: readonly string[]): string[] {
  const out: string[] = [];
  for (const id of ids) {
    const aliases = PRIVY_WALLET_SORT_ALIASES[id];
    if (aliases) out.push(...aliases);
    out.push(id);
  }
  return out;
}

export function buildPrivyWalletList(): WalletListEntry[] {
  const namedWithAliases = withSortAliases(PRIVY_NAMED_ZERO_G_WALLETS);

  if (PRIVY_INCLUDE_WALLET_CONNECT) {
    return asPrivyWalletList([...namedWithAliases, "wallet_connect"]);
  }

  return asPrivyWalletList([...namedWithAliases, ...PRIVY_WALLET_CONNECT_ZERO_G_SLUGS]);
}

/** Full list passed to `appearance.walletList` in PrivyProvider. */
export const PRIVY_WALLET_LIST = buildPrivyWalletList();

export type PrivyConfiguredWalletId = PrivyZeroGWalletId | "wallet_connect";
