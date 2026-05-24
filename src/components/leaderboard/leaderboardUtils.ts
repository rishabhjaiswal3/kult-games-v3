import { getLeaderboardPlayerVisual } from "@/constants/arenaAgentArchetypes";
import type { LeaderboardEntry } from "@/types/api";
import { clanFromArchetype } from "./ClanIcon";

export type LeaderboardTab = "GLOBAL" | "MY RANK";

export type DisplayPlayer = {
  rank: number;
  name: string;
  avatar: string;
  clanName: string;
  clanIconType: string;
  points: string;
  wins?: number;
  winRate?: string;
  battles?: number;
  wallet: string;
  isYou?: boolean;
  showHexagon?: boolean;
};

function shortenWallet(addr: string) {
  if (!addr || addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function isWalletLikeName(name: string, wallet: string) {
  const n = name.trim().toLowerCase();
  const w = wallet.trim().toLowerCase();
  if (!n || !w) return false;
  if (n === w) return true;
  return shortenWallet(w) === n;
}

export function entryToDisplayPlayer(entry: LeaderboardEntry, opts?: { isYou?: boolean }): DisplayPlayer {
  const visual = getLeaderboardPlayerVisual(entry.wallet_address);
  const clan = clanFromArchetype(visual.archetype);
  const rawName = entry.name?.trim();
  const displayName =
    rawName && !isWalletLikeName(rawName, entry.wallet_address) ? rawName : visual.codename;
  const wins = entry.wins;
  const battles = wins != null ? Math.max(wins, Math.round(wins * 1.42)) : undefined;
  const winRate =
    wins != null && battles
      ? `${Math.min(99, Math.round((wins / battles) * 1000) / 10)}%`
      : undefined;

  return {
    rank: entry.rank,
    name: opts?.isYou ? `${displayName} (YOU)` : displayName,
    avatar: visual.portrait,
    clanName: clan.name,
    clanIconType: clan.type,
    points: Math.round(entry.score).toLocaleString(),
    wins,
    winRate,
    battles,
    wallet: entry.wallet_address,
    isYou: opts?.isYou,
    showHexagon: entry.rank <= 5,
  };
}

export function entriesToDisplayPlayers(
  entries: LeaderboardEntry[],
  walletAddress?: string | null,
): DisplayPlayer[] {
  return entries.map((e) =>
    entryToDisplayPlayer(e, {
      isYou: Boolean(walletAddress && e.wallet_address.toLowerCase() === walletAddress.toLowerCase()),
    }),
  );
}
