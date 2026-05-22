import { useState } from "react";
import { Bookmark, Flame, Grid3x3, Heart, Home, Layers, Radio, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shortenWalletChip } from "@/components/moments/momentsUtils";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const feedLinks = [
  { id: "feed", icon: Home, label: "Feed" },
  { id: "foryou", icon: Sparkles, label: "For You" },
  { id: "following", icon: Users, label: "Following" },
  { id: "mine", icon: Layers, label: "My Moments" },
  { id: "liked", icon: Heart, label: "Liked Moments" },
  { id: "bookmarks", icon: Bookmark, label: "Bookmarks" },
  { id: "watch", icon: Grid3x3, label: "Watch Later" },
] as const;

const liveGames = [
  { name: "AI Arena Battles", viewers: "2.8K watching", accent: "text-red-400" },
  { name: "Warzone Warriors", viewers: "1.2K watching", accent: "text-red-400" },
];

const communityLinks = ["Factions", "Tribes", "Channels", "Tournaments"];

export function MomentsLeftSidebar() {
  const { player, walletAddress } = useAuth();
  const displayName = player?.name?.trim() || (walletAddress ? shortenWalletChip(walletAddress) : "Pilot");
  const [activeFeed, setActiveFeed] = useState("feed");

  return (
    <aside className="flex flex-col gap-5 overflow-y-auto border-b border-white/[0.06] bg-[hsl(268_35%_5%/0.97)] px-4 py-5 lg:max-h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r">
      {/* Profile */}
      <div className="rounded-xl border border-neon-purple/25 bg-[hsl(268_28%_10%/0.85)] p-3 shadow-[inset_0_1px_0_hsl(278_88%_62%/0.12)]">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-neon-purple/60 to-neon-cyan/25 ring-2 ring-neon-purple/35" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-foreground">{displayName}</p>
            <p className="truncate text-[10px] font-mono text-muted-foreground">The Shadow Clan · L42</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            <span>Season XP</span>
            <span className="text-neon-purple">12,450 / 25k</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/55">
            <div className="h-full w-[49%] rounded-full bg-gradient-to-r from-neon-purple to-neon-pink shadow-[0_0_12px_hsl(278_88%_62%/0.65)]" />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn-eye relative w-full rounded-xl py-3 font-display text-xs font-black tracking-[0.2em]"
      >
        + CREATE MOMENT
      </button>

      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
          Feed
        </p>
        <nav className="space-y-0.5">
          {feedLinks.map((link) => {
            const Icon = link.icon;
            const on = activeFeed === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setActiveFeed(link.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                  on
                    ? "border-l-2 border-neon-purple bg-neon-purple/14 text-neon-purple"
                    : "border-l-2 border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
          <Radio className="h-3 w-3 text-red-400" aria-hidden />
          Live Now
        </p>
        <ul className="space-y-2">
          {liveGames.map((g) => (
            <li
              key={g.name}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/35 px-2.5 py-2 text-xs"
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/55" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                {g.name}
              </span>
              <span className={cn("font-mono text-[10px]", g.accent)}>{g.viewers}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
          Community
        </p>
        <nav className="space-y-0.5">
          {communityLinks.map((label) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
            >
              <Trophy className="h-3.5 w-3.5 text-neon-cyan/80" aria-hidden />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto rounded-xl border border-neon-purple/30 bg-[linear-gradient(145deg,hsl(268_32%_12%/0.95),hsl(220_50%_6%/0.9))] p-3">
        <p className="font-display text-[10px] font-bold tracking-widest text-neon-purple">AI ARENA</p>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">Season 1 placements open — squad up.</p>
        <Link to="/ai-arena" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-neon-cyan hover:underline">
          <Flame className="h-3 w-3" aria-hidden /> JOIN ARENA
        </Link>
      </div>
    </aside>
  );
}
