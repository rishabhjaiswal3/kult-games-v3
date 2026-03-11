import ParticleField from "@/components/ParticleField";
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
      <ParticleField />
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
          className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all duration-300"
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
            onClick={() => navigate("/store")}
            className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider bg-neon-cyan text-background hover:shadow-[0_0_30px_hsl(195_100%_60%/0.4)] transition-all duration-300 relative overflow-hidden"
          >
            EXPLORE GAMES
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="px-8 py-3.5 rounded-lg font-display text-sm font-semibold tracking-wider border border-neon-cyan/30 text-foreground hover:bg-neon-cyan/10 transition-all duration-300"
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
