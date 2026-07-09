import iconEarn from "@/assets/icon-earn.png";
import iconTrain from "@/assets/icon-train.png";
import rewardCar from "@/assets/reward-car.png";
import rewardWeapon from "@/assets/reward-weapon.png";
import hybridAgent from "@/assets/hybrid.mp4";

export type RewardRarity = "RARE" | "EPIC" | "LEGENDARY";

export type DailyRewardDef = {
  day: number;
  emoji: string;
  /** Real artwork for the medallion (image or looping .mp4); takes precedence over the emoji. */
  img?: string;
  /** How the artwork fills its tile; "contain" for wide art that must not be cropped. */
  imgFit?: "cover" | "contain";
  title: string;
  /** Small chip under the title, e.g. "Loyalty Reward". */
  tag: string;
  /** Unlock-flavored copy — "you've unlocked X", never "go do X". */
  blurb: string;
  rarity: RewardRarity;
  accentHex: string;
};

export const RARITY_STYLES: Record<RewardRarity, { label: string; hex: string }> = {
  RARE: { label: "Rare", hex: "#22d3ee" },
  EPIC: { label: "Epic", hex: "#a855f7" },
  LEGENDARY: { label: "Legendary", hex: "#fbbf24" },
};

export const DAILY_REWARDS: DailyRewardDef[] = [
  {
    day: 1,
    emoji: "🎉",
    title: "Genesis Agent Mint + 100 Arena Tokens",
    tag: "Genesis Drop",
    blurb: "You've unlocked a Free Agent Mint — your first AI competitor, plus 100 Arena Tokens to back it.",
    rarity: "LEGENDARY",
    accentHex: "#fbbf24",
  },
  {
    day: 2,
    emoji: "🧠",
    title: "Free Training Jobs",
    tag: "Trainer Pack",
    blurb: "You've unlocked free training runs — level up your agent's game sense at zero cost.",
    rarity: "RARE",
    accentHex: "#22d3ee",
  },
  {
    day: 3,
    emoji: "⭐",
    title: "1,200 Kult Points",
    tag: "Loyalty Reward",
    blurb: "You've unlocked 1,200 Kult Points — climb the leaderboard just for showing up.",
    rarity: "RARE",
    accentHex: "#c084fc",
  },
  {
    day: 4,
    emoji: "🔫",
    img: rewardWeapon,
    imgFit: "contain",
    title: "Exclusive FAMAS Weapon Skin",
    tag: "Armory Exclusive",
    blurb: "You've unlocked the exclusive FAMAS skin — gear that never hits the marketplace.",
    rarity: "EPIC",
    accentHex: "#f472b6",
  },
  {
    day: 5,
    emoji: "🧠",
    img: iconTrain,
    title: "Free Training Jobs",
    tag: "Trainer Pack",
    blurb: "You've unlocked another round of free training runs — keep your agent sharpening.",
    rarity: "RARE",
    accentHex: "#22d3ee",
  },
  {
    day: 6,
    emoji: "🚗",
    img: rewardCar,
    title: "Highway Hustle Muscle Car",
    tag: "Garage Drop",
    blurb: "You've unlocked a muscle car for Highway Hustle — raw horsepower, added to your garage.",
    rarity: "EPIC",
    accentHex: "#fb7185",
  },
  {
    day: 7,
    emoji: "🪙",
    title: "500 Arena Tokens",
    tag: "League Bonus",
    blurb: "You've unlocked 500 Arena Tokens — a full week of showing up, banked to your balance.",
    rarity: "EPIC",
    accentHex: "#facc15",
  },
  {
    day: 8,
    emoji: "⭐",
    img: iconEarn,
    title: "3,000 Kult Points",
    tag: "Loyalty Reward",
    blurb: "You've unlocked 3,000 Kult Points — loyalty pays, and the leaderboard knows it.",
    rarity: "RARE",
    accentHex: "#c084fc",
  },
  {
    day: 9,
    emoji: "🤖",
    title: "Free Autonomous Usage",
    tag: "Autopilot Pass",
    blurb: "You've unlocked free autonomous usage — your agent competes for you while you're away.",
    rarity: "EPIC",
    accentHex: "#34d399",
  },
  {
    day: 10,
    emoji: "🎉",
    img: hybridAgent,
    title: "Free Agent Mint",
    tag: "Finale Drop",
    blurb: "You've unlocked a second Free Agent Mint — complete the run, double your roster.",
    rarity: "LEGENDARY",
    accentHex: "#fbbf24",
  },
];

export const TOTAL_REWARD_DAYS = DAILY_REWARDS.length;

export function getRewardDef(day: number): DailyRewardDef {
  return DAILY_REWARDS[Math.min(Math.max(day, 1), TOTAL_REWARD_DAYS) - 1];
}
