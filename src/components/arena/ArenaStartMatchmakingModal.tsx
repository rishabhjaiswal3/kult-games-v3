import { Loader2, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogFooter,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import {
  AI_ARENA_DEFAULT_GAME_ID,
  AI_ARENA_GAME_IDS,
  AI_ARENA_MATCH_MODES,
  type AiArenaGameId,
  type AiArenaMatchMode,
} from "@/constants/aiArenaMatchmaking";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

export type ArenaStartMatchmakingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AiArenaAgent[];
  defaultAgentId?: string | null;
  defaultGameId?: AiArenaGameId;
  onQueued?: (agentId: string, gameId: string) => void | Promise<void>;
};

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

export function ArenaStartMatchmakingModal({
  open,
  onOpenChange,
  agents,
  defaultAgentId,
  defaultGameId = AI_ARENA_DEFAULT_GAME_ID,
  onQueued,
}: ArenaStartMatchmakingModalProps) {
  const [agentId, setAgentId] = useState<string | null>(defaultAgentId ?? null);
  const [gameId, setGameId] = useState<AiArenaGameId>(AI_ARENA_DEFAULT_GAME_ID);
  const [mode, setMode] = useState<AiArenaMatchMode>("RANKED");
  const [eloRange, setEloRange] = useState("200");
  const [paymentTxHash, setPaymentTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAgentId((cur) => {
      if (cur && agents.some((a) => a.id === cur)) return cur;
      if (defaultAgentId && agents.some((a) => a.id === defaultAgentId)) return defaultAgentId;
      return agents[0]?.id ?? null;
    });
    setGameId(defaultGameId);
  }, [open, agents, defaultAgentId, defaultGameId]);

  const selectedAgent = agents.find((a) => a.id === agentId) ?? null;
  const modeHint = AI_ARENA_MATCH_MODES.find((m) => m.value === mode)?.hint;

  const handleSubmit = async () => {
    if (!agentId) {
      return;
    }
    const elo = Number.parseInt(eloRange, 10);
    setSubmitting(true);
    try {
      await aiArenaGatewayApi.joinMatchmakingQueue({
        agentId,
        gameId,
        mode,
        eloRange: Number.isFinite(elo) ? elo : 200,
        paymentTxHash: mode === "WAGER" && paymentTxHash.trim() ? paymentTxHash.trim() : undefined,
      });
      try { sessionStorage.setItem("arena_queued_game_id", gameId); } catch { /* ignore */ }
      await onQueued?.(agentId, gameId);
      onOpenChange(false);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent
        size="lg"
        className="border-cyan-200/18 bg-[linear-gradient(180deg,rgba(6,12,24,0.98),rgba(3,7,14,0.96))] shadow-[0_24px_90px_rgba(0,0,0,0.62),0_0_55px_rgba(34,211,238,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_85%_12%,rgba(154,53,255,0.18),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.08),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />

        <ArenaDialogHeader className="relative border-cyan-200/12 bg-[linear-gradient(135deg,rgba(34,211,238,0.11),rgba(154,53,255,0.10),rgba(4,8,15,0.35))]">
          <ArenaDialogTitle className="font-tech text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">
            Start <span className="bg-gradient-to-r from-cyan-200 via-white to-purple-300 bg-clip-text text-transparent">matchmaking</span>
          </ArenaDialogTitle>
          <ArenaDialogDescription className="max-w-2xl text-sm leading-relaxed text-white/56">
            Queue your fighter in the open lobby. Other players can join and your agents will face off.
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        <ArenaDialogBody className="relative space-y-4 px-4 py-5 sm:px-6">
          {agents.length === 0 ? (
            <div className="rounded-2xl border border-amber-300/18 bg-amber-400/8 p-4 text-sm text-amber-100/78">
              Create an AI Arena agent before starting matchmaking.
            </div>
          ) : (
            <>
              {selectedAgent ? (
                <div className="relative overflow-hidden rounded-2xl border border-cyan-200/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(154,53,255,0.12),rgba(5,10,20,0.86))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_rgba(34,211,238,0.08)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(34,211,238,0.14),transparent_38%)]" />
                  <div className="relative flex items-center gap-4">
                  <ArenaAgentThumbnail agent={selectedAgent} className="h-20 w-20 rounded-xl ring-1 ring-cyan-200/24 sm:h-24 sm:w-24" />
                  <div className="min-w-0">
                    <p className="truncate font-tech text-2xl font-black tracking-tight text-white">{selectedAgent.name}</p>
                    <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.18em] text-white/44">
                      {selectedAgent.archetype} • {selectedAgent.clan}
                    </p>
                    <p className="mt-2 font-tech text-2xl font-black tabular-nums text-cyan-200 drop-shadow-[0_0_14px_rgba(34,211,238,0.34)]">
                      {selectedAgent.eloRating} ELO
                    </p>
                  </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/8 bg-black/18 p-3.5">
                <label className="arena-label text-cyan-100/62">Fighting agent</label>
                <select
                  value={agentId ?? ""}
                  onChange={(e) => setAgentId(e.target.value || null)}
                  disabled={submitting}
                  className="arena-select border-cyan-200/12 bg-[#08111f]/90 text-white focus:border-cyan-200/45 focus:ring-cyan-200/20 disabled:opacity-50"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — ELO {a.eloRating}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/18 p-3.5">
                  <label className="arena-label text-purple-100/62">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as AiArenaMatchMode)}
                    disabled={submitting}
                    className="arena-select border-purple-200/12 bg-[#0c1020]/90 text-white focus:border-purple-200/45 focus:ring-purple-200/20 disabled:opacity-50"
                  >
                    {AI_ARENA_MATCH_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  {modeHint ? <p className="mt-2 text-[11px] text-white/42">{modeHint}</p> : null}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/18 p-3.5">
                  <label className="arena-label text-cyan-100/62">ELO range</label>
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={eloRange}
                    onChange={(e) => setEloRange(e.target.value)}
                    disabled={submitting}
                    className="arena-input border-cyan-200/12 bg-[#08111f]/90 text-white focus:border-cyan-200/45 focus:ring-cyan-200/20 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/18 p-3.5">
                <label className="arena-label text-amber-100/68">Arena game</label>
                <select
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value as AiArenaGameId)}
                  disabled={submitting}
                  className="arena-select border-amber-200/12 bg-[#111019]/90 text-white focus:border-amber-200/45 focus:ring-amber-200/20 disabled:opacity-50"
                >
                  {AI_ARENA_GAME_IDS.map((game) => (
                    <option key={game.value} value={game.value}>
                      {game.label}
                    </option>
                  ))}
                </select>
              </div>

              {mode === "WAGER" ? (
                <div className="rounded-2xl border border-amber-300/12 bg-amber-400/5 p-3.5">
                  <label className="arena-label text-amber-100/68">Wager payment tx (x402)</label>
                  <input
                    value={paymentTxHash}
                    onChange={(e) => setPaymentTxHash(e.target.value)}
                    disabled={submitting}
                    placeholder="Solana tx hash after 5 ARENA payment"
                    className="arena-input border-amber-200/12 bg-[#111019]/90 font-mono text-white focus:border-amber-200/45 focus:ring-amber-200/20 disabled:opacity-50"
                  />
                </div>
              ) : null}
            </>
          )}
        </ArenaDialogBody>

        <ArenaDialogFooter className="relative border-cyan-200/12 bg-[linear-gradient(180deg,rgba(3,7,14,0.72),rgba(3,7,14,0.94))]">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-white/10 bg-black/20 px-6 font-tech text-[11px] uppercase tracking-[0.14em] text-white/70 hover:bg-white/8 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting || !agentId || agents.length === 0}
            onClick={() => void handleSubmit()}
            className="rounded-xl border border-cyan-200/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(154,53,255,0.18))] px-6 font-tech text-[11px] uppercase tracking-[0.14em] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.13)] hover:border-cyan-100/60 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.3),rgba(154,53,255,0.24))] hover:text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Swords className="mr-2 h-4 w-4" />}
            List in open lobby
          </Button>
        </ArenaDialogFooter>
      </ArenaDialogContent>
    </Dialog>
  );
}
