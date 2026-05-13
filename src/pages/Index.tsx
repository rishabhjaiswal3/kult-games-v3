import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import AIConcierge from "@/components/AIConcierge";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAgent } from "@/contexts/CreateAgentContext";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { openCreateAgent } = useCreateAgent();

  const handleGamesAccess = () => {
    if (isAuthenticated) {
      navigate("/games");
      return;
    }
    login();
  };

  return (
    <div className="min-h-screen bg-background relative pt-2 sm:pt-3">
      <HeroSection onExploreGames={handleGamesAccess} />

      <GamesSection onViewAllGames={handleGamesAccess} />

      <VideoShowcase
        videoSrc="/videos/SC_10.mp4"
        title="POWERED BY AI"
        subtitle="Intelligent • Adaptive • On-Chain"
        height="50vh"
        overlayOpacity={0.45}
        contentVerticalAlign="lower"
        videoObjectPosition="center top"
      >
        <button
          onClick={() => navigate("/ai-arena")}
          className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider btn-eye"
        >
          EXPLORE AI ARENA
        </button>
      </VideoShowcase>

      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="glass-panel relative overflow-hidden rounded-2xl p-8 md:p-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: "var(--gradient-glow)" }}
          />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-neon-cyan">
                <Sparkles className="h-4 w-4" />
                AI Arena
              </div>
              <h2 className="font-display text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Enter the <span className="text-gradient-hero">AI Arena</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Spawn your own AI agent with a hot wallet. Let it fight, trade, and trash-talk opponents autonomously on-chain.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/ai-arena")}
                className="inline-flex items-center gap-2 px-8 py-3.5 font-display text-sm font-bold tracking-wider btn-eye"
              >
                EXPLORE AI ARENA
                <ArrowRight className="h-4 w-4" />
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={openCreateAgent}
                  className="inline-flex items-center gap-2 px-8 py-3.5 font-display text-sm font-bold tracking-wider btn-eye-outline"
                >
                  <Plus className="h-4 w-4" />
                  CREATE AI AGENT
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <VideoShowcase
        videoSrc="/videos/SC_12-5.mp4"
        title="YOUR LEGACY AWAITS"
        subtitle="Play • Compete • Earn"
        height="40vh"
        overlayOpacity={0.5}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleGamesAccess}
            className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider btn-eye relative overflow-hidden"
          >
            EXPLORE GAMES
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider btn-eye-outline"
          >
            VIEW LEADERBOARD
          </button>
        </div>
      </VideoShowcase>

      <AIConcierge />

      <Footer />
    </div>
  );
};

export default Index;
