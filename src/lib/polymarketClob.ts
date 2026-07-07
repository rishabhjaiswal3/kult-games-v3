import { ClobClient, Chain, type ApiKeyCreds } from "@polymarket/clob-client-v2";
import { createWalletClient, custom } from "viem";
import { polygon } from "viem/chains";

const CLOB_HOST = "https://clob.polymarket.com";

/**
 * Builder Code (Polymarket's simplest attribution tier — a bare bytes32 code,
 * no key/secret/passphrase). Set via VITE_POLYMARKET_BUILDER_CODE.
 *
 * We use @polymarket/clob-client-v2 (not the older @polymarket/clob-client)
 * specifically because builderCode is only meaningful there: v2 serializes it
 * into the actual signed order's `builder` field (see Polymarket's Order
 * Attribution docs), which the v1 client's order schema has no room for at
 * all. Our existing direct-EOA signing flow (Privy wallet, plain approve())
 * needs no changes for this — v2's signatureType defaults to EOA and
 * funderAddress is only needed for Polymarket's separate "deposit wallet"
 * onboarding path, which we don't use.
 */
const POLYMARKET_BUILDER_CODE: string | undefined = import.meta.env.VITE_POLYMARKET_BUILDER_CODE;

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function credsStorageKey(address: string): string {
  return `kult_polymarket_clob_creds_v2_${address.toLowerCase()}`;
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

/** The wallet's cached CLOB API key creds, if already derived. */
export function getCachedCreds(address: string): ApiKeyCreds | null {
  return loadCachedCreds(address);
}

/** The Builder Code attached to every order this app places, if configured. */
export function getBuilderCode(): string | undefined {
  return POLYMARKET_BUILDER_CODE;
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

  // throwOnError is required: by default the SDK returns API failures as a
  // normal resolved { error, status } object instead of throwing, which
  // meant a rejected/unfilled order looked identical to a successful one to
  // every caller here -- a real order silently failed to execute once
  // ("YES ORDER PLACED" shown, zero trades/positions ever appeared on
  // Polymarket, pUSD balance never moved) before this was caught and fixed.
  const cached = loadCachedCreds(address);
  if (cached) {
    return new ClobClient({ host: CLOB_HOST, chain: Chain.POLYGON, signer: walletClient, creds: cached, throwOnError: true });
  }

  const bootstrapClient = new ClobClient({ host: CLOB_HOST, chain: Chain.POLYGON, signer: walletClient, throwOnError: true });
  const creds = await bootstrapClient.createOrDeriveApiKey();
  saveCachedCreds(address, creds);
  return new ClobClient({ host: CLOB_HOST, chain: Chain.POLYGON, signer: walletClient, creds, throwOnError: true });
}
