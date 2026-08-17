import zeroGLogo from "@/assets/0G Logo.png";
import warzoneLogo from "@/assets/games/warzone/logo.png";
import teslaMiniWeapon from "@/assets/games/warzone/airdrop-tesla-mini-weapon.webp";

/**
 * Per-game reward drops shown on the games catalogue and the game detail page.
 *
 * There is no airdrop endpoint yet, so the campaign copy and window live here.
 * `claimTo` behaviour is handled by the caller: claiming happens inside the
 * game, so the CTA sends a signed-in player to the play route.
 */
export type GameAirdrop = {
  /** `getGameKey()` values this drop belongs to. */
  gameKeys: string[];
  /**
   * Drives the whole banner: `coming-soon` shows a dead-metal status bar,
   * `live` shows the gold claim bar. Flip this when the drop opens — the banner
   * never renders both.
   */
  status: "coming-soon" | "live";
  itemKind: string;
  itemName: string;
  rarity: string;
  rarityColor: string;
  headline: string;
  description: string;
  /**
   * Item art. Cropped straight out of the in-game reward popup, so it keeps
   * that dark backdrop and fills the banner's item slot edge to edge.
   */
  itemImage: string;
  /** Game wordmark for the banner header. */
  gameLogo: string;
  /** Chain mark shown beside the game wordmark. */
  chainLogo: string;
  /** Campaign end, ISO 8601. A past date hides the drop. */
  endsAt: string;
  ctaLabel: string;
};

const AIRDROPS: GameAirdrop[] = [
  {
    gameKeys: ["warzonewarriors"],
    status: "coming-soon",
    itemKind: "Free weapon",
    itemName: "Tesla Mini",
    rarity: "Rare",
    rarityColor: "#b06bff",
    headline: "Warzone Warriors season airdrop",
    description:
      "Drop into any mission this season and the Tesla Mini unlocks straight into your loadout — no gems, no grind.",
    itemImage: teslaMiniWeapon,
    gameLogo: warzoneLogo,
    chainLogo: zeroGLogo,
    endsAt: "2026-09-30T23:59:59Z",
    ctaLabel: "Claim reward",
  },
];

export function getGameAirdrop(gameKey: string | null | undefined): GameAirdrop | null {
  if (!gameKey) return null;
  const drop = AIRDROPS.find((entry) => entry.gameKeys.includes(gameKey));
  if (!drop) return null;
  return isAirdropLive(drop) ? drop : null;
}

export function isAirdropLive(drop: GameAirdrop, now: number = Date.now()): boolean {
  const ends = new Date(drop.endsAt).getTime();
  return Number.isFinite(ends) && ends > now;
}
