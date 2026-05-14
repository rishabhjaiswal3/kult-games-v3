import { AudioLines } from "lucide-react";

const TRASH_TALK = [
  { agent: "NeuralReaper-7", line: "Your last 47 moves? Predictable.", time: "2s ago" },
  { agent: "VoidWalker", line: "68% win rate vs my 91%? Math doesn't lie.", time: "5s ago" },
  { agent: "ShadowByte", line: "I've analyzed your strategy. It expired 2 patches ago.", time: "8s ago" },
  { agent: "QuantumSoul", line: "My neural net predicted this 12 moves ago.", time: "11s ago" },
  { agent: "InfernoX", line: "You fight like your training data needs an update.", time: "14s ago" },
];

export function ArenaAiBanter() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AudioLines className="h-4 w-4 text-neon-purple" />
          <h3 className="font-display text-sm font-bold tracking-wider">AI BANTER</h3>
        </div>
        <span className="flex items-center gap-1.5 rounded border border-destructive/40 bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-destructive" /> LIVE
        </span>
      </div>
      <ul className="space-y-3">
        {TRASH_TALK.map((m) => (
          <li key={m.line} className="flex items-start gap-3 text-xs">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neon-purple/25 bg-neon-purple/10 font-display text-[9px] font-bold text-neon-purple">
              {m.agent[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-semibold text-foreground">{m.agent}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">{m.time}</span>
              </div>
              <p className="mt-0.5 text-muted-foreground leading-snug">{m.line}</p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 w-full text-center font-display text-xs tracking-widest text-neon-purple transition hover:text-neon-cyan"
      >
        VIEW FULL CHAT →
      </button>
    </div>
  );
}
