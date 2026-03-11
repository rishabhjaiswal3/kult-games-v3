import { motion } from "framer-motion";
import kultLogo from "@/assets/kult-logo.png";
import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  { heading: "Platform", links: ["Games", "Store", "Leaderboard", "Events"] },
  { heading: "Resources", links: ["Documentation", "API", "Community", "Blog"] },
  { heading: "Legal", links: ["Terms", "Privacy", "Cookies"] },
];

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/30 bg-card/30 backdrop-blur-sm">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-10" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-neon-cyan/3 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <img src={kultLogo} alt="Kult Games" className="h-8 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The next generation of AI-powered, on-chain gaming.
            </p>
            <div className="flex items-center gap-3">
              {["X", "Discord", "Telegram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/30 hover:bg-neon-cyan/5 transition-all group"
                  aria-label={social}
                >
                  <span className="text-xs font-bold group-hover:scale-110 transition-transform">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((section, si) => (
            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.08 }}
            >
              <h4 className="font-display text-xs font-bold text-foreground tracking-[0.2em] uppercase mb-4">
                {section.heading}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors flex items-center gap-1 group">
                      {link}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar — leaderboard scan line style */}
        <div className="border-t border-border/20 py-6 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-neon-cyan/15 to-transparent"
            animate={{ x: ["-96px", "calc(100vw + 96px)"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">© 2026 Kult Games</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-xs text-muted-foreground font-mono">Powered by 0G</span>
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider">
              BUILT ON-CHAIN • AI-NATIVE • DECENTRALIZED
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
