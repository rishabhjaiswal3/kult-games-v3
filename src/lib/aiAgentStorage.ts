import { StorageKeys } from "@/constants/storageKeys";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

export function saveAiAgentInfo(agent: AiArenaAgent) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(StorageKeys.local.aiAgentInfo, JSON.stringify(agent));
}

export function clearAiAgentInfo() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(StorageKeys.local.aiAgentInfo);
}

export function getStoredAiAgentInfo(): AiArenaAgent | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(StorageKeys.local.aiAgentInfo);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AiArenaAgent;
  } catch {
    return null;
  }
}

/** Keep cached agent in sync after wallet operations. */
export function patchAiAgentInfo(partial: Partial<AiArenaAgent>) {
  const prev = getStoredAiAgentInfo();
  if (!prev) return;
  saveAiAgentInfo({ ...prev, ...partial });
}
