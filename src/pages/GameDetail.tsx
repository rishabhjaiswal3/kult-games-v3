import { motion } from "framer-motion";
import { ArrowLeft, Play, Star, Clock, Users, Trophy, Share2, Zap, Shield, Gamepad2, ExternalLink } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIScanLine from "@/components/AIScanLine";
import NeuralPulse from "@/components/NeuralPulse";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesApi } from "@/api/gamesApi";
import type { Game } from "@/types/api";

function getGameName(name: Game["name"]): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
}

function getGameDescription(desc: Game["description"]): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  return desc?.en ?? Object.values(desc)[0] ?? "";
}

function getGameImage(game: Game): string {
  return (
    game.thumbnail?.horizontal?.url ??
    game.thumbnail?.vertical?.url ??
    game.image_url ??
    game.images?.[0]?.url ??
    ""
  );
}

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => gamesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        <Navbar />
        <section className="relative z-10 pt-16">
          <div className="relative min-h-[70vh] overflow-hidden flex items-end">
            <Skeleton className="absolute inset-0 rounded-none" />
            <div className="relative w-full p-6 md:p-12 pb-10 space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-16 w-2/3" />
              <Skeleton className="h-5 w-96 max-w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-12" />
              </div>
            </div>
          </div>
          <div className="w-full px-6 md:px-8 xl:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Game Not Found</h1>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  const title = getGameName(game.name);
  const description = getGameDescription(game.description) || game.slogan || "";
  const image = getGameImage(game);
  const meta = game.metadata ?? {};
  const g = game as unknown as Record<string, unknown>;
  const longDescription = (meta.long_description as string)
    ?? (g.long_description as string)
    ?? (g.about as string)
    ?? description;
  const features: string[] = (meta.features as string[])
    ?? (g.features as string[])
    ?? [];
  const sessionLength = (meta.session_length as string) ?? (g.session_length as string) ?? "";
  const skillLevel = (meta.skill_level as string) ?? (g.skill_level as string) ?? "";
  const players = (meta.players as string) ?? (g.players as string) ?? "";
  const chain = (meta.chain as string) ?? (g.chain as string) ?? "0G Chain";
  const playUrl = (meta.play_url as string) ?? (g.play_url as string) ?? "";
  const video = (meta.video as string) ?? (g.video as string) ?? "/videos/SC_10.mp4";

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <ParticleField />
      <Navbar />

      {/* Cinematic video hero - matching site theme */}
      <section className="relative z-10">
        <div className="relative min-h-[70vh] overflow-hidden flex items-end">
          {/* Video background instead of static image */}
          <AutoPlayVideo src={video} loop className="absolute inset-0 w-full h-full object-cover opacity-30" />

          {/* Multi-layer overlays matching site theme */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/50" />

          <AIScanLine />
          <NeuralPulse />

          {/* Ambient glows */}
          <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/5 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />

          {/* Neon border bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent" style={{ boxShadow: "0 0 15px hsl(195 100% 60% / 0.3)" }} />

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="absolute top-24 left-6 flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm text-foreground hover:text-neon-cyan hover:shadow-[0_0_10px_hsl(195_100%_60%/0.2)] transition-all z-10"
          >
            <ArrowLeft className="w-4 h-4" /> BACK
          </motion.button>

          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 right-6 z-10"
          >
            <span className="px-3 py-1.5 rounded-full text-[10px] font-display font-bold tracking-[0.2em] btn-eye border-0" style={{ boxShadow: "0 0 14px hsl(270 82% 55% / 0.4)" }}>
              {game.category}
            </span>
          </motion.div>

          {/* Hero content overlay */}
          <div className="relative w-full p-6 md:p-12 pb-10">
            <div className="w-full max-w-[100vw] px-0 md:px-2 xl:px-6">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                {/* AI status */}
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-neon-cyan"
                    animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-mono text-neon-cyan/70 tracking-[0.3em] uppercase">
                    GAME LOADED • {chain}
                  </span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black text-foreground tracking-tight leading-none mb-3 glow-text">
                  {title.toUpperCase()}
                </h1>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-6">
                  {description}
                </p>

                {/* Quick stats row */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                    <span className="font-display text-sm font-bold text-foreground">{game.rating}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{sessionLength}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{players}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">{skillLevel}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-4">
                  <a
                    href={playUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 md:px-10 py-3.5 md:py-4 rounded-lg font-display text-sm font-semibold tracking-wider btn-eye flex items-center gap-3 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <Play className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">PLAY GAME</span>
                  </a>
                  <button className="w-12 h-12 rounded-lg glass-panel flex items-center justify-center hover:border-neon-cyan/50 hover:text-neon-cyan hover:shadow-[0_0_15px_hsl(195_100%_60%/0.2)] transition-all">
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Game details section with video bg */}
        <div className="relative">
          <AutoPlayVideo src={video} loop className="absolute inset-0 w-full h-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 bg-background/90" />

          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[250px] rounded-full bg-neon-cyan/4 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-[100vw] px-6 md:px-8 xl:px-12 py-12 md:py-16 relative z-10 overflow-x-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              {/* Main content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full" style={{ boxShadow: "0 0 8px hsl(195 100% 50% / 0.5)" }} />
                    <h2 className="font-display text-xl font-bold text-foreground tracking-wider">ABOUT</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {longDescription || title}
                  </p>
                </motion.div>

                {features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-10"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-neon-cyan rounded-full" style={{ boxShadow: "0 0 8px hsl(195 100% 60% / 0.5)" }} />
                    <h2 className="font-display text-xl font-bold text-foreground tracking-wider">FEATURES</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature: string, i: number) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group rounded-xl p-4 flex items-center gap-4 border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_15px_hsl(195_100%_50%/0.08)] transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors" style={{ boxShadow: "0 0 10px hsl(195 100% 50% / 0.1)" }}>
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                )}

                {/* Game preview with actual game image */}
                {image && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-10"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-neon-cyan rounded-full" style={{ boxShadow: "0 0 8px hsl(195 100% 60% / 0.5)" }} />
                    <h2 className="font-display text-xl font-bold text-foreground tracking-wider">PREVIEW</h2>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/50 relative group">
                    <img
                      src={image}
                      alt={`${title} preview`}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 group-hover:shadow-[inset_0_0_20px_hsl(195_100%_50%/0.1)] rounded-xl transition-all duration-300" />
                  </div>
                </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="sticky top-24 space-y-6"
                >
                  <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                    <div className="relative h-36 overflow-hidden">
                      <img src={image} alt={title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-bold text-foreground">{title}</span>
                        <span className="text-xs font-mono text-primary tracking-wider text-glow-cyan">FREE</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono tracking-wider">PLATFORM</span>
                        <div className="flex gap-1.5 ml-auto">
                          {(game.platform ?? []).map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold bg-muted text-muted-foreground">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono tracking-wider">CHAIN</span>
                        <span className="text-xs text-neon-cyan font-display font-semibold ml-auto text-glow-cyan">{chain}</span>
                      </div>

                      <div className="h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

                      <a
                        href={playUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-6 py-3 rounded-lg font-display text-sm font-semibold tracking-wider btn-eye flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        PLAY GAME
                      </a>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-xs font-display font-bold text-foreground tracking-wider">POWERED BY</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This game runs on the <span className="text-neon-cyan font-semibold text-glow-cyan">0G Chain</span> — a decentralized AI compute network enabling trustless, verifiable gaming with on-chain rewards.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GameDetail;
