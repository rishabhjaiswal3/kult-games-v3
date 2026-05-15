import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { AgentNameKeyChip, agentNameAccentFromAgentId } from "@/components/arena/AgentNameKeyChip";
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
  subtitle?: string;
  agents: AiArenaAgent[];
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onAgentClick: (agent: AiArenaAgent) => void;
  accent?: "cyan" | "purple";
  headerAction?: ReactNode;
  /** `live-feed` = infinite scroll list; `carousel` = swipe cards + page controls */
  layout?: "live-feed" | "carousel";
  /** Live-feed only */
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  /** Carousel only */
  page?: number;
  totalPages?: number;
  disableNext?: boolean;
  onPage?: (page: number) => void;
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
  const nameAccent = agentNameAccentFromAgentId(agent.id);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group mx-auto flex h-full w-full max-w-[12.5rem] flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-[hsl(268_32%_7%/0.92)] text-left transition duration-300 hover:-translate-y-0.5 sm:max-w-[13.5rem] md:max-w-[15rem]",
        borderAccent
      )}
    >
      <div className="relative aspect-[5/4] w-full bg-[hsl(268_32%_6%/0.95)] p-1">
        <div className="relative h-full w-full overflow-hidden rounded-[4px]">
          <ArenaAgentThumbnail
            agent={agent}
            className="h-full w-full rounded-[4px] border-0 bg-transparent [&_img]:rounded-[4px] [&_img]:object-cover [&_img]:object-center [&_img]:p-0"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[4px] bg-gradient-to-t from-[hsl(268_32%_6%/0.95)] via-transparent to-transparent" />
          <span className="absolute bottom-1 left-1 rounded border border-white/10 bg-background/75 px-1.5 py-px font-display text-[8px] font-bold tabular-nums text-neon-cyan backdrop-blur-sm">
            ELO {agent.eloRating}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-1.5">
        <AgentNameKeyChip name={agent.name} accent={nameAccent} size="comfortable" className="max-w-full self-start" />
        <p className="truncate text-[8px] leading-snug text-muted-foreground">
          {agent.archetype}
          {agent.clan ? ` · ${agent.clan}` : ""}
        </p>
        <p className="mt-auto pt-0.5 font-mono text-[8px] text-muted-foreground">
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
          className="min-w-[12.5rem] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-background/30 sm:min-w-[13.5rem] md:min-w-[15rem]"
        >
          <div className="relative aspect-[5/4] w-full p-1">
            <Skeleton
              className={cn(
                "absolute inset-0 rounded-[4px]",
                accent === "purple" ? "bg-muted/55" : "bg-muted/50"
              )}
            />
          </div>
          <div className="space-y-1.5 p-2">
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

function ArenaAgentFeedRow({
  agent,
  onClick,
  accent,
}: {
  agent: AiArenaAgent;
  onClick: () => void;
  accent: "cyan" | "purple";
}) {
  const isPurple = accent === "purple";
  const nameAccent = agentNameAccentFromAgentId(agent.id);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[4.5rem] w-full items-stretch overflow-hidden rounded-xl border border-white/[0.1] bg-[linear-gradient(135deg,hsl(268_32%_10%/0.92),hsl(268_26%_7%/0.94))] py-1.5 text-left shadow-[inset_0_1px_0_hsl(210_20%_100%/0.06)] transition duration-200 sm:min-h-[4.75rem] sm:py-2",
        "hover:-translate-y-px",
        isPurple
          ? "hover:border-neon-purple/40 hover:shadow-[0_12px_32px_hsl(270_80%_42%/0.18)]"
          : "hover:border-neon-cyan/38 hover:shadow-[0_12px_32px_hsl(195_100%_48%/0.14)]"
      )}
    >
      <div
        className={cn(
          "relative flex min-h-0 w-[3.75rem] shrink-0 flex-col self-stretch border-r bg-[hsl(268_26%_9%/0.96)] p-1 sm:w-[4.35rem]",
          isPurple ? "border-neon-purple/15" : "border-neon-cyan/15"
        )}
      >
        <div className="relative min-h-[2.75rem] w-full flex-1 overflow-hidden rounded-[4px]">
          <ArenaAgentThumbnail
            agent={agent}
            className="h-full w-full rounded-[4px] border-0 shadow-none ring-0 [&_img]:rounded-[4px] [&_img]:object-cover [&_img]:object-center [&_img]:p-0"
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-[4px] bg-gradient-to-r from-transparent via-transparent to-[hsl(268_28%_8%/0.88)] sm:to-[hsl(268_28%_8%/0.72)]"
            aria-hidden
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-2.5 sm:gap-1 sm:px-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <AgentNameKeyChip name={agent.name} accent={nameAccent} size="compact" className="max-w-full" />
          </div>
          <span
            className={cn(
              "shrink-0 rounded-md border px-1.5 py-px font-mono text-[9px] font-semibold tabular-nums sm:text-[10px]",
              isPurple
                ? "border-neon-purple/40 bg-neon-purple/[0.12] text-neon-purple shadow-[0_0_12px_hsl(278_88%_62%/0.15)]"
                : "border-neon-cyan/40 bg-neon-cyan/[0.1] text-neon-cyan shadow-[0_0_12px_hsl(195_100%_50%/0.12)]"
            )}
          >
            {agent.eloRating}
          </span>
        </div>
        <p className="line-clamp-2 break-words text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
          {agent.archetype}
          {agent.clan ? ` · ${agent.clan}` : ""}
        </p>
        <p className="truncate font-mono text-[9px] tabular-nums text-muted-foreground/85">{agent.wins}W · {agent.losses}L</p>
      </div>
    </button>
  );
}

