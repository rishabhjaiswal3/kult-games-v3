import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AI_ARENA_SESSION_READY_EVENT, getAiArenaAccessToken } from "@/lib/aiArenaAuth";

/** True only after Kult login + AI Arena JWT exchange (Privy → `/v1/auth/privy`). */
export function useAiArenaGatewaySession() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [ready, setReady] = useState(() => isAuthenticated && !!getAiArenaAccessToken());

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(false);
      return;
    }
    if (getAiArenaAccessToken()) {
      setReady(true);
      return;
    }

    const handleSessionReady = () => setReady(true);
    window.addEventListener(AI_ARENA_SESSION_READY_EVENT, handleSessionReady);

    const deadline = Date.now() + 12_000;
    const id = window.setInterval(() => {
      if (getAiArenaAccessToken()) {
        setReady(true);
        window.clearInterval(id);
      } else if (Date.now() > deadline) {
        setReady(false);
        window.clearInterval(id);
      }
    }, 400);

    return () => {
      window.clearInterval(id);
      window.removeEventListener(AI_ARENA_SESSION_READY_EVENT, handleSessionReady);
    };
  }, [isAuthenticated, authLoading]);

  return { isAiArenaReady: isAuthenticated && ready };
}
