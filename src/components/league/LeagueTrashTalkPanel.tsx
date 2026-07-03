import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { leagueApi, type MatchSummary, type LeaguePredictionQuestion } from "@/api/leagueApi";

const WORKER_URL = "https://league-trash-talk.ronit-sde.workers.dev/generate";

type Outcome = "WIN" | "LOSS";

interface TrashTalkResult {
  player1: string[];
  player2: string[];
  outcome: Outcome;
}

async function fetchTrashTalk(
  outcome: Outcome,
  match: MatchSummary,
  questions: LeaguePredictionQuestion[],
  userAgentName: string,
  rivalAgentName: string,
): Promise<TrashTalkResult> {
  const isWin = outcome === "WIN";

  const picks = questions.map((q) => ({
    question: q.question,
    category: q.category,
    userPick:      isWin ? q.agentA.pick : q.agentB.pick,
    rivalPick:     isWin ? q.agentB.pick : q.agentA.pick,
    correctAnswer: q.agentA.pick,
    userOutcome:   isWin ? "WIN"  : "LOSS",
    rivalOutcome:  isWin ? "LOSS" : "WIN",
    userConfidence: isWin ? q.agentA.confidence : q.agentB.confidence,
  }));

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: {
        name: "You",
        agentName: userAgentName,
        score: isWin ? 4 : 1,
        kpEarned: isWin ? 1240 : 85,
      },
      rival: {
        name: "Rival",
        agentName: rivalAgentName,
        score: isWin ? 1 : 4,
      },
      match: {
        home:   match.home,
        away:   match.away,
        stage:  match.stage,
        result: match.homeScore !== null && match.awayScore !== null ? `${match.homeScore}-${match.awayScore}` : "TBD",
      },
      picks,
      totalQuestions: questions.length,
      context: `${match.stage}${match.matchday ? ` — Matchday ${match.matchday}` : ""}`,
      sessionId: `league-${Date.now()}`,
      batchIndex: 0,
    }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Worker error");
  return { player1: data.lines.player1, player2: data.lines.player2, outcome };
}

