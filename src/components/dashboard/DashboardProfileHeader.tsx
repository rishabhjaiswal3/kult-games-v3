import { Copy, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { FullPlayerProfile } from "@/types/api";
import { initialsFromName, shortWallet } from "@/components/dashboard/profileAvatars";

type DashboardProfileHeaderProps = {
  profile: FullPlayerProfile | undefined;
  isLoading: boolean;
  walletAddress: string | null;
  agentCount: number;
};

function formatKultPoints(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

export function DashboardProfileHeader({ profile, isLoading, walletAddress, agentCount }: DashboardProfileHeaderProps) {
  const displayName = profile?.player.name?.trim() || "Arena Pilot";
  const inventoryCount = Array.isArray(profile?.purchasedAssets) ? profile.purchasedAssets.length : null;
  const profileStats = [
    { label: "Kult Points", value: profile ? formatKultPoints(profile.kultPoints) : "—" },
    { label: "KP Rank", value: profile?.kultPointsRank != null ? `#${profile.kultPointsRank}` : "—" },
    { label: "Level", value: profile?.level ?? "—" },
    ...(profile?.rank != null ? [{ label: "Rank", value: `#${profile.rank}` }] : []),
    ...(profile?.totalGamesPlayed ? [{ label: "Games played", value: profile.totalGamesPlayed }] : []),
  ];

  const copyWallet = () => {
    if (!walletAddress) return;
    void navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet copied");
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
            <h1 className="mt-0.5 max-w-full break-words font-tech text-2xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 [overflow-wrap:anywhere] sm:text-3xl drop-shadow-sm">
              {displayName}
            </h1>
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

        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:max-w-[460px]">
          {profileStats.map((stat) => (
            <div
              key={stat.label}
              className="relative min-h-[58px] overflow-hidden rounded-md border border-white/[0.08] bg-[#0a0f1b]/50 px-2.5 py-2 text-center backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#c78aff]/30 hover:bg-[#111626]/70 hover:shadow-[0_4px_20px_rgba(154,53,255,0.1)]"
            >
              <div className="font-tech text-[7.5px] uppercase tracking-[0.14em] text-white/48">
                {stat.label}
              </div>
              <div className="mt-1 text-sm font-black text-white tabular-nums drop-shadow-sm">
                {stat.value}
              </div>
            </div>
          ))}
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
