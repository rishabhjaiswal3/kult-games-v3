import { describe, expect, it } from "vitest";
import { deriveWarzoneAgentId, normalizeWalletAddress } from "./warzoneAgentId";

describe("deriveWarzoneAgentId", () => {
  it("is deterministic for same address and signature", () => {
    const addr = "0xAbC1234567890abcdef1234567890abcdef123456";
    const sig =
      "0x" +
      "01".repeat(32) +
      "02".repeat(32) +
      "1b";
    const a = deriveWarzoneAgentId(addr, sig);
    const b = deriveWarzoneAgentId(addr, sig);
    expect(a).toBe(b);
    expect(a.startsWith(normalizeWalletAddress(addr))).toBe(true);
    expect(a.split("_")[1]?.length).toBe(64);
  });

  it("accepts signature without 0x prefix", () => {
    const addr = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    const sig =
      "01".repeat(32) +
      "02".repeat(32) +
      "1c";
    const with0x = deriveWarzoneAgentId(addr, `0x${sig}`);
    const without = deriveWarzoneAgentId(addr, sig);
    expect(with0x).toBe(without);
  });
});
