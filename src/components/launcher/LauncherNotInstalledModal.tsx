/**
 * LauncherNotInstalledModal, shown when the protocol open attempt times out
 * with no window blur, meaning the launcher is not installed.
 *
 * Shows step-by-step install instructions, a prominent download CTA,
 * and a retry button for once the user has installed.
 */

import { Download, ExternalLink, Rocket, RefreshCw } from "lucide-react";
import { LAUNCHER_DOWNLOAD_URL } from "@/constants/launcher";

const ACCENT = "#dc2626";

const INSTALL_STEPS = [
  "Click Download Launcher below.",
  "Run the installer and follow the on-screen steps.",
  "Launch the AI Arena app once installation completes.",
  "Come back here and click Launch RoboWars.",
];

export function LauncherNotInstalledModal({
  onRetry,
}: {
  /** Called when the user clicks "I've installed it, try again". */
  onRetry: () => void;
}) {
  const hasDownloadUrl = Boolean(LAUNCHER_DOWNLOAD_URL);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-4 overflow-auto"
      style={{ background: "rgba(3,7,16,0.94)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/8 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        style={{ background: "rgba(8,12,24,0.98)" }}
      >
        {/* Header */}
        <div
          className="relative px-7 pt-7 pb-5 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${ACCENT}14 0%, transparent 60%)` }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
          />
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: `${ACCENT}50`, background: `${ACCENT}18` }}
            >
              <Download className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="font-display text-lg font-black uppercase tracking-wide text-white">
                Launcher Required
              </div>
              <div className="font-mono text-[10px] text-white/40 mt-0.5">
                AI Arena Launcher not detected
              </div>
            </div>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-white/55">
            RoboWars is powered by Unreal Engine and requires the{" "}
            <span className="text-white font-bold">AI Arena Launcher</span> to run. It's a
            free desktop app, install it once and launch any desktop game directly from
            this page.
          </p>
        </div>

        {/* Install steps */}
        <div className="px-7 py-4 space-y-2.5">
          <div className="font-tech text-[9px] uppercase tracking-widest text-white/35 mb-3">
            Installation steps
          </div>
          {INSTALL_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-tech text-[9px] font-bold"
                style={{
                  background: `${ACCENT}22`,
                  border: `1px solid ${ACCENT}50`,
                  color: ACCENT,
                }}
              >
                {i + 1}
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-white/60">{step}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 px-7 pb-7">

          {hasDownloadUrl ? (
            <a
              href={LAUNCHER_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 font-tech text-[11px] uppercase tracking-widest text-white transition"
              style={{
                background: `${ACCENT}28`,
                border: `1px solid ${ACCENT}60`,
                boxShadow: `0 0 24px ${ACCENT}30`,
              }}
            >
              <Download className="h-4 w-4 shrink-0" />
              Download AI Arena Launcher
              <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
            </a>
          ) : (
            <div
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 py-3.5 font-tech text-[10px] uppercase tracking-widest text-white/30"
            >
              Download URL not configured, contact support
            </div>
          )}

          <button
            type="button"
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.05] py-3.5 font-tech text-[11px] uppercase tracking-widest text-white/60 hover:bg-white/[0.09] hover:text-white hover:border-white/20 transition"
          >
            <Rocket className="h-4 w-4 shrink-0" />
            I've installed it, try again
          </button>

          <p className="text-center font-mono text-[8px] text-white/20">
            Make sure the launcher is running before clicking "try again".
          </p>

        </div>
      </div>
    </div>
  );
}
