import { StorageKeys } from "@/constants/storageKeys";
import type { AiWarzoneAgent } from "@/types/aiWarzone";

export function saveAiAgentInfo(agent: AiWarzoneAgent) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(StorageKeys.local.aiAgentInfo, JSON.stringify(agent));
}

export function clearAiAgentInfo() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(StorageKeys.local.aiAgentInfo);
}

export function getStoredAiAgentInfo(): AiWarzoneAgent | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(StorageKeys.local.aiAgentInfo);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AiWarzoneAgent;
  } catch {
    return null;
  }
}

/** After fund API; keeps the rest of the cached agent row in sync for `currency`. */
export function patchAiAgentInfoCurrency(currency: number) {
  const prev = getStoredAiAgentInfo();
  if (!prev) return;
  saveAiAgentInfo({ ...prev, currency });
}
