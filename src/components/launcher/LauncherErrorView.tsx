/**
 * LauncherErrorView, shown when the launcher battle ends in an error,
 * timeout, or cancellation state.
 *
 * Generic enough to cover all non-success terminal phases:
 *   - "error"    , API / network failure
 *   - "timeout"  , launcher idle for > LAUNCHER_IDLE_TIMEOUT_MS
 *   - "cancelled", battle.status === CANCELLED
 */

import { AlertTriangle, Clock, XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import type { LauncherPhase } from "@/constants/launcher";

const ACCENT = "#dc2626";

type ErrorConfig = {
  icon: typeof AlertTriangle;
  iconColor: string;
  title: string;
  description: string;
  borderColor: string;
};

const PHASE_CONFIG: Partial<Record<LauncherPhase, ErrorConfig>> = {
  timeout: {
    icon:        Clock,
    iconColor:   "#f59e0b",
    title:       "Match Timed Out",
    description: "The launcher didn't report results within the expected window. The match may have been interrupted.",
    borderColor: "rgba(245,158,11,0.30)",
  },
  cancelled: {
    icon:        XCircle,
    iconColor:   "#6b7280",
    title:       "Match Cancelled",
    description: "This match was cancelled before it could be completed. You can return to the lobby and start a new one.",
    borderColor: "rgba(107,114,128,0.25)",
  },
  error: {
    icon:        AlertTriangle,
    iconColor:   ACCENT,
    title:       "Something Went Wrong",
    description: "An unexpected error occurred. This is usually a temporary network issue, retrying often resolves it.",
    borderColor: `${ACCENT}40`,
  },
};

const FALLBACK_CONFIG: ErrorConfig = PHASE_CONFIG.error!;

export function LauncherErrorView({
  phase,
  errorMessage,
  onRetry,
  onHome,
}: {
  phase: LauncherPhase;
  errorMessage: string | null;
  onRetry: () => void;
  onHome: () => void;
}) {
  const cfg = PHASE_CONFIG[phase] ?? FALLBACK_CONFIG;
  const Icon = cfg.icon;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-4"
      style={{ background: "rgba(3,7,16,0.94)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl border overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.75)]"
        style={{ borderColor: cfg.borderColor, background: "rgba(8,12,24,0.97)" }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: `${cfg.iconColor}40`, background: `${cfg.iconColor}14` }}
            >
              <Icon className="h-5 w-5" style={{ color: cfg.iconColor }} />
            </div>
            <div className="font-display text-lg font-black uppercase tracking-wide text-white">
              {cfg.title}
            </div>
          </div>

          <p className="font-mono text-[11px] leading-relaxed text-white/55">
            {errorMessage ?? cfg.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 px-7 pb-7">
          {phase !== "cancelled" && (
            <button
              type="button"
              onClick={onRetry}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border py-3.5 font-tech text-[11px] uppercase tracking-widest text-white transition"
              style={{
                borderColor: `${cfg.iconColor}55`,
                background:  `${cfg.iconColor}14`,
              }}
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Try Again
            </button>
          )}

          <button
            type="button"
            onClick={onHome}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.05] py-3.5 font-tech text-[11px] uppercase tracking-widest text-white/60 hover:bg-white/[0.09] hover:text-white hover:border-white/20 transition"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
