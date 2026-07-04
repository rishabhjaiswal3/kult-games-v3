import { ClobClient, type ApiKeyCreds } from "@polymarket/clob-client";
import { createWalletClient, custom } from "viem";
import { polygon } from "viem/chains";

const CLOB_HOST = "https://clob.polymarket.com";
const POLYGON_CHAIN_ID = 137;

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function credsStorageKey(address: string): string {
  return `kult_polymarket_clob_creds_${address.toLowerCase()}`;
}

function loadCachedCreds(address: string): ApiKeyCreds | null {
  try {
    const raw = localStorage.getItem(credsStorageKey(address));
    return raw ? (JSON.parse(raw) as ApiKeyCreds) : null;
  } catch {
    return null;
  }
}

function saveCachedCreds(address: string, creds: ApiKeyCreds): void {
  localStorage.setItem(credsStorageKey(address), JSON.stringify(creds));
}

/** Whether this wallet has already derived a CLOB API key -- lets the UI skip re-showing "enable trading". */
export function hasCachedCreds(address: string): boolean {
  return loadCachedCreds(address) !== null;
}

/**
 * Build a ClobClient wired to the user's own wallet as signer (docs/polymarket
 * §5 Phase 4). Derives (or reuses a cached) per-wallet L2 API key -- this is
 * the user's own credential, generated on the fly by one signature; nothing
 * is registered with Polymarket as a platform/company for this to work.
 * Never touches the user's private key directly: the viem WalletClient
 * signs through the wallet's own provider (Privy's getEthereumProvider()).
 */
export async function getClobClient(address: string, provider: Eip1193Provider): Promise<ClobClient> {
  const walletClient = createWalletClient({
    account: address as `0x${string}`,
    chain: polygon,
    transport: custom(provider),
  });

  const cached = loadCachedCreds(address);
  if (cached) {
    return new ClobClient(CLOB_HOST, POLYGON_CHAIN_ID, walletClient, cached);
  }

  const bootstrapClient = new ClobClient(CLOB_HOST, POLYGON_CHAIN_ID, walletClient);
  const creds = await bootstrapClient.createOrDeriveApiKey();
  saveCachedCreds(address, creds);
  return new ClobClient(CLOB_HOST, POLYGON_CHAIN_ID, walletClient, creds);
}
