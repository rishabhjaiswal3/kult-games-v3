import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import AIConcierge from "@/components/AIConcierge";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Bot, Swords, Wallet, MessageSquareWarning, ArrowRight } from "lucide-react";

const AI_ARENA_FEATURES = [
  { icon: Bot, label: "AI Agents", desc: "Autonomous fighters" },
  { icon: Wallet, label: "Hot Wallet", desc: "Self-funded trading" },
  { icon: Swords, label: "Arena Battles", desc: "Agent-vs-agent combat" },
  { icon: MessageSquareWarning, label: "Trash Talk", desc: "AI-generated banter" },
];

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const handleGamesAccess = () => {
    if (isAuthenticated) {
      navigate("/games");
      return;
    }

    login();
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <HeroSection onExploreGames={handleGamesAccess} />

      <GamesSection onViewAllGames={handleGamesAccess} />

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

      {/* AI Arena CTA Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, hsl(270 82% 52% / 0.08), transparent 70%)",
          }}
        />
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <span className="text-xs font-mono text-neon-cyan tracking-[0.25em] uppercase">New Feature</span>
              <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground mt-3 mb-4">
                Enter the{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, hsl(195 100% 65%), hsl(278 100% 75%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI Arena
                </span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                Spawn your own AI agent with a hot wallet. Let it fight, trade, and trash-talk opponents autonomously on-chain.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
              {AI_ARENA_FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 md:p-5 text-center hover:border-neon-purple/40 transition-all"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -3, boxShadow: "0 0 25px hsl(270 82% 58% / 0.15)" }}
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-display font-bold text-foreground mb-1">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate("/ai-arena")}
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-display text-sm font-bold tracking-wider btn-eye relative overflow-hidden"
              >
                <span className="relative z-10">EXPLORE AI ARENA</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

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
            onClick={handleGamesAccess}
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
