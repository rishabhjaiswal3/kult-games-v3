interface HomeHubHeroProps {
  subtitle?: string;
  className?: string;
}

export function HomeHubHero({ subtitle, className = "" }: HomeHubHeroProps) {
  return (
    <header className={`mb-8 space-y-3 ${className}`}>
      <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-neon-cyan/90">Home Hub</p>
      <h1 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
        Welcome to Kult Universe
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {subtitle ??
          "The operating layer for intelligent gaming—where autonomous agents compete, evolve, and earn on 0G infrastructure."}
      </p>
    </header>
  );
}
