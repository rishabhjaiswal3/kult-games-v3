import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import kultLogo from "@/assets/kult-logo.png";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Games", path: "/games" },
  { label: "AI Arena", path: "/ai-arena" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Events", path: "/events" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated, player, walletAddress, logout } = useAuth();

  const logLoginEvent = (message: string) => {
    if (typeof window === "undefined") return;
    console.info(`[Auth] ${message}`, {
      pathname: location.pathname,
      search: location.search,
      url: window.location.href,
    });
  };

  useEffect(() => {
    if (location.pathname !== "/") return;

    const params = new URLSearchParams(location.search);
    if (params.get("login") !== "1") return;

    setLoginOpen(true);
    logLoginEvent("Opening login modal from query parameter");
    params.delete("login");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: "/",
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  const handleLoginClick = () => {
    if (location.pathname === "/") {
      setLoginOpen(true);
      logLoginEvent("Opening login modal from login button");
      return;
    }

    logLoginEvent("Redirecting to login via query parameter");
    navigate("/?login=1");
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 glass-panel-ai border-border/30"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 min-w-[100px] md:min-w-[130px]">
            <img src={kultLogo} alt="Kult Games" className="h-8 md:h-10 w-auto" width={120} height={40} loading="eager" decoding="async" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(270 82% 60%)" }}
              animate={{
                opacity: [1, 0.3, 1],
                boxShadow: [
                  "0 0 4px hsl(270 82% 55%), 0 0 10px hsl(270 82% 55% / 0.5)",
                  "0 0 12px hsl(270 82% 55%), 0 0 24px hsl(270 82% 55% / 0.5)",
                  "0 0 4px hsl(270 82% 55%), 0 0 10px hsl(270 82% 55% / 0.5)",
                ],
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
                    isActive
                      ? "text-[hsl(278_100%_80%)]"
                      : "text-muted-foreground hover:text-[hsl(278_100%_80%)]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[1px] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    style={{
                      background: "linear-gradient(90deg, hsl(265 90% 50%), hsl(278 100% 72%))",
                      boxShadow: "0 0 8px hsl(270 80% 60% / 0.5)",
                    }}
                  />
                </Link>
              );
            })}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                {player?.name ?? (walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "")}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 font-display text-xs font-semibold tracking-wider btn-eye-outline"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="hidden md:block px-6 py-2 font-display text-xs font-semibold tracking-wider btn-eye relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">LOGIN</span>
            </button>
          )}
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-panel-ai border-t border-border/30 p-4 space-y-3"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-[hsl(278_100%_80%)] transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <p className="text-xs font-mono text-muted-foreground px-1">
                  {player?.name ?? (walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "")}
                </p>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full px-6 py-2 font-display text-xs font-semibold tracking-wider btn-eye-outline mt-2"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <button
                onClick={() => { handleLoginClick(); setMobileOpen(false); }}
                className="w-full px-6 py-2 font-display text-xs font-semibold tracking-wider btn-eye mt-2"
              >
                LOGIN
              </button>
            )}
          </motion.div>
        )}
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;
