import { Swords } from "lucide-react";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { cn } from "@/lib/utils";

type ArenaMatchFaceoffProps = {
  left: AiArenaAgent | null;
  right: AiArenaAgent | null;
  battleId?: string;
  mode?: string;
  pending?: boolean;
  className?: string;
};

export function ArenaMatchFaceoff({
  left,
  right,
  battleId,
  mode,
  pending,
  className,
}: ArenaMatchFaceoffProps) {
  if (!left || !right) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-neon-cyan/25 bg-[linear-gradient(135deg,hsl(268_32%_8%/0.95),hsl(220_45%_8%/0.9))] p-5 sm:p-8",
        pending && "arena-faceoff-pending",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 neural-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

      <p className="relative mb-5 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-neon-cyan/90">
        {pending ? "Entering the arena" : "Fight imminent"}
      </p>

      <div className="relative flex items-stretch justify-center gap-2 sm:gap-8">
        <AgentFace agent={left} side="left" />
        <div className="flex flex-col items-center justify-center gap-2 px-1 text-center sm:px-3">
          <div className="relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
            <span className="absolute inset-0 animate-ping rounded-full bg-neon-cyan/10" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border border-neon-cyan/50 bg-neon-cyan/15 shadow-[0_0_24px_hsl(195_100%_50%/0.25)]">
              <Swords className="h-6 w-6 text-neon-cyan" />
            </div>
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-foreground">VS</span>
          {mode ? (
            <span className="rounded-full border border-white/10 bg-background/50 px-2.5 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground">
              {mode}
            </span>
          ) : null}
          {battleId ? (
            <span className="font-mono text-[10px] text-neon-cyan/80">{battleId.slice(0, 14)}…</span>
          ) : pending ? (
            <span className="font-mono text-[10px] text-muted-foreground">Syncing battle…</span>
          ) : null}
        </div>
        <AgentFace agent={right} side="right" />
      </div>
    </div>
  );
}

function AgentFace({ agent, side }: { agent: AiArenaAgent; side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center text-center",
        side === "left" ? "sm:items-end sm:text-right" : "sm:items-start sm:text-left"
      )}
    >
      <div className="relative mb-4">
        <div
          className={cn(
            "absolute -inset-2 rounded-2xl blur-md opacity-60",
            side === "left" ? "bg-neon-cyan/20" : "bg-neon-purple/25"
          )}
        />
        <ArenaAgentThumbnail
          agent={agent}
          className="relative h-24 w-24 rounded-2xl border-white/15 sm:h-32 sm:w-32"
        />
      </div>
      <p className="max-w-[160px] truncate font-display text-base font-bold text-foreground sm:max-w-[200px] sm:text-lg">
        {agent.name}
      </p>
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{agent.archetype}</p>
      <p className="mt-2 font-display text-2xl font-black tabular-nums text-neon-cyan sm:text-3xl">{agent.eloRating}</p>
      <p className="text-[9px] tracking-wider text-muted-foreground">ELO</p>
    </div>
  );
}
