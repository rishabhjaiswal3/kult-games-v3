import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Swords } from "lucide-react";
import {
  ARENA_AGENT_ARCHETYPE_CARDS,
  type ArenaAgentArchetypeCard,
} from "@/constants/arenaAgentArchetypes";
import { useArenaPage } from "@/contexts/ArenaPageContext";
import { cn } from "@/lib/utils";

export function ArenaAgentShowcase() {
  const { openCreateAgent } = useArenaPage();
  const [hovered, setHovered] = useState<ArenaAgentArchetypeCard["archetype"] | null>(null);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-background/20 shadow-[0_24px_80px_hsl(270_80%_20%/0.18)]">
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, hsl(278 88% 62% / 0.14), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 80%, hsl(198 92% 68% / 0.08), transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:p-7 md:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan" aria-hidden />
              <span className="font-display text-[10px] tracking-[0.32em] text-neon-cyan sm:text-xs">
                ARCHETYPE ROSTER
              </span>
            </div>
            <h2 className="font-display text-2xl font-black leading-tight text-foreground sm:text-3xl md:text-4xl">
              Pick your <span className="text-gradient-hero">fighting spirit</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Six neural combat styles — each with a distinct look, play pattern, and arena voice. Deploy the one that matches how you want to win.
            </p>
                    </div>
          <button
            type="button"
            onClick={() => openCreateAgent()}
            className="btn-eye inline-flex shrink-0 items-center gap-2 self-start px-5 py-3 font-display text-xs font-bold tracking-wider sm:text-sm lg:self-end"
          >
            <Swords className="h-4 w-4" />
            CREATE YOUR AGENT
          </button>
        </div>

        <div className="relative border-t border-white/[0.06] bg-background/30 p-4 sm:p-6 md:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-display text-[10px] tracking-[0.28em] text-muted-foreground">SELECT AN ARCHETYPE</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hover to preview — click to start creation with that class locked in.
              </p>
            </motion.div>
            {hovered ? (
              <motion.span
                key={hovered}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-display text-[10px] tracking-[0.2em] text-neon-purple"
              >
                {hovered}
              </motion.span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {ARENA_AGENT_ARCHETYPE_CARDS.map((card, index) => (
              <ArchetypeCard
                key={card.archetype}
                card={card}
                index={index}
                isHovered={hovered === card.archetype}
                onHover={() => setHovered(card.archetype)}
                onLeave={() => setHovered(null)}
                onSelect={() => openCreateAgent({ archetype: card.archetype })}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ArchetypeCard({
  card,
  index,
  isHovered,
  onHover,
  onLeave,
  onSelect,
}: {
  card: ArenaAgentArchetypeCard;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={onSelect}
      className={cn(
        "group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-background/40 text-left transition-[border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/40",
        card.border,
        isHovered && "shadow-[0_20px_50px_hsl(270_80%_20%/0.35)]"
      )}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          card.glow
        )}
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
      />

      <motion.div
        className="relative mx-auto mt-4 h-[min(52vw,220px)] w-[min(70%,200px)] sm:h-[200px] sm:w-[180px]"
        animate={isHovered ? { scale: 1.04 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <img
          src={card.image}
          alt={`${card.codename} — ${card.archetype} agent`}
          className="h-full w-full object-contain object-bottom drop-shadow-[0_12px_28px_hsl(270_80%_10%/0.65)]"
          loading="lazy"
          decoding="async"
        />
      </motion.div>

      <div className="relative mt-auto flex flex-1 flex-col p-4 pt-2">
                <div className="mb-1 flex items-center justify-between gap-2">
          <span className={cn("font-display text-[10px] font-bold tracking-[0.22em]", card.accent)}>
            {card.archetype}
          </span>
          <span className="text-[10px] text-muted-foreground/80">{card.codename}</span>
                </div>
        <p className="text-sm font-semibold leading-snug text-foreground">{card.tagline}</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{card.role}</p>

        <motion.span
          className="mt-4 inline-flex items-center gap-1.5 font-display text-[10px] tracking-[0.18em] text-neon-cyan opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        >
          DEPLOY {card.codename}
          <span aria-hidden>→</span>
        </motion.span>
      </div>
    </motion.button>
  );
}
