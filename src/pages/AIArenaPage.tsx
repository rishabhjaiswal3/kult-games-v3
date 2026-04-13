import Navbar from "@/components/Navbar";
import AIArena from "@/components/AIArena";
import Footer from "@/components/Footer";

const AIArenaPage = () => {
  return (
    <div className="min-h-screen bg-background relative pt-3 sm:pt-4">
      <Navbar />
      <AIArena />
      <Footer />
    </div>
  );
};

export default AIArenaPage;
