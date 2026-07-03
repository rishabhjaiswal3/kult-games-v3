import type { CountryCode } from "@/components/league/FlagHex";

/**
 * `FlagCircle`/`FlagHex` only render a hardcoded 11-country CSS-gradient set
 * (see components/league/FlagHex.tsx) — it has no concept of a live team name
 * string from a real fixtures API. This resolves the full/short names a real
 * provider returns (ApiFootballProvider's `teams.home.name`) to that fixed
 * enum where possible; every other team (of which there'll be many more once
 * real World Cup 2026 data — 32+ teams — is flowing) falls back to a plain
 * text badge instead of crashing on an unsupported `CountryCode`.
 */
const NAME_TO_CODE: Record<string, CountryCode> = {
  brazil: "BRA",
  argentina: "ARG",
  france: "FRA",
  germany: "GER",
  portugal: "POR",
  spain: "ESP",
  italy: "ITA",
  netherlands: "NLD",
  holland: "NLD",
  england: "ENG",
  austria: "AUT",
  iraq: "IRQ",
  // 3-letter codes pass through as-is if already in that shape (e.g. seed-fixture data).
  bra: "BRA",
  arg: "ARG",
  fra: "FRA",
  ger: "GER",
  por: "POR",
  esp: "ESP",
  ita: "ITA",
  nld: "NLD",
  eng: "ENG",
  aut: "AUT",
  irq: "IRQ",
};

export function resolveCountryCode(teamName: string): CountryCode | null {
  return NAME_TO_CODE[teamName.trim().toLowerCase()] ?? null;
}

/** Short label for the fallback badge when a team isn't in the hardcoded flag set. */
export function teamInitials(teamName: string): string {
  const trimmed = teamName.trim();
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return trimmed.slice(0, 3).toUpperCase();
}
