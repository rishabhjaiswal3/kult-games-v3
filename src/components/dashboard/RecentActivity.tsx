import { Hexagon, Shield, Swords, Trophy } from "lucide-react";

export function RecentActivity() {
  const items = [
    {
      icon: Trophy,
      title: "NEXUS-01 won a Ranked Battle",
      sub: "vs VOIDWALKER",
      value: "+24 $ARENA",
      color: "#00e88f",
      time: "2h ago",
    },
    {
      icon: Shield,
      title: "NEXUS-01 completed training",
      sub: "Stealth Mastery Lv. 3",
      value: "+150 XP",
      color: "#a036ff",
      time: "5h ago",
    },
    {
      icon: Hexagon,
      title: "Autonomous earnings collected",
      sub: "From Arena matches",
      value: "+12.50 $ARENA",
      color: "#f6bb00",
      time: "8h ago",
    },
    {
      icon: Swords,
      title: "NEXUS-01 joined Arena Championship",
      sub: "Round 2",
      value: "",
      color: "#0089ff",
      time: "1d ago",
    },
  ];

  return (
    <section className="arena-panel p-4">
      <h3 className="font-tech text-xs uppercase">Recent Activity</h3>
      <div className="mt-4 divide-y divide-white/7">
        {items.map((item) => (
          <div
            key={item.title}
            className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 py-3"
          >
            <div
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5"
              style={{ color: item.color }}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-xs">
              <div className="truncate text-white/82">{item.title}</div>
              <div className="mt-0.5 text-white/45">{item.sub}</div>
            </div>
            <div className="text-right text-xs">
              {item.value && <div className="font-semibold text-[#00f080]">{item.value}</div>}
              <div className="text-white/45">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
