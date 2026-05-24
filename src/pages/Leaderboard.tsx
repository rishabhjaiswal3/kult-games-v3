import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Info } from "lucide-react";
import { gamesApi } from "@/api/gamesApi";
import { leaderboardApi } from "@/api/leaderboardApi";
import { playerApi } from "@/api/playerApi";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardSidebar } from "@/components/leaderboard/LeaderboardSidebar";
import { LeaderboardTablePanel } from "@/components/leaderboard/LeaderboardTablePanel";
import {
  entriesToDisplayPlayers,
  entryToDisplayPlayer,
  type LeaderboardTab,
} from "@/components/leaderboard/leaderboardUtils";
import { useAuth } from "@/contexts/AuthContext";
import { getGameName } from "@/lib/gameDisplay";

const PAGE_SIZE = 10;
const GLOBAL_KEY = "global";

function gameOptionLabel(name: unknown, fallbackId: string): string {
  if (typeof name === "string" && name.trim()) return name.trim().toUpperCase();
  if (name && typeof name === "object" && "en" in name) {
    const en = (name as { en?: string }).en;
    if (en?.trim()) return en.trim().toUpperCase();
  }
  return fallbackId.replace(/-/g, " ").toUpperCase();
}

function normalizeGameIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function fallbackGameLabel(gameId: string): string {
  return gameId.replace(/[_-]+/g, " ").trim().toUpperCase();
}

