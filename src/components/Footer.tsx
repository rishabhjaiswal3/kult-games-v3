import { ChevronLeft } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/30 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground font-mono">
            Copyright 2026 all rights reserved. All Rights Reserved.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-primary" strokeWidth={3} />
            <span className="font-display text-sm font-bold tracking-wider text-foreground">
              KULT
            </span>
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
              GAMES
            </span>
            <span className="text-muted-foreground mx-2">|</span>
            <span className="font-display text-sm font-bold text-muted-foreground">0G</span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {["Facebook", "X", "Reddit", "Discord"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
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
