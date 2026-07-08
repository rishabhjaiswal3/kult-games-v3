import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2, Search, Swords } from "lucide-react";
import { ClanIcon } from "@/components/arena/ClanIcon";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { leaderboardElo, leaderboardName } from "@/hooks/useEnrichedArenaLeaderboard";
import type { ArenaBattleBoardItem } from "@/hooks/useArenaBattleBoard";

function formatLobbyMode(mode?: string | null) {
  return mode ? mode.replaceAll("_", " ") : "Open Lobby";
}

function clanIconType(clan?: string | null) {
  const normalized = clan?.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "0g" || normalized === "og" || normalized === "zerog") return "zerog";
  if (normalized === "base") return "base";
  if (normalized === "solana") return "solana";
  if (normalized === "okx") return "okx";
  return null;
}

function Fighter({
  agent,
  align = "left",
}: {
  agent: { id: string; name?: string | null; clan?: string | null; archetype?: string | null; elo?: number | null };
  align?: "left" | "right";
}) {
  const isRight = align === "right";
  const iconType = clanIconType(agent.clan);
  const clanLabel = agent.clan ?? agent.archetype ?? "AI Arena";

  return (
    <div className={`flex min-h-[5.75rem] min-w-0 flex-col justify-start ${isRight ? "items-end text-right" : "items-start text-left"}`}>
      <div className={`flex w-full items-center gap-2 sm:gap-2.5 ${isRight ? "flex-row-reverse justify-end" : "justify-start"}`}>
        <ArenaAgentThumbnail
          agent={{ id: agent.id, archetype: agent.archetype ?? undefined, name: agent.name ?? undefined }}
          className="h-14 w-14 shrink-0 rounded-xl border border-white/10 transition duration-500 group-hover:scale-105 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_rgba(154,53,255,0.3)] sm:h-16 sm:w-16"
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-tech text-xs font-semibold text-white sm:text-sm">{agent.name ?? "Unknown agent"}</div>
          <div className={`mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs ${isRight ? "justify-end" : "justify-start"}`}>
            {iconType ? <ClanIcon type={iconType} className={iconType === "zerog" ? "h-2.5 w-3.5" : "h-3 w-3"} /> : null}
            <span className="truncate">{clanLabel}</span>
          </div>
        </div>
      </div>
      <div className={`mt-2 w-full font-tech text-[11px] text-muted-foreground sm:text-xs ${isRight ? "text-right" : "text-left"}`}>
        ELO {Math.round(agent.elo ?? 0).toLocaleString()}
      </div>
    </div>
  );
}

function FindingOpponent({ waitLabel, modeLabel }: { waitLabel: string; modeLabel: string }) {
  return (
    <div className="flex min-h-[5.75rem] min-w-0 flex-col items-end justify-start text-right">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-accent/35 bg-accent/10">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      </div>
      <div className="mt-2 font-tech text-[11px] sm:text-xs text-white">Finding rival</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{modeLabel}</div>
      <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-accent">
        <Search className="h-3 w-3" />
        Waiting {waitLabel}
      </div>
    </div>
  );
}

