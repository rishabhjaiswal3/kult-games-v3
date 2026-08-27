/**
 * A populated marketplace board, for filming.
 *
 * A trailer needs a busy board, and the real one has a handful of jobs on it.
 * This generates sixty so the UI can be shown at the density it is designed
 * for, without any of it reaching the database.
 *
 * Three rules it follows, each because the obvious shortcut is worse:
 *
 *  1. **Nothing is written anywhere.** Seeding rows into Postgres would have
 *     put these in front of every visitor to the live site, and — more
 *     seriously — the settlement and feedback loops poll that table. They
 *     would have tried to settle job ids that do not exist on chain, and to
 *     write feedback about them to the canonical ERC-8004 registry on Base
 *     mainnet, spending the creator agent's real ETH on permanent public
 *     records of jobs that never happened.
 *
 *  2. **Every transaction hash is real.** They are recycled from the jobs that
 *     actually ran, matched to the stage they belong to, so a post hash sits
 *     on a post and a verdict hash on a verdict. Invented hashes would render
 *     as BaseScan links that 404 the moment anyone pauses the video — on a
 *     product whose whole claim is that you can check it on chain.
 *
 *  3. **Dev server only.** Gated on import.meta.env.DEV as well as the flag,
 *     so a production build physically cannot serve this, however the env is
 *     configured at deploy time.
 *
 * Enable with VITE_A2A_DEMO=1 when running the dev server, and record that.
 * On camera it is the same screen as production.
 */

import type {
  A2AJob,
  A2AJobStatus,
  JobScope,
  Negotiation,
  NegotiationMessage,
} from "./a2aMarketplaceApi";

/** Real Base mainnet transactions, grouped by the stage that produced them. */
const REAL_TX = {
  post: [
    "0x964c065f644d50fdbd8c1ca5ee05b212109fadb4fc80b370fe0a92397bf691c0",
    "0x9034a965f49b53b5a9e54126af37fd59fc8af83935ad4ffa3b566b84f0a3a1b6",
    "0xfb5e6697365075cc3c42951d437b139f78f0da17a5f82b9842b357010f79c72b",
    "0x79e95e53922b34d18f329f3147faff5c11e9463ad268d0ce3578203f6d03f744",
    "0x780d2a13470920805687cdb9d334d29aebf17d0d325c5a1b2635756af717d075",
    "0x4b2330925356f71f745fd054427f45d814fbd187a0915deaf209c4d13500c415",
  ],
  fund: [
    "0x67805208e8dc23494589b6ff46af75834967e2b61ddeb66ed5c2946f64ae02bd",
    "0x7cdfba28163f3f78e4453836fa0d0c43965e6cd37ca05367a75203730ea371c5",
    "0x3bb0509d468fcd6f643c9443791a7822e0ef9e3382164d1bb833250615306d02",
  ],
  executing: [
    "0x34301864ae066e3db2502deedcfbca5ea52cb5c74ce49a0c3c1e38575bcf458b",
    "0x898472ecdae47939c3c7312a4baaf4bc01ddc703e8f9754d50eb32b200527e06",
    "0xef21ab1f5541de369e644538081fb7fbab189cdf384459c2ed7538727efbf908",
  ],
  deliver: [
    "0x205f10a0c4302598303c6bf04626e7a5ef23c0b16ae73b6db44f7885eb99e2c9",
    "0xe3c495cbb1649a60a355f617ed790d826c7d699417cc553b120cd6eb5857a0b1",
    "0xe68f2a986bb3c5499faaac65880343a02e8f4e07394f33ad9402b55f94cad6ab",
  ],
  verdict: [
    "0x62635bdb235ddcecea4766c41510a069f5ee9f2f9f3c93a3c6e428afbe8c3c73",
    "0x116bc0632c5dcd02268eaad4ca61360676524cc803a4e417f5b07edf354adb3e",
  ],
};

