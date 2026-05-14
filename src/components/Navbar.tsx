import { motion } from "framer-motion";
import { Menu, X, LogOut, Plus, Sparkles, User, Copy, UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { subscribeOpenLoginModal } from "@/lib/loginModalBus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { clearAiAgentInfo, getStoredAiAgentInfo, patchAiAgentInfo, saveAiAgentInfo } from "@/lib/aiAgentStorage";
import kultLogo from "@/assets/kult-logo.png";
import { ArenaTokenAmount } from "@/components/arena/ArenaTokenAmount";
import LoginModal from "@/components/LoginModal";
import { useCreateAgent } from "@/contexts/CreateAgentContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasArenaAgent, MY_ARENA_AGENTS_QUERY_KEY, useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { ArenaAgentRowListSkeleton } from "@/components/skeleton";
import { Skeleton } from "@/components/ui/skeleton";
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
  hasArenaAgent: boolean;
  agentWalletReady: boolean;
  agentWalletBalanceArena: number;
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
  hasArenaAgent: userHasArenaAgent,
  agentWalletReady,
  agentWalletBalanceArena,
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

      {!userHasArenaAgent ? (
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
              <ArenaTokenAmount amount={agentWalletBalanceArena} size="sm" />
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
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [agentWalletReady, setAgentWalletReady] = useState(false);
  const [agentWalletBalanceArena, setAgentWalletBalanceArena] = useState(0);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [walletModalTab, setWalletModalTab] = useState<"fund" | "withdraw">("fund");
  const [fundAmountInput, setFundAmountInput] = useState("");
  const [withdrawAmountInput, setWithdrawAmountInput] = useState("");
  const [withdrawDestination, setWithdrawDestination] = useState("");
  const [fundAgentId, setFundAgentId] = useState<string | null>(null);
  const { isAuthenticated, player, walletAddress, logout } = useAuth();
  const { openCreateAgent, subscribeAgentCreated } = useCreateAgent();
  const queryClient = useQueryClient();
  const myAgentsQ = useMyArenaAgents(1, 50);
  const userHasArenaAgent = hasArenaAgent(myAgentsQ.data);

  const fundWalletPreviewQ = useQuery({
    queryKey: ["aiArenaGateway", "navbarFundWalletPreview", fundAgentId],
    queryFn: () => aiArenaGatewayApi.getAgentWalletBalance(fundAgentId!),
    enabled: walletModalOpen && !!fundAgentId && userHasArenaAgent,
    retry: false,
  });

  const applyAgent = useCallback((agent: AiArenaAgent) => {
    saveAiAgentInfo(agent);
    setAgentId(agent.id);
    /** Only show Fund after wallet API succeeds — agent row can exist before custodial wallet exists. */
    setAgentWalletReady(false);
    setAgentWalletBalanceArena(0);
  }, []);

  const syncAgentWalletBalance = useCallback(async (currentAgentId: string): Promise<boolean> => {
    try {
      const walletRes = await aiArenaGatewayApi.getAgentWalletBalance(currentAgentId);
      setAgentWalletBalanceArena(Number(walletRes.wallet.balanceArena ?? 0));
      setAgentWalletReady(true);
      return true;
    } catch (e) {
      setAgentWalletReady(false);
      setAgentWalletBalanceArena(0);
      return false;
    }
  }, []);

  const syncAgentWalletBalanceWithRetry = useCallback(
    async (currentAgentId: string, attempts = 4, delayMs = 1500) => {
      for (let i = 0; i < attempts; i++) {
        const ok = await syncAgentWalletBalance(currentAgentId);
        if (ok) return true;
        if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
      }
      return false;
    },
    [syncAgentWalletBalance]
  );

  const handleAgentCreatedFromModal = useCallback(
    async (agent: AiArenaAgent) => {
      applyAgent(agent);
      await queryClient.invalidateQueries({ queryKey: MY_ARENA_AGENTS_QUERY_KEY });
      const walletOk = await syncAgentWalletBalanceWithRetry(agent.id);
      if (!walletOk) {
        toast.message("Wallet provisioning", {
          description:
            "Your agent was created. The custodial wallet may take a moment — refresh or open Fund when ready.",
        });
      }
    },
    [applyAgent, syncAgentWalletBalanceWithRetry, queryClient]
  );

  const handleCreateAgentClick = useCallback(() => {
    openCreateAgent();
  }, [openCreateAgent]);

  useEffect(() => {
    return subscribeAgentCreated((agent) => void handleAgentCreatedFromModal(agent));
  }, [subscribeAgentCreated, handleAgentCreatedFromModal]);

  useEffect(() => {
    if (!isAuthenticated || !walletAddress) {
      setAgentWalletReady(false);
      setAgentId(null);
      setAgentWalletBalanceArena(0);
      clearAiAgentInfo();
      return;
    }
    if (myAgentsQ.isLoading) return;

    const agents = myAgentsQ.data?.agents ?? [];
    if (!userHasArenaAgent) {
      setAgentId(null);
      setAgentWalletReady(false);
      setAgentWalletBalanceArena(0);
      clearAiAgentInfo();
      return;
    }

    const agent = agents[0];
    applyAgent(agent);
    void syncAgentWalletBalance(agent.id);
  }, [
    isAuthenticated,
    walletAddress,
    myAgentsQ.isLoading,
    myAgentsQ.data,
    userHasArenaAgent,
    applyAgent,
    syncAgentWalletBalance,
  ]);

  /** POST /v1/wallets/deposits — credit the selected agent custodial wallet. */
  const fundWallet = async (amount: number) => {
    const targetAgentId = fundAgentId ?? agentId ?? getStoredAiAgentInfo()?.id ?? null;
    if (!targetAgentId) {
      toast.error("Select an AI agent to fund, or create one first.");
      return;
    }
    setIsFunding(true);
    try {
      await aiArenaGatewayApi.depositToAgentWallet({
        agentId: targetAgentId,
        amount,
        currency: "ARENA",
        txHash: `demo_tx_${Date.now()}`,
      });
      const walletRes = await aiArenaGatewayApi.getAgentWalletBalance(targetAgentId);
      const bal = Number(walletRes.wallet.balanceArena ?? 0);
      if (targetAgentId === agentId) {
        setAgentWalletBalanceArena(bal);
        setAgentWalletReady(true);
      }
      await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "navbarFundWalletPreview", targetAgentId] });
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
    if (!fundAgentId && !agentId && !getStoredAiAgentInfo()?.id) {
      toast.error("Select an AI agent to fund.");
      return;
    }
    await fundWallet(n);
  };

  /** POST /v1/wallets/withdrawals — withdraw ARENA from the selected agent wallet. */
  const withdrawWallet = async (amount: number, destination: string) => {
    const targetAgentId = fundAgentId ?? agentId ?? getStoredAiAgentInfo()?.id ?? null;
    if (!targetAgentId) {
      toast.error("Select an AI agent to withdraw from, or create one first.");
      return;
    }
    const dest = destination.trim();
    if (!dest) {
      toast.error("Enter a Solana destination address.");
      return;
    }
    setIsWithdrawing(true);
    try {
      const res = await aiArenaGatewayApi.requestWithdrawal({
        agentId: targetAgentId,
        amount,
        destination: dest,
      });
      const walletRes = await aiArenaGatewayApi.getAgentWalletBalance(targetAgentId);
      const bal = Number(walletRes.wallet.balanceArena ?? 0);
      if (targetAgentId === agentId) {
        setAgentWalletBalanceArena(bal);
        setAgentWalletReady(true);
      }
      await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "navbarFundWalletPreview", targetAgentId] });
      const withdrawalId = res?.result?.withdrawalId;
      toast.success(
        withdrawalId
          ? `Withdrawal queued (${withdrawalId.slice(0, 8)}…)`
          : "Withdrawal queued"
      );
      setWithdrawAmountInput("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Withdrawal request failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const submitWithdrawFromInput = async () => {
    const raw = withdrawAmountInput.trim();
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Enter a valid whole amount (minimum 1)");
      return;
    }
    if (!fundAgentId && !agentId && !getStoredAiAgentInfo()?.id) {
      toast.error("Select an AI agent to withdraw from.");
      return;
    }
    await withdrawWallet(n, withdrawDestination);
  };

  useEffect(() => {
    if (!walletModalOpen) return;
    setFundAmountInput("");
    setWithdrawAmountInput("");
    setWithdrawDestination("");
    setWalletModalTab("fund");
    const agents = myAgentsQ.data?.agents ?? [];
    const preferred = agentId ?? getStoredAiAgentInfo()?.id ?? null;
    setFundAgentId((cur) => {
      if (cur && agents.some((a) => a.id === cur)) return cur;
      if (preferred && agents.some((a) => a.id === preferred)) return preferred;
      return agents[0]?.id ?? preferred ?? null;
    });
  }, [walletModalOpen, myAgentsQ.data?.agents, agentId]);

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

  useEffect(() => {
    return subscribeOpenLoginModal(() => {
      setLoginOpen(true);
      logLoginEvent("Opening login modal from app login bus");
    });
  }, []);

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
    hasArenaAgent: userHasArenaAgent,
    agentWalletReady,
    agentWalletBalanceArena,
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
          <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-[88px] md:min-w-[110px]">
            <img src={kultLogo} alt="Kult Games" className="h-7 md:h-8 w-auto" width={96} height={32} loading="eager" decoding="async" />
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
                onClick={userHasArenaAgent ? () => setWalletModalOpen(true) : handleCreateAgentClick}
                disabled={false}
                className="hidden md:inline-flex items-center gap-1.5 relative overflow-hidden shrink-0"
                style={{
                  borderRadius: "12px",
                  border: userHasArenaAgent
                    ? "1px solid hsl(195 100% 50% / 0.35)"
                    : "1px solid hsl(270 80% 60% / 0.35)",
                  background: userHasArenaAgent
                    ? "hsl(195 100% 50% / 0.08)"
                    : "linear-gradient(135deg, hsl(265 48% 12%), hsl(220 45% 8%))",
                  padding: "6px 12px",
                  boxShadow: userHasArenaAgent
                    ? "0 0 12px hsl(195 100% 50% / 0.12)"
                    : "0 4px 16px hsl(270 82% 20% / 0.25)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={userHasArenaAgent ? "Fund AI Agent" : "Create AI Agent"}
              >
                {userHasArenaAgent ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(195 100% 65%)" }} />
                    <span className="text-[11px] font-mono font-semibold tracking-wide" style={{ color: "hsl(195 100% 65%)" }}>
                      {agentWalletReady ? <ArenaTokenAmount amount={agentWalletBalanceArena} size="sm" showLogo={false} /> : "Fund"}
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
      {walletModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setWalletModalOpen(false)} aria-label="Close wallet modal" />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-md max-h-[min(90vh,640px)] overflow-y-auto rounded-2xl border border-neon-cyan/35 bg-card/90 backdrop-blur-xl p-5 shadow-[0_0_80px_hsl(195_100%_55%_/_0.2)]"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan mb-2">Agent Wallet</p>
            <h3 className="font-display text-xl font-black text-foreground mb-1">Manage agent wallet</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Fund or withdraw $ARENA for the selected agent.
            </p>

            {!userHasArenaAgent ? (
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No AI agent on this wallet yet. Create one to unlock funding and arena play.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setWalletModalOpen(false);
                    handleCreateAgentClick();
                  }}
                  className="mt-4 w-full rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-2.5 text-sm font-semibold text-violet-200 hover:bg-violet-500/25 transition-colors"
                >
                  Create AI Agent
                </button>
              </div>
            ) : (
              <>
            <motion.div
              className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-background/40 p-1"
              layout
            >
              {(["fund", "withdraw"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setWalletModalTab(tab)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    walletModalTab === tab
                      ? tab === "fund"
                        ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/35"
                        : "bg-orange-500/15 text-orange-300 border border-orange-500/35"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "fund" ? "Fund" : "Withdraw"}
                </button>
              ))}
            </motion.div>

            <div className="mb-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Your agents</p>
              {myAgentsQ.isLoading ? (
                <ArenaAgentRowListSkeleton count={3} className="rounded-xl border border-white/10 bg-background/40 p-2" />
              ) : !(myAgentsQ.data?.agents?.length) ? (
                <p className="text-xs text-muted-foreground">No agents yet. Create one to continue.</p>
              ) : (
                <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-white/10 bg-background/40 p-2 [scrollbar-width:thin]">
                  {(myAgentsQ.data?.agents ?? []).map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setFundAgentId(a.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition ${
                          fundAgentId === a.id
                            ? "border border-neon-cyan/50 bg-neon-cyan/10 text-foreground"
                            : "border border-transparent hover:bg-white/5"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate font-semibold">{a.name}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{a.clan}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-neon-purple/35 bg-neon-purple/10 px-4 py-3 mb-3">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Balance</p>
              {fundWalletPreviewQ.isLoading ? (
                <Skeleton className="h-7 w-28 bg-muted/70" />
              ) : fundWalletPreviewQ.isError ? (
                <p className="text-sm text-amber-200/90">Wallet not available yet for this agent.</p>
              ) : (
                <ArenaTokenAmount amount={Number(fundWalletPreviewQ.data?.wallet.balanceArena ?? 0)} size="md" />
              )}
            </div>

            {walletModalTab === "fund" ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Credit the agent custodial wallet with Arena tokens.</p>
              <div className="space-y-2">
                <label htmlFor="fund-amount" className="text-xs font-medium text-muted-foreground">Amount (ARENA)</label>
                <input id="fund-amount" type="number" min={1} step={1} inputMode="numeric" value={fundAmountInput} onChange={(e) => setFundAmountInput(e.target.value)} placeholder="e.g. 100" disabled={isFunding} className="w-full h-11 px-3 rounded-lg border border-border/50 bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/30 disabled:opacity-50" />
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 200, 500].map((v) => (
                    <button key={v} type="button" disabled={isFunding} onClick={() => setFundAmountInput(String(v))} className="rounded-lg border border-border/45 bg-card/50 px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/35 disabled:opacity-50">{v}</button>
                  ))}
                </div>
                <button type="button" onClick={() => void submitFundFromInput()} disabled={isFunding || !fundAmountInput.trim() || !fundAgentId} className="w-full rounded-lg border border-neon-cyan/40 bg-neon-cyan/12 px-3 py-2.5 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/22 disabled:opacity-50">{isFunding ? "Funding…" : "Fund wallet"}</button>
              </div>
            </div>
            ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Withdraw Arena tokens to a Solana wallet.</p>
              <div>
                <label htmlFor="withdraw-amount" className="text-xs font-medium text-muted-foreground">Amount (ARENA)</label>
                <input id="withdraw-amount" type="number" min={1} value={withdrawAmountInput} onChange={(e) => setWithdrawAmountInput(e.target.value)} placeholder="e.g. 50" disabled={isWithdrawing} className="mt-1 w-full h-11 px-3 rounded-lg border border-border/50 bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="withdraw-dest" className="text-xs font-medium text-muted-foreground">Solana destination</label>
                <input id="withdraw-dest" value={withdrawDestination} onChange={(e) => setWithdrawDestination(e.target.value)} placeholder="Base58 address" disabled={isWithdrawing} className="mt-1 w-full h-11 px-3 rounded-lg border border-border/50 bg-background/80 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50" />
              </div>
              <button type="button" onClick={() => void submitWithdrawFromInput()} disabled={isWithdrawing || !withdrawAmountInput.trim() || !withdrawDestination.trim() || !fundAgentId} className="w-full rounded-lg border border-orange-500/40 bg-orange-500/12 px-3 py-2.5 text-sm font-semibold text-orange-200 hover:bg-orange-500/22 disabled:opacity-50">{isWithdrawing ? "Withdrawing…" : "Withdraw Arena tokens"}</button>
            </div>
            )}
              </>
            )}
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
