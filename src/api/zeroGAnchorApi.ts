/**
 * 0G play-session anchoring.
 *
 * Posts a small JSON record — wallet address, game, date/time — to the 0G
 * RoboWars backend, which uploads it to 0G Storage. That upload is an on-chain
 * Flow contract transaction, so every anchor leaves a permanent, content-
 * addressed trace (`rootHash`) plus a DA commitment.
 *
 * Deliberately fire-and-forget: it runs alongside user actions like a game
 * download and must never delay or block them. Every failure path resolves to
 * `null` rather than throwing.
 *
 * This route is unauthenticated on the backend, so the wallet address here is
 * self-declared. These records are engagement telemetry, not proof of play —
 * anything needing cryptographic attribution goes through the signed
 * `/save/upload` flow instead.
 */

import { WALLET_KEY } from "@/constants/storageKeys";
import { ROBOWARS_ZG_BACKEND } from "@/lib/serviceUrls";

/** Anchors are best-effort; don't leave a request hanging past this. */
const ANCHOR_TIMEOUT_MS = 15_000;

const EVM_ADDRESS_RE = /^0x[0-9a-f]{40}$/;

export interface AnchorPlaySessionInput {
  /** Game slug, e.g. `"robowars"`. */
  game: string;
  /** What the player did, e.g. `"download"`. Defaults to `"download"`. */
  event?: string;
  /** Extra fields to embed in the anchored JSON. Keep it small and non-personal. */
  metadata?: Record<string, unknown>;
}

export interface AnchorPlaySessionResult {
  anchorId: string;
  walletAddress: string;
  game: string;
  event: string;
  /** 0G Storage Merkle root — the permanent identifier of the anchored JSON. */
  rootHash: string;
  /** EVM tx hash of the Flow contract submission. */
  txHash: string;
  checksum: string;
  payloadSize: number;
  daStatus: "pending" | "finalized" | "failed";
  payload: Record<string, unknown>;
}

/**
 * The wallet address persisted after login, or `null` when signed out or when
 * storage is unavailable (private mode, sandboxed iframe).
 */
export function readStoredWalletAddress(): string | null {
  try {
    const raw = localStorage.getItem(WALLET_KEY)?.trim().toLowerCase() ?? "";
    return EVM_ADDRESS_RE.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** True when a backend URL is configured and a wallet is available to anchor. */
export function canAnchorPlaySession(): boolean {
  return Boolean(ROBOWARS_ZG_BACKEND) && readStoredWalletAddress() !== null;
}

/**
 * Anchor one play session on 0G Storage.
 *
 * Resolves with the anchor receipt, or `null` if anchoring was skipped
 * (no backend configured, signed out) or failed for any reason.
 */
export async function anchorPlaySession({
  game,
  event = "download",
  metadata,
}: AnchorPlaySessionInput): Promise<AnchorPlaySessionResult | null> {
  if (!ROBOWARS_ZG_BACKEND) return null;

  const walletAddress = readStoredWalletAddress();
  if (!walletAddress) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANCHOR_TIMEOUT_MS);

  try {
    const response = await fetch(`${ROBOWARS_ZG_BACKEND}/save/anchor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        walletAddress,
        game,
        event,
        playedAt: new Date().toISOString(),
        metadata: {
          source: "kult-web",
          // Local timezone gives the UTC date/time in the blob a readable
          // counterpart without storing anything that identifies the device.
          timezone: resolveTimezone(),
          ...metadata,
        },
      }),
    });

    if (!response.ok) {
      console.warn("[0G] anchor rejected", response.status, await safeText(response));
      return null;
    }

    return (await response.json()) as AnchorPlaySessionResult;
  } catch (error) {
    // Offline, CORS, timeout, backend down — anchoring is optional, move on.
    console.warn("[0G] anchor failed", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function resolveTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
