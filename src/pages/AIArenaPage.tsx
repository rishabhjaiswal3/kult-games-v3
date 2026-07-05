import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Box,
  ArrowUp,
  Swords,
  Globe,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  Sparkles,
  Loader2,
  BrainCircuit,
  BriefcaseBusiness,
  Gamepad2,
  Trophy,
  Video,
} from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { ArenaBattleBoardCard } from "@/components/arena/ArenaBattleBoardCard";
import Footer from "@/components/Footer";
import { ArenaLiveMatchProvider, useArenaLiveMatch } from "@/contexts/ArenaLiveMatchContext";
import { ArenaJoinBattleModal } from "@/components/arena/ArenaJoinBattleModal";
import { ArenaMatchStatusModal } from "@/components/arena/ArenaMatchStatusModal";
import { ArenaStartMatchmakingModal } from "@/components/arena/ArenaStartMatchmakingModal";
import { ArenaBattleBoardGridSkeleton } from "@/components/skeleton";
import { ResponsiveBackgroundVideo } from "@/components/ResponsiveBackgroundVideo";
import { useAuth } from "@/contexts/AuthContext";
import { useArenaBattleBoard } from "@/hooks/useArenaBattleBoard";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { getTrackedAiArenaBattleId, saveTrackedAiArenaBattleId } from "@/lib/arenaBattleStorage";
import { AI_ARENA_DEFAULT_GAME_ID, type AiArenaGameId } from "@/constants/aiArenaMatchmaking";
import heroVideo from "@/assets/hero-video.mp4";
import mobileHeroVideo from "@/assets/mobile.mp4";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import baseLogo from "@/assets/Base Logo.png";
import solanaLogo from "@/assets/solana-sol-logo.png";
import okxLogo from "@/assets/okx-icon.png";
import agentNexus from "@/assets/hybrid.mp4";
import agentShadow from "@/assets/defender.mp4";
import agentAegis from "@/assets/tactician.mp4";
import agentVoid from "@/assets/support.mp4";
import agentRage from "@/assets/berserker.mp4";
import agentLumen from "@/assets/assassin.gif";
import iconTrain from "@/assets/icon-train.png";
import iconBattle from "@/assets/icon-battle.png";
import iconEarn from "@/assets/icon-earn.png";
import iconOwn from "@/assets/Own.png";
import sceneVideo from "@/assets/Scene 1.mp4";
import leagueBackground from "@/assets/league_background.mp4";
import heroTrio from "@/assets/hero-trio.png";
import warzoneVideo from "@/assets/IMG_9260.mp4";
import battleStep3 from "@/assets/step3.mp4";
import battleStep5 from "@/assets/step5.mp4";
import type { AiArenaAgent, AiArenaAgentMemory, AiArenaBattle } from "@/types/aiArenaGateway";
import { RANKS } from "@/utils/rankSystem";

const arenaQuickLinks = [
  { label: "My Agents", path: "/my-agents", icon: Box, color: "#00f080" },
  { label: "Training", path: "/training", icon: BrainCircuit, color: "#0089ff" },
  { label: "Battles", path: "/battles", icon: Swords, color: "#b338ff" },
  { label: "Autonomous", path: "/autonomous", icon: Globe, color: "#ffc000" },
];

const agents = [
  {
    rank: "01",
    name: "HYBRID",
    chain: "ZeroG",
    tier: "Legendary",
    lvl: 12,
    power: "14,850",
    img: agentNexus,
    color: "var(--neon)",
  },
  {
    rank: "02",
    name: "DEFENDER",
    chain: "Base",
    tier: "Epic",
    lvl: 11,
    power: "13,420",
    img: agentShadow,
    color: "var(--lime)",
  },
  {
    rank: "03",
    name: "TACTICIAN",
    chain: "Solana",
    tier: "Epic",
    lvl: 12,
    power: "12,980",
    img: agentAegis,
    color: "var(--cyan)",
  },
  {
    rank: "04",
    name: "SUPPORT",
    chain: "ZeroG",
    tier: "Epic",
    lvl: 11,
    power: "12,150",
    img: agentVoid,
    color: "var(--neon-2)",
  },
  {
    rank: "05",
    name: "BERSERKER",
    chain: "Base",
    tier: "Legendary",
    lvl: 12,
    power: "11,870",
    img: agentRage,
    color: "var(--amber)",
  },
  {
    rank: "06",
    name: "ASSASSIN",
    chain: "Solana",
    tier: "Epic",
    lvl: 11,
    power: "10,940",
    img: agentLumen,
    color: "var(--magenta)",
  },
];

function ZeroGLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <img
      src={zeroGLogo}
      alt="0G"
      loading="lazy"
      width={483}
      height={234}
      className={`inline-block object-contain ${className}`}
    />
  );
}

function KultLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <img
      src={kultLogo}
      alt="Kult Games"
      loading="lazy"
      width={929}
      height={325}
      className={`inline-block object-contain ${className}`}
    />
  );
}

function BaseLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <img
      src={baseLogo}
      alt="Base"
      loading="lazy"
      className={`inline-block object-contain ${className}`}
    />
  );
}

function SolanaLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <img
      src={solanaLogo}
      alt="Solana"
      loading="lazy"
      className={`inline-block object-contain ${className}`}
    />
  );
}

function OKXLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <img
      src={okxLogo}
      alt="OKX"
      loading="lazy"
      className={`inline-block object-contain ${className}`}
    />
  );
}

function ChainLogo({
  name,
  className = "h-3.5 w-auto",
  useLogosForChains = false,
}: {
  name: string;
  className?: string;
  useLogosForChains?: boolean;
}) {
  const lower = name.toLowerCase();
  if (useLogosForChains) {
    if (lower === "0g" || lower === "og" || lower === "zerog") {
      return <ZeroGLogo className={className} />;
    }
    if (lower === "base") {
      return <BaseLogo className={className} />;
    }
    if (lower === "solana") {
      return <SolanaLogo className={className} />;
    }
    if (lower === "okx") {
      return <OKXLogo className={className} />;
    }
  }

  return <span>{name}</span>;
}

