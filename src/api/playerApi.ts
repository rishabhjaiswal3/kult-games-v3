import apiClient from "@/lib/apiClient";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import type {
  FullPlayerProfile,
  LoginRequest,
  LoginResponse,
  Player,
  PlayerGameScoreEntry,
  PlayerProfileStats,
  PrivyTonLoginRequest,
  UpdateNameRequest,
} from "@/types/api";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Parses GET /player/profile — supports Rust `{ cached, profile }` and legacy flat `Player`. */
function parseProfilePayload(raw: unknown): FullPlayerProfile {
  if (!isRecord(raw)) {
    return {
      player: { _id: "", wallet_address: "", name: "" },
      cached: false,
      rank: null,
      totalScore: 0,
      level: 1,
      totalGamesPlayed: 0,
      completedQuests: 0,
      gameScoresList: [],
    };
  }

  const nested = raw.profile;
  if (isRecord(nested) && typeof nested.walletAddress === "string") {
    const list = Array.isArray(nested.gameScoresList) ? nested.gameScoresList : [];
    const gameScoresList: PlayerGameScoreEntry[] = list
      .filter(isRecord)
      .map((row) => ({
        identification: String(row.identification ?? ""),
        score: Number(row.score ?? 0),
        weight: Number(row.weight ?? 0),
        weightedScore: Number(row.weightedScore ?? row.weighted_score ?? 0),
        rank: row.rank == null ? null : Number(row.rank),
      }));

    const stats: PlayerProfileStats = {
      walletAddress: nested.walletAddress,
      username: String(nested.username ?? ""),
      rank: nested.rank == null ? null : Number(nested.rank),
      totalScore: Number(nested.totalScore ?? nested.total_score ?? 0),
      level: Number(nested.level ?? 1),
      totalGamesPlayed: Number(nested.totalGamesPlayed ?? nested.total_games_played ?? 0),
      completedQuests: Number(nested.completedQuests ?? nested.completed_quests ?? 0),
      gameScoresList,
    };

    return {
      player: {
        _id: "",
        wallet_address: stats.walletAddress,
        name: stats.username,
      },
      cached: Boolean(raw.cached),
      rank: stats.rank,
      totalScore: stats.totalScore,
      level: stats.level,
      totalGamesPlayed: stats.totalGamesPlayed,
      completedQuests: stats.completedQuests,
      gameScoresList: stats.gameScoresList,
    };
  }

  const wallet =
    (raw.wallet_address as string) ?? (raw.walletAddress as string) ?? "";
  const name = (raw.name as string) ?? (raw.username as string) ?? "";
  const id = (raw._id as string) ?? (raw.id as string) ?? "";

  return {
    player: {
      _id: id,
      wallet_address: wallet,
      name,
      referral_code: (raw.referral_code as string) ?? (raw.referralCode as string),
    },
    cached: false,
    rank: null,
    totalScore: 0,
    level: 1,
    totalGamesPlayed: 0,
    completedQuests: 0,
    gameScoresList: [],
  };
}

export const playerApi = {
  login: async (
    walletAddress: string,
    message: string,
    signature: string,
  ): Promise<LoginResponse> => {
    const body: LoginRequest = { walletAddress, message, signature };
    const { data } = await apiClient.post<any>("/player/login", body);
    const token: string = data.token ?? data.data?.token ?? "";
    const rawPlayer = data.player ?? data.data?.player ?? null;
    const player: Player | null = rawPlayer
      ? {
          _id: rawPlayer._id ?? rawPlayer.id ?? "",
          wallet_address: rawPlayer.wallet_address ?? rawPlayer.walletAddress ?? "",
          name: rawPlayer.name ?? "",
          referral_code: rawPlayer.referral_code ?? rawPlayer.referralCode,
        }
      : null;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(WALLET_KEY, walletAddress);
    }
    return {
      token,
      player: player ?? { _id: "", wallet_address: walletAddress, name: "" },
    };
  },

  loginWithPrivyTon: async (
    walletAddress: string,
    identityToken: string,
    options?: Omit<PrivyTonLoginRequest, "walletAddress" | "identityToken">,
  ): Promise<LoginResponse> => {
    const body: PrivyTonLoginRequest = { walletAddress, identityToken, ...options };
    const { data } = await apiClient.post<any>("/player/privy-login", body);
    const token: string = data.token ?? data.data?.token ?? "";
    const rawPlayer = data.player ?? data.data?.player ?? null;
    const player: Player | null = rawPlayer
      ? {
          _id: rawPlayer._id ?? rawPlayer.id ?? "",
          wallet_address: rawPlayer.wallet_address ?? rawPlayer.walletAddress ?? "",
          name: rawPlayer.name ?? "",
          referral_code: rawPlayer.referral_code ?? rawPlayer.referralCode,
        }
      : null;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(WALLET_KEY, walletAddress);
    }
    return {
      token,
      player: player ?? { _id: "", wallet_address: walletAddress, name: "" },
    };
  },

  getProfile: async (): Promise<Player> => {
    const { data } = await apiClient.get<{ ok: boolean; data: unknown }>("/player/profile");
    return parseProfilePayload(data.data).player;
  },

  getFullProfile: async (): Promise<FullPlayerProfile> => {
    const { data } = await apiClient.get<{ ok: boolean; data: unknown }>("/player/profile");
    return parseProfilePayload(data.data);
  },

  updateName: async (name: string): Promise<string> => {
    const body: UpdateNameRequest = { name };
    const { data } = await apiClient.patch<{ ok: boolean; data: { name?: string } }>("/player/name", body);
    const n = data.data?.name;
    if (typeof n !== "string") throw new Error("Invalid name response");
    return n;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WALLET_KEY);
  },
};
