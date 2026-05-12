import { motion } from "framer-motion";
import { Menu, X, LogOut, Plus, Sparkles, User, Copy, UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { clearAiAgentInfo, getStoredAiAgentInfo, patchAiAgentInfo, saveAiAgentInfo } from "@/lib/aiAgentStorage";
import kultLogo from "@/assets/kult-logo.png";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Games", path: "/games" },
  { label: "Marketplace", path: "/marketplace" },
  { label: "AI Arena", path: "/ai-arena" },
  { label: "Moments", path: "/moments" },
  { label: "Leaderboard", path: "/leaderboard" },
  // { label: "Events", path: "/events" },
];

type ProfileDropdownBodyProps = {
  displayName: string;
  walletAddress: string | null;
  agentWalletReady: boolean;
  agentWalletBalanceG: number;
  onCreateAgent: () => void;
  onFundAgent: () => void;
  onLogout: () => void;
  onAfterSelect?: () => void;
};

function profileInitials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

function ProfileDropdownBody({
  displayName,
  walletAddress,
  agentWalletReady,
  agentWalletBalanceG,
  onCreateAgent,
  onFundAgent,
  onLogout,
  onAfterSelect,
}: ProfileDropdownBodyProps) {
  const copyWallet = () => {
    if (!walletAddress) return;
    void navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied");
  };

  const createLabel = "Create AI Agent";

  const shortWallet =
    walletAddress && walletAddress.length > 14
      ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
      : walletAddress;

  return (
    <>
      <div className="mb-1 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black tracking-tight text-background"
            style={{
              background: "linear-gradient(135deg, hsl(195 100% 55%), hsl(278 100% 65%))",
              boxShadow: "0 0 24px hsl(195 100% 50% / 0.35)",
            }}
          >
            {profileInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold tracking-wide text-foreground">{displayName}</p>
            {walletAddress ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  copyWallet();
                }}
                className="mt-0.5 flex w-full max-w-full items-center gap-1.5 text-left font-mono text-[10px] text-muted-foreground transition-colors hover:text-neon-cyan"
              >
                <span className="truncate">{shortWallet}</span>
                <Copy className="h-3 w-3 shrink-0 opacity-60" />
              </button>
            ) : (
              <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">No wallet linked</p>
            )}
          </div>
        </div>
      </div>

      <DropdownMenuItem asChild className="cursor-pointer focus:bg-neon-cyan/10">
        <Link to="/profile" onClick={() => onAfterSelect?.()} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-cyan/10 text-neon-cyan">
            <UserCircle className="h-4 w-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground">My profile</span>
            <span className="text-[11px] font-normal text-muted-foreground">Player &amp; AI agent</span>
          </div>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {!agentWalletReady ? (
        <DropdownMenuItem
          disabled={false}
          className="cursor-pointer focus:bg-neon-cyan/10"
          onSelect={() => {
            onCreateAgent();
            onAfterSelect?.();
          }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <Plus className="h-4 w-4" />
          </span>
          <span className="font-medium">{createLabel}</span>
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className="cursor-pointer focus:bg-neon-cyan/10"
          onSelect={() => {
            onFundAgent();
            onAfterSelect?.();
          }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-cyan/15 text-neon-cyan">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex flex-1 items-center justify-between gap-2">
            <span className="font-medium text-neon-cyan">Fund AI Agent</span>
            <span className="rounded-md border border-white/10 bg-background/50 px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              {agentWalletBalanceG} G
            </span>
          </div>
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
        onSelect={() => {
          onLogout();
          onAfterSelect?.();
        }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
          <LogOut className="h-4 w-4" />
        </span>
        <span className="font-medium">Log out</span>
      </DropdownMenuItem>
    </>
  );
}

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
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [fundAmountInput, setFundAmountInput] = useState("");
  const { isAuthenticated, player, walletAddress, logout } = useAuth();

  const applyAgent = useCallback((agent: AiArenaAgent) => {
    saveAiAgentInfo(agent);
    setAgentId(agent.id);
    setAgentWalletReady(true);
  }, []);

  const syncAgentWalletBalance = useCallback(async (currentAgentId: string) => {
    try {
      const walletRes = await aiArenaGatewayApi.getAgentWalletBalance(currentAgentId);
      setAgentWalletBalanceG(Number(walletRes.wallet.balanceArena ?? 0));
    } catch {
      /* keep previous number */
    }
  }, []);

  const handleCreateAgentClick = useCallback(() => {
    setAgentModalOpen(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !walletAddress) return;
    setAgentWalletReady(false);
    setAgentId(null);
    setAgentWalletBalanceG(0);
    clearAiAgentInfo();
    let cancelled = false;
    void (async () => {
      try {
        const res = await aiArenaGatewayApi.getMyAgents(1, 10);
        if (cancelled) return;
        if (res.agents?.length) {
          const agent = res.agents[0];
          applyAgent(agent);
          void syncAgentWalletBalance(agent.id);
        }
      } catch {
        /* no AI Arena auth/token yet */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, walletAddress, applyAgent, syncAgentWalletBalance]);

  const handleAgentSetup = async () => {
    if (isSettingUpAgent) return;
    if (!walletAddress) {
      toast.error("Connect a wallet first");
      return;
    }
    setIsSettingUpAgent(true);
    try {
      const agent = await aiArenaGatewayApi.createAgent({
        name: player?.name?.trim() || `Agent ${walletAddress.slice(0, 8)}`,
        clan: "ZEROG",
        archetype: "TACTICIAN",
        backstory: "Autonomous AI agent initialized from Kult Browser.",
      });
      applyAgent(agent);
      void syncAgentWalletBalance(agent.id);
      setAgentModalOpen(false);
      toast.success("AI Arena agent created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create agent");
    } finally {
      setIsSettingUpAgent(false);
    }
  };

  /** POST /v1/financial/deposits — demo funding for AI Arena agent wallet. */
  const fundWallet = async (amount: number) => {
    const activeAgentId = agentId ?? getStoredAiAgentInfo()?.id ?? null;
    if (!activeAgentId) {
      toast.error("No agent selected — create or load your AI Arena agent first");
      return;
    }
    setIsFunding(true);
    try {
      await aiArenaGatewayApi.depositToAgentWallet({
        agentId: activeAgentId,
        amount,
        currency: "ARENA",
        txHash: `demo_tx_${Date.now()}`,
      });
      const walletRes = await aiArenaGatewayApi.getAgentWalletBalance(activeAgentId);
      setAgentWalletBalanceG(Number(walletRes.wallet.balanceArena ?? 0));
      patchAiAgentInfo({});
      toast.success(`Funded +${amount} ARENA`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fund request failed");
    } finally {
      setIsFunding(false);
    }
  };

  const submitFundFromInput = async () => {
    const raw = fundAmountInput.trim();
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Enter a valid whole amount (minimum 1)");
      return;
    }
    await fundWallet(n);
  };

  useEffect(() => {
    if (walletModalOpen) setFundAmountInput("");
  }, [walletModalOpen]);

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

  const profileDisplayName =
    player?.name?.trim() ||
    (walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Player");

  const profileMenuProps: ProfileDropdownBodyProps = {
    displayName: profileDisplayName,
    walletAddress,
    agentWalletReady,
    agentWalletBalanceG,
    onCreateAgent: handleCreateAgentClick,
    onFundAgent: () => setWalletModalOpen(true),
    onLogout: () => {
      logout();
      setMobileOpen(false);
    },
  };

  const profileTriggerClass =
    "inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-border/60 bg-card text-foreground hover:border-neon-cyan/45 hover:text-neon-cyan transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/40";

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-[0_1px_0_hsl(220_30%_18%/0.5)]">
        <div className="container mx-auto px-4 sm:px-6 min-h-16 flex items-center gap-3 sm:gap-4 md:gap-5 w-full min-w-0">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-[100px] md:min-w-[130px]">
            <img src={kultLogo} alt="Kult Games" className="h-8 md:h-10 w-auto" width={120} height={40} loading="eager" decoding="async" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(270 82% 60%)" }}
              animate={{
                opacity: [1, 0.72, 1],
                boxShadow: [
                  "0 0 4px hsl(270 82% 55%), 0 0 10px hsl(270 82% 55% / 0.5)",
                  "0 0 10px hsl(270 82% 55%), 0 0 18px hsl(270 82% 55% / 0.45)",
                  "0 0 4px hsl(270 82% 55%), 0 0 10px hsl(270 82% 55% / 0.5)",
                ],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </Link>

          <nav className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-0 mx-1 md:mx-2 lg:mx-4 overflow-x-auto overflow-y-visible scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isHome = item.path === "/";
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`shrink-0 text-sm font-medium transition-colors duration-300 relative group px-2.5 py-2 md:px-3.5 rounded-md hover:bg-muted/40 ${
                    isActive
                      ? "text-[hsl(278_100%_80%)]"
                      : "text-muted-foreground hover:text-[hsl(278_100%_80%)]"
                  } ${isHome ? "sticky left-0 z-[2] bg-background/95 backdrop-blur-md border-r border-border/60 shadow-[8px_0_16px_-8px_rgba(0,0,0,0.85)] mr-1 lg:mr-2" : ""}`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-1 left-0 h-[1px] transition-all duration-300 ${
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
          </nav>

          <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto pl-2">
            {/* AI Agent pill — desktop only, authenticated */}
            {isAuthenticated && (
              <motion.button
                type="button"
                onClick={agentWalletReady ? () => setWalletModalOpen(true) : handleCreateAgentClick}
                disabled={false}
                className="hidden md:inline-flex items-center gap-1.5 relative overflow-hidden shrink-0"
                style={{
                  borderRadius: "12px",
                  border: agentWalletReady
                    ? "1px solid hsl(195 100% 50% / 0.35)"
                    : "1px solid hsl(270 80% 60% / 0.35)",
                  background: agentWalletReady
                    ? "hsl(195 100% 50% / 0.08)"
                    : "linear-gradient(135deg, hsl(265 48% 12%), hsl(220 45% 8%))",
                  padding: "6px 12px",
                  boxShadow: agentWalletReady
                    ? "0 0 12px hsl(195 100% 50% / 0.12)"
                    : "0 4px 16px hsl(270 82% 20% / 0.25)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={agentWalletReady ? "Fund AI Agent" : "Create AI Agent"}
              >
                {agentWalletReady ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(195 100% 65%)" }} />
                    <span className="text-[11px] font-mono font-semibold tracking-wide" style={{ color: "hsl(195 100% 65%)" }}>
                      {agentWalletBalanceG} G
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" style={{ color: "hsl(278 100% 82%)" }} />
                    <span className="text-[11px] font-mono font-semibold tracking-wide" style={{ color: "hsl(278 100% 82%)" }}>
                      Create AI
                    </span>
                  </>
                )}
              </motion.button>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className={`md:hidden ${profileTriggerClass}`}
                  aria-label="Open account menu"
                >
                  <User className="w-[18px] h-[18px] md:w-5 md:h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))]">
                  <ProfileDropdownBody {...profileMenuProps} onAfterSelect={() => setMobileOpen(false)} />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <button type="button" className="md:hidden text-foreground p-2 -mr-0.5 rounded-md hover:bg-muted/50" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger type="button" className={`hidden md:inline-flex ${profileTriggerClass}`} aria-label="Open account menu">
                  <User className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))]">
                  <ProfileDropdownBody {...profileMenuProps} />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={handleLoginClick}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 font-display text-[10px] lg:text-xs font-semibold tracking-wider relative overflow-hidden group shrink-0 whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, hsl(265 48% 12%), hsl(220 45% 8%))",
                  border: "1px solid hsl(270 80% 60% / 0.4)",
                  borderRadius: "14px",
                  boxShadow: "0 4px 20px hsl(270 82% 20% / 0.3), 0 0 15px hsl(270 82% 58% / 0.1), inset 0 1px 0 hsl(278 100% 82% / 0.1)",
                  color: "hsl(278 100% 82%)",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent, hsl(278 100% 82% / 0.08), transparent)",
                    borderRadius: "inherit",
                  }}
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, hsl(270 82% 58% / 0.15), transparent 70%)",
                    borderRadius: "inherit",
                  }}
                />
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
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border bg-background p-4 space-y-3"
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
            {!isAuthenticated ? (
              <button
                onClick={() => { handleLoginClick(); setMobileOpen(false); }}
                className="w-full px-6 py-2 font-display text-xs font-semibold tracking-wider btn-eye mt-2"
              >
                LOGIN
              </button>
            ) : null}
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
              Spawn your autonomous agent with AI Arena gateway identity and battle-ready defaults.
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
              onClick={() => void handleAgentSetup()}
              disabled={isSettingUpAgent}
              className="w-full rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-2 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/20 transition-colors disabled:opacity-70"
            >
              {isSettingUpAgent ? "Creating agent…" : "Create agent on AI Arena"}
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
              <p className="text-[10px] font-mono uppercase tracking-widest text-neon-purple mb-1">Balance (API)</p>
              <p className="text-2xl font-black text-foreground">{agentWalletBalanceG}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Enter an amount, then confirm. The app calls AI Arena demo funding API for your selected agent.
            </p>
            <div className="mt-3 space-y-2">
              <label htmlFor="fund-amount" className="text-xs font-medium text-muted-foreground">
                Amount
              </label>
              <input
                id="fund-amount"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={fundAmountInput}
                onChange={(e) => setFundAmountInput(e.target.value)}
                placeholder="e.g. 100"
                disabled={isFunding}
                className="w-full h-11 px-3 rounded-lg border border-border/50 bg-background/80 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30 disabled:opacity-50"
              />
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 200, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={isFunding}
                    onClick={() => setFundAmountInput(String(v))}
                    className="rounded-lg border border-border/45 bg-card/50 px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/35 transition-colors disabled:opacity-50"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void submitFundFromInput()}
                disabled={isFunding || !fundAmountInput.trim()}
                className="w-full rounded-lg border border-neon-cyan/40 bg-neon-cyan/12 px-3 py-2.5 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/22 transition-colors disabled:opacity-50"
              >
                {isFunding ? "Funding…" : "Fund wallet"}
              </button>
            </div>
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
