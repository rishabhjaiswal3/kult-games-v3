/**
 * USDC collateral on Polygon that Polymarket's CTF Exchange actually
 * settles in -- docs/polymarket/knowledge_polymarket.md Phase 3/4.
 *
 * This is bridged USDC.e, not native (Circle-issued) USDC. Confirmed
 * directly from Polymarket's own published @polymarket/clob-client package
 * (dist/config.js, MATIC_CONTRACTS.collateral) rather than assumed --
 * an earlier version of this file guessed native USDC, which would have
 * shown a wrong (likely $0) balance for a properly-funded wallet.
 */
export const POLYGON_USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as const;
export const POLYGON_USDC_DECIMALS = 6;

/** Polymarket's deployed Polygon mainnet contracts, same source as above. */
export const POLYMARKET_CONTRACTS = {
  exchange: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E",
  negRiskAdapter: "0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296",
  negRiskExchange: "0xC5d563A36AE78145C45a50134d48A1215220f80a",
  conditionalTokens: "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045",
} as const;
