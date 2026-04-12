import { StorageKeys } from "@/constants/storageKeys";
import { keccak256, type Hex } from "viem";

export function getAgentIdSalt(): string {
  const s = import.meta.env.VITE_AGENT_ID_SALT?.trim();
  return s || "";
}

/** Lowercase 0x-prefixed address for stable binding. */
export function normalizeWalletAddress(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Fixed layout so the same wallet + salt always produces the same bytes to sign
 * (deterministic signatures on most wallets → stable derived id).
 */
export function buildAgentBindingSignMessage(walletAddress: string): string {
  const addr = normalizeWalletAddress(walletAddress);
  const salt = getAgentIdSalt();
  return [
    "Kult AI Agent binding",
    "",
    `Address: ${addr}`,
    `Salt: ${salt}`,
    "",
    "Sign to derive your agent id.",
  ].join("\n");
}

function normalizeSignatureHex(signature: string): Hex {
  const s = signature.trim();
  const with0x = s.startsWith("0x") ? s : `0x${s}`;
  return with0x as Hex;
}

/**
 * Warzone-style agent id: `{normalizedAddress}_{keccak256(signature) without 0x}`.
 * Proves binding to a signing key at creation time; the id string itself is public once sent to APIs.
 */
export function deriveWarzoneAgentId(walletAddress: string, signature: string): string {
  const addr = normalizeWalletAddress(walletAddress);
  const sigHex = normalizeSignatureHex(signature);
  const digest = keccak256(sigHex);
  return `${addr}_${digest.slice(2)}`;
}

export function getStoredWarzoneAgentId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(StorageKeys.session.warzoneAgentId);
}
