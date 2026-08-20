/** App EVM chain, Base mainnet by default — this marketplace's escrow, USDC and ERC-8004 identity all live on Base. */

export type AllowedChainConfig = {
  caip2: string;
  decimalChainId: number;
  hexChainId: `0x${string}`;
  chainName?: string;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  nativeCurrency?: {
    name?: string;
    symbol?: string;
    decimals?: number;
  };
};

const BASE_MAINNET_FALLBACK: AllowedChainConfig = {
  caip2: "eip155:8453",
  decimalChainId: 8453,
  hexChainId: "0x2105",
  chainName: "Base",
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
};

function parseDecimal(input?: string): number | undefined {
  if (!input) return undefined;
  const n = Number(input);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

export function getAllowedChainFromEnv(): AllowedChainConfig {
  const dec =
    parseDecimal(import.meta.env.VITE_ALLOWED_CHAIN_ID) ?? BASE_MAINNET_FALLBACK.decimalChainId;
  const hex = `0x${dec.toString(16)}` as `0x${string}`;

  const cfg: AllowedChainConfig = {
    caip2: `eip155:${dec}`,
    decimalChainId: dec,
    hexChainId: hex,
  };

  const chainName = import.meta.env.VITE_ALLOWED_CHAIN_NAME;
  const rpc = import.meta.env.VITE_ALLOWED_RPC_URL;
  const explorer = import.meta.env.VITE_ALLOWED_EXPLORER_URL;
  const currencyName = import.meta.env.VITE_ALLOWED_NATIVE_NAME;
  const currencySymbol = import.meta.env.VITE_ALLOWED_NATIVE_SYMBOL;
  const currencyDecimals = parseDecimal(import.meta.env.VITE_ALLOWED_NATIVE_DECIMALS) ?? 18;

  if (chainName) cfg.chainName = chainName;
  else if (dec === BASE_MAINNET_FALLBACK.decimalChainId) cfg.chainName = BASE_MAINNET_FALLBACK.chainName;

  if (rpc) cfg.rpcUrls = [rpc];
  else if (dec === BASE_MAINNET_FALLBACK.decimalChainId) cfg.rpcUrls = BASE_MAINNET_FALLBACK.rpcUrls;

  if (explorer) cfg.blockExplorerUrls = [explorer];
  else if (dec === BASE_MAINNET_FALLBACK.decimalChainId) {
    cfg.blockExplorerUrls = BASE_MAINNET_FALLBACK.blockExplorerUrls;
  }

  if (currencyName || currencySymbol || currencyDecimals) {
    cfg.nativeCurrency = {
      name: currencyName,
      symbol: currencySymbol,
      decimals: currencyDecimals,
    };
  } else if (dec === BASE_MAINNET_FALLBACK.decimalChainId) {
    cfg.nativeCurrency = BASE_MAINNET_FALLBACK.nativeCurrency;
  }

  return cfg;
}
