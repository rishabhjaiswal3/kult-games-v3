import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Gamepad2,
  Play,
  Shield,
  ShoppingBag,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesApi } from "@/api/gamesApi";
import { useAuth } from "@/contexts/AuthContext";
import { gameDownloadUrl, hasGameDownloadUrl, isGameDownloadable } from "@/lib/gameDownload";
import { triggerBrowserDownload } from "@/lib/triggerBrowserDownload";
import { getGameDescription, getGameImage, getGameName } from "@/lib/gameDisplay";
import type { Game } from "@/types/api";
import type { LucideIcon } from "lucide-react";

const GAME_FALLBACK_INTROS: Record<string, string> = {
  "highway-hustle":
    "Highway Hustle drops you into a neon-soaked expressway where reaction time is everything. Race through traffic, collect power-ups, and chain multipliers to dominate the on-chain leaderboard.",
  "robo-wars":
    "Robo Wars is a real-time PvP battle arena where you assemble a custom combat robot and clash with opponents worldwide. Upgrade your chassis, swap weapon modules, and unleash special abilities.",
};

type FactItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
};

function buildFacts(game: Game): FactItem[] {
  const meta = game.metadata ?? {};
  const facts: FactItem[] = [];
  if (game.rating != null) {
    facts.push({ label: "Rating", value: String(game.rating), icon: Star, color: "#ffc000" });
  }
  const session = meta.session_length as string | undefined;
  if (session) facts.push({ label: "Session", value: session, icon: Clock, color: "#0089ff" });
  const players = meta.players as string | undefined;
  if (players) facts.push({ label: "Players", value: players, icon: Users, color: "#00f080" });
  facts.push({
    label: "Chain",
    value: (meta.chain as string) ?? "0G Chain",
    icon: Shield,
    color: "#b338ff",
  });
  return facts;
}

