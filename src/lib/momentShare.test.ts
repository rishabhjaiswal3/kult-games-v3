import { describe, expect, it, vi } from "vitest";

describe("buildMomentShareUrl", () => {
  it("builds the public moment page URL on the current origin", async () => {
    vi.resetModules();
    vi.stubGlobal("window", { location: { origin: "https://kult-browser-rust-l2lwg.ondigitalocean.app" } });
    vi.stubEnv("VITE_API_URL", "https://kult-browser-rust-l2lwg.ondigitalocean.app");

    const {
      buildMomentShareUrl,
      buildMomentSharePayload,
      buildMomentShareOgImageUrl,
      buildMomentPublicPreviewUrl,
    } = await import("./momentShare");
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
    expect(payload.momentUrl).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/moments/${momentId}`,
    );
    expect(payload.previewUrl).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/api/share/moments/${momentId}`,
    );
    expect(payload.publicPreviewUrl).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/share/moments/${momentId}`,
    );
    expect(buildMomentPublicPreviewUrl(momentId)).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/share/moments/${momentId}`,
    );
    expect(buildMomentShareOgImageUrl(momentId)).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/api/moments/${momentId}/share-image.jpg`,
    );
  });

  it("uses the backend base for preview and image URLs when the app origin differs", async () => {
    vi.resetModules();
    vi.stubGlobal("window", { location: { origin: "https://app.kult.games" } });
    vi.stubEnv("VITE_API_URL", "https://kult-browser-rust-l2lwg.ondigitalocean.app");

    const { buildMomentSharePayload, buildMomentShareOgImageUrl } = await import("./momentShare");
    const momentId = "moment-123";
    const payload = buildMomentSharePayload({
      momentId,
      title: "Journey Just Begin",
      description: "Starting to Play WarzoneWarriors",
      assetUrl: "https://cdn.example/moment.webp",
      tags: [],
      relatedGames: ["warzonewarriors"],
      playerWalletAddress: "0x1",
      numLikes: 0,
      numComments: 0,
      aiHighlights: [],
    });

    expect(payload.url).toBe(`https://app.kult.games/moments/${momentId}`);
    expect(payload.momentUrl).toBe(`https://app.kult.games/moments/${momentId}`);
    expect(payload.previewUrl).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/api/share/moments/${momentId}`,
    );
    expect(payload.publicPreviewUrl).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/share/moments/${momentId}`,
    );
    expect(payload.mediaUrl).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/api/moments/${momentId}/share-image.jpg`,
    );
    expect(buildMomentShareOgImageUrl(momentId)).toBe(
      `https://kult-browser-rust-l2lwg.ondigitalocean.app/api/moments/${momentId}/share-image.jpg`,
    );
  });
});

describe("resolvePlatformShareUrl", () => {
  it("uses preview URL for social crawlers by default", async () => {
    vi.resetModules();
    vi.stubGlobal("window", { location: { origin: "https://kult-browser-rust-l2lwg.ondigitalocean.app" } });

    const { buildMomentSharePayload, resolvePlatformShareUrl } = await import("./momentShare");
    const payload = buildMomentSharePayload({
      momentId: "abc",
      title: "Test",
      description: "Desc",
      tags: [],
      relatedGames: [],
      playerWalletAddress: "0x1",
      numLikes: 0,
      numComments: 0,
      aiHighlights: [],
    });

    expect(resolvePlatformShareUrl(payload)).toBe(payload.previewUrl);
  });
});

describe("buildRedditSubmitParams", () => {
  it("merges title and description for Reddit link posts", async () => {
    vi.resetModules();
    const { buildRedditSubmitParams, buildRedditSubmitTitle } = await import("./momentShare");

    const payload = {
      title: "New Trash Talk",
      teaser: "Let's try to wrap up early because you are not good enough to compete",
      url: "https://kult-browser-rust-l2lwg.ondigitalocean.app/moments/abc",
    };

    expect(buildRedditSubmitTitle(payload)).toContain("New Trash Talk —");
    expect(buildRedditSubmitTitle(payload)).toContain("wrap up early");

    const params = buildRedditSubmitParams(payload);
    expect(params.url).toBe(payload.url);
    expect(params.title).toContain(" — ");
    expect(params.text).toBe(payload.teaser);
  });
});
