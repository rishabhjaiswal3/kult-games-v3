import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import GameCard from "./GameCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AIScanLine from "@/components/AIScanLine";
import { useNavigate } from "react-router-dom";
// import { Navigate } from "react-router-dom";

const games = [
  { id: "guess-the-ai", title: "Guess The AI", description: "Challenge your mind. Beat the AI.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png", category: "ACTION", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner" },
  { id: "zero-g-pool", title: "Zero G Pool", description: "Your favourite 8-ball, now with a cosmic twist.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png", category: "SPORTS", rating: 4.8, sessionLength: "10-15 min", skillLevel: "Intermediate" },
  { id: "zero-dash", title: "Zero Dash", description: "Run. Escape. Don't look back.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png", category: "ACTION", rating: 4.8, sessionLength: "3-5 min", skillLevel: "All levels" },
  { id: "robo-wars", title: "Robo Wars", description: "Enter the arena where metal meets mayhem.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png", category: "FIGHTING", rating: 4.8, sessionLength: "10-20 min", skillLevel: "Intermediate" },
  { id: "highway-hustle", title: "Highway Hustle", description: "Fast lanes. Fierce rivals. Full throttle.", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png", category: "RACING", rating: 4.8, sessionLength: "5-10 min", skillLevel: "Beginner" },
];

const GamesSection = () => {
  const [videoOpacity, setVideoOpacity] = useState(0.12);
  const navigate = useNavigate();
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
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
              className="group relative flex h-14 w-14 items-center justify-center !rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--cyan-glow)/0.28),transparent_38%),linear-gradient(135deg,hsl(220_45%_16%/0.96),hsl(220_42%_10%/0.94))] text-foreground shadow-[inset_0_1px_0_hsl(210_20%_100%/0.14),0_10px_30px_hsl(220_80%_3%/0.45),0_0_28px_hsl(var(--primary)/0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[inset_0_1px_0_hsl(210_20%_100%/0.22),0_14px_36px_hsl(220_80%_3%/0.55),0_0_34px_hsl(var(--primary)/0.26)] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-[linear-gradient(135deg,hsl(220_20%_14%/0.72),hsl(220_18%_10%/0.72))] disabled:text-muted-foreground disabled:shadow-none disabled:opacity-55"
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
              className="group relative flex h-14 w-14 items-center justify-center !rounded-full border border-white/10 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--cyan-glow)/0.28),transparent_38%),linear-gradient(135deg,hsl(220_45%_16%/0.96),hsl(220_42%_10%/0.94))] text-foreground shadow-[inset_0_1px_0_hsl(210_20%_100%/0.14),0_10px_30px_hsl(220_80%_3%/0.45),0_0_28px_hsl(var(--primary)/0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[inset_0_1px_0_hsl(210_20%_100%/0.22),0_14px_36px_hsl(220_80%_3%/0.55),0_0_34px_hsl(var(--primary)/0.26)] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-[linear-gradient(135deg,hsl(220_20%_14%/0.72),hsl(220_18%_10%/0.72))] disabled:text-muted-foreground disabled:shadow-none disabled:opacity-55"
            >
              <span className="pointer-events-none absolute inset-[3px] !rounded-full border border-white/10 bg-[linear-gradient(180deg,hsl(210_20%_100%/0.08),transparent_42%,hsl(220_30%_6%/0.18))]" />
              <span className="pointer-events-none absolute inset-0 !rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,hsl(var(--primary)/0.18)_110deg,transparent_210deg,transparent_360deg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <ChevronRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          </div>
        </motion.div>

        {/* Horizontal scrolling game cards - matching reference layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
         
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto overflow-y-hidden pb-4 scrollbar-none snap-x snap-mandatory touch-pan-x"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="flex-shrink-0 w-[260px] md:w-[280px] snap-start"
              >
                <GameCard {...game} index={i} />
              </motion.div>
            ))}
          </div>

          {/* Fade edges for scroll indication */}
          <div className="absolute top-0 left-0 bottom-4 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <button
            // onClick={() => window.location.href = "/games"}
            onClick={()=> navigate("/games")}
            className="px-8 py-3 rounded-lg font-display text-xs font-semibold tracking-wider btn-eye flex items-center gap-2"
          >
            VIEW ALL GAMES
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GamesSection;
