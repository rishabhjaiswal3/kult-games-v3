import { usePostHog } from "@posthog/react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserLoginMethod } from "@/lib/loginModalBus";

const MAX_PATH_DEPTH = 7;
const MAX_LABEL_LENGTH = 80;

function routePattern(pathname: string) {
  return pathname
    .replace(/^\/game\/[^/]+\/play$/, "/game/:gameId/play")
    .replace(/^\/game\/[^/]+$/, "/game/:gameId")
    .replace(/^\/moments\/[^/]+$/, "/moments/:momentId")
    .replace(/^\/arena\/(game|robowar|highway-hustle|warzone-wave)\/[^/]+$/, "/arena/$1/:battleId");
}

function safeDestination(element: Element) {
  const anchor = element.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return undefined;
  try {
    const url = new URL(anchor.href, window.location.href);
    return url.origin === window.location.origin
      ? routePattern(url.pathname)
      : `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

function safeLabel(element: Element) {
  const explicit =
    element.getAttribute("data-analytics-label") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("title");
  const candidate = explicit || (["BUTTON", "A"].includes(element.tagName) ? element.textContent : "");
  if (!candidate) return undefined;
  return candidate
    .replace(/0x[a-fA-F0-9]{8,}/g, "[address]")
    .replace(/[A-Za-z0-9_-]{20,}/g, "[id]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LABEL_LENGTH) || undefined;
}

function elementDescriptor(element: Element) {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && parts.length < MAX_PATH_DEPTH) {
    let part = current.tagName.toLowerCase();
    if (current.id) part += `#${CSS.escape(current.id)}`;
    const analyticsId = current.getAttribute("data-analytics-id");
    const testId = current.getAttribute("data-testid");
    if (analyticsId) part += `[data-analytics-id="${CSS.escape(analyticsId)}"]`;
    else if (testId) part += `[data-testid="${CSS.escape(testId)}"]`;
    parts.unshift(part);
    current = current.parentElement;
  }
  return parts.join(" > ");
}

function componentName(element: Element) {
  return element.closest("[data-analytics-component]")?.getAttribute("data-analytics-component") || undefined;
}

function baseProperties() {
  return {
    page_path: routePattern(window.location.pathname),
    page_title: document.title,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_pixel_ratio: window.devicePixelRatio,
  };
}

function safeError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "Unknown error");
  return raw
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/0x[a-fA-F0-9]{8,}/g, "[address]")
    .replace(/[A-Za-z0-9_-]{32,}/g, "[redacted]")
    .slice(0, 240);
}

