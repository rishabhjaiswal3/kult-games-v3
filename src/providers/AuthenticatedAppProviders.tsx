import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { privyConfig } from "@/lib/privyConfig";

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID ?? "";

export default function AuthenticatedAppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <AuthProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthProvider>
    </PrivyProvider>
  );
}
