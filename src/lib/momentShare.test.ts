import { describe, expect, it, vi } from "vitest";

describe("buildMomentShareUrl", () => {
  it("builds the public moment page URL on the current origin", async () => {
    vi.stubGlobal("window", { location: { origin: "https://kult-browser-rust-l2lwg.ondigitalocean.app" } });
    vi.stubEnv("VITE_API_URL", "https://kult-browser-rust-l2lwg.ondigitalocean.app");

    const { buildMomentShareUrl, buildMomentSharePayload } = await import("./momentShare");
    const momentId = "IZugAtUEl7LHQTbWzjpMG";

    expect(buildMomentShareUrl(momentId)).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/moments/${momentId}`,
    );

    const payload = buildMomentSharePayload({
      momentId,
      title: "New Trash Talk",
      description: "Test",
      tags: [],
      relatedGames: [],
      playerWalletAddress: "0x1",
      numLikes: 0,
      numComments: 0,
      aiHighlights: [],
    });

    expect(payload.url).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/moments/${momentId}`,
    );
  });
});