export function LeagueTrashTalkPanel() {
  const [loading, setLoading] = useState<Outcome | null>(null);
  const [result, setResult]   = useState<TrashTalkResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const { data: match } = useQuery({
    queryKey: ["league", "matches", "featured"],
    queryFn: () => leagueApi.getFeaturedMatch(),
    staleTime: 15_000,
  });

  const { data: detail } = useQuery({
    queryKey: ["league", "matches", match?.id, "detail"],
    queryFn: () => leagueApi.getMatchDetail(match!.id),
    enabled: !!match?.id,
    staleTime: 15_000,
  });

  const questions = detail?.questions ?? [];
  const agentBets = detail?.agentBets ?? [];
  const userAgentName = agentBets[0]?.agentName ?? "Your agent";
  const rivalAgentName = agentBets[1]?.agentName ?? "Rival agent";

  async function handleClick(outcome: Outcome) {
    if (!match) return;
    setLoading(outcome);
    setResult(null);
    setError(null);
    try {
      const data = await fetchTrashTalk(outcome, match, questions, userAgentName, rivalAgentName);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  if (!match) return null;

  const matchLabel = `${match.home} vs ${match.away}`;

  return (
    <section className="rounded-none border border-[#a855f7]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.10),transparent_55%),#070911] p-3 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a855f7]">&gt; agent_trash_talk --live</p>
          <h3 className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">
            How Did Your Pick Land?
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-white/40">
            # {matchLabel} · Let your agent respond
          </p>
        </div>
        {result && (
          <button
            onClick={reset}
            className="font-mono text-[10px] uppercase tracking-wider text-white/30 transition hover:text-white/60"
          >
            ↺ Try again
          </button>
        )}
      </div>

      {/* Buttons */}
      {!result && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading !== null || questions.length === 0}
            onClick={() => handleClick("WIN")}
            className="group relative overflow-hidden rounded-none border border-emerald-500/40 bg-emerald-500/8 px-4 py-4 transition hover:border-emerald-400/70 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50 sm:py-5"
          >
            {loading === "WIN" ? (
              <span className="flex items-center justify-center gap-2 font-mono text-xs text-emerald-300">
                <Spinner /> Generating…
              </span>
            ) : (
              <>
                <span className="block text-2xl sm:text-3xl">✓</span>
                <span className="mt-1.5 block font-mono text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 sm:text-sm">
                  I Called It
                </span>
                <span className="mt-1 block font-mono text-[10px] text-white/35">
                  My prediction was correct
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading !== null || questions.length === 0}
            onClick={() => handleClick("LOSS")}
            className="group relative overflow-hidden rounded-none border border-rose-500/40 bg-rose-500/8 px-4 py-4 transition hover:border-rose-400/70 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50 sm:py-5"
          >
            {loading === "LOSS" ? (
              <span className="flex items-center justify-center gap-2 font-mono text-xs text-rose-300">
                <Spinner /> Generating…
              </span>
            ) : (
              <>
                <span className="block text-2xl sm:text-3xl">✗</span>
                <span className="mt-1.5 block font-mono text-xs font-bold uppercase tracking-[0.18em] text-rose-300 sm:text-sm">
                  Missed the Mark
                </span>
                <span className="mt-1 block font-mono text-[10px] text-white/35">
                  My prediction was wrong
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {questions.length === 0 && !result ? (
        <p className="mt-3 font-mono text-[10px] text-white/30">
          Waiting on at least two disagreeing agent picks on this match before trash talk can generate.
        </p>
      ) : null}

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-none border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-mono text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Winner block */}
          <TrashTalkBlock
            label={result.outcome === "WIN" ? `Your agent — ${userAgentName}` : `Rival agent — ${rivalAgentName}`}
            sublabel={result.outcome === "WIN" ? "Winner · Confident read" : "Winner · Rubbing it in"}
            lines={result.player1}
            accent="emerald"
            isUser={result.outcome === "WIN"}
          />
          {/* Loser block */}
          <TrashTalkBlock
            label={result.outcome === "LOSS" ? `Your agent — ${userAgentName}` : `Rival agent — ${rivalAgentName}`}
            sublabel={result.outcome === "LOSS" ? "Down but not out" : "Taking the loss"}
            lines={result.player2}
            accent="purple"
            isUser={result.outcome === "LOSS"}
          />
        </div>
      )}
    </section>
  );
}

function TrashTalkBlock({
  label,
  sublabel,
  lines,
  accent,
  isUser,
}: {
  label: string;
  sublabel: string;
  lines: string[];
  accent: "emerald" | "purple";
  isUser: boolean;
}) {
  const [active, setActive] = useState(0);

  const accentColor = accent === "emerald"
    ? { border: "border-emerald-500/30", bg: "bg-emerald-500/8", text: "text-emerald-300", dot: "bg-emerald-400" }
    : { border: "border-[#a855f7]/30", bg: "bg-[#a855f7]/8", text: "text-[#c084fc]", dot: "bg-[#a855f7]" };

  return (
    <div className={`rounded-none border ${accentColor.border} ${accentColor.bg} p-3 sm:p-4`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${accentColor.dot}`} />
          <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${accentColor.text}`}>
            {label}
          </span>
          {isUser && (
            <span className="rounded-full border border-white/15 bg-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/50">
              you
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-white/30">{sublabel}</span>
      </div>

      {/* Active line */}
      <p className="min-h-[3.5rem] font-mono text-[13px] leading-relaxed text-white/85 sm:text-sm">
        "{lines[active]}"
      </p>

      {/* Line selector dots */}
      <div className="mt-3 flex items-center gap-2">
        {lines.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active
                ? `w-5 ${accentColor.dot}`
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
        <span className="ml-auto font-mono text-[10px] text-white/25">
          {active + 1} / {lines.length}
        </span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
  );
}
