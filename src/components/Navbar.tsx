import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/30"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-border">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            KULT
          </span>
          <span className="text-xs font-mono text-muted-foreground tracking-widest">
            AI-NATIVE
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Games", "Discover", "Leaderboard"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300">
            <Search className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 rounded-lg font-display text-xs font-semibold tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 glow-border">
            CONNECT
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