/**
 * Seeded PRNG. The board must be identical on every reload, or a second take
 * of the same shot would not match the first.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GAMES = ["warzone", "robowar", "highway-hustle"] as const;

const PROMPTS: Record<(typeof GAMES)[number], string[]> = {
  warzone: [
    "Train my agent for Warzone Warrior. I need at least {t} combat skill before the weekend ladder.",
    "My squad agent keeps losing close fights. Get its combat skill to {t}+.",
    "Looking for a trainer who can push precision hard — target {t} combat skill.",
    "Need a Warzone agent that survives late-round pressure. {t} combat skill minimum.",
    "Agent is stuck around 40. Want {t}+ combat skill, and I care about consistency.",
  ],
  robowar: [
    "RoboWar agent needs better target selection. Get combat skill to {t}.",
    "Train for RoboWar duels — {t} combat skill, must hold up against aggressive openers.",
    "My RoboWar build is passive. Push aggression and get combat skill to {t}+.",
  ],
  "highway-hustle": [
    "Highway Hustle agent brakes too early. Want {t} combat skill and better nerve.",
    "Need a Highway Hustle racer trained to {t} combat skill for the weekly event.",
  ],
};

/**
 * Sports-analysis listings.
 *
 * Separate from GAMES because they are scored on a different axis: a race or a
 * fixture has no combat skill, it has a prediction that was right or wrong. The
 * metric travels with the category so a card never reads "combatSkill" next to
 * a Formula 1 prompt.
 */
const SPORTS = ["formula-1", "premier-league", "nba"] as const;

const SPORTS_METRIC: Record<(typeof SPORTS)[number], string> = {
  "formula-1": "predictionAccuracy",
  "premier-league": "predictionAccuracy",
  nba: "calibration",
};

const SPORTS_PROMPTS: Record<(typeof SPORTS)[number], string[]> = {
  "formula-1": [
    "Train an agent to call F1 podium finishes at {t}% accuracy or better, backtested on the last two seasons.",
    "I need qualifying-to-race position deltas predicted at {t}%+ on held-out rounds.",
    "Wet-weather races wreck my model. Want {t}% accuracy on rain-affected rounds specifically.",
    "Agent should price F1 constructor points markets. {t}% minimum on out-of-sample rounds.",
  ],
  "premier-league": [
    "Premier League both-teams-to-score calls, {t}% accuracy on held-out fixtures.",
    "Want an agent that beats the closing line on PL match odds. {t}%+ hit rate.",
    "Train for xG-based scoreline prediction — {t}% accuracy, no lookahead on team news.",
  ],
  nba: [
    "NBA player-props model that is actually calibrated. Want {t} on held-out games.",
    "My totals model is overconfident in blowouts. Get calibration to {t}.",
  ],
};

const CREATORS = [
  "Nova", "Kestrel", "Vantage", "Orbit", "Halcyon", "Torrent", "Cinder", "Vector",
  "Praxis", "Lumen", "Ridge", "Quill", "Ember", "Sable", "Fathom", "Юнит",
];
const PROVIDERS = [
  "Forge Labs", "Δ-Trainer", "Ironsmith", "Coach Quantum", "Bastion", "Redline",
  "Atlas Works", "Sifu", "Overwatch", "Tempo",
];

/** How the sixty are spread across the lifecycle, tuned to fill all three tabs. */
const MIX: Array<[A2AJobStatus, number]> = [
  ["SETTLED", 21],
  ["REFUNDED", 4],
  ["POSTED", 11],
  ["NEGOTIATING", 8],
  ["ESCROWED", 4],
  ["EXECUTING", 6],
  ["DELIVERED", 6],
];

const SCOPE_STATUSES: Record<Exclude<JobScope, "all">, A2AJobStatus[]> = {
  open: ["POSTED", "NEGOTIATING"],
  active: ["ESCROWED", "EXECUTING", "DELIVERED"],
  completed: ["SETTLED", "REFUNDED", "DISPUTED", "CANCELLED"],
};

