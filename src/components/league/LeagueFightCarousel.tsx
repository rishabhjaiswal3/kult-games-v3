import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LeaguePanel } from "./LeaguePanel";
import { leagueApi, type OpenBattle } from "@/api/leagueApi";
import { useAuth } from "@/contexts/AuthContext";
import { useArenaStaking } from "@/hooks/useArenaStaking";
import { LeagueFightScene } from "./leagueFightUi";

const STAKING_STATUS_LABEL: Record<string, string> = {
  "switching-network": "Switching to 0G…",
  "checking-allowance": "Checking approval…",
  approving: "Approving $ARENA (check your wallet)…",
};

/** Real "challenge an agent" flow (docs/league) -- the backend battle system
 * (POST /v1/league/battles, .../accept) existed with zero frontend UI to
 * actually create one; only this read-only carousel of already-existing
 * battles was ever wired up. */
function ChallengeForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { data: lineup } = useQuery({
    queryKey: ["league", "me", "agents"],
    queryFn: () => leagueApi.getMyLineup(),
    staleTime: 30_000,
  });
  const { data: leaderboard } = useQuery({
    queryKey: ["league", "leaderboard", "global", 50],
    queryFn: () => leagueApi.getGlobalLeaderboard(50),
    staleTime: 60_000,
  });
  const { data: matches } = useQuery({
    queryKey: ["league", "matches", "scheduled", 20],
    queryFn: () => leagueApi.listMatches({ status: "SCHEDULED", limit: 20 }),
    staleTime: 30_000,
  });

  const myAgentIds = new Set((lineup ?? []).map((a) => a.agentId));
  const opponents = (leaderboard ?? []).filter((row) => !myAgentIds.has(row.agentId));

  const [challengerAgentId, setChallengerAgentId] = useState("");
  const [opponentAgentId, setOpponentAgentId] = useState("");
  const [matchId, setMatchId] = useState("");
  const [stakeArena, setStakeArena] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status: stakingStatus, ensureStakeApproved, getEscrowAddress } = useArenaStaking();

  useEffect(() => {
    if (!challengerAgentId && lineup && lineup.length > 0) {
      setChallengerAgentId(lineup[0].agentId);
    }
  }, [lineup, challengerAgentId]);

  const canSubmit = !!challengerAgentId && !!opponentAgentId && !!matchId && stakeArena > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // Your stake gets pulled from your own wallet when the opponent accepts --
      // approve the escrow contract now so that doesn't fail later.
      const escrowAddress = await getEscrowAddress();
      if (!escrowAddress) throw new Error("$ARENA staking isn't set up yet -- try again shortly.");
      await ensureStakeApproved(escrowAddress, stakeArena);

      await leagueApi.createBattle({ matchId, challengerAgentId, opponentAgentId, stakeArena });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that challenge — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-3 rounded-xl border border-[#a855f7]/30 bg-[#a855f7]/[0.06] p-3">
      {!lineup || lineup.length === 0 ? (
        <p className="text-[11px] text-white/50">You need an enrolled agent to issue a challenge.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block font-tech text-[8px] uppercase tracking-wider text-white/40">Your agent</label>
            <select
              value={challengerAgentId}
              onChange={(e) => setChallengerAgentId(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border border-white/15 bg-black/40 px-2 font-tech text-[11px] text-white outline-none focus:border-[#a855f7]/50"
            >
              {lineup.map((a) => <option key={a.agentId} value={a.agentId}>{a.agentName}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-tech text-[8px] uppercase tracking-wider text-white/40">Opponent agent</label>
            <select
              value={opponentAgentId}
              onChange={(e) => setOpponentAgentId(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border border-white/15 bg-black/40 px-2 font-tech text-[11px] text-white outline-none focus:border-[#a855f7]/50"
            >
              <option value="">Select an agent…</option>
              {opponents.map((row) => <option key={row.agentId} value={row.agentId}>{row.agentName} ({row.reputation} rep)</option>)}
            </select>
          </div>
          <div>
            <label className="block font-tech text-[8px] uppercase tracking-wider text-white/40">Match</label>
            <select
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border border-white/15 bg-black/40 px-2 font-tech text-[11px] text-white outline-none focus:border-[#a855f7]/50"
            >
              <option value="">Select a match…</option>
              {(matches?.matches ?? []).map((m) => <option key={m.id} value={m.id}>{m.home} vs {m.away}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-tech text-[8px] uppercase tracking-wider text-white/40">Stake ($ARENA)</label>
            <input
              type="number"
              min={1}
              value={stakeArena}
              onChange={(e) => setStakeArena(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 h-8 w-full rounded-md border border-white/15 bg-black/40 px-2 font-tech text-[11px] font-bold text-white outline-none focus:border-[#a855f7]/50"
            />
          </div>
        </div>
      )}

      {error ? <p className="mt-2 text-[10px] text-rose-400">{error}</p> : null}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-white/15 px-3 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
        >
          Cancel
        </button>
        {lineup && lineup.length > 0 ? (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
            className="rounded-md border border-[#a855f7]/50 bg-[#a855f7]/25 px-3 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-[#a855f7]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (STAKING_STATUS_LABEL[stakingStatus] ?? "Sending challenge…") : "Send challenge"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A pending battle where one of the current player's own agents is the
 * opponent needs an explicit accept -- the backend's POST .../accept
 * endpoint already existed, but until now nothing in the frontend called it,
 * and it's also the point where the opponent's own wallet must approve the
 * escrow contract for their stake (their side of the pool is pulled at
 * accept time, not challenge-creation time).
 */
function AcceptBattleButton({ battle, onAccepted }: { battle: OpenBattle; onAccepted: () => void }) {
  const { status: stakingStatus, ensureStakeApproved, getEscrowAddress } = useArenaStaking();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const escrowAddress = await getEscrowAddress();
      if (!escrowAddress) throw new Error("$ARENA staking isn't set up yet -- try again shortly.");
      await ensureStakeApproved(escrowAddress, battle.stakeArena);

      await leagueApi.acceptBattle(battle.id);
      onAccepted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't accept that challenge — try again.");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={accepting}
        onClick={() => void handleAccept()}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#00f080]/50 bg-[#00f080]/15 px-3 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#00f080] transition hover:bg-[#00f080]/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {accepting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        {accepting ? (STAKING_STATUS_LABEL[stakingStatus] ?? "Accepting…") : "Accept challenge"}
      </button>
      {error ? <p className="mt-1 text-[9px] text-rose-400">{error}</p> : null}
    </div>
  );
}

export function LeagueFightCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const queryClient = useQueryClient();
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  const { data: battles, isLoading } = useQuery({
    queryKey: ["league", "battles", "open", 8],
    queryFn: () => leagueApi.getOpenBattles(8),
    staleTime: 20_000,
  });

  const { data: lineup } = useQuery({
    queryKey: ["league", "me", "agents"],
    queryFn: () => leagueApi.getMyLineup(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const scroll = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  function handleChallengeClick() {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!lineup || lineup.length === 0) {
      navigate("/my-agents");
      return;
    }
    setShowChallengeForm((v) => !v);
  }

  function handleCreated() {
    setShowChallengeForm(false);
    void queryClient.invalidateQueries({ queryKey: ["league", "battles", "open"] });
  }

  function handleAccepted() {
    void queryClient.invalidateQueries({ queryKey: ["league", "battles", "open"] });
  }

  const myAgentIds = new Set((lineup ?? []).map((a) => a.agentId));

  return (
    <LeaguePanel
      id="league-fight-arena"
      fill={false}
      className="scroll-mt-24 border-[#a855f7]/25"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-tech text-sm font-bold uppercase tracking-[0.18em] text-white sm:text-base">
            Agent Fight Arena
          </h3>
          <p className="mt-1 text-xs text-white/58">
            FIFA matchday duels · agents stake $ARENA head-to-head
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleChallengeClick}
            className="flex items-center gap-1.5 rounded-lg border border-[#a855f7]/40 bg-[#a855f7]/15 px-3 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#d8b4fe] transition hover:bg-[#a855f7]/25"
          >
            <Swords className="h-3.5 w-3.5" /> Challenge
          </button>
          <button
            type="button"
            aria-label="Previous duel"
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70 transition hover:border-[#a855f7]/40 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next duel"
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70 transition hover:border-[#a855f7]/40 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showChallengeForm ? <ChallengeForm onClose={() => setShowChallengeForm(false)} onCreated={handleCreated} /> : null}

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-40 w-[280px] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : !battles || battles.length === 0 ? (
        <p className="py-3 text-[11px] text-white/40">No open agent battles right now — issue a challenge to start one.</p>
      ) : (
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scrollbar-none"
        >
          {battles.map((battle) => (
            <div
              key={battle.id}
              className="w-[min(100%,300px)] shrink-0 snap-center sm:w-[280px] lg:w-[calc(25%-9px)] lg:min-w-[240px]"
            >
              <div className="mb-2 flex items-center justify-between font-tech text-[10px] uppercase tracking-wider text-white/55">
                <span>{battle.title}</span>
                <span className="text-[#00f080]">{(battle.stakeArena * 2).toLocaleString()} $ARENA pool</span>
              </div>
              <LeagueFightScene
                leftAgent={battle.challengerAgentName}
                rightAgent={battle.opponentAgentName}
                compact
              />
              {battle.status === "PENDING" && myAgentIds.has(battle.opponentAgentId) ? (
                <AcceptBattleButton battle={battle} onAccepted={handleAccepted} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </LeaguePanel>
  );
}
