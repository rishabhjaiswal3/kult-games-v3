import { useEffect, useRef } from "react";
import { Clock3, CloudSun, Flag, Gauge, MapPin, Timer, Trophy, Users } from "lucide-react";
import formula1Video from "@/assets/formula1.mp4";
import { LEAGUE_ARENA_AGENTS, getLeagueAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { LeaguePanel } from "./LeaguePanel";

type DriverPick = {
  id: string;
  name: string;
  team: string;
  number: number;
  color: string;
  odds: number;
  form: string;
};

type TeamPick = {
  id: string;
  name: string;
  short: string;
  color: string;
  odds: number;
  constructors: string;
};

type TimeBand = {
  id: string;
  label: string;
  range: string;
  odds: number;
  agentName: string;
  signal: "YES" | "NO";
  confidence: number;
};

type RaceQuestion = {
  id: string;
  category: string;
  question: string;
  yes: number;
  volume: string;
  agentName: string;
  signal: "YES" | "NO";
  confidence: number;
};

const DRIVERS: DriverPick[] = [
  { id: "ver", name: "Max Verstappen", team: "Red Bull", number: 1, color: "#3671C6", odds: 38, form: "P1 · P2 · P1" },
  { id: "nor", name: "Lando Norris", team: "McLaren", number: 4, color: "#FF8000", odds: 27, form: "P2 · P1 · P3" },
  { id: "lec", name: "Charles Leclerc", team: "Ferrari", number: 16, color: "#E8002D", odds: 18, form: "P3 · P4 · P2" },
  { id: "pia", name: "Oscar Piastri", team: "McLaren", number: 81, color: "#FF8000", odds: 14, form: "P4 · P2 · P5" },
  { id: "ham", name: "Lewis Hamilton", team: "Ferrari", number: 44, color: "#E8002D", odds: 11, form: "P5 · P3 · P4" },
  { id: "rus", name: "George Russell", team: "Mercedes", number: 63, color: "#27F4D2", odds: 8, form: "P6 · P5 · P7" },
  { id: "sai", name: "Carlos Sainz", team: "Williams", number: 55, color: "#64C4FF", odds: 6, form: "P7 · P8 · P6" },
  { id: "alo", name: "Fernando Alonso", team: "Aston Martin", number: 14, color: "#229971", odds: 5, form: "P8 · P9 · P8" },
  { id: "ant", name: "Andrea Kimi Antonelli", team: "Mercedes", number: 12, color: "#27F4D2", odds: 4, form: "P9 · P7 · P10" },
  { id: "gas", name: "Pierre Gasly", team: "Alpine", number: 10, color: "#FF87BC", odds: 3, form: "P11 · P10 · P12" },
  { id: "hul", name: "Nico Hulkenberg", team: "Kick Sauber", number: 27, color: "#52E252", odds: 2, form: "P12 · P11 · P13" },
  { id: "alb", name: "Alexander Albon", team: "Williams", number: 23, color: "#64C4FF", odds: 2, form: "P10 · P12 · P11" },
];

const TEAMS: TeamPick[] = [
  { id: "mcl", name: "McLaren", short: "MCL", color: "#FF8000", odds: 42, constructors: "1st · +87 pts" },
  { id: "rbr", name: "Red Bull", short: "RBR", color: "#3671C6", odds: 28, constructors: "2nd · +12 pts" },
  { id: "fer", name: "Ferrari", short: "FER", color: "#E8002D", odds: 21, constructors: "3rd · −4 pts" },
  { id: "mer", name: "Mercedes", short: "MER", color: "#27F4D2", odds: 9, constructors: "4th · −18 pts" },
  { id: "amr", name: "Aston Martin", short: "AMR", color: "#229971", odds: 6, constructors: "5th · −22 pts" },
  { id: "wil", name: "Williams", short: "WIL", color: "#64C4FF", odds: 5, constructors: "6th · −9 pts" },
  { id: "rbs", name: "Racing Bulls", short: "RBS", color: "#6692FF", odds: 4, constructors: "7th · −14 pts" },
  { id: "has", name: "Haas", short: "HAS", color: "#B6BABD", odds: 3, constructors: "8th · −11 pts" },
  { id: "alp", name: "Alpine", short: "ALP", color: "#FF87BC", odds: 3, constructors: "9th · −8 pts" },
  { id: "sau", name: "Kick Sauber", short: "SAU", color: "#52E252", odds: 2, constructors: "10th · −6 pts" },
];

const PREVIOUS_BEST = "1:32.418";

const TIME_BANDS: TimeBand[] = [
  { id: "fast", label: "Beat PB", range: `Under ${PREVIOUS_BEST}`, odds: 24, agentName: "HYBRID", signal: "YES", confidence: 78 },
  { id: "match", label: "Near PB", range: "1:32.418 – 1:33.100", odds: 41, agentName: "TACTICIAN", signal: "YES", confidence: 84 },
  { id: "slow", label: "Slower run", range: "Over 1:33.100", odds: 35, agentName: "DEFENDER", signal: "NO", confidence: 71 },
  { id: "traffic", label: "Traffic hit", range: "1:33.100 – 1:34.000", odds: 18, agentName: "SUPPORT", signal: "YES", confidence: 66 },
  { id: "wet", label: "Wet pace", range: "Over 1:36.000", odds: 12, agentName: "BERSERKER", signal: "NO", confidence: 59 },
  { id: "qual", label: "Quali delta", range: "Within 0.3s of pole", odds: 31, agentName: "ASSASSIN", signal: "YES", confidence: 73 },
  { id: "deg", label: "High deg", range: "+1.2s late stint", odds: 27, agentName: "HYBRID", signal: "NO", confidence: 68 },
  { id: "clean", label: "Clean air", range: "Under 1:32.000", odds: 15, agentName: "TACTICIAN", signal: "YES", confidence: 62 },
  { id: "safety", label: "SC restart", range: "Restart +0.8s", odds: 22, agentName: "DEFENDER", signal: "YES", confidence: 70 },
  { id: "drs", label: "DRS train", range: "Stuck +0.5s", odds: 29, agentName: "SUPPORT", signal: "NO", confidence: 65 },
];

const QUESTIONS: RaceQuestion[] = [
  { id: "q1", category: "Race winner", question: "Will Max Verstappen win the next Grand Prix?", yes: 38, volume: "$842K", agentName: "HYBRID", signal: "YES", confidence: 82 },
  { id: "q2", category: "Podium", question: "Will both McLarens finish on the podium?", yes: 46, volume: "$512K", agentName: "TACTICIAN", signal: "YES", confidence: 76 },
  { id: "q3", category: "Safety car", question: "Will there be a safety car in the race?", yes: 62, volume: "$391K", agentName: "DEFENDER", signal: "YES", confidence: 88 },
  { id: "q4", category: "Fastest lap", question: "Will Norris set the fastest lap?", yes: 29, volume: "$268K", agentName: "ASSASSIN", signal: "NO", confidence: 64 },
  { id: "q5", category: "Points", question: "Will both Ferraris finish in the points?", yes: 71, volume: "$447K", agentName: "SUPPORT", signal: "YES", confidence: 79 },
  { id: "q6", category: "Weather", question: "Will the race start on slicks?", yes: 78, volume: "$203K", agentName: "BERSERKER", signal: "YES", confidence: 91 },
];

const CARD_BODY_CLASS = "min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 scrollbar-market";

function Formula1Background() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      /* autoplay may be blocked */
    });
  }, []);

  return (
    <div className="absolute inset-0 size-full overflow-hidden" aria-hidden>
      <video
        ref={videoRef}
        src={formula1Video}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full max-w-none object-cover object-[center_20%]"
      />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#05050a] to-transparent sm:h-16" />
    </div>
  );
}

