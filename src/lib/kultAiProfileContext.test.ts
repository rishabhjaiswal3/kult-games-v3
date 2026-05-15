import { describe, expect, it } from "vitest";

import {
  formatProfileForChat,
  isPersonalProfileQuestion,
  PROFILE_LOGIN_REQUIRED_MESSAGE,
} from "@/lib/kultAiProfileContext";
import type { FullPlayerProfile } from "@/types/api";

const profile: FullPlayerProfile = {
  player: {
    _id: "player-1",
    wallet_address: "0x1234567890abcdef",
    name: "Kult Pilot",
  },
  cached: false,
  rank: 12,
  totalScore: 98765,
  level: 7,
  totalGamesPlayed: 4,
  completedQuests: 3,
  gameScoresList: [
    {
      identification: "zerodash",
      score: 4500,
      weight: 1,
      weightedScore: 4500,
      rank: 8,
    },
  ],
};

describe("kultAiProfileContext", () => {
  it("detects profile/self questions", () => {
    expect(isPersonalProfileQuestion("tell me about me")).toBe(true);
    expect(isPersonalProfileQuestion("tell me about myself")).toBe(true);
    expect(isPersonalProfileQuestion("who am I?")).toBe(true);
    expect(isPersonalProfileQuestion("show my profile details")).toBe(true);
    expect(isPersonalProfileQuestion("what is my rank")).toBe(true);
  });

  it("does not treat normal game recommendation questions as profile questions", () => {
    expect(isPersonalProfileQuestion("find my first game")).toBe(false);
    expect(isPersonalProfileQuestion("recommend games for me")).toBe(false);
    expect(isPersonalProfileQuestion("tell me about ZeroDash")).toBe(false);
  });

  it("formats connected wallet profile details for chat", () => {
    const answer = formatProfileForChat(profile);

    expect(answer).toContain("**Your KULT Profile**");
    expect(answer).toContain("Name: Kult Pilot");
    expect(answer).toContain("Wallet: 0x1234567890abcdef");
    expect(answer).toContain("Rank: #12");
    expect(answer).toContain("Level: 7");
    expect(answer).toContain("Total score: 98,765");
    expect(answer).toContain("- zerodash: score 4,500, rank #8");
  });

  it("returns the login message when profile has no wallet", () => {
    expect(
      formatProfileForChat({
        ...profile,
        player: { ...profile.player, wallet_address: "" },
      }),
    ).toBe(PROFILE_LOGIN_REQUIRED_MESSAGE);
  });
});
