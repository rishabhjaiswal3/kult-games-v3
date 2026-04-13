import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAddress, isAddress } from "viem";
import { Loader2, Play, RefreshCw, Swords, User, Users } from "lucide-react";
import { aiWarzoneApi } from "@/api/aiWarzoneApi";
import { useAuth } from "@/contexts/AuthContext";
import type { AiWarzoneArenaMatch, AiWarzoneArenaMatchDetail } from "@/types/aiWarzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const POLL_MS = 5000;
const MAX_POLLS = 20;

function shortAddr(a: string) {
  if (a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function sameHotWallet(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Open slot for P2 and not a terminal / live state where join is invalid. */
function canShowJoinButton(m: AiWarzoneArenaMatch, agentHotWallet: string | null): boolean {
  if (!agentHotWallet || m.player2HotWallet) return false;
  if (sameHotWallet(m.player1HotWallet, agentHotWallet)) return false;
  const u = m.status?.toUpperCase() ?? "";
  if (["COMPLETED", "CANCELLED", "CLOSED", "IN_PROGRESS"].includes(u)) return false;
  return true;
}

function isParticipant(m: AiWarzoneArenaMatch, hot: string | null) {
  if (!hot) return false;
  if (sameHotWallet(m.player1HotWallet, hot)) return true;
  if (m.player2HotWallet && sameHotWallet(m.player2HotWallet, hot)) return true;
  return false;
}

function isCreator(m: AiWarzoneArenaMatch, hot: string | null) {
  if (!hot) return false;
  return sameHotWallet(m.player1HotWallet, hot);
}

function canShowPlay(m: AiWarzoneArenaMatch, agentHotWallet: string | null) {
  if (!agentHotWallet || !m.player2HotWallet) return false;
  return isParticipant(m, agentHotWallet);
}

function canShowCheckButton(m: AiWarzoneArenaMatch, agentHotWallet: string | null) {
  if (!agentHotWallet) return false;
  if (!isCreator(m, agentHotWallet)) return false;
  const s = m.status?.toUpperCase() ?? "";
  return !["COMPLETED", "CANCELLED", "CLOSED"].includes(s);
}

async function waitUntilArenaInProgress(matchId: string): Promise<AiWarzoneArenaMatchDetail | null> {
  for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
    try {
      const d = await aiWarzoneApi.getArenaMatch(matchId);
      if (d.status === "IN_PROGRESS") return d;
    } catch {
      /* keep trying */
    }
    if (attempt < MAX_POLLS) await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return null;
}

type WaitPhase = "form" | "creating" | "waiting" | "matched" | "failed";

const ArenaMatchmakingPanel = () => {
  const { walletAddress } = useAuth();
  const queryClient = useQueryClient();
  const [evmWallet, setEvmWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress || !isAddress(walletAddress)) {
      setEvmWallet(null);
      return;
    }
    try {
      setEvmWallet(getAddress(walletAddress));
    } catch {
      setEvmWallet(null);
    }
  }, [walletAddress]);

  const agentQ = useQuery({
    queryKey: ["aiWarzone", "agent", evmWallet],
    queryFn: () => aiWarzoneApi.getAgentByWallet(evmWallet!),
    enabled: !!evmWallet,
    staleTime: 60_000,
  });

  const agent = agentQ.data?.found ? agentQ.data.agent : null;

  const matchesQ = useQuery({
    queryKey: ["aiWarzone", "arenaMatches"],
    queryFn: () => aiWarzoneApi.getArenaMatches(),
    staleTime: 5_000,
    refetchInterval: 7_500,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("100");
  const [phase, setPhase] = useState<WaitPhase>("form");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [matchedDetail, setMatchedDetail] = useState<AiWarzoneArenaMatchDetail | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joiningMatchId, setJoiningMatchId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  /** Placeholder until the multiplayer game is embedded here or on a dedicated route. */
  const handlePlayClick = useCallback(() => {
    /* multiplayer TBD */
  }, []);

  const handleJoin = async (m: AiWarzoneArenaMatch) => {
    if (!agent) return;
    setJoiningMatchId(m.matchId);
    setJoinError(null);
    try {
      const out = await aiWarzoneApi.joinArenaMatch({
        matchId: m.matchId,
        player2HotWallet: agent.hotWalletAddress,
        player2Elo: agent.elo,
      });
      if (out.status !== "IN_PROGRESS") {
        await waitUntilArenaInProgress(out.matchId);
      }
      void queryClient.invalidateQueries({ queryKey: ["aiWarzone", "arenaMatches"] });
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : "Could not join match.");
    } finally {
      setJoiningMatchId(null);
    }
  };

  const handleCheckStatus = async (m: AiWarzoneArenaMatch) => {
    setModalOpen(true);
    setCreateError(null);
    setPollAttempt(0);
    setMatchId(m.matchId);
    setMatchedDetail(null);
    setPhase("waiting");
    try {
      const detail = await aiWarzoneApi.getArenaMatch(m.matchId);
      if (detail.status === "IN_PROGRESS") {
        setMatchedDetail(detail);
        setPhase("matched");
      }
    } catch {
      // Polling effect continues in waiting state.
    }
  };

  const resetModal = useCallback(() => {
    setPhase("form");
    setMatchId(null);
    setPollAttempt(0);
    setMatchedDetail(null);
    setCreateError(null);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      resetModal();
    }
  };

  const handleCreate = async () => {
    if (!agent) return;
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setCreateError("Enter a valid stake amount.");
      return;
    }
    setCreateError(null);
    setPhase("creating");
    try {
      const created = await aiWarzoneApi.createArenaMatch({
        player1HotWallet: agent.hotWalletAddress,
        player1Elo: agent.elo,
        amount: n,
      });
      setMatchId(created.matchId);
      setPhase("waiting");
      void queryClient.invalidateQueries({ queryKey: ["aiWarzone", "arenaMatches"] });
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Could not create match.");
      setPhase("form");
    }
  };

  useEffect(() => {
    if (phase !== "waiting" || !matchId) return;

    let cancelled = false;
    let attempt = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const pollOnce = async () => {
      if (cancelled) return;
      attempt += 1;
      setPollAttempt(attempt);
      try {
        const detail = await aiWarzoneApi.getArenaMatch(matchId);
        if (cancelled) return;
        if (detail.status === "IN_PROGRESS") {
          setMatchedDetail(detail);
          setPhase("matched");
          void queryClient.invalidateQueries({ queryKey: ["aiWarzone", "arenaMatches"] });
          return;
        }
      } catch {
        /* keep polling until max */
      }
      if (cancelled) return;
      if (attempt >= MAX_POLLS) {
        setPhase("failed");
        return;
      }
      timeoutId = setTimeout(pollOnce, POLL_MS);
    };

    void pollOnce();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [phase, matchId, queryClient]);

  const matches = matchesQ.data?.matches ?? [];
  const loadingList = matchesQ.isLoading;

  return (
    <section className="relative border-b border-white/[0.06] py-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 20% 20%, hsl(0 85% 50% / 0.06), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, hsl(195 100% 50% / 0.05), transparent)",
        }}
      />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/90">
              <span className="h-px w-8 bg-gradient-to-r from-neon-cyan/80 to-transparent" />
              Matchmaking
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Arena <span className="gradient-text">lobby</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Open matches from the API and create your own — we poll until someone joins and the match goes live.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={!agent}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-display text-sm font-semibold tracking-wide btn-eye disabled:pointer-events-none disabled:opacity-40"
          >
            <Swords className="h-4 w-4" />
            Create arena match
          </button>
        </div>

        {!evmWallet ? (
          <p className="rounded-xl border border-white/10 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
            Connect your wallet to see your agent and create matches.
          </p>
        ) : agentQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading agent…
          </div>
        ) : !agent ? (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
            No AI agent found for this wallet. Create an agent first, then you can open arena matches.
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Available matches ({matchesQ.data?.total ?? matches.length})
          </span>
          <button
            type="button"
            onClick={() => void matchesQ.refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-card/50 px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wide text-muted-foreground transition-colors hover:border-neon-cyan/35 hover:text-neon-cyan"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${matchesQ.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {joinError ? (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200/90" role="alert">
            {joinError}
          </p>
        ) : null}

        <div className="mt-3 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card/[0.45] to-card/[0.12] p-4 shadow-[0_20px_60px_hsl(220_60%_2%/0.2)] backdrop-blur-sm sm:p-5">
          {loadingList ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading matches…
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No arena matches listed yet.</p>
              <p className="text-xs text-muted-foreground/80">Create one to get started.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {matches.map((m: AiWarzoneArenaMatch) => (
                <li
                  key={m.matchId}
                  className="rounded-xl border border-white/[0.06] bg-background/50 px-4 py-3 text-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs text-neon-cyan/90">{m.warzoneMatchId}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                        {m.status}
                      </span>
                      <span className="text-xs font-mono text-foreground/90">{m.prizeAmount} prize</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-card/40 px-3 py-2">
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-neon-cyan/80">Creator (left)</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{shortAddr(m.player1HotWallet)}</p>
                      <p className="text-[11px] text-muted-foreground">Elo {m.player1Elo}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-card/40 px-3 py-2">
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-violet-300/90">Joiner (right)</p>
                      {m.player2HotWallet ? (
                        <>
                          <p className="mt-1 font-mono text-xs text-foreground">{shortAddr(m.player2HotWallet)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Elo {m.player2Elo ?? "—"}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">Waiting for another user to join</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    {agent && canShowPlay(m, agent.hotWalletAddress) ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-xs font-semibold btn-eye"
                        onClick={handlePlayClick}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Play
                      </button>
                    ) : null}
                    {agent && canShowCheckButton(m, agent.hotWalletAddress) && !canShowPlay(m, agent.hotWalletAddress) ? (
                      <button
                        type="button"
                        onClick={() => void handleCheckStatus(m)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/35 bg-violet-400/10 px-3 py-1.5 font-display text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-400/20"
                      >
                        Check
                      </button>
                    ) : null}
                    {agent && canShowJoinButton(m, agent.hotWalletAddress) ? (
                      <button
                        type="button"
                        disabled={joiningMatchId === m.matchId}
                        onClick={() => void handleJoin(m)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neon-cyan/35 bg-neon-cyan/10 px-3 py-1.5 font-display text-xs font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20 disabled:opacity-50"
                      >
                        {joiningMatchId === m.matchId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Join
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[min(100vw-2rem,540px)] border-white/10 bg-[hsl(220_45%_10%_/_0.98)] p-0 sm:max-w-xl">
          <div className="border-b border-white/[0.06] p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="font-display text-xl tracking-tight">Create arena match</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                You appear on the left. After you create, we look for an opponent on the right until the match is{" "}
                <span className="font-mono text-neon-cyan/90">IN_PROGRESS</span> (poll every 5s, up to 20 tries).
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <div className="border-b border-white/[0.06] p-6 sm:border-b-0 sm:border-r">
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan/80">You</p>
              {agent ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neon-cyan/25 bg-neon-cyan/10">
                    <User className="h-6 w-6 text-neon-cyan" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-foreground">{shortAddr(agent.hotWalletAddress)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Elo {agent.elo}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">{agent.name}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Connect wallet with an agent.</p>
              )}
            </div>

            <div className="p-6">
              {phase === "form" || phase === "creating" ? (
                <>
                  <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Stake
                  </p>
                  <label className="sr-only" htmlFor="arena-amount">
                    Amount
                  </label>
                  <Input
                    id="arena-amount"
                    type="number"
                    min={1}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mb-3 border-white/10 bg-background/80 font-mono"
                  />
                  {createError ? (
                    <p className="mb-3 text-xs text-red-400/90" role="alert">
                      {createError}
                    </p>
                  ) : null}
                  <p className="mb-4 text-xs text-muted-foreground">
                    After you create, this side shows matchmaking: we call GET /arena/match every 5s (up to 20 times)
                    until status is IN_PROGRESS.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleCreate()}
                    disabled={!agent || phase === "creating"}
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-display text-sm font-semibold btn-eye disabled:opacity-40"
                  >
                    {phase === "creating" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create & find opponent"
                    )}
                  </button>
                </>
              ) : phase === "waiting" ? (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-neon-cyan" />
                  <p className="font-display text-sm font-semibold text-foreground">
                    Looking for another user to join
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Check {pollAttempt} / {MAX_POLLS} · every 5s
                  </p>
                </div>
              ) : phase === "matched" && matchedDetail ? (
                <div className="flex min-h-[200px] flex-col justify-center">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400/90">Match live</p>
                  <p className="mt-2 font-mono text-lg text-neon-cyan">{matchedDetail.warzoneMatchId}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Status {matchedDetail.status}</p>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">
                    Escrow {shortAddr(matchedDetail.escrowId)}
                  </p>
                  <button
                    type="button"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-display text-sm font-semibold btn-eye"
                    onClick={handlePlayClick}
                  >
                    <Play className="h-4 w-4" />
                    Play
                  </button>
                </div>
              ) : phase === "failed" ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                  <p className="font-display text-sm font-semibold text-foreground">No opponent found</p>
                  <p className="mt-2 max-w-xs text-xs text-muted-foreground">
                    We checked {MAX_POLLS} times and the match never reached IN_PROGRESS.
                  </p>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-display text-sm font-semibold btn-eye-outline"
                  >
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ArenaMatchmakingPanel;
