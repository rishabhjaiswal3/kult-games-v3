import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { playerApi } from "@/api/playerApi";
import { playerTitlesApi } from "@/api/playerTitlesApi";
import { useAuth } from "@/contexts/AuthContext";
import { TITLE_CONFIG } from "@/components/titles/PlayerTitleModal";
import type { FullPlayerProfile } from "@/types/api";

type DashboardAccountPanelProps = {
  profile: FullPlayerProfile;
};

export function DashboardAccountPanel({ profile }: DashboardAccountPanelProps) {
  const queryClient = useQueryClient();
  const { refetchProfile, isAuthenticated, walletAddress } = useAuth();
  const [nameDraft, setNameDraft] = useState(profile.player.name ?? "");

  const { data: titlesData } = useQuery({
    queryKey: ["player-titles", walletAddress],
    queryFn: () => playerTitlesApi.getTitles(walletAddress!),
    enabled: isAuthenticated && Boolean(walletAddress),
    staleTime: 5 * 60_000,
  });
  const titles = titlesData?.titles ?? [];

  useEffect(() => {
    setNameDraft(profile.player.name ?? "");
  }, [profile.player.name]);

  const saveName = useMutation({
    mutationFn: (name: string) => playerApi.updateName(name),
    onSuccess: async (name) => {
      toast.success("Display name updated");
      setNameDraft(name);
      await queryClient.invalidateQueries({ queryKey: ["player", "full-profile"] });
      await refetchProfile();
    },
    onError: () => toast.error("Could not update name"),
  });

  return (
    <section className="arena-panel space-y-4 border-white/8 bg-[#04080f]/95 p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md border border-purple-500/25 bg-purple-500/10 text-purple-400">
          <UserRound className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Account</h3>
          <p className="text-[10px] text-white/45">Display name &amp; identity</p>
        </div>
      </div>

      <div>
        <label htmlFor="dashboard-display-name" className="font-tech text-[9px] font-bold uppercase tracking-wider text-white/40">
          Display name
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="dashboard-display-name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={100}
            className="h-9 min-w-0 flex-1 rounded border border-white/8 bg-[#0a0f1b]/80 px-3 text-sm text-white outline-none focus:border-[#9a35ff]/45"
          />
          <button
            type="button"
            disabled={saveName.isPending || !nameDraft.trim() || nameDraft.trim() === profile.player.name}
            onClick={() => saveName.mutate(nameDraft.trim())}
            className="btn-primary flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 font-tech text-[9px] font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {saveName.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      </div>

      {profile.player.referral_code ? (
        <div className="rounded-lg border border-[#9a35ff]/25 bg-[#9a35ff]/10 px-3 py-2.5">
          <p className="font-tech text-[9px] uppercase tracking-wider text-white/45">Referral code</p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#d6acff]">{profile.player.referral_code}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded border border-white/8 bg-[#0a0f1b]/50 px-2.5 py-2">
          <span className="text-white/40">Quests</span>
          <p className="font-tech font-bold text-white">{profile.completedQuests}</p>
        </div>
        <div className="rounded border border-white/8 bg-[#0a0f1b]/50 px-2.5 py-2">
          <span className="text-white/40">Data</span>
          <p className="font-tech font-bold text-white">{profile.cached ? "Cached" : "Live"}</p>
        </div>
      </div>

      {titles.length > 0 && (
        <div className="space-y-2 pt-1">
          {titles.map((title) => {
            const cfg = TITLE_CONFIG[title.type];
            if (!cfg) return null;
            return (
              <div key={title.type} className={`relative overflow-hidden rounded-lg border ${cfg.border}`}>
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: title.type === "GOLDEN_FOUNDER"
                      ? "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)",
                  }}
                />
                <div className="flex items-center gap-3 p-2.5">
                  <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${cfg.border}`}>
                    <img src={cfg.img} alt={cfg.label} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-tech text-[11px] font-black tracking-wide ${cfg.accentColor}`}>{cfg.label}</p>
                    <p className="mt-0.5 font-tech text-[9px] text-white/35">
                      Since {new Date(title.grantedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
