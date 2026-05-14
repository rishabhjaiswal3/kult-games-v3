import { Package, ShoppingBag, Sparkles, Tags } from "lucide-react";

type MarketplaceHeroProps = {
  gameLabel: string;
  listingsCount: number;
  categoriesCount: number;
  isLoading?: boolean;
};

export function MarketplaceHero({
  gameLabel,
  listingsCount,
  categoriesCount,
  isLoading,
}: MarketplaceHeroProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 lg:p-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div className="pointer-events-none absolute inset-0 neural-grid opacity-[0.1]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neon-cyan" aria-hidden />
            <span className="font-display text-[10px] tracking-[0.32em] text-neon-cyan sm:text-xs">
              NEURAL MARKET
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/15 px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-neon-green">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-neon-green" />
              LIVE
            </span>
          </div>
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-black leading-[0.95] text-foreground">
            TRADE. <span className="text-gradient-hero">EQUIP.</span> DOMINATE.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            On-chain assets for your games — skins, boosts, and battle gear. Filter by game and category, then purchase with your wallet in one flow.
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3 lg:w-auto lg:min-w-[320px]">
          <HeroStat
            icon={ShoppingBag}
            label="Listings"
            value={isLoading ? "…" : listingsCount.toLocaleString()}
            accent="text-neon-cyan"
          />
          <HeroStat
            icon={Tags}
            label="Categories"
            value={isLoading ? "…" : String(categoriesCount)}
            accent="text-neon-purple"
          />
          <HeroStat icon={Package} label="Game" value={gameLabel || "—"} accent="text-neon-green" small />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  accent,
  small,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <div className="arena-stat-card rounded-xl border border-white/[0.08] bg-background/30 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${accent}`} aria-hidden />
        <span className="font-display text-[9px] tracking-[0.14em] text-muted-foreground">{label}</span>
      </div>
      <p
        className={`font-display font-black tabular-nums text-foreground ${small ? "truncate text-sm" : "text-xl"}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
