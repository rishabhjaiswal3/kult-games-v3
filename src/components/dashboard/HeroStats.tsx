import { ArrowUpRight, Box, Swords } from "lucide-react";

export function HeroStats() {
  const stats = [
    { label: "Total Agents", value: "5", icon: Box, color: "#8b35ff" },
    { label: "Total Battles", value: "128", icon: Swords, color: "#0089ff" },
    { label: "Win Rate", value: "62.5%", icon: ArrowUpRight, color: "#00f080" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_490px]">
      <div>
        <div className="font-tech text-[11px] italic text-[#a84cff]">WELCOME BACK,</div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Arena Master</h1>
        <p className="mt-1 text-sm text-white/72">Ready your agents. Dominate the Arena.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="arena-panel flex items-center justify-between p-4">
            <div>
              <div className="font-tech text-[9px] uppercase text-white/45">{stat.label}</div>
              <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            </div>
            <stat.icon className="h-8 w-8" style={{ color: stat.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}
