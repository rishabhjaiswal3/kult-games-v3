import kultLogo from "@/assets/kult-logo.png";
import { Link } from "react-router-dom";

const platformLinks = [
  { label: "Games", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "AI Arena", href: "/ai-arena" },
  { label: "Moments", href: "/moments" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const socials = [
  {
    key: "x",
    label: "X (Twitter)",
    href: "https://twitter.com/_KultGames",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "discord",
    label: "Discord",
    href: "https://discord.com/invite/Cge7rrCyUB",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.024.017.043.037.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    key: "telegram",
    label: "Telegram",
    href: "https://t.me/KultGamesOfficial",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/kult_games_/?igsh=dzAxNnJ3eWQ4NmUz&utm_source=qr",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    key: "medium",
    label: "Medium",
    href: "https://medium.com/@kult_games",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/30 bg-card/95">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-[0.07]" />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-9">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <img src={kultLogo} alt="Kult Games" className="h-7 w-auto" />
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              The next generation of AI-powered, on-chain gaming.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {platformLinks.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {link.href.startsWith("http") ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-[hsl(278_100%_82%)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-[hsl(278_100%_82%)]"
                  >
                    {link.label}
                  </Link>
                )}
                {i < platformLinks.length - 1 ? (
                  <span className="text-muted-foreground/25" aria-hidden>
                    ·
                  </span>
                ) : null}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[hsl(278_100%_70%/0.18)] bg-[hsl(278_100%_70%/0.08)] text-muted-foreground transition-all hover:border-[hsl(278_100%_70%/0.32)] hover:bg-[hsl(278_100%_70%/0.14)] hover:text-[hsl(278_100%_82%)]"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-border/20 py-4 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
            <span>© 2026 Kult Games</span>
            <span className="text-muted-foreground/30">·</span>
            <span>Powered by 0G</span>
          </div>
          <span className="text-[9px] font-mono tracking-wider text-muted-foreground/50">
            BUILT ON-CHAIN · AI-NATIVE · DECENTRALIZED
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
