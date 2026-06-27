import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { CreateAgentProvider } from "@/contexts/CreateAgentContext";
import { AccessProvider, useAccess } from "@/contexts/AccessContext";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useState, useCallback, useEffect, Suspense } from "react";
import { hasUserLoginIntent, getUserLoginMethod, requestOpenLoginModal } from "@/lib/loginModalBus";
import { PageRouteFallback } from "@/components/PageRouteFallback";
import { RouteChunkErrorBoundary } from "@/components/RouteChunkErrorBoundary";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const Index = lazyWithRetry(() => import("./pages/Index"));
const Games = lazyWithRetry(() => import("./pages/Games"));
const Inventory = lazyWithRetry(() => import("./pages/Inventory"));
const MyAgentsPage = lazyWithRetry(() => import("./pages/MyAgentsPage"));
const TrainingPage = lazyWithRetry(() => import("./pages/TrainingPage"));
const BattlesPage = lazyWithRetry(() => import("./pages/BattlesPage"));
const Leaderboard = lazyWithRetry(() => import("./pages/Leaderboard"));
const GameDetail = lazyWithRetry(() => import("./pages/GameDetail"));
const GamePlay = lazyWithRetry(() => import("./pages/GamePlay"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const AIArenaPage = lazyWithRetry(() => import("./pages/AIArenaPage"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const AutonomousPage = lazyWithRetry(() => import("./pages/AutonomousPage"));
const AchievementsPage = lazyWithRetry(() => import("./pages/AchievementsPage"));
const LeaguePage = lazyWithRetry(() => import("./pages/LeaguePage"));
const AllMomentsPage = lazyWithRetry(() => import("./pages/AllMomentsPage"));
const MomentDetailPage = lazyWithRetry(() => import("./pages/MomentDetailPage"));
const AccessLoginPage = lazyWithRetry(() => import("./pages/AccessLoginPage"));
const ArenaGamePage = lazyWithRetry(() => import("./pages/ArenaGamePage"));
const RobowarGamePage = lazyWithRetry(() => import("./pages/RobowarGamePage"));
const LoadingScreen = lazyWithRetry(() => import("./components/LoadingScreen"));
import { LoginModalHost } from "@/components/LoginModalHost";
const KultAIFloating = lazyWithRetry(() => import("./components/KultAIFloating"));
import { AppShell } from "@/layout/AppShell";
import { gamesApi } from "@/api/gamesApi";
import { AccessRoute } from "@/components/AccessRoute";
import { TourProvider } from "@/tour/TourProvider";

function OAuthRedirectLoader() {
  useEffect(() => {
    if (!hasUserLoginIntent() || getUserLoginMethod() !== "google") return;
    requestOpenLoginModal({ mode: "finishing" });
  }, []);

  return null;
}

const SPLASH_SEEN_KEY = "kult_splash_seen";

function readSplashAlreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

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

/** How long before the route tree is hinted behind the splash (blur preview). */
const FADED_CONTENT_DELAY = 350;
/** Keep preview subtle — avoid `filter: blur` on the whole app (hurts scroll compositing & text clarity). */
const PREVIEW_OPACITY = 0.35;

function BrowserApp() {
  const { canUse, hasAccess } = useAccess();
  const [loaded, setLoaded] = useState(readSplashAlreadySeen);
  const [showPreview, setShowPreview] = useState(readSplashAlreadySeen);
  const handleComplete = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      setShowPreview(true);
      return;
    }

    const previewTimer = window.setTimeout(() => {
      setShowPreview(true);
    }, FADED_CONTENT_DELAY);

    return () => {
      window.clearTimeout(previewTimer);
    };
  }, [loaded]);

  /** Warm a likely next route after first paint instead of competing with startup work. */
  useEffect(() => {
    if (!loaded || !hasAccess || !canUse("games")) return;

    const timer = window.setTimeout(() => {
      void queryClient.prefetchQuery({
        queryKey: ["games", "all"],
        queryFn: () => gamesApi.getAll(1, 50),
        staleTime: 5 * 60_000,
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [loaded, canUse, hasAccess]);

  if (!hasAccess) {
    return (
      <Suspense fallback={<PageRouteFallback />}>
        <AccessLoginPage />
      </Suspense>
    );
  }

  return (
    <AuthProvider>
      <CreateAgentProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded ? (
          <Suspense fallback={null}>
            <LoadingScreen onComplete={handleComplete} />
          </Suspense>
        ) : null}
        <BrowserRouter>
          <TourProvider enabled={loaded}>
            <div
              className={loaded ? "" : "pointer-events-none"}
              style={{
                opacity: loaded ? 1 : showPreview ? PREVIEW_OPACITY : 0,
                transition: loaded ? "opacity 450ms ease" : "opacity 350ms ease",
              }}
            >
              <RouteChunkErrorBoundary>
                <Suspense fallback={<PageRouteFallback />}>
                  <Routes>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<AccessRoute><Dashboard /></AccessRoute>} />
                    <Route path="/games" element={<AccessRoute><Games /></AccessRoute>} />
                    <Route path="/my-agents" element={<AccessRoute><MyAgentsPage /></AccessRoute>} />
                    <Route path="/training" element={<AccessRoute><TrainingPage /></AccessRoute>} />
                    <Route path="/battles" element={<AccessRoute><BattlesPage /></AccessRoute>} />
                    <Route path="/inventory" element={<AccessRoute><Inventory /></AccessRoute>} />
                    <Route path="/marketplace" element={<Navigate to="/inventory" replace />} />
                    <Route path="/leaderboard" element={<AccessRoute><Leaderboard /></AccessRoute>} />
                    <Route path="/league" element={<AccessRoute><LeaguePage /></AccessRoute>} />
                    <Route path="/ai-arena" element={<AccessRoute><AIArenaPage /></AccessRoute>} />
                    <Route path="/moments" element={<AccessRoute><AllMomentsPage /></AccessRoute>} />
                    <Route path="/moments/browse" element={<AccessRoute><AllMomentsPage /></AccessRoute>} />
                    <Route path="/moments/:id" element={<AccessRoute><MomentDetailPage /></AccessRoute>} />

                    <Route path="/autonomous" element={<AccessRoute><AutonomousPage /></AccessRoute>} />
                    <Route path="/achievements" element={<AccessRoute><AchievementsPage /></AccessRoute>} />
                    <Route path="/game/:id" element={<AccessRoute><GameDetail /></AccessRoute>} />
                    <Route path="/game/:id/play" element={<AccessRoute><GamePlay /></AccessRoute>} />
                  </Route>
                  {/* Full-screen arena game page — no AppShell sidebar */}
                  <Route path="/arena/game/:battleId" element={<AccessRoute><ArenaGamePage /></AccessRoute>} />
                  {/* Robowar simulation page — red theme, no Unity, 120s sim */}
                  <Route path="/arena/robowar/:battleId" element={<AccessRoute><RobowarGamePage /></AccessRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </RouteChunkErrorBoundary>
            </div>
            <LoginModalHost />
            <OAuthRedirectLoader />
            {loaded ? (
              <Suspense fallback={null}>
                <KultAIFloating />
              </Suspense>
            ) : null}
          </TourProvider>
        </BrowserRouter>
      </TooltipProvider>
      </CreateAgentProvider>
    </AuthProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessProvider>
      <BrowserApp />
    </AccessProvider>
  </QueryClientProvider>
);

export default App;
