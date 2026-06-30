import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { playerApi } from "@/api/playerApi";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import { useAccess } from "@/contexts/AccessContext";
import { clearAiAgentInfo } from "@/lib/aiAgentStorage";
import {
  clearAiArenaAuthTokens,
  getAiArenaAccessToken,
  tryExchangePrivyTokenForAiArenaToken,
} from "@/lib/aiArenaAuth";
import { clearUserSessionCache } from "@/lib/sessionCleanup";
import { buildSiweMessage, fetchSiweNonce } from "@/lib/siwe";
import {
  clearUserLoginIntent,
  getUserLoginMethod,
  hasUserLoginIntent,
  requestOpenLoginModal,
} from "@/lib/loginModalBus";
import { getAllowedChainFromEnv } from "@/lib/chain";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import {
  isEmbeddedPrivyConnectedWallet,
  pickSigningWallet,
  resolvePrivyWalletAddress,
  signMessageWithPrivyWallet,
} from "@/lib/privyWallet";
import type { Player } from "@/types/api";

// ── Context type ──────────────────────────────────────────────────────────────

interface AuthContextValue {
  player: Player | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Dedupes SIWE across React Strict Mode remounts (refs reset; a second `personal_sign` was still fired). */
const siweInFlightByAddress = new Map<string, Promise<void>>();
const SIGNING_WALLET_WAIT_MS = 20_000;
const SIGNING_WALLET_POLL_MS = 250;
const PERSONAL_SIGN_TIMEOUT_MS = 45_000;
/** Hard cap for the full SIWE pipeline (nonce, sign, backend login). */
const SIWE_RUN_TIMEOUT_MS = 90_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      window.setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

function isMissingSigningWalletError(error: unknown) {
  return error instanceof Error && error.message === "No Privy wallet available to sign";
}

function isKultSessionValidForAddress(address: string) {
  const token = localStorage.getItem(TOKEN_KEY);
  const wallet = localStorage.getItem(WALLET_KEY);
  return Boolean(token && wallet?.toLowerCase() === address.toLowerCase());
}

async function waitForSigningWallet(
  getWallet: () => ReturnType<typeof pickSigningWallet>,
  timeoutMs = SIGNING_WALLET_WAIT_MS,
): Promise<ReturnType<typeof pickSigningWallet>> {
  const startedAt = Date.now();
  let wallet = getWallet();

  while (!wallet && Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => window.setTimeout(resolve, SIGNING_WALLET_POLL_MS));
    wallet = getWallet();
  }

