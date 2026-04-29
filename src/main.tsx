import "./polyfills";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID ?? "";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider
    appId={PRIVY_APP_ID}
    config={{
      appearance: {
        theme: "dark",
        walletChainType: "ethereum-only",
        showWalletLoginFirst: true,
        walletList: ["metamask", "coinbase_wallet", "rainbow", "phantom"],
      },
      embeddedWallets: {
        ethereum: { createOnLogin: "users-without-wallets" },
      },
      loginMethods: ["wallet", "email", "google"],
    }}
  >
    <App />
  </PrivyProvider>
);
