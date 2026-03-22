import { motion } from "framer-motion";
import { ArrowLeft, Play, Star, Clock, Users, Share2, Zap, Shield } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesApi } from "@/api/gamesApi";
import { useAuth } from "@/contexts/AuthContext";
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
  const { isAuthenticated } = useAuth();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => gamesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-background">
        <Navbar />
        <section className="px-4 pb-16 pt-20 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-10 w-28 rounded-full" />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-full" />
                <Skeleton className="h-24 w-full max-w-2xl" />
                <Skeleton className="h-20 w-full max-w-xl" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </div>
              </div>
              <Skeleton className="min-h-[420px] rounded-[32px]" />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">
            <h1 className="mb-4 font-display text-3xl font-bold uppercase">Game Not Found</h1>
            <button onClick={() => navigate("/")} className="text-primary hover:underline">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = getGameName(game.name);
  const titleWords = title.split(" ");
  const image = getGameImage(game);
  const meta = game.metadata ?? {};
  const about =
    (meta.long_description as string) ??
    game.about ??
    getGameDescription(game.description) ??
    game.slogan ??
    "";
  const features: string[] = (meta.features as string[]) ?? [];
  const sessionLength = (meta.session_length as string) ?? "";
  const players = (meta.players as string) ?? "";
  const chain = (meta.chain as string) ?? "0G Chain";
  const video = (meta.video as string) ?? "/videos/SC_10.mp4";
  const platforms = (game.platform ?? []).filter(Boolean);
  const aboutPreview = about.split("\n\n").map((para) => para.trim()).filter(Boolean)[0] ?? "";

  const highlightChips = [game.category, chain, ...platforms.slice(0, 2), "Free to play"].filter(Boolean) as string[];
  const facts = [
    game.rating != null
      ? {
          label: "Rating",
          value: String(game.rating),
          icon: <Star className="h-4 w-4 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />,
        }
      : null,
    sessionLength
      ? {
          label: "Session",
          value: sessionLength,
          icon: <Clock className="h-4 w-4 text-neon-cyan" />,
        }
      : null,
    players
      ? {
          label: "Players",
          value: players,
          icon: <Users className="h-4 w-4 text-neon-cyan" />,
        }
      : null,
    {
      label: "Chain",
      value: chain,
      icon: <Shield className="h-4 w-4 text-neon-cyan" />,
    },
  ].filter(Boolean);

  const handlePlayAccess = () => {
    if (isAuthenticated) {
      navigate(`/game/${id}/play`);
      return;
    }

    navigate("/?login=1");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(195_100%_60%/0.12),transparent_28%),radial-gradient(circle_at_85%_20%,hsl(270_80%_65%/0.14),transparent_22%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/96 to-background" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 md:px-8 lg:px-12">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-2 text-[11px] font-mono tracking-[0.2em] text-muted-foreground backdrop-blur-md transition-colors hover:border-neon-cyan/30 hover:text-neon-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK
          </motion.button>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="order-2 lg:order-1"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {highlightChips.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-card/70 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-foreground/80"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <h1 className="mb-4 font-display text-4xl font-black uppercase leading-[0.92] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                {titleWords.map((word, i) => (
                  <span key={i} className="mr-[0.18em] inline-block last:mr-0">
                    {i < titleWords.length - 1 ? <span className="gradient-text">{word}</span> : word}
                  </span>
                ))}
              </h1>

              {game.slogan && (
                <p className="mb-4 max-w-2xl text-base leading-7 text-foreground/90 sm:text-lg">
                  {game.slogan}
                </p>
              )}

              {aboutPreview && (
                <p className="mb-8 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {aboutPreview}
                </p>
              )}

              <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-white/10 bg-card/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      {fact.icon}
                      {fact.label}
                    </div>
                    <div className="text-sm font-semibold text-foreground sm:text-base">{fact.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlayAccess}
                  className="relative flex items-center gap-3 overflow-hidden rounded-2xl px-8 py-4 font-display text-sm font-bold tracking-[0.18em] btn-eye"
                >
                  <Play className="relative z-10 h-5 w-5 fill-current" />
                  <span className="relative z-10">PLAY FREE</span>
                </motion.button>

                <button
                  onClick={() => navigator.share?.({ title, url: window.location.href })}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-card/60 text-muted-foreground transition-colors hover:border-neon-cyan/30 hover:text-neon-cyan"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="order-1 lg:order-2"
            >
              <div className="rounded-[28px] border border-white/10 bg-card/55 p-3 shadow-[0_24px_80px_hsl(220_60%_2%/0.45)]">
                <div className="rounded-[22px] bg-background/70 p-3">
                  <div className="relative overflow-visible pb-20 sm:pb-24 md:pb-28">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-white/10">
                      <AutoPlayVideo src={video} loop className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-background/10" />
                      <div className="absolute left-4 top-4 rounded-full bg-background/75 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan">
                        Gameplay
                      </div>
                    </div>

                    {image && (
                      <div className="absolute bottom-0 left-1/2 z-10 w-[52%] max-w-[260px] -translate-x-1/2 translate-y-[36%] sm:w-[46%] md:left-auto md:right-6 md:translate-x-0 md:translate-y-[34%]">
                        <div className="rounded-[24px] border border-white/10 bg-background/95 p-2 shadow-[0_20px_60px_hsl(220_80%_2%/0.55)]">
                          <div className="overflow-hidden rounded-[18px] ai-border-glow">
                            <img src={image} alt={title} className="block w-full object-cover" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {(highlightChips.length > 0 || features.length > 0) && (
        <section className="px-4 pb-8 md:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 rounded-[24px] border border-white/10 bg-card/45 p-4 sm:p-5">
            {highlightChips.map((item) => (
              <div
                key={`${item}-chip`}
                className="rounded-full border border-neon-cyan/20 bg-neon-cyan/8 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-neon-cyan/90"
              >
                {item}
              </div>
            ))}
            {features.slice(0, 3).map((feature) => (
              <div
                key={feature}
                className="rounded-full border border-white/10 bg-background/60 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.16em] text-foreground/75"
              >
                {feature}
              </div>
            ))}
          </div>
        </section>
      )}

      {about && (
        <section className="px-4 py-10 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-card/45 p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.3em] text-neon-cyan/70">Overview</p>
                <h2 className="font-display text-3xl font-black uppercase tracking-[-0.03em] text-foreground">About The Game</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Core information, tone, and what players should expect.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
              <div className="space-y-5">
                {about.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="text-sm leading-8 text-muted-foreground sm:text-base">
                    {para.trim()}
                  </p>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-background/55 p-5">
                <p className="mb-4 text-[11px] font-mono uppercase tracking-[0.24em] text-neon-cyan/70">Quick Facts</p>
                <div className="space-y-3">
                  {facts.map((fact) => (
                    <div key={`${fact.label}-side`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card/60 px-4 py-3">
                      <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">{fact.label}</span>
                      <span className="text-sm font-semibold text-foreground">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section className="px-4 py-10 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-card/45 p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.3em] text-neon-cyan/70">Features</p>
                <h2 className="font-display text-3xl font-black uppercase tracking-[-0.03em] text-foreground">Why It Stands Out</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                The strongest hooks and gameplay elements surfaced in a cleaner grid.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div key={feature} className="rounded-[22px] border border-white/10 bg-background/55 p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                    <Zap className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-7 text-foreground/85">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-10 pb-24 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-neon-cyan/15 bg-[linear-gradient(135deg,hsl(220_45%_11%/0.92),hsl(220_42%_8%/0.96))] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.3em] text-neon-cyan/70">Ready To Jump In</p>
              <h3 className="font-display text-2xl font-black uppercase tracking-[-0.03em] text-foreground sm:text-3xl">
                Start playing {title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                No extra clutter. Just launch the game and get straight into the experience.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlayAccess}
              className="relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 py-4 font-display text-sm font-bold tracking-[0.18em] btn-eye"
            >
              <Play className="relative z-10 h-5 w-5 fill-current" />
              <span className="relative z-10">PLAY NOW</span>
            </motion.button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GameDetail;
