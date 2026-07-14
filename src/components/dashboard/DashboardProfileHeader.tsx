import { useQuery } from "@tanstack/react-query";
import { Copy, Wallet } from "lucide-react";
import { arenaChainApi } from "@/api/arenaChainApi";
import type { FullPlayerProfile } from "@/types/api";
import { initialsFromName, shortWallet } from "@/components/dashboard/profileAvatars";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardProfileHeaderProps = {
  profile: FullPlayerProfile | undefined;
  isLoading: boolean;
  walletAddress: string | null;
  agentCount: number;
};

function formatArenaToken(value?: string | number | null): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (num == null || !Number.isFinite(num)) return "—";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatKultPoints(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

type ProfileStat = {
  label: string;
  value: string | number;
  loading?: boolean;
  valueClassName?: string;
};

function ProfileStatCard({ stat }: { stat: ProfileStat }) {
  return (
    <div className="relative min-h-[58px] min-w-0 overflow-hidden rounded-md border border-white/[0.08] bg-[#0a0f1b]/50 px-2 py-2 text-center backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#c78aff]/30 hover:bg-[#111626]/70 hover:shadow-[0_4px_20px_rgba(154,53,255,0.1)] sm:px-2.5">
      <div className="truncate font-tech text-[7px] uppercase tracking-[0.12em] text-white/48 sm:text-[7.5px] sm:tracking-[0.14em]">
        {stat.label}
      </div>
      <div
        className={`mt-1 truncate text-xs font-black tabular-nums drop-shadow-sm sm:text-sm ${stat.valueClassName ?? "text-white"}`}
      >
        {stat.loading ? <Skeleton className="mx-auto h-3.5 w-10 bg-white/10" /> : stat.value}
      </div>
    </div>
  );
}

export function DashboardProfileHeader({ profile, isLoading, walletAddress }: DashboardProfileHeaderProps) {
  const displayName = profile?.player.name?.trim() || "Arena Pilot";

  const walletQ = useQuery({
    queryKey: ["arenaChain", "dashboard", "walletBalance", walletAddress],
    queryFn: () => arenaChainApi.getWalletBalance(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });

  const arenaBalance = walletQ.data?.balanceArena;
  const arenaLoading = !!walletAddress && (walletQ.isLoading || walletQ.isFetching) && arenaBalance == null;

  const primaryStats: ProfileStat[] = [
    {
      label: "Arena Token",
      value: walletAddress ? (walletQ.isError ? "—" : formatArenaToken(arenaBalance)) : "—",
      loading: arenaLoading,
    },
    {
      label: "Kult Points",
      value: profile ? `${formatKultPoints(profile.kultPoints)} KP` : "—",
      loading: isLoading,
      valueClassName: "text-[#00f080]",
    },
    {
      label: "Level",
      value: profile?.level ?? "—",
      loading: isLoading,
    },
  ];

  const secondaryStats: ProfileStat[] = [
    ...(profile?.rank != null ? [{ label: "Rank", value: `#${profile.rank}`, loading: isLoading }] : []),
    ...(profile?.totalGamesPlayed
      ? [{ label: "Games played", value: profile.totalGamesPlayed, loading: isLoading }]
      : []),
  ];

  const copyWallet = () => {
    if (!walletAddress) return;
    void navigator.clipboard.writeText(walletAddress);
  };

  return (
    <div data-tour="dashboard-profile" className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#04080f]/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:border-[#9a35ff]/30 hover:shadow-[0_8px_40px_rgba(154,53,255,0.15)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(154,53,255,0.15),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(0,137,255,0.1),transparent_40%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#9a35ff]/50 bg-[#1a1030] font-tech text-xl font-bold text-[#c78aff] shadow-[0_0_15px_rgba(154,53,255,0.4)] transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(154,53,255,0.6)]"
            aria-hidden
          >
            {initialsFromName(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-tech text-[10px] font-bold uppercase tracking-[0.18em] text-[#a84cff]">
              {isLoading ? "Loading KULT ID…" : "KULT ID // Shared profile"}
            </div>
            {isLoading ? (
              <Skeleton className="mt-1 h-7 w-40 bg-white/10 sm:h-8" />
            ) : (
              <h1 className="mt-0.5 max-w-full break-words font-tech text-2xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 [overflow-wrap:anywhere] sm:text-3xl drop-shadow-sm">
                {displayName}
              </h1>
            )}
            <p className="mt-1 max-w-full text-sm text-white/55">Your command center — agents, battles, and arena progress.</p>
            {walletAddress ? (
              <button
                type="button"
                onClick={copyWallet}
                className="mt-2 inline-flex max-w-full items-center gap-1.5 font-tech text-[10px] uppercase tracking-wider text-white/45 transition hover:text-[#c78aff]"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span className="truncate">{shortWallet(walletAddress)}</span>
                <Copy className="h-3 w-3 opacity-60" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[300px] lg:max-w-[520px] lg:shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {primaryStats.map((stat) => (
              <ProfileStatCard key={stat.label} stat={stat} />
            ))}
          </div>
          {secondaryStats.length > 0 ? (
            <div
              className={`grid gap-2 ${secondaryStats.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {secondaryStats.map((stat) => (
                <ProfileStatCard key={stat.label} stat={stat} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {/*
      <div className="relative z-10 mt-5 grid grid-cols-2 gap-2 border-t border-white/8 pt-4 sm:grid-cols-4">
        {[
          { label: "Games", value: profile?.totalGamesPlayed ?? "—", detail: "Progress saved" },
          { label: "Agents", value: agentCount, detail: "Arena roster" },
          { label: "Achievements", value: profile?.completedQuests ?? "—", detail: "KULT record" },
          { label: "Inventory", value: inventoryCount ?? "—", detail: "Assets collected" },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-white/8 bg-black/20 px-3 py-2">
            <div className="font-tech text-[8px] uppercase tracking-[0.16em] text-white/40">{item.label}</div>
            <div className="mt-1 font-tech text-sm font-bold text-white">{item.value}</div>
            <div className="mt-0.5 text-[10px] text-white/38">{item.detail}</div>
          </div>
        ))}
      </div>
      */}
    </div>
  );
}
