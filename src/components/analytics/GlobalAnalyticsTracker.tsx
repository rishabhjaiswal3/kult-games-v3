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

function safeNetworkEndpoint(input: RequestInfo | URL) {
  try {
    const raw = input instanceof Request ? input.url : String(input);
    const url = new URL(raw, window.location.origin);
    return {
      service: url.origin === window.location.origin ? "same-origin" : url.hostname,
      endpoint: routePattern(url.pathname)
        .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "/:id")
        .replace(/\/[A-Za-z0-9_-]{18,}(?=\/|$)/g, "/:id")
        .replace(/\/\d+(?=\/|$)/g, "/:id"),
    };
  } catch {
    return { service: "unknown", endpoint: "unknown" };
  }
}

function shouldTrackFetch(input: RequestInfo | URL) {
  try {
    const raw = input instanceof Request ? input.url : String(input);
    const url = new URL(raw, window.location.origin);
    return !url.hostname.includes("posthog") && !["blob:", "data:"].includes(url.protocol);
  } catch {
    return false;
  }
}

/** Global, delegated analytics that covers lazy routes, portals, cards, controls and forms. */
export function GlobalAnalyticsTracker() {
  const posthog = usePostHog();
  const routeRef = useRef("");
  const scrollMilestonesRef = useRef(new Set<number>());
  const recentClicksRef = useRef(new Map<string, number[]>());
  const focusedFieldsRef = useRef(new WeakMap<Element, { startedAt: number; initialLength: number }>());
  const visibleSinceRef = useRef(Date.now());
  const pageStartedAtRef = useRef(Date.now());
  const engagedMsRef = useRef(0);

  useEffect(() => {
    const capturePage = (navigationType: string) => {
      const path = routePattern(window.location.pathname);
      if (routeRef.current === path && navigationType !== "initial") return;
      if (routeRef.current) {
        posthog.capture("page_engagement", {
          ...baseProperties(),
          previous_page_path: routeRef.current,
          elapsed_ms: Date.now() - pageStartedAtRef.current,
          engaged_ms: engagedMsRef.current + (document.hidden ? 0 : Date.now() - visibleSinceRef.current),
          exit_reason: "navigation",
        });
      }
      routeRef.current = path;
      pageStartedAtRef.current = Date.now();
      visibleSinceRef.current = Date.now();
      engagedMsRef.current = 0;
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
      const clickKey = `${routePattern(window.location.pathname)}:${elementDescriptor(tracked)}`;
      const now = Date.now();
      const recent = [...(recentClicksRef.current.get(clickKey) ?? []), now].filter((time) => now - time < 1500);
      recentClicksRef.current.set(clickKey, recent);
      if (recent.length === 3) posthog.capture("ui_rage_click", {
        ...baseProperties(), element_path: elementDescriptor(tracked), element_label: safeLabel(tracked), click_count: recent.length,
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest("button, input, select, textarea, [aria-disabled='true']");
      const disabled = control instanceof HTMLButtonElement || control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement
        ? control.disabled : control?.getAttribute("aria-disabled") === "true";
      if (control && disabled) posthog.capture("disabled_control_attempted", {
        ...baseProperties(), element_path: elementDescriptor(control), element_label: safeLabel(control), component: componentName(control),
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
      focusedFieldsRef.current.set(field, { startedAt: Date.now(), initialLength: field.value.length });
    };

    const onBlur = (event: FocusEvent) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
      const focus = focusedFieldsRef.current.get(field);
      if (!focus) return;
      focusedFieldsRef.current.delete(field);
      if (field.value.length === focus.initialLength) posthog.capture("ui_field_abandoned", {
        ...baseProperties(), field_id: field.id || undefined, field_name: field.name || undefined,
        field_type: field instanceof HTMLSelectElement ? "select" : field.type,
        focused_ms: Date.now() - focus.startedAt, component: componentName(field),
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
    const trackVisibilityTime = () => {
      if (document.hidden) engagedMsRef.current += Date.now() - visibleSinceRef.current;
      else visibleSinceRef.current = Date.now();
      onVisibility();
    };
    const onPageHide = () => posthog.capture("page_engagement", {
      ...baseProperties(),
      elapsed_ms: Date.now() - pageStartedAtRef.current,
      engaged_ms: engagedMsRef.current + (document.hidden ? 0 : Date.now() - visibleSinceRef.current),
      exit_reason: "page_hidden",
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
    const onApiAnalytics = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown>>).detail;
      posthog.capture(detail?.outcome === "failure" ? "api_request_failed" : "api_request_completed", {
        ...baseProperties(),
        ...detail,
      });
      if (detail?.outcome === "success" && typeof detail.product_event === "string") {
        const { product_event: productEvent, ...safeApiProperties } = detail;
        posthog.capture(productEvent, {
          ...baseProperties(),
          ...safeApiProperties,
          source: "api_success",
        });
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!['Enter', ' '].includes(event.key) || !(event.target instanceof Element)) return;
      const control = event.target.closest("button, a, [role='button'], [role='link'], [data-analytics-id]");
      if (!control) return;
      posthog.capture("ui_keyboard_activated", {
        ...baseProperties(), key: event.key === ' ' ? "Space" : event.key,
        element_path: elementDescriptor(control), element_label: safeLabel(control), component: componentName(control),
      });
    };
    const onCopy = (event: ClipboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      posthog.capture("content_copy_attempted", {
        ...baseProperties(), component: target ? componentName(target) : undefined,
        source_tag: target?.tagName.toLowerCase(), selection_length: window.getSelection()?.toString().length || 0,
      });
    };
    const onResourceError = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement || target instanceof HTMLScriptElement || target instanceof HTMLLinkElement)) return;
      const rawUrl = target instanceof HTMLImageElement ? target.currentSrc || target.src : target instanceof HTMLScriptElement ? target.src : target.href;
      const network = safeNetworkEndpoint(rawUrl);
      posthog.capture("resource_load_failed", {
        ...baseProperties(), resource_type: target.tagName.toLowerCase(), ...network,
      });
    };

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      if (!shouldTrackFetch(input)) return originalFetch(input, init);
      const startedAt = performance.now();
      const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
      const network = safeNetworkEndpoint(input);
      try {
        const response = await originalFetch(input, init);
        window.dispatchEvent(new CustomEvent("kult:api-analytics", { detail: {
          ...network, transport: "fetch", outcome: response.ok ? "success" : "failure",
          method, status: response.status, duration_ms: Math.round(performance.now() - startedAt),
        } }));
        return response;
      } catch (error) {
        window.dispatchEvent(new CustomEvent("kult:api-analytics", { detail: {
          ...network, transport: "fetch", outcome: "failure", method,
          duration_ms: Math.round(performance.now() - startedAt), error_code: error instanceof DOMException ? error.name : "FETCH_ERROR",
        } }));
        throw error;
      }
    };

    let longTaskObserver: PerformanceObserver | undefined;
    if (typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) posthog.capture("ui_long_task", {
          ...baseProperties(), duration_ms: Math.round(entry.duration), start_ms: Math.round(entry.startTime),
        });
      });
      longTaskObserver.observe({ type: "longtask", buffered: true });
    }

    const observedImpressions = new WeakSet<Element>();
    const impressionObserver = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5 || observedImpressions.has(entry.target)) continue;
        observedImpressions.add(entry.target);
        posthog.capture("ui_component_viewed", {
          ...baseProperties(), component: componentName(entry.target), analytics_id: entry.target.getAttribute("data-analytics-id") || undefined,
          element_path: elementDescriptor(entry.target),
        });
      }
    }, { threshold: 0.5 });
    const observeAnalyticsElements = (root: ParentNode) => {
      if (root instanceof Element && root.matches("[data-analytics-component], [data-analytics-id]")) {
        impressionObserver?.observe(root);
      }
      root.querySelectorAll("[data-analytics-component], [data-analytics-id]").forEach((element) => impressionObserver?.observe(element));
    };
    observeAnalyticsElements(document);
    const analyticsMutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) observeAnalyticsElements(node);
        });
      }
    });
    analyticsMutationObserver.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("focusout", onBlur, true);
    document.addEventListener("change", onChange, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("visibilitychange", trackVisibilityTime);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("copy", onCopy, true);
    window.addEventListener("error", onResourceError, true);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("kult:api-analytics", onApiAnalytics);

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
      window.fetch = originalFetch;
      longTaskObserver?.disconnect();
      impressionObserver?.disconnect();
      analyticsMutationObserver.disconnect();
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("focusout", onBlur, true);
      document.removeEventListener("change", onChange, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("visibilitychange", trackVisibilityTime);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("copy", onCopy, true);
      window.removeEventListener("error", onResourceError, true);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("kult:api-analytics", onApiAnalytics);
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
