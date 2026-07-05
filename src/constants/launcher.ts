// ─────────────────────────────────────────────────────────────────────────────
// AI Arena Desktop Launcher — shared constants
//
// Games that require the desktop launcher (e.g. RoboWars / Unreal Engine titles)
// use this module for protocol scheme, URLs, timeouts, and status step labels.
// ─────────────────────────────────────────────────────────────────────────────

/** Custom URI scheme the installed launcher registers with the OS. */
export const LAUNCHER_PROTOCOL: string =
  (import.meta.env.VITE_LAUNCHER_PROTOCOL as string | undefined) ?? "aiarena";

/** URL for the installer download (shown when the launcher is not detected). */
export const LAUNCHER_DOWNLOAD_URL: string =
  (import.meta.env.VITE_LAUNCHER_DOWNLOAD_URL as string | undefined) ?? "";

/** How long (ms) to wait after window.open() before concluding the launcher is not installed. */
export const LAUNCHER_OPEN_TIMEOUT_MS = 3_000;

/** How long (ms) to wait in WAITING state with no status progress before declaring timeout. */
export const LAUNCHER_IDLE_TIMEOUT_MS = 10 * 60 * 1_000; // 10 minutes

// ─────────────────────────────────────────────────────────────────────────────
// State machine phases
// ─────────────────────────────────────────────────────────────────────────────

export type LauncherPhase =
  | "idle"           // Pre-launch landing page
  | "launching"      // Protocol URI was opened; detection timer running
  | "not_installed"  // Timer expired with no window blur — launcher not found
  | "waiting"        // Launcher opened; polling backend for match progress
  | "complete"       // battle.status === COMPLETED; transitioning to result overlay
  | "error"          // Unrecoverable API / network failure
  | "timeout"        // IN_PROGRESS for longer than LAUNCHER_IDLE_TIMEOUT_MS
  | "cancelled";     // battle.status === CANCELLED

// ─────────────────────────────────────────────────────────────────────────────
// Waiting-screen progress steps
// Maps battle status values to the step to highlight.
// ─────────────────────────────────────────────────────────────────────────────

export type LauncherStatusStep = {
  id: string;
  label: string;
  /** battle.status values that map to this step being the "active" one. */
  battleStatuses: string[];
};

export const LAUNCHER_STATUS_STEPS: LauncherStatusStep[] = [
  { id: "connecting",    label: "Connecting…",          battleStatuses: [] },
  { id: "detected",      label: "Launcher detected",    battleStatuses: ["PENDING"] },
  { id: "downloading",   label: "Downloading match…",   battleStatuses: ["INITIALIZING"] },
  { id: "fighting",      label: "Robots are fighting…", battleStatuses: ["IN_PROGRESS"] },
  { id: "uploading",     label: "Uploading results…",   battleStatuses: [] },
  { id: "confirming",    label: "Confirming on-chain…", battleStatuses: [] },
  { id: "complete",      label: "Battle Complete",       battleStatuses: ["COMPLETED"] },
];

/** Given a battle status string, return the index of the active step. */
export function activeStepIndex(battleStatus: string | null | undefined): number {
  if (!battleStatus) return 0; // "connecting"
  for (let i = 0; i < LAUNCHER_STATUS_STEPS.length; i++) {
    if (LAUNCHER_STATUS_STEPS[i].battleStatuses.includes(battleStatus)) return i;
  }
  if (battleStatus === "COMPLETED") return LAUNCHER_STATUS_STEPS.length - 1;
  return 1; // fallback to "detected"
}
