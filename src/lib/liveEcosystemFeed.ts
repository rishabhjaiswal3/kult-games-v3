import type { AiArenaGlobalLeaderboardResponse } from "@/types/aiArenaGateway";

export type LiveEcosystemTone = "live" | "event" | "battle" | "banter" | "season";

export interface LiveEcosystemItem {
  id: string;
  text: string;
  tone: LiveEcosystemTone;
}

const FALLBACK_AGENT_COUNT = 2348;

function hoursUntilWeekEnd(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const end = new Date(now);
  end.setDate(now.getDate() + daysUntilSunday);
  end.setHours(23, 59, 0, 0);
  return Math.max(1, Math.ceil((end.getTime() - now.getTime()) / 3_600_000));
}

function topBanterLine(entries: AiArenaGlobalLeaderboardResponse["entries"]): string | null {
  const sorted = [...entries].sort((a, b) => b.wins - a.wins);
  const top = sorted[0];
  if (!top || top.wins < 3) return null;
  return `Top AI banter this week — ${top.name} (${top.wins} wins)`;
}

function recentDefeatLine(entries: AiArenaGlobalLeaderboardResponse["entries"]): string | null {
  if (entries.length < 2) return null;
  const winner = entries[0];
  const loser = entries[1];
  if (!winner?.name || !loser?.name) return null;
  return `${winner.name} defeated ${loser.name}`;
}

/** Consumer-facing live ticker lines — API-enriched when leaderboard is available. */
export function buildLiveEcosystemItems(
  leaderboard?: AiArenaGlobalLeaderboardResponse | null
): LiveEcosystemItem[] {
  const entries = leaderboard?.entries ?? [];
  const agentCount = entries.length > 0 ? entries.length : FALLBACK_AGENT_COUNT;
  const seasonHours = hoursUntilWeekEnd();

  const items: LiveEcosystemItem[] = [
    {
      id: "agents-online",
      text: `${agentCount.toLocaleString()} agents online`,
      tone: "live",
    },
    {
      id: "warzone-live",
      text: "Warzone tournament LIVE",
      tone: "event",
    },
    {
      id: "highway-season",
      text: `Highway Hustle season ending in ${seasonHours}h`,
      tone: "season",
    },
  ];

  const banter = topBanterLine(entries);
  if (banter) {
    items.push({ id: "top-banter", text: banter, tone: "banter" });
  } else {
    items.push({ id: "top-banter-fallback", text: "Top AI banter this week — ShadowByte", tone: "banter" });
  }

  const defeat = recentDefeatLine(entries);
  if (defeat) {
    items.push({ id: "recent-defeat", text: defeat, tone: "battle" });
  } else {
    items.push({
      id: "recent-defeat-fallback",
      text: "NeuralReaper defeated VoidWalker",
      tone: "battle",
    });
  }

  items.push(
    { id: "zero-dash", text: "Zero Dash daily sprint — 847 runs today", tone: "event" },
    { id: "robo-wars", text: "Robo Wars queue popping — jump in now", tone: "live" }
  );

  return items;
}
