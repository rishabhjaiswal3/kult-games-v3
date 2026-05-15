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
  /** EIP-4361 SIWE message that was signed */
  message: string;
  /** Hex-encoded secp256k1 signature from personal_sign */
  signature: string;
}

export interface PrivyTonLoginRequest {
  walletAddress: string;
  identityToken: string;
  name?: string;
  metadata?: Record<string, unknown>;
  referralCode?: string;
}

export interface LoginResponse {
  token: string;
  player: Player;
}

export interface UpdateNameRequest {
  name: string;
}

/** Per-game row from GET /player/profile (Rust `PlayerProfile.game_scores_list`). */
export interface PlayerGameScoreEntry {
  identification: string;
  score: number;
  weight: number;
  weightedScore: number;
  rank: number | null;
}

/** Stats object inside `data.profile` for GET /player/profile (kult-browser-backend-rust). */
export interface PlayerProfileStats {
  walletAddress: string;
  username: string;
  rank: number | null;
  totalScore: number;
  level: number;
  totalGamesPlayed: number;
  completedQuests: number;
  gameScoresList: PlayerGameScoreEntry[];
}

/** Full API envelope for GET /player/profile when backend returns `{ cached, profile }`. */
export interface PlayerProfileApiData {
  cached: boolean;
  profile: PlayerProfileStats;
}

/** Normalized profile for the profile page (one GET). */
export interface FullPlayerProfile {
  player: Player;
  cached: boolean;
  rank: number | null;
  totalScore: number;
  level: number;
  totalGamesPlayed: number;
  completedQuests: number;
  gameScoresList: PlayerGameScoreEntry[];
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

// ─── Marketplace (GET /marketplace) ───────────────────────────────────────────

/** Single listing — matches kult-browser-backend-rust `ListingResponse` (camelCase JSON). */
export interface MarketplaceListing {
  id: string;
  name: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  assetUrl?: string | null;
  price: number;
  category: string;
  currency: string;
  gameIdentification: string;
  status: string;
  /**
   * Optional backend-provided encoded call payload for direct on-chain purchase.
   * When present, frontend sends this through Privy sendTransaction.
   */
  purchaseCalldata?: `0x${string}` | null;
  /** Optional explicit contract override per listing. */
  purchaseContractAddress?: `0x${string}` | null;
  /** Optional native value in wei for payable purchase. */
  purchaseValueWei?: string | null;
  /** Optional chain override per listing. */
  purchaseChainId?: number | null;
}

export interface MarketplaceListingsResponse {
  listings: MarketplaceListing[];
  total: number;
  page: number;
  perPage: number;
}

export interface MarketplaceCreateOrderRequest {
  listingId: string;
  quantity?: number;
  txHash?: string;
}

export interface MarketplaceOrder {
  id: string;
  listingId: string;
  playerId: string;
  gameIdentification: string;
  pricePaid: number;
  quantity: number;
  status: string;
  txHash?: string;
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
