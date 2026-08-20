import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { accessCodeApi } from "@/api/accessCodeApi";
import { StorageKeys } from "@/constants/storageKeys";
import {
  type AccessFeature,
  type BrowserAccessSession,
  hasFeature,
  isAccessSessionValid,
} from "@/lib/accessControl";
import { clearBrowserAccessSession } from "@/lib/sessionCleanup";

type AccessContextValue = {
  session: BrowserAccessSession | null;
  hasAccess: boolean;
  verifyCode: (code: string) => Promise<BrowserAccessSession>;
  clearAccess: () => void;
  canUse: (feature: AccessFeature) => boolean;
};

const AccessContext = createContext<AccessContextValue | null>(null);

function readStoredSession(): BrowserAccessSession | null {
  try {
    const raw = localStorage.getItem(StorageKeys.local.browserAccessSession);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrowserAccessSession;
    return isAccessSessionValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: BrowserAccessSession | null) {
  if (!session) {
    clearBrowserAccessSession();
    return;
  }
  localStorage.setItem(StorageKeys.local.browserAccessSession, JSON.stringify(session));
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<BrowserAccessSession | null>(() => readStoredSession());

  const verifyCode = useCallback(async (code: string) => {
    const result = await accessCodeApi.verify(code);
    const nextSession: BrowserAccessSession = {
      tier: result.tier,
      label: result.label,
      features: result.features,
      accessToken: result.accessToken,
      expiresAt: Date.now() + result.expiresInDays * 24 * 60 * 60 * 1000,
    };
    setSession(nextSession);
    writeStoredSession(nextSession);
    return nextSession;
  }, []);

  const clearAccess = useCallback(() => {
    setSession(null);
    writeStoredSession(null);
  }, []);

  const canUse = useCallback((feature: AccessFeature) => hasFeature(session, feature), [session]);

  const value = useMemo<AccessContextValue>(
    () => ({
      session,
      hasAccess: isAccessSessionValid(session),
      verifyCode,
      clearAccess,
      canUse,
    }),
    [canUse, clearAccess, session, verifyCode],
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess must be used within AccessProvider");
  }
  return context;
}
