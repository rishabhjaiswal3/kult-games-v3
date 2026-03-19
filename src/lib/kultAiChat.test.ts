import { describe, expect, it } from "vitest";

import { resolveKultAIChatUrl } from "./kultAiChat";

describe("resolveKultAIChatUrl", () => {
  it("prefers an explicit chat URL override", () => {
    expect(
      resolveKultAIChatUrl({
        explicitUrl: "https://example.com/custom/chat",
        apiBaseUrl: "https://api.example.com",
        origin: "https://site.example.com",
      }),
    ).toBe("https://example.com/custom/chat");
  });

  it("maps API base URLs to the deployed assistant route", () => {
    expect(
      resolveKultAIChatUrl({
        apiBaseUrl: "https://kult-browser-rust-l2lwg.ondigitalocean.app",
      }),
    ).toBe("https://kult-browser-rust-l2lwg.ondigitalocean.app/assistant/v1/chat");
  });

  it("falls back to the current origin when no API env is provided", () => {
    expect(
      resolveKultAIChatUrl({
        origin: "https://kult-games.example.com",
      }),
    ).toBe("https://kult-games.example.com/assistant/v1/chat");
  });

  it("uses the local inference service as the final fallback", () => {
    expect(resolveKultAIChatUrl({})).toBe("http://localhost:8000/v1/chat");
  });
});
