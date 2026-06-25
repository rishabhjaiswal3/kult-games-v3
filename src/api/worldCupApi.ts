// Key-less World Cup 2026 data (group standings + fixtures), called directly
// from the browser. Defensive parsing with a guaranteed [] fallback so the UI
// degrades to its static set if the public API is unavailable or changes shape.

const WC_BASE = "https://worldcup26.ir/get";

export type GroupStanding = {
  position: number;
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export type WorldCupGroup = { name: string; standings: GroupStanding[] };

export type UpcomingMatch = {
  id: string;
  dateLabel?: string;
  timeLabel?: string;
  sortTs: number;
  group?: string;
  stage?: string;
  home: string;
  away: string;
  venue?: string;
  finished: boolean;
  live: boolean;
  homeScore?: number;
  awayScore?: number;
};

type Raw = Record<string, unknown>;

function asArray(json: unknown, ...keys: string[]): Raw[] {
  if (Array.isArray(json)) return json as Raw[];
  const obj = json as Raw | null;
  if (obj) {
    for (const key of [...keys, "data", "result", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as Raw[];
    }
  }
  return [];
}

function pickStr(o: Raw, keys: string[]): string | undefined {
  for (const key of keys) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (v && typeof v === "object") {
      const nested = pickStr(v as Raw, ["name", "title", "shortName", "country", "code"]);
      if (nested) return nested;
    }
  }
  return undefined;
}

function pickNum(o: Raw, keys: string[]): number | undefined {
  for (const key of keys) {
    const v = o[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  }
  return undefined;
}

/** Try several endpoint paths and return the JSON of the first that responds 200. */
async function fetchFirstOk(paths: string[]): Promise<unknown | null> {
  for (const path of paths) {
    try {
      const res = await fetch(`${WC_BASE}${path}`, { headers: { Accept: "application/json" } });
      if (res.ok) return await res.json();
    } catch {
      // try next path
    }
  }
  return null;
}

// ── Teams lookup (team_id → name) ───────────────────────────────────────────
async function fetchTeams(): Promise<Record<string, string>> {
  const json = await fetchFirstOk(["/teams", "/team"]);
  if (!json) return {};
  const rows = asArray(json, "teams");
  const map: Record<string, string> = {};
  for (const t of rows) {
    const id = pickStr(t, ["team_id", "teamId", "id"]);
    const name = pickStr(t, ["name", "title", "team", "country", "name_en", "en"]);
    if (id && name) map[id] = name;
  }
  return map;
}

// ── Group standings ─────────────────────────────────────────────────────────
export async function fetchWorldCupGroups(): Promise<WorldCupGroup[]> {
  try {
    const [json, teamMap] = await Promise.all([
      fetchFirstOk(["/groups", "/group", "/standings", "/group-stage"]),
      fetchTeams(),
    ]);
    if (!json) return [];
    const groups = asArray(json, "groups", "standings");

    return groups
      .map((g) => {
        const rawName = pickStr(g, ["name", "title", "group", "groupName", "label"]) ?? "";
        const rows = asArray(g, "teams", "standings", "table", "ranking", "rows");
        const standings: GroupStanding[] = rows
          .map((r) => {
            const teamId = pickStr(r, ["team_id", "teamId", "id"]) ?? "";
            const team = teamMap[teamId] ?? pickStr(r, ["team", "name", "title", "country"]) ?? "";
            const win = pickNum(r, ["win", "won", "w", "wins"]) ?? 0;
            const draw = pickNum(r, ["draw", "drawn", "d", "draws"]) ?? 0;
            const loss = pickNum(r, ["loss", "lost", "l", "losses"]) ?? 0;
            const played = pickNum(r, ["played", "matches", "mp", "p", "gp"]) ?? win + draw + loss;
            const gf = pickNum(r, ["gf", "goalsFor", "scored", "for"]) ?? 0;
            const ga = pickNum(r, ["ga", "goalsAgainst", "conceded", "against"]) ?? 0;
            const gd = pickNum(r, ["gd", "goalDifference", "diff"]) ?? gf - ga;
            const points = pickNum(r, ["points", "pts", "point"]) ?? win * 3 + draw;
            return { position: 0, team, played, win, draw, loss, gf, ga, gd, points };
          })
          .filter((s) => s.team)
          .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
          .map((s, i) => ({ ...s, position: i + 1 }));
        const name = /^group/i.test(rawName) ? rawName : `Group ${rawName}`;
        return { name, standings };
      })
      .filter((g) => g.standings.length > 0);
  } catch {
    return [];
  }
}

// ── Fixtures / upcoming matches ─────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  group: "Group", r32: "Round of 32", r16: "Round of 16", qf: "Quarter-final",
  sf: "Semi-final", final: "Final", third: "3rd-place",
};

/** Parse "MM/DD/YYYY HH:mm" (the API's local_date) into a sortable date. */
function parseLocalDate(value?: string): { ts: number; dateLabel?: string; timeLabel?: string } {
  if (!value) return { ts: Number.MAX_SAFE_INTEGER };
  const [datePart, timePart] = value.trim().split(/\s+/);
  const [mm, dd, yyyy] = (datePart ?? "").split("/").map(Number);
  const [hh, mi] = (timePart ?? "00:00").split(":").map(Number);
  if (!yyyy || !mm || !dd) return { ts: Number.MAX_SAFE_INTEGER, dateLabel: value };
  const date = new Date(yyyy, mm - 1, dd, hh || 0, mi || 0);
  const ts = date.getTime();
  if (!Number.isFinite(ts)) return { ts: Number.MAX_SAFE_INTEGER, dateLabel: value };
  return {
    ts,
    dateLabel: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date),
    timeLabel: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date),
  };
}

