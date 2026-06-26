import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/contexts/AuthContext";
import { StorageKeys } from "@/constants/storageKeys";
import { getWebsiteTourSteps } from "@/tour/tourDefinitions";

type TourState = {
  completedTours: string[];
  lastCompletedAt?: string;
};

type TourContextValue = {
  isRunning: boolean;
  startWebsiteTour: () => void;
  resetWebsiteTour: () => void;
};

const TOUR_VERSION = "v2";
const AUTO_TOUR_DELAY_MS = 1200;
const TourContext = createContext<TourContextValue | null>(null);

function tourIdForPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "game" && segments[2] === "play") return `game-play-${TOUR_VERSION}`;
  if (segments[0] === "game") return `game-detail-${TOUR_VERSION}`;
  if (segments[0] === "moments" && segments[1] && segments[1] !== "browse") return `moment-detail-${TOUR_VERSION}`;
  if (segments[0] === "arena" && segments[1] === "game") return `arena-game-${TOUR_VERSION}`;
  if (segments[0] === "arena" && segments[1] === "robowar") return `robowar-${TOUR_VERSION}`;
  return `${segments[0] || "home"}-${TOUR_VERSION}`;
}

function readTourState(): TourState {
  try {
    const raw = localStorage.getItem(StorageKeys.local.productTourState);
    if (!raw) return { completedTours: [] };
    const parsed = JSON.parse(raw) as Partial<TourState>;
    return {
      completedTours: Array.isArray(parsed.completedTours) ? parsed.completedTours : [],
      lastCompletedAt: parsed.lastCompletedAt,
    };
  } catch {
    return { completedTours: [] };
  }
}

function writeTourState(state: TourState) {
  try {
    localStorage.setItem(StorageKeys.local.productTourState, JSON.stringify(state));
  } catch {
    /* storage may be blocked */
  }
}

function markTourCompleted(tourId: string) {
  const current = readTourState();
  writeTourState({
    ...current,
    completedTours: Array.from(new Set([...current.completedTours, tourId])),
    lastCompletedAt: new Date().toISOString(),
  });
}

function clearTourCompleted(tourId: string) {
  const current = readTourState();
  writeTourState({
    ...current,
    completedTours: current.completedTours.filter((id) => id !== tourId),
  });
}

function hasCompletedTour(tourId: string) {
  return readTourState().completedTours.includes(tourId);
}

function resolveAvailableSteps(steps: DriveStep[]) {
  return steps.filter((item) => {
    if (!item.element || typeof item.element !== "string") return true;
    return Boolean(document.querySelector(item.element));
  });
}

export function TourProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  const autoStartedRef = useRef(new Set<string>());
  const currentTourId = useMemo(() => tourIdForPathname(pathname), [pathname]);

  const buildSteps = useCallback(() => {
    return resolveAvailableSteps(getWebsiteTourSteps({ pathname, isAuthenticated }));
  }, [isAuthenticated, pathname]);

  const startWebsiteTour = useCallback(() => {
    if (!enabled) return;
    window.setTimeout(() => {
      const steps = buildSteps();
      if (steps.length === 0) return;

      driverRef.current?.destroy();
      const instance = driver({
        steps,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        allowKeyboardControl: true,
        overlayColor: "#03070d",
        overlayOpacity: 0.82,
        stagePadding: 10,
        stageRadius: 18,
        showButtons: ["next", "previous", "close"],
        showProgress: true,
        progressText: "{{current}} / {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Done",
        popoverClass: "kult-driver-popover",
        onDestroyed: () => {
          setIsRunning(false);
          markTourCompleted(currentTourId);
        },
      });

      driverRef.current = instance;
      setIsRunning(true);
      instance.drive();
    }, 150);
  }, [buildSteps, currentTourId, enabled]);

  const resetWebsiteTour = useCallback(() => {
    clearTourCompleted(currentTourId);
    startWebsiteTour();
  }, [currentTourId, startWebsiteTour]);

  useEffect(() => {
    if (!enabled) return;
    if (autoStartedRef.current.has(currentTourId) || hasCompletedTour(currentTourId)) return;
    autoStartedRef.current.add(currentTourId);
    const timer = window.setTimeout(() => startWebsiteTour(), AUTO_TOUR_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [currentTourId, enabled, startWebsiteTour]);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({ isRunning, startWebsiteTour, resetWebsiteTour }),
    [isRunning, resetWebsiteTour, startWebsiteTour],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within TourProvider");
  }
  return context;
}
