import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Swords } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { Button } from "@/components/ui/button";
import {
  AI_ARENA_DEFAULT_GAME_ID,
  type AiArenaMatchMode,
} from "@/constants/aiArenaMatchmaking";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { ArenaMatchFaceoff } from "@/components/arena/ArenaMatchFaceoff";
import { ArenaOpenLobbyCard } from "@/components/arena/ArenaOpenLobbyCard";
import { ArenaMatchStatusModal } from "@/components/arena/ArenaMatchStatusModal";
import { ArenaStartMatchmakingModal } from "@/components/arena/ArenaStartMatchmakingModal";
import { useArenaLiveMatch } from "@/contexts/ArenaLiveMatchContext";
import { getStoredAiAgentInfo } from "@/lib/aiAgentStorage";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

function formatWaitTime(ms?: number | null) {
  if (typeof ms !== "number" || ms <= 0) return "just now";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${totalSeconds}s`;
}

function formatShortId(value?: string | null) {
  if (!value) return "—";
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function apiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return String(data.error);
    if (err.response?.status === 402) {
      return "Payment required — fund your agent wallet and provide a wager payment tx hash.";
    }
  }
  return err instanceof Error ? err.message : fallback;
}

type FaceoffState = {
  left: AiArenaAgent;
  right: AiArenaAgent;
  battleId?: string;
  mode: string;
  pending?: boolean;
};

const ArenaMatchmakingPanel = () => {
  const queryClient = useQueryClient();
  const { isAiArenaReady } = useAiArenaGatewaySession();
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [statusModalAgent, setStatusModalAgent] = useState<AiArenaAgent | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [joiningOpponentId, setJoiningOpponentId] = useState<string | null>(null);
  const { setActiveBattleId } = useArenaLiveMatch();
  const [faceoff, setFaceoff] = useState<FaceoffState | null>(null);

  const myAgentsQ = useMyArenaAgents(1, 50);
  const agents = myAgentsQ.data?.agents ?? [];

  const invalidateMatchmaking = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ["aiArenaGateway", "matchmakingStatusCards"], type: "active" });
    await queryClient.refetchQueries({ queryKey: ["aiArenaGateway", "openLobbies"], type: "active" });
    await queryClient.refetchQueries({ queryKey: ["aiArenaGateway", "matchmakingMyAgents"], type: "active" });
  }, [queryClient]);

  const openStatusModal = useCallback(
    (agentId: string) => {
      const agent = agents.find((a) => a.id === agentId) ?? null;
      if (agent) setStatusModalAgent(agent);
    },
    [agents]
  );

  const handleMatchFound = useCallback(
    async (payload: { agent: AiArenaAgent; opponent: AiArenaAgent; battleId: string; mode: string }) => {
      setActiveBattleId(payload.battleId);
      setFaceoff({
        left: payload.agent,
        right: payload.opponent,
        battleId: payload.battleId,
        mode: payload.mode,
        pending: false,
      });
    },
    [setActiveBattleId]
  );

  const openLobbiesQ = useQuery({
    queryKey: ["aiArenaGateway", "openLobbies"],
    queryFn: async () => {
      const roster = await aiArenaGatewayApi.listAgents(1, 32);
      const withStatus = await Promise.all(
        (roster.agents ?? []).map(async (agent) => {
          try {
            const statusRes = await aiArenaGatewayApi.getMatchmakingStatus(agent.id);
            return { agent, status: statusRes.status };
          } catch {
            return { agent, status: null };
          }
        })
      );
      return withStatus.filter((row) => row.status?.inQueue);
    },
    enabled: isAiArenaReady,
    staleTime: 6_000,
    refetchInterval: 10_000,
    retry: 1,
  });

  const queueQ = useQuery({
    queryKey: ["aiArenaGateway", "matchmakingStatusCards", agents.map((a) => a.id).join(",")],
    queryFn: async () => {
      const enriched = await Promise.all(
        agents.map(async (agent) => {
          try {
            const statusRes = await aiArenaGatewayApi.getMatchmakingStatus(agent.id);
            return { agent, status: statusRes.status };
          } catch {
            return { agent, status: null };
          }
        })
      );
      return enriched;
    },
    enabled: isAiArenaReady && agents.length > 0,
    staleTime: 6_000,
    refetchInterval: 8_000,
    retry: 1,
  });

  useEffect(() => {
    const preferred = getStoredAiAgentInfo()?.id ?? null;
    setSelectedAgentId((cur) => {
      if (cur && agents.some((a) => a.id === cur)) return cur;
      if (preferred && agents.some((a) => a.id === preferred)) return preferred;
      return agents[0]?.id ?? null;
    });
  }, [agents]);

  const selectedStatus = useMemo(
    () => queueQ.data?.find((row) => row.agent.id === selectedAgentId)?.status ?? null,
    [queueQ.data, selectedAgentId]
  );

  const myQueuedLobbies = useMemo(
    () => (queueQ.data ?? []).filter((row) => row.status?.inQueue),
    [queueQ.data]
  );

  const otherOpenLobbies = useMemo(() => {
    const myIds = new Set(agents.map((a) => a.id));
    return (openLobbiesQ.data ?? []).filter((row) => !myIds.has(row.agent.id));
  }, [openLobbiesQ.data, agents]);

  const resolveFaceoff = useCallback(
    async (selfId: string, opponentId: string, battleId: string | undefined, matchMode: string, pending?: boolean) => {
      const left = agents.find((a) => a.id === selfId) ?? null;
      let right =
        openLobbiesQ.data?.find((r) => r.agent.id === opponentId)?.agent ??
        queueQ.data?.find((r) => r.agent.id === opponentId)?.agent ??
        null;
      if (!right) {
        try {
          right = await aiArenaGatewayApi.getAgentById(opponentId);
        } catch {
          right = null;
        }
      }
      if (left && right) {
        setFaceoff({ left, right, battleId, mode: matchMode, pending });
      }
    },
    [agents, openLobbiesQ.data, queueQ.data]
  );

  const acceptLobbyMut = useMutation({
    mutationFn: async (opponentAgentId: string) => {
      if (!selectedAgentId) throw new Error("Select your fighter first.");
      const lobby = openLobbiesQ.data?.find((r) => r.agent.id === opponentAgentId);
      const matchMode = (lobby?.status?.mode ?? "RANKED") as AiArenaMatchMode;
      const matchGameId = lobby?.status?.gameId?.trim() || AI_ARENA_DEFAULT_GAME_ID;
      return {
        opponentAgentId,
        matchMode,
        res: await aiArenaGatewayApi.directMatchmakingChallenge({
          agentId: selectedAgentId,
          opponentId: opponentAgentId,
          gameId: matchGameId,
          mode: matchMode,
        }),
      };
    },
    onMutate: async (opponentAgentId) => {
      setJoiningOpponentId(opponentAgentId);
      const lobby = openLobbiesQ.data?.find((r) => r.agent.id === opponentAgentId);
      const matchMode = lobby?.status?.mode ?? "RANKED";
      if (selectedAgentId) {
        await resolveFaceoff(selectedAgentId, opponentAgentId, undefined, matchMode, true);
      }
    },
    onSuccess: async ({ opponentAgentId, matchMode, res }) => {
      const battleId = res.match.battleId;
      setActiveBattleId(battleId);
      if (selectedAgentId) {
        await resolveFaceoff(selectedAgentId, opponentAgentId, battleId, matchMode, false);
      }
      toast.success(`Match joined — battle ${formatShortId(battleId)}`);
      await invalidateMatchmaking();
    },
    onError: (err) => {
      setFaceoff(null);
      toast.error(apiErrorMessage(err, "Could not join lobby"));
    },
    onSettled: () => setJoiningOpponentId(null),
  });

  const leaveMut = useMutation({
    mutationFn: async (agentId: string) => aiArenaGatewayApi.leaveMatchmakingQueue(agentId),
    onSuccess: async () => {
      toast.success("Left matchmaking queue");
      setStatusModalAgent(null);
      setFaceoff(null);
      await invalidateMatchmaking();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not leave queue")),
  });

  useEffect(() => {
    const battleId = selectedStatus?.matchId;
    if (!battleId || !selectedAgentId) return;

    let cancelled = false;
    void (async () => {
      setActiveBattleId(battleId);
      try {
        const { battle } = await aiArenaGatewayApi.getBattle(battleId);
        const otherId = battle.agentIds?.find((id) => id !== selectedAgentId);
        const matchMode = battle.mode ?? selectedStatus.mode ?? "RANKED";
        if (otherId && !cancelled) {
          await resolveFaceoff(selectedAgentId, otherId, battleId, matchMode, false);
        }
      } catch {
        if (!cancelled) {
          await resolveFaceoff(
            selectedAgentId,
            selectedAgentId,
            battleId,
            selectedStatus.mode ?? "RANKED",
            false
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedStatus?.matchId, selectedStatus?.mode, selectedAgentId, resolveFaceoff, setActiveBattleId]);

  const busy = acceptLobbyMut.isPending || leaveMut.isPending;

  return (
    <section
      id="arena-matchmaking"
      className="relative scroll-mt-[calc(4rem+env(safe-area-inset-top,0px)+0.75rem)]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 20% 20%, hsl(0 85% 50% / 0.06), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, hsl(195 100% 50% / 0.05), transparent)",
        }}
      />

      <div className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 lg:p-8">
        <motion.div className="pointer-events-none absolute inset-0 neural-grid opacity-[0.05]" aria-hidden />

        <header className="relative z-10 mb-6 flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <motion.div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/90">
              <span className="h-px w-8 shrink-0 bg-gradient-to-r from-neon-cyan/80 to-transparent" />
              Matchmaking
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Arena <span className="gradient-text">lobby</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Start matching to list your fighter. Others join from open lobbies — both agents appear face-to-face before the battle runs.
            </p>
          </motion.div>

          <Button
            type="button"
            disabled={!isAiArenaReady || agents.length === 0}
            onClick={() => setStartModalOpen(true)}
            className="shrink-0 rounded-xl border border-neon-cyan/35 bg-neon-cyan/15 px-5 text-neon-cyan hover:bg-neon-cyan/25"
          >
            <Swords className="mr-2 h-4 w-4" />
            Start matching
          </Button>
        </header>

        {faceoff ? (
          <ArenaMatchFaceoff
            className="relative z-10 mb-6"
            left={faceoff.left}
            right={faceoff.right}
            battleId={faceoff.battleId}
            mode={faceoff.mode}
            pending={faceoff.pending}
          />
        ) : null}

        <div className="relative z-10 mb-6 rounded-xl border border-white/[0.08] bg-background/35 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Open lobbies</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Queued fighters waiting for an opponent. Pick your agent, then join a fight.
              </p>
            </div>

            {agents.length > 0 ? (
              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <label className="arena-label">Your fighter</label>
                <select
                  value={selectedAgentId ?? ""}
                  onChange={(e) => setSelectedAgentId(e.target.value || null)}
                  disabled={busy}
                  className="arena-select disabled:opacity-50"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — ELO {a.eloRating}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {openLobbiesQ.isLoading && queueQ.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Scanning open lobbies…</p>
          ) : myQueuedLobbies.length === 0 && otherOpenLobbies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No open lobbies yet. Hit <span className="text-foreground">Start matching</span> to list your agent.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 lg:grid-cols-2">
              {myQueuedLobbies.map(({ agent, status }) =>
                status ? (
                  <ArenaOpenLobbyCard
                    key={agent.id}
                    agent={agent}
                    status={status}
                    isOwn
                    waitLabel={formatWaitTime(status.waitTimeMs ?? status.estimatedWaitMs)}
                    onJoin={() => undefined}
                    onViewDetails={() => openStatusModal(agent.id)}
                    disabled
                  />
                ) : null
              )}
              {otherOpenLobbies.map(({ agent, status }) =>
                status ? (
                  <ArenaOpenLobbyCard
                    key={agent.id}
                    agent={agent}
                    status={status}
                    waitLabel={formatWaitTime(status.waitTimeMs ?? status.estimatedWaitMs)}
                    joining={joiningOpponentId === agent.id}
                    disabled={busy || !selectedAgentId || selectedStatus?.inQueue}
                    onJoin={() => acceptLobbyMut.mutate(agent.id)}
                  />
                ) : null
              )}
            </ul>
          )}
        </div>

      </div>

      <ArenaStartMatchmakingModal
        open={startModalOpen}
        onOpenChange={setStartModalOpen}
        agents={agents}
        defaultAgentId={selectedAgentId}
        onQueued={async (agentId) => {
          await invalidateMatchmaking();
          openStatusModal(agentId);
        }}
      />

      <ArenaMatchStatusModal
        open={!!statusModalAgent}
        onOpenChange={(open) => {
          if (!open) setStatusModalAgent(null);
        }}
        agent={statusModalAgent}
        leaving={leaveMut.isPending}
        onLeave={(agentId) => leaveMut.mutate(agentId)}
        onMatchFound={handleMatchFound}
      />
    </section>
  );
};

export default ArenaMatchmakingPanel;