function FeedSkeleton({ accent }: { accent: "cyan" | "purple" }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex min-h-[4.5rem] items-stretch overflow-hidden rounded-xl border border-white/[0.06] bg-background/25 py-1.5 sm:min-h-[4.75rem] sm:py-2"
        >
          <div className="flex min-h-0 w-[3.75rem] shrink-0 flex-col self-stretch border-r border-white/[0.06] p-1 sm:w-[4.35rem]">
            <Skeleton
              className={cn(
                "min-h-[2.75rem] w-full flex-1 rounded-[4px]",
                accent === "purple" ? "bg-muted/50" : "bg-muted/45"
              )}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 py-1">
            <Skeleton className="h-3 w-[42%] bg-muted/65" />
            <Skeleton className="h-2.5 w-[58%] bg-muted/45" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentsLiveFeed({
  agents,
  accent,
  onAgentClick,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: {
  agents: AiArenaAgent[];
  accent: "cyan" | "purple";
  onAgentClick: (agent: AiArenaAgent) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !fetchNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit || isFetchingNextPage) return;
        fetchNextPage();
      },
      { root, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, agents.length]);

  return (
    <div
      ref={scrollRef}
      className="max-h-[min(440px,52svh)] space-y-1.5 overflow-y-auto overscroll-contain pr-1 sm:max-h-[min(480px,56svh)]"
    >
      {agents.map((agent) => (
        <ArenaAgentFeedRow key={agent.id} agent={agent} accent={accent} onClick={() => onAgentClick(agent)} />
      ))}
      {hasNextPage ? <div ref={sentinelRef} className="h-2 w-full shrink-0" aria-hidden /> : null}
      {isFetchingNextPage ? (
        <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span className="font-mono text-[10px] tracking-wider">Pulling more agents…</span>
        </div>
      ) : null}
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
  layout = "live-feed",
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  page = 1,
  totalPages,
  disableNext,
  onPage,
  paginationDisabled,
}: ArenaAgentsCarouselProps) {
  const body =
    layout === "carousel" ? (
      <>
        <Carousel opts={{ align: "start", dragFree: true }} className="relative w-full">
          <CarouselContent className="-ml-2">
            {agents.map((agent) => (
              <CarouselItem key={agent.id} className="basis-auto pl-2 sm:pl-3">
                <ArenaAgentCarouselCard agent={agent} accent={accent} onClick={() => onAgentClick(agent)} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 h-10 w-10 border-white/15 bg-background/90 text-foreground shadow-md hover:bg-background [&_svg]:h-5 [&_svg]:w-5" />
          <CarouselNext className="right-0 h-10 w-10 border-white/15 bg-background/90 text-foreground shadow-md hover:bg-background [&_svg]:h-5 [&_svg]:w-5" />
        </Carousel>
        {onPage ? (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            disableNext={disableNext}
            disabled={paginationDisabled || loading || error}
            onPage={onPage}
          />
        ) : null}
      </>
    ) : (
      <AgentsLiveFeed
        agents={agents}
        accent={accent}
        onAgentClick={onAgentClick}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    );

  const loadingUi = layout === "carousel" ? <CarouselSkeleton accent={accent} /> : <FeedSkeleton accent={accent} />;

  return (
    <div className="glass-panel flex flex-col rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:items-end">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-bold tracking-wider">{title}</h3>
          {subtitle ? (
            <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {headerAction}
      </div>

      {error ? (
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      ) : loading ? (
        loadingUi
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-background/20 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          {emptyAction}
        </div>
      ) : (
        body
      )}
    </div>
  );
}

export function CreateAgentHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-eye relative inline-flex shrink-0 items-center gap-2 px-5 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] shadow-[0_10px_36px_hsl(195_100%_45%/0.22)] transition hover:-translate-y-0.5 active:translate-y-0 sm:px-6 sm:text-xs sm:tracking-[0.18em]"
    >
      <Plus className="relative z-10 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden />
      <span className="relative z-10">CREATE AGENT</span>
    </button>
  );
}
