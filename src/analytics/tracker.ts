import { activityApi } from "@/api/activityApi";
import { StorageKeys } from "@/constants/storageKeys";
import type {
  ActivityEventPayload,
  ActivityEventType,
  ActivityPointer,
  ActivityTarget,
  ActivityViewport,
} from "@/analytics/types";

const ANON_KEY = "kult_activity_anon_id";
const SESSION_KEY = "kult_activity_session_id";
const ENABLED_KEY = "kult_activity_enabled";

const FLUSH_INTERVAL_MS = 4_000;
const MAX_QUEUE = 180;
const MOUSEMOVE_THROTTLE_MS = 280;
const SCROLL_THROTTLE_MS = 400;
const HOVER_THROTTLE_MS = 700;
const IDLE_MS = 60_000;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function readOrCreate(storage: Storage, key: string): string {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const next = uuid();
    storage.setItem(key, next);
    return next;
  } catch {
    return uuid();
  }
}

function isTrackingEnabled(): boolean {
  try {
    const v = localStorage.getItem(ENABLED_KEY);
    if (v === "0" || v === "false") return false;
  } catch {
    /* ignore */
  }
  // Default ON for free first-party analytics (can flip via localStorage).
  return import.meta.env.VITE_ACTIVITY_TRACKING !== "0";
}

function currentPath(): string {
  return `${window.location.pathname}${window.location.search}` || "/";
}

function viewport(): ActivityViewport {
  return {
    w: window.innerWidth || 0,
    h: window.innerHeight || 0,
    scrollX: Math.round(window.scrollX || 0),
    scrollY: Math.round(window.scrollY || 0),
    dpr: window.devicePixelRatio || 1,
  };
}

function pointerFromEvent(e: MouseEvent | PointerEvent): ActivityPointer {
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  return {
    x: Math.round(e.clientX),
    y: Math.round(e.clientY),
    pageX: Math.round(e.pageX),
    pageY: Math.round(e.pageY),
    nx: Math.min(1, Math.max(0, e.clientX / w)),
    ny: Math.min(1, Math.max(0, e.clientY / h)),
  };
}

function cssPath(el: Element | null, depth = 4): string | undefined {
  if (!el || !(el instanceof Element)) return undefined;
  const parts: string[] = [];
  let node: Element | null = el;
  let i = 0;
  while (node && node.nodeType === 1 && i < depth && node.tagName.toLowerCase() !== "html") {
    let part = node.tagName.toLowerCase();
    const id = node.getAttribute("id");
    if (id) {
      parts.unshift(`${part}#${CSS.escape ? CSS.escape(id) : id}`);
      break;
    }
    const tour = node.getAttribute("data-tour");
    if (tour) {
      parts.unshift(`${part}[data-tour="${tour}"]`);
      break;
    }
    const parent = node.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((c) => c.tagName === node!.tagName);
      if (siblings.length > 1) {
        const idx = siblings.indexOf(node) + 1;
        part += `:nth-of-type(${idx})`;
      }
    }
    parts.unshift(part);
    node = parent;
    i += 1;
  }
  return parts.join(" > ") || undefined;
}

function describeTarget(raw: EventTarget | null): ActivityTarget | undefined {
  if (!(raw instanceof Element)) return undefined;
  const el = raw instanceof HTMLElement ? raw : (raw.closest("a,button,input,select,textarea,[data-tour],[role]") as HTMLElement | null) ?? (raw as HTMLElement);
  if (!el) return undefined;

  const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  return {
    tag: el.tagName?.toLowerCase(),
    id: el.id || undefined,
    classes: typeof el.className === "string" ? el.className.slice(0, 200) : undefined,
    text: text ? text.slice(0, 160) : undefined,
    href: el.getAttribute?.("href")?.slice(0, 300) || undefined,
    name: el.getAttribute?.("name")?.slice(0, 120) || undefined,
    role: el.getAttribute?.("role")?.slice(0, 60) || undefined,
    type: el.getAttribute?.("type")?.slice(0, 60) || undefined,
    dataTour: el.getAttribute?.("data-tour")?.slice(0, 120) || el.closest?.("[data-tour]")?.getAttribute("data-tour")?.slice(0, 120) || undefined,
    selector: cssPath(el),
  };
}

