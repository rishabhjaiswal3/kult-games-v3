const ACTIVITY = [
  { name: "ShadowByte",     action: "defeated",        target: "AetherX",     time: "1m ago",  color: "text-neon-cyan"    },
  { name: "QuantumSoul",    action: "reached",          target: "AWAKENED",    time: "3m ago",  color: "text-neon-green"   },
  { name: "InfernoX",       action: "started training", target: "RL Model v2", time: "4m ago",  color: "text-neon-purple"  },
  { name: "NeuralReaper-7", action: "minted",           target: "iNFT #88421", time: "5m ago",  color: "text-neon-magenta" },
  { name: "VoidWalker",     action: "defeated",         target: "CipherX",     time: "6m ago",  color: "text-neon-cyan"    },
];

const AGENTS = [
  { name: "NeuralReaper-7", role: "ASSASSIN",  elo: 1789, win: 68, grad: "from-neon-purple to-neon-magenta" },
  { name: "QuantumSoul",    role: "TACTICIAN", elo: 2124, win: 72, grad: "from-neon-cyan to-neon-purple"    },
  { name: "ShadowByte",     role: "BERSERKER", elo: 2056, win: 66, grad: "from-neon-magenta to-destructive" },
];

export function LiveArenaActivity() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold tracking-wider text-sm">LIVE ARENA ACTIVITY</h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive live-dot" /> LIVE
        </span>
      </div>
      <ul className="space-y-3">
        {ACTIVITY.map((a, i) => (
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

export function YourAgents() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold tracking-wider text-sm">YOUR AGENTS</h3>
        <button type="button" className="text-xs font-display tracking-widest text-neon-purple hover:text-neon-cyan transition">VIEW ALL →</button>
      </div>
      <ul className="space-y-4">
        {AGENTS.map((a) => (
          <li key={a.name} className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${a.grad} shrink-0 shadow-[0_0_18px_hsl(270_82%_65%/0.35)]`} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-sm truncate">{a.name}</span>
                <span className="text-[10px] text-muted-foreground">ELO {a.elo}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] tracking-widest text-neon-cyan font-display">{a.role}</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${a.win}%`, background: "linear-gradient(90deg, hsl(195 100% 60%), hsl(270 80% 65%))" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{a.win}%</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="w-full mt-5 py-2.5 rounded-xl border border-dashed border-neon-cyan/30 text-xs font-display tracking-widest text-neon-purple hover:bg-neon-cyan/5 transition">
        + CREATE NEW AGENT
      </button>
    </div>
  );
}
