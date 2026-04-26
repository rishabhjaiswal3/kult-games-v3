import { useCallback, useEffect, useRef } from "react";
import { MOMENTS_IFRAME_URL } from "@/lib/momentsUrl";
import { useAuth } from "@/contexts/AuthContext";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";

/**
 * Full-viewport embed of the Moments web app (URL from `VITE_MOMENTS_URL`).
 * Passes the parent JWT to the iframe via postMessage so the moments app
 * can make authenticated API calls without its own login flow.
 */
const MomentsPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, player } = useAuth();

  const sendAuthToIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const walletAddress = localStorage.getItem(WALLET_KEY);

    iframe.contentWindow.postMessage(
      {
        type: "KULT_AUTH",
        payload: token
          ? { token, player: { walletAddress, name: player?.name ?? null } }
          : null,
      },
      MOMENTS_IFRAME_URL
    );
  }, [isAuthenticated, player]);

  // Re-send whenever auth state changes
  useEffect(() => {
    sendAuthToIframe();
  }, [sendAuthToIframe]);

  return (
    <div className="min-h-dvh bg-background">
      <iframe
        ref={iframeRef}
        title="Moments"
        src={MOMENTS_IFRAME_URL}
        onLoad={sendAuthToIframe}
        className="fixed left-0 w-full border-0 bg-background z-0"
        style={{ top: "4rem", height: "calc(100dvh - 4rem)" }}
        allow="clipboard-read; clipboard-write; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

export default MomentsPage;
