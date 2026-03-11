import { motion } from "framer-motion";
import { Search, Filter, Star, Tag, ExternalLink, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MageCharacter from "@/components/MageCharacter";
import mageThrone from "@/assets/mage-throne.png";
import AIScanLine from "@/components/AIScanLine";

const storeItems = [
  { id: "guess-the-ai", title: "Guess The AI", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png", price: "FREE", category: "Action", rating: 4.8, tag: "Popular", platform: ["Web", "Mobile"] },
  { id: "zero-g-pool", title: "Zero G Pool", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png", price: "FREE", category: "Sports", rating: 4.8, tag: "New", platform: ["Web", "Mobile"] },
  { id: "zero-dash", title: "Zero Dash", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png", price: "FREE", category: "Action", rating: 4.8, tag: "Trending", platform: ["Web", "Mobile"] },
  { id: "robo-wars", title: "Robo Wars", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png", price: "FREE", category: "Fighting", rating: 4.8, tag: "Premium", platform: ["Web"] },
  { id: "highway-hustle", title: "Highway Hustle", image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png", price: "FREE", category: "Racing", rating: 4.8, tag: "Hot", platform: ["Web", "Mobile"] },
];

const categories = ["All", "Sports", "Action", "Fighting", "Racing"];

const Store = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const filtered = storeItems.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navbar />

      <section className="relative pt-24 pb-20 z-10">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-15">
          <source src="/videos/SC_12-5.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/75" />
        <AIScanLine />

        {/* Ambient glows */}
        <div className="absolute top-32 right-0 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  className="w-2 h-2 rounded-full bg-neon-cyan"
                  animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">★ Marketplace</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                KULT <span className="gradient-text">STORE</span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-md text-sm">Browse and play the best on-chain games. All games, one platform.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:block w-[260px] xl:w-[300px] flex-shrink-0"
            >
              <MageCharacter src={mageThrone} alt="Throne Mage" glowColor="secondary" showMask />
            </motion.div>
          </div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 border border-border/50 bg-card/50"
          >
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
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-display font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-neon-cyan text-background shadow-[0_0_12px_hsl(195_100%_60%/0.3)]"
                      : "border border-border/50 text-muted-foreground hover:border-neon-cyan/30 hover:text-neon-cyan"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/game/${item.id}`)}
                className="group cursor-pointer rounded-xl overflow-hidden bg-card/80 border border-border/50 hover:border-neon-cyan/30 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                  {/* Neon scan on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <motion.div
                      className="absolute left-0 right-0 h-[1px]"
                      style={{ background: "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.5), transparent)" }}
                      animate={{ top: ["0%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-display font-bold tracking-wider bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 backdrop-blur-sm">
                      <Tag className="w-3 h-3 inline mr-1" />{item.tag}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm">
                    <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                    <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-base font-bold text-foreground tracking-wide group-hover:text-neon-cyan transition-colors">{item.title}</h3>
                    <span className={`font-display text-sm font-bold ${item.price === "FREE" ? "text-neon-cyan" : "text-[hsl(var(--gold))]"}`}>{item.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-mono tracking-wider">{item.category.toUpperCase()}</span>
                    <div className="flex gap-1">
                      {item.platform.map((p) => (
                        <span key={p} className="text-[9px] font-mono text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">{p}</span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 rounded-lg text-xs font-display font-semibold tracking-wider bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan hover:text-background transition-all duration-300 flex items-center justify-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    PLAY GAME
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-display">No games found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Store;
