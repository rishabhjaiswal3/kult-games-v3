import { useState } from "react";
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
import { PolymarketLogo } from "@/components/league/PolymarketLogo";

const LeaguePage = () => {
  const [mode, setMode] = useState<"league" | "polymarket">("league");

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden bg-black px-3 py-3 sm:px-6 lg:px-8">
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

        <div className="min-w-0 w-full lg:col-span-12">
          <LeagueAgentDesk />
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

      <p className="mt-3 text-center font-mono text-[10px] tracking-wide text-white/30">
        // picks lock 15 minutes before kickoff · all times in UTC
      </p>
    </>
  );
}

function LeagueAgentDesk() {
  const calls = [
    { agent: "Hybrid", read: "Brazil win", confidence: 68, note: "Late-game momentum and squad depth win out." },
    { agent: "Assassin", read: "Argentina upset", confidence: 61, note: "The market is underpricing knockout variance." },
    { agent: "Tactician", read: "Draw", confidence: 54, note: "Both sides are likely to manage risk early." },
  ];

  return (
    <section className="rounded-none border border-[#a855f7]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.14),transparent_54%),#070911] p-3 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300">&gt; agent_debate --live</p>
          <h3 className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">Brazil vs Argentina</h3>
          <p className="mt-0.5 font-mono text-[11px] text-white/45"># different reads, visible reasoning — you make the pick.</p>
        </div>
        <span className="rounded-none border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 py-1 font-tech text-[9px] uppercase tracking-wider text-[#d8b4fe]">trust earned from results</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {calls.map((call) => (
          <article key={call.agent} className="rounded-none border border-white/10 bg-black/40 p-3">
            <div className="flex items-center justify-between gap-2"><span className="font-tech text-[10px] font-bold uppercase text-white">{call.agent}</span><span className="font-tech text-[10px] font-bold text-cyan-300">{call.confidence}%</span></div>
            <p className="mt-1 font-tech text-[10px] uppercase text-[#d8b4fe]">&gt; {call.read}</p>
            <p className="mt-1.5 font-tech text-[10px] leading-relaxed text-white/45">{call.note}</p>
          </article>
        ))}
      </div>
    </section>
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
    <div className="mb-3 flex rounded-none border border-[#a855f7]/20 bg-black p-1.5">
      <button
        type="button"
        onClick={() => onModeChange("league")}
        className={`flex-1 rounded-none px-3 py-2.5 text-left transition sm:px-4 ${mode === "league" ? "bg-[#a855f7]/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.16)]" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}
      >
        <span className="block font-tech text-xs font-bold uppercase tracking-wider">{mode === "league" ? "> " : ""}Kult League</span>
        <span className="mt-0.5 block font-tech text-[10px] text-white/45">agent picks · KP rewards</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("polymarket")}
        className={`flex-1 rounded-none px-3 py-2.5 text-left transition sm:px-4 ${mode === "polymarket" ? "bg-[#a855f7]/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.16)]" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}
      >
        <span className="flex items-center gap-1.5 font-tech text-xs font-bold uppercase tracking-wider">
          <PolymarketLogo className={`h-3.5 w-auto ${mode === "polymarket" ? "text-[#2E5CFF]" : "text-current"}`} />
          <span className="whitespace-nowrap rounded-none border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 font-tech text-[8px] text-cyan-300">COMING SOON</span>
        </span>
        <span className="mt-0.5 block whitespace-nowrap font-tech text-[10px] text-white/45">football markets · USDC / USDT</span>
      </button>
    </div>
  );
}

function SectionKicker({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#a855f7]/15 pb-2">
      <span className="font-mono text-[10px] font-bold text-green-400">$</span>
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#c084fc]">{label}</h2>
      <span className="font-mono text-[11px] text-white/40"># {detail}</span>
    </div>
  );
}

export default LeaguePage;
