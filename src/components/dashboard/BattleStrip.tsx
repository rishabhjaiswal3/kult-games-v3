import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import agentAegis from "@/assets/agent-aegis.jpg";
import agentNexus from "@/assets/agent-nexus.jpg";
import agentRage from "@/assets/agent-rageborn.jpg";
import agentShadow from "@/assets/agent-shadow.jpg";
import agentVoid from "@/assets/agent-voidwalker.jpg";

export function BattleStrip() {
  const cards = [
    {
      title: "Ranked Battle",
      sub: "Diamond League",
      left: agentAegis,
      right: agentShadow,
      time: "Today, 08:00 PM",
      reward: "+25 $ARENA",
      color: "#0089ff",
    },
    {
      title: "Arena Championship",
      sub: "Round 2",
      left: agentNexus,
      right: agentVoid,
      time: "Tomorrow, 06:00 PM",
      reward: "+50 $ARENA",
      color: "#8b29ff",
    },
    {
      title: "Community Battle",
      sub: "Open Arena",
      left: agentRage,
      right: agentVoid,
      time: "May 18, 07:00 PM",
      reward: "+10 $ARENA",
      color: "#f4b400",
    },
  ];

  return (
    <section>
      <div className="mb-4 flex items-center gap-4">
        <h3 className="font-tech text-xs uppercase">Battles</h3>
        <div className="h-px flex-1 bg-white/8" />
      </div>
      <div className="relative grid gap-3 md:grid-cols-3">
        <button
          type="button"
          className="absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#050913] md:grid"
          aria-label="Previous battles"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {cards.map((card) => (
          <div key={card.title} className="arena-panel relative h-[178px] overflow-hidden p-4">
            <div className="relative z-10 flex items-start gap-3">
              <Shield className="h-8 w-8" style={{ color: card.color }} />
              <div className="font-tech text-[10px] uppercase">
                <div>{card.title}</div>
                <div className="mt-1 text-white/55">{card.sub}</div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-[1fr_auto_1fr] items-end gap-1 px-3">
              <img src={card.left} alt="" className="h-28 w-full object-cover object-top opacity-90" />
              <span className="pb-12 font-tech text-5xl italic text-white/52">VS</span>
              <img src={card.right} alt="" className="h-28 w-full object-cover object-top opacity-90" />
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10 flex justify-between bg-gradient-to-t from-[#070a13] to-transparent px-4 pb-3 pt-8 text-xs">
              <span className="text-white/58">{card.time}</span>
              <span className="text-[#00f080]">{card.reward}</span>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#050913] md:grid"
          aria-label="Next battles"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
