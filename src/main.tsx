import "./polyfills";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";
import { privyConfig } from "@/lib/privyConfig";

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID ?? "";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
    <App />
  </PrivyProvider>
);
