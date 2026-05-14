import {
  ArrowLeft,
  Play,
  Download,
  Star,
  Clock,
  Users,
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Sparkles,
  ShoppingBag,
  Trophy,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Game } from "@/types/api";
import type { LucideIcon } from "lucide-react";

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

function GameDetailGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-35"
      style={{
        background:
          "radial-gradient(ellipse 100% 70% at 20% -10%, hsl(195 100% 45% / 0.12), transparent 50%), radial-gradient(ellipse 70% 50% at 100% 40%, hsl(278 88% 55% / 0.1), transparent 45%)",
      }}
    />
  );
}

type FactItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
};

function StatPill({ label, value, icon: Icon, accent }: FactItem) {
  return (
    <div className="arena-stat-card flex min-w-0 flex-col gap-1.5 rounded-xl border border-white/[0.08] bg-background/35 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", accent)} aria-hidden />
        <span className="font-display text-[9px] tracking-[0.14em] text-muted-foreground">{label}</span>
      </div>
      <p className="truncate font-display text-sm font-black text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

function GlanceRow({ fact }: { fact: FactItem }) {
  const Icon = fact.icon;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-card/40 px-3 py-2.5">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", fact.accent)} />
        {fact.label}
      </span>
      <span className="text-sm font-semibold text-foreground">{fact.value}</span>
    </div>
  );
}

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);

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
    }, 4500);
    return () => window.clearInterval(timer);
  }, [galleryImages.length]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-background">
        <div className="pointer-events-none fixed inset-0 neural-grid opacity-[0.06]" />
        <section className="relative z-10 px-4 pb-16 pt-24 md:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-10 w-28 rounded-full" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
              <div className="glass-panel space-y-4 rounded-2xl p-6 sm:p-8">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-12 w-3/4 max-w-md" />
                <Skeleton className="h-20 w-full max-w-xl" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
                <Skeleton className="h-12 w-40 rounded-full" />
              </div>
              <Skeleton className="min-h-[320px] rounded-2xl lg:min-h-[400px]" />
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
          <div className="glass-panel rounded-2xl px-8 py-10 text-center">
            <Gamepad2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h1 className="mb-2 font-display text-2xl font-black uppercase">Game Not Found</h1>
            <p className="mb-6 text-sm text-muted-foreground">This title isn&apos;t in the catalog right now.</p>
            <button
              type="button"
              onClick={() => navigate("/games")}
              className="btn-eye px-6 py-2.5 font-display text-xs font-bold tracking-wider"
            >
              BROWSE GAMES
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = getGameName(game.name);
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
  const showcaseSrc = galleryImages[galleryIndex] ?? image;

  const prevGallery = () => {
    setGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const facts: FactItem[] = [
    game.rating != null
      ? { label: "Rating", value: String(game.rating), icon: Star, accent: "text-[hsl(var(--gold))]" }
      : null,
    sessionLength
      ? { label: "Session", value: sessionLength, icon: Clock, accent: "text-neon-cyan" }
      : null,
    players
      ? { label: "Players", value: players, icon: Users, accent: "text-neon-cyan" }
      : null,
    { label: "Chain", value: chain, icon: Shield, accent: "text-neon-purple" },
  ].filter((f): f is FactItem => f !== null);

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
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <AutoPlayVideo
          src={video}
          loop
          className={cn("absolute inset-0 h-full w-full object-cover", videoFailed ? "opacity-0" : "opacity-[0.14]")}
          onError={() => setVideoFailed(true)}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/88 to-background" />
        <div className="neural-grid absolute inset-0 opacity-[0.07]" />
        <GameDetailGlow />
      </div>

      <div className="relative z-10">
        <section className="px-4 pb-8 pt-24 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-mono tracking-[0.2em] text-muted-foreground transition hover:border-neon-cyan/35 hover:text-neon-cyan"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              BACK
            </button>

            <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)] lg:gap-8">
              <div className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-7 lg:p-8">
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{ background: "var(--gradient-glow)" }}
                />
                <div className="relative">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-neon-cyan" aria-hidden />
                      <span className="font-display text-[10px] tracking-[0.28em] text-neon-cyan sm:text-xs">
                        GAME SPOTLIGHT
                      </span>
                    </div>
                    {game.category ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {game.category}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider",
                        downloadable
                          ? "border-neon-purple/30 bg-neon-purple/10 text-neon-purple"
                          : "border-neon-green/30 bg-neon-green/10 text-neon-green"
                      )}
                    >
                      {downloadable ? "DOWNLOAD" : "BROWSER PLAY"}
                    </span>
                  </div>

                  <h1 className="font-display text-[clamp(1.75rem,4.5vw,3.25rem)] font-black leading-[0.95] tracking-tight text-foreground">
                    {title.split(" ").map((word, i, words) => (
                      <span key={i} className="mr-[0.2em] inline-block">
                        {i === words.length - 1 ? <span className="text-gradient-hero">{word}</span> : word}
                      </span>
                    ))}
                  </h1>

                  {game.slogan ? (
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {game.slogan}
                    </p>
                  ) : null}

                  {facts.length > 0 ? (
                    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {facts.map((fact) => (
                        <StatPill key={fact.label} {...fact} />
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-8 flex flex-wrap gap-3">
                    {downloadable ? (
                      <button
                        type="button"
                        onClick={handleDownloadClick}
                        className="btn-eye inline-flex items-center gap-2 px-6 py-3 font-display text-xs font-bold tracking-wider sm:text-sm"
                      >
                        <Download className="h-4 w-4" />
                        DOWNLOAD
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePlayAccess}
                        className="btn-eye inline-flex items-center gap-2 px-6 py-3 font-display text-xs font-bold tracking-wider sm:text-sm"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        PLAY NOW
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate("/marketplace")}
                      className="btn-eye-outline inline-flex items-center gap-2 px-5 py-3 font-display text-xs font-bold tracking-wider"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      MARKETPLACE
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/leaderboard")}
                      className="btn-eye-outline inline-flex items-center gap-2 px-5 py-3 font-display text-xs font-bold tracking-wider"
                    >
                      <Trophy className="h-4 w-4" />
                      LEADERBOARD
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/[0.1] p-2 sm:p-3">
                <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[hsl(268_32%_6%/0.6)]">
                  <div className="relative aspect-[4/3] sm:aspect-video">
                    {showcaseSrc ? (
                      <img
                        src={showcaseSrc}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Gamepad2 className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                  </div>

                  {galleryImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={prevGallery}
                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-background/80 p-2 text-foreground backdrop-blur-sm transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                        aria-label="Previous screenshot"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextGallery}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-background/80 p-2 text-foreground backdrop-blur-sm transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                        aria-label="Next screenshot"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {galleryImages.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setGalleryIndex(i)}
                            aria-label={`Go to screenshot ${i + 1}`}
                            className={cn(
                              "h-2 rounded-full transition-all",
                              galleryIndex === i
                                ? "w-6 bg-neon-cyan shadow-[0_0_10px_hsl(195_100%_60%/0.5)]"
                                : "w-2 bg-white/30 hover:bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                {galleryImages.length > 1 ? (
                  <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    {galleryImages.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setGalleryIndex(i)}
                        className={cn(
                          "overflow-hidden rounded-md border transition",
                          galleryIndex === i
                            ? "border-neon-cyan/60 ring-1 ring-neon-cyan/30"
                            : "border-white/10 hover:border-white/25"
                        )}
                      >
                        <img
                          src={src}
                          alt={`${title} thumbnail ${i + 1}`}
                          className="aspect-video w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {about ? (
          <section className="px-4 py-6 md:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="glass-panel rounded-2xl p-5 sm:p-7 lg:p-8">
                <div className="mb-6 flex flex-col gap-2 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-1 font-display text-[10px] tracking-[0.28em] text-neon-cyan">OVERVIEW</p>
                    <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">About the game</h2>
                  </div>
                  <p className="max-w-md text-sm text-muted-foreground">What to expect before you jump in.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.6fr)]">
                  <div className="space-y-4">
                    {about.split("\n\n").filter(Boolean).map((para, i) => (
                      <p key={i} className="text-sm leading-7 text-muted-foreground sm:text-[15px] sm:leading-8">
                        {para.trim()}
                      </p>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-background/40 p-4 sm:p-5">
                    <p className="mb-3 font-display text-[10px] tracking-[0.22em] text-neon-cyan">AT A GLANCE</p>
                    <div className="space-y-2">
                      {facts.map((fact) => (
                        <GlanceRow key={`glance-${fact.label}`} fact={fact} />
                      ))}
                      {game.platform?.length ? (
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-card/40 px-3 py-2.5">
                          <span className="text-xs text-muted-foreground">Platform</span>
                          <span className="text-sm font-semibold text-foreground">{game.platform.join(", ")}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {features.length > 0 ? (
          <section className="px-4 py-6 md:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="glass-panel rounded-2xl p-5 sm:p-7 lg:p-8">
                <div className="mb-6 border-b border-white/[0.08] pb-5">
                  <p className="mb-1 font-display text-[10px] tracking-[0.28em] text-neon-cyan">FEATURES</p>
                  <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">Why it stands out</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="flex gap-3 rounded-xl border border-white/[0.08] bg-background/35 p-4 transition hover:border-neon-cyan/20"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neon-cyan/10 text-neon-cyan">
                        <Zap className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-6 text-foreground/90">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="px-4 py-8 pb-24 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="glass-panel relative overflow-hidden rounded-2xl border border-neon-cyan/15 p-5 sm:p-7">
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(195 100% 45% / 0.12), transparent 50%, hsl(278 88% 55% / 0.08))",
                }}
              />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-1 font-display text-[10px] tracking-[0.24em] text-neon-cyan">
                    {downloadable ? "DESKTOP BUILD" : "READY TO PLAY"}
                  </p>
                  <h3 className="font-display text-xl font-black text-foreground sm:text-2xl">
                    {downloadable ? `Get ${title} on your machine` : `Launch ${title} now`}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                    {downloadable
                      ? "Download the build and install locally — no extra steps on this page."
                      : "Sign in and jump straight into the browser experience."}
                  </p>
                </div>
                {downloadable ? (
                  <button
                    type="button"
                    onClick={handleDownloadClick}
                    className="btn-eye inline-flex shrink-0 items-center gap-2 px-7 py-3 font-display text-xs font-bold tracking-wider sm:text-sm"
                  >
                    <Download className="h-4 w-4" />
                    DOWNLOAD
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePlayAccess}
                    className="btn-eye inline-flex shrink-0 items-center gap-2 px-7 py-3 font-display text-xs font-bold tracking-wider sm:text-sm"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    PLAY NOW
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default GameDetail;
