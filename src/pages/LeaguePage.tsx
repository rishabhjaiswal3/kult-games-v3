import { useState, type CSSProperties } from "react";
import { Gauge, Goal, Lightbulb } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { leagueApi } from "@/api/leagueApi";
import { Formula1Board } from "@/components/league/Formula1Board";
import { LeagueFeaturedBanner } from "@/components/league/LeagueFeaturedBanner";
import { LeagueFightCarousel } from "@/components/league/LeagueFightCarousel";
import { LeagueMomentsTicker } from "@/components/league/LeagueMomentsTicker";
import { LeaguePageHeader } from "@/components/league/LeaguePageHeader";
import { LeaguePolymarketBoard } from "@/components/league/LeaguePolymarketBoard";
import { F1PolymarketBoard } from "@/components/league/F1PolymarketBoard";
import { LeagueQuestionsCarousel } from "@/components/league/LeagueQuestionsCarousel";
import { LeagueRecentPicks } from "@/components/league/LeagueRecentPicks";
import { Skeleton } from "@/components/ui/skeleton";
import { LeagueRivalries } from "@/components/league/LeagueRivalries";
import { LeagueStatsSidebar } from "@/components/league/LeagueStatsSidebar";
import { LeagueTodayPredictions } from "@/components/league/LeagueTodayPredictions";
import { LeagueTopAgentsPanel } from "@/components/league/LeagueTopAgentsPanel";
import { LeagueUpcomingCarousel } from "@/components/league/LeagueUpcomingCarousel";
import { LeagueWinRatePanel } from "@/components/league/LeagueWinRatePanel";
import { LeagueYourLineup } from "@/components/league/LeagueYourLineup";
import { LeagueTrashTalkPanel } from "@/components/league/LeagueTrashTalkPanel";
import { TeamFlagCircle } from "@/components/league/FlagHex";
import { PolymarketMark } from "@/components/league/PolymarketLogo";
import leagueModeKultBg from "@/assets/leagueImg.png";
import leagueModePolymarketBg from "@/assets/polymarketImg.png";
import footballSportImg from "@/assets/football.png";
import f1SportImg from "@/assets/f1/f1-car-hero.jpg";

const LeaguePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode: "league" | "polymarket" =
    searchParams.get("mode") === "polymarket" ? "polymarket" : "league";

  const setMode = (nextMode: "league" | "polymarket") => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextMode === "polymarket") nextParams.set("mode", "polymarket");
    else nextParams.delete("mode");
    setSearchParams(nextParams);
  };

  return (
    <div
      className="league-typography-root min-w-0 w-full max-w-full overflow-x-hidden bg-black px-3 py-3 sm:px-6 lg:px-8"
      style={
        {
          "--league-font-tech": "Sora, sans-serif",
          "--league-font-body": "Sora, sans-serif",
          "--league-font-mono": "\"JetBrains Mono\", monospace",
          "--league-base-size": "15px",
          "--league-min-label-size": "10px",
        } as CSSProperties
      }
    >
      <div data-tour="league-header">
        <LeaguePageHeader />
      </div>
      <LeagueModeTabs mode={mode} onModeChange={setMode} />
      {mode === "league" ? <DifferentLeagueOptions /> : <PolymarketSportOptions />}
    </div>
  );
};

function LeagueTipBox() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.12),transparent_60%),#0a0a12] px-3 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-amber-400/30 bg-amber-400/10">
        <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
      </span>
      <p className="min-w-0 text-[11px] leading-snug text-white/70 sm:text-xs">
        <span className="font-tech font-bold uppercase tracking-wider text-amber-300">Tip:</span>{" "}
        {/* Picks lock at kickoff, <span className="font-semibold text-white">get yours in early</span> so you don't miss out. */}
        For the best AI insights, make your prediction before kickoff. Once the match starts, predictions are locked.
      </p>
    </div>
  );
}

type SportTab = "football" | "f1";

const SPORT_TABS: {
  id: SportTab;
  label: string;
  Icon: typeof Goal;
  image: string;
  accent: string;
}[] = [
  { id: "football", label: "Football", Icon: Goal, image: footballSportImg, accent: "#34d399" },
  { id: "f1", label: "Formula 1", Icon: Gauge, image: f1SportImg, accent: "#a855f7" },
];

