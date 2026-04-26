import { motion } from "framer-motion";
import kultLogo from "@/assets/kult-logo.png";
import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  { heading: "Platform", links: ["Games", "Store", "Leaderboard", "Events"] },
  { heading: "Follow", links: ["X (Twitter)", "Discord", "Telegram"] },
];

const socials = [
  {
    key: "x",
    label: "X (Twitter)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "discord",
    label: "Discord",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.024.017.043.037.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/30 bg-card">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-10" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[hsl(278_100%_70%/0.08)] blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <img src={kultLogo} alt="Kult Games" className="h-8 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The next generation of AI-powered, on-chain gaming.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href="#"
                  className="w-9 h-9 rounded-[16px] border border-[hsl(278_100%_70%/0.18)] bg-[hsl(278_100%_70%/0.08)] flex items-center justify-center text-muted-foreground hover:text-[hsl(278_100%_82%)] hover:border-[hsl(278_100%_70%/0.32)] hover:bg-[hsl(278_100%_70%/0.14)] transition-all group"
                  aria-label={s.label}
                >
                  <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <div key={section.heading}>
              <h4 className="font-display text-xs font-bold text-foreground tracking-[0.2em] uppercase mb-4">
                {section.heading}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-[hsl(278_100%_82%)] transition-colors flex items-center gap-1 group">
                      {link}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar — leaderboard scan line style */}
        <div className="border-t border-border/20 py-6 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[hsl(278_100%_70%/0.18)] to-transparent"
            animate={{ x: ["-96px", "calc(100vw + 96px)"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">© 2026 Kult Games</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-xs text-muted-foreground font-mono">Powered by 0G</span>
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[hsl(278_100%_82%/0.7)]"
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
