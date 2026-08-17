/**
 * A2A marketplace API client.
 *
 * Talks to the AI Arena gateway, which proxies:
 *   /v1/marketplace/*  -> a2a-marketplace-service  (jobs, negotiation)
 *   /v1/a2a/*          -> base-chain-service       (identity, chain reads)
 *
 * Defensive parsing throughout, matching the convention in aiArenaGatewayApi.ts
 * — the backend response shapes have drifted historically and the frontend
 * compensates rather than assuming one strict contract.
 */

import { getApiClient } from "@/lib/apiClientFactory";

const client = () => getApiClient("aiArenaGateway");

// ── Types ───────────────────────────────────────────────────────────────────

export type A2AJobStatus =
  | "DRAFT" | "POSTING" | "POSTED" | "NEGOTIATING" | "ESCROWED"
  | "EXECUTING" | "DELIVERED" | "SETTLED" | "REFUNDED"
  | "CANCELLED" | "DISPUTED" | "FAILED";

export type RequirementPredicate = {
  metric: string;
  op: "gte" | "gt" | "lte" | "lt" | "eq";
  value: number;
};

export type A2AJob = {
  id: string;
  status: A2AJobStatus;
  gameId: string;
  prompt: string;
  creatorAgentId: string;
  creatorErc8004Id: string;
  requirementsHash: string;
  requirementsRootHash: string | null;
  target: RequirementPredicate;
  providerRequirements: RequirementPredicate[];
  budget: {
    minBaseUnits: string;
    maxBaseUnits: string;
    min: string;
    max: string;
    currency: string;
  };
  executionWindowSeconds: number;
  parse: { method: string; confidence: number; warnings: string[] };
  postTxHash: string | null;
  postBlock: string | null;
  explorer: string | null;
  lastError: string | null;
  createdAt: string;
};

export type ParsedInterpretation = {
  gameId: string | null;
  target: RequirementPredicate | null;
  providerRequirements: RequirementPredicate[];
  method: string;
  confidence: number;
  warnings: string[];
  needsReview: boolean;
};

export type NegotiationMessage = {
  seq: number;
  role: "CREATOR" | "PROVIDER";
  kind: "PROPOSE" | "COUNTER" | "ACCEPT" | "DECLINE";
  price: { baseUnits: string; display: string } | null;
  note: string;
  prevHash: string;
  digest: string;
  signature: string;
  signerAddress: string;
  expiresAt: number;
};

export type Negotiation = {
  id: string;
  jobId: string;
  providerAgentId: string;
  providerErc8004Id: string;
  providerWallet: string;
  state: "OPEN" | "AGREED" | "DECLINED" | "EXPIRED";
  turn: "CREATOR" | "PROVIDER" | null;
  agreedPrice: { baseUnits: string; display: string; currency: string } | null;
  transcriptHash: string | null;
  agreementHash: string | null;
  agreementExpiry: number | null;
  signatures: { creator: string | null; provider: string | null };
  /** Recomputed on every read — a stored "valid" flag would not catch tampering. */
  verification: { valid: boolean; issues: unknown[]; transcriptHash: string };
  messages: NegotiationMessage[];
  createdAt: string;
};

/** Mirrors IdentityView in base-chain-service. */
export type AgentBaseIdentity = {
  agentId: string;
  /** PENDING | REGISTERING | REGISTERED | WALLET_LINKED | FAILED */
  status: string;
  eoaAddress: string;
  ownerWallet: string;
  erc8004AgentId: string | null;
  agentURI: string | null;
  cardRootHash: string | null;
  registerTxHash: string | null;
  setWalletTxHash: string | null;
  lastError: string | null;
};

/** Mirrors IdentityView in base-chain-service. */
export type AgentBaseIdentity = {
  agentId: string;
  /** PENDING | REGISTERING | REGISTERED | WALLET_LINKED | FAILED */
  status: string;
  eoaAddress: string;
  ownerWallet: string;
  erc8004AgentId: string | null;
  agentURI: string | null;
  cardRootHash: string | null;
  registerTxHash: string | null;
  setWalletTxHash: string | null;
  lastError: string | null;
};

export type OnChainReputation = {
  agentId: string;
  totalFeedback: number;
  distinctClients: number;
  averageValue: number | null;
  completionRatePercent: number | null;
  registry: string;
};

// ── Jobs ────────────────────────────────────────────────────────────────────

