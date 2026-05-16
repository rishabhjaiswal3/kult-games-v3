import { afterEach, describe, expect, it, vi } from "vitest";

import { getKultAIChatUrl, parseSseEventDataLines, streamKultAIReply } from "@/lib/kultAiChat";

describe("getKultAIChatUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers the explicit AI endpoint override", () => {
    vi.stubEnv("VITE_KULT_AI_API_URL", "https://example.com/custom/chat");
    vi.stubEnv("VITE_API_URL", "https://example.com");

    expect(getKultAIChatUrl({ origin: "http://localhost:8080", hostname: "localhost" })).toBe(
      "https://example.com/custom/chat",
    );
  });

  it("builds the assistant route from VITE_API_URL", () => {
    vi.stubEnv("VITE_API_URL", "https://kult-browser-rust-l2lwg.ondigitalocean.app/");

    expect(getKultAIChatUrl({ origin: "http://localhost:8080", hostname: "localhost" })).toBe(
      "https://kult-browser-rust-l2lwg.ondigitalocean.app/assistant/v1/chat",
    );
  });

  it("uses the local inference service during localhost development when no env vars are set", () => {
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_KULT_AI_API_URL", "");

    expect(getKultAIChatUrl({ origin: "http://localhost:8080", hostname: "localhost" })).toBe(
      "http://localhost:8000/v1/chat",
    );
  });

  it("falls back to the same-origin assistant path for deployed frontends", () => {
    expect(
      getKultAIChatUrl({
        origin: "https://kult-browser-rust-l2lwg.ondigitalocean.app",
        hostname: "kult-browser-rust-l2lwg.ondigitalocean.app",
      }),
    ).toBe("https://kult-browser-rust-l2lwg.ondigitalocean.app/assistant/v1/chat");
  });

  it("preserves leading spaces in SSE chunks", () => {
    expect(parseSseEventDataLines("data: Hello")).toEqual(["Hello"]);
    expect(parseSseEventDataLines("data:  world")).toEqual([" world"]);
  });

  it("keeps the current session id when the stream omits a replacement header", async () => {
    vi.stubEnv("VITE_KULT_AI_API_URL", "https://example.com/chat");
    const encoder = new TextEncoder();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode("data: Hello\n\n"));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        }),
        {
          status: 200,
          headers: { "content-type": "text/event-stream" },
        },
      ),
    );

    const result = await streamKultAIReply({
      message: "Compare games for me",
      userId: "user-1",
      sessionId: "session-1",
    });

    expect(result).toEqual({ reply: "Hello", sessionId: "session-1" });
    expect(fetchSpy).toHaveBeenCalledOnce();
    fetchSpy.mockRestore();
  });
});