function GameDetailSkeleton() {
  return (
    <ArenaPageLayout>
      <Skeleton className="h-9 w-28 rounded" />
      <Skeleton className="min-h-[220px] w-full rounded-lg" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="min-h-[280px] w-full" />
      </div>
    </ArenaPageLayout>
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
    ? [...(game.images ?? []).map((img) => img.url).filter(Boolean), ...(image ? [image] : [])]
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

  if (isLoading) return <GameDetailSkeleton />;

  if (isError || !game) {
    return (
      <ArenaPageLayout>
        <div className="arena-panel border-white/8 px-8 py-14 text-center">
          <Gamepad2 className="mx-auto mb-4 h-10 w-10 text-white/30" />
          <h1 className="font-tech text-xl font-bold uppercase text-white">Game not found</h1>
          <p className="mt-2 text-xs text-white/45">This title isn&apos;t in the catalog right now.</p>
          <button
            type="button"
            onClick={() => navigate("/games")}
            className="btn-primary mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
          >
            Browse games
          </button>
        </div>
      </ArenaPageLayout>
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
  const showcaseSrc = galleryImages[galleryIndex] ?? image;
  const facts = buildFacts(game);
  const downloadable = isGameDownloadable(game);
  const downloadHref = gameDownloadUrl(game);
  const canDownload = hasGameDownloadUrl(game);

  const handlePlayAccess = () => {
    if (isAuthenticated) {
      navigate(`/game/${id}/play`);
      return;
    }
    navigate("/?login=1");
  };

  const handleDownloadClick = () => {
    if (!canDownload) return;
    triggerBrowserDownload(downloadHref);
  };

  const prevGallery = () => {
    setGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <ArenaPageLayout>
      <button
        type="button"
        onClick={() => navigate("/games")}
        className="inline-flex items-center gap-2 rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/55 transition hover:border-purple-500/35 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to games
      </button>

      <article className="arena-panel relative min-h-[200px] overflow-hidden border-white/8">
        {showcaseSrc ? (
          <img src={showcaseSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050913] via-[#050913]/88 to-[#050913]/40" />
        <div className="relative z-10 flex flex-col justify-between gap-6 p-5 sm:flex-row sm:items-end sm:p-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {game.category ? (
                <span className="rounded border border-[#9f2dff]/50 bg-[#5b1499]/35 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#d773ff]">
                  {game.category}
                </span>
              ) : null}
              <span
                className={`rounded border px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider ${
                  downloadable
                    ? "border-amber-500/35 bg-amber-950/50 text-amber-400"
                    : "border-emerald-500/35 bg-emerald-950/50 text-[#00f080]"
                }`}
              >
                {downloadable ? "Downloadable" : "Instant play"}
              </span>
            </div>
            <h1 className="font-tech text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">{title}</h1>
            {game.slogan ? <p className="text-sm text-white/65">{game.slogan}</p> : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {downloadable ? (
              <button
                type="button"
                onClick={handleDownloadClick}
                disabled={!canDownload}
                className="btn-primary inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
              >
                <Download className="h-4 w-4" />
                {canDownload ? "Download" : "Download Soon"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlayAccess}
                className="btn-primary inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
              >
                <Play className="h-4 w-4 fill-current" />
                Play now
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/inventory")}
              className="inline-flex items-center gap-2 rounded border border-white/8 bg-[#0a0f1b]/60 px-4 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 transition hover:border-purple-500/35"
            >
              <ShoppingBag className="h-4 w-4" />
              Inventory
            </button>
          </div>
        </div>
      </article>

      <div className="arena-panel grid grid-cols-2 divide-x divide-white/8 overflow-hidden sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-white/[0.04]">
              <fact.icon className="h-5 w-5" style={{ color: fact.color }} />
            </div>
            <div className="min-w-0">
              <div className="font-tech text-[9px] text-white/48">{fact.label}</div>
              <div className="truncate text-lg font-semibold text-white">{fact.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          {about ? (
            <div className="arena-panel space-y-4 border-white/8 bg-[#04080f]/95 p-5">
              <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">About the game</h2>
              <div className="space-y-3 text-sm leading-relaxed text-white/60">
                {about.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            </div>
          ) : null}

          {features.length > 0 ? (
            <div className="arena-panel space-y-4 border-white/8 bg-[#04080f]/95 p-5">
              <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Features</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex gap-3 rounded-lg border border-white/8 bg-[#0a0f1b]/50 p-3"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-purple-500/10 text-purple-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <p className="text-xs leading-relaxed text-white/75">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="arena-panel flex flex-wrap items-center justify-between gap-4 border-white/8 bg-[#04080f]/95 p-5">
            <div>
              <p className="font-tech text-[10px] uppercase tracking-wider text-[#d773ff]">
                {downloadable ? "Desktop build" : "Ready to play"}
              </p>
              <h3 className="mt-1 font-tech text-lg font-bold uppercase text-white">
                {downloadable ? `Get ${title} on your machine` : `Launch ${title} in browser`}
              </h3>
              {downloadable && !canDownload ? (
                <p className="mt-1 text-xs text-white/45">
                  This title is marked as downloadable, but the download link is not available yet.
                </p>
              ) : null}
            </div>
            {downloadable ? (
              <button
                type="button"
                onClick={handleDownloadClick}
                disabled={!canDownload}
                className="btn-primary inline-flex items-center gap-2 rounded-md px-6 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
              >
                <Download className="h-4 w-4" />
                {canDownload ? "Download" : "Download Soon"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlayAccess}
                className="btn-primary inline-flex items-center gap-2 rounded-md px-6 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
              >
                <Play className="h-4 w-4 fill-current" />
                Play now
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="arena-panel overflow-hidden border-white/8 bg-[#04080f]/95">
            <div className="relative aspect-video border-b border-white/6 bg-[#0a0f18]">
              {showcaseSrc ? (
                <img src={showcaseSrc} alt={title} className="h-full w-full object-cover" loading="eager" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Gamepad2 className="h-10 w-10 text-white/25" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04080f]/80 to-transparent" />
              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prevGallery}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-1.5 text-white transition hover:border-purple-500/40"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextGallery}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-1.5 text-white transition hover:border-purple-500/40"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>
            {galleryImages.length > 1 ? (
              <div className="grid grid-cols-4 gap-1.5 p-2">
                {galleryImages.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`overflow-hidden rounded border transition ${
                      galleryIndex === i
                        ? "border-[#9a35ff]/60 ring-1 ring-[#9a35ff]/30"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <img src={src} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="arena-panel space-y-3 border-white/8 bg-[#04080f]/95 p-4">
            <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Quick links</h3>
            <button
              type="button"
              onClick={() => navigate("/leaderboard")}
              className="flex w-full items-center justify-between rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/70 transition hover:border-purple-500/35 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#ffc000]" />
                Leaderboard
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/inventory")}
              className="flex w-full items-center justify-between rounded border border-white/8 bg-[#0a0f1b]/60 px-3 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/70 transition hover:border-purple-500/35 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-purple-400" />
                Marketplace items
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            {game.platform?.length ? (
              <div className="rounded border border-white/8 bg-[#0a0f1b]/40 px-3 py-2.5">
                <span className="font-tech text-[9px] uppercase text-white/40">Platforms</span>
                <p className="mt-1 text-xs font-semibold text-white/80">{game.platform.join(", ")}</p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </ArenaPageLayout>
  );
};

export default GameDetail;
