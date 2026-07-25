/**
 * Real PNG team flags for the Kult World Cup League.
 *
 * The `src/assets/League flags/` folder holds one transparent PNG per team,
 * named as the lowercase country with spaces → underscores (e.g. `cape_verde.png`,
 * `south_korea.png`). We glob them all in eagerly so a live team-name string from
 * the fixtures API can be resolved to its flag URL without 48 hand-written imports.
 *
 * Use `flagUrlFor(teamName)` — it returns `undefined` for anything we don't have
 * a flag for, so callers keep their existing CSS-gradient / initials fallback.
 */
const files = import.meta.glob("../assets/League flags/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const FLAG_BY_FILE: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const base = path.split("/").pop()?.replace(/\.png$/i, "");
  if (base) FLAG_BY_FILE[base] = url;
}

/** Team-name variants that don't match a file basename by simple underscore-join. */
const ALIASES: Record<string, string> = {
  "cape verde islands": "cape_verde",
  "united states": "usa",
  "united states of america": "usa",
  us: "usa",
  america: "usa",
  holland: "netherlands",
  "korea republic": "south_korea",
  "republic of korea": "south_korea",
  korea: "south_korea",
  "cote divoire": "ivory_coast",
  "cote d ivoire": "ivory_coast",
  "ivory coast": "ivory_coast",
  curacao: "cura_ao",
  turkiye: "turkey",
  czechia: "czech_republic",
  bosnia: "bosnia_and_herzegovina",
  "democratic republic of congo": "dr_congo",
  "congo dr": "dr_congo",
  // Player-based prediction markets use the player's national flag.
  "harry kane": "england",
  "lamine yamal": "spain",
  "kylian mbappe": "france",
  "kylian mbappé": "france",
  rodri: "spain",
  "lionel messi": "argentina",
  messi: "argentina",
};

/** Lowercase, strip accents/punctuation, collapse whitespace. */
function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.'’`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolve a live team name to its flag PNG URL, or `undefined` if we have none. */
export function flagUrlFor(teamName: string): string | undefined {
  if (!teamName) return undefined;
  const key = normalize(teamName);
  const file = ALIASES[key] ?? key.replace(/\s+/g, "_");
  return FLAG_BY_FILE[file];
}

/** football-data.org IDs for the club fixtures currently supplied by the league API. */
const CLUB_CREST_IDS: Record<string, number> = {
  arsenal: 57,
  "aston villa": 58,
  bournemouth: 1044,
  "afc bournemouth": 1044,
  brentford: 402,
  brighton: 397,
  "brighton & hove albion": 397,
  "brighton and hove albion": 397,
  chelsea: 61,
  coventry: 1076,
  "coventry city": 1076,
  "crystal palace": 354,
  everton: 62,
  fulham: 63,
  "hull city": 322,
  ipswich: 349,
  "ipswich town": 349,
  leeds: 341,
  "leeds united": 341,
  "man city": 65,
  "manchester city": 65,
  "man united": 66,
  "manchester united": 66,
  newcastle: 67,
  "newcastle united": 67,
  "nottingham forest": 351,
  liverpool: 64,
  "real madrid": 86,
  barcelona: 81,
  sunderland: 71,
  tottenham: 73,
  "tottenham hotspur": 73,
};

/**
 * Correct third-party club crest for a team that has no bundled country flag.
 * Unknown names deliberately return undefined so the UI shows initials rather
 * than displaying an incorrect badge.
 */
export function teamCrestUrlFor(teamName: string): string | undefined {
  if (!teamName) return undefined;
  const id = CLUB_CREST_IDS[normalize(teamName)];
  return id ? `https://crests.football-data.org/${id}.png` : undefined;
}
