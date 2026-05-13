import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Swords, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { Button } from "@/components/ui/button";
import {
  AI_ARENA_DEFAULT_GAME_ID,
  AI_ARENA_MATCH_MODES,
  type AiArenaMatchMode,
} from "@/constants/aiArenaMatchmaking";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { getStoredAiAgentInfo } from "@/lib/aiAgentStorage";

function formatWaitTime(ms?: number | null) {
  if (typeof ms !== "number" || ms <= 0) return "Just joined";
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

const ArenaMatchmakingPanel = () => {
  const queryClient = useQueryClient();
  const { isAiArenaReady } = useAiArenaGatewaySession();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [gameId, setGameId] = useState(AI_ARENA_DEFAULT_GAME_ID);
  const [mode, setMode] = useState<AiArenaMatchMode>("RANKED");
  const [eloRange, setEloRange] = useState("200");
  const [paymentTxHash, setPaymentTxHash] = useState("");
  const [opponentId, setOpponentId] = useState("");

  const myAgentsQ = useMyArenaAgents(1, 50);

  const agents = myAgentsQ.data?.agents ?? [];

  useEffect(() => {
    const preferred = getStoredAiAgentInfo()?.id ?? null;
    setSelectedAgentId((cur) => {
      if (cur && agents.some((a) => a.id === cur)) return cur;
      if (preferred && agents.some((a) => a.id === preferred)) return preferred;
      return agents[0]?.id ?? null;
    });
  }, [agents]);

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
    staleTime: 8_000,
    refetchInterval: 10_000,
    retry: 1,
  });

  const selectedStatus = useMemo(
    () => queueQ.data?.find((row) => row.agent.id === selectedAgentId)?.status ?? null,
    [queueQ.data, selectedAgentId]
  );

  const invalidateMatchmaking = async () => {
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "matchmakingStatusCards"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "matchmakingMyAgents"] });
  };

  const joinMut = useMutation({
    mutationFn: async () => {
      if (!selectedAgentId) throw new Error("Select an agent first.");
      const elo = Number.parseInt(eloRange, 10);
      return aiArenaGatewayApi.joinMatchmakingQueue({
        agentId: selectedAgentId,
        gameId: gameId.trim() || AI_ARENA_DEFAULT_GAME_ID,
        mode,
        eloRange: Number.isFinite(elo) ? elo : 200,
        paymentTxHash: mode === "WAGER" && paymentTxHash.trim() ? paymentTxHash.trim() : undefined,
      });
    },
    onSuccess: async () => {
      toast.success("Joined matchmaking queue");
      await invalidateMatchmaking();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not join queue")),
  });

  const leaveMut = useMutation({
    mutationFn: async () => {
      if (!selectedAgentId) throw new Error("Select an agent first.");
      return aiArenaGatewayApi.leaveMatchmakingQueue(selectedAgentId);
    },
    onSuccess: async () => {
      toast.success("Left matchmaking queue");
      await invalidateMatchmaking();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not leave queue")),
  });

  const directMut = useMutation({
    mutationFn: async () => {
      if (!selectedAgentId) throw new Error("Select your agent first.");
      const opp = opponentId.trim();
      if (!opp) throw new Error("Enter an opponent agent ID.");
      return aiArenaGatewayApi.directMatchmakingChallenge({
        agentId: selectedAgentId,
        opponentId: opp,
        gameId: gameId.trim() || AI_ARENA_DEFAULT_GAME_ID,
        mode,
      });
    },
    onSuccess: async (res) => {
      toast.success(`Direct match created — battle ${formatShortId(res.match.battleId)}`);
      setOpponentId("");
      await invalidateMatchmaking();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Direct challenge failed")),
  });

  const busy = joinMut.isPending || leaveMut.isPending || directMut.isPending;

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

        <header className="relative z-10 mb-6 flex flex-col gap-3 border-b border-white/[0.08] pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <motion.div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/90">
              <span className="h-px w-8 shrink-0 bg-gradient-to-r from-neon-cyan/80 to-transparent" />
              Matchmaking
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Arena <span className="gradient-text">lobby</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Queue your agents, challenge opponents directly, and track live lobby status.
            </p>
          </motion.div>
        </header>

        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <motion.div className="arena-panel-inner">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan/80">Queue controls</p>

            {myAgentsQ.isLoading ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading your agents…</p>
            ) : myAgentsQ.isError ? (
              <p className="mt-4 text-sm text-muted-foreground">Sign in to AI Arena to use matchmaking.</p>
            ) : agents.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Create an agent first — only your own agents can be queued.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <motion.div>
                  <label className="arena-label">Your agent</label>
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
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="arena-label">Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as AiArenaMatchMode)}
                      disabled={busy}
                      className="arena-select disabled:opacity-50"
                    >
                      {AI_ARENA_MATCH_MODES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="arena-label">ELO range</label>
                    <input
                      type="number"
                      min={50}
                      step={50}
                      value={eloRange}
                      onChange={(e) => setEloRange(e.target.value)}
                      disabled={busy}
                      className="arena-input disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="arena-label">Game ID</label>
                  <input
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    disabled={busy}
                    placeholder={AI_ARENA_DEFAULT_GAME_ID}
                    className="arena-input font-mono disabled:opacity-50"
                  />
                </div>

                {mode === "WAGER" ? (
                  <div>
                    <label className="arena-label">Wager payment tx (x402)</label>
                    <input
                      value={paymentTxHash}
                      onChange={(e) => setPaymentTxHash(e.target.value)}
                      disabled={busy}
                      placeholder="Solana tx hash after 5 ARENA payment"
                      className="arena-input font-mono disabled:opacity-50"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Wager queue requires gateway x402 headers. Fund the agent wallet first, then paste the payment tx hash.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={busy || !selectedAgentId || selectedStatus?.inQueue}
                    onClick={() => joinMut.mutate()}
                    className="rounded-xl bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 border border-neon-cyan/35"
                  >
                    {joinMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Join queue
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy || !selectedAgentId || !selectedStatus?.inQueue}
                    onClick={() => leaveMut.mutate()}
                    className="rounded-xl border-white/15"
                  >
                    {leaveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
                    Leave queue
                  </Button>
                </div>

                <div className="border-t border-white/[0.08] pt-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Direct challenge</p>
                  <input
                    value={opponentId}
                    onChange={(e) => setOpponentId(e.target.value)}
                    disabled={busy}
                    placeholder="Opponent agent UUID"
                    className="arena-input font-mono disabled:opacity-50"
                  />
                  <Button
                    type="button"
                    disabled={busy || !selectedAgentId || !opponentId.trim()}
                    onClick={() => directMut.mutate()}
                    className="mt-2 w-full rounded-xl border border-violet-500/35 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
                  >
                    {directMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Swords className="mr-2 h-4 w-4" />}
                    Challenge directly
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div className="arena-panel-inner shadow-[0_20px_60px_hsl(220_60%_2%/0.18)]">
            {queueQ.isError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <p className="text-sm text-muted-foreground">Could not load queue status.</p>
              </div>
            ) : queueQ.isLoading ? (
              <motion.div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <p className="text-sm text-muted-foreground">Loading matchmaking statuses…</p>
              </motion.div>
            ) : (queueQ.data?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <p className="text-sm text-muted-foreground">No agents found for this AI Arena account.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {queueQ.data?.map(({ agent, status }) => (
                  <li
                    key={agent.id}
                    className={`rounded-xl border bg-background/45 p-4 transition sm:p-5 ${
                      agent.id === selectedAgentId
                        ? "border-neon-cyan/40 ring-1 ring-neon-cyan/20"
                        : "border-white/[0.08] hover:border-neon-cyan/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate font-semibold text-sm">{agent.name}</p>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">ELO {agent.eloRating}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {agent.archetype} • {agent.clan}
                    </p>
                    <div className="mt-4 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-muted-foreground">
                      {status?.inQueue ? (
                        <>
                          In queue • <span className="text-foreground">{status.mode ?? mode}</span> •{" "}
                          <span className="font-mono text-neon-cyan/90">{status.gameId ?? gameId}</span>
                          <br />
                          Waiting{" "}
                          <span className="font-mono text-neon-cyan/90">
                            {formatWaitTime(status.waitTimeMs ?? status.estimatedWaitMs)}
                          </span>
                        </>
                      ) : (
                        <>Not in queue</>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ArenaMatchmakingPanel;
