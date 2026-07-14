import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
const TOUR_GLOBALLY_DISMISSED_KEY = "kult_tour_globally_dismissed";
const TourContext = createContext<TourContextValue | null>(null);

// Sidebar nav items render twice in the DOM: a desktop <aside> (always mounted,
// CSS-hidden below `lg`) and a mobile drawer (only mounted while open). Both
// share the same `data-tour` attribute, so a plain querySelector always finds
// the desktop copy first — even when it's invisible. `MOBILE_SIDEBAR_SELECTOR_PREFIX`
// lets us detect steps that live inside that drawer so we can open it first.
const MOBILE_SIDEBAR_SELECTOR_PREFIX = "[data-tour='sidebar-";
const MOBILE_BREAKPOINT_PX = 1024; // matches Tailwind's `lg` used by AppSidebar
const MOBILE_SIDEBAR_OPEN_DELAY_MS = 220; // time for the drawer to mount + animate in

type TourDriveStep = DriveStep & { __selector?: string };

function isRenderedVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return true;
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
}

/** Among all elements matching `selector`, pick the one actually rendered (not display:none). */
function pickVisibleElement(selector: string): Element | undefined {
  const matches = Array.from(document.querySelectorAll(selector));
  return matches.find(isRenderedVisible) ?? matches[0];
}

/** Replace string selectors with a resolver that skips hidden duplicates at highlight time. */
function withDynamicElements(steps: DriveStep[]): TourDriveStep[] {
  return steps.map((item) => {
    if (typeof item.element !== "string") return item;
    const selector = item.element;
    return { ...item, element: () => pickVisibleElement(selector) as Element, __selector: selector };
  });
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT_PX;
}

function stepNeedsMobileSidebar(step: TourDriveStep | undefined): boolean {
  return Boolean(step?.__selector?.startsWith(MOBILE_SIDEBAR_SELECTOR_PREFIX) && isMobileViewport());
}

function dispatchOpenMobileSidebar() {
  window.dispatchEvent(new CustomEvent("open-mobile-sidebar"));
}

function dispatchCloseMobileSidebar() {
  window.dispatchEvent(new CustomEvent("close-mobile-sidebar"));
}

function isTourGloballyDismissed(): boolean {
  try {
    return localStorage.getItem(TOUR_GLOBALLY_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function markTourGloballyDismissed() {
  try {
    localStorage.setItem(TOUR_GLOBALLY_DISMISSED_KEY, "1");
  } catch {
    /* storage may be blocked */
  }
}

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
  const [searchParams] = useSearchParams();
  const isRewardTrainingEntry =
    pathname.startsWith("/training") && searchParams.get("type") === "rewarded";
  const { isAuthenticated } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  const autoStartedRef = useRef(new Set<string>());
  const mobileSidebarOpenRef = useRef(false);
  const autoOpenedSidebarRef = useRef(false);
  const currentTourId = useMemo(() => tourIdForPathname(pathname), [pathname]);

  useEffect(() => {
    const handleState = (event: Event) => {
      const detail = (event as CustomEvent<{ isOpen: boolean }>).detail;
      mobileSidebarOpenRef.current = Boolean(detail?.isOpen);
    };
    window.addEventListener("mobile-sidebar-state", handleState);
    return () => window.removeEventListener("mobile-sidebar-state", handleState);
  }, []);

  const restoreSidebarIfAutoOpened = useCallback(() => {
    if (autoOpenedSidebarRef.current) {
      autoOpenedSidebarRef.current = false;
      dispatchCloseMobileSidebar();
    }
  }, []);

  /** Opens the mobile drawer before highlighting a sidebar step, closes it again once we move past. */
  const advanceTo = useCallback((targetStep: TourDriveStep | undefined, move: () => void) => {
    const needsSidebar = stepNeedsMobileSidebar(targetStep);

    if (needsSidebar) {
      if (!mobileSidebarOpenRef.current) {
        autoOpenedSidebarRef.current = true;
        dispatchOpenMobileSidebar();
        window.setTimeout(move, MOBILE_SIDEBAR_OPEN_DELAY_MS);
        return;
      }
    } else {
      restoreSidebarIfAutoOpened();
    }

    move();
  }, [restoreSidebarIfAutoOpened]);

  const buildSteps = useCallback(() => {
    return resolveAvailableSteps(getWebsiteTourSteps({ pathname, isAuthenticated }));
  }, [isAuthenticated, pathname]);

  const startWebsiteTour = useCallback(() => {
    if (!enabled) return;
    window.setTimeout(() => {
      const steps = withDynamicElements(buildSteps());
      if (steps.length === 0) return;

      driverRef.current?.destroy();
      autoOpenedSidebarRef.current = false;
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
        onNextClick: (_element, _step, { driver: driverObj }) => {
          advanceTo(driverObj.getNextStep() as TourDriveStep | undefined, () => driverObj.moveNext());
        },
        onPrevClick: (_element, _step, { driver: driverObj }) => {
          advanceTo(driverObj.getPreviousStep() as TourDriveStep | undefined, () => driverObj.movePrevious());
        },
        onDestroyed: () => {
          restoreSidebarIfAutoOpened();
          setIsRunning(false);
          markTourCompleted(currentTourId);
          markTourGloballyDismissed();
        },
      });

      driverRef.current = instance;
      setIsRunning(true);

      const firstStep = steps[0];
      if (stepNeedsMobileSidebar(firstStep) && !mobileSidebarOpenRef.current) {
        autoOpenedSidebarRef.current = true;
        dispatchOpenMobileSidebar();
        window.setTimeout(() => instance.drive(), MOBILE_SIDEBAR_OPEN_DELAY_MS);
      } else {
        instance.drive();
      }
    }, 150);
  }, [advanceTo, buildSteps, currentTourId, enabled, restoreSidebarIfAutoOpened]);

  const resetWebsiteTour = useCallback(() => {
    clearTourCompleted(currentTourId);
    startWebsiteTour();
  }, [currentTourId, startWebsiteTour]);

  useEffect(() => {
    if (!enabled) return;
    if (isRewardTrainingEntry) return;
    if (isTourGloballyDismissed()) return;
    if (autoStartedRef.current.has(currentTourId) || hasCompletedTour(currentTourId)) return;
    autoStartedRef.current.add(currentTourId);
    const timer = window.setTimeout(() => startWebsiteTour(), AUTO_TOUR_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [currentTourId, enabled, isRewardTrainingEntry, startWebsiteTour]);

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
