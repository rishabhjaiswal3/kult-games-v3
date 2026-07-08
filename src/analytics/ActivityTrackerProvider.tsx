import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
  flushActivityNow,
  startActivityTracker,
  stopActivityTracker,
  trackRouteChange,
} from "@/analytics/tracker";

/**
 * Mounts the free first-party activity / heatmap tracker for the whole SPA.
 * Must sit under BrowserRouter (uses location) and preferably under Auth providers.
 */
export function ActivityTrackerProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    startActivityTracker();
    return () => {
      void flushActivityNow();
      stopActivityTracker();
    };
  }, []);

  useEffect(() => {
    trackRouteChange(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return <>{children}</>;
}
