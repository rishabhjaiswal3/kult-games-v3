import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/30"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ChevronLeft className="w-6 h-6 text-primary" strokeWidth={3} />
          <span className="font-display text-xl font-black tracking-wider text-foreground">
            KULT
          </span>
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest ml-1 mt-1">
            GAMES
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Store", "Games", "Leaderboard", "Events", "Battle"].map((item, i) => (
            <a
              key={item}
              href="#"
              className={`text-sm font-medium transition-colors duration-300 ${
                i === 1 ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        <button className="px-6 py-2 font-display text-xs font-semibold tracking-wider bg-primary text-primary-foreground border border-primary/50 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.4)] transition-all duration-300 btn-angular">
          LOGIN
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
