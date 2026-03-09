import { motion } from "framer-motion";
import kultLogo from "@/assets/kult-logo.png";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/30 py-8">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 relative">
        <div className="h-[1px] w-full bg-border/20 mb-6 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            animate={{ x: ["-96px", "calc(100vw + 96px)"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground font-mono">
            Copyright 2026 all rights reserved. All Rights Reserved.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={kultLogo} alt="Kult Games" className="h-6 w-auto opacity-70" />
            <span className="text-muted-foreground mx-1">|</span>
            <span className="font-display text-sm font-bold text-muted-foreground">0G</span>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="flex items-center gap-4">
            {["Facebook", "X", "Reddit", "Discord"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-[0_0_10px_hsl(269_44%_40%/0.2)] transition-all"
                aria-label={social}
              >
                <span className="text-xs font-bold">{social[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
