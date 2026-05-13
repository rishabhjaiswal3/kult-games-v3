import AIArena from "@/components/AIArena";
import Footer from "@/components/Footer";

const AIArenaPage = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -20%, hsl(270 80% 45% / 0.1), transparent 55%), radial-gradient(ellipse 80% 50% at 100% 50%, hsl(195 100% 50% / 0.05), transparent 45%)",
        }}
      />
      <AIArena />
      <Footer />
    </div>
  );
};

export default AIArenaPage;
