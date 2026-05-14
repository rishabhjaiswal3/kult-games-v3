import { useState } from "react";
import type { AiArenaAgent, AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { AiArenaAgentDetailModal } from "@/components/arena/AiArenaAgentDetailModal";
import {
  ArenaAgentsCarousel,
  CreateAgentHeaderButton,
} from "@/components/arena/ArenaAgentsCarousel";
import { useArenaPage } from "@/contexts/ArenaPageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { useArenaAgentsList } from "@/hooks/useArenaAgentsList";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { getStoredAiAgentInfo } from "@/lib/aiAgentStorage";

const ALL_PAGE_SIZE = 12;
const MY_PAGE_SIZE = 12;

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

  const myLoading =
    isAuthenticated &&
    !myQ.isError &&
    (myQ.isLoading || (!isAiArenaReady && myAgents.length === 0 && !getStoredAiAgentInfo()));

  return (
    <section id="arena-agents-board" className="scroll-mt-24 space-y-6">
      <ArenaAgentsCarousel
        title="All agents"
        subtitle="Live roster from the arena gateway. Swipe through fighters and tap a card for full details."
        agents={allAgents}
        loading={allQ.isLoading}
        error={allQ.isError}
        errorMessage="Could not load agents from the arena API."
        emptyMessage="No agents on the arena yet."
        accent="cyan"
        onAgentClick={openDetailFromAgent}
        page={allPage}
        totalPages={allTotalPages}
        disableNext={allDisableNext}
        paginationDisabled={allQ.isLoading || allQ.isError}
        onPage={(p) => setAllPage(Math.max(1, p))}
      />

      <ArenaAgentsCarousel
        title="My AI agents"
        subtitle="Your personal roster, synced to your arena account. Swipe your agents or create a new champion."
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
