import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { playerApi } from "@/api/playerApi";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import type { Player } from "@/types/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWalletAddressFromPrivyUser(user: ReturnType<typeof usePrivy>["user"]): string | undefined {
  if (!user) return undefined;
  // Direct wallet
  if ((user as any).wallet?.address) return (user as any).wallet.address;
  // Embedded wallets
  const embedded = (user as any).embeddedWallets;
  if (Array.isArray(embedded) && embedded[0]?.address) return embedded[0].address;
  // wallets array
  const wallets = (user as any).wallets;
  if (Array.isArray(wallets) && wallets[0]?.address) return wallets[0].address;
  // linked accounts
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

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = getWalletAddressFromPrivyUser(user) ?? localStorage.getItem(WALLET_KEY);

  // When Privy authenticates, call our backend login to get a JWT
  useEffect(() => {
    if (!ready || !authenticated) return;

    const address = getWalletAddressFromPrivyUser(user);
    if (!address) return;

    const existingToken = localStorage.getItem(TOKEN_KEY);
    const existingWallet = localStorage.getItem(WALLET_KEY);

    // Skip if already logged in with same wallet
    if (existingToken && existingWallet === address) {
      fetchProfile();
      return;
    }

    setIsLoading(true);
    playerApi
      .login(address)
      .then((res) => setPlayer(res.player))
      .catch(() => {/* token stored, profile fetch may still succeed */})
      .finally(() => setIsLoading(false));
  }, [ready, authenticated, user]);

  const fetchProfile = async () => {
    try {
      const p = await playerApi.getProfile();
      setPlayer(p);
    } catch {
      // token may be expired
    }
  };

  const handleLogout = async () => {
    playerApi.logout();
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
