import { useCallback, useRef } from "react";
import { LAUNCHER_PROTOCOL, LAUNCHER_OPEN_TIMEOUT_MS } from "@/constants/launcher";

export type DetectionResult = "installed" | "not_installed";

/**
 * Attempts to open the AI Arena custom URI scheme and detects whether the
 * launcher is installed by watching for a window blur event (the OS will
 * switch focus to the launcher app if it handles the scheme).
 *
 * Returns a promise that resolves to "installed" if the window blurs within
 * LAUNCHER_OPEN_TIMEOUT_MS, or "not_installed" if the timer fires first.
 *
 * This is the standard browser-based custom-protocol detection heuristic:
 *   - Supported in Chrome, Edge, Firefox, and Safari.
 *   - Not 100% reliable on all OS/browser combos, but handles all common cases.
 */
export function useLauncherDetection() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openLauncher = useCallback(
    (matchId: string, agentAId: string, agentBId: string): Promise<DetectionResult> =>
      new Promise((resolve) => {
        const url = [
          `${LAUNCHER_PROTOCOL}://launch`,
          `?matchId=${encodeURIComponent(matchId)}`,
          `&agentA=${encodeURIComponent(agentAId)}`,
          `&agentB=${encodeURIComponent(agentBId)}`,
        ].join("");

        const cleanup = () => {
          window.removeEventListener("blur", onBlur);
          document.removeEventListener("visibilitychange", onVisibility);
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        };

        const onBlur = () => {
          cleanup();
          resolve("installed");
        };

        // Fallback: some browsers fire visibilitychange instead of blur
        const onVisibility = () => {
          if (document.hidden) {
            cleanup();
            resolve("installed");
          }
        };

        window.addEventListener("blur", onBlur, { once: true });
        document.addEventListener("visibilitychange", onVisibility);

        timerRef.current = setTimeout(() => {
          cleanup();
          resolve("not_installed");
        }, LAUNCHER_OPEN_TIMEOUT_MS);

        // Attempt to open the registered URI scheme.
        // Using location.href rather than window.open so that browsers that
        // block popups still trigger the OS protocol handler.
        try {
          window.location.href = url;
        } catch {
          // Some hardened browsers throw on non-http(s) schemes, the timer
          // will fire and the user will be shown the install prompt.
        }
      }),
    []
  );

  return { openLauncher };
}
