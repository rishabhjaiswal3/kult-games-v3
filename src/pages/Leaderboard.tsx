import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Info } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardSidebar } from "@/components/leaderboard/LeaderboardSidebar";
import { LeaderboardTablePanel } from "@/components/leaderboard/LeaderboardTablePanel";
import {
  arenaEntriesToDisplayPlayers,
  arenaEntryToDisplayPlayer,
  type LeaderboardTab,
} from "@/components/leaderboard/leaderboardUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { useEnrichedArenaLeaderboard } from "@/hooks/useEnrichedArenaLeaderboard";

const PAGE_SIZE = 10;

const Leaderboard = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("GLOBAL");
  const [page, setPage] = useState(1);

  // ── Real AI Arena leaderboard data ─────────────────────────────────────────
  const enrichedQ = useEnrichedArenaLeaderboard({ enabled: activeTab === "GLOBAL" });
  const allEntries = enrichedQ.data?.entries ?? [];

  // ── Current user's agents ───────────────────────────────────────────────────
  const myAgentsQ = useMyArenaAgents(1, 50);
  const myAgents  = myAgentsQ.data?.agents ?? [];
  const myAgentIds = useMemo(() => new Set(myAgents.map((a) => a.id)), [myAgents]);
  const firstAgent = myAgents[0] ?? null;

  // ── Sidebar: rank for the first agent ───────────────────────────────────────
  const rankQ = useQuery({
    queryKey: ["aiArenaGateway", "leaderboard", "myRank", firstAgent?.id],
    queryFn:  () => aiArenaGatewayApi.getLeaderboardRankForAgent(firstAgent!.id, "global"),
    enabled:  isAuthenticated && !!firstAgent?.id,
    staleTime: 60_000,
    retry: false,
  });

  // ── Pagination (client-side, enrichedQ fetches 50 at once) ─────────────────
  const totalEntries = allEntries.length;
  const totalPages   = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));

  const pageEntries = useMemo(
    () => allEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allEntries, page],
  );

  // ── Map to DisplayPlayer ────────────────────────────────────────────────────
  const displayPlayers = useMemo(
    () => arenaEntriesToDisplayPlayers(pageEntries, myAgentIds),
    [pageEntries, myAgentIds],
  );

  // Top 3 from the full dataset (only on page 1)
  const top3Entries = allEntries.slice(0, 3);
  const top3: [ReturnType<typeof arenaEntryToDisplayPlayer>, ReturnType<typeof arenaEntryToDisplayPlayer>, ReturnType<typeof arenaEntryToDisplayPlayer>] | null =
    page === 1 && top3Entries.length === 3
      ? [
          arenaEntryToDisplayPlayer(top3Entries[1], { isYou: myAgentIds.has(top3Entries[1].agentId) }),
          arenaEntryToDisplayPlayer(top3Entries[0], { isYou: myAgentIds.has(top3Entries[0].agentId) }),
          arenaEntryToDisplayPlayer(top3Entries[2], { isYou: myAgentIds.has(top3Entries[2].agentId) }),
        ]
      : null;

  // Table rows: page 1 skips top 3 (shown in podium), later pages show all
  const tableRows = page === 1 ? displayPlayers.filter((p) => p.rank > 3) : displayPlayers;

  // Pinned user row if the user's agent appears on a different page
  const userRow = useMemo(() => {
    if (!firstAgent) return null;
    const myEntry = allEntries.find((e) => myAgentIds.has(e.agentId));
    if (!myEntry) return null;
    // Only pin if not already visible in tableRows
    if (tableRows.some((r) => r.wallet === myEntry.agentId)) return null;
    return arenaEntryToDisplayPlayer(myEntry, { isYou: true });
  }, [allEntries, myAgentIds, firstAgent, tableRows]);

  // ── MY RANK tab stats ────────────────────────────────────────────────────────
  const myRank   = rankQ.data?.rank;
  const myElo    = firstAgent?.eloRating ?? 0;
  const myWins   = firstAgent?.wins ?? 0;
  const myLosses = firstAgent?.losses ?? 0;
  const myDraws  = firstAgent?.draws ?? 0;
  const myBattles = myWins + myLosses + myDraws;
  const myWinRate = myBattles > 0 ? `${Math.round((myWins / myBattles) * 100)}%` : "—";

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const sidebarRank   = myRank ?? rankQ.data?.rank;
  const sidebarPoints = myElo;
  const sidebarProgress = sidebarRank != null
    ? Math.min(95, Math.max(5, 100 - Math.log10(sidebarRank + 1) * 30))
    : sidebarPoints > 0 ? 40 : 8;

  const handleTabChange = (tab: LeaderboardTab) => {
    setActiveTab(tab);
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
          {/* Tab strip */}
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

            {/* Page indicator for GLOBAL tab */}
            {activeTab === "GLOBAL" && totalEntries > PAGE_SIZE ? (
              <div className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-widest text-white/40">
                <span>Showing {Math.min(totalEntries, 50)} of {totalEntries} agents</span>
                <ChevronDown className="h-3 w-3 rotate-0" />
              </div>
            ) : null}
          </div>

          {/* MY RANK tab */}
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
                    value: myAgentsQ.isLoading || rankQ.isLoading
                      ? "Loading…"
                      : !firstAgent
                        ? "NO AGENT"
                        : myRank != null ? `#${myRank.toLocaleString()}` : "UNRANKED",
                  },
                  {
                    label: "ELO RATING",
                    value: myAgentsQ.isLoading
                      ? "Loading…"
                      : !firstAgent ? "—" : myElo.toLocaleString(),
                  },
                  {
                    label: "TOTAL BATTLES",
                    value: myAgentsQ.isLoading
                      ? "Loading…"
                      : !firstAgent ? "—" : myBattles.toLocaleString(),
                  },
                ].map((stat) => (
                  <div key={stat.label} className="arena-panel border border-white/8 bg-[#04080f]/95 p-4">
                    <div className="font-tech text-[9px] uppercase tracking-wider text-white/42">{stat.label}</div>
                    <div className="mt-2 text-2xl font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* My agents breakdown */}
              <div className="arena-panel relative overflow-hidden border border-white/8">
                <div className="relative z-10 overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/8 bg-white/[0.01] font-tech text-[10px] uppercase tracking-wider text-white/45">
                        <th className="px-5 py-4 font-semibold">Agent</th>
                        <th className="px-5 py-4 font-semibold text-center">ELO</th>
                        <th className="px-5 py-4 font-semibold text-center">Wins</th>
                        <th className="px-5 py-4 font-semibold text-center">Losses</th>
                        <th className="px-5 py-4 font-semibold text-center">Win Rate</th>
                        <th className="px-5 py-4 font-semibold text-right">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6 font-medium text-white/86">
                      {myAgentsQ.isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center font-tech text-white/45">
                            LOADING YOUR AGENTS…
                          </td>
                        </tr>
                      ) : myAgents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center font-tech text-white/45">
                            CREATE AN AGENT TO START RANKING
                          </td>
                        </tr>
                      ) : (
                        myAgents.map((agent) => {
                          const w = agent.wins ?? 0;
                          const l = agent.losses ?? 0;
                          const d = agent.draws ?? 0;
                          const total = w + l + d;
                          const wr = total > 0 ? `${Math.round((w / total) * 100)}%` : "—";
                          return (
                            <tr key={agent.id} className="transition hover:bg-white/[0.02]">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-white">{agent.name}</div>
                                <div className="mt-0.5 font-tech text-[10px] text-white/40 uppercase">
                                  {agent.archetype} · {agent.clan}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center font-semibold text-[#b95cff]">
                                {(agent.eloRating ?? 1000).toLocaleString()}
                              </td>
                              <td className="px-5 py-4 text-center text-emerald-400">{w}</td>
                              <td className="px-5 py-4 text-center text-red-400/70">{l}</td>
                              <td className="px-5 py-4 text-center">{wr}</td>
                              <td className="px-5 py-4 text-right font-tech text-[10px] uppercase text-white/50">
                                {agent.evolutionStage ?? "GENESIS"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* GLOBAL tab */
            <>
              {page === 1 && top3 ? (
                <LeaderboardPodium top3={top3} />
              ) : null}

              <LeaderboardTablePanel
                rows={tableRows}
                userRow={userRow}
                page={page}
                totalPages={totalPages}
                isLoading={enrichedQ.isLoading}
                onPageChange={setPage}
              />

              <div className="flex items-center gap-2.5 rounded border border-blue-900/30 bg-[#0a101f] px-4 py-3 text-[11px] font-medium text-blue-400/90">
                <Info className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Leaderboard shows ELO ratings — updated after every battle.</span>
              </div>
            </>
          )}
        </div>

        <LeaderboardSidebar
          userRank={sidebarRank}
          userPoints={sidebarPoints}
          seasonProgress={sidebarProgress}
        />
      </div>
    </div>
  );
};

export default Leaderboard;