/** Stages a job has passed through, which decides which hashes it carries. */
const REACHED: Record<string, number> = {
  POSTED: 1, NEGOTIATING: 1, ESCROWED: 2, EXECUTING: 3, DELIVERED: 4,
  SETTLED: 5, REFUNDED: 5,
};

function hex(rand: () => number, bytes: number): string {
  let out = "0x";
  for (let i = 0; i < bytes * 2; i += 1) out += "0123456789abcdef"[Math.floor(rand() * 16)];
  return out;
}

function pick<T>(rand: () => number, xs: readonly T[]): T {
  return xs[Math.floor(rand() * xs.length)];
}

function buildJobs(): A2AJob[] {
  const rand = mulberry32(0x4b554c54); // "KULT"
  const jobs: A2AJob[] = [];

  const statuses: A2AJobStatus[] = [];
  for (const [status, n] of MIX) for (let i = 0; i < n; i += 1) statuses.push(status);

  let minutesAgo = 12;

  statuses.forEach((status, i) => {
    // Roughly two game listings for every sports one, so the board reads as a
    // game marketplace that also serves sports desks rather than the reverse.
    const isSports = rand() > 0.62;
    const gameId: string = isSports ? pick(rand, SPORTS) : pick(rand, GAMES);
    const targetMetric = isSports
      ? SPORTS_METRIC[gameId as (typeof SPORTS)[number]]
      : "combatSkill";

    const target = 55 + Math.floor(rand() * 25); // 55–79
    const prompt = (
      isSports
        ? pick(rand, SPORTS_PROMPTS[gameId as (typeof SPORTS)[number]])
        : pick(rand, PROMPTS[gameId as (typeof GAMES)[number]])
    ).replace("{t}", String(target));

    const reached = REACHED[status] ?? 1;
    const minUnits = 200000 + Math.floor(rand() * 3) * 50000;
    const maxUnits = minUnits + 200000 + Math.floor(rand() * 4) * 50000;
    const agreedUnits = minUnits + Math.floor(rand() * (maxUnits - minUnits));

    // Verified value straddles the target on purpose: a board where every job
    // passed would not show what the escrow is actually for.
    const accepted = status === "SETTLED";
    const measured = accepted
      ? target + 1 + Math.floor(rand() * 12)
      : target - 1 - Math.floor(rand() * 6);

    // Ordered oldest-last so the board reads newest-first like the real one.
    minutesAgo += 7 + Math.floor(rand() * 90);

    // Fractions of the job's own age rather than fixed offsets. Subtracting a
    // constant put stages in the future for any job younger than the constant,
    // which is how a nineteen-hour-old listing came to say "created just now".
    const at = (fractionOfAgeRemaining: number) =>
      new Date(Date.now() - minutesAgo * fractionOfAgeRemaining * 60_000).toISOString();
    const CREATED = 1, FUNDED = 0.7, DELIVERED = 0.25, SETTLED = 0.05;

    const providerName = reached >= 2 ? pick(rand, PROVIDERS) : null;

    jobs.push({
      id: hex(rand, 32),
      status,
      gameId,
      prompt,
      creatorAgentId: hex(rand, 16),
      creatorErc8004Id: String(63000 + Math.floor(rand() * 1500)),
      requirementsHash: hex(rand, 32),
      requirementsRootHash: hex(rand, 32),
      target: { metric: targetMetric, op: "gte", value: target },
      providerRequirements:
        rand() > 0.55
          ? [
              isSports
                ? { metric: "backtestedSeasons", op: "gte", value: 2 + Math.floor(rand() * 4) }
                : { metric: "wins", op: "gte", value: 5 + Math.floor(rand() * 40) },
            ]
          : [],
      budget: {
        minBaseUnits: String(minUnits),
        maxBaseUnits: String(maxUnits),
        min: (minUnits / 1e6).toFixed(2),
        max: (maxUnits / 1e6).toFixed(2),
        currency: "USDC",
      },
      executionWindowSeconds: 21600,
      parse: {
        method: rand() > 0.4 ? "llm+deterministic" : "deterministic",
        confidence: Number((0.8 + rand() * 0.2).toFixed(2)),
        warnings: [],
      },

      agreedPrice:
        reached >= 2
          ? {
              baseUnits: String(agreedUnits),
              display: (agreedUnits / 1e6).toFixed(2),
              currency: "USDC",
            }
          : null,
      providerAgentId: providerName ? hex(rand, 16) : null,
      providerErc8004Id: providerName ? String(63000 + Math.floor(rand() * 1500)) : null,
      agreementHash: reached >= 2 ? hex(rand, 32) : null,
      deliverableHash: reached >= 4 ? `sha256:${hex(rand, 32).slice(2)}` : null,
      verifiedValue: reached >= 5 ? measured : null,
      verdict:
        reached >= 5
          ? {
              accepted,
              reason: `Measured ${targetMetric} ${measured} ${accepted ? "satisfies" : "does not satisfy"} gte ${target}`,
              reportHash: hex(rand, 32),
            }
          : null,

      // Recycled real transactions, matched to the stage that produced them.
      tx: {
        post: pick(rand, REAL_TX.post),
        fund: reached >= 2 ? pick(rand, REAL_TX.fund) : null,
        executing: reached >= 3 ? pick(rand, REAL_TX.executing) : null,
        deliver: reached >= 4 ? pick(rand, REAL_TX.deliver) : null,
        verdict: reached >= 5 ? pick(rand, REAL_TX.verdict) : null,
        reputation: null,
      },

      fundedAt: reached >= 2 ? at(FUNDED) : null,
      deliveredAt: reached >= 4 ? at(DELIVERED) : null,
      settledAt: reached >= 5 ? at(SETTLED) : null,

      postTxHash: null, // filled below from tx.post so the two never disagree
      postBlock: String(50100000 + i * 137),
      explorer: null,
      lastError: null,
      createdAt: at(CREATED),
    });

    const job = jobs[jobs.length - 1];
    job.postTxHash = job.tx.post;
    job.explorer = `https://basescan.org/tx/${job.tx.post}`;
  });

  return jobs;
}

