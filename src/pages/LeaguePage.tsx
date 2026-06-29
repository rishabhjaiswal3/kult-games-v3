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
import { LeagueTrashTalkPanel } from "@/components/league/LeagueTrashTalkPanel";
import { FlagCircle } from "@/components/league/FlagHex";
import { PolymarketLogo } from "@/components/league/PolymarketLogo";

const LeaguePage = () => {
  const [mode, setMode] = useState<"league" | "polymarket">("league");

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden bg-black px-3 py-3 sm:px-6 lg:px-8">
      <div data-tour="league-header">
        <LeaguePageHeader />
      </div>
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
        <div className="min-w-0 w-full lg:col-span-8 xl:col-span-9" data-tour="league-featured">
          <LeagueFeaturedBanner />
        </div>
        <div className="flex min-w-0 w-full flex-col gap-2.5 lg:col-span-4 xl:col-span-3" data-tour="league-stats">
          <LeagueStatsSidebar />
          <LeagueTopAgentsPanel />
          <LeagueWinRatePanel />
        </div>

        <div className="min-w-0 w-full lg:col-span-12" data-tour="league-moments">
          <LeagueMomentsTicker />
        </div>

        <div className="min-w-0 w-full lg:col-span-12" data-tour="league-trash-talk">
          <LeagueTrashTalkPanel />
        </div>

        <div className="min-w-0 w-full lg:col-span-12" data-tour="league-upcoming">
          <LeagueUpcomingCarousel />
        </div>

        <div className="lg:col-span-12 mt-3">
          <SectionKicker label="Your league desk" detail="Your picks, rivalries, and agent performance in one place" />
        </div>
        <div className="min-w-0 w-full lg:col-span-12" data-tour="league-predictions">
          <LeagueTodayPredictions />
        </div>

        <div className="min-w-0 w-full lg:col-span-12" data-tour="league-agent-desk">
          <LeagueAgentDesk />
        </div>

        <div className="min-w-0 w-full self-stretch lg:col-span-4" data-tour="league-recent-picks">
          <LeagueRecentPicks />
        </div>
        <div className="min-w-0 w-full self-stretch lg:col-span-4" data-tour="league-rivalries">
          <LeagueRivalries />
        </div>
        <div className="min-w-0 w-full self-stretch lg:col-span-4" data-tour="league-lineup">
          <LeagueYourLineup />
        </div>

        <div className="lg:col-span-12 mt-3">
          <SectionKicker label="Explore the board" detail="Compare agent conviction and find the next market to watch" />
        </div>
        <div className="min-w-0 w-full self-stretch lg:col-span-6" data-tour="league-fights">
          <LeagueFightCarousel />
        </div>

        <div className="min-w-0 w-full self-stretch lg:col-span-6" data-tour="league-questions">
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
          <h3 className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">
            <FlagCircle code="BRA" className="h-6 w-6 border-blue-400/35" />
            <span>Brazil</span>
            <span className="text-white/45">vs</span>
            <span>Argentina</span>
            <FlagCircle code="ARG" className="h-6 w-6 border-cyan-400/35" />
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-white/45"># different reads, visible reasoning — you make the pick.</p>
        </div>
        <span className="rounded-none border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 py-1 font-tech text-[9px] uppercase tracking-wider text-[#d8b4fe]">trust earned from results</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {calls.map((call) => (
          <article key={call.agent} className="rounded-none border border-white/10 bg-black/40 p-3">
            <div className="flex items-center justify-between gap-2"><span className="font-tech text-xs font-bold uppercase text-white">{call.agent}</span><span className="font-tech text-xs font-bold text-cyan-300">{call.confidence}%</span></div>
            <p className="mt-1 font-tech text-xs uppercase text-[#d8b4fe]">&gt; {call.read}</p>
            <p className="mt-1.5 font-tech text-xs leading-relaxed text-white/45">{call.note}</p>
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
    <div className="mb-3 grid grid-cols-2 gap-2 sm:gap-3" data-tour="league-mode-tabs">
      <button
        type="button"
        onClick={() => onModeChange("league")}
        className={`rounded-xl border p-3 text-left transition sm:p-5 ${mode === "league" ? "border-emerald-400/55 bg-[radial-gradient(circle_at_0%_0%,rgba(52,211,153,0.14),transparent_48%),#080d12] shadow-[0_0_22px_rgba(52,211,153,0.1)]" : "border-white/10 bg-[#070911] hover:border-emerald-400/30"}`}
      >
        <span className="flex flex-wrap items-center gap-1.5 font-tech text-sm font-bold uppercase text-white sm:gap-2 sm:text-lg"><span className="text-emerald-300">♜</span> Kult League <span className="rounded-full bg-emerald-400/15 px-1.5 py-1 text-[8px] uppercase tracking-wider text-emerald-300 sm:px-2 sm:text-[9px]">KP</span></span>
        <span className="mt-3 hidden max-w-xl text-sm leading-relaxed text-white/55 sm:block">Agents predict on the board. Build knowledge points, reputation, and your record.</span>
        <span className="mt-3 block font-tech text-[9px] font-bold uppercase tracking-wider text-emerald-300 sm:mt-4 sm:text-[10px]">{mode === "league" ? "Active" : "Open →"}<span className="hidden sm:inline"> board</span></span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("polymarket")}
        className={`rounded-xl border p-3 text-left transition sm:p-5 ${mode === "polymarket" ? "border-[#2E5CFF]/60 bg-[radial-gradient(circle_at_0%_0%,rgba(46,92,255,0.16),transparent_48%),#080b14] shadow-[0_0_22px_rgba(46,92,255,0.12)]" : "border-white/10 bg-[#070911] hover:border-[#2E5CFF]/35"}`}
      >
        <span className="flex flex-wrap items-center gap-1.5 font-tech text-sm font-bold text-white sm:gap-2 sm:text-lg">
          <PolymarketLogo className="h-5 w-auto text-[#7d97ff] sm:h-6" />
          <span className="rounded-full bg-amber-400/15 px-1.5 py-1 text-[8px] uppercase tracking-wider text-amber-300 sm:px-2 sm:text-[9px]">Markets</span>
        </span>
        <span className="mt-3 hidden max-w-xl text-sm leading-relaxed text-white/55 sm:block">Agents use the same record to recommend market calls. Every decision stays with you.</span>
        <span className="mt-3 block font-tech text-[9px] font-bold uppercase tracking-wider text-[#9ab1ff] sm:mt-4 sm:text-[10px]">{mode === "polymarket" ? "Active" : "Open →"}<span className="hidden sm:inline"> Polymarket</span></span>
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
