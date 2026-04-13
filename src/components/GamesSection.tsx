import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GameCard from "./GameCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AIScanLine from "@/components/AIScanLine";
import { GamesCarouselSkeleton } from "@/components/skeleton";
import { useNavigate } from "react-router-dom";
import { gamesApi } from "@/api/gamesApi";
import type { Game } from "@/types/api";

function getGameName(name: Game["name"]): string {
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
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

function getGameDescription(desc: Game["description"]): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  return desc?.en ?? Object.values(desc)[0] ?? "";
}

interface GamesSectionProps {
  onViewAllGames: () => void;
}

const GamesSection = ({ onViewAllGames }: GamesSectionProps) => {
  const [videoOpacity, setVideoOpacity] = useState(0.12);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["games", "all"],
    queryFn: () => gamesApi.getAll(1, 10),
    staleTime: 5 * 60_000,
  });

  const games = data?.games ?? [];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, []);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    const updateScrollState = () => {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      setCanScrollLeft(scroller.scrollLeft > 8);
      setCanScrollRight(scroller.scrollLeft < maxScrollLeft - 8);
    };

    updateScrollState();
    scroller.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      scroller.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollCards = (direction: "left" | "right") => {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    const amount = Math.max(scroller.clientWidth * 0.75, 280);

    scroller.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative py-16 md:py-24 z-10 overflow-hidden" >
      {/* Background video — plays once then fades out */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={() => setVideoOpacity(0)}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: videoOpacity, transition: "opacity 1s ease" }}
      >
        <source src="/videos/SC_2-3.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/80" />

      <AIScanLine />

      {/* Ambient glows */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header - matching reference */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                className="w-2 h-2 rounded-full bg-neon-cyan"
                animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">
                A CURATED GAMES COLLECTION
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              We Believe In Quality Over{" "}
              <span className="gradient-text glow-text">Quantity</span>
            </h2>
          </div>
           <div className="relative z-20 hidden lg:flex justify-end gap-3">
            <button
              type="button"
              aria-label="Scroll games left"
              onClick={() => scrollCards("left")}
              disabled={!canScrollLeft}
              className="group relative flex h-14 w-14 items-center justify-center !rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--cyan-glow)/0.28),transparent_38%),linear-gradient(135deg,hsl(220_45%_16%/0.96),hsl(220_42%_10%/0.94))] text-foreground shadow-[inset_0_1px_0_hsl(210_20%_100%/0.14),0_10px_30px_hsl(220_80%_3%/0.45),0_0_28px_hsl(var(--primary)/0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[inset_0_1px_0_hsl(210_20%_100%/0.22),0_14px_36px_hsl(220_80%_3%/0.55),0_0_34px_hsl(var(--primary)/0.26)] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-[linear-gradient(135deg,hsl(220_20%_14%/0.72),hsl(220_18%_10%/0.72))] disabled:text-muted-foreground disabled:shadow-none disabled:opacity-55"
            >
              <span className="pointer-events-none absolute inset-[3px] !rounded-full border border-white/10 bg-[linear-gradient(180deg,hsl(210_20%_100%/0.08),transparent_42%,hsl(220_30%_6%/0.18))]" />
              <span className="pointer-events-none absolute inset-0 !rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,hsl(var(--primary)/0.18)_110deg,transparent_210deg,transparent_360deg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <ChevronLeft className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-primary" />
            </button>
            <button
              type="button"
              aria-label="Scroll games right"
              onClick={() => scrollCards("right")}
              disabled={!canScrollRight}
              className="group relative flex h-14 w-14 items-center justify-center !rounded-full border border-white/10 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--cyan-glow)/0.28),transparent_38%),linear-gradient(135deg,hsl(220_45%_16%/0.96),hsl(220_42%_10%/0.94))] text-foreground shadow-[inset_0_1px_0_hsl(210_20%_100%/0.14),0_10px_30px_hsl(220_80%_3%/0.45),0_0_28px_hsl(var(--primary)/0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[inset_0_1px_0_hsl(210_20%_100%/0.22),0_14px_36px_hsl(220_80%_3%/0.55),0_0_34px_hsl(var(--primary)/0.26)] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-[linear-gradient(135deg,hsl(220_20%_14%/0.72),hsl(220_18%_10%/0.72))] disabled:text-muted-foreground disabled:shadow-none disabled:opacity-55"
            >
              <span className="pointer-events-none absolute inset-[3px] !rounded-full border border-white/10 bg-[linear-gradient(180deg,hsl(210_20%_100%/0.08),transparent_42%,hsl(220_30%_6%/0.18))]" />
              <span className="pointer-events-none absolute inset-0 !rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,hsl(var(--primary)/0.18)_110deg,transparent_210deg,transparent_360deg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <ChevronRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          </div>
        </div>

        {/* Horizontal scrolling game cards - matching reference layout */}
        <div className="relative">
         
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto overflow-y-hidden pb-4 scrollbar-none snap-x snap-mandatory touch-pan-x"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {isLoading ? (
              <GamesCarouselSkeleton count={5} className="contents" />
            ) : (
              games.map((game, i) => (
                  <div
                    key={String(game._id ?? game.identification ?? game.slug ?? `game-${i}`)}
                    className="w-[260px] flex-shrink-0 snap-start md:w-[280px]"
                  >
                    <GameCard
                      id={game.identification ?? game.slug ?? game._id}
                      title={getGameName(game.name)}
                      description={getGameDescription(game.description)}
                      image={getGameImage(game)}
                      category={game.category}
                      rating={game.rating ?? 0}
                      sessionLength={(game.metadata?.session_length as string) ?? ""}
                      skillLevel={(game.metadata?.skill_level as string) ?? "All levels"}
                      index={i}
                    />
                  </div>
                ))
            )}
          </div>

          {/* Fade edges for scroll indication */}
          <div className="pointer-events-none absolute bottom-4 left-0 top-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute bottom-4 right-0 top-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        </div>

        {/* View all button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onViewAllGames}
            className="px-8 py-3 rounded-lg font-display text-xs font-semibold tracking-wider btn-eye flex items-center gap-2"
          >
            VIEW ALL GAMES
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