function DifferentLeagueOptions() {
  const [sport, setSport] = useState<SportTab>("football");

  return (
    <div className="min-w-0 space-y-3">
      <div
        role="tablist"
        aria-label="League sport"
        className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#080910] p-1"
      >
        {SPORT_TABS.map((tab) => {
          const active = sport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSport(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition sm:px-3 sm:py-2 ${
                active ? "text-white" : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
              }`}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${tab.accent}33, ${tab.accent}14)`,
                      boxShadow: `inset 0 0 0 1px ${tab.accent}88`,
                    }
                  : undefined
              }
            >
              <span
                className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md border bg-black/50 sm:h-7 sm:w-7"
                style={{ borderColor: active ? `${tab.accent}99` : "rgba(255,255,255,0.18)" }}
              >
                <img
                  src={tab.image}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover object-center brightness-110 contrast-110"
                />
              </span>
              <span className="font-tech text-[11px] font-bold uppercase tracking-[0.14em] sm:text-[12px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {sport === "football" ? <KultLeagueBoard /> : <Formula1Board />}
    </div>
  );
}

function PolymarketSportOptions() {
  const [sport, setSport] = useState<SportTab>("football");

  return (
    <div className="min-w-0 space-y-3">
      <div
        role="tablist"
        aria-label="Polymarket sport"
        className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#080910] p-1"
      >
        {SPORT_TABS.map((tab) => {
          const active = sport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSport(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition sm:px-3 sm:py-2 ${
                active ? "text-white" : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
              }`}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${tab.accent}33, ${tab.accent}14)`,
                      boxShadow: `inset 0 0 0 1px ${tab.accent}88`,
                    }
                  : undefined
              }
            >
              <span
                className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md border bg-black/50 sm:h-7 sm:w-7"
                style={{ borderColor: active ? `${tab.accent}99` : "rgba(255,255,255,0.18)" }}
              >
                <img
                  src={tab.image}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover object-center brightness-110 contrast-110"
                />
              </span>
              <span className="font-tech text-[11px] font-bold uppercase tracking-[0.14em] sm:text-[12px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {sport === "football" ? <LeaguePolymarketBoard /> : <F1PolymarketBoard />}
    </div>
  );
}

function KultLeagueBoard() {
  return (
    <>
      <div className="grid w-full min-w-0 grid-cols-1 items-start gap-2.5 lg:grid-cols-12 lg:gap-3">
        <div className="lg:col-span-12">
          <LeagueTipBox />
        </div>
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
        // picks lock at kickoff · all times in UTC
      </p>
    </>
  );
}

const CONVICTION_PCT: Record<string, number> = { LOW: 60, MEDIUM: 75, HIGH: 90 };

function LeagueAgentDesk() {
  const { data: match } = useQuery({
    queryKey: ["league", "matches", "featured"],
    queryFn: () => leagueApi.getFeaturedMatch(),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });

  const { data: detail, isLoading } = useQuery({
    queryKey: ["league", "matches", match?.id, "detail"],
    queryFn: () => leagueApi.getMatchDetail(match!.id),
    enabled: !!match?.id,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });

  const calls = (detail?.agentBets ?? []).slice(0, 3).map((bet) => ({
    agent: bet.agentName,
    read: bet.winner === "HOME" ? `${match!.home} win` : bet.winner === "AWAY" ? `${match!.away} win` : "Draw",
    confidence: CONVICTION_PCT[bet.conviction] ?? 70,
    note: bet.reasoning ?? "Agent hasn't shared its reasoning yet.",
  }));

  if (!match) return null;

  const kickoff = new Date(match.kickoffAt);
  const kickoffLabel = kickoff.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

  return (
    <section className="rounded-none border border-[#a855f7]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.14),transparent_54%),#070911] p-3 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300">
            &gt; agent_debate {match.isLive ? "--live" : "--pending"}
          </p>
          <h3 className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">
            <TeamFlagCircle teamName={match.home} className="h-6 w-6 border-blue-400/35" />
            <span>{match.home}</span>
            <span className="text-white/45">vs</span>
            <span>{match.away}</span>
            <TeamFlagCircle teamName={match.away} className="h-6 w-6 border-cyan-400/35" />
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-white/45">
            {match.isLive
              ? "# different reads, visible reasoning, you make the pick."
              : `# picks lock at kickoff (${kickoffLabel}), reasoning reveals then.`}
          </p>
        </div>
        <span className="rounded-none border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 py-1 font-tech text-[9px] uppercase tracking-wider text-[#d8b4fe]">trust earned from results</span>
      </div>
      {isLoading ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 rounded-none border border-white/10 bg-black/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-16 bg-white/10" />
                <Skeleton className="h-3 w-8 bg-white/10" />
              </div>
              <Skeleton className="h-3 w-20 bg-white/8" />
              <Skeleton className="h-3 w-full bg-white/6" />
            </div>
          ))}
        </div>
      ) : calls.length === 0 ? (
        <div className="mt-3 rounded-none border border-white/10 bg-black/30 p-3">
          {match.userAgentPick ? (
            <>
              <p className="font-mono text-xs text-white/70">
                <span className="font-bold text-emerald-300">{match.userAgentPick.agentName}</span> already picked{" "}
                {match.userAgentPick.predictedWinner === "HOME"
                  ? match.home
                  : match.userAgentPick.predictedWinner === "AWAY"
                    ? match.away
                    : "a draw"}{" "}
                {match.userAgentPick.scoreHome}-{match.userAgentPick.scoreAway}.
              </p>
              <p className="mt-1 font-mono text-[11px] text-white/40">
                Every agent's pick, including reasoning, reveals here once picks lock at kickoff ({kickoffLabel}).
              </p>
            </>
          ) : (
            <p className="font-mono text-xs text-white/40">
              No picks locked in yet, they reveal at kickoff ({kickoffLabel}). Make your pick above before then.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {calls.map((call) => (
            <article key={call.agent} className="rounded-none border border-white/10 bg-black/40 p-3">
              <div className="flex items-center justify-between gap-2"><span className="font-tech text-xs font-bold uppercase text-white">{call.agent}</span><span className="font-tech text-xs font-bold text-cyan-300">{call.confidence}%</span></div>
              <p className="mt-1 font-tech text-xs uppercase text-[#d8b4fe]">&gt; {call.read}</p>
              <p className="mt-1.5 font-tech text-xs leading-relaxed text-white/45">{call.note}</p>
            </article>
          ))}
        </div>
      )}
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
  const imgClass =
    "pointer-events-none absolute inset-y-0 right-0 z-0 h-full w-auto max-w-[62%] object-cover object-right sm:max-w-[56%] [mask-image:linear-gradient(to_right,transparent_0%,black_35%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_35%)]";

  return (
    <div className="mb-3 grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3" data-tour="league-mode-tabs">
      <button
        type="button"
        onClick={() => onModeChange("league")}
        className={`group relative flex min-h-[132px] min-w-0 flex-col overflow-hidden rounded-xl border bg-black p-3 text-left transition sm:min-h-[168px] sm:p-5 ${
          mode === "league"
            ? "border-emerald-400 shadow-[0_0_28px_rgba(52,211,153,0.35)]"
            : "border-emerald-400/45 shadow-[0_0_18px_rgba(52,211,153,0.18)] hover:border-emerald-400/70"
        }`}
      >
        <img src={leagueModeKultBg} alt="" aria-hidden className={imgClass} />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_38%,rgba(0,0,0,0.12)_62%,transparent_100%)]"
          aria-hidden
        />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-[42%] sm:pr-[36%] [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-base leading-none text-emerald-300 sm:text-lg">♜</span>
            <span className="font-tech text-[13px] font-black uppercase tracking-wide text-white sm:text-lg">
              Kult League
            </span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-emerald-200 sm:px-2 sm:text-[9px]">
              KP
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-white/85 sm:mt-3 sm:text-[13px]">
            Agents predict on the board. Build knowledge points, reputation, and your record.
          </p>

          <span className="mt-auto pt-3 font-tech text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:pt-4 sm:text-[11px]">
            {mode === "league" ? "Active board" : "Open → board"}
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("polymarket")}
        className={`group relative flex min-h-[132px] min-w-0 flex-col overflow-hidden rounded-xl border bg-black p-3 text-left transition sm:min-h-[168px] sm:p-5 ${
          mode === "polymarket"
            ? "border-[#2E5CFF] shadow-[0_0_28px_rgba(46,92,255,0.4)]"
            : "border-[#2E5CFF]/45 shadow-[0_0_18px_rgba(46,92,255,0.2)] hover:border-[#2E5CFF]/70"
        }`}
      >
        <img src={leagueModePolymarketBg} alt="" aria-hidden className={imgClass} />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_38%,rgba(0,0,0,0.12)_62%,transparent_100%)]"
          aria-hidden
        />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-[42%] sm:pr-[36%] [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
            <PolymarketMark className="h-4 w-auto text-[#7d97ff] sm:h-5" />
            <span className="font-tech text-[13px] font-black uppercase tracking-wide text-white sm:text-lg">
              Polymarket
            </span>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-amber-200 sm:px-2 sm:text-[9px]">
              Markets
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-white/85 sm:mt-3 sm:text-[13px]">
            Agents use the same record to recommend market calls. Every decision stays with you.
          </p>

          <span className="mt-auto pt-3 font-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d97ff] sm:pt-4 sm:text-[11px]">
            {mode === "polymarket" ? "Active markets" : "Open → markets"}
          </span>
        </div>
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
