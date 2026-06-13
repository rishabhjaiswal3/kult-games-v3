import { describe, expect, it, vi } from "vitest";

describe("buildMomentSharePreviewUrl", () => {
  it("uses /api/share when built from VITE_API_URL", async () => {
    vi.stubEnv("VITE_API_URL", "https://kult-browser-rust-l2lwg.ondigitalocean.app");
    vi.stubEnv("VITE_SHARE_BASE_URL", "");
    vi.stubEnv("VITE_SHARE_PREVIEW_PATH", "");

    const { buildMomentSharePreviewUrl } = await import("./momentShare");

    expect(buildMomentSharePreviewUrl("abc123")).toBe(
      "https://kult-browser-rust-l2lwg.ondigitalocean.app/api/share/moments/abc123",
    );
  });
});
