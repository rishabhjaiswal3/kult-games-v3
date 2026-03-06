import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, Star, Tag } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MageCharacter from "@/components/MageCharacter";
import mageThrone from "@/assets/mage-throne.png";

const storeItems = [
  {
    id: "guess-the-ai",
    title: "Guess The AI",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png",
    price: "FREE",
    category: "Puzzle",
    rating: 4.8,
    tag: "Popular",
  },
  {
    id: "zero-g-pool",
    title: "Zero G Pool",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero_Z_Pool.png",
    price: "FREE",
    category: "Sports",
    rating: 4.8,
    tag: "New",
  },
  {
    id: "zero-dash",
    title: "Zero Dash",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Zero%20dash%20Carousel%20Desk.png",
    price: "FREE",
    category: "Action",
    rating: 4.8,
    tag: "Trending",
  },
  {
    id: "robo-wars",
    title: "Robo Wars",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Robo_wars.png",
    price: "0.5 ETH",
    category: "Fighting",
    rating: 4.8,
    tag: "Premium",
  },
  {
    id: "highway-hustle",
    title: "Highway Hustle",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Highway_Hustle.png",
    price: "FREE",
    category: "Racing",
    rating: 4.8,
    tag: "Hot",
  },
  {
    id: "warzone-warriors",
    title: "Warzone Warriors",
    image: "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/Home_Carousel/Desktop/Guess_the_ai.png",
    price: "1.2 ETH",
    category: "Battle",
    rating: 4.9,
    tag: "Exclusive",
  },
];

const categories = ["All", "Puzzle", "Sports", "Action", "Fighting", "Racing", "Battle"];

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
        {/* Background video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-15">
          <source src="/videos/SC_12.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/80" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header with large mage */}
          <div className="relative mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-xs font-mono text-primary tracking-[0.2em] uppercase mb-2 block">★ Marketplace</span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                KULT <span className="gradient-text">STORE</span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-md text-sm">Browse and collect the best on-chain games. Play free or own premium experiences.</p>
            </motion.div>

            {/* Large mage - upper body visible, lower fades */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:block absolute -right-4 xl:right-8 -top-8 w-[320px] xl:w-[400px] h-[500px] xl:h-[600px] overflow-hidden"
            >
              <MageCharacter src={mageThrone} alt="Throne Mage" glowColor="secondary" />
            </motion.div>
          </div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-muted/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold tracking-wider whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary"
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
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/game/${item.id}`)}
                className="group cursor-pointer rounded-xl overflow-hidden ornate-border bg-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-full text-[10px] font-display font-bold tracking-wider bg-primary/80 text-primary-foreground">
                      <Tag className="w-3 h-3 inline mr-1" />{item.tag}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm">
                    <Star className="w-3 h-3 text-[hsl(40,80%,55%)] fill-[hsl(40,80%,55%)]" />
                    <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground tracking-wide">{item.title}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{item.category.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-display text-sm font-bold ${item.price === "FREE" ? "text-primary" : "text-[hsl(var(--gold))]"}`}>
                      {item.price}
                    </span>
                    <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                    </button>
                  </div>
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
