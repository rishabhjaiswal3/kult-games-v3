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
        "glass-panel relative flex w-full flex-col overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6",
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

      <div className="relative flex flex-col gap-3">
        <div className="mb-3">
          <div className="mb-1.5 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-neon-cyan" aria-hidden  />
            <span className="font-display text-[10px] tracking-[0.28em] text-neon-cyan">ARCHETYPE ROSTER</span>
          </div>
          <h3 className="font-display text-base font-bold tracking-wide text-foreground sm:text-lg">
            Pick your <span className="text-gradient-hero">fighting spirit</span>
          </h3>
        </div>
        {/* <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mb-7 sm:text-base lg:mx-0">
          <span className="block">Your AI agent learns, remembers, and grows alongside your gameplay.</span>
          <span className="mt-1.5 block">Smarter decisions. Faster actions. Still powered by you.</span>
        </p> */}
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        className="relative flex min-h-0 flex-1 flex-col"
      >
        <CarouselContent className="-ml-3 flex-1 pb-1">
          {ARENA_AGENT_ARCHETYPE_CARDS.map((card) => (
            <CarouselItem key={card.archetype} className="basis-[88%] pl-3 sm:basis-[52%] md:basis-[38%] lg:basis-[28%] xl:basis-[22%]">
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
        "group relative h-full min-h-[280px] w-full overflow-hidden rounded-xl border border-white/[0.12] bg-[hsl(268_32%_6%/0.9)] text-left transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_hsl(270_80%_20%/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/40 sm:min-h-[320px] md:min-h-[360px]",
        card.border
      )}
    >
      <img
        src={card.image}
        alt={`${card.codename} — ${card.archetype}`}
        className="absolute inset-0 h-full w-full object-contain p-2 sm:p-3"
        loading="lazy"
        decoding="async"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(268_32%_6%/0.95)] via-[hsl(268_32%_8%/0.55)] to-transparent pt-16" />

      <div className="relative flex h-full min-h-[280px] flex-col justify-end p-3 sm:min-h-[320px] sm:p-4 md:min-h-[360px]">
        <div className="rounded-lg border border-white/[0.12] bg-[hsl(268_32%_6%/0.55)] px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("font-display text-[10px] font-bold tracking-[0.2em]", card.accent)}>
              {card.archetype}
            </span>
            <span className="text-[10px] text-foreground/75">{card.codename}</span>
          </div>
          <span className="mt-2 inline-flex font-display text-[9px] tracking-[0.18em] text-neon-cyan opacity-80 transition-opacity group-hover:opacity-100">
            DEPLOY {card.codename.toUpperCase()} →
          </span>
        </div>
      </div>

    </button>
  );
}
