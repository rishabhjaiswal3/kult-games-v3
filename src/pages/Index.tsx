import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import AIConcierge from "@/components/AIConcierge";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navbar />
      <HeroSection />
      <GamesSection />
      <AIConcierge />
      <Footer />
    </div>
  );
};

export default Index;
