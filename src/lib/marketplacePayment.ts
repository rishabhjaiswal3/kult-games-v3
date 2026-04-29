export const MARKETPLACE_PAYMENT_TOKENS = ["USDC", "USDT"] as const;

export type MarketplacePaymentToken = (typeof MARKETPLACE_PAYMENT_TOKENS)[number];

type ImportMetaEnvWithLegacy = ImportMetaEnv & {
  MARKETPLACE_CONTRACT_ADDRESS?: string;
};

function readEnvValue(key: keyof ImportMetaEnvWithLegacy): string {
  const value = (import.meta.env as ImportMetaEnvWithLegacy)[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getMarketplacePaymentConfig() {
  const marketplaceContractAddress =
    readEnvValue("VITE_MARKETPLACE_CONTRACT_ADDRESS") || readEnvValue("MARKETPLACE_CONTRACT_ADDRESS");
  const chainIdRaw = readEnvValue("VITE_MARKETPLACE_CHAIN_ID");
  const marketplaceChainId = Number.isFinite(Number(chainIdRaw)) && Number(chainIdRaw) > 0
    ? Number(chainIdRaw)
    : 8453;

  const tokenAddressBySymbol: Record<MarketplacePaymentToken, string> = {
    USDC: readEnvValue("VITE_USDC_CONTRACT_ADDRESS"),
    USDT: readEnvValue("VITE_USDT_CONTRACT_ADDRESS"),
  };

  return {
    marketplaceContractAddress,
    marketplaceChainId,
    tokenAddressBySymbol,
  };
}

export function normalizeMarketplacePaymentToken(value: string | null | undefined): MarketplacePaymentToken {
  const upper = (value ?? "").trim().toUpperCase();
  return upper === "USDT" ? "USDT" : "USDC";
}

export const unifiedMarketplaceAbi = [
  {
    type: "function",
    name: "purchase",
    stateMutability: "nonpayable",
    inputs: [
      { name: "gameId", type: "string" },
      { name: "category", type: "string" },
      { name: "itemId", type: "string" },
      { name: "paymentToken", type: "address" },
      { name: "orderId", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;
