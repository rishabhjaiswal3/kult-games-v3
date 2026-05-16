import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import AIConcierge from "@/components/AIConcierge";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";
import LiveEcosystemLayer from "@/components/LiveEcosystemLayer";
import { HomeArenaPromoBanner } from "@/components/HomeArenaPromoBanner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGamesAccess = () => {
    if (isAuthenticated) {
      navigate("/games");
      return;
    }
    navigate("/?login=1");
  };

  return (
    <div className="min-h-screen bg-background relative pt-2 sm:pt-3">
      <HeroSection onExploreGames={handleGamesAccess} />

      <LiveEcosystemLayer />

      <GamesSection onViewAllGames={handleGamesAccess} />

      <VideoShowcase
        videoSrc="/videos/SC_10.mp4"
        title="YOUR AGENT NEVER FORGETS"
        subtitle="Remembers • Adapts • Strikes Back"
        height="50vh"
        overlayOpacity={0.45}
        contentVerticalAlign="lower-desktop-up"
        videoObjectPosition="center top"
        titleClassName="text-2xl sm:text-3xl md:text-5xl lg:text-6xl"
      >
        <button
          onClick={() => navigate("/ai-arena")}
          className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider btn-eye"
        >
          EXPLORE AI ARENA
        </button>
      </VideoShowcase>

      <HomeArenaPromoBanner />

      <VideoShowcase
        videoSrc="/videos/SC_12-5.mp4"
        title="YOUR LEGACY AWAITS"
        subtitle="Play • Compete • Earn"
        height="40vh"
        overlayOpacity={0.5}
        titleClassName="text-2xl sm:text-3xl md:text-5xl lg:text-6xl"
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
