import { seedCreatorStudioIdentity, tryFetchAndStoreCreatorStudioAuthToken } from "@/lib/creatorStudioAutoAuth";
import { requestOpenLoginModal } from "@/lib/loginModalBus";
import { studioUrl } from "@/lib/serviceUrls";

export const CREATOR_STUDIO_AFTER_LOGIN_KEY = "kult_creator_studio_after_login_v1";

export function markCreatorStudioAfterLogin() {
  try {
    sessionStorage.setItem(CREATOR_STUDIO_AFTER_LOGIN_KEY, "1");
  } catch {
    // ignore
  }
}

export function consumeCreatorStudioAfterLogin() {
  try {
    if (sessionStorage.getItem(CREATOR_STUDIO_AFTER_LOGIN_KEY) !== "1") return false;
    sessionStorage.removeItem(CREATOR_STUDIO_AFTER_LOGIN_KEY);
    return true;
  } catch {
    return false;
  }
}

type LaunchCreatorStudioOptions = {
  isAuthenticated: boolean;
  walletAddress?: string | null;
  privyDid?: string | null;
  username?: string | null;
  privyReady?: boolean;
  privyAuthenticated?: boolean;
  getAccessToken?: () => Promise<string | null>;
};

export async function launchCreatorStudio(options: LaunchCreatorStudioOptions) {
  if (!options.isAuthenticated) {
    markCreatorStudioAfterLogin();
    requestOpenLoginModal();
    return;
  }

  try {
    seedCreatorStudioIdentity({
      walletAddress: options.walletAddress,
      privyDid: options.privyDid,
      username: options.username,
    });

    if (options.privyReady && options.privyAuthenticated && options.getAccessToken) {
      const accessToken = await Promise.race<string | null>([
        options.getAccessToken().catch(() => null),
        new Promise((resolve) => window.setTimeout(() => resolve(null), 1200)),
      ]);

      if (typeof accessToken === "string" && accessToken.trim()) {
        await Promise.race([
          tryFetchAndStoreCreatorStudioAuthToken({
            privyAccessToken: accessToken,
            walletAddress: options.walletAddress,
            privyDid: options.privyDid,
          }).catch(() => null),
          new Promise((resolve) => window.setTimeout(resolve, 1200)),
        ]);
      }
    }
  } finally {
    window.location.assign(studioUrl());
  }
}
