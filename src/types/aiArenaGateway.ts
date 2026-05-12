export interface AiArenaLeaderboardEntry {
  rank: number;
  agentId: string;
  name: string;
  clan: "ZEROG" | "BASE" | "SOLANA" | string;
  eloRating: number;
  wins: number;
}

export interface AiArenaGlobalLeaderboardResponse {
  entries: AiArenaLeaderboardEntry[];
}

export interface ZgDaReceipt {
  daRequestId?: string | null;
  daBatchId?: string | null;
  daBlobIndex?: number | null;
  daBatchHeaderHash?: string | null;
  daConfirmationBlock?: number | null;
  daFinalizedAt?: string | null;
  daStatus?: string | null;
}

export interface AiArenaAgentTraits {
  aggression: number;
  intelligence: number;
  adaptability: number;
  resilience: number;
  creativity: number;
  loyalty: number;
  deception: number;
  patience: number;
}

export interface AiArenaAgent {
  id: string;
  name: string;
  clan: "ZEROG" | "BASE" | "SOLANA" | string;
  archetype: string;
  evolutionStage: string;
  eloRating: number;
  wins: number;
  losses: number;
  status?: string;
  description?: string;
  traits?: AiArenaAgentTraits;
  inftTokenId?: string | null;
  createdAt?: string;
}

export interface AiArenaCreateAgentRequest {
  name: string;
  clan: "ZEROG" | "BASE" | "SOLANA";
  archetype: "BERSERKER" | "TACTICIAN" | "DEFENDER" | "ASSASSIN" | "SUPPORT" | "HYBRID";
  backstory: string;
}

export interface AiArenaListAgentsResponse {
  agents: AiArenaAgent[];
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface AiArenaAuthMeResponse {
  userId: string;
  walletAddress: string;
  custodialSolanaAddress?: string;
}

export interface AiArenaCreateAgentResponse {
  agent: AiArenaAgent;
}

export interface AiArenaBattleResult {
  winnerId: string;
  loserId: string;
  rounds: number;
  eloChange?: Record<string, number>;
}

export interface AiArenaBattle {
  id: string;
  status: "PENDING" | "INITIALIZING" | "IN_PROGRESS" | "COMPLETED" | string;
  result?: AiArenaBattleResult;
  endedAt?: string;
}

export interface AiArenaBattleResponse {
  battle: AiArenaBattle;
}

export interface AiArenaMatchmakingStatusBody {
  inQueue: boolean;
  position: number | null;
  estimatedWaitMs: number | null;
  matchId: string | null;
}

export interface AiArenaMatchmakingStatusResponse {
  status: AiArenaMatchmakingStatusBody;
}

export interface AiArenaFinancialDepositRequest {
  agentId: string;
  amount: number;
  currency: "ARENA";
  txHash: string;
}

export interface AiArenaAgentWallet {
  id: string;
  agentId: string;
  solanaAddress: string;
  balanceArena: number;
  balanceSol: number;
  isFrozen: boolean;
}

export interface AiArenaAgentWalletResponse {
  wallet: AiArenaAgentWallet;
}

export interface AiArenaFinancialWithdrawalRequest {
  agentId: string;
  amount: number;
  destination: string;
}
