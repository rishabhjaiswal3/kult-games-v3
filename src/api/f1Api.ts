import { getApiClient } from "@/lib/apiClientFactory";

/**
 * Client for `/v1/f1/*` on the AI Arena gateway (services/league-service in
 * the 0g-AIArena repo — see docs/league/F1_LEAGUE_CONTEXT.md there for the
 * underlying data source and endpoint reference this was built against).
 */
const http = () => getApiClient("aiArenaGateway");

export type F1RaceStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";

export interface F1RaceSession {
  id: string;
  grandPrixId: number;
  grandPrixName: string;
  circuitName: string | null;
  circuitImage: string | null;
  season: number;
  sessionType: string;
  status: F1RaceStatus;
  startsAt: string;
  laps: number | null;
  distance: string | null;
}

export interface F1GrandPrixWeekend {
  race: F1RaceSession;
  sessions: F1RaceSession[];
}

export interface F1Team {
  id: string;
  name: string;
  logo: string | null;
  base: string | null;
  worldChampionships: number | null;
  chassis: string | null;
  engine: string | null;
  tyres: string | null;
}

export interface F1TeamHistoryEntry {
  season: number;
  team: { id: number; name: string; logo?: string };
}

export interface F1DriverStanding {
  position: number;
  points: number;
  wins: number;
  season: number;
}

export interface F1Driver {
  id: string;
  name: string;
  abbr: string | null;
  image: string | null;
  nationality: string | null;
  countryCode: string | null;
  birthdate: string | null;
  number: number | null;
  podiums: number | null;
  careerPoints: string | null;
  currentTeamId: string | null;
  currentTeam: F1Team | null;
  teamHistory: F1TeamHistoryEntry[] | null;
  /** Only present from GET /v1/f1/drivers (the grid) -- current-season live standing. */
  standing?: F1DriverStanding | null;
}

export type F1PredictionMarket = "WINNER" | "PODIUM" | "FASTEST_LAP";

export const F1_PREDICTION_MARKETS: { key: F1PredictionMarket; label: string; question: string }[] = [
  { key: "WINNER", label: "Race Winner", question: "Who wins the race?" },
  { key: "PODIUM", label: "Podium", question: "Who finishes on the podium (top 3)?" },
  { key: "FASTEST_LAP", label: "Fastest Lap", question: "Who sets the fastest lap?" },
];

export type F1Confidence = "LOW" | "MEDIUM" | "HIGH";

export interface F1Prediction {
  id: string;
  raceId: string;
  agentId: string;
  market: F1PredictionMarket;
  predictedDriverId: string;
  reasoning: string | null;
  /** The AI's own stated conviction -- null for picks made before this field existed. */
  confidence: F1Confidence | null;
  /** null until the race is settled (POST /v1/f1/races/:raceId/settle) -- then true/false. */
  isCorrect: boolean | null;
  settledAt: string | null;
  predictedDriver?: F1Driver;
}

export interface F1AgentAccuracyEntry {
  raceId: string;
  grandPrixName: string;
  market: F1PredictionMarket;
  predictedDriverName: string;
  confidence: F1Confidence | null;
  isCorrect: boolean | null;
  settledAt: string | null;
}

export interface F1MarketAccuracy {
  total: number;
  correct: number;
  winRate: number | null;
}

export interface F1AgentAccuracy {
  overall: F1MarketAccuracy;
  byMarket: Record<F1PredictionMarket, F1MarketAccuracy>;
  history: F1AgentAccuracyEntry[];
}

export interface F1DriverFormRace {
  season: number;
  round: number;
  raceName: string;
  finishPosition: number | null;
  points: number;
  status: string;
}

export interface F1DriverForm {
  racesConsidered: number;
  recentFormScore: number | null;
  last5PointsTotal: number;
  last5DnfRate: number;
  races: F1DriverFormRace[];
}

export interface F1RaceResultDriver {
  id: string;
  name: string;
  abbr: string | null;
  image: string | null;
  position: number | null;
}

export interface F1RaceResult {
  winner: F1RaceResultDriver | null;
  podium: F1RaceResultDriver[];
  fastestLapDriver: F1RaceResultDriver | null;
  /** The specific picked driver's own real finish -- only present when a pickedDriverId was requested. */
  pickedDriverResult: F1RaceResultDriver | null;
}

