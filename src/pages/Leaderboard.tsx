import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Info } from "lucide-react";
import { gamesApi } from "@/api/gamesApi";
import { leaderboardApi } from "@/api/leaderboardApi";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardSidebar } from "@/components/leaderboard/LeaderboardSidebar";
import { LeaderboardTablePanel } from "@/components/leaderboard/LeaderboardTablePanel";
import {
  entriesToDisplayPlayers,
  entryToDisplayPlayer,
  type LeaderboardTab,
} from "@/components/leaderboard/leaderboardUtils";
import { useAuth } from "@/contexts/AuthContext";

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

  const selectedLabel =
    gameOptions.find((g) => g.id === selectedGameId)?.label ?? "ALL GAMES";

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", selectedGameId, page, PAGE_SIZE, activeTab],
    queryFn: async () => {
      if (activeTab === "FRIENDS") {
        return { entries: [], total: 0, page: 1, limit: PAGE_SIZE };
      }
      if (selectedGameId === GLOBAL_KEY) {
        return leaderboardApi.getGlobal(page, PAGE_SIZE);
      }
      return leaderboardApi.getByGame(selectedGameId, page, PAGE_SIZE);
    },
    staleTime: 60_000,
  });

  const playersRaw = data?.entries ?? [];
  const players = playersRaw.slice(0, PAGE_SIZE);
  const total = data?.total ?? players.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const displayPlayers = entriesToDisplayPlayers(players, walletAddress);
  const tableRows = page === 1 ? displayPlayers.slice(3) : displayPlayers;

  const top3: ReturnType<typeof entriesToDisplayPlayers> | null =
    page === 1 && players.length >= 3
      ? entriesToDisplayPlayers([players[1], players[0], players[2]], walletAddress)
      : null;

  const userEntry = walletAddress
    ? players.find((p) => p.wallet_address.toLowerCase() === walletAddress.toLowerCase())
    : undefined;
  const userRow = userEntry ? entryToDisplayPlayer(userEntry, { isYou: true }) : null;
  const showPinnedUserRow = Boolean(
    userRow && !tableRows.some((r) => r.wallet.toLowerCase() === userRow.wallet.toLowerCase()),
  );

  const userPoints = userEntry ? Math.round(userEntry.score) : 0;
  const userRank = userEntry?.rank;

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
    <div className="min-w-0">
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
              {(["GLOBAL", "FRIENDS", "MY RANK"] as LeaderboardTab[]).map((tab) => (
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
          </div>

          {activeTab === "FRIENDS" ? (
            <div className="arena-panel border border-white/8 px-6 py-14 text-center">
              <p className="font-tech text-sm uppercase tracking-wider text-white/55">
                Friends leaderboard coming soon
              </p>
              <p className="mt-2 text-xs text-white/40">Connect with pilots you follow to compare ranks.</p>
            </div>
          ) : activeTab === "MY RANK" && !isAuthenticated ? (
            <div className="arena-panel border border-white/8 px-6 py-14 text-center">
              <p className="font-tech text-sm uppercase tracking-wider text-[#b95cff]">
                Connect wallet to see your rank
              </p>
            </div>
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
