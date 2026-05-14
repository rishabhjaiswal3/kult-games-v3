import AutoPlayVideo from "@/components/AutoPlayVideo";
import { agentsPoster } from "@/constants/arenaAgentArchetypes";
import { cn } from "@/lib/utils";

type ArenaAgentsPosterBannerProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  onCta?: () => void;
  ctaLabel?: string;
};

/** Legacy banner — uses first roster card art instead of removed poster asset. */
export function ArenaAgentsPosterBanner({
  className,
  title = "Six agents. One arena.",
  subtitle = "Deploy a neural combat personality and climb the boards.",
  onCta,
  ctaLabel = "CREATE AGENT",
}: ArenaAgentsPosterBannerProps) {
  const heroImage = ARENA_AGENT_ARCHETYPE_CARDS[0]?.image;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(268_32%_8%/0.9)]",
        className
      )}
    >
      <AutoPlayVideo
        src="/videos/SC_10.mp4"
        loop
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_minmax(200px,320px)] md:items-center md:p-8">
        <div>
          <h2 className="font-display text-2xl font-black text-foreground md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">{subtitle}</p>
          {onCta ? (
            <button type="button" onClick={onCta} className="btn-eye mt-4 px-5 py-2.5 font-display text-xs font-bold tracking-wider">
              {ctaLabel}
            </button>
          ) : null}
        </div>
        <img src={agentsPoster} alt="AI Arena agent roster" className="w-full object-contain" loading="lazy" />
      </div>
    </section>
  );
}
