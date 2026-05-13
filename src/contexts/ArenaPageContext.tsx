import type { ReactNode } from "react";
import { useCreateAgent } from "@/contexts/CreateAgentContext";

/** @deprecated Prefer useCreateAgent — kept for arena components. */
export function useArenaPage() {
  return useCreateAgent();
}

/** No-op wrapper; create-agent modal lives in CreateAgentProvider at app root. */
export function ArenaPageProvider({ children }: { children: ReactNode }) {
  return children;
}
