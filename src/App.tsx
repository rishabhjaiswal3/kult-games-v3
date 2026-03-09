import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import Index from "./pages/Index";
import Store from "./pages/Store";
import Leaderboard from "./pages/Leaderboard";
import Events from "./pages/Events";
import GameDetail from "./pages/GameDetail";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import KultAIFloating from "./components/KultAIFloating";

const queryClient = new QueryClient();
const FADED_CONTENT_DELAY = 1800;
const PREVIEW_OPACITY = 0.2;

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleComplete = useCallback(() => setLoaded(true), []);

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
        filter: "blur(0px)",
        scale: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
      });
      return;
    }

    if (showPreview) {
      gsap.to(content, {
        opacity: PREVIEW_OPACITY,
        filter: "blur(6px)",
        scale: 1.01,
        y: 12,
        duration: 0.7,
        ease: "power2.out",
      });
      return;
    }

    gsap.set(content, {
      opacity: 0,
      filter: "blur(18px)",
      scale: 1.02,
      y: 18,
    });
  }, [loaded, showPreview]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded && <LoadingScreen onComplete={handleComplete} />}
        <div
          ref={contentRef}
          className={loaded ? "" : "pointer-events-none"}
          style={{ opacity: 0, filter: "blur(18px)", transform: "translateY(18px) scale(1.02)" }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/store" element={<Store />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/game/:id" element={<GameDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <KultAIFloating />
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
