/**
 * LauncherWaitingScreen — animated progress view shown while the desktop
 * launcher is running the match.
 *
 * Drives a stepped progress indicator from the live battle status polled
 * from the backend. Includes a live elapsed-time counter and a collapsible
 * troubleshooting section.
 */

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Swords, CheckCircle2, Circle, Loader2 } from "lucide-react";
import {
  LAUNCHER_STATUS_STEPS,
  activeStepIndex,
  LAUNCHER_DOWNLOAD_URL,
} from "@/constants/launcher";

const ACCENT = "#dc2626";

// ─────────────────────────────────────────────────────────────────────────────
// Elapsed timer
// ────────────────────���────────────────────────────────────────────────────────

function useElapsedSeconds(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1_000);
    return () => clearInterval(t);
  }, [running]);
  return seconds;
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec.toString().padStart(2, "0")}s` : `${sec}s`;
}

// ──────────────────────────────��──────────────────────────────────────────────
// Step row
// ─────────────────────────────────────────────────────────────────────────────

function StepRow({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "pending";
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-500 ${
        state === "active"
          ? "border border-[#dc262640] bg-[#dc262612]"
          : state === "done"
            ? "opacity-60"
            : "opacity-30"
      }`}
    >
      {state === "done" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
      ) : state === "active" ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: ACCENT }} />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-white/20" />
      )}
      <span
        className={`font-tech text-[11px] uppercase tracking-wider ${
          state === "active"
            ? "font-bold text-white"
            : state === "done"
              ? "text-white/60"
              : "text-white/30"
        }`}
      >
        {label}
      </span>
      {state === "active" && (
        <span
          className="ml-auto h-1.5 w-1.5 rounded-full animate-pulse shrink-0"
          style={{ background: ACCENT }}
        />
      )}
    </div>
  );
}

// ────────────��────────────────────────────��───────────────────────────────────
// LauncherWaitingScreen
// ─────────────────────────────────────────────────────────────────────────────

export function LauncherWaitingScreen({
  battleStatus,
  battleId,
}: {
  battleStatus?: string | null;
  battleId?: string;
}) {
  const [troubleshootOpen, setTroubleshootOpen] = useState(false);
  const currentStep = activeStepIndex(battleStatus);
  const elapsed = useElapsedSeconds(true);
  const isRunning = battleStatus === "IN_PROGRESS";

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-0 overflow-hidden"
      style={{ background: "#040810" }}
    >
      {/* Subtle red grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(220,38,38,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(220,38,38,0.6) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow orb */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl opacity-20"
        style={{ width: 340, height: 340, background: ACCENT, top: "30%", left: "50%", transform: "translate(-50%,-50%)" }}
      />

      {/* Main card */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-4 px-4">

        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-full border"
            style={{ borderColor: `${ACCENT}60`, background: `${ACCENT}18`, boxShadow: `0 0 40px ${ACCENT}40` }}
          >
            <span className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: ACCENT }} />
            <Swords className="relative h-7 w-7" style={{ color: ACCENT }} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <div className="font-display text-xl font-black uppercase tracking-widest text-white">
            Battle in Progress
          </div>
          <div className="font-mono text-[10px] text-white/35 mt-1">
            {isRunning
              ? `Fighting for ${formatElapsed(elapsed)}`
              : `Waiting for launcher · ${formatElapsed(elapsed)} elapsed`}
          </div>
          {battleId && (
            <div className="font-mono text-[8px] text-white/18 mt-0.5">
              {battleId.slice(0, 8)}…{battleId.slice(-4)}
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex flex-col gap-1">
          {LAUNCHER_STATUS_STEPS.map((step, i) => {
            const state: "done" | "active" | "pending" =
              i < currentStep ? "done" : i === currentStep ? "active" : "pending";
            return <StepRow key={step.id} label={step.label} state={state} />;
          })}
        </div>

        {/* Troubleshooting accordion */}
        <div className="rounded-xl border border-white/6 bg-white/[0.025] overflow-hidden">
          <button
            type="button"
            onClick={() => setTroubleshootOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-white/[0.03] transition"
          >
            <span className="font-tech text-[9px] uppercase tracking-widest text-white/40 flex-1">
              Troubleshooting
            </span>
            {troubleshootOpen
              ? <ChevronUp className="h-3.5 w-3.5 text-white/25 shrink-0" />
              : <ChevronDown className="h-3.5 w-3.5 text-white/25 shrink-0" />}
          </button>

          {troubleshootOpen && (
            <div className="px-4 pb-4 space-y-2">
              <TroubleshootItem title="Launcher won't open?">
                Make sure the AI Arena Launcher is installed and running.
                {LAUNCHER_DOWNLOAD_URL && (
                  <>
                    {" "}
                    <a
                      href={LAUNCHER_DOWNLOAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 underline underline-offset-2 hover:text-white/90 transition"
                    >
                      Download here
                    </a>
                    .
                  </>
                )}
              </TroubleshootItem>
              <TroubleshootItem title="Stuck on 'Downloading match'?">
                Check your internet connection. The launcher downloads match data from the
                0G network before starting.
              </TroubleshootItem>
              <TroubleshootItem title="Results not appearing?">
                If the launcher closed unexpectedly, results may still upload. Wait up to
                2 minutes — this page will update automatically.
              </TroubleshootItem>
              <TroubleshootItem title="Match taking too long?">
                If nothing happens after 10 minutes, close the launcher, come back here,
                and retry the match from the AI Arena lobby.
              </TroubleshootItem>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function TroubleshootItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-tech text-[9px] uppercase tracking-wider text-white/45 mb-0.5">{title}</div>
      <p className="font-mono text-[10px] leading-relaxed text-white/30">{children}</p>
    </div>
  );
}
