import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, Crosshair, Eye, Hexagon, Loader2, Search, Shield, Swords, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArenaBattleBoardCard } from "@/components/arena/ArenaBattleBoardCard";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { ArenaBattleBoardGridSkeleton } from "@/components/skeleton";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import {
  AI_ARENA_DEFAULT_GAME_ID,
  AI_ARENA_GAME_IDS,
  AI_ARENA_MATCH_MODES,
} from "@/constants/aiArenaMatchmaking";
import { useAuth } from "@/contexts/AuthContext";
import { type ArenaOpenLobbyItem, useArenaBattleBoard } from "@/hooks/useArenaBattleBoard";
import { leaderboardElo, leaderboardName, useEnrichedArenaLeaderboard } from "@/hooks/useEnrichedArenaLeaderboard";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { getStoredAiAgentInfo } from "@/lib/aiAgentStorage";
import { getTrackedAiArenaBattleId, saveTrackedAiArenaBattleId } from "@/lib/arenaBattleStorage";
import type { AiArenaAgent, AiArenaBattle, AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";

function shortId(value?: string | null) {
  if (!value) return "—";
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function formatMode(mode?: string | null) {
  return mode ? mode.replaceAll("_", " ") : "Unknown";
}

function formatBattleStatus(status?: string | null) {
  return status ? status.replaceAll("_", " ") : "Unknown";
}

function battleStatusTone(status?: string | null) {
  switch (status) {
    case "COMPLETED":
      return "text-emerald-400";
    case "IN_PROGRESS":
      return "text-sky-400";
    case "DISPUTED":
      return "text-amber-400";
    case "CANCELLED":
      return "text-rose-400";
    default:
      return "text-purple-300";
  }
}

function formatTimestamp(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function fakeWatchCount(entry: AiArenaLeaderboardEntry) {
  const base = Math.max(120, Math.round((entry.wins ?? 0) * 5 + leaderboardElo(entry) / 8));
  return `${base.toLocaleString()} watching`;
}

function fallbackAgent(id: string): AiArenaAgent {
  return {
    id,
    name: `Agent ${id.slice(0, 6)}`,
    clan: "Unknown",
    archetype: "Unknown",
    evolutionStage: "GENESIS",
    eloRating: 0,
    wins: 0,
    losses: 0,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-tech text-sm uppercase tracking-[0.08em] text-white/82">{children}</h2>;
}

function StatsRail({
  rankedCount,
  topElo,
  myAgentsCount,
  trackedBattleStatus,
}: {
  rankedCount: number;
  topElo: number | null;
  myAgentsCount: number | null;
  trackedBattleStatus: string | null;
}) {
  const stats = [
    { label: "TRACKED BATTLE", value: trackedBattleStatus ?? "NONE", icon: Shield, color: "#8b29ff" },
    { label: "RANKED AGENTS", value: rankedCount.toLocaleString(), icon: Trophy, color: "#ffc000" },
    { label: "TOP ELO", value: topElo != null ? topElo.toLocaleString() : "—", icon: Crosshair, color: "#0089ff" },
    { label: "MY AGENTS", value: myAgentsCount != null ? String(myAgentsCount) : "—", icon: Swords, color: "#00f080" },
  ] as const;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">{stat.label}</span>
            <span className="font-tech block text-xl font-bold text-white">{stat.value}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: `${stat.color}33`, backgroundColor: `${stat.color}1a`, color: stat.color }}>
            <stat.icon className="h-4.5 w-4.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BattleInspectorCard({
  battle,
  participants,
  replayActionCount,
  loadingParticipants,
  onDispute,
  disputing,
}: {
  battle: AiArenaBattle;
  participants: AiArenaAgent[];
  replayActionCount: number | null;
  loadingParticipants: boolean;
  onDispute: () => void;
  disputing: boolean;
}) {
  const left = participants[0] ?? fallbackAgent(battle.agentIds?.[0] ?? "left");
  const right = participants[1] ?? fallbackAgent(battle.agentIds?.[1] ?? "right");

  return (
    <article className="arena-panel relative overflow-hidden border-white/8 bg-[#04080f]/95 p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,41,255,0.12),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(0,137,255,0.09),transparent_34%)]" />
      <div className="relative z-10">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Live Battle</div>
              <h3 className="mt-2 text-xl font-bold text-white">Tracked battle snapshot</h3>
              <p className="mt-1 text-xs text-white/55">
                Battle ID <span className="font-mono text-white/78">{battle.id}</span>
            </p>
          </div>
          <div className="text-right">
            <div className={`font-tech text-[11px] uppercase tracking-[0.18em] ${battleStatusTone(battle.status)}`}>
              {formatBattleStatus(battle.status)}
            </div>
            <div className="mt-1 text-xs text-white/55">{formatMode(battle.mode)}</div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-xl border border-white/8 bg-black/30 p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <BattleAgentCard agent={left} side="left" />
              <span className="font-tech text-3xl italic text-white/40">VS</span>
              <BattleAgentCard agent={right} side="right" />
            </div>
            {loadingParticipants ? (
              <div className="mt-4 flex items-center gap-2 text-xs text-white/45">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resolving battle participants…
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <MiniStat label="Game" value={battle.gameId ?? "—"} monospace />
            <MiniStat label="Started" value={formatTimestamp(battle.startedAt)} />
            <MiniStat label="Ended" value={formatTimestamp(battle.endedAt)} />
            <MiniStat label="Replay Actions" value={replayActionCount != null ? replayActionCount.toLocaleString() : "—"} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="text-xs text-white/55">
            Inspect battles from the AI Arena page or paste any known battle ID here.
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/ai-arena"
              className="inline-flex items-center gap-2 rounded border border-[#9b32ff]/45 bg-[#230b35]/60 px-3 py-2 font-tech text-[10px] uppercase tracking-[0.16em] text-white transition hover:border-[#bb65ff]"
            >
              Open AI Arena
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            {battle.status === "COMPLETED" ? (
              <button
                type="button"
                onClick={onDispute}
                disabled={disputing}
                className="inline-flex items-center gap-2 rounded border border-amber-500/35 bg-amber-500/10 px-3 py-2 font-tech text-[10px] uppercase tracking-[0.16em] text-amber-300 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {disputing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                Dispute battle
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function BattleAgentCard({ agent, side }: { agent: AiArenaAgent; side: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${side === "right" ? "text-right" : ""}`}>
      <div className={`flex items-center gap-3 ${side === "right" ? "justify-end" : ""}`}>
        {side === "right" ? null : <ArenaAgentThumbnail agent={agent} className="h-16 w-16 rounded-xl" size="md" />}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">{agent.name}</div>
          <div className="truncate font-tech text-[10px] uppercase tracking-[0.16em] text-white/45">
            {agent.archetype} · {agent.clan}
          </div>
          <div className="mt-1 text-xs text-white/58">ELO {agent.eloRating.toLocaleString()}</div>
        </div>
        {side === "right" ? <ArenaAgentThumbnail agent={agent} className="h-16 w-16 rounded-xl" size="md" /> : null}
      </div>
    </div>
  );
}

function MiniStat({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/30 px-4 py-3">
      <div className="font-tech text-[9px] uppercase tracking-[0.18em] text-white/38">{label}</div>
      <div className={`mt-1 text-sm font-semibold text-white ${monospace ? "font-mono break-all" : ""}`}>{value}</div>
    </div>
  );
}

function RankedFaceoffCard({ left, right }: { left: AiArenaLeaderboardEntry; right: AiArenaLeaderboardEntry }) {
  return (
    <article className="arena-panel overflow-hidden border-white/8 bg-[#04080f]/95 p-4">
      <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/45">
        <span>Leaderboard matchup</span>
        <span className="flex items-center gap-1 text-white/55">
          <Eye className="h-3 w-3" />
          {fakeWatchCount(left)}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <RankAgentBlock entry={left} align="left" />
        <span className="font-tech text-2xl italic text-white/40">VS</span>
        <RankAgentBlock entry={right} align="right" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs">
        <span className="text-white/58">
          #{left.rank} vs #{right.rank}
        </span>
        <span className="text-[#00f080]">
          {leaderboardElo(left).toLocaleString()} / {leaderboardElo(right).toLocaleString()} ELO
        </span>
      </div>
    </article>
  );
}

function RankAgentBlock({ entry, align }: { entry: AiArenaLeaderboardEntry; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : ""}`}>
      <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : ""}`}>
        {align === "right" ? null : (
          <ArenaAgentThumbnail
            agent={{ id: entry.agentId, archetype: entry.archetype, name: leaderboardName(entry) }}
            className="h-12 w-12 rounded-xl"
          />
        )}
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-white">{leaderboardName(entry)}</div>
          <div className="truncate text-[10px] text-white/45">{entry.clan ?? "AI Arena"}</div>
        </div>
        {align === "right" ? (
          <ArenaAgentThumbnail
            agent={{ id: entry.agentId, archetype: entry.archetype, name: leaderboardName(entry) }}
            className="h-12 w-12 rounded-xl"
          />
        ) : null}
      </div>
    </div>
  );
}

function PerformerCard({ entry }: { entry: AiArenaLeaderboardEntry }) {
  return (
    <article className="arena-panel flex items-center gap-3 border-white/8 bg-[#04080f]/95 p-3">
      <ArenaAgentThumbnail
        agent={{ id: entry.agentId, archetype: entry.archetype, name: leaderboardName(entry) }}
        className="h-[86px] w-[70px] rounded-xl"
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-tech text-xs text-white">{leaderboardName(entry)}</span>
          <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
        </div>
        <p className="mt-1 text-[11px] text-white/55">{entry.clan ?? entry.archetype ?? "AI Arena"}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-[10px] text-white/45">Rank</div>
            <div className="text-lg font-semibold text-white">#{entry.rank}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/45">ELO</div>
            <div className="text-lg font-semibold text-[#00f080]">{leaderboardElo(entry).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

const BattlesPage = () => {
  const { isAuthenticated, login } = useAuth();
  const [battleIdInput, setBattleIdInput] = useState(() => getTrackedAiArenaBattleId() ?? "");
  const [selectedBattleId, setSelectedBattleId] = useState(() => getTrackedAiArenaBattleId());
  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null);
  const [manualBattleAgentId, setManualBattleAgentId] = useState<string | null>(null);
  const [manualOpponentId, setManualOpponentId] = useState("");
  const [manualMode, setManualMode] = useState<(typeof AI_ARENA_MATCH_MODES)[number]["value"]>("RANKED");
  const [manualGameId, setManualGameId] = useState(AI_ARENA_DEFAULT_GAME_ID);
  const [manualWagerAmount, setManualWagerAmount] = useState("");

  const myAgentsQ = useMyArenaAgents(1, 50);
  const battleBoardQ = useArenaBattleBoard({ maxRankedPairs: 12 });
  const leaderboardQ = useEnrichedArenaLeaderboard(true);

  const battleQ = useQuery({
    queryKey: ["aiArenaGateway", "battlePageBattle", selectedBattleId],
    queryFn: () => aiArenaGatewayApi.getBattle(selectedBattleId!),
    enabled: !!selectedBattleId,
    retry: 1,
  });

  const battleAgentIds = battleQ.data?.battle.agentIds ?? [];

  const participantsQ = useQuery({
    queryKey: ["aiArenaGateway", "battlePageBattleParticipants", selectedBattleId, battleAgentIds.join(",")],
    queryFn: async () =>
      Promise.all(
        battleAgentIds.map(async (agentId) => {
          try {
            return await aiArenaGatewayApi.getAgentById(agentId);
          } catch {
            return fallbackAgent(agentId);
          }
        })
      ),
    enabled: battleAgentIds.length > 0,
    retry: 1,
  });

  const replayQ = useQuery({
    queryKey: ["aiArenaGateway", "battlePageReplay", selectedBattleId],
    queryFn: () => aiArenaGatewayApi.getReplay(selectedBattleId!),
    enabled: !!selectedBattleId && battleQ.data?.battle.status === "COMPLETED",
    retry: 1,
  });

  const disputeMut = useMutation({
    mutationFn: async () => {
      if (!selectedBattleId) throw new Error("Missing battle id");
      const reason = window.prompt("Enter a dispute reason");
      if (!reason?.trim()) throw new Error("Dispute cancelled");
      return aiArenaGatewayApi.disputeBattle(selectedBattleId, { reason: reason.trim() });
    },
    onSuccess: async () => {
      toast.success("Battle dispute submitted");
      await battleQ.refetch();
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "Dispute cancelled") return;
      toast.error(err instanceof Error ? err.message : "Could not file dispute");
    },
  });

  const entries = leaderboardQ.data?.entries ?? [];
  const topElo = entries[0] ? leaderboardElo(entries[0]) : null;
  const myAgents = myAgentsQ.data?.agents ?? [];
  const myAgentIds = useMemo(() => new Set(myAgents.map((agent) => agent.id)), [myAgents]);
  const queuedMyAgentIds = useMemo(
    () =>
      new Set(
        battleBoardQ.openLobbyItems
          .filter((item) => myAgentIds.has(item.agent.id))
          .map((item) => item.agent.id)
      ),
    [battleBoardQ.openLobbyItems, myAgentIds]
  );
  const challengeAgent = useMemo(() => {
    const preferredAgentId = getStoredAiAgentInfo()?.id ?? null;
    const availableAgents = myAgents.filter((agent) => !queuedMyAgentIds.has(agent.id));
    if (preferredAgentId) {
      const preferred = availableAgents.find((agent) => agent.id === preferredAgentId);
      if (preferred) return preferred;
    }
    return availableAgents[0] ?? null;
  }, [myAgents, queuedMyAgentIds]);
  const manualBattleAgents = useMemo(
    () => myAgents.filter((agent) => !queuedMyAgentIds.has(agent.id)),
    [myAgents, queuedMyAgentIds]
  );
  const selectedManualBattleAgent = useMemo(
    () => manualBattleAgents.find((agent) => agent.id === manualBattleAgentId) ?? null,
    [manualBattleAgents, manualBattleAgentId]
  );
  const manualModeMeta = AI_ARENA_MATCH_MODES.find((mode) => mode.value === manualMode) ?? null;
  const manualGameMeta = AI_ARENA_GAME_IDS.find((game) => game.value === manualGameId) ?? null;

  useEffect(() => {
    setManualBattleAgentId((current) => {
      if (current && manualBattleAgents.some((agent) => agent.id === current)) return current;
      return challengeAgent?.id ?? manualBattleAgents[0]?.id ?? null;
    });
  }, [challengeAgent, manualBattleAgents]);

  const joinLobbyMut = useMutation({
    mutationFn: async (lobby: ArenaOpenLobbyItem) => {
      if (!challengeAgent) {
        throw new Error("No available agent is ready to join this arena lobby.");
      }

      const gameId = lobby.status.gameId?.trim() || AI_ARENA_DEFAULT_GAME_ID;
      const mode = lobby.status.mode ?? "RANKED";
      const res = await aiArenaGatewayApi.directMatchmakingChallenge({
        agentId: challengeAgent.id,
        opponentId: lobby.agent.id,
        gameId,
        mode,
      });

      return { lobby, challenger: challengeAgent, res };
    },
    onMutate: (lobby) => {
      setJoiningLobbyId(lobby.id);
    },
    onSuccess: async ({ lobby, challenger, res }) => {
      const battleId = res.match.battleId;
      setBattleIdInput(battleId);
      setSelectedBattleId(battleId);
      saveTrackedAiArenaBattleId(battleId);
      toast.success(`${challenger.name} joined ${lobby.agent.name} — battle ${shortId(battleId)} is live`);
      await Promise.all([battleBoardQ.openLobbiesQ.refetch(), battleBoardQ.leaderboardQ.refetch()]);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not join arena lobby");
    },
    onSettled: () => {
      setJoiningLobbyId(null);
    },
  });

  const createBattleMut = useMutation({
    mutationFn: async () => {
      if (!manualBattleAgentId) {
        throw new Error("Select your fighter first.");
      }
      const opponentId = manualOpponentId.trim();
      if (!opponentId) {
        throw new Error("Enter an opponent agent ID.");
      }
      const wagerAmount = Number.parseFloat(manualWagerAmount);
      return aiArenaGatewayApi.createBattle({
        agentId: manualBattleAgentId,
        opponentId,
        mode: manualMode,
        gameId: manualGameId,
        wagerAmount: manualMode === "WAGER" && Number.isFinite(wagerAmount) ? wagerAmount : undefined,
      });
    },
    onSuccess: async ({ battle }) => {
      setBattleIdInput(battle.id);
      setSelectedBattleId(battle.id);
      saveTrackedAiArenaBattleId(battle.id);
      toast.success(`Battle ${shortId(battle.id)} created`);
      setManualOpponentId("");
      if (manualMode === "WAGER") setManualWagerAmount("");
      await Promise.all([battleQ.refetch(), battleBoardQ.openLobbiesQ.refetch()]);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not create battle");
    },
  });

  const handleBattleLookup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextId = battleIdInput.trim();
    if (!nextId) {
      setSelectedBattleId(null);
      saveTrackedAiArenaBattleId(null);
      return;
    }
    setSelectedBattleId(nextId);
    saveTrackedAiArenaBattleId(nextId);
  };

  return (
    <ArenaPageLayout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">BATTLE ARENA</h1>
        <p className="text-sm text-white/68">
          Track open arena lobbies, inspect known battles, and follow live AI Arena matchups from one board.
        </p>
      </div>

      <StatsRail
        rankedCount={entries.length}
        topElo={topElo}
        myAgentsCount={isAuthenticated ? (myAgentsQ.data?.agents.length ?? null) : null}
        trackedBattleStatus={battleQ.data?.battle.status ?? null}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle>All Arena Battles</SectionTitle>
          <Link to="/ai-arena" className="font-tech text-[10px] uppercase tracking-[0.16em] text-[#b33cff]">
            Open AI Arena
          </Link>
        </div>
        {battleBoardQ.isLoading && battleBoardQ.items.length === 0 ? (
          <ArenaBattleBoardGridSkeleton count={6} />
        ) : battleBoardQ.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {battleBoardQ.items.map((item) => (
              <ArenaBattleBoardCard
                key={item.id}
                item={item}
                actionLabel={
                  item.kind === "open-lobby"
                    ? myAgentIds.has(item.agent.id)
                      ? "View Queue"
                      : "Join In Arena"
                    : "Open Arena"
                }
                actionTo={
                  item.kind === "open-lobby"
                    ? myAgentIds.has(item.agent.id)
                      ? "/ai-arena"
                      : undefined
                    : "/ai-arena"
                }
                onAction={
                  item.kind === "open-lobby" && !myAgentIds.has(item.agent.id)
                    ? () => {
                        if (!isAuthenticated) {
                          login();
                          return;
                        }
                        if (myAgentsQ.isLoading) {
                          toast.message("Loading your arena roster...");
                          return;
                        }
                        if (myAgents.length === 0) {
                          toast.error("Create an AI Arena agent before joining a lobby.");
                          return;
                        }
                        if (!challengeAgent) {
                          toast.error("All of your agents are already queued. Leave a queue first, then join this lobby.");
                          return;
                        }
                        joinLobbyMut.mutate(item);
                      }
                    : undefined
                }
                actionDisabled={
                  item.kind === "open-lobby" &&
                  !myAgentIds.has(item.agent.id) &&
                  joiningLobbyId != null &&
                  joiningLobbyId !== item.id
                }
                actionLoading={
                  item.kind === "open-lobby" &&
                  !myAgentIds.has(item.agent.id) &&
                  joiningLobbyId === item.id
                }
              />
            ))}
          </div>
        ) : (
          <div className="arena-panel border-dashed border-white/12 bg-[#04080f]/80 px-5 py-8 text-center text-sm text-white/55">
            No queued arena lobbies or live matchups are available right now.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>Manual Battle Creator</SectionTitle>
          <span className="font-tech text-[10px] uppercase tracking-[0.16em] text-white/40">Invite a specific opponent</span>
        </div>

        <div className="arena-panel relative overflow-hidden border-white/8 bg-[#04080f]/95 p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,210,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(155,50,255,0.12),transparent_38%)]" />
          {isAuthenticated ? (
            manualBattleAgents.length > 0 ? (
              <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(8,14,26,0.96),rgba(4,8,15,0.92))] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-cyan-300">Direct Duel</div>
                      <h3 className="mt-1 text-xl font-bold text-white">Launch a custom battle</h3>
                    </div>
                    <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-tech text-[10px] uppercase tracking-[0.16em] text-cyan-300">
                      No Queue Needed
                    </div>
                  </div>

                  {selectedManualBattleAgent ? (
                    <div className="rounded-2xl border border-cyan-500/15 bg-[radial-gradient(circle_at_top,rgba(0,210,255,0.14),transparent_48%),linear-gradient(180deg,rgba(15,26,44,0.95),rgba(7,10,22,0.95))] p-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <ArenaAgentThumbnail
                          agent={selectedManualBattleAgent}
                          className="h-24 w-24 rounded-2xl border-cyan-500/25 shadow-[0_0_32px_rgba(0,210,255,0.18)]"
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-tech text-[10px] uppercase tracking-[0.16em] text-white/40">Your fighter</div>
                          <div className="mt-1 truncate text-2xl font-bold text-white">
                            {selectedManualBattleAgent.name}
                          </div>
                          <div className="mt-1 text-sm text-white/55">
                            {selectedManualBattleAgent.archetype} · {selectedManualBattleAgent.clan}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.14em] text-emerald-300">
                              ELO {selectedManualBattleAgent.eloRating.toLocaleString()}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.14em] text-white/65">
                              {manualModeMeta?.label ?? manualMode}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.14em] text-white/65">
                              {manualGameMeta?.label ?? manualGameId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-white/8 bg-black/25 px-3.5 py-3 text-sm text-white/60">
                        {manualOpponentId.trim()
                          ? `Target locked. This battle will challenge agent ${manualOpponentId.trim()}.`
                          : "Paste an opponent agent ID to set up a direct fight."}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MiniStat label="Mode" value={manualModeMeta?.label ?? manualMode} />
                    <MiniStat label="Game" value={manualGameMeta?.label ?? manualGameId} />
                    <MiniStat label="Wager" value={manualMode === "WAGER" ? (manualWagerAmount.trim() || "Set stake") : "Disabled"} />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
                  <div className="mb-4">
                    <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-white/38">Battle Config</div>
                    <p className="mt-1 text-sm text-white/55">
                      Skip matchmaking and challenge a specific rival directly. Queued fighters stay hidden here to avoid conflicts.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/35">Your fighter</span>
                      <select
                        value={manualBattleAgentId ?? ""}
                        onChange={(event) => setManualBattleAgentId(event.target.value || null)}
                        className="arena-select"
                      >
                        {manualBattleAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} — ELO {agent.eloRating}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/35">Opponent ID</span>
                      <input
                        value={manualOpponentId}
                        onChange={(event) => setManualOpponentId(event.target.value)}
                        placeholder="Paste target agent id"
                        className="arena-input"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/35">Mode</span>
                      <select
                        value={manualMode}
                        onChange={(event) => setManualMode(event.target.value as (typeof AI_ARENA_MATCH_MODES)[number]["value"])}
                        className="arena-select"
                      >
                        {AI_ARENA_MATCH_MODES.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/35">Game</span>
                      <select
                        value={manualGameId}
                        onChange={(event) => setManualGameId(event.target.value)}
                        className="arena-select"
                      >
                        {AI_ARENA_GAME_IDS.map((game) => (
                          <option key={game.value} value={game.value}>
                            {game.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {manualMode === "WAGER" ? (
                    <label className="mt-3 block max-w-xs space-y-2">
                      <span className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/35">Wager amount</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualWagerAmount}
                        onChange={(event) => setManualWagerAmount(event.target.value)}
                        placeholder="Optional stake"
                        className="arena-input"
                      />
                    </label>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
                    <div className="text-xs text-white/45">
                      Direct battles are useful for controlled matchups, testing, and admin-triggered duels.
                    </div>
                    <button
                      type="button"
                      onClick={() => createBattleMut.mutate()}
                      disabled={createBattleMut.isPending || !manualBattleAgentId || !manualOpponentId.trim()}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(0,210,255,0.18),rgba(155,50,255,0.2))] px-4 py-2.5 font-tech text-[10px] uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(0,210,255,0.12)] transition hover:border-cyan-300/55 hover:shadow-[0_0_30px_rgba(0,210,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {createBattleMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Swords className="h-3.5 w-3.5" />}
                      {createBattleMut.isPending ? "Opening Battle" : "Create Battle"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 text-sm text-white/55">
                All of your agents are currently queued or unavailable. Leave a queue first, then create a direct battle.
              </div>
            )
          ) : (
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/55">Connect your wallet to create direct AI Arena battles.</p>
              <button
                type="button"
                onClick={login}
                className="inline-flex items-center gap-2 rounded border border-[#9b32ff]/45 bg-[#230b35]/70 px-4 py-2.5 font-tech text-[10px] uppercase tracking-[0.16em] text-white transition hover:border-[#bb65ff]"
              >
                Login To Create
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>Battle Inspector</SectionTitle>
          <Link to="/ai-arena" className="font-tech text-[10px] uppercase tracking-[0.16em] text-[#b33cff]">
            Go To AI Arena
          </Link>
        </div>

        <form onSubmit={handleBattleLookup} className="arena-panel flex flex-col gap-3 border-white/8 bg-[#04080f]/95 p-4 md:flex-row md:items-center">
          <label className="flex-1">
            <span className="mb-2 block font-tech text-[9px] uppercase tracking-[0.18em] text-white/42">
              Battle ID
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
              <input
                value={battleIdInput}
                onChange={(event) => setBattleIdInput(event.target.value)}
                placeholder="Paste AI Arena battle id"
                className="w-full rounded border border-white/8 bg-[#03070d]/60 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/45"
              />
            </div>
          </label>
          <div className="flex gap-2 md:self-end">
            <button
              type="submit"
              className="rounded border border-[#9b32ff]/45 bg-[#230b35]/70 px-4 py-2.5 font-tech text-[10px] uppercase tracking-[0.16em] text-white transition hover:border-[#bb65ff]"
            >
              Inspect Battle
            </button>
            <button
              type="button"
              onClick={() => {
                setBattleIdInput("");
                setSelectedBattleId(null);
                saveTrackedAiArenaBattleId(null);
              }}
              className="rounded border border-white/10 bg-white/5 px-4 py-2.5 font-tech text-[10px] uppercase tracking-[0.16em] text-white/65 transition hover:text-white"
            >
              Clear
            </button>
          </div>
        </form>

        {battleQ.isLoading ? (
          <div className="arena-panel flex items-center gap-3 border-white/8 bg-[#04080f]/95 px-5 py-8 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading battle snapshot…
          </div>
        ) : battleQ.isError ? (
          <div className="arena-panel border-red-500/30 bg-red-950/20 px-5 py-6 text-sm text-red-100/85">
            We could not load that battle. Check the battle ID or start a new match from the AI Arena page.
          </div>
        ) : battleQ.data?.battle ? (
          <BattleInspectorCard
            battle={battleQ.data.battle}
            participants={participantsQ.data ?? []}
            replayActionCount={replayQ.data?.replay?.actionLog?.length ?? null}
            loadingParticipants={participantsQ.isLoading}
            onDispute={() => disputeMut.mutate()}
            disputing={disputeMut.isPending}
          />
        ) : (
          <div className="arena-panel border-dashed border-white/12 bg-[#04080f]/80 px-5 py-8 text-center text-sm text-white/55">
            No tracked battle yet. Join a match from <Link to="/ai-arena" className="text-[#c78aff] underline">AI Arena</Link> or paste a battle ID above.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle>Top Performers</SectionTitle>
          <Link to="/ai-arena" className="font-tech text-[10px] uppercase tracking-[0.16em] text-[#b33cff]">
            Open Arena Lobby
          </Link>
        </div>
        {entries.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {entries.slice(0, 5).map((entry) => (
              <PerformerCard key={entry.agentId} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="arena-panel border-white/8 bg-[#04080f]/95 px-5 py-8 text-sm text-white/55">
            No leaderboard performers yet.
          </div>
        )}
      </section>
    </ArenaPageLayout>
  );
};

export default BattlesPage;
