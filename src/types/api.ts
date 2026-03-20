// ─── Player ───────────────────────────────────────────────────────────────────

export interface Player {
  _id: string;
  wallet_address: string;
  name: string;
  referral_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  walletAddress: string;
}

export interface LoginResponse {
  token: string;
  player: Player;
}

export interface UpdateNameRequest {
  name: string;
}

// ─── Games ────────────────────────────────────────────────────────────────────

export interface GameImage {
  url: string;
  variant?: string;
}

export interface LocalizedString {
  en: string;
  [locale: string]: string;
}

export interface Game {
  _id: string;
  slug: string;
  name: LocalizedString | string;
  description?: LocalizedString | string;
  category: string;
  platform?: string[];
  rating?: number;
  image_url?: string;
  images?: GameImage[];
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface GamesResponse {
  games: Game[];
  total: number;
  page: number;
  limit: number;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  wallet_address: string;
  name?: string;
  score: number;
  wins?: number;
  level?: string;
  game?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  updated_at?: string;
}

// ─── Generic API response wrapper ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