function AgentStatPanel({
  title,
  rank,
  elo,
  wins,
  losses,
  draws,
  align = "left",
}: {
  title: string;
  rank: number;
  elo: number;
  wins?: number;
  losses?: number;
  draws?: number;
  align?: "left" | "right";
}) {
  const totalBattles = (wins ?? 0) + (losses ?? 0) + (draws ?? 0);

  return (
    <div className="flex min-h-[5.5rem] flex-col rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.018] px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 group-hover:border-accent/25 sm:min-h-[6rem] sm:px-3.5 sm:py-3">
      <div className={`flex min-h-[1.35rem] items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
        <div className="min-w-0 flex-1 truncate font-tech text-[10px] font-semibold uppercase tracking-[0.12em] text-accent/80 sm:text-[11px]">
          {title}
        </div>
        <div className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-tech text-[10px] text-white/60 sm:text-[11px]">
          Rank #{rank}
        </div>
      </div>
      <div className="mt-2 grid flex-1 grid-cols-3 gap-1.5 sm:gap-2">
        {[
          { label: "ELO", value: Math.round(elo).toLocaleString() },
          { label: "Wins", value: (wins ?? 0).toLocaleString() },
          { label: "Battles", value: totalBattles.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="min-w-0">
            <div className="font-tech text-[10px] uppercase tracking-[0.12em] text-white/40 sm:text-[11px]">{stat.label}</div>
            <div className="mt-1 font-tech text-xs font-semibold text-white/85 sm:text-sm">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ArenaBattleBoardCardProps = {
  item: ArenaBattleBoardItem;
  actionLabel: string;
  actionTo?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
};

function CardAction({
  actionLabel,
  actionTo,
  onAction,
  actionDisabled,
  actionLoading,
}: Omit<ArenaBattleBoardCardProps, "item">) {
  if (onAction) {
    return (
      <button
        type="button"
        onClick={onAction}
        disabled={actionDisabled || actionLoading}
        className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 font-tech text-xs text-accent shadow-[0_0_18px_rgba(154,53,255,0.12)] transition hover:border-accent/70 hover:bg-accent/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        <span>{actionLabel}</span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    );
  }

  if (!actionTo) return null;

  return (
    <Link to={actionTo} className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 font-tech text-xs text-accent shadow-[0_0_18px_rgba(154,53,255,0.12)] transition hover:border-accent/70 hover:bg-accent/20 hover:text-white">
      <span>{actionLabel}</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export function ArenaBattleBoardCard({
  item,
  actionLabel,
  actionTo,
  onAction,
  actionDisabled,
  actionLoading,
}: ArenaBattleBoardCardProps) {
  if (item.kind === "open-lobby") {
    return (
      <article className="card-glass group relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/55 hover:shadow-[0_22px_55px_rgba(0,0,0,0.42),0_0_30px_rgba(154,53,255,0.2)] sm:p-5 lg:p-4 xl:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(154,53,255,0.16),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/4 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:left-[125%] group-hover:opacity-100" />
        <div className="relative z-10">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 text-left lg:mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-tech text-xs tracking-wider text-accent">QUEUE</span>
          </div>
          <div className="min-w-0 text-right">
            <div className="text-xs">Open Lobby</div>
            <div className="text-[10px] text-muted-foreground">{formatLobbyMode(item.status.mode)}</div>
          </div>
          <div className="font-tech text-sm text-accent">{item.waitLabel}</div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:gap-3">
          <Fighter
            agent={{
              id: item.agent.id,
              name: item.agent.name,
              clan: item.agent.clan,
              archetype: item.agent.archetype,
              elo: item.agent.eloRating,
            }}
          />
          <span className="self-center font-display text-xl text-muted-foreground sm:text-2xl">VS</span>
          <FindingOpponent waitLabel={item.waitLabel} modeLabel={formatLobbyMode(item.status.mode)} />
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 lg:mt-3 lg:pt-2.5">
          <CardAction
            actionLabel={actionLabel}
            actionTo={actionTo}
            onAction={onAction}
            actionDisabled={actionDisabled}
            actionLoading={actionLoading}
          />
          <span className="text-xs text-muted-foreground">
            {item.status.gameId ?? "Arena queue"} · {formatLobbyMode(item.status.mode)}
          </span>
        </div>
        </div>
      </article>
    );
  }

  const leftElo = leaderboardElo(item.left);
  const rightElo = leaderboardElo(item.right);

  return (
    <article className="card-glass group relative overflow-hidden rounded-2xl border border-red-400/20 p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:border-red-400/55 hover:shadow-[0_26px_65px_rgba(0,0,0,0.46),0_0_34px_rgba(239,68,68,0.18)] sm:p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.16),transparent_32%),radial-gradient(circle_at_10%_18%,rgba(154,53,255,0.16),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_42%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-300/60 to-transparent" />
      <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/4 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:left-[125%] group-hover:opacity-100" />
      <div className="relative z-10">
      <div className="mb-3.5 flex justify-center text-center">
        <div className="flex items-center justify-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 shadow-[0_0_18px_rgba(239,68,68,0.12)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-tech text-xs tracking-wider text-red-400">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:gap-3">
        <Fighter
          agent={{
            id: item.left.agentId,
            name: leaderboardName(item.left),
            clan: item.left.clan,
            archetype: item.left.archetype,
            elo: leaderboardElo(item.left),
          }}
        />
        <div className="flex flex-col items-center gap-1 self-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-black/30 shadow-[0_0_22px_rgba(154,53,255,0.14)]">
            <Swords className="h-4 w-4 text-accent" />
          </span>
          <span className="font-display text-sm text-muted-foreground sm:text-base">VS</span>
        </div>
        <Fighter
          align="right"
          agent={{
            id: item.right.agentId,
            name: leaderboardName(item.right),
            clan: item.right.clan,
            archetype: item.right.archetype,
            elo: leaderboardElo(item.right),
          }}
        />
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-2.5 border-t border-white/10 pt-3 sm:grid-cols-2">
        <AgentStatPanel
          title={leaderboardName(item.left)}
          rank={item.left.rank}
          elo={leftElo}
          wins={item.left.wins}
          losses={item.left.losses}
          draws={item.left.draws}
        />
        <AgentStatPanel
          title={leaderboardName(item.right)}
          rank={item.right.rank}
          elo={rightElo}
          wins={item.right.wins}
          losses={item.right.losses}
          draws={item.right.draws}
          align="right"
        />
      </div>
      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-3">
        <CardAction
          actionLabel={actionLabel}
          actionTo={actionTo}
          onAction={onAction}
          actionDisabled={actionDisabled}
          actionLoading={actionLoading}
        />
        {item.watchLabel ? <span className="text-xs text-muted-foreground">{item.watchLabel}</span> : null}
      </div>
      </div>
    </article>
  );
}
