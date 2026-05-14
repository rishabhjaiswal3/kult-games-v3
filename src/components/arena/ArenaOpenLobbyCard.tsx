import { Loader2, Swords } from "lucide-react";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { Button } from "@/components/ui/button";
import type { AiArenaAgent, AiArenaMatchmakingStatusBody } from "@/types/aiArenaGateway";
import { cn } from "@/lib/utils";

type ArenaOpenLobbyCardProps = {
  agent: AiArenaAgent;
  status: AiArenaMatchmakingStatusBody;
  onJoin: () => void;
  onViewDetails?: () => void;
  joining?: boolean;
  disabled?: boolean;
  isOwn?: boolean;
  waitLabel: string;
};

export function ArenaOpenLobbyCard({
  agent,
  status,
  onJoin,
  onViewDetails,
  joining,
  disabled,
  isOwn,
  waitLabel,
}: ArenaOpenLobbyCardProps) {
  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/45 p-4 transition sm:p-5",
        isOwn ? "border-neon-purple/35 ring-1 ring-neon-purple/15" : "border-white/[0.08] hover:border-neon-cyan/30"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,hsl(195_100%_50%/0.08),transparent_60%)]" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-neon-cyan/25 to-neon-purple/20 blur-sm opacity-70" />
            <ArenaAgentThumbnail
              agent={agent}
              className="relative h-24 w-24 rounded-2xl border-neon-cyan/30 sm:h-28 sm:w-28"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-foreground sm:text-xl">{agent.name}</p>
            <p className="text-xs text-muted-foreground">{agent.archetype} • {agent.clan}</p>
            <p className="mt-2 font-display text-2xl font-black tabular-nums text-neon-cyan">{agent.eloRating}</p>
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">ELO rating</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end sm:text-right">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-background/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {status.mode ?? "RANKED"}
          </span>
          <span className="font-mono text-[10px] text-neon-cyan/80">{status.gameId ?? "standard"}</span>
          <span className="text-xs text-muted-foreground">Waiting {waitLabel}</span>
          {isOwn ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onViewDetails}
              className="mt-1 rounded-xl border border-neon-purple/35 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20"
            >
              Match details
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={disabled || joining}
              onClick={onJoin}
              className="mt-1 rounded-xl border border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20"
            >
              {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Swords className="mr-2 h-4 w-4" />}
              Join fight
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
