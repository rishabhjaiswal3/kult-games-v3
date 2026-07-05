import { useEffect, useMemo, useState } from "react";
import { Swords } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { ArenaBattleBoardCard } from "@/components/arena/ArenaBattleBoardCard";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import { useArenaBattleBoard } from "@/hooks/useArenaBattleBoard";
import {
  AI_ARENA_DEFAULT_GAME_ID,
  AI_ARENA_MATCH_MODES,
  type AiArenaGameId,
  type AiArenaMatchMode,
} from "@/constants/aiArenaMatchmaking";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

export type ArenaJoinBattleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AiArenaAgent[];
  /** Called after a lobby is joined (or an own lobby is reopened) with the agent to track. */
  onJoined?: (agent: AiArenaAgent) => void;
};

export function ArenaJoinBattleModal({ open, onOpenChange, agents, onJoined }: ArenaJoinBattleModalProps) {
  const queryClient = useQueryClient();
  const battleBoardQ = useArenaBattleBoard({ enabled: open, maxRankedPairs: 8 });

  const [challengeAgentId, setChallengeAgentId] = useState<string | null>(agents[0]?.id ?? null);
  const [mode, setMode] = useState<AiArenaMatchMode>("RANKED");
  // gameId comes from the specific lobby being joined (item.status.gameId), not a shared state value.
  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null);

  const myAgentIds = useMemo(() => new Set(agents.map((agent) => agent.id)), [agents]);

  useEffect(() => {
    if (!open) return;
    setChallengeAgentId((current) => {
      if (current && agents.some((agent) => agent.id === current)) return current;
      return agents[0]?.id ?? null;
    });
  }, [open, agents]);

  const items = useMemo(() => battleBoardQ.items.slice(0, 8), [battleBoardQ.items]);

  const directChallengeMut = useMutation({
    mutationFn: async ({ opponentId, lobbyGameId }: { opponentId: string; lobbyGameId: string }) => {
      const nextAgentId = challengeAgentId ?? agents[0]?.id;
      if (!nextAgentId) throw new Error("Pick an agent to join with first.");
      // Mirror what ArenaStartMatchmakingModal does so handleMatchFound routing can use the
      // sessionStorage fallback even if payload.gameId comes back empty from the server.
      try { sessionStorage.setItem("arena_queued_game_id", lobbyGameId); } catch { /* ignore */ }
      return aiArenaGatewayApi.directMatchmakingChallenge({
        agentId: nextAgentId,
        opponentId,
        gameId: lobbyGameId as AiArenaGameId,
        mode,
      });
    },
    onMutate: ({ opponentId }) => {
      setJoiningLobbyId(opponentId);
    },
    onSuccess: async () => {
      const joiner = agents.find((agent) => agent.id === challengeAgentId) ?? null;
      await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "openLobbies"], exact: false });
      onOpenChange(false);
      if (joiner) onJoined?.(joiner);
    },
    onSettled: () => {
      setJoiningLobbyId(null);
    },
  });

  const canJoin = agents.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent
        size="xl"
        className="border-emerald-200/18 bg-[linear-gradient(180deg,rgba(6,12,24,0.98),rgba(3,7,14,0.96))] shadow-[0_24px_90px_rgba(0,0,0,0.62),0_0_55px_rgba(16,185,129,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_85%_12%,rgba(154,53,255,0.16),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/80 to-transparent" />

        <ArenaDialogHeader className="relative border-emerald-200/12 bg-[linear-gradient(135deg,rgba(16,185,129,0.11),rgba(154,53,255,0.10),rgba(4,8,15,0.35))]">
          <ArenaDialogTitle className="font-tech text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">
            Join a <span className="bg-gradient-to-r from-emerald-200 via-white to-purple-300 bg-clip-text text-transparent">battle</span>
          </ArenaDialogTitle>
          <ArenaDialogDescription className="max-w-2xl text-sm leading-relaxed text-white/56">
            Open lobbies are waiting for a rival. Pick one of your agents and jump straight into an existing match.
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        <ArenaDialogBody className="relative space-y-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
              <label className="min-w-0 space-y-1.5 sm:min-w-[180px]">
                <span className="arena-label text-emerald-100/62">Join with</span>
                <select
                  value={challengeAgentId ?? ""}
                  onChange={(event) => setChallengeAgentId(event.target.value || null)}
                  disabled={!canJoin}
                  className="arena-select w-full min-w-0 border-emerald-200/12 bg-[#08111f]/90 text-white focus:border-emerald-200/45 focus:ring-emerald-200/20 disabled:opacity-50"
                >
                  {canJoin ? (
                    agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} — ELO {agent.eloRating}
                      </option>
                    ))
                  ) : (
                    <option value="">No agents available</option>
                  )}
                </select>
              </label>
              <label className="min-w-0 space-y-1.5 sm:min-w-[140px]">
                <span className="arena-label text-purple-100/62">Mode</span>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as AiArenaMatchMode)}
                  className="arena-select w-full min-w-0 border-purple-200/12 bg-[#0c1020]/90 text-white focus:border-purple-200/45 focus:ring-purple-200/20"
                >
                  {AI_ARENA_MATCH_MODES.map((matchMode) => (
                    <option key={matchMode.value} value={matchMode.value}>
                      {matchMode.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/8 px-3 py-1 font-tech text-[10px] uppercase tracking-[0.16em] text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              {battleBoardQ.openLobbyItems.length} open · {items.length} shown
            </span>
          </div>

          {battleBoardQ.isLoading && items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/8 bg-[#03070d]/60 px-4 py-8 text-center text-sm text-white/50">
              Loading open lobbies…
            </div>
          ) : items.length > 0 ? (
            <div className="grid max-h-[52vh] gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
              {items.map((item) => {
                const isOwnLobby = item.kind === "open-lobby" && myAgentIds.has(item.agent.id);

                return (
                  <ArenaBattleBoardCard
                    key={item.id}
                    item={item}
                    actionLabel={
                      item.kind === "open-lobby"
                        ? isOwnLobby
                          ? "Your lobby"
                          : canJoin
                            ? "Join in arena"
                            : "No agent"
                        : ""
                    }
                    onAction={
                      item.kind === "open-lobby" && !isOwnLobby && canJoin
                        ? () => directChallengeMut.mutate({
                            opponentId: item.agent.id,
                            lobbyGameId: item.status.gameId || AI_ARENA_DEFAULT_GAME_ID,
                          })
                        : undefined
                    }
                    actionDisabled={
                      item.kind === "open-lobby" && !isOwnLobby && canJoin
                        ? !challengeAgentId || directChallengeMut.isPending
                        : true
                    }
                    actionLoading={
                      item.kind === "open-lobby" &&
                      directChallengeMut.isPending &&
                      joiningLobbyId === item.agent.id
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/8 bg-[#03070d]/60 px-4 py-8 text-center text-sm text-white/50">
              <Swords className="mx-auto mb-2 h-5 w-5 text-white/30" />
              No open lobbies right now. Start matchmaking to create one.
            </div>
          )}
        </ArenaDialogBody>
      </ArenaDialogContent>
    </Dialog>
  );
}