function shortBattleId(value?: string | null) {
  if (!value) return "—";
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

type AiArenaMatchmakingContextValue = {
  buttonLabel: string;
  helperText: string;
  queuedAgent: AiArenaAgent | null;
  startButtonDisabled: boolean;
  startMatchmaking: (gameId?: AiArenaGameId) => void;
  openQueuedMatchStatus: () => void;
  openJoinBattle: () => void;
};

const AiArenaMatchmakingContext = createContext<AiArenaMatchmakingContextValue | null>(null);

function useAiArenaMatchmakingFlow() {
  const context = useContext(AiArenaMatchmakingContext);
  if (!context) throw new Error("useAiArenaMatchmakingFlow must be used within AiArenaMatchmakingProvider");
  return context;
}

const AIArenaPage = () => {
  return (
    <ArenaLiveMatchProvider>
      <AiArenaMatchmakingProvider>
        <AIArenaPageContent />
      </AiArenaMatchmakingProvider>
    </ArenaLiveMatchProvider>
  );
};

export default AIArenaPage;

function AiArenaMatchmakingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { isAiArenaReady } = useAiArenaGatewaySession();
  const { setActiveBattleId } = useArenaLiveMatch();
  const myAgentsQ = useMyArenaAgents(1, 50);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [joinBattleOpen, setJoinBattleOpen] = useState(false);
  const [statusModalAgent, setStatusModalAgent] = useState<AiArenaAgent | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<AiArenaGameId>(AI_ARENA_DEFAULT_GAME_ID);
  const [trackedBattleId, setTrackedBattleId] = useState(() => getTrackedAiArenaBattleId());
  const announcedBattleIdRef = useRef<string | null>(null);
  const selectedGameIdRef = useRef<AiArenaGameId>(AI_ARENA_DEFAULT_GAME_ID);

  const agents = myAgentsQ.data?.agents ?? [];

  const queueQ = useQuery({
    queryKey: ["aiArenaGateway", "landingMatchmakingStatus", agents.map((agent) => agent.id).join(",")],
    queryFn: async () =>
      Promise.all(
        agents.map(async (agent) => {
          try {
            const statusRes = await aiArenaGatewayApi.getMatchmakingStatus(agent.id);
            return { agent, status: statusRes.status };
          } catch {
            return { agent, status: null };
          }
        })
      ),
    enabled: isAiArenaReady && agents.length > 0,
    staleTime: 4_000,
    refetchInterval: 4_000,
    retry: 1,
  });

  const queuedAgent = useMemo(
    () => queueQ.data?.find((row) => row.status?.inQueue)?.agent ?? null,
    [queueQ.data]
  );

  const leaveQueueMut = useMutation({
    mutationFn: async (agentId: string) => aiArenaGatewayApi.leaveMatchmakingQueue(agentId),
    onSuccess: async () => {
      setStatusModalAgent(null);
      await queueQ.refetch();
    },
    onError: (err) => {
    },
  });

  const buttonLabel = !isAuthenticated
    ? "START MATCHMAKING"
    : agents.length > 0
      ? "START MATCHMAKING"
      : "CREATE AGENT TO MATCH";

  const helperText = !isAuthenticated
    ? "Connect your wallet to unlock AI Arena matchmaking."
    : !isAiArenaReady
      ? "Syncing your AI Arena session..."
      : myAgentsQ.isLoading
        ? "Loading your fighters..."
        : agents.length > 0
          ? "Queue one of your agents into the live arena lobby."
          : "Create an AI Arena agent first, then you can queue it here.";

  const startButtonDisabled =
    isAuthenticated &&
    agents.length > 0 &&
    (!isAiArenaReady || myAgentsQ.isLoading || !!queuedAgent);

  const startMatchmaking = useCallback((gameId: AiArenaGameId = AI_ARENA_DEFAULT_GAME_ID) => {
    selectedGameIdRef.current = gameId;
    setSelectedGameId(gameId);

    if (!isAuthenticated) {
      login();
      return;
    }

    if (agents.length === 0) {
      navigate("/my-agents");
      return;
    }

    setStartModalOpen(true);
  }, [agents.length, isAuthenticated, login, navigate]);

  const openJoinBattle = useCallback(() => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (agents.length === 0) {
      navigate("/my-agents");
      return;
    }

    setJoinBattleOpen(true);
  }, [agents.length, isAuthenticated, login, navigate]);

  const handleMatchFound = (payload: {
    agent: AiArenaAgent;
    opponent: AiArenaAgent;
    battleId: string;
    mode: string;
    gameId: string;
  }) => {
    saveTrackedAiArenaBattleId(payload.battleId);
    setActiveBattleId(payload.battleId);
    setTrackedBattleId(payload.battleId);
    if (announcedBattleIdRef.current !== payload.battleId) {
      announcedBattleIdRef.current = payload.battleId;
      setStatusModalAgent(null);

      const base = `myAgentId=${encodeURIComponent(payload.agent.id)}&opponentId=${encodeURIComponent(payload.opponent.id)}&mode=${encodeURIComponent(payload.mode)}`;

      // payload.gameId (server-reported) is authoritative — selectedGameIdRef.current defaults to
      // "warzone" and is only reliable when the host queued via startMatchmaking; for joiners it
      // is always the stale initial value, so checking it first caused joiners to always land on
      // the Warzone page regardless of the actual game mode.
      let gameId: string = (payload.gameId && payload.gameId !== "default") ? payload.gameId : "";
      if (!gameId) gameId = selectedGameIdRef.current;
      if (!gameId || gameId === "default") {
        try { gameId = sessionStorage.getItem("arena_queued_game_id") || "default"; } catch { gameId = "default"; }
      }
      if (!gameId || gameId === "default") gameId = "warzone";

      if (gameId === "robowar") {
        navigate(`/arena/robowar/${payload.battleId}?${base}`);
      } else if (gameId === "highway-hustle") {
        navigate(`/arena/highway-hustle/${payload.battleId}?${base}`);
      } else {
        navigate(`/arena/game/${payload.battleId}?${base}`);
      }
    }
  };

  useEffect(() => {
    if (trackedBattleId) {
      setActiveBattleId(trackedBattleId);
    }
  }, [trackedBattleId, setActiveBattleId]);

  const value = useMemo<AiArenaMatchmakingContextValue>(
    () => ({
      buttonLabel,
      helperText,
      queuedAgent,
      startButtonDisabled,
      startMatchmaking,
      openQueuedMatchStatus: () => queuedAgent && setStatusModalAgent(queuedAgent),
      openJoinBattle,
    }),
    [buttonLabel, helperText, queuedAgent, startButtonDisabled, startMatchmaking, openJoinBattle],
  );

  return (
    <AiArenaMatchmakingContext.Provider value={value}>
      {children}
      <ArenaStartMatchmakingModal
        open={startModalOpen}
        onOpenChange={setStartModalOpen}
        agents={agents}
        defaultAgentId={queuedAgent?.id ?? agents[0]?.id ?? null}
        defaultGameId={selectedGameId}
        onQueued={async (agentId, gameId) => {
          selectedGameIdRef.current = (gameId as AiArenaGameId) ?? AI_ARENA_DEFAULT_GAME_ID;
          const queued = agents.find((agent) => agent.id === agentId) ?? null;
          if (queued) setStatusModalAgent(queued);
          await queueQ.refetch();
        }}
      />

      <ArenaJoinBattleModal
        open={joinBattleOpen}
        onOpenChange={setJoinBattleOpen}
        agents={agents}
        onJoined={(agent) => setStatusModalAgent(agent)}
      />

      <ArenaMatchStatusModal
        open={!!statusModalAgent}
        onOpenChange={(open) => {
          if (!open) setStatusModalAgent(null);
        }}
        agent={statusModalAgent}
        leaving={leaveQueueMut.isPending}
        onLeave={(agentId) => leaveQueueMut.mutate(agentId)}
        onMatchFound={handleMatchFound}
      />
    </AiArenaMatchmakingContext.Provider>
  );
}

function AIArenaPageContent() {
  return (
    <div className="ai-arena-page min-h-full text-foreground bg-background min-w-0 mx-auto w-full space-y-6 px-4 py-5 sm:px-6 lg:px-8 max-w-full">
      <Hero />
      <StatsBar />
      <FeaturesBlock />
      <HowItWorks />
      <WhereAgentsCompete />
      <section className="arena-panel px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] xl:gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <ArenaQuickLinks />
          <TopAgents />
        </div>
      </section>
      <RankProgressionTimeline />
      <BattlesRow />
      <PartnersBlock />
      <Footer variant="arena" />
    </div>
  );
}

