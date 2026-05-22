import { useState } from "react";
import {
  Activity,
  Award,
  Clock,
  Hexagon,
  Info,
  Plus,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import {
  averageStats,
  getRadarPoints,
  queueSessions,
  radarLabels,
  strategyStats,
  trainingBoosts,
  trainingPrograms,
  trainingTabs,
} from "@/components/training/trainingData";

const TrainingPage = () => {
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");

  return (
    <ArenaPageLayout>
      <div>
        <h1 className="font-tech text-3xl font-bold uppercase tracking-tight text-white">TRAINING CENTER</h1>
        <p className="mt-1 text-[11px] font-medium text-white/55">
          Train, upgrade, and evolve your AI agents to unlock their full potential.
        </p>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">TRAINING POINTS</span>
            <span className="font-tech block text-xl font-bold text-white">2,450</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <Zap className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">SESSIONS TODAY</span>
            <span className="font-tech block text-xl font-bold text-white">3 / 5</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Activity className="h-4.5 w-4.5 animate-pulse" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">TOTAL XP EARNED</span>
            <span className="font-tech block text-xl font-bold text-white">125,680</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <Award className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex items-center justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="space-y-1">
            <span className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">AVG IMPROVEMENT</span>
            <div className="flex items-center gap-1.5">
              <span className="font-tech text-xl font-bold text-white">+24.6%</span>
              <span className="select-none rounded border border-emerald-500/20 bg-emerald-500/10 px-1 py-0.5 text-[9px] font-bold text-emerald-400">
                This Week
              </span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="arena-panel flex flex-col justify-between border-white/8 bg-[#04080f]/90 p-4">
          <div className="flex justify-between font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">
            <span>NEXT REWARD</span>
            <span className="text-white/60">5,000 XP</span>
          </div>
          <div className="mt-1.5 space-y-1.5">
            <div className="flex items-baseline justify-between text-[10px] font-semibold text-white/70">
              <span>In 2 Sessions</span>
              <span className="font-tech text-[9px]">4,250 / 5,000</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[#9a35ff]" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="arena-panel border-white/8 bg-[#04080f]/95 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {trainingTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-wider transition ${
                activeTab === tab ? "bg-[#9a35ff] text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_376px]">
        <div className="min-w-0 space-y-4">
          <div className="arena-panel overflow-hidden border-white/8 bg-[#04080f]/95">
            <div className="flex items-center justify-between border-b border-white/8 p-5">
              <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">TRAINING QUEUE</h3>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded border border-purple-500/35 bg-[#9a35ff]/10 px-3 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-purple-400 transition hover:border-purple-400 hover:bg-[#9a35ff]/20"
              >
                <Plus className="h-3 w-3" />
                <span>ADD TO QUEUE</span>
              </button>
            </div>
            <div className="space-y-4 divide-y divide-white/6 p-5">
              {queueSessions.map((session, idx) => (
                <div
                  key={session.agent}
                  className={`flex flex-wrap items-center justify-between gap-4 ${idx === 0 ? "pb-4" : idx === queueSessions.length - 1 ? "pt-4" : "py-4"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
                      <img src={session.image} alt={session.agent} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold leading-none text-white">{session.agent}</span>
                        <Hexagon className="h-3 w-3 fill-[#9a35ff] text-[#9a35ff]" />
                      </div>
                      <span className="block text-[9px] text-white/40">{session.clan}</span>
                    </div>
                  </div>
                  <div className="min-w-[200px] flex-1 space-y-1.5">
                    <div className="flex items-baseline justify-between text-[10px] font-semibold text-white/50">
                      <span className="font-bold leading-tight text-white">{session.title}</span>
                      <span className="font-tech">{session.pct}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-[#9a35ff]" style={{ width: `${session.pct}%` }} />
                    </div>
                    <span className="block text-[8px] font-medium leading-none text-white/35">{session.hint}</span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="flex items-center gap-1 font-tech text-[10px] font-semibold text-white/55">
                      <Clock className="h-3.5 w-3.5 text-white/30" />
                      <span>{session.time}</span>
                    </div>
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-1 rounded border border-white/8 bg-[#0a0f1b]/60 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-purple-400 transition hover:border-purple-500/35 hover:bg-purple-950/10"
                    >
                      <span>SPEED UP</span>
                      <Zap className="h-3 w-3 fill-current" />
                      <span className="font-tech font-semibold text-white/40">{session.cost}</span>
                    </button>
                    <button type="button" className="cursor-pointer p-1 text-white/30 transition hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/8 bg-white/[0.005] px-5 py-4 font-tech text-[10px] font-bold uppercase text-white/40">
              <span>QUEUED SESSIONS &bull; 3 / 3</span>
              <span className="text-white/70">TOTAL TIME: 07:24:65</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">TRAINING PROGRAMS</h3>
              <button type="button" className="cursor-pointer font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 transition hover:text-purple-300">
                View All Programs
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trainingPrograms.map((prog) => (
                <div key={prog.name} className={`arena-panel relative flex flex-col justify-between space-y-4 overflow-hidden border p-4.5 transition ${prog.color}`}>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase leading-tight text-white/90">{prog.name}</h4>
                    <p className="text-[10px] font-semibold leading-relaxed text-white/50">{prog.desc}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="select-none rounded border bg-black/40 px-2 py-0.5 font-tech text-[8px] font-black uppercase tracking-wide">
                        {prog.badge}
                      </span>
                      <span className="font-tech text-[9px] font-bold text-emerald-400">{prog.pct}</span>
                      <span className="font-tech text-[9px] font-semibold text-white/40">{prog.winRate}</span>
                    </div>
                    <button type="button" className="cursor-pointer rounded border border-white/8 bg-[#0a0f1b]/60 px-4 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white transition hover:border-purple-500/35 hover:bg-[#9a35ff]/10 hover:text-purple-400">
                      SELECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="arena-panel relative space-y-4 overflow-hidden border-white/8 bg-[#04080f]/95 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">TRAINING BOOSTS</h3>
              <button type="button" className="cursor-pointer font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300">
                View All
              </button>
            </div>
            <div className="space-y-3.5">
              {trainingBoosts.map((boost) => (
                <div key={boost.name} className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border ${
                      boost.color === "purple"
                        ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                        : boost.color === "blue"
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                          : boost.color === "amber"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {boost.icon === "sparkles" && <Sparkles className="h-5 w-5 fill-current" />}
                    {boost.icon === "zap" && <Zap className="h-5 w-5 animate-pulse fill-current" />}
                    {boost.icon === "activity" && <Activity className="h-5 w-5 fill-current" />}
                    {boost.icon === "award" && <Award className="h-5 w-5 fill-current" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5 text-[10px] font-semibold text-white/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold leading-none text-white">{boost.name}</span>
                      <button type="button" className="cursor-pointer rounded border border-purple-500/35 bg-[#9a35ff]/10 px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-purple-400 transition hover:bg-[#9a35ff]/20">
                        USE
                      </button>
                    </div>
                    <div className="flex items-baseline justify-between text-[9px] leading-none text-white/30">
                      <span>{boost.desc}</span>
                      <span className="font-tech text-white/40">{boost.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="arena-panel relative space-y-4 overflow-hidden border-white/8 bg-[#04080f]/95 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">TRAINING ANALYTICS</h3>
              <select className="cursor-pointer rounded border border-white/8 bg-[#03070d]/60 px-2.5 py-1 text-[9px] font-semibold text-white/70 outline-none hover:text-white">
                <option>This Week</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="relative flex justify-center py-2">
              <svg className="aspect-square w-full max-w-[210px] overflow-visible" viewBox="0 0 200 200">
                {[0.25, 0.5, 0.75, 1.0].map((scale) => (
                  <polygon
                    key={scale}
                    points={getRadarPoints([100, 100, 100, 100, 100, 100], scale)}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.04)"
                    strokeWidth="1"
                  />
                ))}
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i * 60 - 90) * (Math.PI / 180);
                  const x = 100 + 70 * Math.cos(angle);
                  const y = 100 + 70 * Math.sin(angle);
                  return <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />;
                })}
                <polygon points={getRadarPoints(averageStats)} fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="2,2" strokeWidth="1" />
                <polygon
                  points={getRadarPoints(strategyStats)}
                  fill="rgba(154, 53, 255, 0.15)"
                  stroke="#9a35ff"
                  strokeWidth="1.5"
                  className="drop-shadow-[0_0_8px_rgba(154,53,255,0.4)]"
                />
                {strategyStats.map((val, i) => {
                  const angle = (i * 60 - 90) * (Math.PI / 180);
                  const r = (val / 100) * 70;
                  const x = 100 + r * Math.cos(angle);
                  const y = 100 + r * Math.sin(angle);
                  return <circle key={i} cx={x} cy={y} r="3" fill="#9a35ff" stroke="#fff" strokeWidth="0.75" />;
                })}
                {radarLabels.map((lbl, i) => {
                  const angle = (i * 60 - 90) * (Math.PI / 180);
                  const x = 100 + 82 * Math.cos(angle);
                  const y = 100 + 82 * Math.sin(angle);
                  const anchor = i === 0 || i === 3 ? "middle" : i < 3 ? "start" : "end";
                  return (
                    <g key={lbl}>
                      <text x={x} y={y - 2} textAnchor={anchor} fill="rgba(255, 255, 255, 0.5)" fontSize="7.5" fontWeight="600" className="uppercase tracking-wider">
                        {lbl}
                      </text>
                      <text x={x} y={y + 6} textAnchor={anchor} fill="#fff" fontSize="8" fontWeight="bold" className="font-tech">
                        {strategyStats[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4 text-[9px] font-semibold tracking-wider text-white/50">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm border border-[#9a35ff] bg-[#9a35ff]/20" />
                <span>YOUR AGENTS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-2.5 border-t border-dashed border-white/35" />
                <span>AVERAGE</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="arena-panel flex items-center gap-3 border-white/8 bg-[#04080f]/95 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
          <Info className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">
            Consistent training is the key to supremacy.
          </h4>
          <p className="text-[9px] font-semibold leading-none text-white/40">
            Keep your agents training to stay ahead in the Arena.
          </p>
        </div>
      </div>
    </ArenaPageLayout>
  );
};

export default TrainingPage;
