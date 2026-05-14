import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreateAiArenaAgentModal } from "@/components/arena/CreateAiArenaAgentModal";
import { useAuth } from "@/contexts/AuthContext";
import { AI_ARENA_LEADERBOARD_QUERY_KEY } from "@/hooks/useAiArenaGlobalLeaderboard";
import { ARENA_AGENTS_LIST_QUERY_KEY } from "@/hooks/useArenaAgentsList";
import { MY_ARENA_AGENTS_QUERY_KEY, upsertMyArenaAgentCache } from "@/hooks/useMyArenaAgents";
import { saveAiAgentInfo } from "@/lib/aiAgentStorage";
import type { AiArenaArchetype } from "@/constants/aiArenaAgent";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { toast } from "sonner";

type AgentCreatedListener = (agent: AiArenaAgent) => void | Promise<void>;

type OpenCreateAgentOptions = {
  archetype?: AiArenaArchetype;
};

type CreateAgentContextValue = {
  openCreateAgent: (opts?: OpenCreateAgentOptions) => void;
  subscribeAgentCreated: (listener: AgentCreatedListener) => () => void;
};

const CreateAgentContext = createContext<CreateAgentContextValue | null>(null);

export function CreateAgentProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { player, walletAddress } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingArchetype, setPendingArchetype] = useState<AiArenaArchetype | undefined>();
  const listenersRef = useRef(new Set<AgentCreatedListener>());

  const openCreateAgent = useCallback((opts?: OpenCreateAgentOptions) => {
    if (!walletAddress) {
      toast.error("Connect a wallet first.");
      return;
    }
    setPendingArchetype(opts?.archetype);
    setCreateOpen(true);
  }, [walletAddress]);

  const subscribeAgentCreated = useCallback((listener: AgentCreatedListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const invalidateAfterCreate = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: AI_ARENA_LEADERBOARD_QUERY_KEY, type: "active" });
    await queryClient.refetchQueries({ queryKey: ARENA_AGENTS_LIST_QUERY_KEY, type: "active" });
    await queryClient.refetchQueries({ queryKey: MY_ARENA_AGENTS_QUERY_KEY, type: "active" });
    await queryClient.refetchQueries({ queryKey: ["aiArenaGateway", "matchmakingStatusCards"], type: "active" });
    await queryClient.refetchQueries({ queryKey: ["aiArenaGateway", "openLobbies"], type: "active" });
    await queryClient.refetchQueries({ queryKey: ["aiArenaGateway", "matchmakingMyAgents"], type: "active" });
    await queryClient.refetchQueries({ queryKey: ["aiArenaGateway", "navbarFundWalletPreview"], type: "active" });
  }, [queryClient]);

  const handleCreated = useCallback(
    async (agent: AiArenaAgent) => {
      saveAiAgentInfo(agent);
      upsertMyArenaAgentCache(queryClient, agent);
      await invalidateAfterCreate();
      await Promise.all(
        [...listenersRef.current].map(async (listener) => {
          try {
            await listener(agent);
          } catch {
            /* listener handles its own errors */
          }
        })
      );
    },
    [invalidateAfterCreate, queryClient]
  );

  const value = useMemo(
    () => ({ openCreateAgent, subscribeAgentCreated }),
    [openCreateAgent, subscribeAgentCreated]
  );

  const defaultName =
    player?.name?.trim() || (walletAddress ? `Agent ${walletAddress.slice(0, 8)}` : "");

  return (
    <CreateAgentContext.Provider value={value}>
      {children}
      <CreateAiArenaAgentModal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setPendingArchetype(undefined);
        }}
        defaultName={defaultName}
        defaultArchetype={pendingArchetype}
        onCreated={(agent) => void handleCreated(agent)}
      />
    </CreateAgentContext.Provider>
  );
}

export function useCreateAgent() {
  const ctx = useContext(CreateAgentContext);
  if (!ctx) {
    throw new Error("useCreateAgent must be used within CreateAgentProvider");
  }
  return ctx;
}