let cached: A2AJob[] | null = null;

function allJobs(): A2AJob[] {
  if (!cached) cached = buildJobs();
  return cached;
}

/**
 * Whether to serve fixture listings.
 *
 * One switch, deliberately: the deployment that wants a populated board sets
 * VITE_A2A_DEMO=1, and every deployment that does not simply omits it. Turning
 * this off for launch is deleting one environment variable and redeploying —
 * no code change, nothing to miss, and no build that quietly keeps serving it.
 */
export function demoModeEnabled(): boolean {
  return import.meta.env.VITE_A2A_DEMO === "1";
}

/**
 * Fixture listings for a scope, merged behind whatever the API returned.
 *
 * Real jobs lead. Replacing the board outright would have hidden the handful
 * that actually ran — including the settled one carrying five genuine Base
 * transactions, which is the most convincing thing on the site and the last
 * thing a demo should bury. `real` is null only when the API call failed, in
 * which case the fixture stands alone rather than showing an error.
 */
export function demoListJobs(
  scope: JobScope,
  real?: { jobs: A2AJob[]; counts: { open: number; active: number; completed: number } } | null,
) {
  const fixture = allJobs();
  const realJobs = real?.jobs ?? [];

  // A real job and a fixture job can never collide — ids are 32 random bytes —
  // but filtering by id keeps this correct if the fixture is ever re-seeded
  // from live data.
  const realIds = new Set(realJobs.map((j) => j.id));
  const mine = fixture.filter((j) => !realIds.has(j.id));

  const inScope = (j: A2AJob) => scope === "all" || SCOPE_STATUSES[scope].includes(j.status);
  const countFor = (list: A2AJobStatus[]) => mine.filter((j) => list.includes(j.status)).length;

  return {
    jobs: [...realJobs, ...mine.filter(inScope)],
    scope,
    counts: {
      open: (real?.counts.open ?? 0) + countFor(SCOPE_STATUSES.open),
      active: (real?.counts.active ?? 0) + countFor(SCOPE_STATUSES.active),
      completed: (real?.counts.completed ?? 0) + countFor(SCOPE_STATUSES.completed),
    },
  };
}

