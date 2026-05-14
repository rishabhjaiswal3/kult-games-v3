import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAgent } from "@/contexts/CreateAgentContext";
import { cn } from "@/lib/utils";

export function HomeArenaPromoBanner() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openCreateAgent } = useCreateAgent();

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 md:py-16">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(268_32%_8%/0.9)] shadow-[0_24px_80px_hsl(270_80%_20%/0.18)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 20%, hsl(278 88% 62% / 0.14), transparent 50%), radial-gradient(ellipse 55% 45% at 85% 75%, hsl(198 92% 68% / 0.1), transparent 45%)",
          }}
        />

        <div className="relative p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-neon-cyan" aria-hidden />
                <span className="font-display text-[10px] tracking-[0.32em] text-neon-cyan sm:text-xs">
                  AI ARENA
                </span>
              </div>
              <h2 className="font-display text-[clamp(1.5rem,3.8vw,2.35rem)] font-black leading-tight text-foreground">
                Your AI agent{" "}
                <span className="text-gradient-hero">remembers every fight</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Train a rival that learns your style, talks trash in the arena, and chases the next win while you watch the chaos unfold.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/ai-arena")}
                className="btn-eye inline-flex items-center gap-2 px-5 py-3 font-display text-xs font-bold tracking-wider sm:px-7 sm:text-sm"
              >
                EXPLORE AI ARENA
                <ArrowRight className="h-4 w-4" />
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={openCreateAgent}
                  className="btn-eye-outline inline-flex items-center gap-2 px-5 py-3 font-display text-xs font-bold tracking-wider sm:px-7 sm:text-sm"
                >
                  <Plus className="h-4 w-4" />
                  CREATE AI AGENT
                </button>
              ) : null}
            </div>
          </div>

          <Carousel
            opts={{ align: "start", loop: true, dragFree: true }}
            className="relative mt-6 md:mt-8"
          >
            <CarouselContent className="-ml-3">
              {ARENA_AGENT_ARCHETYPE_CARDS.map((card) => (
                <CarouselItem
                  key={card.archetype}
                  className="basis-[70%] pl-3 sm:basis-1/2 md:basis-1/4"
                >
                  <AgentPortraitCard card={card} onSelect={() => navigate("/ai-arena")} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-white/15 bg-background/85 text-foreground hover:bg-background" />
            <CarouselNext className="right-0 border-white/15 bg-background/85 text-foreground hover:bg-background" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

function AgentPortraitCard({
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
        "group relative h-[200px] w-full overflow-hidden rounded-xl border border-white/[0.12] bg-[hsl(268_32%_6%/0.9)] text-left transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_hsl(270_80%_20%/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/40 sm:h-[220px] md:h-[236px]",
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(268_32%_6%/0.92)] via-[hsl(268_32%_8%/0.45)] to-transparent pt-14" />

      <div className="relative flex h-full flex-col justify-end p-2.5 sm:p-3">
        <div className="rounded-lg border border-white/[0.1] bg-[hsl(268_32%_6%/0.55)] px-2.5 py-2 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("font-display text-[9px] font-bold tracking-[0.16em] sm:text-[10px]", card.accent)}>
              {card.archetype}
            </span>
            <span className="text-[9px] text-foreground/75 sm:text-[10px]">{card.codename}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
            {card.tagline}
          </p>
        </div>
      </div>
    </button>
  );
}
