import AIArena from "@/components/AIArena";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";

const AIArenaPage = () => {
  return (
    <div className="min-h-screen bg-transparent relative pt-3 sm:pt-4">
      <div className="fixed inset-0 pointer-events-none z-0">
        <AutoPlayVideo src="/videos/SC_10.mp4" loop className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background/92" />
      </div>
      <AIArena />
      <Footer />
    </div>
  );
};

export default AIArenaPage;
