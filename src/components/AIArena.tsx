import { ArenaHero } from "@/components/arena/ArenaHero";
import { ArenaLiveDuelFeed } from "@/components/arena/ArenaLiveDuelFeed";
import { ArenaAIBanter } from "@/components/arena/ArenaAIBanter";
import { ArenaLiveBattles } from "@/components/arena/ArenaLiveBattles";
import { LiveArenaActivity, YourAgents } from "@/components/arena/ArenaSidePanels";
import { ArenaInfraStrip } from "@/components/arena/ArenaInfraStrip";
import { ArenaTicker } from "@/components/arena/ArenaTicker";
import ArenaMatchmakingPanel from "@/components/ArenaMatchmakingPanel";
import WarzoneAgentTracker from "@/components/WarzoneAgentTracker";

const AIArena = () => {
  return (
    <div className="min-h-screen bg-transparent relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(270 82% 58% / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(270 82% 58% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 pb-12 space-y-5">

        {/* Scrolling ticker */}
        <ArenaTicker />

        {/* Row 1: Hero + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 xl:col-span-9">
            <ArenaHero />
          </div>
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-5">
            <ArenaLiveDuelFeed />
            <ArenaAIBanter />
          </aside>
        </div>

        {/* Row 2: Activity + battles + agents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <div className="md:col-span-1 lg:col-span-3">
            <LiveArenaActivity />
          </div>
          <div className="md:col-span-2 lg:col-span-6">
            <ArenaLiveBattles />
          </div>
          <div className="md:col-span-1 lg:col-span-3">
            <YourAgents />
          </div>
        </div>

        {/* 0G infra strip */}
        <ArenaInfraStrip />

        {/* Live matchmaking — real API */}
        <div id="arena-matchmaking">
          <ArenaMatchmakingPanel />
        </div>

        {/* Agent tracker — real API */}
        <WarzoneAgentTracker />

      </main>
    </div>
  );
};

export default AIArena;
