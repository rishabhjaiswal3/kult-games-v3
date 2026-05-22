import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import agentNexus from "@/assets/agent-nexus.jpg";
import { Metric } from "@/components/dashboard/Metric";

export function AgentPanel() {
  return (
    <section className="arena-panel overflow-hidden">
      <div className="grid lg:grid-cols-[352px_minmax(0,1fr)]">
        <img
          src={agentNexus}
          alt="NEXUS-01"
          className="h-[286px] w-full object-cover object-center lg:h-full"
        />
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded border border-[#8b29ff] px-2 py-1 font-tech text-[10px] text-[#a84cff]">
                GENESIS
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">NEXUS-01</h2>
              <div className="mt-2 text-sm text-[#b8a7ff]">
                ZeroG Clan <span className="px-2 text-white/45">•</span>{" "}
                <span className="text-[#c645ff]">Assassin ♧</span>
              </div>
            </div>
            <span className="rounded-full bg-[#00e58a]/12 px-4 py-2 font-tech text-[10px] text-[#00f080]">
              ACTIVE
            </span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="font-tech text-sm">LV. 12</span>
            <div className="h-1.5 min-w-0 flex-1 rounded-full bg-white/8">
              <div className="h-full w-[48%] rounded-full bg-gradient-to-r from-[#7430ff] to-[#b12eff]" />
            </div>
            <span className="text-xs text-white/58">2,450 / 3,600 XP</span>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-0 rounded-md border border-white/8 bg-white/[0.015] sm:grid-cols-4">
            <Metric label="Battles" value="32" />
            <Metric label="Wins" value="20" />
            <Metric label="Win Rate" value="62.5%" />
            <Metric label="Power Score" value="12,850" icon />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_50px]">
            <Link
              to="/ai-arena"
              className="btn-primary flex h-11 items-center justify-center gap-3 rounded-md font-tech text-xs"
            >
              VIEW AGENT <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/ai-arena"
              className="flex h-11 items-center justify-center rounded-md border border-white/13 bg-transparent font-tech text-xs"
            >
              TRAIN AGENT
            </Link>
            <Link
              to="/ai-arena"
              className="flex h-11 items-center justify-center rounded-md border border-white/13 bg-transparent font-tech text-lg sm:col-start-3"
            >
              ...
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
