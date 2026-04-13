import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import AIConcierge from "@/components/AIConcierge";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";
import AgentWalletModal from "@/components/AgentWalletModal";
import { HomePageSkeleton } from "@/components/skeleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Wallet } from "lucide-react";
import aiArenaHero from "@/assets/ai-arena-hero.jpg";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gamesApi } from "@/api/gamesApi";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { isPending, data: gamesBootstrap } = useQuery({
    queryKey: ["games", "all"],
    queryFn: () => gamesApi.getAll(1, 10),
    staleTime: 5 * 60_000,
  });

  const showHomeSkeleton = isPending && gamesBootstrap === undefined;

  const handleGamesAccess = () => {
    if (isAuthenticated) {
      navigate("/games");
      return;
    }
    login();
  };

  return (
    <div className="min-h-screen bg-background relative pt-2 sm:pt-3">
      <Navbar />
      {showHomeSkeleton ? (
        <HomePageSkeleton />
      ) : (
        <>
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

          {/* AI Arena — Visual CTA Section */}
          <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Ambient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, hsl(195 100% 50% / 0.05), transparent 50%), radial-gradient(ellipse at 70% 50%, hsl(270 82% 52% / 0.06), transparent 50%)",
          }}
        />

        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Two-column layout: image + content */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Image side */}
              <motion.div
                className="relative rounded-2xl overflow-hidden group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: "20px",
                    border: "1px solid hsl(270 80% 60% / 0.15)",
                    boxShadow: "0 20px 60px hsl(220 50% 4% / 0.5), 0 0 40px hsl(270 82% 58% / 0.08)",
                  }}
                >
                  <img
                    src={aiArenaHero}
                    alt="AI Arena - autonomous agents battling on-chain"
                    className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    width={1280}
                    height={640}
                  />
                  {/* Overlay gradient */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 50%, hsl(220 45% 6% / 0.7) 100%), linear-gradient(90deg, hsl(220 45% 6% / 0.3), transparent 50%)",
                    }}
                  />
                  {/* Live badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5" style={{ borderRadius: "10px", background: "hsl(220 45% 8% / 0.7)", border: "1px solid hsl(270 80% 60% / 0.25)", backdropFilter: "blur(8px)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(150 100% 60%)", boxShadow: "0 0 6px hsl(150 100% 60%)" }}>
                      <div className="w-full h-full rounded-full animate-ping" style={{ background: "hsl(150 100% 60%)" }} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-foreground">Live Arena</span>
                  </div>
                </div>
              </motion.div>

              {/* Content side */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span
                  className="text-xs font-mono tracking-[0.25em] uppercase mb-3 inline-block"
                  style={{ color: "hsl(195 100% 65%)" }}
                >
                  New Feature
                </span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
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
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 max-w-md">
                  Spawn your own AI agent with a hot wallet. Let it fight, trade,
                  and trash-talk opponents autonomously on-chain.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    { label: "AI Agents", color: "hsl(270 80% 65%)" },
                    { label: "Hot Wallet", color: "hsl(195 100% 65%)" },
                    { label: "Arena Battles", color: "hsl(270 80% 65%)" },
                    { label: "Trash Talk", color: "hsl(195 100% 65%)" },
                  ].map((pill) => (
                    <span
                      key={pill.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                      style={{
                        borderRadius: "10px",
                        border: `1px solid ${pill.color.replace(")", " / 0.2)")}`,
                        background: `${pill.color.replace(")", " / 0.06)")}`,
                        color: pill.color,
                      }}
                    >
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ background: pill.color }}
                      />
                      {pill.label}
                    </span>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/ai-arena")}
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-display text-sm font-bold tracking-wider btn-eye relative overflow-hidden"
                  >
                    <span className="relative z-10">EXPLORE AI ARENA</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {isAuthenticated && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setWalletModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 font-display text-sm font-bold tracking-wider btn-eye-outline"
                    >
                      <Wallet className="w-4 h-4" />
                      CREATE AGENT WALLET
                    </motion.button>
                  )}
                </div>
              </motion.div>
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
        </>
      )}

      {/* Agent Wallet Modal */}
      <AgentWalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div>
  );
};

export default Index;
