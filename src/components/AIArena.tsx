import { motion, AnimatePresence } from "framer-motion";
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

  const [lifecycleIdx, setLifecycleIdx] = useState(0);
  const prevLifecycle = useCallback(() => {
    setLifecycleIdx((i) => (i === 0 ? FLOW_STEPS.length - 1 : i - 1));
  }, []);
  const nextLifecycle = useCallback(() => {
    setLifecycleIdx((i) => (i === FLOW_STEPS.length - 1 ? 0 : i + 1));
  }, []);

  useEffect(() => {
    if (FLOW_STEPS.length <= 1) return;
    const timer = window.setInterval(nextLifecycle, 6500);
    return () => window.clearInterval(timer);
  }, [nextLifecycle]);

  const lifecycleStep = FLOW_STEPS[lifecycleIdx];

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

      <section className="relative min-h-[48vh] sm:min-h-[52vh] md:min-h-[56vh] pt-20 sm:pt-24 md:pt-28 pb-8 md:pb-10 flex items-center justify-center overflow-hidden">
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

        <motion.div
          className="absolute left-0 right-0 h-[1px] pointer-events-none z-20"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(195 100% 80% / 0.25), transparent)",
            boxShadow: "0 0 30px hsl(195 100% 80% / 0.15)",
          }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-neon-cyan/30 bg-background/50 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-neon-cyan"
                animate={{
                  opacity: [1, 0.3, 1],
                  boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 18px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-mono text-neon-cyan tracking-[0.25em] mt-2 uppercase">
                AI Arena
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-3 sm:mb-4 leading-[0.95]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
            >
              <span className="text-foreground block" style={{ textShadow: "0 0 40px hsl(195 100% 60% / 0.15)" }}>
                YOUR AI
              </span>
              <span
                className="block mt-1"
                style={{
                  background: "linear-gradient(90deg, hsl(195 100% 65%), hsl(278 100% 75%), hsl(195 100% 65%))",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px hsl(195 100% 60% / 0.4))",
                }}
              >
                AGENT
              </span>
            </motion.h1>

            <motion.p
              className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 px-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Spawn an autonomous AI agent with its own hot wallet. Let it fight, trade, and trash-talk on your behalf.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/games"
                className="group inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan text-xs sm:text-sm font-bold hover:bg-neon-cyan/20 hover:border-neon-cyan/70 transition-all backdrop-blur-sm"
                style={{ boxShadow: "0 0 30px hsl(195 100% 60% / 0.15)" }}
              >
                Start Building Agent
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#ai-game-map"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-border/60 bg-card/30 text-muted-foreground text-xs sm:text-sm font-bold hover:text-foreground hover:border-neon-purple/50 transition-all backdrop-blur-sm"
              >
                Explore AI Games
              </a>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {HERO_PROTOCOLS.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm text-[10px] sm:text-xs text-muted-foreground"
                  whileHover={{ borderColor: "hsl(278 100% 75% / 0.4)", y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  <item.icon className="w-4 h-4 text-neon-purple" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      <WarzoneAgentTracker />

      <section className="relative py-5 md:py-7 border-b border-border/20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div
            className="mb-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="text-[10px] font-mono text-neon-purple tracking-[0.25em] uppercase">Agent lifecycle</span>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-black tracking-tight text-foreground mt-0.5">
                How Your <span style={{ color: "hsl(195 100% 65%)" }}>AI Agent</span> Works
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground max-w-md sm:text-right leading-snug">
              Wallet → agent → purchases → battles → banter. Use arrows or dots to step through.
            </p>
          </motion.div>

          <div className="relative max-w-xl mx-auto">
            <button
              type="button"
              onClick={prevLifecycle}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-12 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/50 bg-card/70 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextLifecycle}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-12 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/50 bg-card/70 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
              aria-label="Next step"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="overflow-hidden px-1 sm:px-2">
              <AnimatePresence mode="wait" initial={false}>
                {lifecycleStep && (() => {
                  const c = COLOR_MAP[lifecycleStep.color];
                  const visualImage = FLOW_VISUAL_IMAGES[lifecycleStep.visual];
                  return (
                    <motion.div
                      key={lifecycleIdx}
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="rounded-2xl border bg-card/40 backdrop-blur-md overflow-hidden"
                      style={{
                        borderColor: c.border,
                        boxShadow: `0 0 32px ${c.glow}`,
                      }}
                    >
                      <div className="relative aspect-[16/9] border-b border-border/30 bg-black/50">
                        {visualImage ? (
                          <img
                            src={visualImage}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: lifecycleStep.visual === "agent-spawn" ? "center 10%" : "center",
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-card" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                          <p className="text-[10px] font-mono text-white/80 tracking-widest">
                            {lifecycleIdx + 1} / {FLOW_STEPS.length}
                          </p>
                          <div
                            className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 bg-background/50 backdrop-blur-sm"
                            style={{ borderColor: c.border }}
                          >
                            <lifecycleStep.icon style={{ width: 22, height: 22, color: c.icon }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 text-left">
                        <p className="font-display text-lg sm:text-xl font-black uppercase tracking-wide" style={{ color: c.text }}>
                          {lifecycleStep.label}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">{lifecycleStep.sublabel}</p>
                        {lifecycleStep.badge && (
                          <span
                            className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-mono uppercase tracking-wide"
                            style={{ color: lifecycleStep.badge.color }}
                          >
                            <lifecycleStep.badge.icon className="w-3.5 h-3.5" />
                            {lifecycleStep.badge.text}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              {FLOW_STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLifecycleIdx(i)}
                  className="relative w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: i === lifecycleIdx ? "hsl(195 100% 60%)" : "hsl(220 30% 28%)",
                    boxShadow: i === lifecycleIdx ? "0 0 10px hsl(195 100% 60% / 0.55)" : "none",
                    transform: i === lifecycleIdx ? "scale(1.25)" : "scale(1)",
                  }}
                  aria-label={`Go to step ${i + 1}`}
                  aria-current={i === lifecycleIdx ? "step" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ai-game-map" className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/25 to-transparent" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: "hsl(278 100% 82%)" }}
                animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(278 100% 82%)", "0 0 14px hsl(278 100% 82%)", "0 0 4px hsl(278 100% 82%)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: "hsl(278 100% 82%)" }}>
                AI-Powered Games
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-black tracking-tight text-foreground">
              Every Game, <span className="gradient-text glow-text">AI Enhanced</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
              Discover which AI features power each game in the Kult ecosystem
            </p>
          </motion.div>

          {gamesWithFeatures.length > 0 && activeGame && (
            <div className="max-w-5xl mx-auto">
              <div className="relative">
                <button
                  onClick={prevGame}
                  className="absolute -left-4 md:-left-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
                  aria-label="Previous game"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextGame}
                  className="absolute -right-4 md:-right-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
                  aria-label="Next game"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <motion.div
                  key={activeGame.key}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 28 }}
                  className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden"
                  style={{ boxShadow: "0 0 60px hsl(270 82% 58% / 0.1)" }}
                >
                  <div className="relative aspect-[16/7] overflow-hidden">
                    <img
                      src={getGameImage(activeGame.game)}
                      alt={getGameName(activeGame.game.name)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <div className="flex items-center gap-2 mb-1">
                        {activeGame.game.rating != null && activeGame.game.rating > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                            <span className="text-foreground font-semibold">{activeGame.game.rating}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neon-cyan/80 tracking-wider uppercase">
                          {activeGame.game.category}
                        </span>
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-wide">
                        {getGameName(activeGame.game.name)}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 md:p-7">
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">AI Features</p>
                      <span className="text-[10px] md:text-xs text-neon-cyan font-mono tracking-wider uppercase">Agent Profile Ready</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5 mb-5">
                      {GAME_AI_FEATURES[activeGame.key]?.map((fKey, fi) => {
                        const feat = AI_FEATURE_DEFS[fKey];
                        if (!feat) return null;
                        return (
                          <motion.div
                            key={fKey}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: fi * 0.06 }}
                            className="group relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full border backdrop-blur-sm cursor-default transition-all duration-200 hover:-translate-y-0.5"
                            style={{
                              borderColor: `${feat.color}40`,
                              background: `linear-gradient(135deg, ${feat.color}12, ${feat.color}06)`,
                              boxShadow: `0 0 0 1px ${feat.color}08`,
                            }}
                            whileHover={{
                              borderColor: feat.color,
                              boxShadow: `0 0 20px ${feat.color}25, 0 0 0 1px ${feat.color}30`,
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `${feat.color}20`, boxShadow: `0 0 10px ${feat.color}15` }}
                            >
                              <feat.icon style={{ width: 14, height: 14, color: feat.color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold tracking-wide leading-none" style={{ color: feat.color }}>{feat.label}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{feat.description}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {getGameDescription(activeGame.game.description) && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                        {getGameDescription(activeGame.game.description)}
                      </p>
                    )}

                    <div className="pt-4 border-t border-border/40">
                      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2.5">AI-ready stack</p>
                      <div className="flex flex-wrap gap-2">
                        {STACK_MODULES.map((stack) => (
                          <div
                            key={stack.label}
                            className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-card/45 hover:-translate-y-0.5 transition-transform"
                            style={{ borderColor: `${stack.tone}35` }}
                          >
                            <stack.icon className="w-3.5 h-3.5" style={{ color: stack.tone }} />
                            <span className="text-[10px] font-semibold" style={{ color: stack.tone }}>{stack.label}</span>
                            <span className="text-[9px] text-muted-foreground hidden sm:inline">· {stack.sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="flex items-center justify-center gap-2 mt-5">
                  {gamesWithFeatures.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIdx(i)}
                      className="relative w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background: i === carouselIdx ? "hsl(195 100% 60%)" : "hsl(220 30% 25%)",
                        boxShadow: i === carouselIdx ? "0 0 8px hsl(195 100% 60% / 0.6)" : "none",
                        transform: i === carouselIdx ? "scale(1.4)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!data && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-border/40 bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading AI-powered games...</p>
            </div>
          )}

          {data && gamesWithFeatures.length === 0 && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-border/40 bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No mapped AI games yet. Add matching slugs/identification to show AI features here.
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default AIArena;
