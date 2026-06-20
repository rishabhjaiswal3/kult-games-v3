import { LeagueFeaturedBanner } from "@/components/league/LeagueFeaturedBanner";
import { LeagueFightCarousel } from "@/components/league/LeagueFightCarousel";
import { LeagueMomentsTicker } from "@/components/league/LeagueMomentsTicker";
import { LeaguePageHeader } from "@/components/league/LeaguePageHeader";
import { LeaguePolymarketBoard } from "@/components/league/LeaguePolymarketBoard";
import { LeagueQuestionsCarousel } from "@/components/league/LeagueQuestionsCarousel";
import { LeagueRecentPicks } from "@/components/league/LeagueRecentPicks";
import { LeagueRivalries } from "@/components/league/LeagueRivalries";
import { LeagueStatsSidebar } from "@/components/league/LeagueStatsSidebar";
import { LeagueTodayPredictions } from "@/components/league/LeagueTodayPredictions";
import { LeagueTopAgentsPanel } from "@/components/league/LeagueTopAgentsPanel";
import { LeagueUpcomingCarousel } from "@/components/league/LeagueUpcomingCarousel";
import { LeagueWinRatePanel } from "@/components/league/LeagueWinRatePanel";
import { LeagueYourLineup } from "@/components/league/LeagueYourLineup";

const LeaguePage = () => {
  const [mode, setMode] = useState<"league" | "polymarket">("league");

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden px-3 py-3 sm:px-6 lg:px-8">
      <LeaguePageHeader />
      <LeagueModeTabs mode={mode} onModeChange={setMode} />
      {mode === "league" ? <KultLeagueBoard /> : <LeaguePolymarketBoard />}
    </div>
  );
};

function KultLeagueBoard() {
  return (
    <>
      <div className="grid w-full min-w-0 grid-cols-1 items-start gap-2.5 lg:grid-cols-12 lg:gap-3">
        <div className="lg:col-span-12">
          <SectionKicker label="Live now" detail="Follow the match, read the room, make your move" />
        </div>
        <div className="min-w-0 w-full lg:col-span-8 xl:col-span-9">
          <LeagueFeaturedBanner />
        </div>
        <div className="flex min-w-0 w-full flex-col gap-2.5 lg:col-span-4 xl:col-span-3">
          <LeagueStatsSidebar />
          <LeagueTopAgentsPanel />
          <LeagueWinRatePanel />
        </div>

        <div className="min-w-0 w-full lg:col-span-12">
          <LeagueMomentsTicker />
        </div>

        <div className="min-w-0 w-full lg:col-span-12">
          <LeagueUpcomingCarousel />
        </div>

        <div className="lg:col-span-12 mt-3">
          <SectionKicker label="Your league desk" detail="Your picks, rivalries, and agent performance in one place" />
        </div>
        <div className="min-w-0 w-full lg:col-span-12">
          <LeagueTodayPredictions />
        </div>

        <div className="min-w-0 w-full self-stretch lg:col-span-4">
          <LeagueRecentPicks />
        </div>
        <div className="min-w-0 w-full self-stretch lg:col-span-4">
          <LeagueRivalries />
        </div>
        <div className="min-w-0 w-full self-stretch lg:col-span-4">
          <LeagueYourLineup />
        </div>

        <div className="lg:col-span-12 mt-3">
          <SectionKicker label="Explore the board" detail="Compare agent conviction and find the next market to watch" />
        </div>
        <div className="min-w-0 w-full lg:col-span-12">
          <LeagueFightCarousel />
        </div>

        <div className="min-w-0 w-full lg:col-span-12">
          <LeagueQuestionsCarousel />
        </div>
      </div>

      <p className="mt-3 text-center font-tech text-[9px] uppercase tracking-widest text-white/30">
        Picks lock 15 minutes before kickoff · All times in UTC
      </p>
    </>
  );
}

function LeagueModeTabs({
  mode,
  onModeChange,
}: {
  mode: "league" | "polymarket";
  onModeChange: (mode: "league" | "polymarket") => void;
}) {
  return (
    <div className="mb-3 flex rounded-xl border border-white/10 bg-black/30 p-1.5">
      <button
        type="button"
        onClick={() => onModeChange("league")}
        className={`flex-1 rounded-lg px-3 py-2.5 text-left transition sm:px-4 ${mode === "league" ? "bg-[#a855f7]/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.16)]" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}
      >
        <span className="block font-tech text-xs font-bold uppercase tracking-wider">Kult League</span>
        <span className="mt-0.5 block text-[10px] text-white/45">Agent picks · KP rewards</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("polymarket")}
        className={`flex-1 rounded-lg px-3 py-2.5 text-left transition sm:px-4 ${mode === "polymarket" ? "bg-[#a855f7]/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.16)]" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}
      >
        <span className="flex items-center gap-1.5 font-tech text-xs font-bold uppercase tracking-wider">
          Polymarket
          <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[8px] text-cyan-300">COMING SOON</span>
        </span>
        <span className="mt-0.5 block text-[10px] text-white/45">USDC / USDT prediction markets</span>
      </button>
    </div>
  );
}

function SectionKicker({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/8 pb-2">
      <h2 className="font-tech text-[10px] font-bold uppercase tracking-[0.24em] text-[#c084fc]">{label}</h2>
      <span className="text-[11px] text-white/40">{detail}</span>
    </div>
  );
}

export default LeaguePage;
import { useState } from "react";
