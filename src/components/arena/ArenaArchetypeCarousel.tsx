import { Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ARENA_AGENT_ARCHETYPE_CARDS,
  type ArenaAgentArchetypeCard,
} from "@/constants/arenaAgentArchetypes";
import { useArenaPage } from "@/contexts/ArenaPageContext";
import { cn } from "@/lib/utils";

type ArenaArchetypeCarouselProps = {
  className?: string;
};

export function ArenaArchetypeCarousel({ className }: ArenaArchetypeCarouselProps) {
  const { openCreateAgent } = useArenaPage();

  return (
    <section
      className={cn(
        "glass-panel relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl p-4 sm:p-5",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 0% 50%, hsl(278 88% 62% / 0.12), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 80%, hsl(198 92% 68% / 0.08), transparent 50%)",
        }}
      />

      <div className="relative mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-neon-cyan" aria-hidden />
            <span className="font-display text-[10px] tracking-[0.28em] text-neon-cyan">ARCHETYPE ROSTER</span>
          </div>
          <h3 className="font-display text-base font-bold tracking-wide text-foreground sm:text-lg">
            Pick your <span className="text-gradient-hero">fighting spirit</span>
          </h3>
        </div>
        <p className="hidden max-w-[220px] text-right text-[11px] leading-relaxed text-muted-foreground sm:block">
          Swipe through six combat personalities — click to deploy.
        </p>
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        className="relative flex min-h-0 flex-1 flex-col"
      >
        <CarouselContent className="-ml-3 flex-1 pb-1">
          {ARENA_AGENT_ARCHETYPE_CARDS.map((card) => (
            <CarouselItem key={card.archetype} className="basis-[78%] pl-3 sm:basis-[48%] lg:basis-[38%] xl:basis-[32%]">
              <ArchetypeCarouselCard
                card={card}
                onSelect={() => openCreateAgent({ archetype: card.archetype })}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 border-white/15 bg-background/80 text-foreground hover:bg-background" />
        <CarouselNext className="right-1 border-white/15 bg-background/80 text-foreground hover:bg-background" />
      </Carousel>
    </section>
  );
}

function ArchetypeCarouselCard({
  card,
  onSelect,
}: {
  card: ArenaAgentArchetypeCard;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative h-full min-h-[220px] w-full overflow-hidden rounded-xl border border-white/[0.12] text-left shadow-[inset_0_1px_0_hsl(0_0%_100%/0.08)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_hsl(270_80%_20%/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/40 sm:min-h-[240px]",
        card.border
      )}
    >
      <img
        src={card.image}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[center_15%]"
        loading="lazy"
        decoding="async"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(268_32%_6%/0.9)] via-[hsl(268_32%_8%/0.4)] to-transparent to-50%" />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t opacity-75",
          card.glow
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[hsl(268_32%_8%/0.14)]" />

      <div className="relative flex h-full min-h-[220px] flex-col justify-end p-3 sm:min-h-[240px] sm:p-3.5">
        <div className="rounded-lg border border-white/[0.12] bg-[hsl(268_32%_6%/0.42)] px-3 py-2.5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("font-display text-[10px] font-bold tracking-[0.2em]", card.accent)}>
              {card.archetype}
            </span>
            <span className="text-[10px] text-foreground/75">{card.codename}</span>
          </div>
          <p className="mt-1.5 text-xs font-semibold leading-snug text-foreground">{card.tagline}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{card.role}</p>
          <span className="mt-2.5 inline-flex font-display text-[9px] tracking-[0.18em] text-neon-cyan opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            DEPLOY {card.codename} →
          </span>
        </div>
      </div>
    </button>
  );
}
