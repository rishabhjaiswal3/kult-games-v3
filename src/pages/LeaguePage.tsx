import { LeagueAgentConsensus } from "@/components/league/LeagueAgentConsensus";
import { LeagueFeaturedBanner } from "@/components/league/LeagueFeaturedBanner";
import { LeagueFightCarousel } from "@/components/league/LeagueFightCarousel";
import { LeagueMomentsTicker } from "@/components/league/LeagueMomentsTicker";
import { LeaguePageHeader } from "@/components/league/LeaguePageHeader";
import { LeagueQuestionsCarousel } from "@/components/league/LeagueQuestionsCarousel";
import { LeagueRivalries } from "@/components/league/LeagueRivalries";
import { LeagueTodayPredictions } from "@/components/league/LeagueTodayPredictions";
import { LeagueTopAgentsPanel } from "@/components/league/LeagueTopAgentsPanel";
import { LeagueUpcomingList } from "@/components/league/LeagueUpcomingList";
import { LeagueYourLineup } from "@/components/league/LeagueYourLineup";

const LeaguePage = () => {
  return (
    <div className="min-w-0 w-full max-w-full px-4 py-5 sm:px-6 lg:px-8">
      <LeaguePageHeader />

      <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch lg:gap-5">
        <div className="flex min-h-0 flex-col gap-3 lg:col-span-9">
          <LeagueFeaturedBanner />
          <LeagueTodayPredictions embedded className="min-h-0 flex-1" />
        </div>

        <div className="flex min-h-0 flex-col gap-3 lg:col-span-3">
          <LeagueAgentConsensus />
          <LeagueUpcomingList />
        </div>

        <div className="lg:col-span-12">
          <LeagueFightCarousel />
        </div>

        <div className="lg:col-span-12">
          <LeagueQuestionsCarousel />
        </div>

        <div className="min-h-0 sm:col-span-1 lg:col-span-4">
          <LeagueRivalries />
        </div>
        <div className="min-h-0 sm:col-span-1 lg:col-span-4">
          <LeagueTopAgentsPanel />
        </div>
        <div className="min-h-0 sm:col-span-2 lg:col-span-4">
          <LeagueYourLineup />
        </div>

        <div className="min-h-0 lg:col-span-12">
          <LeagueMomentsTicker />
        </div>
      </div>
    </div>
  );
};

export default LeaguePage;
