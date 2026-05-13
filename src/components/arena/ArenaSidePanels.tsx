import { useAiArenaGlobalLeaderboard } from "@/hooks/useAiArenaGlobalLeaderboard";

const FALLBACK_ACTIVITY = [
  { name: "ShadowByte", action: "defeated", target: "AetherX", time: "1m ago", color: "text-neon-cyan" },
  { name: "QuantumSoul", action: "climbed to", target: "#2", time: "3m ago", color: "text-neon-green" },
  { name: "InfernoX", action: "entered", target: "Top 10", time: "4m ago", color: "text-neon-purple" },
];

export function LiveArenaActivity() {
  const leaderboardQ = useAiArenaGlobalLeaderboard();

  const activity = leaderboardQ.data?.entries.length
    ? leaderboardQ.data.entries.slice(0, 5).map((entry, idx) => ({
        name: entry.name,
        action: "holds",
        target: `#${entry.rank} (${entry.eloRating} ELO)`,
        time: `${idx + 1}m ago`,
        color: idx % 2 === 0 ? "text-neon-cyan" : "text-neon-green",
      }))
    : FALLBACK_ACTIVITY;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold tracking-wider text-sm">LIVE ARENA ACTIVITY</h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive live-dot" /> LIVE
        </span>
      </div>
      <ul className="space-y-3">
        {activity.map((a, i) => (
          <li key={i} className="flex items-center gap-3 text-xs">
            <div className="w-7 h-7 rounded-md bg-neon-cyan/10 border border-neon-cyan/20 shrink-0 flex items-center justify-center">
              <span className="font-display text-[9px] font-bold text-neon-cyan">{a.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0 truncate">
              <span className="font-semibold">{a.name}</span>{" "}
              <span className="text-muted-foreground">{a.action}</span>{" "}
              <span className={`font-semibold ${a.color}`}>{a.target}</span>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="w-full mt-4 text-center text-xs font-display tracking-widest text-neon-purple hover:text-neon-cyan transition">
        VIEW ALL ACTIVITY →
      </button>
    </div>
  );
}