function ArenaQuickLinks() {
  return (
    <div className="flex h-full min-w-0 flex-col" data-tour="ai-arena-quick-links">
      <h2 className="mb-3 font-tech text-2xl font-black uppercase leading-tight tracking-wider text-white/86 sm:text-3xl">Jump in</h2>
      <div className="grid flex-1 grid-cols-1 gap-3 lg:gap-2 xl:gap-3">
        {arenaQuickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="arena-panel group relative flex items-center justify-between overflow-hidden border-[var(--quick-link-border)] bg-[linear-gradient(110deg,var(--quick-link-bg),rgba(4,8,15,0.97)_48%)] px-4 py-1.5 shadow-[0_0_20px_var(--quick-link-shadow)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--quick-link-color)] hover:shadow-[0_0_34px_var(--quick-link-glow)] lg:px-3 lg:py-1 xl:px-4 xl:py-1.5"
            style={
              {
                "--quick-link-color": link.color,
                "--quick-link-glow": `${link.color}33`,
                "--quick-link-border": `${link.color}66`,
                "--quick-link-bg": `${link.color}18`,
                "--quick-link-shadow": `${link.color}14`,
              } as CSSProperties
            }
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,var(--quick-link-glow),transparent_46%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-center gap-3">
              <div
                className="relative z-10 grid h-8 w-8 place-items-center rounded-md border border-[var(--quick-link-border)] bg-[var(--quick-link-bg)] shadow-[0_0_14px_var(--quick-link-shadow)] transition duration-300 group-hover:bg-[var(--quick-link-glow)] group-hover:shadow-[0_0_22px_var(--quick-link-glow)] lg:h-8 lg:w-8 xl:h-8 xl:w-8"
                style={{ color: link.color }}
              >
                <link.icon className="h-4 w-4" />
              </div>
              <span className="relative z-10 font-tech text-sm font-bold uppercase tracking-wide text-[var(--quick-link-color)] transition duration-300 group-hover:brightness-125 lg:text-xs xl:text-sm">
                {link.label}
              </span>
            </div>
            <ArrowUpRight className="relative z-10 h-4 w-4 text-[var(--quick-link-color)] opacity-70 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Logo({
  size = "text-2xl",
  hideAttributionOnMobile = false,
}: {
  size?: string;
  hideAttributionOnMobile?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col leading-none">
      <span className={`font-display ${size} text-gradient glow-text`}>AI ARENA</span>
      <div
        className={`mt-1 flex-nowrap items-center gap-3 md:flex-col md:items-start md:gap-0 ${hideAttributionOnMobile ? "hidden md:flex" : "flex"}`}
      >
        <span className="flex shrink-0 flex-nowrap items-center gap-1.5 whitespace-nowrap text-[8px] tracking-[0.18em] text-muted-foreground font-tech sm:gap-2 sm:text-[9px] sm:tracking-[0.3em]">
          PRESENTED BY <KultLogo className="h-3.5 w-auto shrink-0" />
        </span>
        <span className="flex shrink-0 flex-nowrap items-center gap-1.5 whitespace-nowrap text-[8px] tracking-[0.18em] text-muted-foreground font-tech md:mt-1 sm:gap-2 sm:text-[9px] sm:tracking-[0.3em]">
          POWERED BY <ZeroGLogo className="h-3.5 w-auto shrink-0" />
        </span>
      </div>
    </div>
  );
}

function HeroCopy({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mx-auto max-w-sm pt-80 text-center" : "max-w-xl md:max-w-sm xl:max-w-xl"}>
      <span className={`${compact ? "hidden" : "inline-block"} px-2.5 py-0.5 text-[8px] sm:text-[9px] tracking-[0.22em] sm:tracking-[0.3em] font-tech border border-primary/40 text-primary rounded-sm mb-3 md:hidden md:mb-5 xl:inline-block`}>
        BUILT FOR WEB3
      </span>
      <h1
        className={`font-tech font-black uppercase leading-tight tracking-tight text-white ${
          compact ? "text-[1.56rem] min-[390px]:text-[1.66rem] sm:text-5xl [text-shadow:0_2px_18px_rgba(0,0,0,0.95),0_0_28px_rgba(154,53,255,0.5)]" : "text-[1.56rem] min-[390px]:text-[1.66rem] sm:text-5xl lg:text-6xl xl:text-5xl"
        }`}
      >
        AI ARENA
      </h1>
      <h2
        className={`font-tech font-black uppercase text-foreground/90 ${
          compact ? "mt-1.5 text-[1.2rem] leading-[1.05] max-[380px]:text-[1rem]" : "mt-3 leading-tight text-xl sm:text-2xl md:mt-2 md:text-lg lg:text-xl xl:mt-5 xl:text-2xl"
        }`}
      >
        Where AI{compact ? " " : <br />}
        Agents Battle
        <br />
        For{" "}
        <span className="underline decoration-accent decoration-4 underline-offset-4">
          Supremacy
        </span>
      </h2>
      <p
        className={`max-w-md text-white/80 [text-shadow:0_0_14px_rgba(203,213,225,0.2)] md:mt-5 md:hidden xl:block ${
          compact ? "mt-2 text-[13px] font-semibold leading-snug text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.95),0_0_12px_rgba(255,255,255,0.35)] max-[380px]:text-[11px]" : "mt-4 text-sm leading-relaxed md:text-[11px] lg:text-xs xl:text-sm"
        }`}
      >
        Collect, train, and battle unique AI Agents.
        <br />
        Own your journey. Rule the Arena.
      </p>
      <div
        className={
          compact
            ? "mt-3 mx-auto flex w-full max-w-[350px] flex-col items-center gap-1.5 px-3 py-2 max-[380px]:max-w-[310px] max-[380px]:gap-1 max-[380px]:px-2"
            : "mt-4 grid w-full max-w-[280px] grid-cols-2 items-start gap-2 xl:flex xl:w-[224px] xl:flex-col"
        }
      >
        <ArenaHeroMatchmakingAction compact={compact} />
      </div>
    </div>
  );
}

function ArenaHeroMatchmakingAction({ compact = false }: { compact?: boolean }) {
  const {
    buttonLabel,
    helperText,
    queuedAgent,
    startButtonDisabled,
    startMatchmaking,
    openQueuedMatchStatus,
    openJoinBattle,
  } = useAiArenaMatchmakingFlow();
  const actionButtonSize = `w-full ${compact ? "h-9 px-2 text-[10px] tracking-[0.16em] gap-1.5 max-[380px]:h-8 max-[380px]:px-1.5 max-[380px]:text-[8px] max-[380px]:tracking-[0.12em] max-[380px]:gap-1" : "h-9 px-3 text-[9px] tracking-[0.13em] gap-1.5"}`;
  const actionButtonBase =
    `min-w-0 rounded-md font-tech font-black uppercase flex items-center justify-center text-center transition whitespace-nowrap border shadow-[0_0_18px_rgba(0,210,255,0.16)] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(0,210,255,0.32),0_12px_26px_rgba(0,0,0,0.32)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60`;

  return (
    <div className="contents">
      <button
        type="button"
        onClick={() => startMatchmaking()}
        disabled={startButtonDisabled}
        data-tour="ai-arena-matchmaking"
        className={`${actionButtonBase} ${actionButtonSize} col-span-2 xl:col-span-1 border-cyan-200/55 bg-[linear-gradient(135deg,rgba(14,165,233,0.5),rgba(154,53,255,0.45),rgba(4,8,15,0.92))] text-white ring-1 ring-cyan-200/10 hover:border-cyan-100/80 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.6),rgba(168,85,247,0.52),rgba(4,8,15,0.94))]`}
      >
        {startButtonDisabled && !queuedAgent ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-100" />
        ) : (
          <Swords className="h-3.5 w-3.5 shrink-0 text-cyan-100" />
        )}
        <span className="leading-tight whitespace-nowrap text-center">{buttonLabel}</span>
      </button>

      <div className={compact ? "grid w-full grid-cols-2 gap-1.5" : "contents"}>
        <button
          type="button"
          onClick={openJoinBattle}
          className={`${actionButtonBase} ${actionButtonSize} border-emerald-300/45 bg-[linear-gradient(135deg,rgba(16,185,129,0.42),rgba(4,8,15,0.92))] text-emerald-50 hover:border-emerald-200/75 hover:bg-[linear-gradient(135deg,rgba(16,185,129,0.52),rgba(4,8,15,0.94))] hover:text-white`}
        >
          <Swords className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
          <span>JOIN BATTLE</span>
        </button>

        <Link
          to="/my-agents"
          className={`${actionButtonBase} ${actionButtonSize} border-[#0089ff]/50 bg-[linear-gradient(135deg,rgba(0,137,255,0.42),rgba(4,8,15,0.92))] text-sky-50 hover:border-[#38bdf8]/85 hover:bg-[linear-gradient(135deg,rgba(0,137,255,0.55),rgba(4,8,15,0.94))] hover:text-white`}
        >
          <Box className="h-3.5 w-3.5 shrink-0 text-[#7cc9ff]" />
          <span>MY AGENTS</span>
        </Link>
      </div>

      <div className={compact ? "grid w-full grid-cols-2 gap-1.5" : "contents"}>
        <a
          href="#my-battles"
          data-tour="ai-arena-my-battle"
          className={`${actionButtonBase} ${actionButtonSize} border-purple-300/45 bg-[linear-gradient(135deg,rgba(154,53,255,0.42),rgba(4,8,15,0.92))] text-white hover:border-purple-200/75 hover:bg-[linear-gradient(135deg,rgba(154,53,255,0.52),rgba(4,8,15,0.94))]`}
        >
          <Eye className="h-3.5 w-3.5 shrink-0 text-purple-200" />
          <span>MY BATTLE</span>
        </a>

        <Link
          to="/league"
          data-tour="ai-arena-enter-league"
          className={`${actionButtonBase} ${actionButtonSize} border-amber-200/40 bg-[linear-gradient(135deg,rgba(251,191,36,0.4),rgba(154,53,255,0.34),rgba(4,8,15,0.92))] text-amber-50 hover:border-amber-100/70 hover:bg-[linear-gradient(135deg,rgba(251,191,36,0.5),rgba(154,53,255,0.42),rgba(4,8,15,0.94))] hover:text-white`}
        >
          <span className="shrink-0 select-none text-sm leading-none" aria-hidden>⚽</span>
          <span>ENTER LEAGUE</span>
        </Link>
      </div>

      {queuedAgent ? (
        <div
          className={`text-muted-foreground ${compact ? "max-w-[240px] text-center text-[11px]" : "col-span-2 max-w-md text-left text-xs xl:col-span-1"}`}
        >
          <p>
            {queuedAgent.name} is already live in the arena lobby. Keep this queue running and open
            the live match modal any time.
          </p>
          <button
            type="button"
            onClick={openQueuedMatchStatus}
            className="mt-2 inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.16em] text-accent transition hover:text-accent/80"
          >
            <Eye className="h-3.5 w-3.5" />
            Open live match status
          </button>
        </div>
      ) : (
        <p
          className={`font-medium leading-relaxed text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.85)] ${
            compact ? "max-w-[260px] text-center text-[13px] max-[380px]:text-[11px]" : "col-span-2 max-w-md text-left text-sm xl:col-span-1"
          }`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section
      className="arena-panel relative aspect-auto min-h-[500px] overflow-hidden border border-white/8 bg-[#04080f] md:aspect-video md:min-h-0 xl:aspect-auto xl:min-h-[500px]"
      data-tour="ai-arena-hero"
    >
      <div className="absolute inset-0">
        <ResponsiveBackgroundVideo
          mobileSrc={mobileHeroVideo}
          desktopSrc={heroVideo}
          breakpoint="md"
          mobileClassName="absolute inset-0 h-full w-full object-cover object-top"
          desktopClassName="h-full w-full object-contain object-center xl:object-cover xl:object-right"
        />
        <div className="absolute inset-0 hidden bg-gradient-to-b from-transparent via-transparent to-background/65 md:block" />
        <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-black/55 to-transparent md:hidden" />
      </div>
      {/* original line kept — bg-black was added intentionally by another dev, commented out to fix black rectangle artifact */}
      {/* <div className="relative md:hidden min-h-[640px] h-[185vw] max-h-[880px] bg-black"> */}
      <div className="relative md:hidden min-h-[640px] h-[185vw] max-h-[880px]">
        <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-black/55 to-transparent" />
        <div className="relative z-10 px-4 sm:px-6 pt-5">
          <div className="mb-8 flex flex-nowrap items-center gap-2 whitespace-nowrap font-tech text-[8px] uppercase tracking-[0.12em] text-white/50 min-[380px]:gap-2.5 min-[380px]:text-[9px] min-[380px]:tracking-[0.16em] sm:text-[11px] sm:tracking-[0.2em]">
            <span className="flex shrink-0 items-center gap-1">
              Presented by <KultLogo className="h-3.5 w-auto shrink-0 min-[380px]:h-4" />
            </span>
            <span className="flex shrink-0 items-center gap-1">
              Powered by <ZeroGLogo className="h-3.5 w-auto shrink-0 min-[380px]:h-4" />
            </span>
          </div>
          <HeroCopy compact />
        </div>
      </div>
      <div className="relative mx-auto hidden px-6 pt-8 pb-32 md:absolute md:inset-0 md:flex md:min-h-0 md:flex-col md:justify-end md:pb-6 xl:relative xl:min-h-[680px] xl:justify-center xl:pb-32">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] font-tech uppercase tracking-[0.2em] text-white/50 xl:mb-8">
          <span className="flex items-center gap-1.5">
            Presented by <KultLogo className="h-4 w-auto" />
          </span>
          <span className="flex items-center gap-1.5">
            Powered by <ZeroGLogo className="h-4 w-auto" />
          </span>
        </div>
        <HeroCopy />
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { icon: BrainCircuit, label: "AI Agents", detail: "Mint & Train", color: "#a855ff" },
    { icon: Swords, label: "24/7 Matchmaking", detail: "Humans vs Agents", color: "#11a7ff" },
    { icon: Trophy, label: "Founding Season", detail: "Early Access", color: "#ffc42e" },
  ];

  const tileClass =
    "home-stat-tile relative z-10 flex items-center gap-3 px-3.5 py-2.5 md:gap-2 md:px-4 md:py-3 xl:gap-4 xl:px-6 xl:py-4";
  const iconClass =
    "home-stat-icon grid h-8 w-8 shrink-0 place-items-center rounded-lg xl:h-11 xl:w-11";

  return (
    <section className="relative z-10">
      <div className="arena-panel home-stats-panel ai-arena-stats-panel grid grid-cols-1 divide-y divide-white/8 overflow-hidden md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className={tileClass} style={{ "--stat-color": "#00f080" } as CSSProperties}>
          <div className={iconClass}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#26e63b] shadow-[0_0_10px_rgba(38,230,59,0.9)] xl:h-2.5 xl:w-2.5" />
          </div>
          <div className="min-w-0">
            <div className="font-tech text-xs font-semibold leading-tight text-primary md:text-[11px] xl:text-sm">Beta Live</div>
            <div className="mt-0.5 text-[12px] font-semibold leading-tight text-white md:text-[12px] xl:text-base">
              <span className="inline-flex items-center gap-1.5">
                Powered by <ZeroGLogo className="h-3 w-auto shrink-0 xl:h-4" />
              </span>
            </div>
          </div>
        </div>

        {stats.map((s) => (
          <div key={s.label} className={tileClass} style={{ "--stat-color": s.color } as CSSProperties}>
            <div className={iconClass}>
              <s.icon className="h-4 w-4 xl:h-5 xl:w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-tech text-xs font-semibold leading-tight text-primary md:text-[11px] xl:text-sm">{s.label}</div>
              <div className="mt-0.5 text-[12px] font-semibold leading-tight text-white xl:text-base">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesBlock() {
  const features = [
    {
      icon: Box,
      step: "01",
      title: "CREATE AGENT",
      desc: "Choose your agent and set its path.",
      c: "var(--neon)",
      path: "/my-agents",
    },
    {
      icon: ArrowUp,
      step: "02",
      title: "TRAIN AGENT",
      desc: "Build its skills and evolve its strategy.",
      c: "var(--neon-2)",
      path: "/training",
    },
    {
      icon: Swords,
      step: "03",
      title: "ENTER BATTLE",
      desc: "Test your agent and earn rewards.",
      c: "var(--amber)",
      path: "/battles",
    },
  ];
  return (
    <section className="arena-panel p-4 text-center shadow-[0_0_36px_rgba(154,53,255,0.06)] sm:p-5 md:text-left">
      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-5 lg:gap-6">
        <div>
          <span className="font-tech text-[10px] tracking-[0.24em] text-accent sm:tracking-[0.3em]">
            BUILT DIFFERENT
          </span>
          <h3 className="font-tech mt-2 text-xl font-black uppercase leading-tight md:text-2xl lg:text-3xl">
            THE NEXT ERA
            <br />
            OF <span className="text-gradient">AI GAMING</span>
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            AI Arena is the ultimate battleground for AI Agents across Web3. Powered by{" "}
            <ZeroGLogo className="mx-1 h-4 w-auto align-[-0.2em]" />, owned by you.
          </p>
          <div className="mt-3 hidden space-y-2 min-[1200px]:block">
            <div className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-0.5 shrink-0 text-[#9a35ff]">▸</span>
              Your agent evolves through every battle — strategy, traits, and record stay on-chain.
            </div>
            <div className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-0.5 shrink-0 text-[#9a35ff]">▸</span>
              Compete in seasons, earn rewards, own your reputation.
            </div>
          </div>
          <Link to="/" className="btn-primary mt-4 mx-auto md:mx-0 inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-tech text-xs tracking-[0.2em] w-max">
            LEARN MORE <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div>
          <div className="mb-3 text-center md:text-left">
            <span className="font-tech text-[11px] uppercase tracking-[0.26em] text-primary">Start here</span>
            <p className="mt-1 text-sm leading-relaxed text-white/80">Three steps to get your agent into the Arena.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {features.map((f) => {
            const content = (
              <>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 mx-auto md:mx-0"
                style={{
                  background: `oklch(from ${f.c} l c h / 0.15)`,
                  border: `1px solid oklch(from ${f.c} l c h / 0.4)`,
                }}
              >
                <f.icon className="w-4 h-4" style={{ color: `oklch(from ${f.c} l c h)` }} />
              </div>
              <h4
                className="font-tech text-sm font-black uppercase leading-tight tracking-wider mb-1.5 flex flex-wrap items-center justify-center md:justify-start gap-1.5"
                style={{ color: `oklch(from ${f.c} l c h)` }}
              >
                {f.title}
              </h4>
              <p className="text-xs font-medium leading-relaxed text-white/75 sm:text-sm">{f.desc}</p>
              </>
            );

            return "path" in f && f.path ? (
              <Link
                key={f.title}
                to={f.path}
                data-tour={f.title === "CREATE AGENT" ? "ai-arena-create-agent" : undefined}
                className="card-glass group rounded-xl p-2.5 text-center transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_0_28px_rgba(154,53,255,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a35ff] md:p-3 md:text-left"
              >
                {content}
              </Link>
            ) : (
              <div
                key={f.title}
                className="card-glass rounded-xl p-2.5 text-center transition md:p-3 md:text-left"
              >
                {content}
              </div>
            );
          })}
          </div>
          <div className="mt-3 rounded-xl border border-primary/25 bg-[radial-gradient(circle_at_12%_0%,rgba(154,53,255,0.14),transparent_46%),rgba(4,8,15,0.88)] px-4 py-3 text-center md:text-left">
            <p className="font-tech text-[11px] font-bold uppercase tracking-[0.26em] text-primary">Why AI agents?</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">Your agent acts from the traits and strategy you train, learns from battle results, and remains yours as it grows through the Arena.</p>
          </div>
        </div>
        {/* <div className="card-glass h-full rounded-xl p-3 text-center sm:p-4 lg:text-left">
          <div className="text-[10px] tracking-[0.3em] font-tech text-muted-foreground">
            $ARENA TOKEN
          </div>
          <div className="font-display text-2xl text-accent mt-1 glow-text">FUEL THE ARENA</div>
          <p className="mt-2 text-xs text-muted-foreground">
            The native token of AI Arena. Use it to play, earn, govern and own the future.
          </p>
          <div className="mt-3 text-[10px] tracking-[0.3em] font-tech text-muted-foreground">
            $ARENA PRICE
          </div>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-tech text-3xl">1.00</span>
            <span className="text-xs text-lime-400" style={{ color: "oklch(0.82 0.22 145)" }}>
              +4.35%
            </span>
          </div>
          <div className="relative mt-2 h-8">
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                points="0,25 15,22 30,24 45,18 60,20 75,12 90,8 100,4"
                fill="none"
                stroke="oklch(0.7 0.28 320)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <Link
            to="/dashboard"
            className="btn-primary mt-3 flex w-full items-center justify-center rounded-md px-3 py-2 font-tech text-[10px] tracking-[0.12em] whitespace-nowrap"
          >
            VIEW TOKEN
          </Link>
        </div> */}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "CREATE",
      desc: "Create your AI Agent and choose its path.",
      img: agentNexus,
    },
    {
      n: "02",
      title: "TRAIN",
      desc: "Train and evolve your agent to make it stronger.",
      img: iconTrain,
    },
    {
      n: "03",
      title: "BATTLE",
      desc: "Enter the Arena and battle players worldwide.",
      img: iconBattle,
    },
    {
      n: "04",
      title: "EARN",
      desc: "Win battles, earn rewards and climb the leaderboard.",
      img: iconEarn,
    },
    { n: "05", title: "OWN", desc: "Your AI. Your NFT. Your legacy.", img: iconOwn },
  ];
  return (
    <section className="arena-panel px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-12">
        <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary" />
        <h3 className="font-tech text-2xl font-black uppercase leading-tight text-center sm:text-3xl">HOW IT WORKS</h3>
        <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-primary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-stretch">
        {steps.map((s, i) => (
          <div key={s.n} className="relative">
            <div className="card-glass rounded-xl overflow-hidden h-full flex flex-col">
              <div className="aspect-square overflow-hidden bg-background/50 md:aspect-[6/5]">
                {s.img.endsWith(".mp4") ? (
                  <video
                    src={s.img}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-3 md:p-4 text-center md:text-left">
                <div className="font-tech text-sm tracking-wider break-words">{s.title}</div>
                <p className="mt-2 text-xs leading-snug text-muted-foreground md:text-xs">{s.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden md:block absolute top-1/3 -right-2 w-5 h-5 text-primary z-10" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

type CompeteGame = {
  title: string;
  reputation: string;
  body: string;
  cta: string;
  gameId: AiArenaGameId;
  video?: string;
  image?: string;
  tone: string;
  color: string;
};

const competeGames: CompeteGame[] = [
  {
    title: "WARZONE WARRIORS",
    reputation: "Combat reputation",
    body: "Deploy your agent into fast-paced 2D combat and earn battle reputation",
    cta: "Enter",
    gameId: "warzone",
    video: warzoneVideo,
    image: heroTrio,
    tone: "from-[#321004]/15 via-[#170d0a]/42 to-[#070910]/95",
    color: "#ff7a3c",
  },
  {
    title: "HIGHWAY HUSTLE",
    reputation: "Racing reputation",
    body: "Race through neon highways and build your agent's speed reputation",
    cta: "Race",
    gameId: "highway-hustle",
    video: battleStep3,
    tone: "from-[#29102e]/10 via-[#22091f]/42 to-[#070910]/95",
    color: "#ffc000",
  },
  {
    title: "ROBOWARS",
    reputation: "Strategic combat",
    body: "Outsmart rivals in tactical robotic warfare and prove strategic mastery",
    cta: "Deploy",
    gameId: "robowar",
    video: battleStep5,
    tone: "from-[#25100d]/10 via-[#170b23]/45 to-[#070910]/95",
    color: "#52cbff",
  },
];

function WhereAgentsCompete() {
  const { startMatchmaking } = useAiArenaMatchmakingFlow();

  return (
    <section className="arena-panel px-4 py-4 sm:px-6 sm:py-5">
      <div className="mb-8 text-center sm:mb-10">
        <span className="inline-block rounded-sm border border-primary/40 px-3 py-1 font-tech text-[9px] tracking-[0.22em] text-primary sm:text-[10px] sm:tracking-[0.3em]">
          ONE AGENT · MANY EXPERIENCES
        </span>
        <h3 className="mt-4 font-tech text-2xl font-black uppercase leading-tight sm:text-3xl">
          WHERE YOUR <span className="text-gradient glow-text">AGENTS COMPETE</span>
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground [text-shadow:0_0_14px_rgba(203,213,225,0.2)]">
          AI Arena is bigger than battles. Your agent competes across games and predictions — every result feeds one persistent reputation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {competeGames.map((game) => (
          <button
            type="button"
            key={game.title}
            onClick={() => startMatchmaking(game.gameId)}
            className="arena-panel group relative h-[260px] overflow-hidden rounded-xl border border-white/10 text-left shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:border-[#a83cff]/70 hover:shadow-[0_24px_70px_rgba(0,0,0,0.5),0_0_38px_rgba(154,53,255,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50"
          >
            {game.video ? (
              <video
                src={game.video}
                autoPlay
                loop
                muted
                preload="none"
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:saturate-125"
              />
            ) : (
              <img
                src={game.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:saturate-125"
              />
            )}
            <div className={`absolute inset-0 bg-gradient-to-b ${game.tone} opacity-75 transition-opacity duration-500 group-hover:opacity-55`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070910]/95 via-[#070910]/15 to-transparent transition duration-500 group-hover:from-[#070910]/85" />
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 transition duration-500 group-hover:ring-[#c268ff]/45" />
            <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 group-hover:left-[125%] group-hover:opacity-100" />

            <span
              className="absolute left-4 top-4 z-10 inline-flex w-fit rounded border px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm"
              style={{ color: game.color, borderColor: `${game.color}80`, background: `${game.color}26` }}
            >
              {game.reputation}
            </span>

            <div className="relative z-10 flex h-full flex-col justify-end p-4">
              <h4 className="font-tech text-base font-black uppercase leading-tight text-white drop-shadow-lg transition duration-500 group-hover:-translate-y-0.5 group-hover:text-[#f0d7ff] sm:text-lg">
                {game.title}
              </h4>
              <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-white/80">{game.body}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 font-tech text-[11px] font-bold uppercase tracking-wider text-white transition group-hover:gap-2.5">
                {game.cta}
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </button>
        ))}

        {/* Prediction AI — connects Arena to League */}
        <Link
          to="/league"
          className="arena-panel group relative flex h-[260px] flex-col overflow-hidden rounded-xl border border-[#b338ff]/55 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#b338ff]/80"
        >
          <video
            src={leagueBackground}
            autoPlay
            loop
            muted
            preload="none"
            playsInline
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070910]/95 via-[#0b0518]/72 to-[#0b0518]/45" />
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 20% 0%, rgba(179,56,255,0.16), transparent 55%)" }} />

          <span
            className="absolute left-4 top-4 z-10 inline-flex w-fit rounded border px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm"
            style={{ color: "#d08bff", borderColor: "#b338ff80", background: "#b338ff26" }}
          >
            Forecasting reputation
          </span>

          <div className="relative z-10 flex h-full flex-col justify-end">
            <h4 className="font-tech text-base font-black uppercase leading-tight text-white drop-shadow-lg sm:text-lg">Prediction AI</h4>
            <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-white/80">
              Forecast live events alongside your AI agent, Debate, Predict and Build forecasting reputation.
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 font-tech text-[11px] font-bold uppercase tracking-wider text-[#d08bff] transition group-hover:gap-2.5">
              Enter League
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

function RankProgressionTimeline() {
  return (
    <section className="arena-panel px-4 py-4 sm:px-6 sm:py-5">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="inline-block px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.3em] font-tech border border-primary/40 text-primary rounded-sm mb-4">
          COMPETITIVE PROGRESSION
        </span>
        <h3 className="font-tech text-2xl font-black uppercase leading-tight mt-2 sm:text-3xl">
          HOW A <span className="text-gradient glow-text">LEAGUE</span> WORKS
        </h3>
        <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-muted-foreground [text-shadow:0_0_14px_rgba(203,213,225,0.2)]">
          Every AI Agent earns ELO through battle victories. Climb from{" "}
          <span className="text-[#22c55e] font-tech text-xs">INITIATE</span> all the way to{" "}
          <span className="text-[#818cf8] font-tech text-xs">SINGULARITY PRIME</span> — the apex of autonomous combat.
        </p>
      </div>

      {/* Connector line (desktop only) */}
      <div className="relative">
        <div className="absolute top-[52px] left-[6%] right-[6%] h-px hidden md:block lg:top-[44px] xl:top-[52px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.25) 15%, rgba(139,92,246,0.4) 50%, rgba(129,140,248,0.25) 85%, transparent)" }}
        />

        {/* Rank cards grid */}
        <div className="grid grid-cols-2 min-[500px]:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 lg:gap-2 xl:gap-4">
          {RANKS.map((rank, i) => (
            <div
              key={rank.tier}
              className="group relative flex flex-col items-center text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Tier node */}
              <div
                className="relative z-10 flex h-[100px] w-[100px] sm:h-[108px] sm:w-[108px] lg:h-[88px] lg:w-[88px] xl:h-[108px] xl:w-[108px] items-center justify-center rounded-full transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105"
                style={{
                  background: `radial-gradient(circle at 40% 35%, ${rank.color}22, ${rank.color}08 60%, transparent)`,
                  border: `1px solid ${rank.color}35`,
                  boxShadow: `0 0 0 0 ${rank.color}00`,
                }}
              >
                {/* Inner glow ring on hover */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 0 24px 4px ${rank.color}30, inset 0 0 16px 2px ${rank.color}18` }}
                />
                <img
                  src={rank.image}
                  alt={rank.name}
                  className="h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] lg:h-[60px] lg:w-[60px] xl:h-[76px] xl:w-[76px] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ filter: `drop-shadow(0 0 8px ${rank.color}55)` }}
                />
                {/* Tier number badge */}
                <div
                  className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center font-tech text-[9px] font-bold"
                  style={{ background: rank.color, color: "#000", boxShadow: `0 0 8px ${rank.color}80` }}
                >
                  {rank.tier}
                </div>
              </div>

              {/* Arrow connector (desktop) */}
              {i < RANKS.length - 1 && (
                <div
                  className="absolute top-[50px] -right-2 z-20 hidden md:flex h-5 w-4 items-center justify-center text-white/20 group-hover:text-white/45 transition-colors duration-300 lg:top-[42px] xl:top-[50px]"
                  style={{ fontSize: "10px" }}
                >
                  ›
                </div>
              )}

              {/* Name & ELO */}
              <div className="mt-3 space-y-0.5 lg:mt-2 xl:mt-3">
                <div
                  className="font-tech text-[9px] sm:text-[10px] font-bold tracking-widest uppercase leading-tight lg:text-[8px] lg:tracking-[0.12em] xl:text-[10px] xl:tracking-widest"
                  style={{ color: rank.color, textShadow: `0 0 8px ${rank.color}60` }}
                >
                  {rank.shortName}
                </div>
                <div className="text-[8px] sm:text-[9px] text-white/65 font-mono leading-tight">
                  {rank.minElo === 0 ? "0" : rank.minElo >= 1000 ? `${(rank.minElo / 1000).toFixed(0)}K` : rank.minElo}
                  {rank.maxElo != null
                    ? ` – ${rank.maxElo >= 1000 ? `${(rank.maxElo / 1000).toFixed(0)}K` : rank.maxElo}`
                    : "+"}
                </div>
                <div className="text-[7px] sm:text-[8px] text-white/45 font-tech uppercase tracking-wider">
                  ELO
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info cards row */}
      <div className="mt-7 sm:mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card-glass rounded-xl p-4 sm:p-5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto sm:mx-0"
            style={{ background: "oklch(from var(--neon) l c h / 0.15)", border: "1px solid oklch(from var(--neon) l c h / 0.4)" }}>
            <Swords className="w-5 h-5" style={{ color: "var(--neon)" }} />
          </div>
          <h4 className="font-tech text-base font-black uppercase leading-tight tracking-wider mb-2 sm:text-lg" style={{ color: "var(--neon)" }}>
            WIN TO CLIMB
          </h4>
          <p className="text-xs leading-relaxed text-white/75">
            Each battle win grants ELO points. The stronger your opponent, the more ELO you earn. Losses deduct ELO — protect your rank.
          </p>
        </div>
        <div className="card-glass rounded-xl p-4 sm:p-5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto sm:mx-0"
            style={{ background: "oklch(from var(--cyan) l c h / 0.15)", border: "1px solid oklch(from var(--cyan) l c h / 0.4)" }}>
            <ArrowUp className="w-5 h-5" style={{ color: "var(--cyan)" }} />
          </div>
          <h4 className="font-tech text-base font-black uppercase leading-tight tracking-wider mb-2 sm:text-lg" style={{ color: "var(--cyan)" }}>
            ELO MATCHMAKING
          </h4>
          <p className="text-xs leading-relaxed text-white/75">
            The arena matches you against agents of similar ELO. Climb through 8 distinct leagues, each with its own badge and prestige.
          </p>
        </div>
        <div className="card-glass rounded-xl p-4 sm:p-5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto sm:mx-0"
            style={{ background: "oklch(from var(--amber) l c h / 0.15)", border: "1px solid oklch(from var(--amber) l c h / 0.4)" }}>
            <Trophy className="w-5 h-5" style={{ color: "var(--amber)" }} />
          </div>
          <h4 className="font-tech text-base font-black uppercase leading-tight tracking-wider mb-2 sm:text-lg" style={{ color: "var(--amber)" }}>
            LEAGUE REWARDS
          </h4>
          <p className="text-xs leading-relaxed text-white/75">
            Higher leagues unlock greater $ARENA rewards per battle. Reach Singularity Prime and earn the ultimate on-chain legacy.
          </p>
        </div>
      </div>
    </section>
  );
}

function TopAgents() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const scroller = ref.current;
    if (!scroller) return;

    const firstCard = scroller.firstElementChild as HTMLElement | null;
    const gap = 16;
    const amount = firstCard ? firstCard.offsetWidth + gap : Math.max(scroller.clientWidth / 5, 260);

    scroller.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;

    const interval = window.setInterval(() => {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      const firstCard = scroller.firstElementChild as HTMLElement | null;
      const gap = 16;
      const amount = firstCard ? firstCard.offsetWidth + gap : Math.max(scroller.clientWidth / 5, 260);
      const nextLeft = scroller.scrollLeft + amount;

      scroller.scrollTo({
        left: nextLeft >= maxScrollLeft - 8 ? 0 : nextLeft,
        behavior: "smooth",
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 text-center sm:text-left">
        <h3 className="font-tech text-2xl font-black uppercase leading-tight tracking-wider text-white/86 sm:text-3xl">TOP AI AGENTS</h3>
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <Link to="/my-agents" className="text-sm text-accent hover:underline">
            View All
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {agents.map((a) => (
          <div
            key={a.name}
            className="card-glass group min-w-[70vw] snap-start overflow-hidden rounded-xl cursor-pointer min-[420px]:min-w-[calc((100%-1rem)/2)] xl:min-w-[calc((100%-2rem)/3)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {a.img.endsWith(".mp4") ? (
                <video
                  src={a.img}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                />
              ) : (
                <img
                  src={a.img}
                  alt={a.name}
                  loading="lazy"
                  width={640}
                  height={800}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-md font-tech text-xs"
                style={{
                  background: `oklch(from ${a.color} l c h / 0.2)`,
                  color: `oklch(from ${a.color} l c h)`,
                  border: `1px solid oklch(from ${a.color} l c h / 0.5)`,
                }}
              >
                {a.rank}
              </div>
            </div>
            <div className="p-4 text-center sm:text-left">
              <div className="flex items-start justify-center sm:justify-between gap-2 mb-1">
                <span className="font-tech text-sm min-w-0 break-words">{a.name}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-sm font-tech"
                  style={{
                    background:
                      a.tier === "Legendary"
                        ? "oklch(0.78 0.18 75 / 0.2)"
                        : "oklch(0.62 0.25 295 / 0.2)",
                    color: a.tier === "Legendary" ? "oklch(0.85 0.18 75)" : "oklch(0.75 0.25 300)",
                  }}
                >
                  {a.tier}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                <ChainLogo name={a.chain} className="h-3.5 w-auto" />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs font-tech">
                <span className="text-muted-foreground">LV. {a.lvl}</span>
                <span className="flex items-center gap-1">
                  <Swords className="w-3 h-3 text-accent" />
                  {a.power}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BattlesRow() {
  return (
    <section className="arena-panel px-4 py-4 sm:px-6 sm:py-5">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <LiveBattles />
        <MyBattleSection />
      </div>
    </section>
  );
}

function MyBattleSection() {
  const myAgentsQ = useMyArenaAgents(1, 50);
  const ownedAgents = myAgentsQ.data?.agents ?? [];
  type OwnedBattleMemory = AiArenaAgentMemory & { ownerAgentId: string };
  const memoriesQ = useQuery({
    queryKey: ["aiArenaGateway", "arenaLandingBattleMemories", ownedAgents.map((agent) => agent.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        ownedAgents.map((agent) =>
          aiArenaGatewayApi.getAgentMemories(agent.id, 1, 100)
        )
      );
      const uniqueMemories = new Map<string, OwnedBattleMemory>();
      results.forEach((result, index) => {
        const ownerAgentId = ownedAgents[index]?.id;
        if (!ownerAgentId) return;
        result.memories.forEach((memory) => {
          const key = memory.metadata?.battleId ?? memory.id;
          if (!uniqueMemories.has(key)) uniqueMemories.set(key, { ...memory, ownerAgentId });
        });
      });
      return Array.from(uniqueMemories.values()).sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    },
    enabled: ownedAgents.length > 0,
    staleTime: 30_000,
  });
  const memories = memoriesQ.data ?? [];
  const battleIds = useMemo(
    () => memories.map((memory) => memory.metadata?.battleId).filter((id): id is string => Boolean(id)),
    [memories]
  );
  const battleDetailsQ = useQuery({
    queryKey: ["aiArenaGateway", "arenaLandingMemoryBattles", battleIds.join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        battleIds.map(async (battleId) => {
          try {
            const result = await aiArenaGatewayApi.getBattle(battleId);
            return result.battle;
          } catch {
            return null;
          }
        })
      );
      return results.filter((battle): battle is AiArenaBattle => Boolean(battle));
    },
    enabled: battleIds.length > 0,
    staleTime: 60_000,
  });
  const battlesById = useMemo(
    () => new Map((battleDetailsQ.data ?? []).map((battle) => [battle.id, battle])),
    [battleDetailsQ.data]
  );
  const participantIds = useMemo(
    () => Array.from(new Set((battleDetailsQ.data ?? []).flatMap((battle) => battle.agentIds ?? []))),
    [battleDetailsQ.data]
  );
  const participantAgentsQ = useQuery({
    queryKey: ["aiArenaGateway", "arenaLandingMemoryParticipants", participantIds.join(",")],
    queryFn: async () =>
      Promise.all(
        participantIds.map(async (agentId) => {
          const ownedAgent = ownedAgents.find((agent) => agent.id === agentId);
          if (ownedAgent) return ownedAgent;
          try {
            return await aiArenaGatewayApi.getAgentById(agentId);
          } catch {
            return { id: agentId, name: shortBattleId(agentId), archetype: "HYBRID" } as AiArenaAgent;
          }
        })
      ),
    enabled: participantIds.length > 0,
    staleTime: 60_000,
  });
  const agentsById = useMemo(
    () => new Map([...ownedAgents, ...(participantAgentsQ.data ?? [])].map((agent) => [agent.id, agent])),
    [ownedAgents, participantAgentsQ.data]
  );

  const CARDS_PER_PAGE = 1;
  const [battlePage, setBattlePage] = useState(0);
  const totalBattlePages = Math.max(1, Math.ceil(memories.length / CARDS_PER_PAGE));
  const canPrevBattle = battlePage > 0;
  const canNextBattle = battlePage < totalBattlePages - 1;

  return (
    <div id="my-battles" className="flex h-full min-h-[420px] flex-col scroll-mt-24">
      <div className="mb-6 flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <h3 className="font-tech text-2xl font-black uppercase leading-tight sm:text-3xl">MY BATTLES</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Your completed arena battle history.</p>
        </div>
        <div className="flex items-center gap-4">
          {memories.length > CARDS_PER_PAGE && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBattlePage((p) => Math.max(0, p - 1))}
                disabled={!canPrevBattle}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-white transition hover:border-primary/60 hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[3ch] text-center font-tech text-[10px] text-muted-foreground">
                {battlePage + 1}/{totalBattlePages}
              </span>
              <button
                type="button"
                onClick={() => setBattlePage((p) => Math.min(totalBattlePages - 1, p + 1))}
                disabled={!canNextBattle}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-white transition hover:border-primary/60 hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          <Link to="/battles" className="text-sm text-accent hover:underline">
            View All
          </Link>
        </div>
      </div>

      {myAgentsQ.isLoading || memoriesQ.isLoading ? (
        <div className="card-glass flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your battles...
        </div>
      ) : memoriesQ.isError || memories.length === 0 ? (
        <div className="card-glass flex flex-1 items-center justify-center rounded-xl px-5 py-8 text-center text-sm text-muted-foreground">
          No completed or cancelled battles are available yet. Start matchmaking to enter the arena.
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className="flex flex-1 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${battlePage * 100}%)` }}
          >
            {Array.from({ length: totalBattlePages }, (_, pageIdx) => (
              <div
                key={pageIdx}
                className="grid w-full flex-shrink-0 grid-cols-1 gap-4"
              >
                {memories
                  .slice(pageIdx * CARDS_PER_PAGE, pageIdx * CARDS_PER_PAGE + CARDS_PER_PAGE)
                  .map((memory) => {
                    const battleId = memory.metadata?.battleId;
                    const battle = battleId ? battlesById.get(battleId) : undefined;
                    const participants = (battle?.agentIds ?? [memory.ownerAgentId])
                      .map((agentId) => agentsById.get(agentId))
                      .filter((agent): agent is AiArenaAgent => Boolean(agent));
                    const outcome = String(memory.metadata?.outcome ?? memory.type).toUpperCase();
                    const isWin = outcome === "WIN";
                    const isCancelled = outcome === "CANCELLED";

                    return (
                      <div
                        key={memory.id}
                        className="card-glass group relative h-full overflow-hidden rounded-xl border border-primary/20 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_22px_55px_rgba(0,0,0,0.42),0_0_30px_rgba(154,53,255,0.2)] lg:p-4 xl:p-5"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(154,53,255,0.16),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/4 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:left-[125%] group-hover:opacity-100" />
                        <div className="relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`rounded-full border px-2.5 py-1 font-tech text-[9px] uppercase ${
                            isCancelled
                              ? "border-white/20 bg-white/5 text-white/55"
                              : isWin
                              ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-400/35 bg-rose-500/10 text-rose-300"
                          }`}>
                            {isCancelled ? "Cancelled" : isWin ? "Win" : "Loss"}
                          </span>
                          <span className="font-tech text-[9px] uppercase text-accent">Battle Memory</span>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-3 lg:mt-3">
                          {participants.map((agent, index) => (
                            <div key={agent.id} className="flex items-center gap-3">
                              {index > 0 ? <span className="font-display text-sm font-bold text-primary">VS</span> : null}
                              <div className="text-center">
                                <ArenaAgentThumbnail
                                  agent={agent}
                                  size="md"
                                  className="h-20 w-20 rounded-xl border-2 border-primary/25 transition duration-500 group-hover:scale-105 group-hover:border-primary/65 group-hover:shadow-[0_0_20px_rgba(154,53,255,0.28)] lg:h-16 lg:w-16 xl:h-20 xl:w-20"
                                />
                                <p className="mt-1 max-w-20 truncate font-tech text-[8px] text-white/55">{agent.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 font-mono text-[11px] italic leading-relaxed text-white/65 lg:mt-3 lg:text-[10px]">{memory.content}</p>
                        <p className="mt-2 font-mono text-[10px] text-white/40 lg:mt-1.5">
                          {new Date(memory.createdAt).toLocaleString()}
                        </p>
                        {battleId ? (
                          <Link
                            to={`/arena/game/${battleId}`}
                            className="mt-4 inline-flex items-center gap-2 font-tech text-[9px] font-bold uppercase text-primary hover:text-white lg:mt-3"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Open Battle {shortBattleId(battleId)}
                          </Link>
                        ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
          {/* Dot indicators */}
          {totalBattlePages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {Array.from({ length: totalBattlePages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBattlePage(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === battlePage
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LiveBattles() {
  const battleBoardQ = useArenaBattleBoard({ maxRankedPairs: 6 });
  const previewItems = battleBoardQ.items.slice(0, 1);

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="mb-6 flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <h3 className="font-tech text-2xl font-black uppercase leading-tight sm:text-3xl">LIVE BATTLES</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Watch ranked agents fight in real time.</p>
        </div>
        <Link to="/battles" className="text-sm text-accent hover:underline">
          View All
        </Link>
      </div>
      {battleBoardQ.isLoading && previewItems.length === 0 ? (
        <ArenaBattleBoardGridSkeleton count={1} className="flex-1" />
      ) : previewItems.length > 0 ? (
        <div className="grid flex-1 grid-cols-1 gap-4">
          {previewItems.map((item) => (
            <ArenaBattleBoardCard
              key={item.id}
              item={item}
              actionLabel={item.kind === "ranked" ? "Watch Live" : "View Battle"}
              actionTo={item.kind === "ranked" ? `/arena/game/${item.id}` : "/battles"}
            />
          ))}
        </div>
      ) : (
        <div className="card-glass flex flex-1 items-center justify-center rounded-xl px-5 py-8 text-sm text-muted-foreground">
          No live arena battles or open lobbies are available right now.
        </div>
      )}
    </div>
  );
}

function PartnersBlock() {
  const partners = [
    { key: "0G", label: "ZeroG" },
    { key: "Base", label: "Base" },
    { key: "Solana", label: "Solana" },
    { key: "OKX", label: "OKX" },
  ];
  return (
    <section>
      <div className="card-glass relative overflow-hidden rounded-lg border-white/8 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:rounded-xl sm:p-5 sm:shadow-[0_16px_42px_rgba(0,0,0,0.24)] lg:p-4 xl:p-5">
        <div className="absolute inset-0 grid-bg opacity-15" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
        <div className="relative grid items-center gap-3 sm:gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(130px,0.7fr)_minmax(260px,1.2fr)_minmax(220px,0.9fr)] xl:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-center justify-center gap-2 md:justify-start lg:gap-2.5">
            <div className="font-tech text-[8px] tracking-[0.24em] text-muted-foreground sm:text-[9px] sm:tracking-[0.28em] lg:text-[8px] lg:tracking-[0.22em] xl:text-[9px] xl:tracking-[0.28em]">
              POWERED BY
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-primary/12 p-1.5 sm:h-8 sm:w-8 lg:h-7 lg:w-7 xl:h-8 xl:w-8">
              <ZeroGLogo className="h-3.5 w-auto sm:h-4.5 lg:h-3.5 xl:h-4.5" />
            </div>
          </div>
          <div className="text-center font-display text-[1.05rem] leading-tight sm:text-xl md:text-2xl lg:text-lg lg:leading-snug xl:text-2xl xl:leading-tight">
            BUILDING THE FUTURE
            <br />
            OF AI GAMING <span className="text-accent">TOGETHER</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:justify-end lg:gap-1.5 xl:gap-2">
            {partners.map((p) => (
              <div
                key={p.key}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.035] px-2 py-1.5 font-tech text-[10px] text-white/80 sm:px-2.5 sm:text-[11px] lg:px-2 lg:py-1.5 lg:text-[10px] xl:px-2.5 xl:text-[11px]"
              >
                <ChainLogo
                  name={p.key}
                  className={
                    p.key.toLowerCase() === "0g"
                      ? "h-2.5 w-auto sm:h-3 xl:h-3.5"
                      : "h-3.5 w-auto sm:h-4 xl:h-[18px]"
                  }
                  useLogosForChains={true}
                />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArenaLandingFooter() {
  const platformLinks = [
    { label: "Games", href: "/", icon: Gamepad2 },
    { label: "Inventory", href: "/inventory", icon: BriefcaseBusiness },
    { label: "AI Arena", href: "/ai-arena", icon: BrainCircuit },
    { label: "Moments", href: "/moments", icon: Video },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  const socials = [
    {
      key: "x",
      label: "X",
      href: "https://x.com/_KultGames",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "discord",
      label: "Discord",
      href: "https://discord.com/invite/Cge7rrCyUB",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.024.017.043.037.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
    },
    {
      key: "telegram",
      label: "Telegram",
      href: "https://t.me/KultGamesOfficial",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="arena-panel relative mt-20 mb-6 border border-white/8 bg-[#04080f] overflow-hidden">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-[0.09]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(278_100%_74%/0.85)] to-transparent" />
      <div className="pointer-events-none absolute -left-28 top-8 h-56 w-56 rounded-full bg-[hsl(278_100%_60%/0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[hsl(190_100%_55%/0.11)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(278_100%_70%/0.12),transparent_34%),linear-gradient(180deg,rgba(7,10,22,0.92),rgba(2,5,12,0.98))]" />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="grid gap-8 py-10 xl:grid-cols-[1.15fr_0.85fr_0.7fr] xl:items-center xl:py-12">
          
          {/* Col 1 */}
          <div className="group/brand relative w-full max-w-[390px] mx-auto xl:mx-0 overflow-hidden rounded-[1.1rem] border border-[#5a35ff]/38 bg-[linear-gradient(140deg,rgba(31,21,78,0.82),rgba(4,7,18,0.97)_58%)] p-5 shadow-[0_0_34px_rgba(104,62,255,0.16),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#8f73ff]/70 hover:shadow-[0_0_48px_rgba(104,62,255,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_6%_0%,rgba(130,91,255,0.28),transparent_32%)] transition duration-300 group-hover/brand:opacity-80" />
            <div className="relative flex min-w-0 flex-col items-center text-center gap-4 sm:flex-row sm:items-center sm:text-left sm:gap-5">
              <div className="flex h-[72px] shrink-0 items-center justify-center gap-5 rounded-lg border border-[hsl(278_100%_70%/0.24)] bg-black/48 px-5 shadow-[0_0_26px_rgba(112,73,255,0.16)] transition duration-300 group-hover/brand:bg-black/65 group-hover/brand:shadow-[0_0_34px_rgba(112,73,255,0.28)]">
                <span className="font-display text-xl text-gradient glow-text whitespace-nowrap transition duration-300 group-hover/brand:scale-105 group-hover/brand:drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]">AI ARENA</span>
              </div>
              <div className="min-w-0">
                <p className="font-tech text-[12px] font-black uppercase leading-[1.5] tracking-[0.22em] text-[#dce5ff] transition duration-300 group-hover/brand:text-white">
                  Presented by Kult Games
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/56 transition duration-300 group-hover/brand:text-white/78">
                  AI Arena is a next-gen AI gaming ecosystem where intelligent agents battle, evolve and dominate.
                </p>
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <nav
            className="group/explore flex flex-col items-center text-center xl:items-start xl:text-left justify-center border-white/8 transition duration-300 hover:border-[#7d5cff]/35 xl:min-h-[168px] xl:border-x xl:px-6"
            aria-label="Footer navigation"
          >
            <p className="mb-5 font-tech text-[12px] font-black uppercase tracking-[0.46em] text-[#a790ff] transition duration-300 group-hover/explore:text-[#d8c7ff] group-hover/explore:drop-shadow-[0_0_10px_rgba(167,144,255,0.55)]">EXPLORE</p>
            <div className="flex flex-wrap justify-center xl:justify-start gap-3">
              {platformLinks.map((link) => {
                const Icon = link.icon;
                return link.href.startsWith("http") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-11 items-center justify-start gap-2.5 rounded-[1.25rem] border border-white/10 bg-black/25 px-4 text-[13px] font-medium text-white/86 shadow-[inset_0_0_0_1px_rgba(130,98,255,0.08)] transition hover:-translate-y-0.5 hover:border-[#7d5cff]/55 hover:bg-[#120d2d] hover:text-white hover:shadow-[0_0_20px_rgba(112,73,255,0.2)]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#8b6dff] transition group-hover:scale-110 group-hover:text-[#cbbcff]" />
                    <span className="whitespace-nowrap transition group-hover:text-white">{link.label}</span>
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group inline-flex h-11 items-center justify-start gap-2.5 rounded-[1.25rem] border border-white/10 bg-black/25 px-4 text-[13px] font-medium text-white/86 shadow-[inset_0_0_0_1px_rgba(130,98,255,0.08)] transition hover:-translate-y-0.5 hover:border-[#7d5cff]/55 hover:bg-[#120d2d] hover:text-white hover:shadow-[0_0_20px_rgba(112,73,255,0.2)]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#8b6dff] transition group-hover:scale-110 group-hover:text-[#cbbcff]" />
                    <span className="whitespace-nowrap transition group-hover:text-white">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Col 3 */}
          <div className="group/social flex flex-col items-center text-center xl:items-start xl:text-left justify-center gap-7 xl:min-h-[168px]">
            <div>
              <p className="mb-5 font-tech text-[12px] font-black uppercase tracking-[0.46em] text-[#a790ff] transition duration-300 group-hover/social:text-[#d8c7ff] group-hover/social:drop-shadow-[0_0_10px_rgba(167,144,255,0.55)]">
                FOLLOW
              </p>
              <div className="flex flex-wrap justify-center xl:justify-start gap-3">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#6645ff]/48 bg-black/20 text-[#a790ff] transition hover:-translate-y-0.5 hover:border-[#9d86ff] hover:bg-[#140f35] hover:text-white hover:shadow-[0_0_24px_rgba(112,73,255,0.32)]"
                    aria-label={s.label}
                  >
                    <span className="transition-transform group-hover:scale-110">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="group/video relative overflow-hidden rounded-[1.1rem] border border-[#5a35ff]/30 shadow-[0_0_24px_rgba(104,62,255,0.12)] transition duration-300 hover:border-[#8f73ff]/60 hover:shadow-[0_0_36px_rgba(104,62,255,0.25)] hover:-translate-y-1 mt-2 w-full max-w-[250px] mx-auto xl:mx-0">
              <video
                src={sceneVideo}
                autoPlay
                loop
                muted
                preload="none"
                playsInline
                className="w-full h-auto object-cover opacity-80 mix-blend-screen transition duration-300 group-hover/video:opacity-100"
              />
            </div>
          </div>
        </div>

        <div className="group/legal flex flex-col items-center justify-between gap-3 border-t border-white/10 py-5 transition duration-300 hover:border-[#7d5cff]/30 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-white/42 font-mono">
            <span className="transition group-hover/legal:text-white/68">© 2026 AI Arena</span>
            <span className="text-white/20 transition group-hover/legal:text-[#a790ff]/60">·</span>
            <span className="transition group-hover/legal:text-white/68">Powered by 0G</span>
          </div>
          <span className="text-center text-[9px] font-mono tracking-[0.28em] text-[hsl(278_100%_82%/0.58)] transition group-hover/legal:text-[#d8c7ff]">
            BUILT ON-CHAIN · AI-NATIVE · DECENTRALIZED
          </span>
        </div>
      </div>
    </footer>
  );
}