type TrackerState = {
  started: boolean;
  queue: ActivityEventPayload[];
  flushTimer: number | null;
  pageEnteredAt: number;
  lastPath: string;
  lastMouseMoveAt: number;
  lastScrollAt: number;
  lastHoverAt: number;
  lastActivityAt: number;
  idleReported: boolean;
  teardown: Array<() => void>;
};

const state: TrackerState = {
  started: false,
  queue: [],
  flushTimer: null,
  pageEnteredAt: Date.now(),
  lastPath: "/",
  lastMouseMoveAt: 0,
  lastScrollAt: 0,
  lastHoverAt: 0,
  lastActivityAt: Date.now(),
  idleReported: false,
  teardown: [],
};

function enqueue(partial: ActivityEventPayload, urgent = false) {
  if (!isTrackingEnabled() || typeof window === "undefined") return;

  const event: ActivityEventPayload = {
    ...partial,
    type: partial.type,
    name: partial.name ?? String(partial.type),
    path: partial.path ?? currentPath(),
    referrer: partial.referrer ?? document.referrer ?? "",
    ts: partial.ts ?? Date.now(),
    sessionId: partial.sessionId ?? readOrCreate(sessionStorage, SESSION_KEY),
    anonymousId: partial.anonymousId ?? readOrCreate(localStorage, ANON_KEY),
    viewport: partial.viewport ?? viewport(),
  };

  state.queue.push(event);
  if (state.queue.length > MAX_QUEUE) {
    state.queue.splice(0, state.queue.length - MAX_QUEUE);
  }

  if (urgent || state.queue.length >= 40) {
    void flush();
  }
}

async function flush() {
  if (!state.queue.length) return;
  const batch = state.queue.splice(0, 120);
  const ok = await activityApi.ingest(batch);
  if (!ok) {
    // put back (capped) so brief network blips don't lose everything
    state.queue = [...batch.slice(-60), ...state.queue].slice(0, MAX_QUEUE);
  }
}

function flushBeacon() {
  if (!state.queue.length) return;
  const batch = state.queue.splice(0, MAX_QUEUE);
  try {
    const token = localStorage.getItem(StorageKeys.local.authToken);
    const body = JSON.stringify({ events: batch });
    const endpoint = `${apiClientBase()}/activity/events`;

    // Prefer keepalive fetch so we can still attach Authorization when available.
    if (typeof fetch === "function") {
      void fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && token !== "undefined" && token !== "null"
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body,
        keepalive: true,
      }).catch(() => {
        /* ignore unload failures */
      });
      return;
    }

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      void navigator.sendBeacon(endpoint, blob);
    }
  } catch {
    state.queue.unshift(...batch);
  }
}

