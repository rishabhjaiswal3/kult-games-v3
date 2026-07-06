import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Info } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { leaderboardApi } from "@/api/leaderboardApi";
import { playerApi } from "@/api/playerApi";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardSidebar } from "@/components/leaderboard/LeaderboardSidebar";
import { LeaderboardTablePanel } from "@/components/leaderboard/LeaderboardTablePanel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  arenaEntriesToDisplayPlayers,
  arenaEntryToDisplayPlayer,
  entriesToDisplayPlayers,
  type DisplayPlayer,
  type LeaderboardTab,
} from "@/components/leaderboard/leaderboardUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { useEnrichedArenaLeaderboard } from "@/hooks/useEnrichedArenaLeaderboard";
import { RANKS, getRankFromElo } from "@/utils/rankSystem";

const PAGE_SIZE = 10;
type LeaderboardMode = "KULT_POINTS" | "AI_ARENA";
type LeaderboardPeriod = "all_time" | "weekly" | "monthly";

const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "weekly", label: "WEEKLY" },
  { value: "monthly", label: "MONTHLY" },
  { value: "all_time", label: "ALL TIME" },
];

const Leaderboard = () => {
  const { isAuthenticated, walletAddress } = useAuth();
  const [activeMode, setActiveMode] = useState<LeaderboardMode>("KULT_POINTS");
  const [activeKultTab, setActiveKultTab] = useState<LeaderboardTab>("GLOBAL");
  const [activeArenaTab, setActiveArenaTab] = useState<LeaderboardTab>("GLOBAL");
  const [kultPage, setKultPage] = useState(1);
  const [arenaPage, setArenaPage] = useState(1);
  const [selectedLeagueTier, setSelectedLeagueTier] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>("all_time");

  // ── KULT backend leaderboard data ───────────────────────────────────────────
  const kultLeaderboardQ = useQuery({
    queryKey: ["kult", "leaderboard", "global", kultPage, selectedPeriod],
    queryFn: () => leaderboardApi.getGlobal(kultPage, PAGE_SIZE, selectedPeriod),
    enabled: activeMode === "KULT_POINTS" && activeKultTab === "GLOBAL",
    staleTime: 60_000,
  });

  const kultProfileQ = useQuery({
    queryKey: ["kult", "player", "fullProfile"],
    queryFn: () => playerApi.getFullProfile(),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  });

  const kultEntries = kultLeaderboardQ.data?.entries ?? [];
  const kultRows = useMemo(
    () => entriesToDisplayPlayers(kultEntries, walletAddress),
    [kultEntries, walletAddress],
  );
  const kultTotalPages = Math.max(1, kultLeaderboardQ.data?.totalPages ?? 1);
  const kultTop3Rows = useMemo(
    () => entriesToDisplayPlayers(kultEntries.slice(0, 3), walletAddress),
    [kultEntries, walletAddress],
  );
  const kultTop3: [DisplayPlayer, DisplayPlayer, DisplayPlayer] | null =
    kultPage === 1 && kultTop3Rows.length === 3
      ? [kultTop3Rows[1]!, kultTop3Rows[0]!, kultTop3Rows[2]!]
      : null;
  const kultTableRows = kultPage === 1 ? kultRows.filter((p) => p.rank > 3) : kultRows;
  const kultUserRow = useMemo(() => {
    if (!walletAddress) return null;
    const current = kultRows.find((row) => row.wallet.toLowerCase() === walletAddress.toLowerCase());
    if (!current || kultTableRows.some((row) => row.wallet.toLowerCase() === walletAddress.toLowerCase())) return null;
    return current;
  }, [kultRows, kultTableRows, walletAddress]);
  const kultProfile = kultProfileQ.data;
  const kultSidebarRank = kultProfile?.kultPointsRank ?? kultProfile?.rank ?? kultUserRow?.rank;
  const kultSidebarPoints = kultProfile?.kultPoints ?? Number(kultUserRow?.kultPoints?.replace(/,/g, "") ?? 0);

  // ── Real AI Arena leaderboard data ─────────────────────────────────────────
  const enrichedQ = useEnrichedArenaLeaderboard({ enabled: activeMode === "AI_ARENA" && activeArenaTab === "GLOBAL", period: selectedPeriod });
  // TEMP DEMO: hardcoded OKX clan entry so the golden OKX card/row is visible even
  // while the gateway 500s on the OKX ClanType enum. Remove when backend is fixed.
  const DEMO_OKX_ENTRY: AiArenaLeaderboardEntry = {
    rank: 1,
    agentId: "okx-demo-agent",
    score: 1842,
    eloRating: 1842,
    name: "OKX Vanguard",
    clan: "OKX",
    archetype: "BERSERKER",
    wins: 27,
    losses: 5,
    draws: 0,
  };
  const allEntries = [DEMO_OKX_ENTRY, ...(enrichedQ.data?.entries ?? [])];

  // ── Current user's agents ───────────────────────────────────────────────────
  const myAgentsQ = useMyArenaAgents(1, 50);
  const myAgents = myAgentsQ.data?.agents ?? [];
  const myAgentIds = useMemo(() => new Set(myAgents.map((a) => a.id)), [myAgents]);
  const firstAgent = myAgents[0] ?? null;

  // ── Sidebar: rank for the first agent ───────────────────────────────────────
  const rankQ = useQuery({
    queryKey: ["aiArenaGateway", "leaderboard", "myRank", firstAgent?.id],
    queryFn: () => aiArenaGatewayApi.getLeaderboardRankForAgent(firstAgent!.id, "global"),
    enabled: isAuthenticated && !!firstAgent?.id,
    staleTime: 60_000,
    retry: false,
  });

  // ── League filter ────────────────────────────────────────────────────────────
  const leagueFilteredEntries = useMemo(() => {
    if (selectedLeagueTier === null) return allEntries;
    const leagueRank = RANKS.find((r) => r.tier === selectedLeagueTier);
    if (!leagueRank) return allEntries;
    return allEntries
      .filter((e) => {
        const elo = Math.round(e.eloRating ?? e.score ?? 0);
        return elo >= leagueRank.minElo && (leagueRank.maxElo === null || elo <= leagueRank.maxElo);
      })
      .map((e, idx) => ({ ...e, rank: idx + 1 })); // re-rank within league
  }, [allEntries, selectedLeagueTier]);

  // ── Pagination (client-side) ─────────────────────────────────────────────────
  const totalEntries = leagueFilteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));

  const pageEntries = useMemo(
    () => leagueFilteredEntries.slice((arenaPage - 1) * PAGE_SIZE, arenaPage * PAGE_SIZE),
    [leagueFilteredEntries, arenaPage],
  );

  // ── Map to DisplayPlayer ────────────────────────────────────────────────────
  const displayPlayers = useMemo(
    () => arenaEntriesToDisplayPlayers(pageEntries, myAgentIds),
    [pageEntries, myAgentIds],
  );

  // Top 3 from the filtered dataset (only on page 1)
  const top3Entries = leagueFilteredEntries.slice(0, 3);
  const top3: [ReturnType<typeof arenaEntryToDisplayPlayer>, ReturnType<typeof arenaEntryToDisplayPlayer>, ReturnType<typeof arenaEntryToDisplayPlayer>] | null =
    arenaPage === 1 && top3Entries.length === 3
      ? [
        arenaEntryToDisplayPlayer(top3Entries[1], { isYou: myAgentIds.has(top3Entries[1].agentId) }),
        arenaEntryToDisplayPlayer(top3Entries[0], { isYou: myAgentIds.has(top3Entries[0].agentId) }),
        arenaEntryToDisplayPlayer(top3Entries[2], { isYou: myAgentIds.has(top3Entries[2].agentId) }),
      ]
      : null;

  // Table rows: page 1 skips top 3 (shown in podium), later pages show all
  const tableRows = arenaPage === 1 && top3 ? displayPlayers.filter((p) => p.rank > 3) : displayPlayers;

  // Pinned user row if the user's agent appears on a different page
  const userRow = useMemo(() => {
    if (!firstAgent) return null;
    const myEntry = leagueFilteredEntries.find((e) => myAgentIds.has(e.agentId));
    if (!myEntry) return null;
    if (tableRows.some((r) => r.wallet === myEntry.agentId)) return null;
    return arenaEntryToDisplayPlayer(myEntry, { isYou: true });
  }, [leagueFilteredEntries, myAgentIds, firstAgent, tableRows]);

  // ── MY RANK tab stats ────────────────────────────────────────────────────────
  const myRank = rankQ.data?.rank;
  const myElo = firstAgent?.eloRating ?? 0;
  const myWins = firstAgent?.wins ?? 0;
  const myLosses = firstAgent?.losses ?? 0;
  const myDraws = firstAgent?.draws ?? 0;
  const myBattles = myWins + myLosses + myDraws;
  const myWinRate = myBattles > 0 ? `${Math.round((myWins / myBattles) * 100)}%` : "—";
  const myLeague = myElo > 0 ? getRankFromElo(myElo) : null;

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const sidebarRank = myRank ?? rankQ.data?.rank;
  const sidebarPoints = myElo;
  const sidebarProgress = sidebarRank != null
    ? Math.min(95, Math.max(5, 100 - Math.log10(sidebarRank + 1) * 30))
    : sidebarPoints > 0 ? 40 : 8;

  const handleModeChange = (mode: LeaderboardMode) => {
    setActiveMode(mode);
    setKultPage(1);
    setArenaPage(1);
  };

  const handleKultTabChange = (tab: LeaderboardTab) => {
    setActiveKultTab(tab);
    setKultPage(1);
  };

  const handleArenaTabChange = (tab: LeaderboardTab) => {
    setActiveArenaTab(tab);
    setArenaPage(1);
  };

  const handleLeagueChange = (tier: number | null) => {
    setSelectedLeagueTier(tier);
    setArenaPage(1);
  };

  const handlePeriodChange = (period: LeaderboardPeriod) => {
    setSelectedPeriod(period);
    setKultPage(1);
    setArenaPage(1);
  };

  const selectedLeagueInfo = selectedLeagueTier !== null
    ? RANKS.find((r) => r.tier === selectedLeagueTier) ?? null
    : null;

  return (
    <div className="min-w-0 mx-auto w-full px-4 py-5 sm:px-6 lg:px-8 max-w-full">
      <div className="mb-6">
        <h1 className="font-tech text-3xl font-bold uppercase tracking-tight">LEADERBOARD</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Track KULT game points and AI Arena rankings without mixing the two systems.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-white/8 bg-black/20 p-1.5" data-tour="leaderboard-mode-switch">
        {([
          ["KULT_POINTS", "KULT POINTS"],
          ["AI_ARENA", "AI ARENA"],
        ] as const).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
            className={`rounded-xl px-4 py-2 font-tech text-[11px] font-bold uppercase tracking-wider transition ${activeMode === mode
              ? "bg-[#9a35ff]/20 text-white shadow-[0_0_14px_rgba(154,53,255,0.16)]"
              : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_332px]">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-col justify-between gap-4 border-b border-white/8 pb-3 sm:flex-row sm:items-center" data-tour="leaderboard-tabs-filters">
            <div className="flex gap-6 font-tech text-[12px] font-bold uppercase tracking-wider">
              {(["GLOBAL", ...(isAuthenticated ? ["MY RANK"] : [])] as LeaderboardTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => activeMode === "KULT_POINTS" ? handleKultTabChange(tab) : handleArenaTabChange(tab)}
                  className={`relative py-1.5 transition ${(activeMode === "KULT_POINTS" ? activeKultTab : activeArenaTab) === tab
                    ? "text-white"
                    : "text-white/45 hover:text-white/80"
                    }`}
                >
                  {tab}
                  {(activeMode === "KULT_POINTS" ? activeKultTab : activeArenaTab) === tab ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#9a35ff] shadow-[0_0_10px_#9a35ff]" />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Period filter — on GLOBAL tab for both modes */}
              {(activeMode === "KULT_POINTS" ? activeKultTab : activeArenaTab) === "GLOBAL" ? (
                <div className="flex items-center gap-2">
                  <span className="font-tech text-[10px] uppercase tracking-widest text-white/35">Period</span>
                  <div className="relative">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => handlePeriodChange(e.target.value as LeaderboardPeriod)}
                      className="peer appearance-none cursor-pointer rounded-lg border border-white/12 bg-[#04080f] py-2 pl-3 pr-8 font-tech text-[11px] uppercase tracking-wider text-white/80 transition hover:border-[#9a35ff]/40 hover:text-white focus:outline-none focus:border-[#9a35ff]/60 focus:ring-1 focus:ring-[#9a35ff]/40"
                    >
                      {PERIOD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/40 transition peer-hover:text-[#b95cff]/80 peer-focus:rotate-180" />
                  </div>
                </div>
              ) : null}

              {/* League filter — only on GLOBAL tab */}
              {activeMode === "AI_ARENA" && activeArenaTab === "GLOBAL" ? (
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                  <span className="font-tech text-[10px] uppercase tracking-widest text-white/35">League</span>
                  <div className="relative min-w-0 flex-1 sm:flex-none">
                    <select
                      value={selectedLeagueTier ?? ""}
                      onChange={(e) =>
                        handleLeagueChange(e.target.value === "" ? null : Number(e.target.value))
                      }
                      className="peer w-full appearance-none cursor-pointer rounded-lg border border-white/12 bg-[#04080f] py-2 pl-3 pr-8 font-tech text-[11px] uppercase tracking-wider text-white/80 transition hover:border-[#9a35ff]/40 hover:text-white focus:outline-none focus:border-[#9a35ff]/60 focus:ring-1 focus:ring-[#9a35ff]/40 sm:w-auto"
                      style={
                        selectedLeagueInfo
                          ? { borderColor: `${selectedLeagueInfo.color}55`, color: selectedLeagueInfo.color }
                          : {}
                      }
                    >
                      <option value="">ALL LEAGUES</option>
                      {RANKS.map((r) => (
                        <option key={r.tier} value={r.tier}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/40 transition peer-hover:text-[#b95cff]/80 peer-focus:rotate-180" />
                  </div>

                  {/* Selected league badge */}
                  {selectedLeagueInfo ? (
                    <div className="flex min-w-[96px] items-center justify-center gap-1 rounded border border-white/10 bg-white/[0.02] px-1.5 py-1 sm:min-w-0 sm:justify-start sm:gap-1.5 sm:px-2">
                      <img src={selectedLeagueInfo.image} alt="" className="h-5 w-5 object-contain" />
                      <span
                        className="whitespace-nowrap font-tech text-[9px] uppercase tracking-wide sm:text-[10px] sm:tracking-wider"
                        style={{ color: selectedLeagueInfo.color }}
                      >
                        {totalEntries} agent{totalEntries !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div data-tour="leaderboard-rankings">
            {activeMode === "KULT_POINTS" && activeKultTab === "MY RANK" && !isAuthenticated ? (
              <div className="arena-panel border border-white/8 px-6 py-14 text-center">
                <p className="font-tech text-sm uppercase tracking-wider text-[#b95cff]">
                  Connect wallet to see your rank
                </p>
              </div>
            ) : activeMode === "KULT_POINTS" && activeKultTab === "MY RANK" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: "KP RANK",
                      value: kultProfileQ.isLoading
                        ? null
                        : (kultProfile?.kultPointsRank ?? kultProfile?.rank) != null
                          ? `#${(kultProfile?.kultPointsRank ?? kultProfile?.rank)!.toLocaleString()}`
                          : "UNRANKED",
                    },
                    {
                      label: "SCORE",
                      value: kultProfileQ.isLoading
                        ? null
                        : (kultProfile?.totalScore ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 }),
                    },
                    {
                      label: "KULT POINTS",
                      value: kultProfileQ.isLoading
                        ? null
                        : (kultProfile?.kultPoints ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 }),
                    },
                    {
                      label: "GAMES RANKED",
                      value: kultProfileQ.isLoading ? null : (kultProfile?.gameScoresList.length ?? 0).toLocaleString(),
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="arena-panel border border-white/8 bg-[#04080f]/95 p-4">
                      <div className="font-tech text-[9px] uppercase tracking-wider text-white/42">{stat.label}</div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {stat.value ?? <Skeleton className="h-7 w-16 bg-white/8" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 rounded border border-blue-900/30 bg-[#0a101f] px-4 py-3 text-[11px] font-medium text-blue-400/90">
                  <Info className="h-4 w-4 shrink-0 text-blue-400" />
                  {/* <span>
                    KULT Points currently read from the existing KULT backend leaderboard/profile data. Ledger-backed KP can replace this data source when the backend KP module is ready.
                  </span> */}
                </div>
              </>
            ) : activeMode === "KULT_POINTS" ? (
              <>
                {kultPage === 1 && kultTop3 ? (
                  <LeaderboardPodium top3={kultTop3} pointLabel="KP" showLeagueBadge={false} showKultScoreColumns />
                ) : null}

                <LeaderboardTablePanel
                  rows={kultTableRows}
                  userRow={kultUserRow}
                  page={kultPage}
                  totalPages={kultTotalPages}
                  isLoading={kultLeaderboardQ.isLoading}
                  onPageChange={setKultPage}
                  pointLabel="KP"
                  showPerformanceColumns={false}
                  showLeagueColumn={false}
                  showKultScoreColumns
                />
              </>
            ) : activeArenaTab === "MY RANK" && !isAuthenticated ? (
              <div className="arena-panel border border-white/8 px-6 py-14 text-center">
                <p className="font-tech text-sm uppercase tracking-wider text-[#b95cff]">
                  Connect wallet to see your AI Arena rank
                </p>
              </div>
            ) : activeArenaTab === "MY RANK" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "GLOBAL RANK",
                      value: myAgentsQ.isLoading || rankQ.isLoading
                        ? null
                        : !firstAgent
                          ? "NO AGENT"
                          : myRank != null ? `#${myRank.toLocaleString()}` : "UNRANKED",
                    },
                    {
                      label: "ELO RATING",
                      value: myAgentsQ.isLoading
                        ? null
                        : !firstAgent ? "-" : myElo.toLocaleString(),
                    },
                    {
                      label: "TOTAL BATTLES",
                      value: myAgentsQ.isLoading
                        ? null
                        : !firstAgent ? "-" : myBattles.toLocaleString(),
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="arena-panel border border-white/8 bg-[#04080f]/95 p-4">
                      <div className="font-tech text-[9px] uppercase tracking-wider text-white/42">{stat.label}</div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {stat.value ?? <Skeleton className="h-7 w-16 bg-white/8" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* League badge for MY RANK */}
                {myLeague && firstAgent ? (
                  <div
                    className="flex items-center gap-4 rounded border bg-[#04080f]/80 px-4 py-3"
                    style={{ borderColor: `${myLeague.color}33` }}
                  >
                    <img src={myLeague.image} alt={myLeague.name} className="h-12 w-12 object-contain" />
                    <div>
                      <div className="font-tech text-[9px] uppercase tracking-widest text-white/40">Current League</div>
                      <div className="mt-0.5 font-tech text-sm font-bold" style={{ color: myLeague.color }}>
                        {myLeague.name}
                      </div>
                      <div className="mt-0.5 text-[10px] text-white/45">
                        {myElo.toLocaleString()} ELO
                        {myLeague.maxElo
                          ? ` · ${(myLeague.maxElo - myElo + 1).toLocaleString()} to next tier`
                          : " · MAX TIER"}
                      </div>
                    </div>
                  </div>
                ) : null}

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
                          <th className="px-5 py-4 font-semibold text-center">League</th>
                          <th className="px-5 py-4 font-semibold text-right">Stage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6 font-medium text-white/86">
                        {myAgentsQ.isLoading ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-16 text-center font-tech text-white/45">
                              LOADING YOUR AGENTS...
                            </td>
                          </tr>
                        ) : myAgents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-16 text-center font-tech text-white/45">
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
                            const agentElo = agent.eloRating ?? 1000;
                            const agentLeague = getRankFromElo(agentElo);
                            return (
                              <tr key={agent.id} className="transition hover:bg-white/[0.02]">
                                <td className="px-5 py-4">
                                  <div className="font-semibold text-white">{agent.name}</div>
                                  <div className="mt-0.5 font-tech text-[10px] text-white/40 uppercase">
                                    {agent.archetype} · {agent.clan}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-center font-semibold text-[#b95cff]">
                                  {agentElo.toLocaleString()}
                                </td>
                                <td className="px-5 py-4 text-center text-emerald-400">{w}</td>
                                <td className="px-5 py-4 text-center text-red-400/70">{l}</td>
                                <td className="px-5 py-4 text-center">{wr}</td>
                                <td className="px-5 py-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <img
                                      src={agentLeague.image}
                                      alt={agentLeague.name}
                                      title={agentLeague.name}
                                      className="h-6 w-6 object-contain"
                                    />
                                    <span
                                      className="font-tech text-[9px] uppercase"
                                      style={{ color: agentLeague.color }}
                                    >
                                      {agentLeague.shortName}
                                    </span>
                                  </div>
                                </td>
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
                {arenaPage === 1 && top3 ? (
                  <LeaderboardPodium top3={top3} />
                ) : null}

                <LeaderboardTablePanel
                  rows={tableRows}
                  userRow={userRow}
                  page={arenaPage}
                  totalPages={totalPages}
                  isLoading={enrichedQ.isLoading && tableRows.length === 0}
                  onPageChange={setArenaPage}
                />

                <div className="flex items-center gap-2.5 rounded border border-blue-900/30 bg-[#0a101f] px-4 py-3 text-[11px] font-medium text-blue-400/90">
                  <Info className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    {selectedLeagueInfo
                      ? `Showing ${selectedLeagueInfo.name} league — ELO ${selectedLeagueInfo.minElo.toLocaleString()}${selectedLeagueInfo.maxElo ? ` – ${selectedLeagueInfo.maxElo.toLocaleString()}` : "+"}`
                      : "Leaderboard shows ELO ratings — updated after every battle."}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div data-tour="leaderboard-sidebar">
          <LeaderboardSidebar
            userRank={activeMode === "KULT_POINTS" ? kultSidebarRank : sidebarRank}
            userPoints={activeMode === "KULT_POINTS" ? kultSidebarPoints : sidebarPoints}
            seasonProgress={activeMode === "KULT_POINTS" ? 40 : sidebarProgress}
            userElo={activeMode === "AI_ARENA" && myElo > 0 ? myElo : undefined}
            pointLabel={activeMode === "KULT_POINTS" ? "KP" : "ELO"}
            title="Your Rank"
            totalPlayers={
              activeMode === "KULT_POINTS"
                ? kultLeaderboardQ.data?.total
                : allEntries.length > 0
                  ? allEntries.length
                  : undefined
            }
            aboutText=""
            // ?{
            //   activeMode === "KULT_POINTS"
            //     ? "Score reflects weighted game contribution across KULT titles. Kult Points (KP) are ledger-backed balances from verified activity. No token conversion, cash value, or guaranteed reward is implied."
            //     : "Your AI Arena rank uses ELO-style battle data, updated live after every battle. League filters apply only to AI Arena. No token conversion, cash value, or guaranteed reward is implied."
            // }
          />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
