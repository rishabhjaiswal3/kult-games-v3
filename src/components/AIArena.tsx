import { ArenaHero } from "@/components/arena/ArenaHero";
import { ArenaLiveDuelFeed } from "@/components/arena/ArenaLiveDuelFeed";
import { ArenaLiveBattles } from "@/components/arena/ArenaLiveBattles";
import { LiveArenaActivity } from "@/components/arena/ArenaSidePanels";
import { ArenaInfraStrip } from "@/components/arena/ArenaInfraStrip";
import { ArenaAgentsBoard } from "@/components/arena/ArenaAgentsBoard";
import ArenaMatchmakingPanel from "@/components/ArenaMatchmakingPanel";

const AIArena = () => {
  return (
    <div className="relative min-h-screen bg-transparent">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(270 82% 58% / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(270 82% 58% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -20%, hsl(270 80% 45% / 0.12), transparent 55%), radial-gradient(ellipse 80% 50% at 100% 50%, hsl(195 100% 50% / 0.06), transparent 45%)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-[1600px] space-y-6 px-4 pb-12 pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:px-6 md:px-8 md:pb-16 lg:space-y-8 lg:pb-20">
        {/* Hero + live stack — aligned top, consistent gutter */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-8">
            <ArenaHero />
          </div>
          <aside className="flex min-w-0 flex-col gap-6 lg:col-span-4">
            <ArenaLiveDuelFeed />
            <LiveArenaActivity />
          </aside>
        </div>

        <ArenaAgentsBoard />

        <ArenaLiveBattles />

        <ArenaInfraStrip />

        <ArenaMatchmakingPanel />
      </main>
    </div>
  );
};

export default AIArena;
