import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/30 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-sm font-bold tracking-wider text-foreground">
              KULT
            </span>
            <span className="text-xs text-muted-foreground">× 0G Chain</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            © 2026 Kult Games. AI-Native Gaming on 0G.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
