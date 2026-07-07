import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { arenaChainApi, zeroGExplorer } from "@/api/arenaChainApi";
import { useAuth } from "@/contexts/AuthContext";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { getRankFromElo } from "@/utils/rankSystem";

type BalancePanelProps = {
  agent: AiArenaAgent | null;
};

function formatArenaBalance(value?: string | number | null) {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (num == null || !Number.isFinite(num)) return "—";
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BalancePanel({ agent }: BalancePanelProps) {
  const { walletAddress } = useAuth();

  const walletQ = useQuery({
    queryKey: ["arenaChain", "dashboard", "walletBalance", walletAddress],
    queryFn: () => arenaChainApi.getWalletBalance(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });

  const rankQ = useQuery({
    queryKey: ["aiArenaGateway", "dashboard", "agentRank", agent?.id],
    queryFn: () => aiArenaGatewayApi.getLeaderboardRankForAgent(agent!.id, "global"),
    enabled: !!agent?.id,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });

  const totalAgentsQ = useQuery({
    queryKey: ["aiArenaGateway", "dashboard", "agentRosterTotal"],
    queryFn: () => aiArenaGatewayApi.listAgents(1, 1),
    enabled: !!agent?.id,
    staleTime: 60_000,
    retry: 1,
  });

  const balance = walletQ.data?.balanceArena;
  const rank = rankQ.data?.rank;
  const totalAgents = totalAgentsQ.data?.total;
  const topPercent =
    rank && totalAgents && totalAgents > 0 ? Math.max(1, Math.ceil((rank / totalAgents) * 100)) : null;
  // Use agent eloRating directly (always present on AiArenaAgent) for league badge
  const agentElo = agent?.eloRating ?? null;
  const leagueInfo = agentElo != null ? getRankFromElo(agentElo) : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      <section className="arena-panel relative min-h-[84px] overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-tech text-[10px] uppercase text-white/45">$Arena Balance</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
              {walletAddress ? "Your 0G wallet" : "No wallet connected"}
            </div>
          </div>
          {walletQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-white/35" /> : null}
        </div>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-2xl font-semibold">{walletAddress ? formatArenaBalance(balance) : "—"}</span>
          <img src="/arena-token-cropped.webp" className="h-9 w-9 object-contain" alt="ARENA" />
        </div>
        {walletAddress ? (
          <a
            href={zeroGExplorer.address(walletAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-white/35 transition hover:text-neon-cyan"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            View on 0G Chain
          </a>
        ) : null}
        {walletAddress && walletQ.isError ? (
          <div className="mt-2 text-xs text-white/40">Wallet balance unavailable right now.</div>
        ) : null}
      </section>
      <section className="arena-panel flex items-center justify-between p-4">
        <div>
          <div className="font-tech text-[10px] uppercase text-white/45">Rank</div>
          <div className="mt-2 text-xl font-semibold">
            {agent ? (rank != null ? `#${rank.toLocaleString()}` : "UNRANKED") : "—"}
          </div>
          {leagueInfo && agent ? (
            <div
              className="mt-0.5 font-tech text-[10px] uppercase tracking-wider"
              style={{ color: leagueInfo.color }}
            >
              {leagueInfo.name}
            </div>
          ) : null}
          <div className="mt-1 text-xs text-white/45">
            {agent
              ? topPercent != null
                ? `TOP ${topPercent}%`
                : rankQ.isError
                  ? "Rank unavailable"
                  : totalAgentsQ.isLoading
                    ? "Loading leaderboard"
                    : "Leaderboard pending"
              : "Select an agent"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rankQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-white/35" /> : null}
          {leagueInfo && agent ? (
            <img
              src={leagueInfo.image}
              alt={leagueInfo.name}
              title={leagueInfo.name}
              className="h-[72px] w-[72px] object-contain"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
