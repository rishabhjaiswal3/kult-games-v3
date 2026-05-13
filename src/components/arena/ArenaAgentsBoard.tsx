import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaAgent, AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { AiArenaAgentDetailModal } from "@/components/arena/AiArenaAgentDetailModal";
import { Button } from "@/components/ui/button";
import { useArenaPage } from "@/contexts/ArenaPageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";
import { getAiArenaAccessToken } from "@/lib/aiArenaAuth";

const ALL_PAGE_CHUNK = 12;
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
  disableNext?: boolean;
}) {
  const nextOff =
    disabled ||
    (typeof totalPages === "number" ? page >= totalPages : Boolean(disableNext));
  const prevOff = disabled || page <= 1;

  if (prevOff && nextOff) return null;

  return (
    <MotionPaginationBar page={page} onPage={onPage} prevOff={prevOff} nextOff={nextOff} />
  );
}

function MotionPaginationBar({
  page,
  onPage,
  prevOff,
  nextOff,
}: {
  page: number;
  onPage: (p: number) => void;
  prevOff: boolean;
  nextOff: boolean;
}) {
  return (
    <div className="mt-3 flex justify-end border-t border-white/10 pt-3">
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={prevOff}
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
  const { openCreateAgent } = useArenaPage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [aiArenaReady, setAiArenaReady] = useState(() => !!getAiArenaAccessToken());
  const [visibleCount, setVisibleCount] = useState(ALL_PAGE_CHUNK);
  const [myPage, setMyPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);
  const [detailSeed, setDetailSeed] = useState<AiArenaLeaderboardEntry | AiArenaAgent | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAiArenaReady(false);
      return;
    }
    if (getAiArenaAccessToken()) {
      setAiArenaReady(true);
      return;
    }
    const deadline = Date.now() + 12_000;
    const id = window.setInterval(() => {
      if (getAiArenaAccessToken()) {
        setAiArenaReady(true);
        window.clearInterval(id);
      } else if (Date.now() > deadline) {
        window.clearInterval(id);
      }
    }, 400);
    return () => window.clearInterval(id);
  }, [isAuthenticated, authLoading]);

  const leaderboardQ = useAiArenaGlobalLeaderboard();
  const entries = leaderboardQ.data?.entries ?? [];
  const visibleEntries = entries.slice(0, visibleCount);
  const hasMoreLocal = visibleCount < entries.length;

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + ALL_PAGE_CHUNK, entries.length));
  }, [entries.length]);

  useEffect(() => {
    const root = listRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasMoreLocal) return;

    const observer = new IntersectionObserver(
      (observed) => {
        if (observed[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: "120px", threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreLocal, loadMore, visibleEntries.length]);

  const myQ = useQuery({
    queryKey: ["aiArenaGateway", "arenaBoardMyAgents", myPage, MY_PAGE_SIZE],
    queryFn: () => aiArenaGatewayApi.getMyAgents(myPage, MY_PAGE_SIZE),
    enabled: isAuthenticated && aiArenaReady,
    staleTime: 20_000,
    retry: 1,
    refetchOnWindowFocus: false,
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

  return (
    <section id="arena-agents-board" className="grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="glass-panel flex flex-col rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold tracking-wider">All agents</h3>
            <p className="text-[11px] text-muted-foreground">
              Browse the live leaderboard and open any agent to see how they stack up.
            </p>
          </div>
          {leaderboardQ.isFetching && !leaderboardQ.isLoading ? (
            <span className="text-[10px] text-muted-foreground">Refreshing…</span>
          ) : null}
        </div>

        {leaderboardQ.isError ? (
          <p className="text-sm text-muted-foreground">Could not load global leaderboard.</p>
        ) : (
          <ul
            ref={listRef}
            className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]"
          >
            {visibleEntries.map((e) => (
              <li key={e.agentId}>
                <button
                  type="button"
                  onClick={() => openDetailFromLeaderboard(e)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-background/35 px-3 py-2.5 text-left text-sm transition hover:border-neon-cyan/30 hover:bg-background/50"
                >
                  <span className="w-8 shrink-0 text-center font-mono text-xs text-neon-cyan">#{e.rank}</span>
                  {motionLeaderboardRow({ entry: e })}
                </button>
              </li>
            ))}
            {leaderboardQ.isLoading ? (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading leaderboard…
              </li>
            ) : null}
            {!leaderboardQ.isLoading && !visibleEntries.length ? (
              <li className="text-sm text-muted-foreground">No leaderboard entries.</li>
            ) : null}
            {hasMoreLocal ? (
              <li ref={sentinelRef} className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading more agents" />
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <div className="glass-panel flex flex-col rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold tracking-wider">My AI agents</h3>
            <p className="text-[11px] text-muted-foreground">
              Your personal roster, synced to your arena account. Tap a row for wallet and profile details.
            </p>
          </div>
          <Button type="button" size="sm" className="h-8 gap-1 text-xs" onClick={openCreateAgent}>
            <Plus className="h-3.5 w-3.5" />
            Create
          </Button>
        </div>
        {myQ.isError ? (
          <p className="text-sm text-muted-foreground">
            Sign in and finish your AI Arena setup to load your agents.
          </p>
        ) : !isAuthenticated ? (
          <p className="text-sm text-muted-foreground">Log in with your wallet to see your agents.</p>
        ) : !aiArenaReady ? (
          <p className="text-sm text-muted-foreground">Connecting to AI Arena…</p>
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
                    {motionMyAgentMeta({ agent: a })}
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

function motionLeaderboardRow({ entry: e }: { entry: AiArenaLeaderboardEntry }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="truncate font-semibold">{e.name}</div>
      <div className="text-[10px] text-muted-foreground">
        {e.clan} · ELO {e.eloRating} · {e.wins} wins
      </div>
    </div>
  );
}
function motionMyAgentMeta({ agent: a }: { agent: AiArenaAgent }) {
  return (
    <div className="text-[10px] text-muted-foreground">
      {a.archetype} · {a.clan} · ELO {a.eloRating}
    </div>
  );
}
