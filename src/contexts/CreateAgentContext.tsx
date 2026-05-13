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
import { saveAiAgentInfo } from "@/lib/aiAgentStorage";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { toast } from "sonner";

type AgentCreatedListener = (agent: AiArenaAgent) => void | Promise<void>;

type CreateAgentContextValue = {
  openCreateAgent: () => void;
  subscribeAgentCreated: (listener: AgentCreatedListener) => () => void;
};

const CreateAgentContext = createContext<CreateAgentContextValue | null>(null);

export function CreateAgentProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { player, walletAddress } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const listenersRef = useRef(new Set<AgentCreatedListener>());

  const openCreateAgent = useCallback(() => {
    if (!walletAddress) {
      toast.error("Connect a wallet first.");
      return;
    }
    setCreateOpen(true);
  }, [walletAddress]);

  const subscribeAgentCreated = useCallback((listener: AgentCreatedListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const invalidateAfterCreate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: AI_ARENA_LEADERBOARD_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "arenaBoardMyAgents"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "myAgents"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "matchmakingStatusCards"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "matchmakingMyAgents"] });
    await queryClient.invalidateQueries({ queryKey: ["aiArenaGateway", "navbarFundAgentPicker"] });
  }, [queryClient]);

  const handleCreated = useCallback(
    async (agent: AiArenaAgent) => {
      saveAiAgentInfo(agent);
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
    [invalidateAfterCreate]
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
        onOpenChange={setCreateOpen}
        defaultName={defaultName}
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
