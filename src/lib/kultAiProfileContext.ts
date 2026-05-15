import type { FullPlayerProfile, PlayerGameScoreEntry } from "@/types/api";

export const PROFILE_LOGIN_REQUIRED_MESSAGE =
  "I do not have information about you. For info, please login.";

const PERSONAL_PROFILE_PATTERNS = [
  /\b(tell|show|describe|explain)\s+(me\s+)?about\s+(me|myself)\b/i,
  /\b(who\s+am\s+i|what\s+do\s+you\s+know\s+about\s+me)\b/i,
  /\b(my|mine)\s+(profile|account|stats|details|score|rank|level|wallet)\b/i,
  /\b(profile|account|stats|rank|level|wallet)\s+(details|info|information)\s+(about|for)\s+me\b/i,
];

export const isPersonalProfileQuestion = (query: string) =>
  PERSONAL_PROFILE_PATTERNS.some((pattern) => pattern.test(query.trim()));

const formatNumber = (value: number) =>
  Number.isFinite(value) ? new Intl.NumberFormat("en-US").format(value) : "0";

const formatRank = (rank: number | null) => (rank == null || !Number.isFinite(rank) ? "Not ranked yet" : `#${formatNumber(rank)}`);

const formatGameScore = (entry: PlayerGameScoreEntry) => {
  const game = entry.identification || "Unknown game";
  const rank = entry.rank == null || !Number.isFinite(entry.rank) ? "unranked" : `rank #${formatNumber(entry.rank)}`;
  return `- ${game}: score ${formatNumber(entry.score)}, ${rank}`;
};

export const formatProfileForChat = (profile: FullPlayerProfile) => {
  const walletAddress = profile.player.wallet_address || "";
  const displayName = profile.player.name?.trim() || "Unnamed player";

  if (!walletAddress) {
    return PROFILE_LOGIN_REQUIRED_MESSAGE;
  }

  const gameScores = profile.gameScoresList.filter((entry) => entry.identification).slice(0, 5);
  const gameScoreSection = gameScores.length
    ? `\n\nTop game scores:\n${gameScores.map(formatGameScore).join("\n")}`
    : "\n\nTop game scores: No game scores found yet.";

  return [
    "**Your KULT Profile**",
    "",
    `Name: ${displayName}`,
    `Wallet: ${walletAddress}`,
    `Rank: ${formatRank(profile.rank)}`,
    `Level: ${formatNumber(profile.level)}`,
    `Total score: ${formatNumber(profile.totalScore)}`,
    `Games played: ${formatNumber(profile.totalGamesPlayed)}`,
    `Completed quests: ${formatNumber(profile.completedQuests)}`,
    gameScoreSection,
  ].join("\n");
};
