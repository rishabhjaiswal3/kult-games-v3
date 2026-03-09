import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import kultLogo from "@/assets/kult-logo.png";
import LoginModal from "@/components/LoginModal";

const navItems = [
  { label: "Store", path: "/store" },
  { label: "Games", path: "/" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Events", path: "/events" },
  { label: "Battle", path: "/events" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Keep LoginModal here but it renders via fixed positioning (z-[101]) so it covers the full screen

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass-panel-ai border-b border-border/30"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={kultLogo} alt="Kult Games" className="h-8 md:h-10 w-auto" width={120} height={40} loading="eager" decoding="async" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{
                opacity: [1, 0.3, 1],
                boxShadow: ["0 0 3px hsl(270 70% 55%)", "0 0 8px hsl(270 70% 55%)", "0 0 3px hsl(270 70% 55%)"],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-300 relative group ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-[1px] bg-gradient-to-r from-primary to-secondary transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button onClick={() => setLoginOpen(true)} className="hidden md:block px-6 py-2 font-display text-xs font-semibold tracking-wider bg-primary text-primary-foreground border border-primary/50 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.4)] transition-all duration-300 btn-angular relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10">LOGIN</span>
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-panel-ai border-t border-border/30 p-4 space-y-3"
          >
            {navItems.map((item) => (
              <Link key={item.label} to={item.path} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                {item.label}
              </Link>
            ))}
            <button onClick={() => { setLoginOpen(true); setMobileOpen(false); }} className="w-full px-6 py-2 font-display text-xs font-semibold tracking-wider bg-primary text-primary-foreground border border-primary/50 btn-angular mt-2">
              LOGIN
            </button>
          </motion.div>
        )}
      </motion.nav>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;
