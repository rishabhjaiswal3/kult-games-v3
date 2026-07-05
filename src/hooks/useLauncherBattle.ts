import { useState, useCallback, useRef, useEffect } from "react";
import { useLauncherDetection } from "@/hooks/useLauncherDetection";
import {
  type LauncherPhase,
  LAUNCHER_IDLE_TIMEOUT_MS,
} from "@/constants/launcher";

type UseLauncherBattleOptions = {
  battleId: string;
  agentAId: string;
  agentBId: string;
  /** Live battle status from the polling query. */
  battleStatus?: string | null;
  /** Called once when the phase transitions to "complete". */
  onComplete?: () => void;
};

type UseLauncherBattleReturn = {
  phase: LauncherPhase;
  errorMessage: string | null;
  /** Call when the user clicks Launch. */
  launch: () => void;
  /** Resets to idle so the user can try again. */
  retry: () => void;
};

/**
 * State machine for the AI Arena desktop launcher battle flow.
 *
 * Phases:
 *   idle → launching → {waiting | not_installed}
 *   waiting → {complete | cancelled | error | timeout}
 *
 * The hook is game-agnostic: it drives the launcher UX purely from
 * battleStatus changes returned by the caller's polling query.
 */
export function useLauncherBattle({
  battleId,
  agentAId,
  agentBId,
  battleStatus,
  onComplete,
}: UseLauncherBattleOptions): UseLauncherBattleReturn {
  const [phase, setPhase] = useState<LauncherPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { openLauncher } = useLauncherDetection();

  const timeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef  = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Clear the idle-timeout if the battle makes any progress past PENDING
  const clearIdleTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const launch = useCallback(async () => {
    // Allow retry from not_installed state as well
    if (phase !== "idle" && phase !== "not_installed") return;

    setPhase("launching");
    setErrorMessage(null);

    const result = await openLauncher(battleId, agentAId, agentBId);

    if (result === "installed") {
      setPhase("waiting");

      // Guard against the launcher opening but never finishing the match
      timeoutRef.current = setTimeout(() => {
        if (!completedRef.current) {
          setPhase("timeout");
          setErrorMessage(
            "The launcher hasn't reported results in 10 minutes. " +
            "The match may have been interrupted or the launcher was closed."
          );
        }
      }, LAUNCHER_IDLE_TIMEOUT_MS);
    } else {
      setPhase("not_installed");
    }
  }, [phase, openLauncher, battleId, agentAId, agentBId]);

  // React to battle status changes driven by the polling query
  useEffect(() => {
    if (phase !== "waiting") return;
    if (!battleStatus) return;

    // Any non-PENDING status means the launcher is active — reset the idle timer
    if (battleStatus !== "PENDING") clearIdleTimeout();

    if (battleStatus === "COMPLETED") {
      completedRef.current = true;
      clearIdleTimeout();
      setPhase("complete");
      onCompleteRef.current?.();
      return;
    }

    if (battleStatus === "CANCELLED") {
      clearIdleTimeout();
      setPhase("cancelled");
      setErrorMessage("The match was cancelled before it could be completed.");
      return;
    }

    if (battleStatus === "DISPUTED") {
      clearIdleTimeout();
      setPhase("error");
      setErrorMessage("The match result is disputed and is currently under review.");
    }
  }, [battleStatus, phase, clearIdleTimeout]);

  const retry = useCallback(() => {
    completedRef.current = false;
    clearIdleTimeout();
    setPhase("idle");
    setErrorMessage(null);
  }, [clearIdleTimeout]);

  // Cleanup on unmount
  useEffect(() => () => clearIdleTimeout(), [clearIdleTimeout]);

  return { phase, errorMessage, launch, retry };
}
