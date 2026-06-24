import kultLogo from "@/assets/Kult Logo.png";
import zeroGLogo from "@/assets/0G Logo.png";
import { ArrowUpRight, BrainCircuit, Gamepad2, Trophy, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccess } from "@/contexts/AccessContext";
import type { AccessFeature } from "@/lib/accessControl";

const platformLinks = [
  { label: "Games", href: "/games", icon: Gamepad2, feature: "games" },
  { label: "AI Arena", href: "/ai-arena", icon: BrainCircuit, feature: "ai_arena" },
  { label: "Moments", href: "/moments", icon: Video, feature: "moments" },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy, feature: "league" },
  { label: "League", href: "/league", icon: Trophy, feature: "league" },
  { label: "Home", href: "/", icon: Gamepad2, feature: null },
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

const Footer = ({ variant = "home" }: { variant?: "home" | "arena" }) => {
  const isArena = variant === "arena";
  const { canUse } = useAccess();
  const footerLinks = platformLinks.filter((link) => {
    if (isArena && link.label === "AI Arena") return false;
    if (!isArena && link.label === "League") return false;
    return !link.feature || canUse(link.feature as AccessFeature);
  });
  const startLink = { label: "Enter League", href: "/league", feature: "league" as AccessFeature };
  const showStartLink = canUse(startLink.feature);

  return (
    <footer className={`relative -mx-4 mb-0 w-[calc(100%+2rem)] overflow-hidden border-y border-white/8 bg-[#04080f] pb-24 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:pb-0 lg:-mx-8 lg:w-[calc(100%+4rem)] ${isArena ? "pb-28" : ""}`}>
      <div className="absolute inset-0 ai-grid-overlay pointer-events-none opacity-[0.09]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(278_100%_74%/0.85)] to-transparent" />
      <div className="pointer-events-none absolute -left-28 top-8 h-56 w-56 rounded-full bg-[hsl(278_100%_60%/0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[hsl(190_100%_55%/0.11)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(278_100%_70%/0.12),transparent_34%),linear-gradient(180deg,rgba(7,10,22,0.92),rgba(2,5,12,0.98))]" />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="grid gap-10 py-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.15fr_0.7fr_0.7fr_1fr] lg:gap-8 lg:py-12">
          <div className="mx-auto max-w-[290px] sm:mx-0">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <img src={kultLogo} alt="Kult Games" className="h-10 w-auto max-w-[145px] object-contain" />
              <span className="h-8 w-px bg-white/15" />
              <img src={zeroGLogo} alt="0G" className="h-8 w-auto max-w-[72px] object-contain" />
            </div>
            {isArena ? (
              <>
                <h2 className="mt-6 font-tech text-[13px] font-black uppercase leading-relaxed tracking-[0.18em] text-white/90">The operating layer for <span className="text-[#c084fc]">intelligent gaming.</span></h2>
                <p className="mt-3 text-sm leading-relaxed text-white/55">Autonomous agents. Persistent identities. Connected worlds.</p>
              </>
            ) : (
              <>
                <h2 className="mt-6 font-tech text-[13px] font-black uppercase leading-relaxed tracking-[0.18em] text-white/90">One browser for <span className="text-[#c084fc]">every game world.</span></h2>
                <p className="mt-3 text-sm leading-relaxed text-white/55">Play games. Predict markets. Command AI agents. Own every move.</p>
              </>
            )}
          </div>

          <nav aria-label="Footer navigation">
            <p className="font-tech text-[11px] font-bold uppercase tracking-[0.28em] text-[#c084fc]">Explore</p>
            <div className="mt-4 space-y-3">
              {footerLinks.map((link) => {
                const Icon = link.icon;
                return <Link key={link.href} to={link.href} className="flex items-center justify-center gap-2 text-sm text-white/60 transition hover:text-white sm:justify-start"><Icon className="h-3.5 w-3.5 text-[#a855f7]" />{link.label}</Link>;
              })}
            </div>
          </nav>

          <div>
            <p className="font-tech text-[11px] font-bold uppercase tracking-[0.28em] text-[#c084fc]">Community</p>
            <div className="mt-4 space-y-3">
              {socials.map((social) => <a key={social.key} href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-white/60 transition hover:text-white sm:justify-start"><span className="text-[#a855f7]">{social.icon}</span>{social.label}</a>)}
            </div>
          </div>

          {showStartLink ? (
            <div className="mx-auto w-full max-w-[320px] sm:mx-0">
              <p className="font-tech text-[11px] font-bold uppercase tracking-[0.28em] text-[#c084fc]">Start playing</p>
              <Link
                to={startLink.href}
                className="footer-enter-cta mt-4"
                style={{ width: "220px", minHeight: "42px", gap: "8px", borderRadius: "10px", fontSize: "11px" }}
              >
                <span>{startLink.label}</span>
                <ArrowUpRight aria-hidden />
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-white/35">Make your picks, follow the action, and climb the League.</p>
            </div>
          ) : null}
        </div>

        <div className="group/legal flex flex-col items-center justify-between gap-3 border-t border-white/10 py-5 transition duration-300 hover:border-[#7d5cff]/30 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-white/42 font-mono">
            <span className="transition group-hover/legal:text-white/68">© 2026</span>
            <img src={kultLogo} alt="Kult Games" className="h-3.5 w-auto object-contain opacity-60 transition group-hover/legal:opacity-100" />
            <span className="text-white/20 transition group-hover/legal:text-[#a790ff]/60">·</span>
            <span className="transition group-hover/legal:text-white/68">Powered by</span>
            <img src={zeroGLogo} alt="0G" className="h-3.5 w-auto object-contain opacity-60 transition group-hover/legal:opacity-100" />
          </div>
          <span className="text-center text-[9px] font-mono tracking-[0.28em] text-[hsl(278_100%_82%/0.58)] transition group-hover/legal:text-[#d8c7ff]">
            BUILT ON-CHAIN · AI-NATIVE · DECENTRALIZED
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
