// Daily login rewards state shape — day 1 (Genesis Agent Mint) is derived from
// the My Agents API (same source as MyAgentsPage). Days 2+ await the real
// rewards backend:
//
//   GET  /v1/rewards/daily        -> DailyRewardsState
//   POST /v1/rewards/daily/claim  -> DailyRewardsState

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

/** Day 1 claimed when the wallet already has at least one arena agent. */
export function buildDailyRewardsState(hasAgent: boolean): DailyRewardsState {
  if (!hasAgent) {
    return {
      currentDay: 1,
      claimedDays: [],
      claimableToday: true,
      nextUnlockAt: null,
      completed: false,
    };
  }

  return {
    currentDay: Math.min(2, TOTAL_REWARD_DAYS),
    claimedDays: [1],
    claimableToday: false,
    nextUnlockAt: null,
    completed: false,
  };
}
