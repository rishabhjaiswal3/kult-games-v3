const KULT_BROWSER_GAME_ID = "kult_browser";
const USER_ID_STORAGE_KEY = "kult-ai-user-id";
const SESSION_ID_STORAGE_KEY = "kult-ai-session-id";
const KULT_AI_DEPLOY_PATH = "/assistant/v1/chat";
const LOCAL_KULT_AI_API_URL = "http://localhost:8000/v1/chat";

export interface KultAIStreamOptions {
  query: string;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onSessionId?: (sessionId: string) => void;
}

const canUseStorage = () => typeof window !== "undefined";

const readStorageValue = (key: string) => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorageValue = (key: string, value: string, persistent: boolean) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    const storage = persistent ? window.localStorage : window.sessionStorage;
    storage.setItem(key, value);
  } catch {
    // Storage access is optional for anonymous chat continuity.
  }
};

const createOpaqueId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getKultAIUserId = () => {
  const stored = readStorageValue(USER_ID_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const next = createOpaqueId("browser");
  writeStorageValue(USER_ID_STORAGE_KEY, next, true);
  return next;
};

export const getKultAISessionId = () => readStorageValue(SESSION_ID_STORAGE_KEY);

export const setKultAISessionId = (sessionId: string) => {
  writeStorageValue(SESSION_ID_STORAGE_KEY, sessionId, false);
};

const joinUrl = (baseUrl: string, path: string) => `${baseUrl.replace(/\/+$/, "")}${path}`;

export const resolveKultAIChatUrl = ({
  explicitUrl,
  apiBaseUrl,
  origin,
}: {
  explicitUrl?: string;
  apiBaseUrl?: string;
  origin?: string;
}) => {
  const normalizedExplicitUrl = explicitUrl?.trim();
  if (normalizedExplicitUrl) {
    return normalizedExplicitUrl;
  }

  const normalizedApiBaseUrl = apiBaseUrl?.trim();
  if (normalizedApiBaseUrl) {
    return joinUrl(normalizedApiBaseUrl, KULT_AI_DEPLOY_PATH);
  }

  const normalizedOrigin = origin?.trim();
  if (normalizedOrigin) {
    return joinUrl(normalizedOrigin, KULT_AI_DEPLOY_PATH);
  }

  return LOCAL_KULT_AI_API_URL;
};

export const getKultAIChatUrl = () =>
  resolveKultAIChatUrl({
    explicitUrl: import.meta.env.VITE_KULT_AI_API_URL as string | undefined,
    apiBaseUrl: import.meta.env.VITE_API_URL as string | undefined,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  });

const parseStreamChunk = (payload: string) => {
  const lines = payload.replace(/\r\n/g, "\n").split("\n");
  let aggregated = "";

  for (const line of lines) {
    if (!line.startsWith("data:")) {
      continue;
    }

    const data = line.slice(5).trimStart();
    if (!data || data === "[DONE]") {
      continue;
    }

    aggregated += data.replace(/\\n/g, "\n");
  }

  return aggregated;
};

export const streamKultAIReply = async ({
  query,
  signal,
  onChunk,
  onSessionId,
}: KultAIStreamOptions) => {
  const response = await fetch(getKultAIChatUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: getKultAIUserId(),
      session_id: getKultAISessionId(),
      query,
      context: {
        game_id: KULT_BROWSER_GAME_ID,
      },
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`KULT AI request failed with status ${response.status}`);
  }

  const responseSessionId = response.headers.get("X-Session-Id");
  if (responseSessionId) {
    setKultAISessionId(responseSessionId);
    onSessionId?.(responseSessionId);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n");

    let boundaryIndex = buffer.indexOf("\n\n");
    while (boundaryIndex !== -1) {
      const rawEvent = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);
      const parsed = parseStreamChunk(rawEvent);
      if (parsed) {
        onChunk(parsed);
      }
      boundaryIndex = buffer.indexOf("\n\n");
    }

    if (done) {
      const parsed = parseStreamChunk(buffer);
      if (parsed) {
        onChunk(parsed);
      }
      break;
    }
  }
};
