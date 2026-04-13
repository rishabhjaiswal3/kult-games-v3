import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { gamesApi } from "@/api/gamesApi";
import type { Game } from "@/types/api";
import { Link } from "react-router-dom";
import {
  Wallet,
  Bot,
  ShoppingCart,
  Swords,
  BrainCircuit,
  Zap,
  MessageSquareWarning,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";
import aiArenaHero from "@/assets/ai-arena-hero.jpg";
import flowWalletInit from "@/assets/flow-wallet-init.jpg";
import flowAgentSpawn from "@/assets/flow-agent-spawn.jpg";
import flowAiPurchases from "@/assets/flow-ai-purchases.jpg";
import flowAiBattle from "@/assets/flow-ai-battle.jpg";
import flowTrashTalk from "@/assets/flow-trash-talk.jpg";
import WarzoneAgentTracker from "@/components/WarzoneAgentTracker";

type AIFeature = {
  icon: React.ElementType;
  label: string;
  color: string;
  description: string;
};

const AI_FEATURE_DEFS: Record<string, AIFeature> = {
  "ai-agent": { icon: Bot, label: "AI Agent", color: "hsl(195 100% 60%)", description: "Autonomous decision unit" },
  "ai-training": { icon: Dumbbell, label: "AI Training", color: "hsl(270 82% 68%)", description: "Learns from matches" },
  "ai-arena": { icon: Swords, label: "AI Arena", color: "hsl(0 85% 62%)", description: "Competitive AI duels" },
  "trash-talk": { icon: MessageSquareWarning, label: "Trash Talk", color: "hsl(40 85% 65%)", description: "Context-aware taunts" },
  "ai-purchases": { icon: ShoppingCart, label: "AI Purchases", color: "hsl(195 80% 55%)", description: "Smart in-game buys" },
  "agent-fight": { icon: Swords, label: "Agent Fight", color: "hsl(310 100% 60%)", description: "Agent-vs-agent combat" },
  "ai-recommendation": { icon: Sparkles, label: "AI Recommendation", color: "hsl(278 100% 72%)", description: "Personalized suggestions" },
};

const GAME_AI_FEATURES: Record<string, string[]> = {
  "warzone-warriors": ["ai-training", "ai-arena", "trash-talk", "ai-purchases"],
  "highway-hustle": [ "ai-training", "agent-fight"],
  "guess-the-ai": ["trash-talk", "ai-recommendation"],
  "robo-wars": ["ai-training", "trash-talk"],
  "zero-dash": ["ai-agent",  "ai-purchases"],
  "zero-g-pool": ["ai-agent", "agent-fight"],
};

function resolveGameKey(game: Game): string | null {
  const slug = game.slug ?? game.identification ?? "";
  const name = typeof game.name === "string" ? game.name : game.name?.en ?? "";
  const norm = (s: string) => s.toLowerCase().replace(/[\s_]+/g, "-");
  const slugNorm = norm(slug);
  const nameNorm = norm(name);
  for (const key of Object.keys(GAME_AI_FEATURES)) {
    if (slugNorm.includes(key) || nameNorm.includes(key)) return key;
  }
  return null;
}

function getGameName(name: Game["name"]): string {
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
}

function getGameImage(game: Game): string {
  return (
    game.thumbnail?.horizontal?.url ??
    game.thumbnail?.vertical?.url ??
    game.image_url ??
    game.images?.[0]?.url ??
    ""
  );
}

function getGameDescription(desc: Game["description"]): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  return desc?.en ?? Object.values(desc)[0] ?? "";
}

interface FlowStep {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  visual: string;
  badge?: { icon: React.ElementType; text: string; color: string };
  color: "purple" | "cyan" | "amber";
}

