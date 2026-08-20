import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import { useAccess } from "@/contexts/AccessContext";
import { clearAiAgentInfo } from "@/lib/aiAgentStorage";
import {
  clearAiArenaAuthTokens,
  getAiArenaAccessToken,
  tryExchangePrivyTokenForAiArenaToken,
} from "@/lib/aiArenaAuth";
import { clearUserSessionCache } from "@/lib/sessionCleanup";
import {
  clearUserLoginIntent,
  getUserLoginMethod,
  hasUserLoginIntent,
  requestOpenLoginModal,
} from "@/lib/loginModalBus";
import {
  getWalletAddressFromPrivyUser,
  isEmbeddedPrivyConnectedWallet,
  resolvePrivyWalletAddress,
} from "@/lib/privyWallet";
import { authLog, shortAddress } from "@/lib/authLog";

// ── Context type ──────────────────────────────────────────────────────────────

interface AuthContextValue {
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Whitelabel email/Google login does not trigger createOnLogin, allow time for manual createWallet. */
const EMBEDDED_WALLET_PROVISION_TIMEOUT_MS = 90_000;

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Login is Privy's own connect/authenticate state — no separate SIWE signature or
 * backend session. `isAuthenticated` just mirrors Privy. Marketplace/agent endpoints
 * authenticate separately via the AI Arena Gateway token exchange below, which only
 * needs Privy's access token (no wallet signature either).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, getAccessToken, logout: privyLogout, createWallet } = usePrivy();
  const { wallets } = useWallets();
  const queryClient = useQueryClient();
  const { clearAccess } = useAccess();

  const [isLoading, setIsLoading] = useState(false);

  const loginMethod = getUserLoginMethod();
  const walletPreference =
    loginMethod === "email" || loginMethod === "google"
      ? "embedded"
      : loginMethod === "wallet"
        ? "external"
        : "any";
  const resolvedAddress = resolvePrivyWalletAddress(user, wallets, walletPreference);
  const walletAddress = resolvedAddress;

  const walletsRef = useRef(wallets);
  const createWalletInFlightRef = useRef(false);

  useEffect(() => {
    walletsRef.current = wallets;
  }, [wallets]);

  const getAccessTokenRef = useRef(getAccessToken);
  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
  }, [getAccessToken]);

  const clearLocalAuthState = useCallback((options?: { clearAccessCode?: boolean; clearQueryCache?: boolean }) => {
    clearUserLoginIntent();
    clearUserSessionCache();
    // Best-effort cleanup of a Kult JWT left over from before SIWE was removed.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WALLET_KEY);
    clearAiArenaAuthTokens();
    clearAiAgentInfo();
    if (options?.clearAccessCode) {
      clearAccess();
    }
    if (options?.clearQueryCache) {
      queryClient.clear();
    }
  }, [clearAccess, queryClient]);

  // Debug snapshot of the inputs auth decisions depend on.
  useEffect(() => {
    authLog("state", {
      ready,
      authenticated,
      isAuthenticated: ready && authenticated,
      loginMethod,
      walletPreference,
      resolvedAddress: shortAddress(resolvedAddress),
    });
  }, [ready, authenticated, loginMethod, walletPreference, resolvedAddress]);

  // Whitelabel email/Google (loginWithCode / OAuth) does not run createOnLogin, create embedded wallet ourselves.
  useEffect(() => {
    if (!ready || !authenticated || resolvedAddress || !hasUserLoginIntent()) return;
    if (walletPreference !== "embedded") return;

    let cancelled = false;
    setIsLoading(true);
    requestOpenLoginModal({ mode: "finishing" });

    const ensureEmbeddedWallet = async () => {
      if (createWalletInFlightRef.current) return;

      const existing =
        getWalletAddressFromPrivyUser(user, "embedded") ??
        walletsRef.current.find((w) => isEmbeddedPrivyConnectedWallet(w))?.address;
      if (existing) return;

      createWalletInFlightRef.current = true;
      try {
        await createWallet();
      } catch (err) {
        console.warn("[Auth] Embedded wallet creation after email/Google login:", err);
      } finally {
        createWalletInFlightRef.current = false;
      }
    };

    void ensureEmbeddedWallet();

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled) return;
      if (resolvePrivyWalletAddress(user, walletsRef.current, "embedded")) return;

      setIsLoading(false);
      requestOpenLoginModal({
        mode: "recover",
        message:
          "We couldn't finish setting up your wallet. Please try again, your account was created and should work on retry.",
      });
    }, EMBEDDED_WALLET_PROVISION_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [ready, authenticated, resolvedAddress, user, walletPreference, createWallet, wallets]);

  // Once Privy reports a connected session (and, for email/Google, once the embedded
  // wallet above is actually ready), settle login intent and pick up the AI Arena
  // Gateway token used by marketplace/agent endpoints.
  useEffect(() => {
    if (!ready || !authenticated) return;
    if (walletPreference === "embedded" && !resolvedAddress) return;

    setIsLoading(false);
    clearUserLoginIntent();

    if (getAiArenaAccessToken()) return;
    void (async () => {
      const privyAccessToken = await getAccessTokenRef.current();
      if (privyAccessToken) {
        await tryExchangePrivyTokenForAiArenaToken(privyAccessToken);
      }
    })();
  }, [ready, authenticated, walletPreference, resolvedAddress]);

  const beginLogin = useCallback(() => {
    requestOpenLoginModal();
  }, []);

  const handleLogout = async () => {
    clearLocalAuthState({ clearAccessCode: true, clearQueryCache: true });
    await privyLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isAuthenticated: ready && authenticated,
        isLoading: !ready || isLoading,
        login: beginLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
