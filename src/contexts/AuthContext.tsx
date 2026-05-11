import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { playerApi } from "@/api/playerApi";
import { StorageKeys, TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import { clearAiAgentInfo } from "@/lib/aiAgentStorage";
import { buildSiweMessage, fetchSiweNonce } from "@/lib/siwe";
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

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login: privyLogin, logout: privyLogout } = usePrivy();
  const { wallets } = useWallets();

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = getWalletAddressFromPrivyUser(user) ?? localStorage.getItem(WALLET_KEY);

  // Keep a stable ref to wallets so the useEffect can access them without re-running
  const walletsRef = useRef(wallets);
  useEffect(() => { walletsRef.current = wallets; }, [wallets]);

  // When Privy authenticates, run the full SIWE flow to get a backend JWT
  useEffect(() => {
    if (!ready || !authenticated) return;

    const address = getWalletAddressFromPrivyUser(user);
    if (!address) return;

    const existingToken = localStorage.getItem(TOKEN_KEY);
    const existingWallet = localStorage.getItem(WALLET_KEY);

    // Already logged in with the same wallet — just refresh the profile
    if (existingToken && existingWallet?.toLowerCase() === address.toLowerCase()) {
      fetchProfile();
      return;
    }

    setIsLoading(true);

    const doSiweLogin = async () => {
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

      const provider = await privyWallet.getEthereumProvider();
      const signature = await provider.request({
        method: "personal_sign",
        params: [message, address],
      }) as string;

      // 4. Exchange signature for a backend JWT
      const res = await playerApi.login(address, message, signature);
      setPlayer(res.player);
    };

    doSiweLogin()
      .catch((err) => {
        console.error("[SIWE] Login failed:", err);
        // Clear stale tokens so the user can retry
        playerApi.logout();
      })
      .finally(() => setIsLoading(false));
  }, [ready, authenticated, user]);

  const fetchProfile = async () => {
    try {
      const p = await playerApi.getProfile();
      setPlayer(p);
    } catch {
      // token may be expired — interceptor clears it on 401
    }
  };

  const handleLogout = async () => {
    playerApi.logout();
    clearAiAgentInfo();
    localStorage.removeItem(StorageKeys.local.warzoneHotWalletAddress);
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
        login: privyLogin,
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
