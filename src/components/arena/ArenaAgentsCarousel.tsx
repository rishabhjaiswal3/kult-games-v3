import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { cn } from "@/lib/utils";

type ArenaAgentsCarouselProps = {
  title: string;
  subtitle: string;
  agents: AiArenaAgent[];
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onAgentClick: (agent: AiArenaAgent) => void;
  accent?: "cyan" | "purple";
  headerAction?: ReactNode;
  page: number;
  totalPages?: number;
  disableNext?: boolean;
  onPage: (page: number) => void;
  paginationDisabled?: boolean;
};

function ArenaAgentCarouselCard({
  agent,
  onClick,
  accent,
}: {
  agent: AiArenaAgent;
  onClick: () => void;
  accent: "cyan" | "purple";
}) {
  const borderAccent =
    accent === "purple"
      ? "hover:border-neon-purple/40 hover:shadow-[0_12px_32px_hsl(270_80%_45%/0.22)]"
      : "hover:border-neon-cyan/40 hover:shadow-[0_12px_32px_hsl(195_100%_50%/0.18)]";
  const nameHover = accent === "purple" ? "group-hover:text-neon-purple" : "group-hover:text-neon-cyan";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group mx-auto flex h-full w-full max-w-[6.75rem] flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-[hsl(268_32%_7%/0.92)] text-left transition duration-300 hover:-translate-y-0.5 sm:max-w-[7.25rem] md:max-w-[7.75rem]",
        borderAccent
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[hsl(268_32%_6%/0.95)]">
        <ArenaAgentThumbnail
          agent={agent}
          className="h-full w-full rounded-none border-0 bg-transparent [&_img]:object-cover [&_img]:p-0"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(268_32%_6%/0.95)] via-transparent to-transparent" />
        <span className="absolute bottom-1 left-1 rounded border border-white/10 bg-background/75 px-1.5 py-px font-display text-[8px] font-bold tabular-nums text-neon-cyan backdrop-blur-sm">
          ELO {agent.eloRating}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2">
        <h4 className={cn("truncate font-display text-[11px] font-bold leading-tight text-foreground transition", nameHover)}>
          {agent.name}
        </h4>
        <p className="truncate text-[8px] leading-snug text-muted-foreground">
          {agent.archetype}
          {agent.clan ? ` · ${agent.clan}` : ""}
        </p>
        <p className="mt-auto pt-1 font-mono text-[8px] text-muted-foreground">
          {agent.wins}W · {agent.losses}L
        </p>
      </div>
    </button>
  );
}

function CarouselSkeleton({ accent }: { accent: "cyan" | "purple" }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[72%] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-background/30 sm:min-w-[46%] md:min-w-[32%] lg:min-w-[24%]"
        >
          <Skeleton className={cn("aspect-[4/5] w-full rounded-none", accent === "purple" ? "bg-muted/55" : "bg-muted/50")} />
          <div className="space-y-2 p-3">
            <Skeleton className="h-3.5 w-24 bg-muted/70" />
            <Skeleton className="h-2.5 w-32 bg-muted/55" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  onPage,
  disabled,
  disableNext,
}: {
  page: number;
  totalPages?: number;
  onPage: (p: number) => void;
  disabled?: boolean;
  disableNext?: boolean;
}) {
  const nextOff = disabled || (typeof totalPages === "number" ? page >= totalPages : Boolean(disableNext));
  const prevOff = disabled || page <= 1;
  if (prevOff && nextOff) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
      <p className="font-mono text-[10px] text-muted-foreground">
        Page {page}
        {typeof totalPages === "number" ? ` of ${totalPages}` : ""}
      </p>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={prevOff}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={nextOff}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ArenaAgentsCarousel({
  title,
  subtitle,
  agents,
  loading,
  error,
  errorMessage = "Could not load agents.",
  emptyMessage = "No agents yet.",
  emptyAction,
  onAgentClick,
  accent = "cyan",
  headerAction,
  page,
  totalPages,
  disableNext,
  onPage,
  paginationDisabled,
}: ArenaAgentsCarouselProps) {
  return (
    <div className="glass-panel flex flex-col rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold tracking-wider">{title}</h3>
          <p className="mt-0.5 max-w-xl text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
        {headerAction}
      </div>

      {error ? (
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      ) : loading ? (
        <CarouselSkeleton accent={accent} />
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-background/20 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          {emptyAction}
        </div>
      ) : (
        <Carousel opts={{ align: "start", dragFree: true }} className="relative w-full">
          <CarouselContent className="-ml-2">
            {agents.map((agent) => (
              <CarouselItem
                key={agent.id}
                className="basis-auto pl-2"
              >
                <ArenaAgentCarouselCard agent={agent} accent={accent} onClick={() => onAgentClick(agent)} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 border-white/15 bg-background/85 text-foreground hover:bg-background" />
          <CarouselNext className="right-0 border-white/15 bg-background/85 text-foreground hover:bg-background" />
        </Carousel>
      )}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        disableNext={disableNext}
        disabled={paginationDisabled || loading || error}
        onPage={onPage}
      />
    </div>
  );
}

export function CreateAgentHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" size="sm" className="h-8 gap-1 text-xs" onClick={onClick}>
      <Plus className="h-3.5 w-3.5" />
      Create
    </Button>
  );
}
