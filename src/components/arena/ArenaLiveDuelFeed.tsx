import battleImg from "@/assets/battle-1.jpg";
import { Play } from "lucide-react";
import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";

export function ArenaLiveDuelFeed() {
  const leaderboardQ = useAiArenaGlobalLeaderboard();

  const left = leaderboardQ.data?.entries?.[0];
  const right = leaderboardQ.data?.entries?.[1];

  return (
    <div className="glass-panel rounded-2xl p-5">
      <DuelFeedHeader />
      <DuelFeedContent left={left} right={right} />
    </div>
  );
}

function DuelFeedHeader() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-display text-sm font-bold tracking-wider">LIVE DUEL FEED</h3>
      <span className="flex items-center gap-1.5 rounded border border-destructive/40 bg-destructive/20 px-2 py-1 text-[10px] font-bold text-destructive">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-destructive" /> LIVE
      </span>
    </div>
  );
}

function DuelFeedContent({
  left,
  right,
}: {
  left?: { name: string; eloRating: number };
  right?: { name: string; eloRating: number };
}) {
  return (
    <>
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img src={battleImg} alt="Live battle" width={768} height={512} className="h-44 w-full object-cover" loading="lazy" />
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/45"
          aria-label="Watch live battle"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/90 text-background shadow-[0_0_24px_hsl(195_100%_50%/0.5)]">
            <Play className="ml-0.5 h-6 w-6" />
          </span>
        </button>
        <span className="absolute right-3 top-3 rounded bg-background/70 px-2 py-1 font-display text-xs backdrop-blur-sm">02:45</span>
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded bg-destructive/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
          <span className="live-dot h-1 w-1 rounded-full bg-white" /> LIVE
        </span>
      </div>

      <DuelFeedRowNames left={left} right={right} />
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>ELO {left?.eloRating ?? 2056}</span>
        <span>ELO {right?.eloRating ?? 1987}</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <DuelFeedBar />
      </div>
      <button type="button" className="w-full text-center font-display text-xs tracking-widest text-neon-purple transition hover:text-neon-cyan">
        WATCH LIVE BATTLE →
      </button>
    </>
  );
}

function DuelFeedRowNames({
  left,
  right,
}: {
  left?: { name: string; eloRating: number };
  right?: { name: string; eloRating: number };
}) {
  return (
    <div className="mb-2 flex items-center justify-between text-sm font-semibold">
      <span>{left?.name ?? "ShadowByte"}</span>
      <span className="text-xs font-normal text-muted-foreground">vs</span>
      <span>{right?.name ?? "NovaStrike"}</span>
    </div>
  );
}

function DuelFeedBar() {
  return (
    <div
      className="h-full rounded-full"
      style={{ width: "62%", background: "linear-gradient(90deg, hsl(195 100% 60%), hsl(270 80% 65%))" }}
    />
  );
}
