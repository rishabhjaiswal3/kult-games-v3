import kultLogo from "@/assets/Kult Logo.png";
import zeroGLogo from "@/assets/0G Logo.png";
import { Link } from "react-router-dom";

const platformLinks = [
  { label: "Games", href: "/" },
  { label: "Inventory", href: "/inventory" },
  { label: "AI Arena", href: "/ai-arena" },
  { label: "Moments", href: "/moments" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const socials = [
  {
    key: "x",
    label: "X",
    href: "https://x.com/_KultGames",
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
];

const Footer = () => {
  return (
    <footer className="arena-panel relative mb-6 border border-white/8 bg-[#04080f] overflow-hidden">
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-[0.09]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(278_100%_74%/0.85)] to-transparent" />
      <div className="pointer-events-none absolute -left-28 top-8 h-56 w-56 rounded-full bg-[hsl(278_100%_60%/0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[hsl(190_100%_55%/0.11)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(278_100%_70%/0.12),transparent_34%),linear-gradient(180deg,rgba(7,10,22,0.92),rgba(2,5,12,0.98))]" />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr_0.7fr] lg:items-center lg:py-12">
          <div className="relative overflow-hidden rounded-[1.25rem] border border-[hsl(278_100%_70%/0.18)] bg-white/[0.035] p-5 shadow-[0_24px_80px_hsl(278_100%_55%/0.12)] backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(278_100%_70%/0.12)] via-transparent to-[hsl(190_100%_60%/0.08)]" />
            <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex h-16 shrink-0 items-center gap-5 rounded-2xl border border-[hsl(278_100%_70%/0.24)] bg-black/30 px-5 shadow-[0_0_35px_hsl(278_100%_60%/0.22)]">
                <img src={kultLogo} alt="Kult Games" className="h-8 w-auto max-w-[92px] object-contain" />
                <span className="h-8 w-px bg-white/16" aria-hidden />
                <img src={zeroGLogo} alt="0G" className="h-7 w-auto max-w-[64px] object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.36em] text-[hsl(278_100%_82%)]">
                  Kult Games
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/72">
                  The next generation of AI-powered, on-chain gaming.
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 lg:justify-center" aria-label="Footer navigation">
            {platformLinks.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {link.href.startsWith("http") ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-white/62 transition-all hover:-translate-y-0.5 hover:border-[hsl(278_100%_70%/0.42)] hover:bg-[hsl(278_100%_70%/0.12)] hover:text-[hsl(278_100%_86%)] hover:shadow-[0_0_28px_hsl(278_100%_60%/0.18)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-white/62 transition-all hover:-translate-y-0.5 hover:border-[hsl(278_100%_70%/0.42)] hover:bg-[hsl(278_100%_70%/0.12)] hover:text-[hsl(278_100%_86%)] hover:shadow-[0_0_28px_hsl(278_100%_60%/0.18)]"
                  >
                    {link.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Follow</span>
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsl(278_100%_70%/0.22)] bg-[hsl(278_100%_70%/0.08)] text-white/70 transition-all hover:-translate-y-1 hover:border-[hsl(278_100%_78%/0.58)] hover:bg-[hsl(278_100%_70%/0.18)] hover:text-white hover:shadow-[0_0_34px_hsl(278_100%_62%/0.35)]"
                    aria-label={s.label}
                    title={s.label}
                  >
                    <span className="transition-transform group-hover:scale-110">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/38">Powered by</span>
              <img src={zeroGLogo} alt="0G" className="h-5 w-auto opacity-90" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-5 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/42 font-mono">
            <span>© 2026 Kult Games</span>
            <span className="text-white/20">·</span>
            <span>Powered by 0G</span>
          </div>
          <span className="text-[9px] font-mono tracking-[0.28em] text-[hsl(278_100%_82%/0.58)]">
            BUILT ON-CHAIN · AI-NATIVE · DECENTRALIZED
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
