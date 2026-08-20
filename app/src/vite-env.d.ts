/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_PRIVY_APP_ID?: string;
  readonly VITE_AI_ARENA_GATEWAY_URL?: string;
  readonly VITE_MARKETPLACE_CONTRACT_ADDRESS?: string;
  readonly VITE_MARKETPLACE_CHAIN_ID?: string;
  readonly VITE_USDC_CONTRACT_ADDRESS?: string;
  readonly VITE_USDT_CONTRACT_ADDRESS?: string;
  readonly VITE_ALLOWED_CHAIN_ID?: string;
  readonly VITE_ALLOWED_CHAIN_NAME?: string;
  readonly VITE_ALLOWED_RPC_URL?: string;
  readonly VITE_ALLOWED_EXPLORER_URL?: string;
  readonly VITE_ALLOWED_NATIVE_NAME?: string;
  readonly VITE_ALLOWED_NATIVE_SYMBOL?: string;
  readonly VITE_ALLOWED_NATIVE_DECIMALS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