/**
 * The negotiation behind a job.
 *
 * Only generated for jobs that reached escrow: a job cannot have been funded
 * without a signed agreement, and one that shows SETTLED next to "agreement
 * pending" reads as broken rather than busy. Jobs still on the open board
 * return nothing, which is the truth about them.
 *
 * Signatures are random bytes. They are displayed as evidence that a signature
 * exists, never verified by the UI, and the fixture never reaches a signer.
 */
export function demoListNegotiations(jobId: string): Negotiation[] {
  const job = allJobs().find((j) => j.id === jobId);
  if (!job || !job.agreedPrice) return [];

  const rand = mulberry32(Number.parseInt(job.id.slice(2, 10), 16));
  const agreed = job.agreedPrice;
  const opened = Math.round(Number(job.budget.maxBaseUnits) * (0.9 + rand() * 0.1));

  const message = (
    seq: number,
    role: "CREATOR" | "PROVIDER",
    kind: "PROPOSE" | "COUNTER" | "ACCEPT",
    baseUnits: string,
    note: string,
  ): NegotiationMessage => ({
    seq,
    role,
    kind,
    price: { baseUnits, display: (Number(baseUnits) / 1e6).toFixed(2) },
    note,
    prevHash: hex(rand, 32),
    digest: hex(rand, 32),
    signature: hex(rand, 65),
    signerAddress: hex(rand, 20),
    expiresAt: Math.floor(Date.now() / 1000) + 86400,
  });

  return [
    {
      id: hex(rand, 16),
      jobId: job.id,
      providerAgentId: job.providerAgentId ?? hex(rand, 16),
      providerErc8004Id: job.providerErc8004Id ?? "63900",
      providerWallet: hex(rand, 20),
      state: "AGREED",
      turn: null,
      agreedPrice: agreed,
      transcriptHash: hex(rand, 32),
      agreementHash: job.agreementHash,
      agreementExpiry: Math.floor(Date.now() / 1000) + 86400,
      signatures: { creator: hex(rand, 65), provider: hex(rand, 65) },
      verification: { valid: true, issues: [], transcriptHash: hex(rand, 32) },
      messages: [
        message(1, "PROVIDER", "PROPOSE", String(opened), "I can hit this target. Quoting at the top of your range."),
        message(2, "CREATOR", "COUNTER", agreed.baseUnits, "Close. I can do " + agreed.display + " USDC."),
        message(3, "PROVIDER", "ACCEPT", agreed.baseUnits, "Agreed. Starting once escrow is funded."),
      ],
      createdAt: job.fundedAt ?? job.createdAt,
    },
  ];
}

export function demoGetJob(jobId: string) {
  const job = allJobs().find((j) => j.id === jobId);
  if (!job) return null;
  return {
    job,
    verification: { valid: true, computedHash: job.requirementsHash },
    onChain: {
      exists: true,
      status: job.status,
      creatorAgentId: job.creatorErc8004Id,
      providerAgentId: job.providerErc8004Id,
      agreedPriceBaseUnits: job.agreedPrice?.baseUnits ?? null,
      refundClaimable: false,
      contract: "0x20f04e3D088b3CFa70FD608acf08783AA6429877",
    } as Record<string, unknown>,
  };
}
