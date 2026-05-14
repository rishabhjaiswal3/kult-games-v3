import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAiArenaAccessToken } from "@/lib/aiArenaAuth";

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

    return () => window.clearInterval(id);
  }, [isAuthenticated, authLoading]);

  return { isAiArenaReady: isAuthenticated && ready };
}
