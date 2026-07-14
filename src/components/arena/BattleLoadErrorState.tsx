import { Link } from "react-router-dom";
import { Flag, RotateCcw, Swords } from "lucide-react";
import { isBattleNotFoundError } from "@/lib/aiArenaBattleErrors";

type BattleLoadErrorStateProps = {
  error: unknown;
  onRetry: () => void;
};

/** Shown when GET /v1/battles/:id fails — distinguishes ended/cleaned battles from transient errors. */
export function BattleLoadErrorState({ error, onRetry }: BattleLoadErrorStateProps) {
  const ended = isBattleNotFoundError(error);

  return (
    <div className="flex h-full items-center justify-center px-4">
      {ended ? (
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/20 bg-[linear-gradient(165deg,rgba(18,12,6,0.92),rgba(4,8,15,0.96))] px-6 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_48px_rgba(251,191,36,0.08)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.14),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />

          <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border border-amber-300/35 bg-amber-400/10 shadow-[0_0_28px_rgba(251,191,36,0.25)]">
            <Flag className="h-6 w-6 text-amber-300" strokeWidth={1.75} />
          </div>

          <p className="relative mt-5 font-tech text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300/70">
            Match complete
          </p>
          <h2 className="relative mt-2 font-tech text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl">
            Battle{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-orange-300 bg-clip-text text-transparent">
              Ended
            </span>
          </h2>
          <p className="relative mx-auto mt-3 max-w-[300px] text-sm leading-relaxed text-white/55">
            Sorry — this battle has already ended. You just missed the action.
          </p>

          <Link
            to="/ai-arena"
            className="relative mt-7 inline-flex items-center gap-2 rounded-xl border border-amber-300/35 bg-[linear-gradient(135deg,rgba(251,191,36,0.22),rgba(154,53,255,0.18),rgba(4,8,15,0.9))] px-5 py-2.5 font-tech text-[11px] font-black uppercase tracking-[0.18em] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.18)] transition hover:border-amber-200/55 hover:bg-[linear-gradient(135deg,rgba(251,191,36,0.32),rgba(168,85,247,0.24),rgba(4,8,15,0.92))] hover:text-white"
          >
            <Swords className="h-3.5 w-3.5 text-amber-200" />
            Back to Arena
          </Link>
        </div>
      ) : (
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose-400/20 bg-[linear-gradient(165deg,rgba(24,8,12,0.92),rgba(4,8,15,0.96))] px-6 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.12),transparent_55%)]" />
          <h2 className="relative font-tech text-lg font-black uppercase tracking-wider text-rose-300/90">
            Failed to load battle
          </h2>
          <p className="relative mt-2 text-sm text-white/50">Something went wrong. Try again.</p>
          <button
            type="button"
            onClick={onRetry}
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 font-tech text-[11px] font-black uppercase tracking-[0.18em] text-white/85 transition hover:border-primary/50 hover:bg-primary/15 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