const FLOW_STEPS: FlowStep[] = [
  { icon: Wallet, label: "User Wallet", sublabel: "You create your wallet to enter the Kult arena", visual: "wallet-init", color: "purple" },
  { icon: Bot, label: "AI Agent Spawns", sublabel: "An AI agent is automatically generated for you", visual: "agent-spawn", badge: { icon: Zap, text: "Auto-Generated", color: "hsl(40 85% 65%)" }, color: "cyan" },
  { icon: ShoppingCart, label: "AI Purchases", sublabel: "Your agent auto-buys the best assets, skins and power-ups", visual: "ai-purchases", color: "cyan" },
  { icon: Swords, label: "AI Battle", sublabel: "Agents duel each other — your AI fights with strategy", visual: "ai-arena", color: "purple" },
  { icon: MessageSquareWarning, label: "Trash Talk", sublabel: "Your AI roasts opponents during battles — ruthless and hilarious", visual: "ai-trash-talk", color: "amber" },
];

const FLOW_VISUAL_IMAGES: Record<string, string> = {
  "wallet-init": flowWalletInit,
  "agent-spawn": flowAgentSpawn,
  "ai-purchases": flowAiPurchases,
  "ai-arena": flowAiBattle,
  "ai-trash-talk": flowTrashTalk,
};

const HERO_PROTOCOLS = [
  { icon: BrainCircuit, label: "Neural Core" },
  { icon: Swords, label: "Arena Combat AI" },
  { icon: MessageSquareWarning, label: "Voice + Banter" },
];

const STACK_MODULES = [
  { icon: Bot, label: "Auto Agent", sub: "Self-operating core", tone: "hsl(195 100% 60%)" },
  { icon: BrainCircuit, label: "Strategy Layer", sub: "Adaptive planning mesh", tone: "hsl(278 100% 72%)" },
  { icon: MessageSquareWarning, label: "Arena Voice", sub: "Realtime banter engine", tone: "hsl(40 85% 65%)" },
];

const COLOR_MAP = {
  purple: {
    bg: "hsl(270 82% 52% / 0.16)",
    border: "hsl(278 100% 75% / 0.3)",
    glow: "hsl(270 82% 58% / 0.25)",
    text: "hsl(278 100% 82%)",
    icon: "hsl(278 100% 82%)",
    line: "hsl(270 82% 58%)",
  },
  cyan: {
    bg: "hsl(195 100% 50% / 0.1)",
    border: "hsl(195 100% 60% / 0.3)",
    glow: "hsl(195 100% 50% / 0.25)",
    text: "hsl(195 100% 70%)",
    icon: "hsl(195 100% 65%)",
    line: "hsl(195 100% 55%)",
  },
  amber: {
    bg: "hsl(40 85% 58% / 0.1)",
    border: "hsl(40 85% 58% / 0.3)",
    glow: "hsl(40 85% 58% / 0.25)",
    text: "hsl(40 85% 70%)",
    icon: "hsl(40 85% 65%)",
    line: "hsl(40 85% 58%)",
  },
};

/** Lifecycle carousel: 1 card on narrow, 2 on tablet, 3 on desktop. */
function useLifecycleColumnCount() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const q2 = window.matchMedia("(min-width: 768px)");
    const q3 = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (q3.matches) setN(3);
      else if (q2.matches) setN(2);
      else setN(1);
    };
    sync();
    q2.addEventListener("change", sync);
    q3.addEventListener("change", sync);
    return () => {
      q2.removeEventListener("change", sync);
      q3.removeEventListener("change", sync);
    };
  }, []);
  return n;
}

function AgentCoreVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[320px] rounded-[24px] border border-white/10 bg-background/70 p-6 shadow-[0_20px_60px_hsl(220_60%_2%/0.4)] backdrop-blur-sm sm:p-8 lg:mx-0 lg:ml-auto">
      <div className="relative mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center">
        <div
          className="pointer-events-none absolute inset-[6%] rounded-full border border-neon-cyan/20"
          style={{ boxShadow: "0 0 48px hsl(195 100% 50% / 0.08)" }}
        />
        <motion.div
          className="pointer-events-none absolute inset-[16%] rounded-full border border-dashed border-neon-purple/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
        />
        <div
          className="pointer-events-none absolute inset-[26%] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(195 100% 50% / 0.12) 0%, transparent 68%)",
            boxShadow: "inset 0 0 32px hsl(270 80% 65% / 0.12)",
          }}
        />
        <motion.div
          className="relative z-10 flex h-[44%] w-[44%] max-h-[112px] max-w-[112px] items-center justify-center rounded-2xl border border-neon-cyan/25 bg-gradient-to-br from-card to-background/95 shadow-[inset_0_1px_0_hsl(210_20%_100%/_0.06)]"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Bot className="h-12 w-12 text-neon-cyan sm:h-14 sm:w-14" strokeWidth={1.15} />
        </motion.div>
        <span className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-neon-cyan/15 bg-background/85 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.28em] text-neon-cyan/80">
          Autonomous unit
        </span>
      </div>
    </div>
  );
}

