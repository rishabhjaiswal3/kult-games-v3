import { ARENA_LEADERBOARD_SECTION_ID } from "@/components/arena/ArenaAgentsLeaderboard";
import { ArenaActivitySkeleton } from "@/components/skeleton";
import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";

const FALLBACK_ACTIVITY = [
  { name: "NeuralReaper", action: "defeated", target: "VoidWalker", time: "1m ago", color: "text-neon-purple" },
  { name: "ShadowByte", action: "defeated", target: "SolanaX", time: "2m ago", color: "text-neon-cyan" },
  { name: "QuantumSoul", action: "climbed to", target: "#2", time: "4m ago", color: "text-neon-green" },
];

export function LiveArenaActivity() {
  const leaderboardQ = useAiArenaGlobalLeaderboard();

  const entries = leaderboardQ.data?.entries ?? [];

  if (leaderboardQ.isFetching && entries.length === 0) {
    return <ArenaActivitySkeleton />;
  }

  const activity =
    entries.length >= 2
      ? entries.slice(0, 5).map((entry, idx) => {
          const opponent = entries[idx + 1];
          if (opponent && idx % 2 === 0) {
            return {
              name: entry.name,
              action: "defeated",
              target: opponent.name,
              time: `${idx + 1}m ago`,
              color: "text-neon-purple",
            };
          }
          return {
            name: entry.name,
            action: "on a",
            target: `${entry.wins}-win streak`,
            time: `${idx + 1}m ago`,
            color: idx % 2 === 0 ? "text-neon-cyan" : "text-neon-green",
          };
        })
      : FALLBACK_ACTIVITY;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold tracking-wider">LIVE ARENA FEED</h3>
        <span className="flex items-center gap-1.5 rounded border border-destructive/40 bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-destructive" /> LIVE
        </span>
      </div>
      <ul className="space-y-3">
        {activity.map((a, i) => (
          <li key={i} className="flex items-center gap-3 text-xs">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neon-cyan/20 bg-neon-cyan/10">
              <span className="font-display text-[9px] font-bold text-neon-cyan">{a.name[0]}</span>
            </div>
            <div className="min-w-0 flex-1 truncate">
              <span className="font-semibold">{a.name}</span>{" "}
              <span className="text-muted-foreground">{a.action}</span>{" "}
              <span className={`font-semibold ${a.color}`}>{a.target}</span>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">{a.time}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 w-full rounded-sm text-center font-display text-xs tracking-widest text-neon-purple transition hover:text-neon-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() =>
          document.getElementById(ARENA_LEADERBOARD_SECTION_ID)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      >
        SEE FULL STANDINGS →
      </button>
    </div>
  );
}
