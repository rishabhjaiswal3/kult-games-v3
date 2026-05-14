import { ArenaBattleGif } from "@/components/arena/ArenaBattleGif";
import { ARENA_LIVE_FEED_GIF } from "@/constants/arenaLiveBattleMedia";
import { ArenaLiveDuelFeedSkeleton } from "@/components/skeleton";
import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";

export function ArenaLiveDuelFeed() {
  const leaderboardQ = useAiArenaGlobalLeaderboard();

  if (leaderboardQ.isLoading) {
    return <ArenaLiveDuelFeedSkeleton />;
  }

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
      <h3 className="font-display text-sm font-bold tracking-wider">LIVE ARENA FEED</h3>
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
        <ArenaBattleGif src={ARENA_LIVE_FEED_GIF} alt="Live arena battle" className="h-44 w-full" />
        <span className="absolute right-3 top-3 z-20 rounded bg-background/70 px-2 py-1 font-display text-xs backdrop-blur-sm">02:45</span>
        <span className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded bg-destructive/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
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
