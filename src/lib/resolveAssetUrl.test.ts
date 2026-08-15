import { describe, expect, it } from "vitest";
import { resolveAssetUrl } from "./resolveAssetUrl";

describe("resolveAssetUrl", () => {
  it("resolves a marketplace path against the asset CDN", () => {
    expect(resolveAssetUrl("marketplace/warzone-warriors/gun-fireball.png")).toBe(
      "https://kult-store-assets.sfo3.cdn.digitaloceanspaces.com/marketplace/warzone-warriors/gun-fireball.png",
    );
  });

  it("preserves an absolute asset URL", () => {
    expect(resolveAssetUrl("https://images.example/item.png")).toBe(
      "https://images.example/item.png",
    );
  });
});