const Leaderboard = () => {
  const { walletAddress, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("GLOBAL");
  const [selectedGameId, setSelectedGameId] = useState<string>(GLOBAL_KEY);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: gamesData } = useQuery({
    queryKey: ["games", "all", "leaderboard-picker"],
    queryFn: () => gamesApi.getAll(1, 30),
    staleTime: 5 * 60_000,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["player", "full-profile", "leaderboard"],
    queryFn: () => playerApi.getFullProfile(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const gameOptions = useMemo(() => {
    const games = gamesData?.games ?? [];
    return [
      { id: GLOBAL_KEY, label: "ALL GAMES" },
      ...games.map((g) => ({
        id: g.identification ?? g.slug ?? g._id,
        label: gameOptionLabel(g.name, g.identification ?? g.slug ?? "game"),
      })),
    ];
  }, [gamesData]);

  const gameNameMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const game of gamesData?.games ?? []) {
      const label = getGameName(game.name).trim().toUpperCase();
      if (!label) continue;

      for (const key of [game.identification, game.slug, game._id]) {
        if (!key) continue;
        map.set(normalizeGameIdentifier(key), label);
      }
    }

    return map;
  }, [gamesData]);

  const selectedLabel =
    gameOptions.find((g) => g.id === selectedGameId)?.label ?? "ALL GAMES";

  const activeWalletAddress = isAuthenticated ? walletAddress : null;

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", selectedGameId, page, PAGE_SIZE, activeTab],
    queryFn: async () => {
      if (selectedGameId === GLOBAL_KEY) {
        return leaderboardApi.getGlobal(page, PAGE_SIZE);
      }
      return leaderboardApi.getByGame(selectedGameId, page, PAGE_SIZE);
    },
    enabled: activeTab === "GLOBAL",
    staleTime: 60_000,
  });

  const playersRaw = data?.entries ?? [];
  const players = playersRaw.slice(0, PAGE_SIZE);
  const total = data?.total ?? players.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const displayPlayers = entriesToDisplayPlayers(players, activeWalletAddress);
  const tableRows = page === 1 ? displayPlayers.slice(3) : displayPlayers;

  const top3: ReturnType<typeof entriesToDisplayPlayers> | null =
    page === 1 && players.length >= 3
      ? entriesToDisplayPlayers([players[1], players[0], players[2]], activeWalletAddress)
      : null;

  const userEntry = activeWalletAddress
    ? players.find((p) => p.wallet_address.toLowerCase() === activeWalletAddress.toLowerCase())
    : undefined;
  const userRow = userEntry ? entryToDisplayPlayer(userEntry, { isYou: true }) : null;
  const showPinnedUserRow = Boolean(
    userRow && !tableRows.some((r) => r.wallet.toLowerCase() === userRow.wallet.toLowerCase()),
  );

  const userPoints = profile?.totalScore ?? (userEntry ? Math.round(userEntry.score) : 0);
  const userRank = profile?.rank ?? userEntry?.rank;

  const myRankRows = useMemo(() => {
    if (!profile) return [];

    const gameRows = profile.gameScoresList
      .map((row) => {
        const normalizedId = normalizeGameIdentifier(row.identification);
        return {
          id: row.identification,
          label: gameNameMap.get(normalizedId) ?? fallbackGameLabel(row.identification),
          rank: row.rank,
          score: row.score,
          weightedScore: row.weightedScore,
          isGlobal: false,
        };
      })
      .sort((a, b) => {
        if (a.rank == null && b.rank == null) return b.weightedScore - a.weightedScore;
        if (a.rank == null) return 1;
        if (b.rank == null) return -1;
        return a.rank - b.rank;
      });

    return [
      {
        id: GLOBAL_KEY,
        label: "ALL GAMES",
        rank: profile.rank,
        score: profile.totalScore,
        weightedScore: profile.totalScore,
        isGlobal: true,
      },
      ...gameRows,
    ];
  }, [gameNameMap, profile]);

  const handleTabChange = (tab: LeaderboardTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleGameChange = (gameId: string) => {
    setSelectedGameId(gameId);
    setIsDropdownOpen(false);
    setPage(1);
  };

  return (
    <div className="min-w-0 mx-auto w-full px-4 py-5 sm:px-6 lg:px-8 max-w-[1284px]">
      <div className="mb-6">
        <h1 className="font-tech text-3xl font-bold uppercase tracking-tight">LEADERBOARD</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Compete with the best and climb your way to the top.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_332px]">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-col justify-between gap-4 border-b border-white/8 pb-3 sm:flex-row sm:items-center">
            <div className="flex gap-6 font-tech text-[12px] font-bold uppercase tracking-wider">
              {(["GLOBAL", "MY RANK"] as LeaderboardTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`relative py-1.5 transition ${
                    activeTab === tab ? "text-white" : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {tab}
                  {activeTab === tab ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#9a35ff] shadow-[0_0_10px_#9a35ff]" />
                  ) : null}
                </button>
              ))}
            </div>

            {activeTab === "GLOBAL" ? (
              <div className="flex items-center gap-3">
                <span className="font-tech text-[10px] uppercase tracking-widest text-white/45">
                  GAME MODE
                </span>
                <div className="relative text-left">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 rounded border border-white/8 bg-white/[0.02] px-4 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-white/[0.05]"
                    aria-expanded={isDropdownOpen}
                  >
                    <span className="max-w-[12rem] truncate">{selectedLabel}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-white/50 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isDropdownOpen ? (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} aria-hidden />
                      <div className="absolute right-0 z-50 mt-1.5 w-56 rounded border border-white/10 bg-[#090e19] p-1 shadow-2xl">
                        {gameOptions.map((game) => (
                          <button
                            key={game.id}
                            type="button"
                            onClick={() => handleGameChange(game.id)}
                            className={`flex w-full rounded px-3 py-2 text-left font-tech text-[9px] font-semibold uppercase tracking-wider transition ${
                              selectedGameId === game.id
                                ? "bg-[#9a35ff]/20 text-[#c78aff]"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {game.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {activeTab === "MY RANK" && !isAuthenticated ? (
            <div className="arena-panel border border-white/8 px-6 py-14 text-center">
              <p className="font-tech text-sm uppercase tracking-wider text-[#b95cff]">
                Connect wallet to see your rank
              </p>
            </div>
          ) : activeTab === "MY RANK" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "GLOBAL RANK",
                    value: profile?.rank != null ? `#${profile.rank}` : profileLoading ? "Loading…" : "UNRANKED",
                  },
                  {
                    label: "TOTAL SCORE",
                    value: profile ? Math.round(profile.totalScore).toLocaleString() : profileLoading ? "Loading…" : "0",
                  },
                  {
                    label: "RANKED GAMES",
                    value: profile ? String(profile.gameScoresList.length) : profileLoading ? "Loading…" : "0",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="arena-panel border border-white/8 bg-[#04080f]/95 p-4">
                    <div className="font-tech text-[9px] uppercase tracking-wider text-white/42">{stat.label}</div>
                    <div className="mt-2 text-2xl font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="arena-panel relative overflow-hidden border border-white/8">
                <div className="relative z-10 overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/8 bg-white/[0.01] font-tech text-[10px] uppercase tracking-wider text-white/45">
                        <th className="px-5 py-4 font-semibold">Mode</th>
                        <th className="px-5 py-4 font-semibold text-center">Rank</th>
                        <th className="px-5 py-4 font-semibold text-right">Score</th>
                        <th className="px-5 py-4 font-semibold text-right">Weighted Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6 font-medium text-white/86">
                      {profileLoading ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-16 text-center font-tech text-white/45">
                            LOADING YOUR RANKS…
                          </td>
                        </tr>
                      ) : myRankRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-16 text-center font-tech text-white/45">
                            NO RANK DATA YET
                          </td>
                        </tr>
                      ) : (
                        myRankRows.map((row) => (
                          <tr
                            key={row.id}
                            className={row.isGlobal ? "bg-[#9a35ff]/8 text-white" : "transition hover:bg-white/[0.02]"}
                          >
                            <td className="px-5 py-4 font-tech text-[11px] uppercase tracking-wider">
                              {row.label}
                            </td>
                            <td className="px-5 py-4 text-center font-semibold">
                              {row.rank != null ? `#${row.rank}` : "UNRANKED"}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {Math.round(row.score).toLocaleString()}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {row.weightedScore.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {page === 1 && top3?.length === 3 ? (
                <LeaderboardPodium
                  top3={[top3[0], top3[1], top3[2]]}
                />
              ) : null}

              <LeaderboardTablePanel
                rows={tableRows}
                userRow={showPinnedUserRow ? userRow : null}
                page={page}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={setPage}
              />

              <div className="flex items-center gap-2.5 rounded border border-blue-900/30 bg-[#0a101f] px-4 py-3 text-[11px] font-medium text-blue-400/90">
                <Info className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Leaderboards are updated every 10 minutes.</span>
              </div>
            </>
          )}
        </div>

        <LeaderboardSidebar
          userRank={userRank}
          userPoints={userPoints}
          seasonProgress={
            userRank != null ? Math.min(95, 35 + (100 - userRank) * 0.5) : userPoints > 0 ? 40 : 12
          }
        />
      </div>
    </div>
  );
};

export default Leaderboard;