function apiClientBase(): string {
  // Mirror MAIN_BACKEND: VITE_API_URL + /api (or absolute API host)
  const raw = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  if (!raw) return "/api";
  const trimmed = raw.replace(/\/$/, "");
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

function trackPageView(path = currentPath()) {
  const now = Date.now();
  if (state.lastPath && state.lastPath !== path) {
    enqueue({
      type: "page_leave",
      name: "page_leave",
      path: state.lastPath,
      durationMs: Math.max(0, now - state.pageEnteredAt),
    });
  }
  state.lastPath = path;
  state.pageEnteredAt = now;
  enqueue({
    type: "page_view",
    name: "page_view",
    path,
    meta: { title: document.title?.slice(0, 160) },
  }, true);
}

function markInteracted() {
  state.lastActivityAt = Date.now();
  state.idleReported = false;
}

function onClick(e: MouseEvent) {
  markInteracted();
  enqueue({
    type: "click",
    name: "click",
    pointer: pointerFromEvent(e),
    target: describeTarget(e.target),
    meta: { button: e.button, detail: e.detail },
  });
}

function onDblClick(e: MouseEvent) {
  markInteracted();
  enqueue({
    type: "dblclick",
    name: "dblclick",
    pointer: pointerFromEvent(e),
    target: describeTarget(e.target),
  });
}

function onContextMenu(e: MouseEvent) {
  enqueue({
    type: "context_menu",
    name: "context_menu",
    pointer: pointerFromEvent(e),
    target: describeTarget(e.target),
  });
}

function onPointerDown(e: PointerEvent) {
  markInteracted();
  enqueue({
    type: "pointer_down",
    name: "pointer_down",
    pointer: pointerFromEvent(e),
    target: describeTarget(e.target),
    meta: { pointerType: e.pointerType },
  });
}

function onMouseMove(e: MouseEvent) {
  const now = Date.now();
  if (now - state.lastMouseMoveAt < MOUSEMOVE_THROTTLE_MS) return;
  state.lastMouseMoveAt = now;
  markInteracted();
  enqueue({
    type: "mousemove",
    name: "mousemove",
    pointer: pointerFromEvent(e),
  });
}

function onMouseOver(e: MouseEvent) {
  const now = Date.now();
  if (now - state.lastHoverAt < HOVER_THROTTLE_MS) return;
  const target = describeTarget(e.target);
  if (!target?.dataTour && !target?.id && !(target?.tag === "button" || target?.tag === "a")) return;
  state.lastHoverAt = now;
  enqueue({
    type: "hover",
    name: "hover",
    pointer: pointerFromEvent(e),
    target,
  });
}

function onScroll() {
  const now = Date.now();
  if (now - state.lastScrollAt < SCROLL_THROTTLE_MS) return;
  state.lastScrollAt = now;
  markInteracted();
  const doc = document.documentElement;
  const maxScroll = Math.max(1, (doc.scrollHeight || 1) - window.innerHeight);
  const depth = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  enqueue({
    type: "scroll",
    name: "scroll",
    value: Math.round(depth * 100),
    meta: { depth },
    viewport: viewport(),
  });
}

function onVisibility() {
  enqueue({
    type: "visibility",
    name: "visibility",
    value: document.visibilityState,
  }, document.visibilityState === "hidden");
  if (document.visibilityState === "hidden") {
    flushBeacon();
  }
}

function onFocusIn(e: FocusEvent) {
  markInteracted();
  enqueue({
    type: "focus",
    name: "focus",
    target: describeTarget(e.target),
  });
}

function onFocusOut(e: FocusEvent) {
  enqueue({
    type: "blur",
    name: "blur",
    target: describeTarget(e.target),
  });
}

function onInput(e: Event) {
  markInteracted();
  const el = e.target as HTMLInputElement | HTMLTextAreaElement | null;
  enqueue({
    type: "input",
    name: "input",
    target: describeTarget(e.target),
    // Never send raw input contents — only length / emptiness for privacy.
    meta: {
      valueLength: typeof el?.value === "string" ? el.value.length : undefined,
      empty: typeof el?.value === "string" ? el.value.length === 0 : undefined,
      inputType: (e as InputEvent).inputType,
    },
  });
}

function onChange(e: Event) {
  markInteracted();
  enqueue({
    type: "change",
    name: "change",
    target: describeTarget(e.target),
  });
}

function onSubmit(e: Event) {
  markInteracted();
  enqueue({
    type: "submit",
    name: "submit",
    target: describeTarget(e.target),
  }, true);
}

function onKeyDown(e: KeyboardEvent) {
  markInteracted();
  // Skip character keys — keep shortcuts / navigation only for privacy.
  const isCombo = e.metaKey || e.ctrlKey || e.altKey;
  const isNav = ["Tab", "Enter", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "Delete"].includes(e.key);
  if (!isCombo && !isNav) return;
  enqueue({
    type: "keydown",
    name: "keydown",
    target: describeTarget(e.target),
    meta: {
      key: e.key.slice(0, 24),
      code: e.code?.slice(0, 24),
      meta: e.metaKey,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
    },
  });
}

function onCopy() {
  enqueue({ type: "copy", name: "copy" });
}

function onPaste() {
  enqueue({ type: "paste", name: "paste" });
}

function onSelectionChange() {
  const sel = window.getSelection()?.toString() ?? "";
  if (!sel.trim()) return;
  enqueue({
    type: "selection",
    name: "selection",
    meta: { length: sel.length },
  });
}

function onResize() {
  enqueue({
    type: "resize",
    name: "resize",
    viewport: viewport(),
  });
}

function onWindowError(event: ErrorEvent) {
  enqueue({
    type: "error",
    name: "window_error",
    meta: {
      message: String(event.message || "").slice(0, 240),
      source: String(event.filename || "").slice(0, 200),
      line: event.lineno,
      col: event.colno,
    },
  });
}

function onUnhandledRejection(event: PromiseRejectionEvent) {
  enqueue({
    type: "error",
    name: "unhandled_rejection",
    meta: {
      reason: String(event.reason?.message || event.reason || "").slice(0, 240),
    },
  });
}

function tickIdle() {
  const idleFor = Date.now() - state.lastActivityAt;
  if (idleFor >= IDLE_MS && !state.idleReported) {
    state.idleReported = true;
    enqueue({
      type: "idle",
      name: "idle",
      durationMs: idleFor,
    });
  }
}

function capturePerformance() {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return;
    enqueue({
      type: "performance",
      name: "navigation_timing",
      meta: {
        ttfb: Math.round(nav.responseStart),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        load: Math.round(nav.loadEventEnd),
        transferSize: nav.transferSize,
        type: nav.type,
      },
    });
  } catch {
    /* ignore */
  }
}