/** Global, delegated analytics that covers lazy routes, portals, cards, controls and forms. */
export function GlobalAnalyticsTracker() {
  const posthog = usePostHog();
  const routeRef = useRef("");
  const scrollMilestonesRef = useRef(new Set<number>());

  useEffect(() => {
    const capturePage = (navigationType: string) => {
      const path = routePattern(window.location.pathname);
      if (routeRef.current === path && navigationType !== "initial") return;
      routeRef.current = path;
      scrollMilestonesRef.current.clear();
      posthog.capture("page_viewed", { ...baseProperties(), navigation_type: navigationType });
    };

    capturePage("initial");
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);
    history.pushState = (...args) => {
      originalPushState(...args);
      queueMicrotask(() => capturePage("push"));
    };
    history.replaceState = (...args) => {
      originalReplaceState(...args);
      queueMicrotask(() => capturePage("replace"));
    };
    const onPopState = () => capturePage("pop");
    window.addEventListener("popstate", onPopState);

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const tracked = event.target.closest(
        "button, a, input, select, textarea, [role], [data-analytics-id], [data-analytics-component]",
      ) || event.target;
      posthog.capture("ui_click", {
        ...baseProperties(),
        element_tag: tracked.tagName.toLowerCase(),
        element_id: tracked.id || undefined,
        element_role: tracked.getAttribute("role") || undefined,
        element_type: tracked.getAttribute("type") || undefined,
        analytics_id: tracked.getAttribute("data-analytics-id") || undefined,
        component: componentName(tracked),
        element_label: safeLabel(tracked),
        element_path: elementDescriptor(tracked),
        destination: safeDestination(tracked),
        mouse_button: event.button,
      });
    };

    const onFocus = (event: FocusEvent) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
      posthog.capture("ui_field_focused", {
        ...baseProperties(),
        field_id: field.id || undefined,
        field_name: field.name || undefined,
        field_type: field instanceof HTMLSelectElement ? "select" : field.type,
        component: componentName(field),
      });
    };

    const onChange = (event: Event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
      posthog.capture("ui_field_changed", {
        ...baseProperties(),
        field_id: field.id || undefined,
        field_name: field.name || undefined,
        field_type: field instanceof HTMLSelectElement ? "select" : field.type,
        value_length: field instanceof HTMLSelectElement ? undefined : field.value.length,
        selected_index: field instanceof HTMLSelectElement ? field.selectedIndex : undefined,
        checked: field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type) ? field.checked : undefined,
        component: componentName(field),
      });
    };

    const onSubmit = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement)) return;
      posthog.capture("ui_form_submitted", {
        ...baseProperties(),
        form_id: event.target.id || undefined,
        form_name: event.target.getAttribute("name") || undefined,
        field_count: event.target.elements.length,
        component: componentName(event.target),
      });
    };

    let scrollScheduled = false;
    const onScroll = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        scrollScheduled = false;
        const available = document.documentElement.scrollHeight - window.innerHeight;
        if (available <= 0) return;
        const depth = Math.round((window.scrollY / available) * 100);
        for (const milestone of [25, 50, 75, 90, 100]) {
          if (depth >= milestone && !scrollMilestonesRef.current.has(milestone)) {
            scrollMilestonesRef.current.add(milestone);
            posthog.capture("page_scroll_depth", { ...baseProperties(), depth_percent: milestone });
          }
        }
      });
    };

    const onVisibility = () => posthog.capture("page_visibility_changed", {
      ...baseProperties(),
      visibility_state: document.visibilityState,
    });
    const onError = (event: ErrorEvent) => posthog.capture("frontend_error", {
      ...baseProperties(),
      error_name: event.error instanceof Error ? event.error.name : "Error",
      error_message: safeError(event.error || event.message),
      source_file: event.filename ? event.filename.split("/").pop() : undefined,
      line: event.lineno || undefined,
      column: event.colno || undefined,
    });
    const onRejection = (event: PromiseRejectionEvent) => posthog.capture("frontend_unhandled_rejection", {
      ...baseProperties(),
      error_message: safeError(event.reason),
    });

    document.addEventListener("click", onClick, true);
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("change", onChange, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    const onLoad = () => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (!nav) return;
      posthog.capture("page_load_performance", {
        ...baseProperties(),
        dns_ms: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
        connect_ms: Math.round(nav.connectEnd - nav.connectStart),
        ttfb_ms: Math.round(nav.responseStart - nav.requestStart),
        dom_interactive_ms: Math.round(nav.domInteractive),
        load_complete_ms: Math.round(nav.loadEventEnd || performance.now()),
        transfer_size: nav.transferSize,
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("change", onChange, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("load", onLoad);
    };
  }, [posthog]);

  return null;
}

/** Associates events with the backend player ID without sending the wallet address. */
export function AnalyticsIdentity() {
  const posthog = usePostHog();
  const { player, isAuthenticated } = useAuth();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const playerId = player?._id ? String(player._id) : null;
    if (isAuthenticated && playerId && identifiedRef.current !== playerId) {
      posthog.identify(playerId, {
        is_authenticated: true,
        login_method: getUserLoginMethod() || "unknown",
      });
      identifiedRef.current = playerId;
    } else if (!isAuthenticated && identifiedRef.current) {
      posthog.reset();
      identifiedRef.current = null;
    }
  }, [isAuthenticated, player?._id, posthog]);

  return null;
}
