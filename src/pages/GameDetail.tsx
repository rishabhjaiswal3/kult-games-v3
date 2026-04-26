import { ArrowLeft, Play, Download, Star, Clock, Users, Zap, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesApi } from "@/api/gamesApi";
import { useAuth } from "@/contexts/AuthContext";
import { isGameDownloadable, gameDownloadUrl } from "@/lib/gameDownload";
import { triggerBrowserDownload } from "@/lib/triggerBrowserDownload";
import type { Game } from "@/types/api";

const GAME_FALLBACK_INTROS: Record<string, string> = {
  "highway-hustle":
    "Highway Hustle drops you into a neon-soaked expressway where reaction time is everything. Race through procedurally generated traffic, collect power-ups, and chain multipliers to dominate the on-chain leaderboard. Every run is recorded — your best time lives forever on 0G.",
  "robo-wars":
    "Robo Wars is a real-time PvP battle arena where you assemble a custom combat robot and clash with opponents worldwide. Upgrade your chassis, swap weapon modules, and unleash special abilities earned through on-chain progression. No two bots are alike — and the arena never sleeps.",
};

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
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => gamesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const image = game ? getGameImage(game) : "";
  const galleryImages: string[] = game
    ? [
        ...(game.images ?? []).map((img) => img.url).filter(Boolean),
        ...(image ? [image] : []),
      ]
        .filter((url, i, arr) => url && arr.indexOf(url) === i)
        .slice(0, 8)
    : [];

  useEffect(() => {
    setGalleryIndex(0);
  }, [id]);

  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [galleryImages.length]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-background">
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
  const meta = game.metadata ?? {};
  const about =
    (meta.long_description as string) ??
    game.about ??
    getGameDescription(game.description) ??
    game.slogan ??
    GAME_FALLBACK_INTROS[id ?? ""] ??
    "";
  const features: string[] = (meta.features as string[]) ?? [];
  const sessionLength = (meta.session_length as string) ?? "";
  const players = (meta.players as string) ?? "";
  const chain = (meta.chain as string) ?? "0G Chain";
  const video = (meta.video as string) ?? "/videos/SC_10.mp4";
  const prevGallery = () => {
    setGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };
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

  const downloadable = isGameDownloadable(game);
  const downloadHref = gameDownloadUrl(game);

  const handlePlayAccess = () => {
    if (isAuthenticated) {
      navigate(`/game/${id}/play`);
      return;
    }

    navigate("/?login=1");
  };

  const handleDownloadClick = () => {
    triggerBrowserDownload(downloadHref);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <section className="relative z-40 mt-[60px] px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-visible rounded-[30px] border border-white/10 bg-[hsl(222_30%_8%_/0.72)] shadow-[0_24px_80px_hsl(220_60%_2%/0.4)] backdrop-blur-xl">
          <div className="relative">
            <AutoPlayVideo src={video} loop className="absolute inset-0 h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background/92" />

            <div className="relative z-10 p-5 sm:p-7 lg:p-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-mono tracking-[0.2em] text-muted-foreground transition hover:border-white/20 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                BACK
              </button>

              <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.28em] text-neon-cyan/75">Game Spotlight</p>
              <h1 className="pr-20 font-display text-2xl font-black uppercase leading-[0.95] tracking-[-0.03em] text-foreground sm:pr-0 sm:text-4xl lg:text-5xl">
                {titleWords.map((word, i) => (
                  <span key={i} className="mr-[0.18em] inline-block last:mr-0">
                    {i < titleWords.length - 1 ? <span className="gradient-text">{word}</span> : word}
                  </span>
                ))}
              </h1>
              {game.slogan ? <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{game.slogan}</p> : null}

              <div className="relative mt-10">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent" />
                {image ? (
                  <div className="pointer-events-none absolute -right-2 top-0 z-50 w-[54%] max-w-[360px] -translate-y-[56%] sm:-right-5 sm:max-w-[420px]">
                    <div className="rounded-[24px] border border-white/10 bg-background/95 p-2 shadow-[0_16px_40px_hsl(220_60%_2%/0.45)]">
                      <div className="overflow-hidden rounded-[18px] border border-cyan-400/25">
                        <img
                          src={image}
                          alt={title}
                          className="block h-auto w-full object-contain"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
      {about && (
        <section className="relative z-30 px-4 py-10 md:px-8 lg:px-12">
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
        <section className="relative z-30 px-4 py-10 md:px-8 lg:px-12">
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

      {/* Gamer Gallery */}
      {galleryImages.length > 0 && (
        <section className="relative z-30 px-4 py-10 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-card/45 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-6">
              <div>
                <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.3em] text-neon-cyan/70">Screenshots</p>
                <h2 className="font-display text-3xl font-black uppercase tracking-[-0.03em] text-foreground">Gamer Gallery</h2>
              </div>
              <p className="hidden max-w-xs text-sm leading-6 text-muted-foreground sm:block">
                In-game captures straight from the arena.
              </p>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-background/55 shadow-[0_8px_24px_hsl(220_60%_2%/0.35)]">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={galleryImages[galleryIndex]}
                    alt={`${title} screenshot ${galleryIndex + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prevGallery}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-background/70 p-2 text-foreground transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextGallery}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-background/70 p-2 text-foreground transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>
            {galleryImages.length > 1 ? (
              <div className="mt-3 flex items-center justify-center gap-2">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    aria-label={`Go to screenshot ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all ${galleryIndex === i ? "w-7 bg-neon-cyan shadow-[0_0_10px_hsl(195_100%_60%/0.55)]" : "w-2.5 bg-white/25 hover:bg-white/40"}`}
                  />
                ))}
              </div>
            ) : null}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {galleryImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGalleryIndex(i)}
                  className={`overflow-hidden rounded-lg border transition ${galleryIndex === i ? "border-neon-cyan/60 shadow-[0_0_18px_hsl(195_100%_60%/0.2)]" : "border-white/10 hover:border-white/25"}`}
                >
                  <img src={src} alt={`${title} thumbnail ${i + 1}`} className="aspect-video w-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative z-30 px-4 py-10 pb-24 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-neon-cyan/15 bg-[linear-gradient(135deg,hsl(220_45%_11%/0.92),hsl(220_42%_8%/0.96))] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.3em] text-neon-cyan/70">
                {downloadable ? "Desktop build" : "Ready To Jump In"}
              </p>
              <h3 className="font-display text-2xl font-black uppercase tracking-[-0.03em] text-foreground sm:text-3xl">
                {downloadable ? `Download ${title}` : `Start playing ${title}`}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {downloadable
                  ? "This title installs on your machine. Grab the build below — you stay on this page while the file opens or saves."
                  : "No extra clutter. Just launch the game and get straight into the experience."}
              </p>
            </div>

            {downloadable ? (
              <button
                type="button"
                onClick={handleDownloadClick}
                className="relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 py-4 font-display text-sm font-bold tracking-[0.18em] btn-eye transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="relative z-10 h-5 w-5" />
                <span className="relative z-10">DOWNLOAD</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlayAccess}
                className="relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 py-4 font-display text-sm font-bold tracking-[0.18em] btn-eye transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="relative z-10 h-5 w-5 fill-current" />
                <span className="relative z-10">PLAY NOW</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GameDetail;