export interface F1FantasyTeam {
  id: string;
  agentId: string;
  season: number;
  name: string;
  driverId: string;
  constructorId: string;
  reasoning: string | null;
  totalPoints: number;
  driver: F1Driver;
  constructor: F1Team;
}

export const f1Api = {
  getBelgianGrandPrix: async (): Promise<F1GrandPrixWeekend | null> => {
    try {
      const { data } = await http().get<F1GrandPrixWeekend>("/v1/f1/grand-prix/belgium");
      return data;
    } catch {
      return null;
    }
  },

  getDrivers: async (): Promise<F1Driver[]> => {
    const { data } = await http().get<{ drivers: F1Driver[] }>("/v1/f1/drivers");
    return data.drivers ?? [];
  },

  getDriver: async (id: string): Promise<F1Driver> => {
    const { data } = await http().get<{ driver: F1Driver }>(`/v1/f1/drivers/${id}`);
    return data.driver;
  },

  getAiPrediction: async (driverId: string): Promise<string> => {
    const { data } = await http().post<{ prediction: string }>(`/v1/f1/drivers/${driverId}/predict`);
    return data.prediction;
  },

  makePick: async (raceId: string, agentId: string, driverId: string, market: F1PredictionMarket = "WINNER", reasoning?: string): Promise<F1Prediction> => {
    const { data } = await http().post<{ pick: F1Prediction }>(`/v1/f1/races/${raceId}/pick`, {
      agentId,
      driverId,
      market,
      reasoning,
    });
    return data.pick;
  },

  /** All of an agent's picks for a race -- one per market (Winner/Podium/Fastest Lap). */
  getPicks: async (raceId: string, agentId: string): Promise<F1Prediction[]> => {
    const { data } = await http().get<{ picks: F1Prediction[] }>(`/v1/f1/races/${raceId}/pick/${agentId}`);
    return data.picks ?? [];
  },

  /** Real winner/podium/fastest-lap once a race is classified -- null until settled. Pass pickedDriverId to also get that driver's own real finish. */
  getRaceResult: async (raceId: string, pickedDriverId?: string): Promise<F1RaceResult | null> => {
    const { data } = await http().get<{ result: F1RaceResult | null }>(`/v1/f1/races/${raceId}/result`, {
      params: pickedDriverId ? { pickedDriverId } : undefined,
    });
    return data.result ?? null;
  },

  /** Real prediction win-rate history for one agent -- overall + per market, built only from settled picks. */
  getAgentAccuracy: async (agentId: string): Promise<F1AgentAccuracy> => {
    const { data } = await http().get<{ accuracy: F1AgentAccuracy }>(`/v1/f1/agents/${agentId}/accuracy`);
    return data.accuracy;
  },

  /** Recency-weighted recent-form for one driver, computed from real historical race results. */
  getDriverForm: async (driverId: string): Promise<F1DriverForm | null> => {
    try {
      const { data } = await http().get<{ form: F1DriverForm }>(`/v1/f1/drivers/${driverId}/form`);
      return data.form;
    } catch {
      return null;
    }
  },

  /** "Let AI Predict" -- the AI names the driver itself and the pick is saved immediately. */
  predictPick: async (raceId: string, agentId: string, market: F1PredictionMarket = "WINNER"): Promise<{ pick: F1Prediction; source: "AI" | "FALLBACK" }> => {
    const { data } = await http().post<{ pick: F1Prediction; source: "AI" | "FALLBACK" }>(`/v1/f1/races/${raceId}/predict-pick`, {
      agentId,
      market,
    });
    return data;
  },

  /** "AI drafts my fantasy team" -- one driver + their real constructor. Re-drafting overwrites the previous pick. */
  draftFantasyTeam: async (agentId: string, season?: number): Promise<F1FantasyTeam> => {
    const { data } = await http().post<{ team: F1FantasyTeam }>("/v1/f1/fantasy/draft", { agentId, season });
    return data.team;
  },

  getFantasyTeam: async (agentId: string, season?: number): Promise<F1FantasyTeam | null> => {
    const { data } = await http().get<{ team: F1FantasyTeam | null }>(`/v1/f1/fantasy/team/${agentId}`, {
      params: season ? { season } : undefined,
    });
    return data.team ?? null;
  },

  getFantasyLeaderboard: async (season?: number): Promise<F1FantasyTeam[]> => {
    const { data } = await http().get<{ teams: F1FantasyTeam[] }>("/v1/f1/fantasy/leaderboard", {
      params: season ? { season } : undefined,
    });
    return data.teams ?? [];
  },
};
