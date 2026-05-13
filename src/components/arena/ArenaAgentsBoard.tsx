import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaAgent, AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { AiArenaAgentDetailModal } from "@/components/arena/AiArenaAgentDetailModal";
import { CreateAiArenaAgentModal } from "@/components/arena/CreateAiArenaAgentModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const GLOBAL_FETCH_LIMIT = 400;
const ALL_PAGE_SIZE = 12;
const MY_PAGE_SIZE = 8;

function PaginationBar({
  page,
  totalPages,
  onPage,
  disabled,
  disableNext,
}: {
  page: number;
  totalPages?: number;
  onPage: (p: number) => void;
  disabled?: boolean;
  /** When `totalPages` is unknown, use this to disable the next control. */
  disableNext?: boolean;
}) {
  const nextOff =
    disabled ||
    (typeof totalPages === "number" ? page >= totalPages : Boolean(disableNext));
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
      <span className="text-[10px] font-mono text-muted-foreground">
        Page {page}
        {typeof totalPages === "number" ? ` / ${totalPages}` : ""}
      </span>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={nextOff}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ArenaAgentsBoard() {
  const queryClient = useQueryClient();
  const { player, walletAddress } = useAuth();
  const [allPage, setAllPage] = useState(1);
  const [myPage, setMyPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);
  const [detailSeed, setDetailSeed] = useState<AiArenaLeaderboardEntry | AiArenaAgent | null>(null);

  const leaderboardQ = useQuery({
    queryKey: ["aiArenaGateway", "arenaBoardLeaderboard", GLOBAL_FETCH_LIMIT],
    queryFn: () => aiArenaGatewayApi.getGlobalLeaderboard(GLOBAL_FETCH_LIMIT),
    staleTime: 45_000,
  });

  const entries = leaderboardQ.data?.entries ?? [];
  const totalPagesAll = Math.max(1, Math.ceil(entries.length / ALL_PAGE_SIZE));
  const allPageClamped = Math.min(allPage, totalPagesAll);

  useEffect(() => {
    setAllPage((p) => Math.min(p, totalPagesAll));
  }, [totalPagesAll]);
  const allSlice = useMemo(() => {
    const start = (allPageClamped - 1) * ALL_PAGE_SIZE;
    return entries.slice(start, start + ALL_PAGE_SIZE);
  }, [entries, allPageClamped]);

  const myQ = useQuery({
    queryKey: ["aiArenaGateway", "arenaBoardMyAgents", myPage, MY_PAGE_SIZE],
    queryFn: () => aiArenaGatewayApi.getMyAgents(myPage, MY_PAGE_SIZE),
    staleTime: 20_000,
    retry: 1,
  });

  const myAgents = myQ.data?.agents ?? [];
  const myTotal = myQ.data?.total;
  const myTotalPages =
    typeof myTotal === "number" && myTotal > 0 ? Math.max(1, Math.ceil(myTotal / MY_PAGE_SIZE)) : undefined;
  const myDisableNext =
    typeof myTotalPages === "number" ? false : myAgents.length < MY_PAGE_SIZE;

  const openDetailFromLeaderboard = (e: AiArenaLeaderboardEntry) => {
    setDetailAgentId(e.agentId);
    setDetailSeed(e);
    setDetailOpen(true);
  };

  const openDetailFromMine = (a: AiArenaAgent) => {
    setDetailAgentId(a.id);
    setDetailSeed(a);
    setDetailOpen(true);
  };

  const invalidateAfterCreate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "arenaBoardMyAgents"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "myAgents"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "matchmakingStatusCards"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "arenaBoardLeaderboard"] });
  };

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="glass-panel flex flex-col rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold tracking-wider">All agents</h3>
            <p className="text-[11px] text-muted-foreground">
              Browse the live leaderboard and open any agent to see how they stack up.
            </p>
          </div>
          {leaderboardQ.isFetching ? (
            <span className="text-[10px] text-muted-foreground">Refreshing…</span>
          ) : null}
        </div>

        {leaderboardQ.isError ? (
          <p className="text-sm text-muted-foreground">Could not load global leaderboard.</p>
        ) : (
          <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {allSlice.map((e) => (
              <li key={e.agentId}>
                <button
                  type="button"
                  onClick={() => openDetailFromLeaderboard(e)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-background/35 px-3 py-2.5 text-left text-sm transition hover:border-neon-cyan/30 hover:bg-background/50"
                >
                  <span className="w-8 shrink-0 text-center font-mono text-xs text-neon-cyan">#{e.rank}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{e.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {e.clan} · ELO {e.eloRating} · {e.wins} wins
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {!allSlice.length && !leaderboardQ.isLoading ? (
              <li className="text-sm text-muted-foreground">No leaderboard entries.</li>
            ) : null}
            {leaderboardQ.isLoading ? <li className="text-sm text-muted-foreground">Loading…</li> : null}
          </ul>
        )}

        <PaginationBar
          page={allPageClamped}
          totalPages={totalPagesAll}
          disabled={leaderboardQ.isLoading}
          onPage={(p) => {
            setAllPage(Math.max(1, Math.min(p, totalPagesAll)));
          }}
        />
      </div>

      <div className="glass-panel flex flex-col rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold tracking-wider">My AI agents</h3>
            <p className="text-[11px] text-muted-foreground">
              Your personal roster, synced to your arena account. Tap a row for wallet and profile details.
            </p>
          </div>
          <Button type="button" size="sm" className="h-8 gap-1 text-xs" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create
          </Button>
        </div>

        {myQ.isError ? (
          <p className="text-sm text-muted-foreground">
            Sign in and finish your AI Arena setup to load your agents.
          </p>
        ) : (
          <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {myAgents.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => openDetailFromMine(a)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-background/35 px-3 py-2.5 text-left text-sm transition hover:border-neon-purple/35 hover:bg-background/50"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-neon-cyan/40 to-neon-purple/40" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {a.archetype} · {a.clan} · ELO {a.eloRating}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {!myAgents.length && !myQ.isLoading ? (
              <li className="text-sm text-muted-foreground">No agents yet. Create one to get started.</li>
            ) : null}
            {myQ.isLoading ? <li className="text-sm text-muted-foreground">Loading…</li> : null}
          </ul>
        )}

        <PaginationBar
          page={myPage}
          totalPages={myTotalPages}
          disableNext={myDisableNext}
          disabled={myQ.isLoading || myQ.isError}
          onPage={(p) => setMyPage(Math.max(1, p))}
        />
      </div>

      <CreateAiArenaAgentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultName={player?.name?.trim() || (walletAddress ? `Agent ${walletAddress.slice(0, 8)}` : "")}
        onCreated={() => void invalidateAfterCreate()}
      />

      <AiArenaAgentDetailModal
        open={detailOpen}
        onOpenChange={(o) => {
          setDetailOpen(o);
          if (!o) {
            setDetailAgentId(null);
            setDetailSeed(null);
          }
        }}
        agentId={detailAgentId}
        seed={detailSeed}
      />
    </section>
  );
}
