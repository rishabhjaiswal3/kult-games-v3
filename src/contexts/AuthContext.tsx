import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { toast } from "sonner";
import { playerApi } from "@/api/playerApi";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import { clearAiAgentInfo } from "@/lib/aiAgentStorage";
import {
  clearAiArenaAuthTokens,
  exchangePrivyTokenForAiArenaToken,
  getAiArenaAccessToken,
} from "@/lib/aiArenaAuth";
import { getPrivyIdentityToken, getTonWalletAddressFromPrivyUser } from "@/lib/privyAccounts";
import { buildSiweMessage, fetchSiweNonce } from "@/lib/siwe";
import { requestOpenLoginModal } from "@/lib/loginModalBus";
import { getAllowedChainFromEnv } from "@/lib/chain";
import { ensureWalletOnAllowedChain } from "@/lib/ensureWalletChain";
import { getTelegramDisplayName, isTelegramMiniApp } from "@/lib/telegramMiniApp";
import {
  isEmbeddedPrivyConnectedWallet,
  pickSigningWallet,
  resolvePrivyWalletAddress,
} from "@/lib/privyWallet";
import type { Player } from "@/types/api";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const privy = usePrivy();
  const { ready, authenticated, user, getAccessToken, logout: privyLogout } = privy;
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const attemptedTonWalletCreateRef = useRef(false);

  const tonAddress = getTonWalletAddressFromPrivyUser(user);
  const resolvedAddress = resolvePrivyWalletAddress(user, wallets);
  const walletAddress = tonAddress ?? resolvedAddress ?? localStorage.getItem(WALLET_KEY);

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
    if (!ready || !authenticated || resolvedAddress || tonAddress) return;
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 12_000);
    return () => window.clearTimeout(timer);
  }, [ready, authenticated, resolvedAddress, tonAddress]);

  // In Telegram, prefer a Privy TON embedded wallet and exchange a verified identity token for the Kult JWT.
  useEffect(() => {
    if (!ready || !authenticated || !isTelegramMiniApp()) return;

    if (!tonAddress && !attemptedTonWalletCreateRef.current) {
      attemptedTonWalletCreateRef.current = true;
      setIsLoading(true);
      void createWallet({ chainType: "ton" as const })
        .catch((err) => {
          console.error("[TON] Wallet creation failed:", err);
          toast.error("Could not create TON wallet. Please try again.");
        })
        .finally(() => setIsLoading(false));
      return;
    }

    if (!tonAddress) return;

    const existingToken = localStorage.getItem(TOKEN_KEY);
    const existingWallet = localStorage.getItem(WALLET_KEY);

    if (existingToken && existingWallet === tonAddress) {
      void fetchProfile();
      return;
    }

    setIsLoading(true);

    void (async () => {
      const identityToken = await getPrivyIdentityToken(privy);
      if (!identityToken) {
        throw new Error("Privy identity token is unavailable. Enable identity tokens in the Privy dashboard.");
      }

      const res = await playerApi.loginWithPrivyTon(tonAddress, identityToken, {
        name: getTelegramDisplayName(),
      });
      setPlayer(res.player);

      const privyAccessToken = await getAccessTokenRef.current();
      if (privyAccessToken) {
        await exchangePrivyTokenForAiArenaToken(privyAccessToken);
      }
    })()
      .catch((err) => {
        console.error("[TON] Login failed:", err);
        playerApi.logout();
        toast.error("Could not finish Telegram sign-in. Please refresh and try again.");
      })
      .finally(() => setIsLoading(false));
  }, [ready, authenticated, tonAddress, createWallet, fetchProfile, privy]);

  // When Privy authenticates outside Telegram, run the full SIWE flow and AI Arena token exchange.
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) return;
    if (isTelegramMiniApp() && tonAddress) return;

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

      const currentWallets = walletsRef.current;
      const privyWallet = pickSigningWallet(currentWallets, address);
      if (!privyWallet) throw new Error("No Privy wallet available to sign");

      const allowedChain = getAllowedChainFromEnv();
      const embedded = isEmbeddedPrivyConnectedWallet(privyWallet);

      // Embedded wallets stay on Privy's default chain; forcing 0G breaks Google/email login.
      if (!embedded) {
        if (typeof privyWallet.switchChain === "function") {
          try {
            await privyWallet.switchChain(allowedChain.decimalChainId);
          } catch {
            /* fall through to provider switch */
          }
        }
        const provider = await privyWallet.getEthereumProvider();
        await ensureWalletOnAllowedChain(provider, allowedChain);
      }

      const provider = await privyWallet.getEthereumProvider();
      const signature = (await provider.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;

      const res = await playerApi.login(address, message, signature);
      setPlayer(res.player);

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
        toast.error("Could not finish sign-in. Please try wallet login or refresh the page.");
      })
      .finally(() => {
        setIsLoading(false);
        if (siweInFlightByAddress.get(addrKey) === run) {
          siweInFlightByAddress.delete(addrKey);
        }
      });
  }, [ready, authenticated, resolvedAddress, wallets, fetchProfile, tonAddress]);

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
