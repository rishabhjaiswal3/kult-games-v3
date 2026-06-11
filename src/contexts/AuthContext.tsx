import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { playerApi } from "@/api/playerApi";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import { clearAiAgentInfo } from "@/lib/aiAgentStorage";
import {
  clearAiArenaAuthTokens,
  exchangePrivyTokenForAiArenaToken,
  getAiArenaAccessToken,
} from "@/lib/aiArenaAuth";
import { buildSiweMessage, fetchSiweNonce } from "@/lib/siwe";
import { requestOpenLoginModal } from "@/lib/loginModalBus";
import { getAllowedChainFromEnv } from "@/lib/chain";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import {
  isEmbeddedPrivyConnectedWallet,
  pickSigningWallet,
  resolvePrivyWalletAddress,
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
const SIGNING_WALLET_WAIT_MS = 8_000;
const SIGNING_WALLET_POLL_MS = 250;
const PERSONAL_SIGN_TIMEOUT_MS = 45_000;

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

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resolvedAddress = resolvePrivyWalletAddress(user, wallets);
  const walletAddress = resolvedAddress ?? localStorage.getItem(WALLET_KEY);

  const walletsRef = useRef(wallets);
  useEffect(() => {
    walletsRef.current = wallets;
  }, [wallets]);

  const getAccessTokenRef = useRef(getAccessToken);
  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
  }, [getAccessToken]);

  const fetchProfile = useCallback(async () => {
    try {
      const p = await playerApi.getProfile();
      setPlayer(p);
    } catch {
      // token may be expired — interceptor clears it on 401
    }
  }, []);

  // Privy may provision embedded wallets a moment after email/Google auth — wait without calling createWallet again.
  useEffect(() => {
    if (!ready || !authenticated || resolvedAddress) return;
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 12_000);
    return () => window.clearTimeout(timer);
  }, [ready, authenticated, resolvedAddress]);

  // When Privy authenticates, run the full SIWE flow and AI Arena token exchange.
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) return;

    const address = resolvedAddress;
    if (!address) return;

    const existingToken = localStorage.getItem(TOKEN_KEY);
    const existingWallet = localStorage.getItem(WALLET_KEY);

    if (existingToken && existingWallet?.toLowerCase() === address.toLowerCase()) {
      void fetchProfile();
      if (!getAiArenaAccessToken()) {
        void (async () => {
          try {
            const privyAccessToken = await getAccessTokenRef.current();
            if (privyAccessToken) {
              await exchangePrivyTokenForAiArenaToken(privyAccessToken);
            }
          } catch {
            /* non-blocking */
          }
        })();
      }
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

    const run = (async () => {
      const nonce = await fetchSiweNonce(address);
      const message = buildSiweMessage(address, nonce);

      const privyWallet = await waitForSigningWallet(() =>
        pickSigningWallet(walletsRef.current, address)
      );
      if (!privyWallet) throw new Error("No Privy wallet available to sign");

      const allowedChain = getAllowedChainFromEnv();
      const embedded = isEmbeddedPrivyConnectedWallet(privyWallet);

      // Embedded wallets stay on Privy's default chain; forcing 0G breaks Google/email login.
      // Chain switch is best-effort — personal_sign works on any chain.
      if (!embedded) {
        try {
          if (typeof privyWallet.switchChain === "function") {
            await privyWallet.switchChain(allowedChain.decimalChainId);
          } else {
            const p = await privyWallet.getEthereumProvider();
            await ensureWalletOnAllowedChain(p, allowedChain);
          }
        } catch {
          /* proceed to sign regardless — chain mismatch doesn't block SIWE */
        }
      }

      const provider = await privyWallet.getEthereumProvider();

      // Re-authorize account before signing — Privy's provider can lose authorization
      // between connection and SIWE, causing error 4100 ("not authorized by the user").
      try {
        await provider.request({ method: "eth_requestAccounts" });
      } catch {
        /* best-effort; personal_sign may still work without it */
      }

      const signature = (await withTimeout(
        provider.request({ method: "personal_sign", params: [message, address] }) as Promise<string>,
        PERSONAL_SIGN_TIMEOUT_MS,
        "Wallet signature",
      )) as string;

      const res = await playerApi.login(address, message, signature);
      setPlayer(res.player);

      // AI Arena token exchange is non-blocking — its failure must not
      // invalidate the successful Kult login above.
      try {
        const privyAccessToken = await getAccessTokenRef.current();
        if (privyAccessToken) {
          await exchangePrivyTokenForAiArenaToken(privyAccessToken);
        }
      } catch (aiErr) {
        console.warn("[AI Arena] Token exchange failed (non-blocking):", aiErr);
      }
    })();

    siweInFlightByAddress.set(addrKey, run);

    void run
      .catch(async (err) => {
        console.error("[SIWE] Login failed:", err);
        playerApi.logout();

        if (isMissingSigningWalletError(err)) {
          try {
            await privyLogout();
          } catch {
            /* best-effort session reset */
          }

          requestOpenLoginModal({
            mode: "recover",
            message:
              "No wallet was available to finish sign-in. Please choose wallet, email, or Google to continue.",
          });
          toast.error(
            "No wallet was available to finish sign-in. Please choose wallet, email, or Google to continue."
          );
          return;
        }

        // For all other failures (timeout, rejection, backend error) reset the modal so the
        // spinner doesn't stay stuck — authenticated stays true but isAuthenticated is false,
        // so the modal has no other path to clear finishingSignIn.
        const message =
          err instanceof Error && err.message.includes("timed out")
            ? "The wallet prompt timed out. Please try again and approve the signature request."
            : "Could not finish sign-in. Please try again.";
        requestOpenLoginModal({ mode: "recover", message });
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
        if (siweInFlightByAddress.get(addrKey) === run) {
          siweInFlightByAddress.delete(addrKey);
        }
      });
  }, [ready, authenticated, resolvedAddress, wallets, fetchProfile]);

  const handleLogout = async () => {
    siweInFlightByAddress.clear();
    playerApi.logout();
    clearAiArenaAuthTokens();
    clearAiAgentInfo();
    setPlayer(null);
    await privyLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        player,
        walletAddress,
        isAuthenticated: authenticated && !!localStorage.getItem(TOKEN_KEY),
        isLoading: !ready || isLoading,
        login: requestOpenLoginModal,
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
