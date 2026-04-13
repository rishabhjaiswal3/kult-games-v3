import Navbar from "@/components/Navbar";
import { MOMENTS_IFRAME_URL } from "@/lib/momentsUrl";

/**
 * Full-viewport embed of the Moments web app (URL from `VITE_MOMENTS_URL`).
 */
const MomentsPage = () => {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <iframe
        title="Moments"
        src={MOMENTS_IFRAME_URL}
        className="fixed left-0 w-full border-0 bg-background z-0"
        style={{ top: "4rem", height: "calc(100dvh - 4rem)" }}
        allow="clipboard-read; clipboard-write; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

export default MomentsPage;
