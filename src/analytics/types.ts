/** Shared activity / heatmap event shapes for SPA → `/api/activity`. */

export const ACTIVITY_EVENT_TYPES = [
  "page_view",
  "page_leave",
  "click",
  "dblclick",
  "context_menu",
  "pointer_down",
  "pointer_up",
  "mousemove",
  "hover",
  "scroll",
  "visibility",
  "focus",
  "blur",
  "input",
  "change",
  "submit",
  "keydown",
  "keyup",
  "copy",
  "paste",
  "selection",
  "resize",
  "route_change",
  "api_request",
  "api_error",
  "error",
  "performance",
  "idle",
  "custom",
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export type ActivityPointer = {
  x: number;
  y: number;
  pageX?: number;
  pageY?: number;
  nx?: number;
  ny?: number;
};

export type ActivityTarget = {
  tag?: string;
  id?: string;
  classes?: string;
  text?: string;
  href?: string;
  name?: string;
  role?: string;
  type?: string;
  dataTour?: string;
  selector?: string;
};

export type ActivityViewport = {
  w: number;
  h: number;
  scrollX?: number;
  scrollY?: number;
  dpr?: number;
};

export type ActivityEventPayload = {
  type: ActivityEventType | string;
  name?: string;
  path?: string;
  referrer?: string;
  ts?: number;
  sessionId?: string;
  anonymousId?: string;
  pointer?: ActivityPointer;
  target?: ActivityTarget;
  viewport?: ActivityViewport;
  durationMs?: number;
  value?: string | number | boolean | null;
  meta?: Record<string, unknown>;
};

export type ActivityHeatmapCell = {
  x: number;
  y: number;
  count: number;
};

export type ActivityHeatmapResponse = {
  path: string;
  from: string;
  to: string;
  gridSize: number;
  cells: ActivityHeatmapCell[];
  totalEvents: number;
};

export type ActivitySummaryBucket = {
  key: string;
  count: number;
};

export type ActivitySummaryResponse = {
  from: string;
  to: string;
  totalEvents: number;
  byType: ActivitySummaryBucket[];
  byPath: ActivitySummaryBucket[];
  byHour: ActivitySummaryBucket[];
  byDay: ActivitySummaryBucket[];
  topTargets: ActivitySummaryBucket[];
};
