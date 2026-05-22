import { Copy, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { FullPlayerProfile } from "@/types/api";
import { initialsFromName, shortWallet } from "@/components/dashboard/profileAvatars";

type DashboardProfileHeaderProps = {
  profile: FullPlayerProfile | undefined;
  isLoading: boolean;
  walletAddress: string | null;
};

export function DashboardProfileHeader({ profile, isLoading, walletAddress }: DashboardProfileHeaderProps) {
  const displayName = profile?.player.name?.trim() || "Arena Pilot";

  const copyWallet = () => {
    if (!walletAddress) return;
    void navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet copied");
  };

  return (
    <div className="arena-panel overflow-hidden border-white/8 bg-[#04080f]/95 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#9a35ff]/40 bg-[#1a1030] font-tech text-lg font-bold text-[#c78aff]"
            aria-hidden
          >
            {initialsFromName(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-tech text-[11px] italic text-[#a84cff]">
              {isLoading ? "Loading profile…" : "Welcome back,"}
            </div>
            <h1 className="mt-0.5 max-w-full break-words font-tech text-2xl font-bold uppercase tracking-tight text-white [overflow-wrap:anywhere] sm:text-3xl">
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
          {[
            { label: "Level", value: profile?.level ?? "—" },
            { label: "Rank", value: profile?.rank != null ? `#${profile.rank}` : "—" },
            { label: "Total score", value: profile ? profile.totalScore.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—" },
            { label: "Games played", value: profile?.totalGamesPlayed ?? "—" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/8 bg-[#0a0f1b]/60 px-3 py-2.5 text-center">
              <div className="font-tech text-[9px] uppercase tracking-wider text-white/40">{stat.label}</div>
              <div className="mt-1 text-lg font-bold text-white tabular-nums">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
