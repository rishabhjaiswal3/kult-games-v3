/**
 * Listings only carry a free-text `category`, so the card's colour comes from
 * matching that text. Keeping the mapping here means the grid, badges and the
 * purchase dialog can stay visually in sync off a single source.
 */

export type InventoryAccent = {
  /** Solid accent, used for text and icons. */
  color: string;
  /** Same hue at low alpha, used for glows and fills. */
  glow: string;
  /** Short word shown on the card frame. */
  tier: string;
};

const ACCENTS: Array<{ match: RegExp; accent: InventoryAccent }> = [
  { match: /legendary|bundle|mythic/, accent: { color: "#ffb020", glow: "rgba(255,176,32,", tier: "Legendary" } },
  { match: /weapon|gun|rifle|blade|skin/, accent: { color: "#b06bff", glow: "rgba(176,107,255,", tier: "Gear" } },
  { match: /boost|module|upgrade|perk/, accent: { color: "#3bb8ff", glow: "rgba(59,184,255,", tier: "Boost" } },
  { match: /character|hero|agent|squad/, accent: { color: "#00e08a", glow: "rgba(0,224,138,", tier: "Unit" } },
  { match: /currency|coin|gem|token|pack/, accent: { color: "#ff7b52", glow: "rgba(255,123,82,", tier: "Pack" } },
];

const DEFAULT_ACCENT: InventoryAccent = { color: "#9a35ff", glow: "rgba(154,53,255,", tier: "Asset" };

export function getInventoryAccent(category: string | null | undefined): InventoryAccent {
  const key = (category ?? "").toLowerCase();
  return ACCENTS.find((entry) => entry.match.test(key))?.accent ?? DEFAULT_ACCENT;
}

/** `alpha(accent, 0.3)` -> `rgba(r,g,b,0.3)`. */
export function alpha(accent: InventoryAccent, value: number): string {
  return `${accent.glow}${value})`;
}
