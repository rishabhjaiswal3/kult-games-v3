import { MAIN_BACKEND } from "@/lib/serviceUrls";

export function buildSiweMessage(address: string, nonce: string): string {
  const domain = window.location.host;
  const uri = window.location.origin;
  const issuedAt = new Date().toISOString();
  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to Kult Games — your on-chain gaming identity.",
    "",
    `URI: ${uri}`,
    "Version: 1",
    "Chain ID: 1",
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export async function fetchSiweNonce(walletAddress: string): Promise<string> {
  const res = await fetch(
    `${MAIN_BACKEND}/player/nonce?walletAddress=${encodeURIComponent(walletAddress)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch nonce: ${res.status}`);
  const json = await res.json();
  const nonce: unknown = json?.data?.nonce ?? json?.nonce;
  if (typeof nonce !== "string" || !nonce) throw new Error("Invalid nonce response");
  return nonce;
}
