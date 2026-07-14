import apiClient from "@/lib/apiClient";
import { TOTAL_REWARD_DAYS } from "@/constants/dailyRewards";
import { isRecord, unwrapApiData } from "@/api/utils";
import type { ApiEnvelope } from "@/types/api";

export interface DailyRewardsState {
  /** The day (1-based) the user is currently on — next to claim, or the last day when completed. */
  currentDay: number;
  claimedDays: number[];
  claimableToday: boolean;
  /** ISO timestamp for when the next claim unlocks; null when claimable now or completed. */
  nextUnlockAt: string | null;
  /** All TOTAL_REWARD_DAYS days claimed. */
  completed: boolean;
  /** True when a Mongo record exists for this wallet. */
  hasRecord: boolean;
}

export interface ClaimDailyRewardResponse extends DailyRewardsState {
  claimedDay: number;
}

function parseDailyRewardsState(raw: unknown): DailyRewardsState {
  if (!isRecord(raw)) {
    return emptyState();
  }

  const claimedDays = Array.isArray(raw.claimedDays)
    ? raw.claimedDays.map((day) => Number(day)).filter((day) => Number.isFinite(day) && day >= 1)
    : [];

  return {
    currentDay: clampDay(Number(raw.currentDay ?? 1)),
    claimedDays,
    claimableToday: raw.claimableToday === true,
    nextUnlockAt: typeof raw.nextUnlockAt === "string" ? raw.nextUnlockAt : null,
    completed: raw.completed === true,
    hasRecord: raw.hasRecord === true,
  };
}

function emptyState(): DailyRewardsState {
  return {
    currentDay: 1,
    claimedDays: [],
    claimableToday: true,
    nextUnlockAt: null,
    completed: false,
    hasRecord: false,
  };
}

function clampDay(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(Math.max(Math.trunc(day), 1), TOTAL_REWARD_DAYS);
}

/**
 * Users who minted a Genesis agent before daily-rewards DB tracking should see day 1
 * as claimed and be able to claim day 2 immediately on first interaction.
 */
export function mergeLegacyGenesisAgentState(
  state: DailyRewardsState,
  hasGenesisAgent: boolean,
): DailyRewardsState {
  if (state.hasRecord || !hasGenesisAgent || state.completed) {
    return state;
  }

  return {
    currentDay: 2,
    claimedDays: [1],
    claimableToday: true,
    nextUnlockAt: null,
    completed: false,
    hasRecord: false,
  };
}

export const dailyRewardsApi = {
  getState: async (): Promise<DailyRewardsState> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>("/rewards/daily");
    return parseDailyRewardsState(unwrapApiData(data));
  },

  claim: async (options?: { legacyDay1?: boolean }): Promise<ClaimDailyRewardResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>("/rewards/daily/claim", {
      legacyDay1: options?.legacyDay1 === true,
    });
    const raw = unwrapApiData(data);
    if (!isRecord(raw)) {
      throw new Error("Invalid daily reward claim response");
    }
    return {
      ...parseDailyRewardsState(raw),
      claimedDay: clampDay(Number(raw.claimedDay)),
    };
  },
};
