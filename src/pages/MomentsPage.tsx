import { useCallback, useEffect, useRef } from "react";
import { MOMENTS_IFRAME_URL } from "@/lib/momentsUrl";
import { useAuth } from "@/contexts/AuthContext";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";

/**
 * Embed of the standalone Kult Moments app inside the shared app shell (sidebar only).
 * @see https://kult-browser-moments-p5wgi.ondigitalocean.app/
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
      MOMENTS_IFRAME_URL,
    );
  }, [isAuthenticated, player]);

  useEffect(() => {
    sendAuthToIframe();
  }, [sendAuthToIframe]);

  return (
    <iframe
      ref={iframeRef}
      title="Kult Moments"
      src={MOMENTS_IFRAME_URL}
      onLoad={sendAuthToIframe}
      className="min-h-0 w-full flex-1 border-0 bg-[#03070d]"
      style={{ minHeight: "100dvh" }}
      allow="clipboard-read; clipboard-write; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
};

export default MomentsPage;