function OddsBar({ value, accent = "bg-red-400" }: { value: number; accent?: string }) {
  return (
    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
      <div className={`h-full rounded-full ${accent}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function DriverIcon({ driver }: { driver: DriverPick }) {
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 font-tech text-[11px] font-black text-white"
      style={{ backgroundColor: `${driver.color}33`, boxShadow: `inset 0 0 0 1px ${driver.color}55` }}
    >
      {driver.number}
    </span>
  );
}

function TeamIcon({ team }: { team: TeamPick }) {
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 font-tech text-[9px] font-black tracking-wide text-white"
      style={{ backgroundColor: `${team.color}33`, boxShadow: `inset 0 0 0 1px ${team.color}55` }}
    >
      {team.short}
    </span>
  );
}

function AgentIcon({ name }: { name: string }) {
  const agent = getLeagueAgent(name);
  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/12 bg-black/40">
      {agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}
    </div>
  );
}

function DriversCard() {
  return (
    <LeaguePanel fill className="flex h-[360px] flex-col overflow-hidden border-red-500/25 bg-[radial-gradient(circle_at_0%_0%,rgba(239,68,68,0.12),transparent_55%),#070911]">
      <div className="mb-2.5 flex shrink-0 items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-red-400/30 bg-red-400/10">
          <Users className="h-3.5 w-3.5 text-red-300" />
        </span>
        <div>
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.16em] text-white">Drivers</h3>
          <p className="font-mono text-[10px] text-white/40">{DRIVERS.length} on the board</p>
        </div>
      </div>
      <ul className={CARD_BODY_CLASS}>
        {DRIVERS.map((driver) => (
          <li key={driver.id} className="rounded-lg border border-white/8 bg-black/25 px-2 py-2">
            <div className="flex items-center gap-2.5">
              <DriverIcon driver={driver} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-tech text-[12px] font-bold text-white">{driver.name}</p>
                  <span className="shrink-0 font-tech text-sm font-black text-red-300">{driver.odds}%</span>
                </div>
                <p className="font-mono text-[10px] text-white/40">
                  {driver.team} · {driver.form}
                </p>
                <OddsBar value={driver.odds} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </LeaguePanel>
  );
}

function TeamsCard() {
  return (
    <LeaguePanel fill className="flex h-[360px] flex-col overflow-hidden border-amber-400/25 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.1),transparent_55%),#070911]">
      <div className="mb-2.5 flex shrink-0 items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-amber-400/30 bg-amber-400/10">
          <Gauge className="h-3.5 w-3.5 text-amber-300" />
        </span>
        <div>
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.16em] text-white">Teams</h3>
          <p className="font-mono text-[10px] text-white/40">Constructors edge</p>
        </div>
      </div>
      <ul className={CARD_BODY_CLASS}>
        {TEAMS.map((team) => (
          <li key={team.id} className="rounded-lg border border-white/8 bg-black/25 px-2 py-2">
            <div className="flex items-center gap-2.5">
              <TeamIcon team={team} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-tech text-[12px] font-bold text-white">{team.name}</p>
                  <span className="shrink-0 font-tech text-sm font-black text-amber-300">{team.odds}%</span>
                </div>
                <p className="font-mono text-[10px] text-white/40">{team.constructors}</p>
                <OddsBar value={team.odds} accent="bg-amber-400" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </LeaguePanel>
  );
}

function TimePossibilityCard() {
  return (
    <LeaguePanel fill className="flex h-[360px] flex-col overflow-hidden border-cyan-400/25 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.1),transparent_55%),#070911]">
      <div className="mb-2.5 flex shrink-0 items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10">
          <Timer className="h-3.5 w-3.5 text-cyan-300" />
        </span>
        <div>
          <h3 className="font-tech text-xs font-bold uppercase tracking-[0.16em] text-white">Time possibility</h3>
          <p className="font-mono text-[10px] text-white/40">Agent predictions vs your PB</p>
        </div>
      </div>

      <div className="mb-2.5 flex shrink-0 items-center justify-between gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/45">Previous best</span>
        </div>
        <span className="font-tech text-sm font-black text-cyan-200">{PREVIOUS_BEST}</span>
      </div>

      <ul className={CARD_BODY_CLASS}>
        {TIME_BANDS.map((band) => (
          <li key={band.id} className="rounded-lg border border-white/8 bg-black/25 px-2 py-2">
            <div className="flex items-center gap-2.5">
              <AgentIcon name={band.agentName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-tech text-[12px] font-bold text-white">{band.label}</p>
                  <span className="shrink-0 font-tech text-sm font-black text-cyan-300">{band.odds}%</span>
                </div>
                <p className="font-mono text-[10px] text-white/55">{band.range}</p>
                <p className={`mt-0.5 font-tech text-[9px] font-bold uppercase tracking-wider ${band.signal === "YES" ? "text-cyan-300" : "text-fuchsia-300"}`}>
                  {band.agentName} · {band.signal} · {band.confidence}%
                </p>
                <OddsBar value={band.odds} accent="bg-cyan-400" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </LeaguePanel>
  );
}

function RaceQuestionCard({ question }: { question: RaceQuestion }) {
  const agent = getLeagueAgent(question.agentName);
  const noCents = 100 - question.yes;

  return (
    <article className="relative overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,200,83,0.08),transparent_55%),#0b0d12] p-3.5 transition hover:border-[#2E5CFF]/45">
      <div className="relative mb-2.5 flex items-center justify-between gap-2">
        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
          {question.category}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-white/40">{question.volume} Vol</span>
      </div>

      <p className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/40">Prediction question</p>
      <p className="mt-0.5 min-h-9 font-tech text-sm font-bold text-white">{question.question}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-emerald-300">
          <span>Buy Yes</span>
          <span>{question.yes}¢</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 font-tech text-xs font-bold uppercase tracking-wider text-rose-300">
          <span>Buy No</span>
          <span>{noCents}¢</span>
        </div>
      </div>

      <div className="relative mt-3 border-t border-white/10 pt-2.5">
        <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/35"># agent signal</p>
        <div
          className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 ${
            question.signal === "YES" ? "border-cyan-400/15 bg-cyan-400/[0.04]" : "border-fuchsia-400/15 bg-fuchsia-400/[0.04]"
          }`}
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">
            {agent ? <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-tech text-[9px] font-bold uppercase text-white">{question.agentName}</p>
            <p className={`mt-0.5 truncate font-tech text-[9px] font-bold ${question.signal === "YES" ? "text-cyan-300" : "text-fuchsia-300"}`}>
              {question.signal} · {question.confidence}%
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function Formula1RaceSidebar() {
  const topAgents = LEAGUE_ARENA_AGENTS.slice(0, 3);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      <LeaguePanel fill={false} className="border-red-500/25 bg-[radial-gradient(circle_at_0%_0%,rgba(239,68,68,0.14),transparent_50%),#070911]">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-300">Next race</p>
        <h3 className="mt-1 font-tech text-base font-black uppercase text-white sm:text-lg">Monaco GP</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <MapPin className="h-3.5 w-3.5 text-red-300" />
            Circuit de Monaco · Monte Carlo
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <Flag className="h-3.5 w-3.5 text-red-300" />
            Round 8 · 78 laps
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <CloudSun className="h-3.5 w-3.5 text-amber-300" />
            Dry · 22°C · Soft deg high
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
            Lights out in 02:14:36
          </div>
        </div>
      </LeaguePanel>

      <LeaguePanel fill={false} className="border-white/10">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-amber-300" />
          <h3 className="font-tech text-[11px] font-bold uppercase tracking-[0.16em] text-white">Your pace</h3>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">Previous best</p>
            <p className="font-tech text-xl font-black text-cyan-200">{PREVIOUS_BEST}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">Target</p>
            <p className="font-tech text-sm font-bold text-white">Beat by 0.2s</p>
          </div>
        </div>
      </LeaguePanel>

      <LeaguePanel fill className="min-h-0 border-white/10">
        <p className="mb-2 font-tech text-[11px] font-bold uppercase tracking-[0.16em] text-white">Agent watch</p>
        <ul className="space-y-2">
          {topAgents.map((agent) => (
            <li key={agent.name} className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/25 px-2 py-1.5">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">
                <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-tech text-[11px] font-bold text-white">{agent.name}</p>
                <p className="font-mono text-[9px] text-white/40">{agent.callsign}</p>
              </div>
              <span className="font-tech text-[10px] font-bold text-emerald-300">Live</span>
            </li>
          ))}
        </ul>
      </LeaguePanel>
    </div>
  );
}

export function Formula1Board() {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-2.5 lg:grid-cols-12 lg:gap-3">
      <div className="lg:col-span-12">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-red-500/20 pb-2">
          <span className="font-mono text-[10px] font-bold text-red-400">$</span>
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">Live now</h2>
          <span className="font-mono text-[11px] text-white/40"># Race weekend — drivers, teams, your pace</span>
        </div>
      </div>

      <div className="min-w-0 w-full lg:col-span-8 xl:col-span-9">
        <section className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-red-500/35 shadow-[0_0_48px_rgba(239,68,68,0.12)]">
          <div className="relative aspect-video w-full min-w-0 overflow-hidden sm:aspect-auto sm:h-[380px] md:h-[440px]">
            <Formula1Background />
          </div>
          <div className="border-t border-white/10 bg-[#05050a] px-3 py-2.5 sm:px-5 sm:py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-tech text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:text-xs">
                  Featured race weekend
                </p>
                <p className="mt-1 font-tech text-sm font-black uppercase text-white sm:text-base">Monaco Grand Prix</p>
              </div>
              <div className="sm:text-right">
                <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-red-300">Formula 1 2026</p>
                <p className="font-tech text-[9px] uppercase tracking-widest text-white/55">Round 8 · Monte Carlo</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex min-w-0 w-full flex-col gap-2.5 lg:col-span-4 xl:col-span-3 lg:min-h-[400px]">
        <Formula1RaceSidebar />
      </div>

      <div className="min-w-0 w-full self-stretch lg:col-span-4">
        <DriversCard />
      </div>
      <div className="min-w-0 w-full self-stretch lg:col-span-4">
        <TeamsCard />
      </div>
      <div className="min-w-0 w-full self-stretch lg:col-span-4">
        <TimePossibilityCard />
      </div>

      <div className="min-w-0 w-full lg:col-span-12">
        <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">
              Race prediction questions
            </h3>
            <p className="mt-0.5 text-[11px] text-white/45">Polymarket-style reads — lock in before lights out</p>
          </div>
          <span className="font-tech text-[9px] uppercase tracking-widest text-white/30">{QUESTIONS.length} live</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUESTIONS.map((question) => (
            <RaceQuestionCard key={question.id} question={question} />
          ))}
        </div>
      </div>

      <p className="mt-1 text-center font-mono text-[10px] tracking-wide text-white/30 lg:col-span-12">
        // picks lock at lights out · times vs your previous best
      </p>
    </div>
  );
}
