import { motion } from "framer-motion";
import { Search, Filter, Star, Tag, Gamepad2, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIScanLine from "@/components/AIScanLine";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesApi } from "@/api/gamesApi";
import { isGameDownloadable } from "@/lib/gameDownload";
import type { Game } from "@/types/api";
import aiArenaHero from "@/assets/ai-arena-hero.jpg";

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

const Store = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [videoFailed, setVideoFailed] = useState(false);
  const navigate = useNavigate();

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", "all"],
    queryFn: () => gamesApi.getAll(1, 50),
    staleTime: 5 * 60_000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["games", "categories"],
    queryFn: gamesApi.getCategories,
    staleTime: 10 * 60_000,
  });

  const apiCategories = Array.isArray(categoriesData) ? categoriesData : [];
  const categories = ["All", ...apiCategories];

  const allGames = gamesData?.games ?? [];

  const filtered = allGames.filter((game) => {
    const name = getGameName(game.name).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || game.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const MARKETPLACE_VIDEO_SRC = "/videos/SC_5.mp4";

  return (
    <div className="min-h-screen bg-transparent relative">
      <Navbar />

      {/* Full-page marketplace background video (GameDetail style) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <AutoPlayVideo
          src={MARKETPLACE_VIDEO_SRC}
          loop
          className={`absolute inset-0 w-full h-full object-cover ${videoFailed ? "opacity-0" : "opacity-20"}`}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        />
        <img
          src={aiArenaHero}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover ${videoFailed ? "opacity-20" : "opacity-0"} transition-opacity`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background/92" />
      </div>

      <section className="relative pt-24 pb-20 z-10 overflow-hidden">
        <AIScanLine />

        {/* Ambient glows */}
        <div className="absolute top-32 right-0 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[28px] border border-neon-cyan/15 bg-[linear-gradient(135deg,hsl(195_100%_12%/0.22),hsl(220_45%_10%/0.42),hsl(220_45%_10%/0.12))] backdrop-blur-md lg:flex-row">
              {/* Text content */}
              <div className="relative z-10 order-first px-6 py-7 md:px-8 md:py-9">
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-neon-cyan"
                    animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">★ Games</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                  KULT <span className="gradient-text">GAMES</span>
                </h1>
                <p className="text-muted-foreground mt-3 max-w-md text-sm">
                  Browse and play the best on-chain games. All games, one platform.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-neon-cyan/20 bg-neon-cyan/10 px-3 py-1 text-[10px] font-mono tracking-[0.18em] text-neon-cyan uppercase">
                    Web + Mobile
                  </span>
                  <span className="rounded-full border border-border/50 bg-card/40 px-3 py-1 text-[10px] font-mono tracking-[0.18em] text-foreground uppercase">
                    Curated Picks
                  </span>
                  <span className="rounded-full border border-border/50 bg-card/40 px-3 py-1 text-[10px] font-mono tracking-[0.18em] text-foreground uppercase">
                    Free To Play
                  </span>
                </div>
              </div>

              {/* Video — bottom on mobile/tablet, right on desktop */}
              <div className="order-last w-full lg:w-[500px] flex-shrink-0 pointer-events-none flex items-center">
                <div className="relative overflow-hidden w-full lg:rounded-l-[32px]">
                  <AutoPlayVideo src="/videos/SC_5.mp4" loop className="w-full aspect-[16/9] object-cover opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-l from-background/5 via-background/12 to-background/50" />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-transparent to-background/30" />
                </div>
              </div>
            </div>
          </div>

          <div>
              <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-card/28 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Total games</p>
                  <p className="mt-1 text-2xl font-display font-black text-neon-cyan">{allGames.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-card/28 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Visible results</p>
                  <p className="mt-1 text-2xl font-display font-black text-foreground">{filtered.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-card/28 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Selected category</p>
                  <p className="mt-1 text-base font-display font-bold text-foreground">{selectedCategory}</p>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="mb-8 rounded-2xl border border-white/10 bg-card/35 p-4 shadow-[0_10px_30px_hsl(220_70%_2%/0.18)]">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-muted/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-neon-cyan/50 focus:outline-none focus:shadow-[0_0_10px_hsl(195_100%_60%/0.1)] transition-all"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-display font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${
                        selectedCategory === cat ? "btn-eye" : "btn-eye-outline"
                      }`}
                    >
                      {cat?.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gamesLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-xl overflow-hidden bg-card/80 border border-border/50">
                        <Skeleton className="aspect-[16/10] w-full rounded-none" />
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-10" />
                          </div>
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    ))
                  : filtered.map((item, i) => {
                      const name = getGameName(item.name);
                      const image = getGameImage(item);
                      const desc = getGameDescription(item.description);
                      const gameId = item?.["identification"];
                      const dl = isGameDownloadable(item);
                      return (
                        <div
                          key={item._id ?? i}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(`/game/${gameId}`);
                            }
                          }}
                          onClick={() => navigate(`/game/${gameId}`)}
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,hsl(220_40%_14%/0.72),hsl(220_45%_9%/0.78))] transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/35 hover:shadow-[0_14px_35px_hsl(195_100%_50%/0.12)]"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img
                              src={image}
                              alt={name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading={i < 12 ? "eager" : "lazy"}
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-display font-bold tracking-wider bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 backdrop-blur-sm">
                                <Tag className="w-3 h-3 inline mr-1" />{item.category}
                              </span>
                            </div>
                            {item.rating != null && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm">
                                <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                                <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                              </div>
                            )}
                            <div className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-background/60 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-white/85">
                              {dl ? "Downloadable" : "Instant Play"}
                            </div>
                          </div>

                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-display text-base font-bold text-foreground tracking-wide group-hover:text-neon-cyan transition-colors">{name}</h3>
                              <span className="font-display text-sm font-bold text-neon-cyan">FREE</span>
                            </div>
                            {desc ? (
                              <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                {desc}
                              </p>
                            ) : null}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground font-mono tracking-wider">{item?.category?.toUpperCase()}</span>
                              <div className="flex gap-1">
                                {(item.platform ?? []).map((p) => (
                                  <span key={p} className="text-[9px] font-mono text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">{p}</span>
                                ))}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="w-full mt-3 py-2 rounded-lg text-xs font-display font-semibold tracking-wider btn-eye flex items-center justify-center gap-1.5 pointer-events-none"
                            >
                              {dl ? (
                                <>
                                  <Download className="w-3.5 h-3.5" />
                                  DOWNLOAD
                                </>
                              ) : (
                                <>
                                  <Gamepad2 className="w-3.5 h-3.5" />
                                  PLAY GAME
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
              </div>

              {!gamesLoading && filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground font-display">No games found matching your criteria.</p>
                </div>
              )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Store;
