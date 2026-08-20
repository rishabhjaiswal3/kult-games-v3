import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthenticatedAppProviders from "@/providers/AuthenticatedAppProviders";
import { AccessProvider } from "@/contexts/AccessContext";
import { LoginModalHost } from "@/components/LoginModalHost";
import { AppShell } from "@/layout/AppShell";
import {
  AgenticOverviewPage,
  AgenticJobsPage,
  AgenticPostJobPage,
  AgenticJobWorkspacePage,
  AgenticMyJobsPage,
  AgenticAgentsPage,
  AgenticReputationPage,
} from "@/pages/MarketplacePages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessProvider>
        <AuthenticatedAppProviders>
          <BrowserRouter>
            <LoginModalHost />
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<AgenticOverviewPage />} />
                <Route path="/jobs" element={<AgenticJobsPage />} />
                <Route path="/jobs/new" element={<AgenticPostJobPage />} />
                <Route path="/jobs/:jobId" element={<AgenticJobWorkspacePage />} />
                <Route path="/my-jobs" element={<AgenticMyJobsPage />} />
                <Route path="/agents" element={<AgenticAgentsPage />} />
                <Route path="/reputation" element={<AgenticReputationPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthenticatedAppProviders>
      </AccessProvider>
    </QueryClientProvider>
  );
}

export default App;
