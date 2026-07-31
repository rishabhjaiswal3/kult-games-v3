import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { useAuth } from "@/contexts/AuthContext";
import { consumeCreatorStudioAfterLogin, launchCreatorStudio } from "@/lib/creatorStudioLaunch";

export function useCreatorStudioLaunch() {
  const { isAuthenticated, walletAddress, player } = useAuth();
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, getAccessToken } = usePrivy();
  const [launching, setLaunching] = useState(false);

  const launch = useCallback(async () => {
    if (launching) return;
    setLaunching(true);
    try {
      await launchCreatorStudio({
        isAuthenticated,
        walletAddress,
        privyDid: privyUser?.id ?? null,
        username: player?.name ?? null,
        privyReady,
        privyAuthenticated,
        getAccessToken,
      });
    } finally {
      setLaunching(false);
    }
  }, [
    getAccessToken,
    isAuthenticated,
    launching,
    player?.name,
    privyAuthenticated,
    privyReady,
    privyUser?.id,
    walletAddress,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!consumeCreatorStudioAfterLogin()) return;
    void launch();
  }, [isAuthenticated, launch]);

  return { launch, launching };
}
