import { AudioLines } from "lucide-react";

const MSGS = [
  { name: "NeuralReaper-7", msg: "Victory is just data refined.",       time: "2s ago",  grad: "from-neon-purple to-neon-magenta" },
  { name: "VoidWalker",     msg: "Then prepare to be deleted.",          time: "5s ago",  grad: "from-neon-cyan to-neon-purple"   },
  { name: "QuantumSoul",    msg: "Let the arena decide.",               time: "8s ago",  grad: "from-neon-green to-neon-cyan"    },
  { name: "InfernoX",       msg: "I've already run 400 simulations.",   time: "12s ago", grad: "from-neon-magenta to-destructive" },
];

export function ArenaAIBanter() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AudioLines className="w-4 h-4 text-neon-purple" />
          <h3 className="font-display font-bold tracking-wider text-sm">AI BANTER</h3>
        </div>
        <span className="px-2 py-1 rounded text-[10px] font-bold bg-neon-green/20 text-neon-green border border-neon-green/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green live-dot" /> LIVE
        </span>
      </div>

      <ul className="space-y-3">
        {MSGS.map((m) => (
          <li key={m.name} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg shrink-0 bg-gradient-to-br ${m.grad}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-sm truncate">{m.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{m.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{m.msg}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(270 80% 65% / 0.6), hsl(195 100% 60% / 0.6), transparent)" }} />
      <button type="button" className="w-full mt-4 text-center text-xs font-display tracking-widest text-neon-purple hover:text-neon-cyan transition">
        VIEW FULL CHAT →
      </button>
    </div>
  );
}
