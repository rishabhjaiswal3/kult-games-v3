const ASSISTANT_PUBLIC_PATH = "/assistant/v1/chat";
const LOCAL_DEV_CHAT_URL = "http://localhost:8000/v1/chat";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

type BrowserLocationLike = Pick<Location, "origin" | "hostname">;

interface KultAiEnv {
  VITE_API_URL?: string;
  VITE_KULT_AI_API_URL?: string;
}

export interface StreamKultAIReplyOptions {
  message: string;
  userId: string;
  sessionId?: string | null;
  gameId?: string | null;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
}

export interface StreamKultAIReplyResult {
  reply: string;
  sessionId: string | null;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getViteEnv = (): KultAiEnv => {
  const env = import.meta.env as unknown as KultAiEnv;
  return env ?? {};
};

export const getKultAIChatUrl = (locationLike?: BrowserLocationLike) => {
  const env = getViteEnv();
  const explicitUrl = env.VITE_KULT_AI_API_URL?.trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const apiBaseUrl = env.VITE_API_URL?.trim();
  if (apiBaseUrl) {
    return `${trimTrailingSlash(apiBaseUrl)}${ASSISTANT_PUBLIC_PATH}`;
  }

  if (locationLike && LOCAL_HOSTS.has(locationLike.hostname)) {
    return LOCAL_DEV_CHAT_URL;
  }

  if (locationLike?.origin) {
    return `${trimTrailingSlash(locationLike.origin)}${ASSISTANT_PUBLIC_PATH}`;
  }

  return LOCAL_DEV_CHAT_URL;
};

const decodeSsePayload = (payload: string) => payload.replace(/\\n/g, "\n");

export const parseSseEventDataLines = (rawEvent: string) => {
  const dataLines = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => (line.startsWith("data: ") ? line.slice(6) : line.slice(5)));

  return dataLines;
};

const readErrorMessage = async (response: Response) => {
  const fallback = `KULT AI request failed with ${response.status}.`;
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      return payload?.detail || payload?.error || payload?.message || fallback;
    }

    const text = (await response.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
};

export const streamKultAIReply = async ({
  message,
  userId,
  sessionId,
  gameId,
  signal,
  onToken,
}: StreamKultAIReplyOptions): Promise<StreamKultAIReplyResult> => {
  const locationLike =
    typeof window === "undefined"
      ? undefined
      : { origin: window.location.origin, hostname: window.location.hostname };

  const response = await fetch(getKultAIChatUrl(locationLike), {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId ?? undefined,
      query: message,
      context: {
        game_id: gameId ?? undefined,
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (!response.body) {
    throw new Error("KULT AI returned an empty response stream.");
  }

  const nextSessionId = response.headers.get("x-session-id") ?? sessionId ?? null;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let reply = "";
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

      let boundaryIndex = buffer.indexOf("\n\n");
      while (boundaryIndex !== -1) {
        const rawEvent = buffer.slice(0, boundaryIndex);
        buffer = buffer.slice(boundaryIndex + 2);

        for (const payload of parseSseEventDataLines(rawEvent)) {
          if (payload === "[DONE]") {
            return { reply, sessionId: nextSessionId };
          }

          const token = decodeSsePayload(payload);
          reply += token;
          onToken?.(token);
        }

        boundaryIndex = buffer.indexOf("\n\n");
      }

      if (done) {
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { reply, sessionId: nextSessionId };
};
