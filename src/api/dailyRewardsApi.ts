// Daily login rewards — MOCKED on localStorage for the UI demo.
//
// ⚠️ NOT PRODUCTION-READY: streaks reset on device change and the claim gate is
// client-side (trivially cheatable). Before shipping, swap the two functions in
// `dailyRewardsApi` for the real endpoints:
//
//   getState : GET  /v1/rewards/daily        -> DailyRewardsState
//   claim    : POST /v1/rewards/daily/claim  -> DailyRewardsState
//
// The shapes below are the contract; nothing else in the UI needs to change.

import { TOTAL_REWARD_DAYS } from "@/constants/dailyRewards";

export interface DailyRewardsState {
  /** The day (1-based) the user is currently on — next to claim, or the last day when completed. */
  currentDay: number;
  claimedDays: number[];
  claimableToday: boolean;
  /** ISO timestamp for when the next claim unlocks; null when claimable now or completed. */
  nextUnlockAt: string | null;
  /** All TOTAL_REWARD_DAYS days claimed. */
  completed: boolean;
}

/** Set to a number of minutes (e.g. 1) to demo day-advancement quickly instead
 *  of waiting for local midnight. Leave null for realistic behavior. */
const MOCK_FAST_UNLOCK_MINUTES: number | null = null;

const STORAGE_KEY = "kult.dailyRewards.v1";

type Persisted = { claimedDays: number[]; lastClaimAt: string | null };

function readPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (Array.isArray(parsed.claimedDays)) return parsed;
    }
  } catch {
    // fall through to fresh state
  }
  return { claimedDays: [], lastClaimAt: null };
}

function writePersisted(state: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — demo state just won't persist
  }
}

/** Next unlock moment after a claim: 24 hours later (or the fast-mode offset). */
function unlockAfter(claimAtIso: string): number {
  const claimAt = new Date(claimAtIso);
  if (MOCK_FAST_UNLOCK_MINUTES !== null) {
    return claimAt.getTime() + MOCK_FAST_UNLOCK_MINUTES * 60_000;
  }
  return claimAt.getTime() + 24 * 60 * 60 * 1000;
}

function toState(persisted: Persisted): DailyRewardsState {
  const completed = persisted.claimedDays.length >= TOTAL_REWARD_DAYS;
  const currentDay = completed ? TOTAL_REWARD_DAYS : persisted.claimedDays.length + 1;
  const unlockAtMs = persisted.lastClaimAt ? unlockAfter(persisted.lastClaimAt) : 0;
  const claimableToday = !completed && Date.now() >= unlockAtMs;

  return {
    currentDay,
    claimedDays: [...persisted.claimedDays].sort((a, b) => a - b),
    claimableToday,
    nextUnlockAt: !completed && !claimableToday ? new Date(unlockAtMs).toISOString() : null,
    completed,
  };
}

export const dailyRewardsApi = {
  // TODO(backend): const { data } = await http().get<DailyRewardsState>("/v1/rewards/daily");
  getState: async (): Promise<DailyRewardsState> => {
    return toState(readPersisted());
  },

  // TODO(backend): const { data } = await http().post<DailyRewardsState>("/v1/rewards/daily/claim", { day });
  claim: async (day: number): Promise<DailyRewardsState> => {
    const persisted = readPersisted();
    const state = toState(persisted);
    // Same validation the server will own: sequential days, one claim per unlock window.
    if (!state.claimableToday || day !== state.currentDay) return state;

    const next: Persisted = {
      claimedDays: [...persisted.claimedDays, day],
      lastClaimAt: new Date().toISOString(),
    };
    writePersisted(next);
    return toState(next);
  },
};