function mapGame(raw: Raw, i: number, teamMap: Record<string, string>): UpcomingMatch {
  const when = parseLocalDate(pickStr(raw, ["local_date", "datetime", "date", "utcDate", "kickoff"]));
  const type = (pickStr(raw, ["type"]) ?? "group").toLowerCase();
  const groupRaw = pickStr(raw, ["group"]) ?? "";
  const groupLabel = /^[A-L]$/i.test(groupRaw) ? `Group ${groupRaw.toUpperCase()}` : STAGE_LABELS[type] ?? groupRaw;
  const elapsed = (pickStr(raw, ["time_elapsed"]) ?? "").toLowerCase();
  const finished = (pickStr(raw, ["finished"]) ?? "").toUpperCase() === "TRUE" || elapsed === "finished";
  const live = !finished && elapsed !== "" && elapsed !== "notstarted";
  // Prefer the explicit English name, then a team_id lookup, then a knockout label.
  const resolve = (id?: string, name?: string, label?: string) =>
    name || (id && id !== "0" && teamMap[id]) || label || "";
  return {
    id: pickStr(raw, ["id", "_id"]) ?? `${i}`,
    dateLabel: when.dateLabel,
    timeLabel: when.timeLabel,
    sortTs: when.ts,
    group: groupLabel,
    stage: STAGE_LABELS[type] ?? "Group",
    home: resolve(pickStr(raw, ["home_team_id"]), pickStr(raw, ["home_team_name_en"]), pickStr(raw, ["home_team_label"])),
    away: resolve(pickStr(raw, ["away_team_id"]), pickStr(raw, ["away_team_name_en"]), pickStr(raw, ["away_team_label"])),
    venue: undefined,
    finished,
    live,
    homeScore: pickNum(raw, ["home_score"]),
    awayScore: pickNum(raw, ["away_score"]),
  };
}

/** Every match (past + live + future), sorted chronologically. [] on failure. */
export async function fetchAllMatches(): Promise<UpcomingMatch[]> {
  try {
    const [json, teamMap] = await Promise.all([
      fetchFirstOk(["/games", "/matches", "/match", "/fixtures", "/schedule"]),
      fetchTeams(),
    ]);
    if (!json) return [];
    const rows = asArray(json, "games", "matches", "fixtures", "schedule");
    return rows
      .map((raw, i) => mapGame(raw, i, teamMap))
      .filter((m) => m.home && m.away)
      .sort((a, b) => a.sortTs - b.sortTs);
  } catch {
    return [];
  }
}

export async function fetchUpcomingMatches(limit = 12): Promise<UpcomingMatch[]> {
  const all = await fetchAllMatches();
  const now = Date.now();
  return all.filter((m) => !m.finished && m.sortTs >= now - 3 * 60 * 60 * 1000).slice(0, limit);
}
