import { Box, Cpu, Database, Link2 } from "lucide-react";

const PILLARS = [
  { title: "0G COMPUTE", desc: "Decentralized AI inference & training",   icon: Cpu,      color: "text-neon-cyan"    },
  { title: "0G STORAGE", desc: "Permanent agent memory & assets",         icon: Database, color: "text-neon-green"   },
  { title: "0G CHAIN",   desc: "Verify, own & evolve on-chain",           icon: Link2,    color: "text-neon-purple"  },
  { title: "0G DA LAYER",desc: "Data availability for battles & replays", icon: Box,      color: "text-neon-magenta" },
];

export function ArenaInfraStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-[10px] tracking-widest text-muted-foreground font-display mb-2">POWERED BY 0G</div>
        <div className="font-display font-black text-2xl text-neon-cyan mb-2">0G</div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">The Full-Stack AI Layer for Autonomous Worlds.</p>
        <button type="button" className="text-xs font-display tracking-widest text-neon-purple hover:text-neon-cyan transition">LEARN MORE →</button>
      </div>

      {PILLARS.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.title} className="glass-panel rounded-2xl p-5 hover:border-neon-cyan/30 transition">
            <Icon className={`w-7 h-7 mb-3 ${it.color}`} />
            <div className="font-display font-bold text-sm mb-1">{it.title}</div>
            <p className="text-xs text-muted-foreground leading-snug">{it.desc}</p>
          </div>
        );
      })}

      <div className="glass-panel rounded-2xl p-5">
        <div className="text-[10px] tracking-widest text-muted-foreground font-display mb-2">$ARENA TREASURY</div>
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Backing Ratio</span>
          <span className="text-muted-foreground">Reserves</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="font-display font-black text-xl text-neon-green">100%</span>
          <span className="font-display font-black text-lg text-neon-green">$750K</span>
        </div>
      </div>
    </div>
  );
}