export const a2aMarketplaceApi = {
  /** Preview an interpretation without storing anything. */
  async parsePrompt(prompt: string): Promise<ParsedInterpretation> {
    const { data } = await client().post("/v1/marketplace/jobs/parse", { prompt });
    return data;
  },

  /**
   * Stage a job. Nothing goes on-chain until confirm() — the parsed document,
   * not the prose, is what the escrow settles against, so the author reviews
   * the interpretation first.
   */
  async createDraft(input: {
    creatorAgentId: string;
    prompt: string;
    budgetMin: string;
    budgetMax: string;
    gameId?: string;
    target?: RequirementPredicate;
    providerRequirements?: RequirementPredicate[];
  }): Promise<{ job: A2AJob; interpretation: ParsedInterpretation }> {
    const { data } = await client().post("/v1/marketplace/jobs/draft", input);
    return data;
  },

  /** Publish a confirmed draft to Base mainnet. */
  async confirmJob(jobId: string): Promise<{ job: A2AJob; explorer: string }> {
    const { data } = await client().post(`/v1/marketplace/jobs/${jobId}/confirm`);
    return data;
  },

  async listOpenJobs(gameId?: string): Promise<A2AJob[]> {
    const { data } = await client().get("/v1/marketplace/jobs", {
      params: gameId ? { gameId } : undefined,
    });
    return data?.jobs ?? [];
  },

  /** Job record, hash verification, and the chain's independent view. */
  async getJob(jobId: string): Promise<{
    job: A2AJob;
    verification: { valid: boolean; computedHash: string; reason?: string };
    onChain: Record<string, unknown> | null;
  }> {
    const { data } = await client().get(`/v1/marketplace/jobs/${jobId}`);
    return data;
  },

  /** URL of the exact canonical bytes whose keccak256 is committed on-chain. */
  requirementsDocumentUrl(jobId: string): string {
    return `${client().defaults.baseURL}/v1/marketplace/jobs/${jobId}/requirements.json`;
  },

  // ── Negotiation ───────────────────────────────────────────────────────────

  async listNegotiations(jobId: string): Promise<Negotiation[]> {
    const { data } = await client().get("/v1/marketplace/negotiations", { params: { jobId } });
    return data?.negotiations ?? [];
  },

  async getNegotiation(negotiationId: string): Promise<Negotiation> {
    const { data } = await client().get(`/v1/marketplace/negotiations/${negotiationId}`);
    return data;
  },

  /** A provider opens a thread. Eligibility is re-derived server-side. */
  async openNegotiation(jobId: string, providerAgentId: string): Promise<Negotiation> {
    const { data } = await client().post("/v1/marketplace/negotiations", { jobId, providerAgentId });
    return data;
  },

  async sendOffer(
    negotiationId: string,
    offer: {
      role: "CREATOR" | "PROVIDER";
      kind: "PROPOSE" | "COUNTER" | "ACCEPT" | "DECLINE";
      priceBaseUnits?: string;
      note?: string;
    },
  ): Promise<Negotiation> {
    const { data } = await client().post(`/v1/marketplace/negotiations/${negotiationId}/offers`, offer);
    return data;
  },

  /** The autonomous path — the provider agent decides and plays its own move. */
  async providerRespond(
    negotiationId: string,
    policy: { floorBaseUnits: string; openingFraction?: number; concessionRate?: number },
  ): Promise<{ decision: { kind: string; reason: string }; negotiation: Negotiation }> {
    const { data } = await client().post(`/v1/marketplace/negotiations/${negotiationId}/respond`, policy);
    return data;
  },

  /** Both agents sign the agreed terms. Verified on-chain before USDC moves. */
  async signAgreement(negotiationId: string): Promise<{
    negotiation: Negotiation;
    agreementHash: string;
    signatures: { creator: string; provider: string };
  }> {
    const { data } = await client().post(`/v1/marketplace/negotiations/${negotiationId}/agreement`);
    return data;
  },

  // ── Reputation ────────────────────────────────────────────────────────────

  /** Straight from the ERC-8004 registry on Base — not our own aggregate. */
  async getOnChainReputation(erc8004AgentId: string): Promise<OnChainReputation> {
    const { data } = await client().get(`/v1/a2a/reputation/agents/${erc8004AgentId}`);
    return data;
  },

  async getAgentIdentity(agentId: string): Promise<AgentBaseIdentity | null> {
    try {
      const { data } = await client().get(`/v1/a2a/identity/agents/${agentId}`);
      return data;
    } catch {
      // A 404 means "no identity yet", a normal state for a fresh agent rather
      // than an error every caller has to handle.
      return null;
    }
  },

  /**
   * Mint the agent an ERC-8004 identity on Base.
   *
   * Idempotent server-side: an agent that already has one gets its existing
   * identity back rather than a second mint, so a double-click is harmless.
   */
  async registerAgentIdentity(agentId: string): Promise<{
    identity: AgentBaseIdentity;
    explorer: { registerTx: string | null; token: string | null };
  }> {
    const { data } = await client().post(`/v1/a2a/identity/agents/${agentId}/register`);
    return data;
  },
};

// ── Display helpers ─────────────────────────────────────────────────────────

export const BASESCAN_TX = (hash: string) => `https://basescan.org/tx/${hash}`;
export const BASESCAN_ADDRESS = (addr: string) => `https://basescan.org/address/${addr}`;

/** The seven lifecycle stages, in order. The UI's spine. */
export const LIFECYCLE_STAGES = [
  "POST", "DISCOVER", "NEGOTIATE", "ESCROW", "TRAIN", "DELIVER", "SETTLE",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

/** Map a job status onto how far along the lifecycle rail it has travelled. */
export function stageIndexForStatus(status: A2AJobStatus): number {
  switch (status) {
    case "DRAFT":
    case "POSTING":
      return 0;
    case "POSTED":
      return 1;
    case "NEGOTIATING":
      return 2;
    case "ESCROWED":
      return 3;
    case "EXECUTING":
      return 4;
    case "DELIVERED":
      return 5;
    case "SETTLED":
      return 6;
    // Terminal-but-unhappy states stop where they stopped rather than
    // pretending to have advanced.
    case "REFUNDED":
    case "DISPUTED":
      return 5;
    case "CANCELLED":
    case "FAILED":
      return 1;
    default:
      return 0;
  }
}

export function formatUsdc(baseUnits: string | null | undefined): string {
  if (!baseUnits) return "—";
  const units = BigInt(baseUnits);
  const whole = units / 1_000_000n;
  const fraction = (units % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function shortHash(hash: string | null | undefined, size = 6): string {
  if (!hash) return "—";
  return hash.length <= size * 2 + 2 ? hash : `${hash.slice(0, size + 2)}…${hash.slice(-size)}`;
}
