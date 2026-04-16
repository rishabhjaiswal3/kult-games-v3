import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import Index from "./pages/Index";
import Store from "./pages/Store";
import Marketplace from "./pages/Marketplace";
import Leaderboard from "./pages/Leaderboard";
import Events from "./pages/Events";
import GameDetail from "./pages/GameDetail";
import GamePlay from "./pages/GamePlay";
import NotFound from "./pages/NotFound";
import AIArenaPage from "./pages/AIArenaPage";
import MomentsPage from "./pages/MomentsPage";
import ProfilePage from "./pages/ProfilePage";
import LoadingScreen from "./components/LoadingScreen";
import KultAIFloating from "./components/KultAIFloating";
import { gamesApi } from "@/api/gamesApi";

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

const App = () => {
  const [loaded, setLoaded] = useState(readSplashAlreadySeen);
  const [showPreview, setShowPreview] = useState(readSplashAlreadySeen);
  const contentRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    gsap.killTweensOf(content);

    if (loaded) {
      gsap.to(content, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        clearProps: "transform",
      });
      return;
    }

    if (showPreview) {
      gsap.to(content, {
        opacity: PREVIEW_OPACITY,
        scale: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
      });
      return;
    }

    gsap.set(content, {
      opacity: 0,
      scale: 1,
      y: 0,
    });
  }, [loaded, showPreview]);

  /** Start loading game list + thumbnails as soon as the shell mounts (overlaps splash). */
  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: ["games", "all"],
      queryFn: () => gamesApi.getAll(1, 50),
      staleTime: 5 * 60_000,
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded ? <LoadingScreen onComplete={handleComplete} /> : null}
        <BrowserRouter>
          <div
            ref={contentRef}
            className={loaded ? "" : "pointer-events-none"}
            style={loaded ? { opacity: 1 } : { opacity: 0 }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/games" element={<Store />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/ai-arena" element={<AIArenaPage />} />
              <Route path="/moments" element={<MomentsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/game/:id" element={<GameDetail />} />
              <Route path="/game/:id/play" element={<GamePlay />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          {loaded && <KultAIFloating />}
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
