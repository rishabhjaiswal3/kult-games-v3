import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[500px] rounded-full bg-neon-cyan/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] rounded-full bg-neon-purple/6 blur-[130px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 flex flex-col items-center">
        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1
            className="font-display font-black leading-none gradient-text select-none"
            style={{
              fontSize: "clamp(8rem, 22vw, 18rem)",
              textShadow: "0 0 80px hsl(195 100% 60% / 0.35), 0 0 160px hsl(195 100% 60% / 0.15)",
            }}
          >
            404
          </h1>
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-neon-cyan/50" />
          <span className="text-[10px] font-mono text-neon-cyan tracking-[0.35em] uppercase whitespace-nowrap">
            Page Not Found
          </span>
          <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-neon-cyan/50" />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground text-base md:text-lg mb-10 max-w-md leading-relaxed"
        >
          This realm doesn't exist. The page you're looking for has been lost in the void.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider btn-eye flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            RETURN HOME
          </button>
          <button
            onClick={() => navigate("/games")}
            className="px-8 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider btn-eye-outline flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            BROWSE GAMES
          </button>
        </motion.div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
    </div>
  );
};

export default NotFound;
