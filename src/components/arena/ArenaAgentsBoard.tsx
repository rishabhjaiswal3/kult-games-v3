import { useMemo, useState } from "react";
import type { AiArenaAgent, AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { AiArenaAgentDetailModal } from "@/components/arena/AiArenaAgentDetailModal";
import {
  ArenaAgentsCarousel,
  CreateAgentHeaderButton,
} from "@/components/arena/ArenaAgentsCarousel";
import { useArenaPage } from "@/contexts/ArenaPageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { useArenaAgentsListInfinite } from "@/hooks/useArenaAgentsList";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { getStoredAiAgentInfo } from "@/lib/aiAgentStorage";

const ALL_PAGE_SIZE = 12;
const MY_PAGE_SIZE = 12;

function flattenAgentPages(pages: { agents: AiArenaAgent[] }[]): AiArenaAgent[] {
  const seen = new Set<string>();
  const out: AiArenaAgent[] = [];
  for (const p of pages) {
    for (const a of p.agents) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        out.push(a);
      }
    }
  }
  return out;
}

export function ArenaAgentsBoard() {
  const { openCreateAgent } = useArenaPage();
  const { isAuthenticated } = useAuth();
  const { isAiArenaReady } = useAiArenaGatewaySession();
  const [myPage, setMyPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);
  const [detailSeed, setDetailSeed] = useState<AiArenaLeaderboardEntry | AiArenaAgent | null>(null);

  const allQ = useArenaAgentsListInfinite(ALL_PAGE_SIZE);
  const allAgents = useMemo(
    () => (allQ.data?.pages?.length ? flattenAgentPages(allQ.data.pages) : []),
    [allQ.data?.pages]
  );

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

  const myLoading =
    isAuthenticated &&
    !myQ.isError &&
    (myQ.isLoading || (!isAiArenaReady && myAgents.length === 0 && !getStoredAiAgentInfo()));

  return (
    <section id="arena-agents-board" className="scroll-mt-24 space-y-6">
      <ArenaAgentsCarousel
        layout="live-feed"
        title="All agents"
        agents={allAgents}
        loading={allQ.isLoading}
        error={allQ.isError}
        errorMessage="Could not load agents from the arena API."
        emptyMessage="No agents on the arena yet."
        accent="cyan"
        headerAction={isAuthenticated ? <CreateAgentHeaderButton onClick={openCreateAgent} /> : undefined}
        onAgentClick={openDetailFromAgent}
        fetchNextPage={() => void allQ.fetchNextPage()}
        hasNextPage={Boolean(allQ.hasNextPage)}
        isFetchingNextPage={allQ.isFetchingNextPage}
      />

      <ArenaAgentsCarousel
        layout="carousel"
        title="My AI agents"
        // subtitle="Your personal roster, synced to your arena account. Swipe your agents or create a new champion."
        subtitle=""
        agents={myAgents}
        loading={myLoading}
        error={isAuthenticated && myQ.isError}
        errorMessage="Could not load your agents. Try refreshing after AI Arena connects."
        emptyMessage={
          !isAuthenticated
            ? "Log in with your wallet to see your agents."
            : "No agents yet. Create one to get started."
        }
        emptyAction={
          isAuthenticated ? <CreateAgentHeaderButton onClick={openCreateAgent} /> : undefined
        }
        accent="purple"
        headerAction={isAuthenticated ? <CreateAgentHeaderButton onClick={openCreateAgent} /> : undefined}
        onAgentClick={openDetailFromAgent}
        page={myPage}
        totalPages={myTotalPages}
        disableNext={myDisableNext}
        paginationDisabled={myLoading || myQ.isError || !isAuthenticated}
        onPage={(p) => setMyPage(Math.max(1, p))}
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
