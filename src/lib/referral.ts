import { StorageKeys } from "@/constants/storageKeys";
import { authLog, authWarn } from "@/lib/authLog";

/**
 * Reads `?referral=<code>` from the current URL (if present) and persists it,
 * so it survives the wallet-connect flow up to the point of login.
 */
export function captureReferralCodeFromUrl(): void {
  try {
    const code = new URLSearchParams(window.location.search).get("referral");
    if (code) {
      localStorage.setItem(StorageKeys.local.referralCode, code);
      authLog("referral code captured from URL", { code, url: window.location.href });
    } else {
      authLog("no referral param on this URL", { url: window.location.href });
    }
  } catch (err) {
    authWarn("referral code capture failed", { err: String(err) });
  }
}

export function readStoredReferralCode(): string | undefined {
  try {
    const code = localStorage.getItem(StorageKeys.local.referralCode) ?? undefined;
    authLog("referral code read from storage for login", { code: code ?? null });
    return code;
  } catch (err) {
    authWarn("referral code read failed", { err: String(err) });
    return undefined;
  }
}

export function clearStoredReferralCode(): void {
  try {
    localStorage.removeItem(StorageKeys.local.referralCode);
    authLog("referral code cleared after successful login");
  } catch (err) {
    authWarn("referral code clear failed", { err: String(err) });
  }
}
