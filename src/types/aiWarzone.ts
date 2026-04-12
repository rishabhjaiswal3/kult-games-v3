// ─── POST /agent/create ─────────────────────────────────────────────────────

export interface AiWarzoneCreateAgentRequest {
  id: string;
  walletAddress: string;
  name: string;
  description: string;
}

export interface AiWarzoneAgent {
  _id: string;
  name: string;
  description: string;
  ownerWallet: string;
  hotWalletAddress: string;
  /** Present on GET /agent; may be null. */
  currentModelId?: string | null;
  onChainId: string;
  elo: number;
  status: string;
  currency: number;
  x402Permission: boolean;
  wins: number;
  losses: number;
  totalMatches: number;
  createdAt: string;
  updatedAt: string;
}

// ─── GET /agent?walletAddress= ───────────────────────────────────────────────

export interface AiWarzoneGetAgentFound {
  found: true;
  agent: AiWarzoneAgent;
}

export interface AiWarzoneGetAgentNotFound {
  found: false;
  message: string;
}

export type AiWarzoneGetAgentResponse = AiWarzoneGetAgentFound | AiWarzoneGetAgentNotFound;

// ─── POST /agent/fund ─────────────────────────────────────────────────────────

export interface AiWarzoneFundAgentRequest {
  hotWalletAddress: string;
  amount: number;
}

export interface AiWarzoneFundAgentResponse {
  success: boolean;
  agentId: string;
  hotWalletAddress: string;
  funded: number;
  newBalance: number;
}

// ─── POST /arena/escrow ─────────────────────────────────────────────────────────

export interface AiWarzoneCreateEscrowRequest {
  player1HotWallet: string;
  player2HotWallet: string;
  /** Optional; server default 100. Prize = amount × 2. */
  amount?: number;
}

export interface AiWarzoneEscrowResponse {
  matchId: string;
  player1HotWallet: string;
  player2HotWallet: string;
  status: string;
  warzoneMatchId: string;
  prizeAmount: string;
  escrowId: string;
}

// ─── GET /behavior/status/:wallet ───────────────────────────────────────────

export interface AiWarzoneBehaviorStatus {
  wallet: string;
  sampleCount: number;
  samplesNeeded: number;
  readyToTrain: boolean;
  modelStatus: string;
  trainedAt: string | null;
  fileHash: string | null;
  zeroGExplorer: string | null;
  errorMsg: string | null;
}

// ─── GET /0g/status/:wallet ─────────────────────────────────────────────────

export interface AiWarzoneZeroGStatus {
  wallet: string;
  sampleCount: number;
  modelStatus: string;
  message?: string;
  onZeroG?: boolean;
  storageType?: string;
  trainedAt?: string | null;
  fileHash?: string | null;
  explorerUrl?: string | null;
  downloadUrl?: string | null;
  indexerCheckUrl?: string | null;
  network?: string;
  hasLocalBuffer?: boolean;
  localNote?: string | null;
  errorMsg?: string | null;
}

// ─── GET /0g/wallet ─────────────────────────────────────────────────────────

export interface AiWarzoneZeroGBackendWallet {
  address: string;
  balanceEth: string;
  funded: boolean;
  network: string;
  tip: string;
}
