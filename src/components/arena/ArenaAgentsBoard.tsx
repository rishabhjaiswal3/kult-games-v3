import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { AiArenaAgent, AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { AiArenaAgentDetailModal } from "@/components/arena/AiArenaAgentDetailModal";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { Button } from "@/components/ui/button";
import { useArenaPage } from "@/contexts/ArenaPageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { useArenaAgentsList } from "@/hooks/useArenaAgentsList";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { ArenaAgentRowItemsSkeleton } from "@/components/skeleton";

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
  disableNext?: boolean;
}) {
  const nextOff =
    disabled ||
    (typeof totalPages === "number" ? page >= totalPages : Boolean(disableNext));
  const prevOff = disabled || page <= 1;

  if (prevOff && nextOff) return null;

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
  const { isAuthenticated } = useAuth();
  const { isAiArenaReady } = useAiArenaGatewaySession();
  const [allPage, setAllPage] = useState(1);
  const [myPage, setMyPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);
  const [detailSeed, setDetailSeed] = useState<AiArenaLeaderboardEntry | AiArenaAgent | null>(null);

  const allQ = useArenaAgentsList(allPage, ALL_PAGE_SIZE);
  const allAgents = allQ.data?.agents ?? [];
  const allTotal = allQ.data?.total;
  const allTotalPages =
    typeof allTotal === "number" && allTotal > 0
      ? Math.max(1, Math.ceil(allTotal / ALL_PAGE_SIZE))
      : undefined;
  const allDisableNext =
    typeof allTotalPages === "number" ? false : allAgents.length < ALL_PAGE_SIZE;

  const myQ = useMyArenaAgents(myPage, MY_PAGE_SIZE);
  const myAgents = myQ.data?.agents ?? [];
  const myTotal = myQ.data?.total;
  const myTotalPages =
    typeof myTotal === "number" && myTotal > 0 ? Math.max(1, Math.ceil(myTotal / MY_PAGE_SIZE)) : undefined;
  const myDisableNext =
    typeof myTotalPages === "number" ? false : myAgents.length < MY_PAGE_SIZE;

  const openDetailFromAgent = (a: AiArenaAgent) => {
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
              Live roster from the arena gateway. Tap any agent for details.
            </p>
          </div>
          {allQ.isFetching && !allQ.isLoading ? (
            <span className="text-[10px] text-muted-foreground">Refreshing…</span>
          ) : null}
        </div>

        {allQ.isError ? (
          <p className="text-sm text-muted-foreground">Could not load agents from the arena API.</p>
        ) : (
          <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {allAgents.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => openDetailFromAgent(a)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-background/35 px-3 py-2.5 text-left text-sm transition hover:border-neon-cyan/30 hover:bg-background/50"
                >
                  <ArenaAgentThumbnail agent={a} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {a.archetype} · {a.clan} · ELO {a.eloRating} · {a.wins} wins
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {allQ.isLoading ? (
              <ArenaAgentRowItemsSkeleton count={5} />
            ) : null}
            {!allQ.isLoading && !allAgents.length ? (
              <li className="text-sm text-muted-foreground">No agents on the arena yet.</li>
            ) : null}
          </ul>
        )}

        <PaginationBar
          page={allPage}
          totalPages={allTotalPages}
          disableNext={allDisableNext}
          disabled={allQ.isLoading || allQ.isError}
          onPage={(p) => setAllPage(Math.max(1, p))}
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
          <Button type="button" size="sm" className="h-8 gap-1 text-xs" onClick={openCreateAgent}>
            <Plus className="h-3.5 w-3.5" />
            Create
          </Button>
        </div>
        {!isAuthenticated ? (
          <p className="text-sm text-muted-foreground">Log in with your wallet to see your agents.</p>
        ) : myQ.isError || (!isAiArenaReady && !myQ.isLoading && !myAgents.length) ? (
          <p className="text-sm text-muted-foreground">
            {myQ.isError
              ? "Could not load your agents. Try refreshing after AI Arena connects."
              : "Connecting to AI Arena…"}
          </p>
        ) : (
          <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {myAgents.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => openDetailFromAgent(a)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-background/35 px-3 py-2.5 text-left text-sm transition hover:border-neon-purple/35 hover:bg-background/50"
                >
                  <ArenaAgentThumbnail agent={a} />
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
            {myQ.isLoading ? <ArenaAgentRowItemsSkeleton count={4} /> : null}
          </ul>
        )}

        <PaginationBar
          page={myPage}
          totalPages={myTotalPages}
          disableNext={myDisableNext}
          disabled={myQ.isLoading || myQ.isError || !isAuthenticated}
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
