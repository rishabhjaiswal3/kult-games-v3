import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import AIConcierge from "@/components/AIConcierge";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <HeroSection />

      <GamesSection />

      {/* Video break: Transition to AI */}
      <VideoShowcase
        videoSrc="/videos/SC_10.mp4"
        title="POWERED BY AI"
        subtitle="Intelligent • Adaptive • On-Chain"
        height="45vh"
        overlayOpacity={0.6}
      >
        <button
          onClick={() => navigate("/events")}
          className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider btn-eye"
        >
          JOIN TOURNAMENTS
        </button>
      </VideoShowcase>

      <AIConcierge />

      {/* Video break: Final CTA */}
      <VideoShowcase
        videoSrc="/videos/SC_12-5.mp4"
        title="YOUR LEGACY AWAITS"
        subtitle="Play • Compete • Earn"
        height="40vh"
        overlayOpacity={0.5}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate("/games")}
            className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider btn-eye relative overflow-hidden"
          >
            EXPLORE GAMES
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider btn-eye-outline"
          >
            VIEW LEADERBOARD
          </button>
        </div>
      </VideoShowcase>

      <Footer />
    </div>
  );
};

export default Index;
