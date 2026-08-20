import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  getPrivyWalletAddresses,
  getWalletAddressFromPrivyUser,
  isEmbeddedPrivyConnectedWallet,
  pickSigningWallet,
  resolvePrivyWalletAddress,
  signMessageWithPrivyWallet,
} from "@/lib/privyWallet";
import { authLog, authWarn, shortAddress, tokenFingerprint } from "@/lib/authLog";
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
const SIGNING_WALLET_WAIT_MS = 45_000;
const SIGNING_WALLET_POLL_MS = 250;
/** Whitelabel email/Google login does not trigger createOnLogin, allow time for manual createWallet. */
const EMBEDDED_WALLET_PROVISION_TIMEOUT_MS = 90_000;
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

/**
 * The Kult JWT is bound to the address that signed SIWE, which is not always the address
 * `resolvePrivyWalletAddress` currently prefers: the preference is derived from login
 * intent, and intent is cleared the moment SIWE finishes. A user who signed in with an
 * external wallet then resolves to their embedded wallet instead, so an exact comparison
 * turns a healthy session into a "stale" one and silently logs them back out.
 */
function isKultSessionValidForAnyAddress(addresses: string[]) {
  const token = localStorage.getItem(TOKEN_KEY);
  const wallet = localStorage.getItem(WALLET_KEY)?.toLowerCase();
  if (!token || !wallet) return false;
  if (addresses.length === 0) return true;
  return addresses.includes(wallet);
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
  const { ready, authenticated, user, getAccessToken, logout: privyLogout, createWallet } = usePrivy();
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
  // `user` and `wallets` get new identities on most renders; keying off the joined
  // addresses keeps the session effects below from re-running on every one of them.
  const knownAddressesKey = getPrivyWalletAddresses(user, wallets).join(",");
  const knownAddresses = useMemo(
    () => (knownAddressesKey ? knownAddressesKey.split(",") : []),
    [knownAddressesKey],
  );

  const walletsRef = useRef(wallets);
  const staleLogoutInFlightRef = useRef(false);
  const createWalletInFlightRef = useRef(false);

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

  const resetStalePrivySession = useCallback(async (reason: string) => {
    if (staleLogoutInFlightRef.current) return;
    staleLogoutInFlightRef.current = true;
    authWarn("stale-session reset — clearing Kult token and disconnecting Privy", {
      reason,
      storedWallet: shortAddress(localStorage.getItem(WALLET_KEY)),
      hadToken: !!localStorage.getItem(TOKEN_KEY),
    });
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
      // token may be expired, interceptor clears it on 401
    }
  }, []);

  // Snapshot of every input the session decisions below depend on.
  useEffect(() => {
    authLog("state", {
      ready,
      privyAuthenticated: authenticated,
      hasKultSession,
      isAuthenticated: authenticated && hasKultSession,
      loginIntent: hasUserLoginIntent(),
      loginMethod,
      walletPreference,
      resolvedAddress: shortAddress(resolvedAddress),
      knownAddresses: knownAddresses.map((a) => shortAddress(a)),
      storedWallet: shortAddress(localStorage.getItem(WALLET_KEY)),
      storedToken: tokenFingerprint(localStorage.getItem(TOKEN_KEY)),
    });
  }, [
    ready,
    authenticated,
    hasKultSession,
    loginMethod,
    walletPreference,
    resolvedAddress,
    knownAddresses,
  ]);

  // Orphaned Kult token without a live Privy session.
  useEffect(() => {
    if (!ready || authenticated) return;
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authWarn("orphaned Kult token without a Privy session — clearing", {
      storedWallet: shortAddress(localStorage.getItem(WALLET_KEY)),
    });
    clearLocalAuthState();
  }, [ready, authenticated, clearLocalAuthState]);

  // Restore an existing Kult session when the stored wallet belongs to this Privy user.
  useEffect(() => {
    if (!ready || !authenticated) return;
    if (!isKultSessionValidForAnyAddress(knownAddresses)) return;

    authLog("restoring stored Kult session", {
      storedWallet: shortAddress(localStorage.getItem(WALLET_KEY)),
    });
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
  }, [ready, authenticated, knownAddresses, fetchProfile]);

  // Privy session restored without a valid Kult token, disconnect fully (no auto SIWE).
  useEffect(() => {
    if (!ready || !authenticated || hasUserLoginIntent()) return;
    // A SIWE run still in flight has not written its token yet — resetting here would
    // cancel the very login that is about to succeed.
    if (siweInFlightByAddress.size > 0) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      void resetStalePrivySession("privy authenticated but no Kult token stored");
      return;
    }

    // Privy can report zero wallets for a moment right after login; treating that as a
    // mismatch would log the user straight back out.
    if (knownAddresses.length > 0 && !isKultSessionValidForAnyAddress(knownAddresses)) {
      void resetStalePrivySession("stored wallet is not linked to this Privy user");
    }
  }, [ready, authenticated, knownAddresses, resetStalePrivySession]);

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

  // SIWE only when the user explicitly started login (Connect / wallet / email / Google).
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) return;
    if (!hasUserLoginIntent()) return;

    const address = resolvedAddress;
    if (!address) return;

    if (isKultSessionValidForAddress(address)) {
      authLog("SIWE skipped — stored session already matches this address", {
        address: shortAddress(address),
      });
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
    authLog("SIWE start", { address: shortAddress(address), walletPreference });

    const run = withTimeout(
      (async () => {
        const nonce = await fetchSiweNonce(address);
        const message = buildSiweMessage(address, nonce);
        authLog("SIWE nonce received");

        const privyWallet = await waitForSigningWallet(() =>
          pickSigningWallet(walletsRef.current, address, walletPreference)
        );
        if (!privyWallet) throw new Error("No Privy wallet available to sign");
        authLog("SIWE signing wallet picked", {
          wallet: shortAddress(privyWallet.address),
          clientType: privyWallet.walletClientType,
          matchesLoginAddress: privyWallet.address.toLowerCase() === address.toLowerCase(),
        });

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

        authLog("SIWE signature obtained — calling POST /player/login");
        const res = await playerApi.login(address, message, signature);

        // A 200 with no parsable token is the failure mode that looks like success:
        // nothing lands in localStorage, so the session cannot survive a reload.
        if (!res.token || !localStorage.getItem(TOKEN_KEY)) {
          throw new Error(
            "Login response did not contain a usable token — check the /player/login payload shape",
          );
        }

        authLog("login succeeded — Kult session stored", {
          token: tokenFingerprint(localStorage.getItem(TOKEN_KEY)),
          storedWallet: shortAddress(localStorage.getItem(WALLET_KEY)),
          player: res.player?._id || null,
        });
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
          authWarn("post-login step failed but Kult session was kept", { error: String(err) });
          return;
        }

        authWarn("SIWE failed — no Kult session written", { error: String(err) });
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
        authLog("SIWE finished — login intent cleared", {
          storedToken: tokenFingerprint(localStorage.getItem(TOKEN_KEY)),
          storedWallet: shortAddress(localStorage.getItem(WALLET_KEY)),
        });
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
