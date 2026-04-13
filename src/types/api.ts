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

export interface GameThumbnailVariant {
  url: string | null;
  alt?: string | null;
  blurhash?: string | null;
  height?: number | null;
  width?: number | null;
  mime_type?: string | null;
  size_in_kb?: number | null;
  svg_content?: string | null;
}

export interface GameThumbnail {
  horizontal?: GameThumbnailVariant | null;
  vertical?: GameThumbnailVariant | null;
  square?: GameThumbnailVariant | null;
  ultrawide?: GameThumbnailVariant | null;
}

export interface LocalizedString {
  en: string;
  [locale: string]: string;
}

export interface Game {
  _id: string;
  identification?: string;
  slug?: string;
  name: LocalizedString | string;
  description?: LocalizedString | string;
  category: string;
  platform?: string[];
  rating?: number;
  image_url?: string;
  images?: GameImage[];
  thumbnail?: GameThumbnail;
  slogan?: string;
  about?: string;
  url?: string;
  /** When true, `url` points to an installable/downloadable build (not an in-browser play URL). */
  isDownloadable?: boolean;
  is_downloadable?: boolean;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface GamesResponse {
  games: Game[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
