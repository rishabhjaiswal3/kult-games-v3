import { useQuery } from "@tanstack/react-query";
import { playerTitlesApi } from "@/api/playerTitlesApi";
import { useAuth } from "@/contexts/AuthContext";
import { TITLE_CONFIG } from "./PlayerTitleModal";

export function PlayerTitleCards() {
  const { isAuthenticated, walletAddress } = useAuth();

  const { data } = useQuery({
    queryKey: ["player-titles", walletAddress],
    queryFn: () => playerTitlesApi.getTitles(walletAddress!),
    enabled: isAuthenticated && Boolean(walletAddress),
    staleTime: 5 * 60_000,
  });

  const titles = data?.titles ?? [];
  if (titles.length === 0) return null;

  return (
    <section className="space-y-2">
      {titles.map((title) => {
        const cfg = TITLE_CONFIG[title.type];
        if (!cfg) return null;

        return (
          <div
            key={title.type}
            className={`relative overflow-hidden rounded-xl border ${cfg.border} bg-[#04080f]/95`}
          >
            {/* Ambient glow strip at top */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  title.type === "GOLDEN_FOUNDER"
                    ? "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)",
              }}
            />

            <div className="flex items-center gap-3 p-3">
              {/* Image thumbnail */}
              <div className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border ${cfg.border}`}>
                <img
                  src={cfg.img}
                  alt={cfg.label}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className={`font-tech text-[11px] font-black tracking-wide ${cfg.accentColor}`}>
                  {cfg.label}
                </p>
                <p className="mt-0.5 font-tech text-[9px] text-white/35">
                  Since {new Date(title.grantedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
