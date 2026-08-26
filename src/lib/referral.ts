import { StorageKeys } from "@/constants/storageKeys";

/**
 * Reads `?referral=<code>` from the current URL (if present) and persists it,
 * so it survives the wallet-connect flow up to the point of login.
 */
export function captureReferralCodeFromUrl(): void {
  try {
    const code = new URLSearchParams(window.location.search).get("referral");
    if (code) localStorage.setItem(StorageKeys.local.referralCode, code);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readStoredReferralCode(): string | undefined {
  try {
    return localStorage.getItem(StorageKeys.local.referralCode) ?? undefined;
  } catch {
    return undefined;
  }
}

export function clearStoredReferralCode(): void {
  try {
    localStorage.removeItem(StorageKeys.local.referralCode);
  } catch {
    /* ignore */
  }
}
