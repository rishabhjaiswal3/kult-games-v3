import { Crown } from "lucide-react";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import type { AiArenaAgent, AiArenaBattle } from "@/types/aiArenaGateway";

type GamePhase = "live" | "ended";
export type BannerTheme = "warzone" | "robowar" | "highway";

const THEME_STYLES: Record<
  BannerTheme,
  { grid: string; leftGlowClass: string; rightGlowClass: string }
> = {
  warzone: {
    grid: "rgba(139,92,246,0.5)",
    leftGlowClass: "from-[#8b5cf620]",
    rightGlowClass: "from-[#06b6d420]",
  },
  robowar: {
    grid: "rgba(220,38,38,0.5)",
    leftGlowClass: "from-[#dc262620]",
    rightGlowClass: "from-[#dc262620]",
  },
  highway: {
    grid: "rgba(139,92,246,0.5)",
    leftGlowClass: "from-[#8b5cf620]",
    rightGlowClass: "from-[#06b6d420]",
  },
};

function clanColor(clan?: string): string {
  const c = (clan ?? "").toUpperCase();
  if (c === "ZEROG") return "#00e68a";
  if (c === "BASE") return "#0052ff";
  if (c === "SOLANA") return "#9945ff";
  if (c === "OKX") return "#e0a528";
  return "#8b6dff";
}

function AgentCard({
  agent,
  isWinner,
  isLoser,
}: {
  agent: AiArenaAgent | null;
  isWinner?: boolean;
  isLoser?: boolean;
}) {
  const color = agent ? clanColor(agent.clan) : "#8b6dff";

  if (!agent) {
    return (
      <div className="flex min-w-0 flex-col items-center gap-1.5 px-1 py-2">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-white/8" />
          <div className="h-2 w-14 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-center transition-all duration-500 ${
        isLoser ? "opacity-40 grayscale" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div
          className="absolute -inset-1 rounded-lg blur-md opacity-40"
          style={{ background: `${color}40` }}
        />
        <ArenaAgentThumbnail
          agent={agent}
          className="arena-battle-agent-thumb relative h-10 w-10 rounded-lg border-white/15"
        />
        {isWinner ? (
          <Crown
            className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 drop-shadow-lg"
            style={{ color: "#fbbf24" }}
          />
        ) : null}
      </div>
      <div className="min-w-0 w-full">
        <div className="truncate font-display text-[11px] font-bold leading-tight text-white">
          {agent.name}
        </div>
        <div className="mt-0.5 truncate text-[8px] font-mono uppercase tracking-wider text-white/45">
          {agent.archetype}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className="font-tech text-[10px] font-bold" style={{ color }}>
            {agent.eloRating.toLocaleString()}
          </span>
          <span className="text-[8px] text-white/30 font-tech">ELO</span>
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-1.5 text-[8px] text-white/30 font-tech">
          <span>{agent.wins}W</span>
          <span className="text-white/20">·</span>
          <span>{agent.losses}L</span>
        </div>
      </div>
    </div>
  );
}

/** Compact agent VS banner for the battle chat drawer. */
export function ArenaBattleAgentBanner({
  myAgent,
  opponent,
  battle,
  gamePhase,
  theme = "warzone",
}: {
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
  battle?: AiArenaBattle;
  gamePhase: GamePhase;
  theme?: BannerTheme;
}) {
  const result = battle?.result;
  const myId = myAgent?.id;
  const myWon = result?.winnerId === myId;
  const oppWon =
    result?.loserId !== myId && result?.winnerId !== myId
      ? null
      : result?.winnerId !== myId;
  const styles = THEME_STYLES[theme];

  return (
    <div className="relative overflow-hidden border-b border-white/8 bg-[#04080f]/95 backdrop-blur">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${styles.grid} 1px,transparent 1px),linear-gradient(90deg,${styles.grid} 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r to-transparent ${styles.leftGlowClass}`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l to-transparent ${styles.rightGlowClass}`}
      />

      <div className="arena-battle-agent-banner relative grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center gap-0 px-1 py-1 sm:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)]">
        <AgentCard
          agent={myAgent}
          isWinner={gamePhase === "ended" && myWon}
          isLoser={gamePhase === "ended" && !myWon && !!result}
        />

        <div className="flex shrink-0 flex-col items-center justify-center self-center">
          <span className="font-display text-base font-black leading-none text-gradient sm:text-lg">
            VS
          </span>
        </div>

        <AgentCard
          agent={opponent}
          isWinner={gamePhase === "ended" && !!oppWon}
          isLoser={gamePhase === "ended" && oppWon === false && !!result}
        />
      </div>
    </div>
  );
}
