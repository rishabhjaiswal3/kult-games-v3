import { Box, Cpu, Database, Link2 } from "lucide-react";

const PILLARS = [
  { title: "0G COMPUTE", desc: "Decentralized AI inference & training", icon: Cpu, color: "text-neon-cyan" },
  { title: "0G STORAGE", desc: "Permanent agent memory & assets", icon: Database, color: "text-neon-green" },
  { title: "0G CHAIN", desc: "Verify, own & evolve on-chain", icon: Link2, color: "text-neon-purple" },
  { title: "0G DA LAYER", desc: "Data availability for battles & replays", icon: Box, color: "text-neon-magenta" },
];

export function ArenaInfraStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="glass-panel rounded-2xl p-5">
        <div className="mb-2 font-display text-[10px] tracking-widest text-muted-foreground">POWERED BY 0G</div>
        <div className="mb-2 font-display text-2xl font-black text-neon-cyan">0G</div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          The Full-Stack AI Layer for Autonomous Worlds.
        </p>
        <button
          type="button"
          className="font-display text-xs tracking-widest text-neon-purple transition hover:text-neon-cyan"
        >
          LEARN MORE →
        </button>
      </div>

      {PILLARS.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.title} className="glass-panel rounded-2xl p-5 transition hover:border-neon-cyan/30">
            <Icon className={`mb-3 h-7 w-7 ${it.color}`} />
            <div className="mb-1 font-display text-sm font-bold">{it.title}</div>
            <p className="text-xs leading-snug text-muted-foreground">{it.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
