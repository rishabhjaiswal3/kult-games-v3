import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
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
import type { Player } from "@/types/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWalletAddressFromPrivyUser(user: ReturnType<typeof usePrivy>["user"]): string | undefined {
  if (!user) return undefined;
  if ((user as any).wallet?.address) return (user as any).wallet.address;
  const embedded = (user as any).embeddedWallets;
  if (Array.isArray(embedded) && embedded[0]?.address) return embedded[0].address;
  const wallets = (user as any).wallets;
  if (Array.isArray(wallets) && wallets[0]?.address) return wallets[0].address;
  const linked = (user as any).linkedAccounts;
  if (Array.isArray(linked)) {
    const w = linked.find((a: any) => a?.type === "wallet" && a?.address);
    if (w?.address) return w.address;
  }
  return undefined;
}

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

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, getAccessToken, logout: privyLogout } = usePrivy();
  const { wallets } = useWallets();

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = getWalletAddressFromPrivyUser(user) ?? localStorage.getItem(WALLET_KEY);
  const linkedWalletAddress = getWalletAddressFromPrivyUser(user) ?? null;

  // Keep a stable ref to wallets so the useEffect can access them without re-running
  const walletsRef = useRef(wallets);
  useEffect(() => {
    walletsRef.current = wallets;
  }, [wallets]);

  /** Privy's `getAccessToken` identity changes often; including it in deps re-fired SIWE before TOKEN_KEY was set → double `personal_sign`. */
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

  // When Privy authenticates, run the full SIWE flow and AI Arena token exchange.
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      return;
    }

    const address = linkedWalletAddress;
    if (!address) return;

    const existingToken = localStorage.getItem(TOKEN_KEY);
    const existingWallet = localStorage.getItem(WALLET_KEY);

    // Already logged in with the same wallet — just refresh the profile
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
            /* non-blocking; AI Arena auth can be retried later */
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
      // 1. Get a one-time nonce from the backend
      const nonce = await fetchSiweNonce(address);

      // 2. Build the EIP-4361 SIWE message
      const message = buildSiweMessage(address, nonce);

      // 3. Sign via Privy wallet (EIP-191 personal_sign)
      const currentWallets = walletsRef.current;
      const privyWallet =
        currentWallets.find((w) => w.address.toLowerCase() === address.toLowerCase()) ??
        currentWallets[0];

      if (!privyWallet) throw new Error("No Privy wallet available to sign");

      const allowedChain = getAllowedChainFromEnv();
      if (typeof privyWallet.switchChain === "function") {
        try {
          await privyWallet.switchChain(allowedChain.decimalChainId);
        } catch {
          /* fall through to provider switch */
        }
      }

      const provider = await privyWallet.getEthereumProvider();
      await ensureWalletOnAllowedChain(provider, allowedChain);
      const signature = (await provider.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;

      // 4. Exchange signature for a backend JWT
      const res = await playerApi.login(address, message, signature);
      setPlayer(res.player);

      // 5. Exchange Privy token for AI Arena gateway JWT pair.
      const privyAccessToken = await getAccessTokenRef.current();
      if (privyAccessToken) {
        await exchangePrivyTokenForAiArenaToken(privyAccessToken);
      }
    })();

    siweInFlightByAddress.set(addrKey, run);

    void run
      .catch((err) => {
        console.error("[SIWE] Login failed:", err);
        playerApi.logout();
      })
      .finally(() => {
        setIsLoading(false);
        if (siweInFlightByAddress.get(addrKey) === run) {
          siweInFlightByAddress.delete(addrKey);
        }
      });
  }, [ready, authenticated, linkedWalletAddress, fetchProfile]);

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

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
