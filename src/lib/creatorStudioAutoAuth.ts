import axios from "axios";
import { MAIN_BACKEND } from "@/lib/serviceUrls";
import { WALLET_KEY } from "@/constants/storageKeys";

// Keys used by `creator-studio-frontend-tg` for identity + API auth caching.
// Keeping the strings here avoids importing creator-studio code into this app.
const CREATOR_STUDIO_STORAGE_KEYS = {
  // Identity (used for "current user id" and token aliasing)
  privyUserId: "kult_privy_user_id",
  privyDid: "kult_privy_did",
  privyWallet: "kult_privy_wallet",
  privyTonWallet: "kult_privy_ton_wallet",
  privyTelegramUser: "kult_privy_telegram_user",
  privyUsername: "kult_privy_username",

  // Backend JWT (used for Authorization: Bearer on creator-studio API requests)
  authToken: "kult-auth-token",
  authTokenUser: "kult-auth-token-user",
  authTokenEvmWallet: "kult-auth-token-evm-wallet",
} as const;

function safeSet(key: string, value: string | null | undefined) {
  try {
    if (value?.trim()) localStorage.setItem(key, value.trim());
    else localStorage.removeItem(key);
  } catch {
    // localStorage unavailable, ignore
  }
}

function normalizeEvmAddress(address: string | null | undefined): string | null {
  const raw = String(address ?? "").trim();
  if (!raw) return null;
  if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) return raw;
  return raw.toLowerCase();
}

export function seedCreatorStudioIdentity(options: {
  walletAddress?: string | null;
  privyDid?: string | null;
  username?: string | null;
}) {
  const wallet = normalizeEvmAddress(options.walletAddress);
  const did = String(options.privyDid ?? "").trim() || null;

  // Keep `kult_wallet` in sync so creator-studio can fall back to it.
  if (wallet) safeSet(WALLET_KEY, wallet);

  safeSet(CREATOR_STUDIO_STORAGE_KEYS.privyDid, did);
  safeSet(CREATOR_STUDIO_STORAGE_KEYS.privyWallet, wallet);
  safeSet(CREATOR_STUDIO_STORAGE_KEYS.privyUsername, options.username ?? null);

  // Creator-studio's "current user id" prefers the EVM wallet when available.
  safeSet(CREATOR_STUDIO_STORAGE_KEYS.privyUserId, wallet ?? did);

  // These identities are optional; clear to avoid stale cross-mode data.
  safeSet(CREATOR_STUDIO_STORAGE_KEYS.privyTonWallet, null);
  safeSet(CREATOR_STUDIO_STORAGE_KEYS.privyTelegramUser, null);
}

type CreatorStudioAuthTokenResponse = {
  token?: string;
  privyUserId?: string;
  userId?: string;
  evmWalletAddress?: string;
};

export async function tryFetchAndStoreCreatorStudioAuthToken(options: {
  privyAccessToken: string;
  walletAddress?: string | null;
  privyDid?: string | null;
}) {
  const access = String(options.privyAccessToken ?? "").trim();
  if (!access) return null;

  const body = { privyAccessToken: access };
  const { data } = await axios.post<CreatorStudioAuthTokenResponse>(`${MAIN_BACKEND}/auth/token`, body, {
    timeout: 10_000,
    withCredentials: true,
  });

  const token = typeof data?.token === "string" ? data.token : "";
  if (!token) return null;

  const wallet = normalizeEvmAddress(data?.evmWalletAddress ?? options.walletAddress) ?? null;
  const identity =
    String(data?.privyUserId ?? data?.userId ?? options.privyDid ?? wallet ?? "").trim() || null;

  safeSet(CREATOR_STUDIO_STORAGE_KEYS.authToken, token);
  safeSet(CREATOR_STUDIO_STORAGE_KEYS.authTokenUser, identity);
  safeSet(CREATOR_STUDIO_STORAGE_KEYS.authTokenEvmWallet, wallet);

  return token;
}

