import "./polyfills";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";
import { privyConfig } from "@/lib/privyConfig";

// When the backend OG-HTML page redirects human browsers it sends them to
// /#m/<momentId> so that DigitalOcean routes the request to the static SPA
// (path = "/") instead of back to the backend (/moments route).
// Convert that hash back to the real React Router path before the app mounts.
(function handleOgHashRedirect() {
  const hash = window.location.hash;
  if (hash.startsWith("#m/")) {
    const momentId = hash.slice(3);
    if (momentId) {
      window.history.replaceState(null, "", "/moments/" + momentId);
    }
  }
})();

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID ?? "";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
    <App />
  </PrivyProvider>
);
