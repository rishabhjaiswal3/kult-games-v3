import { Zap } from "lucide-react";

const stats = [
  { value: "2.9K+", label: "Moments Today" },
  { value: "14.2k", label: "Creators Online" },
  { value: "1.2M+", label: "Likes Today" },
  { value: "88K+", label: "Comments Today" },
];

const liveTicker = ["Nyxis eliminated Inferno", "Alpha clan captured Point B", "New legendary drop in AI Arena"];

export function MomentsHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.07] bg-[hsl(268_35%_5%/0.6)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
          linear-gradient(hsl(278 88% 62% / 0.4) 1px, transparent 1px),
          linear-gradient(90deg, hsl(278 88% 62% / 0.4) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 grid gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr,min(38%,420px)] lg:gap-10 lg:px-8 lg:py-8 xl:gap-14">
        <div className="flex flex-col justify-center">
          <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-purple shadow-[0_0_10px_hsl(278_88%_62%/0.9)]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-neon-purple/95">
              Kult Moments
            </span>
          </div>
          <h1 className="font-display text-3xl font-black leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-[3.15rem]">
            YOUR PLAY.{" "}
            <span className="text-gradient-hero">THE WORLD</span>
            <br />
            WATCHES.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Short-form highlights powered by neon energy — clip your apex plays, duel reactions, and feed the algorithm
            exactly what deserves the spotlight.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.08] bg-black/35 px-3 py-2.5 backdrop-blur-sm">
                <p className="font-display text-xl font-black tabular-nums text-foreground sm:text-2xl">{s.value}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#moments-feed"
              className="rounded-xl px-8 py-3 font-display text-xs font-bold tracking-wider text-primary-foreground btn-eye shadow-[0_0_28px_hsl(278_88%_62%/0.35)]"
            >
              EXPLORE MOMENTS
            </a>
            <button
              type="button"
              className="rounded-xl px-7 py-3 font-display text-xs font-bold tracking-wider btn-eye-outline"
            >
              How it works
            </button>
          </div>
        </div>

        <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-neon-purple/25 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)] sm:min-h-[260px] lg:min-h-0 lg:aspect-[16/13]">
          <img
            src="/moments-hero-mock.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-red-500/55 bg-black/65 px-2.5 py-1 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="font-display text-[10px] font-bold tracking-[0.2em] text-red-300">LIVE</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/72 p-3 backdrop-blur-xl">
            <div className="flex items-start gap-2">
              <Zap aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-purple" />
              <p className="font-mono text-[10px] leading-relaxed text-neon-cyan/95">{liveTicker.join(" · ")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
