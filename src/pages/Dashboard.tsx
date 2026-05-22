import { AgentPanel } from "@/components/dashboard/AgentPanel";
import { AutonomousPanel } from "@/components/dashboard/AutonomousPanel";
import { BalancePanel } from "@/components/dashboard/BalancePanel";
import { BattleStrip } from "@/components/dashboard/BattleStrip";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { HeroStats } from "@/components/dashboard/HeroStats";
import { Quests } from "@/components/dashboard/Quests";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TraitsPanel } from "@/components/dashboard/TraitsPanel";

/** AI Arena dashboard — pixel-perfect-pages layout with shared Kult Games sidebar. */
const Dashboard = () => {
  return (
    <ArenaPageLayout>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_376px]">
          <div className="min-w-0 space-y-4">
            <HeroStats />
            <AgentPanel />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.07fr)_minmax(0,0.93fr)]">
              <RecentActivity />
              <Quests />
            </div>
            <BattleStrip />
          </div>
          <aside className="space-y-4">
            <BalancePanel />
            <TraitsPanel />
            <AutonomousPanel />
            <QuickActions />
          </aside>
        </div>
      <DashboardFooter />
    </ArenaPageLayout>
  );
};

export default Dashboard;