  return wallet;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, getAccessToken, logout: privyLogout } = usePrivy();
  const { wallets } = useWallets();
  const queryClient = useQueryClient();
  const { clearAccess } = useAccess();

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasKultSession, setHasKultSession] = useState(
    () => typeof localStorage !== "undefined" && !!localStorage.getItem(TOKEN_KEY),
  );

  const loginMethod = getUserLoginMethod();
  const walletPreference =
    loginMethod === "email" || loginMethod === "google"
      ? "embedded"
      : loginMethod === "wallet"
        ? "external"
        : "any";
  const resolvedAddress = resolvePrivyWalletAddress(user, wallets, walletPreference);
  const walletAddress = resolvedAddress ?? localStorage.getItem(WALLET_KEY);

  const walletsRef = useRef(wallets);
  const staleLogoutInFlightRef = useRef(false);

  useEffect(() => {
    walletsRef.current = wallets;
  }, [wallets]);

  const getAccessTokenRef = useRef(getAccessToken);
  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
  }, [getAccessToken]);

  const clearLocalAuthState = useCallback((options?: { clearAccessCode?: boolean; clearQueryCache?: boolean }) => {
    siweInFlightByAddress.clear();
    clearUserLoginIntent();
    clearUserSessionCache();
    playerApi.logout();
    clearAiArenaAuthTokens();
    clearAiAgentInfo();
    if (options?.clearAccessCode) {
      clearAccess();
    }
    if (options?.clearQueryCache) {
      queryClient.clear();
    }
    setHasKultSession(false);
    setPlayer(null);
  }, [clearAccess, queryClient]);

  const resetStalePrivySession = useCallback(async () => {
    if (staleLogoutInFlightRef.current) return;
    staleLogoutInFlightRef.current = true;
    try {
      clearLocalAuthState();
      await privyLogout();
    } catch {
      /* best-effort Privy disconnect */
    } finally {
      staleLogoutInFlightRef.current = false;
    }
  }, [clearLocalAuthState, privyLogout]);

  const fetchProfile = useCallback(async () => {
    try {
      const p = await playerApi.getProfile();
      setPlayer(p);
    } catch {
      // token may be expired — interceptor clears it on 401
    }
  }, []);

  // Orphaned Kult token without a live Privy session.
  useEffect(() => {
    if (!ready || authenticated) return;
    if (!localStorage.getItem(TOKEN_KEY)) return;
    clearLocalAuthState();
  }, [ready, authenticated, clearLocalAuthState]);

  // Restore an existing Kult session when Privy and stored wallet match.
  useEffect(() => {
    if (!ready || !authenticated || !resolvedAddress) return;
    if (!isKultSessionValidForAddress(resolvedAddress)) return;

    setHasKultSession(true);
    void fetchProfile();
    if (!getAiArenaAccessToken()) {
      void (async () => {
        const privyAccessToken = await getAccessTokenRef.current();
        if (privyAccessToken) {
          await tryExchangePrivyTokenForAiArenaToken(privyAccessToken);
        }
      })();
    }
  }, [ready, authenticated, resolvedAddress, fetchProfile]);

  // Privy session restored without a valid Kult token — disconnect fully (no auto SIWE).
  useEffect(() => {
    if (!ready || !authenticated || hasUserLoginIntent()) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      void resetStalePrivySession();
      return;
    }

    if (resolvedAddress && !isKultSessionValidForAddress(resolvedAddress)) {
      void resetStalePrivySession();
    }
  }, [ready, authenticated, resolvedAddress, resetStalePrivySession]);

  // Privy may provision embedded wallets after email/Google — only while user initiated login.
  useEffect(() => {
    if (!ready || !authenticated || resolvedAddress || !hasUserLoginIntent()) return;
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      setIsLoading(false);
      if (!resolvePrivyWalletAddress(user, walletsRef.current, walletPreference)) {
        requestOpenLoginModal({
          mode: "recover",
          message:
            walletPreference === "embedded"
              ? "Your email/Google wallet is still being set up. Please wait a moment and try again."
              : "Your wallet is still being set up. Please wait a moment and try again, or use Wallet login.",
        });
      }
    }, SIGNING_WALLET_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [ready, authenticated, resolvedAddress, user, walletPreference]);

  // SIWE only when the user explicitly started login (Connect / wallet / email / Google).
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) return;
    if (!hasUserLoginIntent()) return;

    const address = resolvedAddress;
    if (!address) return;

    if (isKultSessionValidForAddress(address)) {
      setHasKultSession(true);
      void fetchProfile();
      if (!getAiArenaAccessToken()) {
        void (async () => {
          const privyAccessToken = await getAccessTokenRef.current();
          if (privyAccessToken) {
            await tryExchangePrivyTokenForAiArenaToken(privyAccessToken);
          }
        })();
      }
      clearUserLoginIntent();
      return;
    }

    const addrKey = address.toLowerCase();
    const existingRun = siweInFlightByAddress.get(addrKey);
    if (existingRun) {
      setIsLoading(true);
      void existingRun.finally(() => setIsLoading(false));
      return;
    }

    setIsLoading(true);
    requestOpenLoginModal({ mode: "finishing" });
    if (walletPreference === "embedded") {
    } else {
    }

    const run = withTimeout(
      (async () => {
        const nonce = await fetchSiweNonce(address);
        const message = buildSiweMessage(address, nonce);

        const privyWallet = await waitForSigningWallet(() =>
          pickSigningWallet(walletsRef.current, address, walletPreference)
        );
        if (!privyWallet) throw new Error("No Privy wallet available to sign");

        const allowedChain = getAllowedChainFromEnv();
        const embedded = isEmbeddedPrivyConnectedWallet(privyWallet);

        if (!embedded) {
          try {
            if (typeof privyWallet.switchChain === "function") {
              await privyWallet.switchChain(allowedChain.decimalChainId);
            } else {
              const p = await privyWallet.getEthereumProvider();
              await ensureWalletOnAllowedChain(p, allowedChain);
            }
          } catch {
            /* proceed to sign regardless */
          }
        }

        const signature = await withTimeout(
          signMessageWithPrivyWallet(privyWallet, message, address),
          PERSONAL_SIGN_TIMEOUT_MS,
          "Wallet signature",
        );

        const res = await playerApi.login(address, message, signature);
        setHasKultSession(true);
        setPlayer(res.player);

        const privyAccessToken = await getAccessTokenRef.current();
        if (privyAccessToken) {
          await tryExchangePrivyTokenForAiArenaToken(privyAccessToken);
        }
      })(),
      SIWE_RUN_TIMEOUT_MS,
      "Sign-in",
    );

    siweInFlightByAddress.set(addrKey, run);

    void run
      .catch(async (err) => {
        if (localStorage.getItem(TOKEN_KEY)) {
          setHasKultSession(true);
          console.warn("[SIWE] Post-login step failed (session kept):", err);
          return;
        }

        console.error("[SIWE] Login failed:", err);
        clearLocalAuthState();

        try {
          await privyLogout();
        } catch {
          /* best-effort session reset */
        }

        const message = isMissingSigningWalletError(err)
          ? "No wallet was available to finish sign-in. Please choose wallet, email, or Google to continue."
          : err instanceof Error && err.message.includes("timed out")
            ? "The wallet prompt timed out. Please try again and approve the signature request."
            : "Could not finish sign-in. Please try again.";

        requestOpenLoginModal({ mode: "recover", message });
      })
      .finally(() => {
        clearUserLoginIntent();
        setIsLoading(false);
        if (siweInFlightByAddress.get(addrKey) === run) {
          siweInFlightByAddress.delete(addrKey);
        }
      });
  }, [ready, authenticated, resolvedAddress, fetchProfile, privyLogout, clearLocalAuthState, walletPreference]);

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
        player,
        walletAddress,
        isAuthenticated: authenticated && hasKultSession,
        isLoading: !ready || isLoading,
        login: beginLogin,
        logout: handleLogout,
        refetchProfile: fetchProfile,
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