function add(target: Window | Document, type: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
  target.addEventListener(type, handler, options);
  state.teardown.push(() => target.removeEventListener(type, handler, options));
}

/** Public track helper for product-specific custom events. */
export function trackActivity(
  type: ActivityEventType | string,
  props?: Omit<ActivityEventPayload, "type" | "sessionId" | "anonymousId"> & { urgent?: boolean },
) {
  const { urgent, ...rest } = props ?? {};
  enqueue({ type, name: rest.name ?? String(type), ...rest }, Boolean(urgent));
}

export function trackRouteChange(path: string) {
  enqueue({
    type: "route_change",
    name: "route_change",
    path,
    meta: { from: state.lastPath },
  });
  trackPageView(path);
}

export function trackApiActivity(props: {
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  ok?: boolean;
  service?: string;
}) {
  const pathOnly = props.url.split("?")[0]?.slice(0, 300) ?? "";
  // Never recurse on our own ingest endpoint.
  if (pathOnly.includes("/activity/events")) return;
  enqueue({
    type: props.ok === false ? "api_error" : "api_request",
    name: props.ok === false ? "api_error" : "api_request",
    meta: {
      method: props.method,
      url: pathOnly,
      status: props.status,
      durationMs: props.durationMs,
      service: props.service,
    },
    durationMs: props.durationMs,
  });
}

export function startActivityTracker() {
  if (state.started || typeof window === "undefined" || !isTrackingEnabled()) return;
  state.started = true;
  state.lastPath = currentPath();
  state.pageEnteredAt = Date.now();

  // Page views are owned by ActivityTrackerProvider via trackRouteChange.
  capturePerformance();

  add(document, "click", onClick as EventListener, true);
  add(document, "dblclick", onDblClick as EventListener, true);
  add(document, "contextmenu", onContextMenu as EventListener, true);
  add(document, "pointerdown", onPointerDown as EventListener, true);
  add(document, "mousemove", onMouseMove as EventListener, { passive: true, capture: true });
  add(document, "mouseover", onMouseOver as EventListener, true);
  add(document, "scroll", onScroll as EventListener, { passive: true, capture: true });
  add(document, "visibilitychange", onVisibility as EventListener);
  add(document, "focusin", onFocusIn as EventListener, true);
  add(document, "focusout", onFocusOut as EventListener, true);
  add(document, "input", onInput as EventListener, true);
  add(document, "change", onChange as EventListener, true);
  add(document, "submit", onSubmit as EventListener, true);
  add(document, "keydown", onKeyDown as EventListener, true);
  add(document, "copy", onCopy as EventListener, true);
  add(document, "paste", onPaste as EventListener, true);
  add(document, "selectionchange", onSelectionChange as EventListener);
  add(window, "resize", onResize as EventListener, { passive: true });
  add(window, "error", onWindowError as EventListener);
  add(window, "unhandledrejection", onUnhandledRejection as EventListener);

  const onHide = () => flushBeacon();
  add(window, "pagehide", onHide as EventListener);
  add(window, "beforeunload", onHide as EventListener);

  state.flushTimer = window.setInterval(() => {
    tickIdle();
    void flush();
  }, FLUSH_INTERVAL_MS);
  state.teardown.push(() => {
    if (state.flushTimer) window.clearInterval(state.flushTimer);
    state.flushTimer = null;
  });
}

export function stopActivityTracker() {
  flushBeacon();
  for (const fn of state.teardown.splice(0)) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
  state.started = false;
}

export function flushActivityNow() {
  return flush();
}