function LifecycleStepCard({
  step,
  stepIndexOneBased,
  stepTotal,
}: {
  step: FlowStep;
  stepIndexOneBased: number;
  stepTotal: number;
}) {
  const c = COLOR_MAP[step.color];
  const visualImage = FLOW_VISUAL_IMAGES[step.visual];
  const ringR = 13;
  const ringCirc = 2 * Math.PI * ringR;
  const ringDash = stepTotal > 0 ? (stepIndexOneBased / stepTotal) * ringCirc : 0;
  return (
    <div
      className="rounded-xl border bg-card overflow-hidden h-full flex flex-col w-full"
      style={{
        borderColor: c.border,
        boxShadow: `0 0 20px ${c.glow}`,
      }}
    >
      <div className="relative aspect-[5/3] border-b border-border/30 bg-black/50 shrink-0">
        {visualImage ? (
          <img
            src={visualImage}
            alt=""
            className="w-full h-full object-cover"
            style={{
              objectPosition: step.visual === "agent-spawn" ? "center 10%" : "center",
            }}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div
          className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center"
          aria-label={`Step ${stepIndexOneBased}`}
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r={ringR} fill="none" stroke="hsl(220 25% 22%)" strokeWidth="2.25" />
            <circle
              cx="16"
              cy="16"
              r={ringR}
              fill="none"
              stroke={c.line}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeDasharray={`${ringDash} ${ringCirc}`}
            />
          </svg>
          <span
            className="relative font-mono text-[10px] font-bold tabular-nums leading-none"
            style={{ color: c.text }}
          >
            {stepIndexOneBased}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 flex justify-end">
          <div
            className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 bg-background/90 backdrop-blur-sm"
            style={{ borderColor: c.border }}
          >
            <step.icon style={{ width: 18, height: 18, color: c.icon }} />
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-3.5 text-left flex-1 flex flex-col">
        <p className="font-display text-sm font-black uppercase tracking-wide leading-tight" style={{ color: c.text }}>
          {step.label}
        </p>
        <p className="text-xs text-muted-foreground leading-snug mt-1.5 flex-1">{step.sublabel}</p>
        {step.badge ? (
          <span
            className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono uppercase tracking-wide"
            style={{ color: step.badge.color }}
          >
            <step.badge.icon className="w-3 h-3" />
            {step.badge.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}

const AIArena = () => {
  const { data } = useQuery({
    queryKey: ["games", "all"],
    queryFn: () => gamesApi.getAll(1, 20),
    staleTime: 5 * 60_000,
  });

  const gamesWithFeatures = useMemo(() => {
    if (!data?.games) return [];
    return data.games
      .map((g) => ({ game: g, key: resolveGameKey(g) }))
      .filter((g): g is { game: Game; key: string } => g.key !== null);
  }, [data]);

  const [carouselIdx, setCarouselIdx] = useState(0);
  const activeGame = gamesWithFeatures[carouselIdx] ?? null;

  const prevGame = useCallback(() => {
    setCarouselIdx((i) => (i === 0 ? gamesWithFeatures.length - 1 : i - 1));
  }, [gamesWithFeatures.length]);

  const nextGame = useCallback(() => {
    setCarouselIdx((i) => (i === gamesWithFeatures.length - 1 ? 0 : i + 1));
  }, [gamesWithFeatures.length]);

  useEffect(() => {
    if (gamesWithFeatures.length <= 1) return;
    const timer = window.setInterval(nextGame, 5000);
    return () => window.clearInterval(timer);
  }, [gamesWithFeatures.length, nextGame]);

  const lifecycleCols = useLifecycleColumnCount();
  const [lifecycleIdx, setLifecycleIdx] = useState(0);
  const maxLifecycleStart = Math.max(0, FLOW_STEPS.length - lifecycleCols);

  useEffect(() => {
    setLifecycleIdx((i) => Math.min(i, maxLifecycleStart));
  }, [maxLifecycleStart]);

  const prevLifecycle = useCallback(() => {
    setLifecycleIdx((i) => (i === 0 ? maxLifecycleStart : i - 1));
  }, [maxLifecycleStart]);

  const nextLifecycle = useCallback(() => {
    setLifecycleIdx((i) => (i >= maxLifecycleStart ? 0 : i + 1));
  }, [maxLifecycleStart]);

  useEffect(() => {
    if (maxLifecycleStart <= 0) return;
    const timer = window.setInterval(nextLifecycle, 6500);
    return () => window.clearInterval(timer);
  }, [nextLifecycle, maxLifecycleStart]);

  const lifecycleGridClass =
    lifecycleCols === 1
      ? "grid grid-cols-1 gap-3 sm:gap-4"
      : lifecycleCols === 2
        ? "grid grid-cols-2 gap-3 sm:gap-4"
        : "grid grid-cols-3 gap-3 sm:gap-4";

  const lifecycleBlurb =
    lifecycleCols === 1
      ? "One step at a time on small screens — use arrows or dots to move through the flow."
      : lifecycleCols === 2
        ? "Two steps visible on tablet — arrows or dots slide the window."
        : "Three steps at once on desktop — arrows or dots slide the window.";

  return (
    <div className="min-h-screen bg-background relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(270 82% 58% / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(270 82% 58% / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <section className="relative min-h-[50vh] sm:min-h-[54vh] md:min-h-[58vh] pt-28 sm:pt-32 md:pt-36 pb-10 md:pb-12 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aiArenaHero}
            alt="AI Arena battlefield"
            className="w-full h-full object-cover"
            width={1920}
            height={960}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center 40%, transparent 30%, hsl(var(--background)) 75%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] ai-border-glow">
            <div
              className="relative overflow-hidden rounded-[28px] border-0 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
              style={{
                background: "hsl(220 45% 10% / 0.96)",
                boxShadow:
                  "0 0 25px hsl(195 100% 50% / 0.1), 0 0 50px hsl(270 80% 65% / 0.04), inset 0 1px 0 hsl(210 20% 93% / 0.06)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 neural-grid opacity-[0.12]"
                aria-hidden
              />
              <div className="pointer-events-none absolute -right-20 top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-neon-purple/8 blur-[100px]" aria-hidden />
              <div className="pointer-events-none absolute -left-16 top-0 h-[200px] w-[200px] rounded-full bg-neon-cyan/6 blur-[80px]" aria-hidden />
              <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-14 lg:text-left">
              <div className="w-full flex-1 text-center lg:text-left">
                <div className="mb-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/8 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/95">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-35" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_10px_hsl(195_100%_60%)]" />
                    </span>
                    AI Arena
                  </span>
                  <span className="rounded-full border border-white/10 bg-background/60 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    Live ops
                  </span>
                </div>

                <h1 className="font-display font-black tracking-[-0.03em]">
                  <span className="block text-[clamp(2.25rem,7vw,3.75rem)] leading-[0.95] text-foreground/95">
                    YOUR AI
                  </span>
                  <span className="mt-0.5 block text-[clamp(2.75rem,10vw,5rem)] font-black leading-[0.9] gradient-text">
                    AGENT
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
                  Spawn an autonomous operator with its own hot wallet — battle, trade, and banter while you stay in control.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link
                    to="/games"
                    className="group relative z-10 inline-flex items-center gap-2 rounded-lg px-7 py-3.5 font-display text-sm font-semibold tracking-wide btn-eye"
                  >
                    <span className="relative z-10">Start building</span>
                    <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#warzone-agent-tracker"
                    className="relative z-10 inline-flex items-center gap-2 rounded-lg px-7 py-3.5 font-display text-sm font-semibold tracking-wide btn-eye-outline"
                  >
                    <span className="relative z-10">Track agent</span>
                  </a>
                </div>

                <div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2 sm:mx-0 sm:max-w-none sm:justify-start">
                  {HERO_PROTOCOLS.map((item) => (
                    <div
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/[0.06] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.14em] text-foreground/85 transition-colors hover:border-neon-cyan/45"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0 text-neon-cyan" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full shrink-0 lg:w-auto lg:max-w-[340px]">
                <AgentCoreVisual />
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      <WarzoneAgentTracker />

      <section className="relative py-8 md:py-12 border-b border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="rounded-[28px] border border-white/[0.06] bg-gradient-to-b from-card/[0.35] via-card/[0.12] to-transparent p-5 shadow-[0_24px_80px_hsl(220_60%_2%/0.25)] backdrop-blur-sm sm:p-7 md:p-9">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-mono text-neon-cyan/90 tracking-[0.28em] uppercase">
                <span className="h-px w-6 bg-gradient-to-r from-neon-cyan to-transparent" />
                Agent lifecycle
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground mt-1">
                How Your <span className="bg-gradient-to-r from-[hsl(195_100%_65%)] to-[hsl(278_100%_75%)] bg-clip-text text-transparent">AI Agent</span> Works
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground max-w-md sm:text-right leading-snug">
              Wallet → agent → purchases → battles → banter. {lifecycleBlurb}
            </p>
          </div>

          <div className="relative mx-auto max-w-6xl">
            {maxLifecycleStart > 0 ? (
              <>
                <button
                  type="button"
                  onClick={prevLifecycle}
                  className="absolute left-0 top-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 -translate-x-1 sm:-translate-x-12 items-center justify-center rounded-full border border-white/12 bg-card/90 text-muted-foreground shadow-[0_8px_24px_hsl(220_60%_2%/0.4)] backdrop-blur-md transition-all hover:border-neon-cyan/45 hover:text-neon-cyan hover:shadow-[0_0_24px_hsl(195_100%_50%/_0.2)]"
                  aria-label="Previous steps"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextLifecycle}
                  className="absolute right-0 top-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 translate-x-1 sm:translate-x-12 items-center justify-center rounded-full border border-white/12 bg-card/90 text-muted-foreground shadow-[0_8px_24px_hsl(220_60%_2%/0.4)] backdrop-blur-md transition-all hover:border-neon-cyan/45 hover:text-neon-cyan hover:shadow-[0_0_24px_hsl(195_100%_50%/_0.2)]"
                  aria-label="Next steps"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            ) : null}

            <div className="overflow-hidden px-1 sm:px-2">
              <div key={`${lifecycleIdx}-${lifecycleCols}`} className={lifecycleGridClass}>
                {FLOW_STEPS.slice(lifecycleIdx, lifecycleIdx + lifecycleCols).map((step, off) => (
                  <LifecycleStepCard
                    key={`${lifecycleIdx}-${off}`}
                    step={step}
                    stepIndexOneBased={lifecycleIdx + off + 1}
                    stepTotal={FLOW_STEPS.length}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              {Array.from({ length: maxLifecycleStart + 1 }, (_, page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setLifecycleIdx(page)}
                  className="relative h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: page === lifecycleIdx ? "1.75rem" : "0.625rem",
                    background: page === lifecycleIdx ? "hsl(195 100% 55%)" : "hsl(220 25% 30%)",
                    boxShadow: page === lifecycleIdx ? "0 0 16px hsl(195 100% 55% / 0.5)" : "none",
                  }}
                  aria-label={`View steps ${page + 1}–${Math.min(page + lifecycleCols, FLOW_STEPS.length)}`}
                  aria-current={page === lifecycleIdx ? "step" : undefined}
                />
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIArena;
