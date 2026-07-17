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

export interface F1Prediction {
  id: string;
  raceId: string;
  agentId: string;
  market: F1PredictionMarket;
  predictedDriverId: string;
  reasoning: string | null;
  predictedDriver?: F1Driver;
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
};
