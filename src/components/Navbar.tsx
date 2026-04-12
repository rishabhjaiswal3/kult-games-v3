import { motion } from "framer-motion";
import { Menu, X, LogOut, Plus, Sparkles, WalletCards } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { usePrivy, useWallets, type ConnectedWallet } from "@privy-io/react-auth";
import kultLogo from "@/assets/kult-logo.png";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

const AGENT_WALLET_VERIFIED_KEY = "kult_ai_agent_wallet_verified";

function buildAgentWalletSignMessage(address: string) {
  return `Kult Games — Connect wallet for AI Agent creation.\nAddress: ${address}`;
}

function pickEthereumWallet(wallets: ConnectedWallet[], preferred?: string | null) {
  const eth = wallets.filter((w) => w.type === "ethereum");
  if (eth.length === 0) return undefined;
  if (preferred) {
    const match = eth.find((w) => w.address.toLowerCase() === preferred.toLowerCase());
    if (match) return match;
  }
  return eth[0];
}

const navItems = [
  { label: "Home", path: "/" },
  { label: "Games", path: "/games" },
  { label: "AI Arena", path: "/ai-arena" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Events", path: "/events" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isSettingUpAgent, setIsSettingUpAgent] = useState(false);
  const [agentWalletReady, setAgentWalletReady] = useState(false);
  const [agentWalletBalanceG, setAgentWalletBalanceG] = useState(0);
  const [agentGatePending, setAgentGatePending] = useState(false);
  const [agentSigning, setAgentSigning] = useState(false);
  const { isAuthenticated, player, walletAddress, logout } = useAuth();
  const { linkWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const isAIArenaPage = location.pathname === "/ai-arena";

  const openAgentAfterWalletProof = useCallback(async (wallet: ConnectedWallet) => {
    try {
      if (sessionStorage.getItem(AGENT_WALLET_VERIFIED_KEY) === wallet.address) {
        setAgentModalOpen(true);
        return;
      }
      setAgentSigning(true);
      const signature = await wallet.sign(buildAgentWalletSignMessage(wallet.address));
      console.log("[AI Agent] Wallet sign result", {
        walletAddress: wallet.address,
        signature,
      });
      sessionStorage.setItem(AGENT_WALLET_VERIFIED_KEY, wallet.address);
      setAgentModalOpen(true);
    } catch {
      console.warn("[Navbar] Wallet signature cancelled or failed");
    } finally {
      setAgentSigning(false);
    }
  }, []);

  const handleCreateAgentClick = useCallback(() => {
    if (!walletsReady || agentSigning) return;
    const eth = pickEthereumWallet(wallets, walletAddress);
    if (!eth) {
      setAgentGatePending(true);
      linkWallet({ walletChainType: "ethereum-only" });
      return;
    }
    void openAgentAfterWalletProof(eth);
  }, [walletsReady, wallets, walletAddress, linkWallet, openAgentAfterWalletProof, agentSigning]);

  useEffect(() => {
    if (!agentGatePending || !walletsReady) return;
    const eth = pickEthereumWallet(wallets, walletAddress);
    if (!eth) return;
    setAgentGatePending(false);
    void openAgentAfterWalletProof(eth);
  }, [agentGatePending, walletsReady, wallets, walletAddress, openAgentAfterWalletProof]);

  const handleAgentSetup = () => {
    if (isSettingUpAgent) return;
    setIsSettingUpAgent(true);
    window.setTimeout(() => {
      setIsSettingUpAgent(false);
      setAgentWalletReady(true);
      setAgentModalOpen(false);
    }, 1500);
  };

  const fundWallet = (amount: number) => {
    setAgentWalletBalanceG((prev) => prev + amount);
  };

  const logLoginEvent = (message: string) => {
    if (typeof window === "undefined") return;
    console.info(`[Auth] ${message}`, {
      pathname: location.pathname,
      search: location.search,
      url: window.location.href,
    });
  };

  useEffect(() => {
    if (location.pathname !== "/") return;

    const params = new URLSearchParams(location.search);
    if (params.get("login") !== "1") return;

    setLoginOpen(true);
    logLoginEvent("Opening login modal from query parameter");
    params.delete("login");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: "/",
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  const handleLoginClick = () => {
    if (location.pathname === "/") {
      setLoginOpen(true);
      logLoginEvent("Opening login modal from login button");
      return;
    }

    logLoginEvent("Redirecting to login via query parameter");
    navigate("/?login=1");
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 glass-panel-ai border-border/30"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 min-w-[100px] md:min-w-[130px]">
            <img src={kultLogo} alt="Kult Games" className="h-8 md:h-10 w-auto" width={120} height={40} loading="eager" decoding="async" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(270 82% 60%)" }}
              animate={{
                opacity: [1, 0.3, 1],
                boxShadow: [
                  "0 0 4px hsl(270 82% 55%), 0 0 10px hsl(270 82% 55% / 0.5)",
                  "0 0 12px hsl(270 82% 55%), 0 0 24px hsl(270 82% 55% / 0.5)",
                  "0 0 4px hsl(270 82% 55%), 0 0 10px hsl(270 82% 55% / 0.5)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-300 relative group ${
                    isActive
                      ? "text-[hsl(278_100%_80%)]"
                      : "text-muted-foreground hover:text-[hsl(278_100%_80%)]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[1px] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    style={{
                      background: "linear-gradient(90deg, hsl(265 90% 50%), hsl(278 100% 72%))",
                      boxShadow: "0 0 8px hsl(270 80% 60% / 0.5)",
                    }}
                  />
                </Link>
              );
            })}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              {isAIArenaPage && (
                <>
                  {!agentWalletReady ? (
                    <button
                      onClick={handleCreateAgentClick}
                      disabled={!walletsReady || agentSigning || agentGatePending}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan text-xs font-semibold tracking-wide hover:bg-neon-cyan/20 transition-all disabled:opacity-60 disabled:pointer-events-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {agentGatePending
                        ? "Connect wallet…"
                        : agentSigning
                          ? "Sign message…"
                          : "Create AI Agent"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setWalletModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 hover:bg-neon-cyan/20 transition-all"
                      aria-label="Open agent wallet"
                    >
                      <WalletCards className="w-4 h-4 text-neon-cyan" />
                      <span className="text-[11px] font-mono text-neon-cyan tracking-wide">Agent Wallet</span>
                      <span className="px-1.5 py-0.5 rounded-md border border-neon-purple/40 bg-neon-purple/10 text-[10px] font-mono text-neon-purple">
                        {agentWalletBalanceG}G
                      </span>
                    </button>
                  )}
                </>
              )}
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                {player?.name ?? (walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "")}
              </span>
              <button
                onClick={logout}
                className="w-9 h-9 rounded-lg border border-border/45 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 font-display text-xs font-semibold tracking-wider relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, hsl(265 48% 12%), hsl(220 45% 8%))",
                border: "1px solid hsl(270 80% 60% / 0.4)",
                borderRadius: "14px",
                boxShadow: "0 4px 20px hsl(270 82% 20% / 0.3), 0 0 15px hsl(270 82% 58% / 0.1), inset 0 1px 0 hsl(278 100% 82% / 0.1)",
                color: "hsl(278 100% 82%)",
              }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(278 100% 82% / 0.08), transparent)",
                  borderRadius: "inherit",
                }}
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "radial-gradient(circle at 50% 50%, hsl(270 82% 58% / 0.15), transparent 70%)",
                  borderRadius: "inherit",
                }}
              />
              {/* Dot indicator */}
              <div
                className="relative z-10 w-1.5 h-1.5 rounded-full"
                style={{
                  background: "hsl(278 100% 82%)",
                  boxShadow: "0 0 6px hsl(278 100% 82%), 0 0 12px hsl(278 100% 82% / 0.5)",
                }}
              />
              <span className="relative z-10">LOGIN</span>
            </button>
          )}
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-panel-ai border-t border-border/30 p-4 space-y-3"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-[hsl(278_100%_80%)] transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                {isAIArenaPage && !agentWalletReady && (
                  <button
                    onClick={() => {
                      handleCreateAgentClick();
                      setMobileOpen(false);
                    }}
                    disabled={!walletsReady || agentSigning || agentGatePending}
                    className="w-full px-6 py-2 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan text-xs font-semibold tracking-wider disabled:opacity-60"
                  >
                    {agentGatePending
                      ? "CONNECT WALLET…"
                      : agentSigning
                        ? "SIGN MESSAGE…"
                        : "CREATE AI AGENT"}
                  </button>
                )}
                {isAIArenaPage && agentWalletReady && (
                  <button
                    onClick={() => { setWalletModalOpen(true); setMobileOpen(false); }}
                    className="w-full px-6 py-2 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan text-xs font-semibold tracking-wider"
                  >
                    AGENT WALLET ({agentWalletBalanceG}G)
                  </button>
                )}
                <p className="text-xs font-mono text-muted-foreground px-1">
                  {player?.name ?? (walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "")}
                </p>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full px-6 py-2 font-display text-xs font-semibold tracking-wider btn-eye-outline mt-2"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <button
                onClick={() => { handleLoginClick(); setMobileOpen(false); }}
                className="w-full px-6 py-2 font-display text-xs font-semibold tracking-wider btn-eye mt-2"
              >
                LOGIN
              </button>
            )}
          </motion.div>
        )}
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      {agentModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAgentModalOpen(false)} aria-label="Close AI agent modal" />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-neon-cyan/30 bg-card/90 backdrop-blur-xl p-5 shadow-[0_0_80px_hsl(195_100%_55%_/_0.2)]"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan mb-2">AI Agent Creation</p>
            <h3 className="font-display text-2xl font-black text-foreground mb-2">Create Your AI Agent</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Spawn your autonomous agent with hot wallet support, battle intelligence, and adaptive strategy.
            </p>
            <div className="space-y-2.5 mb-4">
              {[
                "Autonomous wallet-based actions",
                "AI purchases and market adaptation",
                "Arena battle strategy with voice persona",
              ].map((p) => (
                <div key={p} className="rounded-lg border border-border/40 bg-card/45 px-3 py-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-neon-purple" />
                  <span className="text-xs text-muted-foreground">{p}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleAgentSetup}
              disabled={isSettingUpAgent}
              className="w-full rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-2 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/20 transition-colors disabled:opacity-70"
            >
              {isSettingUpAgent ? "Setting up AI Agent..." : "Continue to AI Arena Setup"}
            </button>
          </motion.div>
        </div>
      )}
      {walletModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setWalletModalOpen(false)} aria-label="Close wallet modal" />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-sm rounded-2xl border border-neon-cyan/35 bg-card/90 backdrop-blur-xl p-5 shadow-[0_0_80px_hsl(195_100%_55%_/_0.2)]"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan mb-2">Agent Wallet</p>
            <h3 className="font-display text-xl font-black text-foreground mb-3">Wallet Balance</h3>
            <div className="rounded-xl border border-neon-purple/35 bg-neon-purple/10 px-4 py-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neon-purple mb-1">Current Balance</p>
              <p className="text-2xl font-black text-foreground">{agentWalletBalanceG}G</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This wallet powers AI arena actions. Fund balance to enable autonomous gameplay operations.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => fundWallet(10)}
                className="rounded-lg border border-neon-purple/40 bg-neon-purple/10 px-2 py-1.5 text-xs text-neon-purple font-semibold hover:bg-neon-purple/20 transition-colors"
              >
                +10G
              </button>
              <button
                onClick={() => fundWallet(50)}
                className="rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-2 py-1.5 text-xs text-neon-cyan font-semibold hover:bg-neon-cyan/20 transition-colors"
              >
                +50G
              </button>
              <button
                onClick={() => fundWallet(200)}
                className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-2 py-1.5 text-xs text-amber-300 font-semibold hover:bg-amber-300/20 transition-colors"
              >
                +200G
              </button>
            </div>
            <button
              onClick={() => fundWallet(500)}
              className="mt-2 w-full rounded-lg border border-neon-cyan/40 bg-neon-cyan/12 px-3 py-2 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/22 transition-colors"
            >
              Fund Wallet
            </button>
            <button
              onClick={() => setWalletModalOpen(false)}
              className="mt-4 w-full rounded-lg border border-border/45 bg-card/50 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-neon-cyan/35 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;
